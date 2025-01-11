from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import logging
import json
import asyncio
from queue import Queue, Empty
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Callable
import time

from app.db.models import QuestionRequest, ProcessingStatus
from app.db.manager import db_manager
from app.services.request_manager import request_manager
from rag.rag import RAG, RagAnswer
from app.core.config import get_settings

settings = get_settings()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize thread pool
thread_pool = ThreadPoolExecutor(max_workers=settings.MAX_CONCURRENT_REQUESTS)

# Initialize router
router = APIRouter()

# RAG instance management
rag_instances = {}

def get_or_create_rag(request_id: str, status_callback: Optional[Callable] = None) -> RAG:
    """Get an existing RAG instance or create a new one."""
    if request_id not in rag_instances:
        rag_instances[request_id] = RAG(status_callback=status_callback)
    elif status_callback:  # Update existing instance with new callback
        rag_instances[request_id].status_callback = status_callback
    return rag_instances[request_id]

def cleanup_rag(request_id: str):
    """Clean up RAG instance after request completion."""
    if request_id in rag_instances:
        del rag_instances[request_id]

async def process_question(request: Request, question: str, user_id: str, stream: bool = True):
    """Process a question and return the response."""
    request_id = f"{user_id}_{datetime.now().timestamp()}"
    status_queue = Queue()
    query_id = None
    request_start_time = time.time()
    logger.info(f"\n{'='*50}\nSTEP: Request accepted\nRequest ID: {request_id}\n{'='*50}")
    
    try:
        can_process = request_manager.add_request(request_id)
        
        if not can_process and not stream:
            raise HTTPException(
                status_code=503,
                detail="Server is at capacity. Please try again later."
            )

        def process_rag():
            """Process RAG request in thread pool."""
            try:
                # Set the status callback to put updates in the queue
                def status_callback(status):
                    status_queue.put(("status", status))
                    
                rag_instance = get_or_create_rag(request_id, status_callback=status_callback)
                return rag_instance.process_query(question)
            except Exception as e:
                logger.error(f"Error in RAG processing: {str(e)}", exc_info=True)
                status_queue.put(("error", str(e)))
                raise

        async def process_request():
            """Process the request and handle status updates."""
            nonlocal query_id
            try:
                status_queue.put(("status", ProcessingStatus.VALIDATING))
                
                result = await asyncio.get_event_loop().run_in_executor(
                    thread_pool,
                    process_rag
                )
                
                if result:
                    is_valid = not any(phrase in result.answer.lower() for phrase in [
                        "not a scientific question",
                        "not a valid scientific question",
                        "invalid question",
                        "i apologize",
                        "i'm sorry",
                        "cannot answer",
                        "unable to answer"
                    ])
                    
                    status_queue.put(("result", result))
                    
                    if is_valid and result.documents and len(result.documents) > 0:
                        status_queue.put(("status", ProcessingStatus.COMPLETED))
                        logger.info(f"\n{'='*50}\nFINAL MESSAGE: \nRequest completed successfully\nTOTAL TIME TAKEN: {time.time() - request_start_time:.2f}s\n{'='*50}")
                    else:
                        status_queue.put(("status", ProcessingStatus.INVALID_QUESTION))
                        logger.info(f"\n{'='*50}\nFINAL MESSAGE: \nRequest completed (invalid question)\nTOTAL TIME TAKEN: {time.time() - request_start_time:.2f}s\n{'='*50}")
                    
                    return result

            except Exception as e:
                logger.error(f"Error processing request: {str(e)}", exc_info=True)
                status_queue.put(("status", ProcessingStatus.FAILED))
                status_queue.put(("error", str(e)))
                logger.error(f"\n{'='*50}\nERROR: \nRequest failed\nReason: {str(e)}\nTOTAL TIME TAKEN: {time.time() - request_start_time:.2f}s\n{'='*50}")
                raise
            finally:
                next_request = request_manager.remove_request(request_id)
                if next_request:
                    logger.info(f"Processing next request in queue: {next_request}")
                cleanup_rag(request_id)

        if not stream:
            return await process_request()

        async def event_generator():
            """Generate SSE events for streaming response."""
            processing_task = None
            is_complete = False
            query_id = None
            
            try:
                queue_position = request_manager.get_queue_position(request_id)
                if queue_position > 0:
                    yield {
                        "event": "status",
                        "data": json.dumps({
                            "status": f"{ProcessingStatus.QUEUED} (Position: {queue_position})",
                            "position": queue_position
                        })
                    }
                    while not request_manager.can_process_request():
                        if await request.is_disconnected():
                            logger.info(f"Client disconnected while in queue: {request_id}")
                            return
                        await asyncio.sleep(1)
                        new_position = request_manager.get_queue_position(request_id)
                        if new_position != queue_position:
                            queue_position = new_position
                            yield {
                                "event": "status",
                                "data": json.dumps({
                                    "status": f"{ProcessingStatus.QUEUED} (Position: {queue_position})",
                                    "position": queue_position
                                })
                            }

                processing_task = asyncio.create_task(process_request())

                while not is_complete:
                    if await request.is_disconnected():
                        logger.info(f"Client disconnected during processing: {request_id}")
                        return

                    try:
                        status = status_queue.get_nowait()
                    except Empty:
                        if processing_task.done():
                            exc = processing_task.exception()
                            if exc:
                                raise exc
                            break
                        await asyncio.sleep(0.1)
                        continue

                    event_type, data = status
                    
                    if event_type == "status":
                        yield {
                            "event": "status",
                            "data": json.dumps({"status": data})
                        }
                    
                    elif event_type == "result":
                        result = data
                        is_valid = not any(phrase in result.answer.lower() for phrase in [
                            "not a scientific question",
                            "not a valid scientific question",
                            "invalid question",
                            "i apologize",
                            "i'm sorry",
                            "cannot answer",
                            "unable to answer"
                        ])
                        
                        yield {
                            "event": "answer",
                            "data": json.dumps({"content": result.answer})
                        }

                        if is_valid and result.documents and len(result.documents) > 0:
                            query_id = await db_manager.save_query_to_db(
                                user_id=user_id,
                                question=question
                            )
                            
                            for doc in result.documents:
                                if await request.is_disconnected():
                                    logger.info(f"Client disconnected while sending documents: {request_id}")
                                    return
                                yield {
                                    "event": "document",
                                    "data": json.dumps({
                                        "title": doc.title,
                                        "content": doc.content,
                                        "url": doc.url,
                                        "similarity": doc.similarity,
                                        "provider": doc.provider,
                                        "date": doc.date,
                                        "journal_ref": doc.journal_ref,
                                        "journal_title": doc.journal_title
                                    })
                                }
                            
                            result_dict = result.dict()
                            result_dict["processing_time"] = result.processing_time
                            
                            await db_manager.update_query_status(
                                query_id=query_id,
                                status="completed",
                                answer=result_dict
                            )

                        yield {
                            "event": "complete",
                            "data": json.dumps({
                                "from_websearch": result.from_websearch if is_valid else False,
                                "processing_time": result.processing_time,
                                "query_id": query_id if is_valid else None
                            })
                        }
                        is_complete = True
                        break
                    
                    elif event_type == "error":
                        yield {
                            "event": "error",
                            "data": json.dumps({
                                "error": data,
                                "message": "An error occurred in processing",
                                "query_id": query_id
                            })
                        }
                        is_complete = True
                        break

            except Exception as e:
                logger.error(f"Error in event generation: {str(e)}", exc_info=True)
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "error": str(e),
                        "message": "An error occurred while processing your request",
                        "query_id": query_id
                    })
                }
            finally:
                if processing_task and not processing_task.done():
                    processing_task.cancel()
                cleanup_rag(request_id)
                request_manager.remove_request(request_id)

        # Create the EventSourceResponse with a custom ping message that only sends while not complete
        async def ping_generator():
            while True:
                if await request.is_disconnected():
                    break
                yield ""
                await asyncio.sleep(15)  # Send ping every 15 seconds

        return EventSourceResponse(event_generator())
    
    except Exception as e:
        logger.error(f"Error in process_question: {str(e)}", exc_info=True)
        cleanup_rag(request_id)
        request_manager.remove_request(request_id)
        
        if query_id:
            await db_manager.update_query_status(
                query_id=query_id,
                status="failed",
                error_message=str(e)
            )
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing your request: {str(e)}"
        )

@router.get("/ask")
async def ask_question_get(
    request: Request,
    question: str,
    user_id: str
):
    """Handle GET requests for questions."""
    try:
        return await process_question(request, question=question, user_id=user_id, stream=True)
    except Exception as e:
        logger.error(f"Error in GET /ask: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask")
async def ask_question_post(request: Request, body: QuestionRequest):
    """Handle POST requests for questions."""
    try:
        return await process_question(
            request,
            question=body.question,
            user_id=body.user_id,
            stream=body.stream
        )
    except Exception as e:
        logger.error(f"Error in POST /ask: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_user_history(user_id: str):
    """Get the query history for a specific user."""
    try:
        queries = await db_manager.get_user_queries(user_id)
        return {"queries": queries}
    except Exception as e:
        logger.error(f"Error retrieving history for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve history: {str(e)}"
        ) 