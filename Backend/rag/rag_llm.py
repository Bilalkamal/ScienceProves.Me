# rag_llm.py
import time
import random
import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import logging
import asyncio

from .rag_prompts import (
    DEFAULT_SYSTEM_PROMPT,
    SCIENTIFIC_QUERY_VALIDATOR_SYSTEM,
    RAG_PROMPT,
    RAG_SYSTEM
)

import aisuite as ai
from cerebras.cloud.sdk import Cerebras

load_dotenv()

# Set environment variables for aisuite
os.environ["FIREWORKS_API_KEY"] = os.environ.get("FIREWORKS_API_KEY", "")
os.environ["GROQ_API_KEY"] = os.environ.get("GROQ_API_KEY", "")
os.environ["SAMBANOVA_API_KEY"] = os.environ.get("SAMBANOVA_API_KEY", "")
CEREBRAS_API_KEY = os.environ.get("CEREBRAS_API_KEY")

class ModelResponse:
    """
    A container for the results from a provider's response.

    Attributes:
        provider_name (str): Name of the provider (e.g., "fireworks", "groq", "cerebras", "sambanova").
        content (str): The main text from the response (i.e., the 'assistant' message).
        raw_response (Any): The entire raw object returned by the provider SDK.
                           This may contain things like usage info, token counts, timestamps, etc.
        model_id (Optional[str]): The specific model ID used (e.g., "llama-3.3-70b-specdec").
    """
    def __init__(self, provider_name: str, content: str, raw_response: Any, model_id: Optional[str] = None):
        self.provider_name = provider_name
        self.content = content
        self.raw_response = raw_response
        self.model_id = model_id

    def __repr__(self):
        return (
            f"ModelResponse(provider_name='{self.provider_name}', "
            f"model_id='{self.model_id}', "
            f"content='{self.content[:60]}...', "
            f"raw_response=<{type(self.raw_response).__name__}>)"
        )


