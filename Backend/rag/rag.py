import os
import time
import logging
from typing import List, Optional, Dict, Any, Callable
from pydantic import BaseModel, Field

# Imports from your code
from .rag_llm import ModelManager, ModelResponse
from .rag_embeddings import EmbeddingsManager
from .rag_retriever import retrieve_documents
from .rag_search_manager import SearchManager
from .rag_reranker import ReRankManager
from .rag_prompts import (
    SCIENTIFIC_QUERY_VALIDATOR_SYSTEM,
    QUERY_REWRITER_PROMPT,
    RAG_PROMPT,
    HALLUCINATION_GRADER_PROMPT,
    ANSWER_GRADER_PROMPT
)

from .models import ProcessingStatus

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Minimum similarity score to consider a document relevant
MINIMUM_RELEVANCE_THRESHOLD = 0.4  

class RagDocument(BaseModel):
    """Represents a single document returned by the RAG system."""
    id: Optional[str] = None
    title: Optional[str]
    url: Optional[str]  # For web results, for DB results this will be the source
    content: Optional[str]
    similarity: Optional[float] = None  # Relevance score
    provider: str = Field(
        default="database",
        description="Source of the document (database/Tavily/Serp/Serper)"
    )
    date: Optional[str] = Field(
        None,
        description="When the document was created (DB) or retrieved (search)"
    )
    journal_ref: Optional[str] = None
    journal_title: Optional[str] = None
    authors: Optional[List[List[str]]] = None

class RagAnswer(BaseModel):
    """Represents the final answer to the user, plus metadata."""
    answer: str = Field(..., description="The final answer text.")
    documents: List[RagDocument] = Field(
        default_factory=list, 
        description="Documents used as context or references."
    )
    from_websearch: bool = Field(
        False, 
        description="Indicates if the answer came from a web search fallback."
    )
    processing_time: float = Field(
        default=0.0,
        description="Total processing time in seconds"
    )

# --- RAG Manager ---

