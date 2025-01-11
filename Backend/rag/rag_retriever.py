# rag_retriever.py
from typing import List
import openai
from langchain_core.documents import Document as LC_Document
import os
# setup supabase
from supabase import create_client, Client
from dotenv import load_dotenv

from .rag_embeddings import EmbeddingsManager

load_dotenv()

# Constants
DEFAULT_DOCS_LIMIT = 5
DEFAULT_MIN_SIMILARITY = 0.1

# Setup Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)  


def retrieve_documents(
    user_query: str,
    limit: int = DEFAULT_DOCS_LIMIT,
    min_similarity: float = DEFAULT_MIN_SIMILARITY
) -> List[dict]:
    """Retrieve documents from Supabase using vector similarity."""
    embeddings = EmbeddingsManager()
    query_embedding = embeddings.get_embeddings(user_query)
    
    response = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_threshold": min_similarity,
            "match_count": limit
        }
    ).execute()

    return response.data or [] 


if __name__ == "__main__":
    docs = retrieve_documents("How can numerical methods model material response under shock and ramp compression, including phase transitions and composite deformation paths?", limit=10)
    print(docs)
    # save to json file - without the embedding field but keep the key of embedding and the list empty
    import json
    with open("docs.json", "w") as f:
        # remove the embedding values in each doc
        docs_without_embedding = [
            {k: v for k, v in doc.items() if k != "embedding"}
            for doc in docs
        ]
        json.dump(docs_without_embedding, f, default=lambda x: x.__dict__)
