from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RagDocument(BaseModel):
    """Model for RAG document data."""
    title: str
    content: str
    url: Optional[str] = None
    similarity: Optional[float] = None
    provider: Optional[str] = None
    date: Optional[str] = None
    journal_ref: Optional[str] = None
    journal_title: Optional[str] = None

class QuestionRequest(BaseModel):
    """Request model for the /ask endpoint."""
    question: str = Field(..., min_length=3, max_length=1000, 
                         description="The scientific question to be answered")
    stream: bool = Field(default=True, 
                        description="Whether to stream the response")
    user_id: str = Field(..., 
                        description="The ID of the user making the request")

    class Config:
        json_schema_extra = {
            "example": {
                "question": "What is the role of mitochondria in cell energy production?",
                "stream": True,
                "user_id": "user123"
            }
        }

class QueryHistory(BaseModel):
    """Model for query history response."""
    id: str
    user_id: str
    question: str
    answer: Optional[str]
    status: str
    created_at: str
    documents: Optional[List[RagDocument]] = []
    from_websearch: Optional[bool] = False
    processing_time: Optional[float] = None

class ProcessingStatus:
    """Constants for processing status messages."""
    QUEUED = "Request queued - waiting for available processing slot"
    VALIDATING = "Validating your scientific question..."
    INVALID_QUESTION = "Question validation failed - not a scientific question"
    SEARCHING_DB = "Searching scientific database for relevant papers..."
    SEARCHING_WEB = "Searching the web for scientific answers..."
    SEARCHING_JOURNALS = "Searching scientific journals for peer-reviewed research..."
    RETRIEVING_PAPERS = "Retrieving relevant scientific papers..."
    ANALYZING_PAPERS = "Analyzing scientific papers for relevance..."
    RERANKING_RESULTS = "Re-ranking results based on scientific relevance..."
    PREPARING_ANSWER = "Preparing comprehensive scientific answer..."
    CHECKING_ANSWER = "Verifying answer accuracy and scientific validity..."
    CHECKING_HALLUCINATION = "Checking for potential hallucinations in the answer..."
    LOADING_DOCS = "Loading supporting scientific documents..."
    COMPLETED = "Request completed successfully"
    FAILED = "Request failed - an error occurred" 