class RAG:
    """
    Orchestrates the RAG flow:
    1. Check if query is scientific
    2. Rewrite query
    3. Retrieve from DB
    4. If no good matches, fallback to web search
    5. Rerank
    6. LLM answer
    7. Hallucination and correctness grader
    8. Return final answer + docs
    """

    def __init__(
        self,
        llm_manager: Optional[ModelManager] = None,
        embedder: Optional[EmbeddingsManager] = None,
        search_manager: Optional[SearchManager] = None,
        reranker: Optional[ReRankManager] = None,
        status_callback: Optional[Callable[[str], None]] = None
    ):
        """
        If the user doesn't provide these, we'll create them internally.
        :param status_callback: Optional callback function to receive status updates
        """
        self.llm_manager = llm_manager or ModelManager()
        self.embedder = embedder or EmbeddingsManager()
        self.search_manager = search_manager or SearchManager()
        self.reranker = reranker or ReRankManager()
        self.logger = logger
        self.similarity_threshold = 0.2
        self.db_docs_limit = 5
        self.status_callback = status_callback
        self.logger.info("RAG system initialized with components: LLM, Embedder, Search, Reranker")

    def _emit_status(self, status: ProcessingStatus):
        """Emit status update with logging"""
        if self.status_callback:
            self.status_callback(status.value)
        self.logger.info(f"\n{'='*50}\nSTEP: {status}\n{'='*50}")

    def process_query(self, question: str, status_callback = None) -> RagAnswer:
        """Process a question and return an answer with supporting documents."""
        process_start_time = time.time()
        self.logger.info(f"\n{'='*50}\nSTEP: Starting RAG process\nQuestion: {question}\n{'='*50}")
        
        try:
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.VALIDATING)
            
            # Validate question
            is_scientific = self._is_scientific_query(question)
            self.logger.info(f"\n{'='*50}\nSTEP: Question validation completed\nResult: {'Scientific' if is_scientific else 'Not scientific'}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            if not is_scientific:
                end_time = time.time()
                self._emit_status(ProcessingStatus.INVALID_QUESTION)
                self.logger.warning(f"\n{'='*50}\nSTEP: Non-scientific question rejected\nTime taken: {end_time - process_start_time:.2f}s\n{'='*50}")
                return RagAnswer(
                    answer="I apologize, but your question doesn't appear to be a scientific query. I'm specifically designed to answer questions about scientific topics, research findings, and academic subjects. Could you please rephrase your question to focus on a scientific topic?",
                    documents=[],
                    from_websearch=False,
                    processing_time=end_time - process_start_time
                )
            
            # Database search
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.SEARCHING_DB)
            db_docs = self._retrieve_local_docs(question)
            self.logger.info(f"\n{'='*50}\nSTEP: Database search completed\nDocuments found: {len(db_docs)}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            if not db_docs or self._all_docs_below_threshold(db_docs, self.similarity_threshold):
                self.logger.info(f"\n{'='*50}\nSTEP: Insufficient database results, switching to web search\n{'='*50}")
                self._emit_status(ProcessingStatus.SEARCHING_WEB)
                return self._websearch_path(question)
            
            # Reranking
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.ANALYZING_PAPERS)
            reranked_docs = self._rerank_docs(question, db_docs)
            self.logger.info(f"\n{'='*50}\nSTEP: Document reranking completed\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            # Answer generation
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.PREPARING_ANSWER)
            answer = self._generate_answer(question, reranked_docs)
            self.logger.info(f"\n{'='*50}\nSTEP: Answer generation completed\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            # Answer verification
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.CHECKING_ANSWER)
            
            hallucination_check = self._grade_hallucination(answer, reranked_docs)
            self.logger.info(f"\n{'='*50}\nSTEP: Hallucination check completed\nResult: {'Passed' if hallucination_check else 'Failed'}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            if not hallucination_check:
                self.logger.warning(f"\n{'='*50}\nSTEP: Answer failed hallucination check, falling back to web search\n{'='*50}")
                self._emit_status(ProcessingStatus.SEARCHING_WEB)
                return self._websearch_path(question)

            relevance_check = self._grade_answer_relevance(question, answer)
            self.logger.info(f"\n{'='*50}\nSTEP: Relevance check completed\nResult: {'Passed' if relevance_check else 'Failed'}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            if not relevance_check:
                self.logger.warning(f"\n{'='*50}\nSTEP: Answer failed relevance check, falling back to web search\n{'='*50}")
                self._emit_status(ProcessingStatus.SEARCHING_WEB)
                return self._websearch_path(question)
            
            self._emit_status(ProcessingStatus.COMPLETED)
            
            # Return final answer
            end_time = time.time()
            total_time = end_time - process_start_time
            self.logger.info(f"\n{'='*50}\nSTEP: RAG process completed successfully\nTime taken: {total_time:.2f}s\n{'='*50}")
            
            return RagAnswer(
                answer=answer,
                documents=self._to_rag_docs(reranked_docs),
                from_websearch=False,
                processing_time=total_time
            )
            
        except Exception as e:
            total_time = time.time() - process_start_time
            self.logger.error(f"\n{'='*50}\nERROR: RAG processing failed\nReason: {str(e)}\nTime taken: {total_time:.2f}s\n{'='*50}", exc_info=True)
            raise

    # ---------------- Internal steps -----------------

    def _is_scientific_query(self, query: str) -> bool:
        """
        Uses the LLM with SCIENTIFIC_QUERY_VALIDATOR_SYSTEM to determine if query is 'VALID' or 'INVALID'.
        Returns True if 'VALID', else False.
        """
        system_prompt = SCIENTIFIC_QUERY_VALIDATOR_SYSTEM
        resp: ModelResponse = self.llm_manager.prompt(
            prompt_text=query,
            system_prompt=system_prompt,
            temperature=0.2
        )
        # The validator returns "VALID" or "INVALID" at the start of content
        return resp.content.strip().startswith("VALID")

    def _rewrite_query(self, query: str) -> str:
        """
        Rewrites the user's query for better embedding-based retrieval (e.g. synonyms, more precise).
        Using the QUERY_REWRITER_PROMPT from rag_prompts.
        """
        # Assuming QUERY_REWRITER_PROMPT is a string template or has a format method
        prompt_text = QUERY_REWRITER_PROMPT.format(question=query)
        
        resp = self.llm_manager.prompt(
            prompt_text=prompt_text, 
            temperature=0.3
        )
        return resp.content.strip()

    def _retrieve_local_docs(self, rewritten_query: str) -> List[Dict[str, Any]]:
        """
        Retrieve from DB using Supabase RPC function. Returns a list of doc dictionaries
        with fields: content, similarity, etc.
        """
        # Get docs from retrieve_documents
        docs = retrieve_documents(
            user_query=rewritten_query,
            limit=self.db_docs_limit,
            min_similarity=self.similarity_threshold
        )
        
        # Filter out low-relevance documents
        relevant_docs = [
            doc for doc in docs 
            if doc.get("similarity", 0) >= MINIMUM_RELEVANCE_THRESHOLD
        ]
        
        # Print retrieved documents details
        self.logger.info(f"Retrieved {len(relevant_docs)} documents from DB:")
        for doc in relevant_docs:
            self.logger.info(f"Title: {doc.get('title', 'N/A')} (Score: {doc.get('similarity', 0):.3f})")
        
        return relevant_docs

    def _all_docs_below_threshold(self, docs: List[Dict[str, Any]], threshold: float) -> bool:
        """Check if all docs are below the similarity threshold."""
        if not docs:
            return True
        for d in docs:
            if "similarity" in d and d["similarity"] >= threshold:
                return False
        return True

    def _rerank_docs(self, query: str, docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rerank using Cohere. 
        The doc structure must have doc["content"] for ReRankManager to handle it.
        """
        reranked = self.reranker.rerank_documents(query, docs, top_n=len(docs))
        return reranked

    def _generate_answer(self, user_query: str, docs: List[Dict[str, Any]]) -> str:
        """
        Uses the LLM to generate an answer from the given docs. 
        """
        # Build a context string from docs with proper citations
        context_str = ""
        for i, doc in enumerate(docs):
            snippet = doc.get("content", "")
            title = doc.get("title", "Untitled")
            url = doc.get("url", "")
            metadata = doc.get("metadata", {})
            
            # Format authors if available
            authors = metadata.get("authors", [])
            author_str = ", ".join([" ".join(author).strip() for author in authors]) if authors else "No authors listed"
            
            # Get journal information
            journal_info = []
            if metadata.get("journal_title"):
                journal_info.append(metadata["journal_title"])
            if metadata.get("journal_ref"):
                journal_info.append(metadata["journal_ref"])
            journal_str = " - ".join(journal_info) if journal_info else ""
            
            # Add date if available
            date = metadata.get("date", "")
            
            context_str += (
                f"[Doc {i+1}]: {snippet}\n"
                f"Title: {title}\n"
                f"Authors: {author_str}\n"
                f"Journal: {journal_str}\n"
                f"Date: {date}\n"
                f"URL: {url}\n\n"
            )

        # Modify RAG_PROMPT to request proper citations
        modified_prompt = RAG_PROMPT.format(
            context=context_str,
            question=user_query
        )  

        # Now call the LLM
        resp = self.llm_manager.prompt(prompt_text=modified_prompt, temperature=0.5)
        return resp.content.strip()

    def _grade_hallucination(self, generation: str, docs: List[Dict[str, Any]]) -> bool:
        """
        Uses the HALLUCINATION_GRADER_PROMPT to see if the LLM's generation is grounded.
        """
        doc_str = ""
        for i, d in enumerate(docs):
            doc_str += f"[Doc {i+1}]: {d['content']}\n\n"

        grader_prompt = HALLUCINATION_GRADER_PROMPT.format(
            documents=doc_str,
            generation=generation
        )

        resp = self.llm_manager.prompt(grader_prompt, temperature=0.0)
        answer = resp.content.strip().lower()
        return answer.startswith("yes")

    def _grade_answer_relevance(self, question: str, generation: str) -> bool:
        """
        Uses the ANSWER_GRADER_PROMPT to see if the LLM's generation actually answers the question.
        """
        grader_prompt = ANSWER_GRADER_PROMPT.format(
            question=question,
            generation=generation
        )
        resp = self.llm_manager.prompt(grader_prompt, temperature=0.0)
        answer = resp.content.strip().lower()
        return answer.startswith("yes")

    def _websearch_path(self, query: str) -> RagAnswer:
        """
        Fallback path using web search when database results are insufficient.
        Returns a RagAnswer with documents from web search.
        """
        websearch_start_time = time.time()
        self.logger.info(f"\n{'='*50}\nSTEP: Starting web search fallback path\n{'='*50}")
        
        try:
            # 1) Web search
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.SEARCHING_WEB)
            search_docs = self.search_manager.search(query, results=5)
            self.logger.info(f"\n{'='*50}\nSTEP: Web search completed\nDocuments found: {len(search_docs)}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            # Convert to dict for reranker
            docs_dicts = []
            for d in search_docs:
                docs_dicts.append({
                    "content": d.page_content,
                    "title": d.metadata.get("title", ""),
                    "url": d.metadata.get("url", ""),
                    "provider": d.metadata.get("search_provider", ""),
                    "date": d.metadata.get("search_date", "")  
                })

            if not docs_dicts:
                self.logger.warning(f"\n{'='*50}\nSTEP: Web search returned no results\n{'='*50}")
                self._emit_status(ProcessingStatus.FAILED)
                return self._get_fallback_response(time.time() - websearch_start_time)

            # 2) Rerank
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.RERANKING_RESULTS)
            reranked = self.reranker.rerank_documents(query, docs_dicts, top_n=len(docs_dicts))
            self.logger.info(f"\n{'='*50}\nSTEP: Web result reranking completed\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")

            # 3) Generate answer
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.PREPARING_ANSWER)
            final_answer = self._generate_answer(query, reranked)
            self.logger.info(f"\n{'='*50}\nSTEP: Answer generation from web results completed\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")

            # 4) Grade for hallucination & correctness
            step_start_time = time.time()
            self._emit_status(ProcessingStatus.CHECKING_ANSWER)
            
            hallucination_check = self._grade_hallucination(final_answer, reranked)
            self.logger.info(f"\n{'='*50}\nSTEP: Web answer hallucination check completed\nResult: {'Passed' if hallucination_check else 'Failed'}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            relevance_check = self._grade_answer_relevance(query, final_answer)
            self.logger.info(f"\n{'='*50}\nSTEP: Web answer relevance check completed\nResult: {'Passed' if relevance_check else 'Failed'}\nTime taken: {time.time() - step_start_time:.2f}s\n{'='*50}")
            
            if not hallucination_check or not relevance_check:
                self.logger.warning(f"\n{'='*50}\nSTEP: Web search answer failed quality checks\n{'='*50}")
                self._emit_status(ProcessingStatus.FAILED)
                return self._get_fallback_response(time.time() - websearch_start_time)

            # Return successful result
            total_time = time.time() - websearch_start_time
            self._emit_status(ProcessingStatus.COMPLETED)
            
            return RagAnswer(
                answer=final_answer,
                documents=self._to_rag_docs(reranked),
                from_websearch=True,
                processing_time=total_time
            )
            
        except Exception as e:
            end_time = time.time()
            self.logger.error(f"\n{'='*50}\nERROR: Web search path failed\nReason: {str(e)}\nTime taken: {end_time - websearch_start_time:.2f}s\n{'='*50}")
            return self._get_fallback_response(processing_time=end_time - websearch_start_time)

    def _get_fallback_response(self, processing_time: float = 0.0) -> RagAnswer:
        """Returns a standard fallback response when we can't provide a reliable answer."""
        return RagAnswer(
            answer="I apologize, but I don't have enough reliable information to answer this question accurately.",
            documents=[],
            from_websearch=True,
            processing_time=processing_time
        )

    # -------------- Helper --------------

    def _to_rag_docs(self, docs: List[Dict[str, Any]]) -> List[RagDocument]:
        """Convert doc dictionaries into a list of RagDocument for the final response."""
        rag_docs = []
        for d in docs:
            # Always try to get URL directly first
            url = d.get("url")
            
            # For database results
            if not d.get("provider"):
                # Prefer metadata date over created_at
                date = d.get("metadata", {}).get("date") or d.get("created_at")
                provider = "database"
            else:  # Search result
                date = d.get("date")
                provider = d.get("provider")
            
            # Convert id to string if it exists
            doc_id = str(d.get("id")) if d.get("id") is not None else None
            
            # Get metadata fields
            metadata = d.get("metadata", {})
            
            rag_docs.append(RagDocument(
                id=doc_id,
                title=d.get("title"),
                url=url,
                content=d.get("content"),
                similarity=d.get("similarity"),
                provider=provider,
                date=date,
                journal_ref=metadata.get("journal_ref"),
                journal_title=metadata.get("journal_title"),
                authors=metadata.get("authors")
            ))
        return rag_docs

# ------------------ Example usage ------------------

if __name__ == "__main__":
    rag = RAG()
    
    # Test cases
    queries = [
        "How old are you?",  # Invalid query
        "How can numerical methods model material response under shock and ramp compression, including phase transitions and composite deformation paths?",      # Valid database query
        "Does sports support cognitive function?"  # Valid web query
    ]
    
    for query in queries:
        print(f"Testing query: {query}")
        print("\n" + "="*100)
        result = rag.process_query(query)

        print("="*100)

        print("\nAnswer:\n", result.answer)
        print("\nCame from websearch?", result.from_websearch)
        if result.documents:
            print("\nRetrieved Documents:\n")
            for idx, doc in enumerate(result.documents):
                doc_data = doc.model_dump()
                print(f"{idx+1}. ID: {doc_data.get('id', 'N/A')}")
                print(f"   Title: {doc.title or 'N/A'}")
                print(f"   Relevance Score: {doc_data.get('similarity', 'N/A')}")
                print(f"   URL: {doc.url or 'N/A'}")
                print(f"   Provider: {doc.provider}")
                print(f"   Date: {doc.date or 'N/A'}")
                print(f"   Content: {doc.content[:120]!r}...\n")
        else:
            print("No supporting documents provided.")
        print(f"Processing time: {result.processing_time:.2f} seconds")
        print("="*100)
