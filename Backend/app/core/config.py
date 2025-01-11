from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    """Application settings using Pydantic for validation."""
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # API Configuration
    API_TITLE: str = "Science Research API"
    API_DESCRIPTION: str = "API for scientific research questions using RAG"
    API_VERSION: str = "1.0.0"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Request Processing Configuration
    MAX_CONCURRENT_REQUESTS: int = 10
    
    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "allow"  # Allow extra fields from environment variables
    }

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 