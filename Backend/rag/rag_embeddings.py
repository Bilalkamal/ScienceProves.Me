# rag_embeddings.py
import os
from typing import List, Optional, Any
import openai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  

class EmbeddingsManager:
    """
    A manager for generating embeddings via OpenAI. It creates the client once
    and lets you retrieve embeddings or the full response as needed.
    """

    def __init__(
        self, 
        openai_api_key: Optional[str] = None, 
        default_model: str = "text-embedding-3-small"
    ):
        """
        :param openai_api_key: API key for OpenAI. If not provided, will look for OPENAI_API_KEY in env.
        :param default_model: Default model to use for embeddings.
        """
        if not openai_api_key:
            openai_api_key = os.getenv("OPENAI_API_KEY")

        if not openai_api_key:
            raise ValueError(
                "No OpenAI API key found. Please set OPENAI_API_KEY in your environment "
                "or pass openai_api_key to EmbeddingsManager."
            )

        openai.api_key = openai_api_key

        self.client = OpenAI(api_key=openai_api_key)
        self.default_model = default_model

    def get_embeddings(self, text: str, model: Optional[str] = None) -> List[float]:
        """
        Get just the embeddings array from OpenAI, using either the default or a specified model.
        :param text: The text to be embedded.
        :param model: (Optional) Model override.
        :return: The embedding vector as a list of floats.
        """
        if model is None:
            model = self.default_model
        
        text = text.replace("\n", " ").strip()

        response = self.client.embeddings.create(
            model=model,
            input=text
        )
        return response.data[0].embedding

    def get_full_response(self, text: str, model: Optional[str] = None) -> Any:
        """
        If you need the full response object (including usage metadata, etc.), call this method.
        :param text: The text to be embedded.
        :param model: (Optional) Model override.
        :return: The entire response object from OpenAI.
        """
        if model is None:
            model = self.default_model

        response = self.client.embeddings.create(
            model=model,
            input=text
        )
        return response


if __name__ == "__main__":
    import time
    
    embeder = EmbeddingsManager()  
    text_to_embed = "How do dolphins sleep?"
    
    start_time = time.time()
    embedding_vector = embeder.get_embeddings(text_to_embed)
    end_time = time.time()

    print(f"Time taken: {end_time - start_time} seconds")
    print(f"Embedding vector length: {len(embedding_vector)}")
    # export the embedding vector to a file
    with open("embedding_vector.txt", "w") as f:
        f.write(str(embedding_vector))

    full_response = embeder.get_full_response(text_to_embed)
    print("\nFull response object:", full_response)
