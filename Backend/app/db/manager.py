import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from supabase import create_client, Client
import json
from app.core.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize Supabase client
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    logger.info("Successfully initialized Supabase client")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    raise

class DatabaseManager:
    """Handles all database operations."""
    
    @staticmethod
    async def save_query_to_db(user_id: str, question: str) -> str:
        """Save a new query to the database and return its ID."""
        try:
            data = {
                "user_id": user_id,
                "question": question,
                "status": "pending"
            }
            response = supabase.table('queries').insert(data).execute()
            query_id = response.data[0]['id']
            logger.info(f"Saved query to database with ID: {query_id}")
            return query_id
        except Exception as e:
            logger.error(f"Error saving query to database: {str(e)}")
            raise

    @staticmethod
    async def update_query_status(
        query_id: str, 
        status: str, 
        answer: Optional[Dict] = None, 
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update the status and optionally the answer of a query in the database."""
        try:
            data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if answer:
                data["answer"] = json.dumps(answer)
            
            if error_message:
                data["error_message"] = error_message

            response = supabase.table('queries').update(data).eq('id', query_id).execute()
            logger.info(f"Updated query {query_id} status to {status}")
            return response.data
        except Exception as e:
            logger.error(f"Error updating query status: {str(e)}")
            raise

    @staticmethod
    async def get_user_queries(user_id: str) -> List[Dict[str, Any]]:
        """Retrieve all queries for a given user, ordered by creation date (newest first)."""
        try:
            response = supabase.table('queries') \
                .select('*') \
                .eq('user_id', user_id) \
                .order('created_at', desc=True) \
                .execute()
            
            queries = []
            for query in response.data:
                # Parse the answer JSON if it exists
                if query.get('answer'):
                    try:
                        answer_data = json.loads(query['answer'])
                        query['answer'] = answer_data.get('answer', '')
                        query['documents'] = answer_data.get('documents', [])
                        query['from_websearch'] = answer_data.get('from_websearch', False)
                        query['processing_time'] = answer_data.get('processing_time', 0.0)
                    except json.JSONDecodeError:
                        query['answer'] = None
                        query['documents'] = []
                        query['from_websearch'] = False
                        query['processing_time'] = 0.0
                
                queries.append(query)
            
            return queries
        except Exception as e:
            logger.error(f"Error retrieving queries for user {user_id}: {str(e)}")
            raise

# Global instance
db_manager = DatabaseManager() 