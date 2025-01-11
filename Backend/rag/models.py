from enum import Enum

class ProcessingStatus(str, Enum):
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