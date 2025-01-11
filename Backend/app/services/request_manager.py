from datetime import datetime
from typing import Dict, List, Optional
from threading import Lock
from app.core.config import get_settings

settings = get_settings()

class RequestManager:
    """Manages concurrent request processing and queuing."""
    
    def __init__(self):
        self.active_requests: Dict[str, datetime] = {}
        self.pending_requests: List[str] = []
        self.active_lock = Lock()
        self.pending_lock = Lock()

    def can_process_request(self) -> bool:
        """Check if we can process a new request."""
        with self.active_lock:
            return len(self.active_requests) < settings.MAX_CONCURRENT_REQUESTS

    def add_request(self, request_id: str) -> bool:
        """Add a request. Returns True if it can be processed immediately."""
        with self.active_lock:
            if len(self.active_requests) < settings.MAX_CONCURRENT_REQUESTS:
                self.active_requests[request_id] = datetime.now()
                return True
            with self.pending_lock:
                self.pending_requests.append(request_id)
            return False

    def remove_request(self, request_id: str) -> Optional[str]:
        """Remove a request and process next in queue if any."""
        with self.active_lock:
            self.active_requests.pop(request_id, None)
            # Try to process next pending request
            with self.pending_lock:
                if self.pending_requests and len(self.active_requests) < settings.MAX_CONCURRENT_REQUESTS:
                    next_request = self.pending_requests.pop(0)
                    self.active_requests[next_request] = datetime.now()
                    return next_request
        return None

    def get_queue_position(self, request_id: str) -> int:
        """Get position in queue for a request."""
        with self.pending_lock:
            try:
                return self.pending_requests.index(request_id) + 1
            except ValueError:
                return 0

# Global instance
request_manager = RequestManager() 