class ModelManager:
    """
    Provider-agnostic Manager that handles calling multiple models/providers in a round-robin fashion.
    If one provider fails, it is put on cooldown for 30 minutes, and the next provider is tried immediately.
    """

    COOLDOWN_SECONDS = 1 * 60  # 30 minutes

    def __init__(self):
        """
        Initialize the ModelManager with all possible providers, their corresponding model IDs,
        and any other config needed. You can easily add new providers here.
        """
        self.logger = logging.getLogger(__name__)
        self.ai_client = ai.Client()
        self.cerebras_client = Cerebras(api_key=CEREBRAS_API_KEY)

        self.providers = [
            {
                "name": "cerebras",
                "model_id": "llama-3.3-70b",
                "type": "cerebras",
            },
            {
                "name": "groq",
                "model_id": "llama-3.3-70b-specdec",
                "type": "aisuite",
            },
            {
                "name": "fireworks",
                "model_id": "accounts/fireworks/models/llama-v3p3-70b-instruct",
                "type": "aisuite",  
            },
            {
                "name": "sambanova",
                "model_id": "Meta-Llama-3.3-70B-Instruct",
                "type": "aisuite",
            }
        ]
        # choose a random provider to start with
        self.current_provider_index = random.randint(0, len(self.providers) - 1)
        self.logger.info(f"\n{'='*50}\nSTEP: ModelManager initialized\nProviders: {[p['name'] for p in self.providers]}\n{'='*50}")

        self.cooldowns = {p["name"]: 0 for p in self.providers}

    def prompt(self, prompt_text: str, system_prompt: str = DEFAULT_SYSTEM_PROMPT, **kwargs) -> ModelResponse:
        """
        Takes a user prompt and returns a ModelResponse object from the first available (non-cooldown) provider.
        Round-robin rotation is applied after a successful call or a failure that triggers moving to next.
        
        :param prompt_text: The user prompt or question
        :param system_prompt: Optional system instructions
        :param kwargs: Additional parameters for the underlying provider calls (e.g. temperature, etc.)
        :return: ModelResponse - object containing the content, provider_name, raw response, etc.
        """
        # Check if this is a validation or answer generation prompt
        is_validation = system_prompt == SCIENTIFIC_QUERY_VALIDATOR_SYSTEM
        is_answer_gen = system_prompt == RAG_SYSTEM
        
        if is_validation or is_answer_gen:
            # Try Cerebras first for validation and answer generation
            try:
                if time.time() >= self.cooldowns["cerebras"]:
                    cerebras_info = next(p for p in self.providers if p["name"] == "cerebras")
                    start_time = time.time()
                    response = self._call_provider(
                        provider_info=cerebras_info,
                        prompt_text=prompt_text,
                        system_prompt=system_prompt,
                        **kwargs
                    )
                    end_time = time.time()
                    task_type = 'Validation' if is_validation else 'Answer Generation'
                    self.logger.info(f"\n{'='*50}\nSTEP: {task_type} using Cerebras\nTime taken: {end_time - start_time:.2f}s\n{'='*50}")
                    return response
            except Exception as e:
                self.cooldowns["cerebras"] = time.time() + self.COOLDOWN_SECONDS
                self.logger.warning(f"\n{'='*50}\nERROR: Cerebras failed, falling back to round-robin\nReason: {str(e)}\n{'='*50}")

        # For other tasks or if Cerebras failed, use round-robin
        num_providers = len(self.providers)
        
        for _ in range(num_providers):
            provider_info = self.providers[self.current_provider_index]
            provider_name = provider_info["name"]

            if time.time() < self.cooldowns[provider_name]:
                self._move_to_next_provider()
                continue

            try:
                start_time = time.time()
                response = self._call_provider(
                    provider_info=provider_info,
                    prompt_text=prompt_text,
                    system_prompt=system_prompt,
                    **kwargs
                )
                end_time = time.time()
                self.logger.info(f"\n{'='*50}\nSTEP: Round-robin task using {provider_name}\nTime taken: {end_time - start_time:.2f}s\n{'='*50}")
                self._move_to_next_provider()
                return response

            except Exception as e:
                # Provider failed: put it on cooldown and try the next
                self.cooldowns[provider_name] = time.time() + self.COOLDOWN_SECONDS
                self.logger.warning(f"\n{'='*50}\nERROR: {provider_name} failed\nReason: {str(e)}\n{'='*50}")
                self._move_to_next_provider()
                continue

        # If we exhaust all providers (none succeeded), raise an error
        raise RuntimeError("All providers failed or are on cooldown. Please try again later.")

    def _move_to_next_provider(self):
        """Advance the provider index in a round-robin fashion."""
        self.current_provider_index = (self.current_provider_index + 1) % len(self.providers)

    async def _call_provider_with_timeout(
        self,
        provider_info: Dict[str, str],
        prompt_text: str,
        system_prompt: str,
        timeout: float = 5.0,  # 5 seconds timeout
        **kwargs
    ) -> ModelResponse:
        """
        Helper function that makes the actual call to the provider with a timeout.
        If the provider takes longer than timeout seconds, it will try another provider.
        """
        provider_type = provider_info["type"]
        provider_name = provider_info["name"]
        model_id = provider_info["model_id"]

        try:
            if provider_type == "aisuite":
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ]
                combined_model_string = f"{provider_name}:{model_id}"
                raw_response = await asyncio.wait_for(
                    self.ai_client.chat.completions.acreate(
                        model=combined_model_string,
                        messages=messages,
                        **kwargs,
                    ),
                    timeout=timeout
                )
                content = raw_response.choices[0].message.content
                return ModelResponse(
                    provider_name=provider_name,
                    content=content,
                    raw_response=raw_response,
                    model_id=model_id
                )
            elif provider_type == "cerebras":
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ]
                raw_response = await asyncio.wait_for(
                    self.cerebras_client.chat.completions.acreate(
                        messages=messages,
                        model=model_id,
                        **kwargs,
                    ),
                    timeout=timeout
                )
                content = raw_response.choices[0].message.content
                return ModelResponse(
                    provider_name=provider_name,
                    content=content,
                    raw_response=raw_response,
                    model_id=model_id
                )
            else:
                raise ValueError(f"Unknown provider type: {provider_type}")
        except asyncio.TimeoutError:
            self.logger.warning(f"\n{'='*50}\nWARNING: {provider_name} timed out after {timeout}s, trying next provider\n{'='*50}")
            raise

    async def _call_provider_with_fallback(
        self,
        provider_info: Dict[str, str],
        prompt_text: str,
        system_prompt: str,
        **kwargs
    ) -> ModelResponse:
        """
        Try the first provider, and if it times out, try the next one.
        Return whichever response comes first.
        """
        # Start the first provider call
        first_provider_task = asyncio.create_task(
            self._call_provider_with_timeout(
                provider_info=provider_info,
                prompt_text=prompt_text,
                system_prompt=system_prompt,
                **kwargs
            )
        )

        try:
            # Wait for the first provider with timeout
            return await first_provider_task
        except asyncio.TimeoutError:
            # If first provider times out, get the next provider
            self._move_to_next_provider()
            next_provider = self.providers[self.current_provider_index]
            
            # Start the second provider call
            second_provider_task = asyncio.create_task(
                self._call_provider_with_timeout(
                    provider_info=next_provider,
                    prompt_text=prompt_text,
                    system_prompt=system_prompt,
                    **kwargs
                )
            )

            # Create a list of pending tasks
            pending = {first_provider_task, second_provider_task}
            
            while pending:
                # Wait for the first task to complete
                done, pending = await asyncio.wait(
                    pending,
                    return_when=asyncio.FIRST_COMPLETED
                )
                
                # Get the first completed task
                task = done.pop()
                try:
                    result = await task
                    # Cancel the other task if it's still running
                    for remaining in pending:
                        remaining.cancel()
                    return result
                except Exception as e:
                    # If this task failed, wait for the other one
                    self.logger.warning(f"\n{'='*50}\nWARNING: Provider failed: {str(e)}, waiting for other provider\n{'='*50}")
                    continue
            
            # If we get here, both providers failed
            raise RuntimeError("Both providers failed to respond")

    def _call_aisuite(
        self,
        provider_name: str,
        model_id: str,
        prompt_text: str,
        system_prompt: str,
        **kwargs
    ) -> ModelResponse:
        """Call AISuite-based providers (like fireworks, groq)."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ]

        combined_model_string = f"{provider_name}:{model_id}"

        # Create an event loop if one doesn't exist
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        async def _async_call():
            try:
                raw_response = await asyncio.wait_for(
                    self.ai_client.chat.completions.acreate(
                        model=combined_model_string,
                        messages=messages,
                        **kwargs,
                    ),
                    timeout=5.0  # 5 second timeout
                )
                return raw_response
            except asyncio.TimeoutError:
                self.logger.warning(f"\n{'='*50}\nWARNING: {provider_name} timed out after 5s\n{'='*50}")
                raise

        raw_response = loop.run_until_complete(_async_call())
        content = raw_response.choices[0].message.content

        return ModelResponse(
            provider_name=provider_name,
            content=content,
            raw_response=raw_response,
            model_id=model_id
        )

    def _call_cerebras(
        self,
        provider_name: str,
        model_id: str,
        prompt_text: str,
        system_prompt: str,
        **kwargs
    ) -> ModelResponse:
        """Call the Cerebras-based provider."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ]

        # Create an event loop if one doesn't exist
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        async def _async_call():
            try:
                raw_response = await asyncio.wait_for(
                    self.cerebras_client.chat.completions.acreate(
                        messages=messages,
                        model=model_id,
                        **kwargs,
                    ),
                    timeout=5.0  # 5 second timeout
                )
                return raw_response
            except asyncio.TimeoutError:
                self.logger.warning(f"\n{'='*50}\nWARNING: {provider_name} timed out after 5s\n{'='*50}")
                raise

        raw_response = loop.run_until_complete(_async_call())
        content = raw_response.choices[0].message.content

        return ModelResponse(
            provider_name=provider_name,
            content=content,
            raw_response=raw_response,
            model_id=model_id
        )

    def _call_provider(
        self,
        provider_info: Dict[str, str],
        prompt_text: str,
        system_prompt: str,
        **kwargs
    ) -> ModelResponse:
        """
        Helper function that makes the actual call to the underlying provider SDK (AISuite, Cerebras, etc).
        Each provider type can have its own logic if needed.
        """
        provider_type = provider_info["type"]
        provider_name = provider_info["name"]
        model_id = provider_info["model_id"]

        try:
            if provider_type == "aisuite":
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ]
                combined_model_string = f"{provider_name}:{model_id}"
                raw_response = self.ai_client.chat.completions.create(
                    model=combined_model_string,
                    messages=messages,
                    **kwargs,
                )
                content = raw_response.choices[0].message.content
                return ModelResponse(
                    provider_name=provider_name,
                    content=content,
                    raw_response=raw_response,
                    model_id=model_id
                )
            elif provider_type == "cerebras":
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ]
                raw_response = self.cerebras_client.chat.completions.create(
                    messages=messages,
                    model=model_id,
                    **kwargs,
                )
                content = raw_response.choices[0].message.content
                return ModelResponse(
                    provider_name=provider_name,
                    content=content,
                    raw_response=raw_response,
                    model_id=model_id
                )
            else:
                raise ValueError(f"Unknown provider type: {provider_type}")
        except Exception as e:
            self.logger.warning(f"\n{'='*50}\nWARNING: {provider_name} failed\nReason: {str(e)}\n{'='*50}")
            raise

if __name__ == "__main__":
    llm = ModelManager()
    
    print("Sending prompt: 'Say this is a test'")
    start_time = time.time()
    response = llm.prompt("Say this is a test")  # returns ModelResponse
    end_time = time.time()

    print("Full ModelResponse object:\n", response)
    print("\nJust the text content:\n", response.content)
    print("\nProvider used:\n", response.provider_name)
    print("\nModel used:\n", response.model_id)
    # If the provider returns usage info or tokens in the raw_response, you can do something like:

    print(f"\nTime taken: {end_time - start_time:.2f} seconds")
