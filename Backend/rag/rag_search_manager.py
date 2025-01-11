# rag_search_manager.py

import os
import json
from datetime import datetime
from typing import List, Dict, Optional

# External libraries
from dotenv import load_dotenv
from serpapi import GoogleSearch
import http.client
import json as pyjson
from langchain_core.documents import Document as LC_Document
from tavily import TavilyClient

load_dotenv()

# ========== Provider Keys from .env ==========
SERP_API_KEY = os.getenv("SERP_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")


# ========== Domains Setup ==========
DOMAINS = [
    "scholar.google.com", "ncbi.nlm.nih.gov/pmc", "arxiv.org", "sciencedirect.com",
    "webofscience.com", "researchgate.net", "ieeexplore.ieee.org", "jstor.org",
    "biorxiv.org", "scopus.com", "pubs.acs.org", "peerj.com", "plos.org",
    "dl.acm.org", "nature.com", "medrxiv.org", "ssrn.com", "link.springer.com",
    "europepmc.org", "onlinelibrary.wiley.com"
]


def web_search_tavily(client: TavilyClient, query: str, max_results: int = 5) -> List[LC_Document]:
    """Perform web search using Tavily API with restricted domains."""
    documents = []
    try:
        search_result = client.search(
            query=query,
            search_depth="advanced",
            max_results=max_results,
            include_domains=DOMAINS
        )
        for result in search_result.get('results', []):
            doc = LC_Document(
                page_content=result.get('content', ''),
                metadata={
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'search_date': datetime.now().isoformat(),
                }
            )
            documents.append(doc)
    except Exception as e:
        print(f"Tavily search error: {e}")
    return documents

def serp_search(api_key: str, query: str, num_results: int = 5) -> List[LC_Document]:
    """Perform Google search using SERP API."""
    documents = []
    if not api_key:
        print("No SERP_API_KEY provided.")
        return documents

    try:
        params = {
            "q": query,
            "device": "desktop",
            "num": num_results,
            "api_key": api_key
        }
        search = GoogleSearch(params)
        results = search.get_dict()

        # Organic results
        for result in results.get('organic_results', []):
            doc = LC_Document(
                page_content=result.get('snippet', ''),
                metadata={
                    'title': result.get('title', ''),
                    'url': result.get('link', ''),
                    'search_date': datetime.now().isoformat(),
                }
            )
            documents.append(doc)

        # Scholarly articles if present
        if 'scholarly_articles' in results:
            for article in results['scholarly_articles'].get('articles', []):
                doc = LC_Document(
                    page_content=article.get('snippet', ''),
                    metadata={
                        'title': article.get('title', ''),
                        'url': article.get('link', ''),
                        'search_date': datetime.now().isoformat(),
                    }
                )
                documents.append(doc)

    except Exception as e:
        print(f"SERP API search error: {e}")
    return documents

def scholar_search_serper(api_key: str, query: str) -> List[LC_Document]:
    """Perform Google Scholar search using Serper API."""
    documents = []
    if not api_key:
        print("No SERPER_API_KEY provided.")
        return documents

    try:
        conn = http.client.HTTPSConnection("google.serper.dev")
        payload = pyjson.dumps({"q": query})
        headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }
        conn.request("POST", "/scholar", payload, headers)
        response = conn.getresponse()
        data = pyjson.loads(response.read().decode("utf-8"))

        for result in data.get('organic', []):
            doc = LC_Document(
                page_content=result.get('snippet', ''),
                metadata={
                    'title': result.get('title', ''),
                    'url': result.get('link', ''),
                    'search_date': datetime.now().isoformat(),
                }
            )
            documents.append(doc)
    except Exception as e:
        print(f"Serper Scholar search error: {e}")

    return documents

class SearchManager:
    """
    Manages searches across three providers:
      1. Tavily (monthly limit = 1000)
      2. SERP (monthly limit = 100)
      3. Serper (lifetime limit = 2400)

    Uses round-robin among the three but prioritizes TAVILY & SERP because
    they refresh monthly. If a provider is out of usage (or no API key),
    skip it. Serper is used if the others are also either out or by rotation.

    Usage counters are persisted on disk (usage.json) so that restarting
    the app does not lose the usage info.
    """

    USAGE_FILE = "usage.json"
    TAVILY_MONTHLY_LIMIT = 1000
    SERP_MONTHLY_LIMIT = 100
    SERPER_LIFETIME_LIMIT = 2400

    def __init__(self):
        # Providers in desired rotation order:
        #   TAVILY -> SERP -> SERPER -> repeat ...
        self.providers = ["tavily", "serp", "serper"]
        self.current_index = 0

        # Load usage from disk
        self.usage = self._load_usage()

        # Initialize API clients here after ensuring environment variables are loaded
        self.tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None
        # SERP and Serper don't require client initialization here

        # Possibly reset monthly usage if the month changed
        self._reset_monthly_usage_if_needed("tavily")
        self._reset_monthly_usage_if_needed("serp")
        # We do NOT reset Serper usage automatically (it's lifetime).

    def search(self, query: str, results: int = 5) -> List[LC_Document]:
        """
        High-level search method:
          1) Round-robin among providers [TAVILY -> SERP -> SERPER -> ...]
          2) Skip if monthly/lifetime limit is reached
          3) Return a list of LC_Documents, each with:
               - doc.page_content
               - doc.metadata['title'], doc.metadata['url'], doc.metadata['search_date']
               - doc.metadata['search_provider']
        """

        attempts = 0
        max_attempts = len(self.providers)

        while attempts < max_attempts:
            provider = self.providers[self.current_index]
            # Advance for the next call, but we haven't actually used it yet:
            self.current_index = (self.current_index + 1) % len(self.providers)
            attempts += 1

            # Check usage and key for this provider
            if not self._can_use_provider(provider):
                continue  # skip to next in rotation

            # Actually use this provider
            docs = self._call_provider_search(provider, query, results)
            if docs:
                # Update usage counters
                self._increment_usage(provider)

                # Save to disk
                self._save_usage()

                return docs

        # If we exhaust all providers, no results
        print("All providers are either out of usage or missing API keys.")
        return []

    # ---------- Internals ----------

    def _call_provider_search(self, provider: str, query: str, max_results: int) -> List[LC_Document]:
        """Calls the appropriate search function based on the provider name, adds provider to metadata."""
        if provider == "tavily":
            if not self.tavily_client:
                print("Tavily client is not initialized.")
                return []
            docs = web_search_tavily(self.tavily_client, query, max_results)
        elif provider == "serp":
            docs = serp_search(SERP_API_KEY, query, max_results)
        elif provider == "serper":
            docs = scholar_search_serper(SERPER_API_KEY, query)
        else:
            return []

        if not docs:
            print(f"No documents found from provider: {provider}")
            return []

        # Attach the provider name to each doc's metadata
        for doc in docs:
            doc.metadata["search_provider"] = provider

        return docs

    def _can_use_provider(self, provider: str) -> bool:
        """Checks if usage limits or missing API keys disqualify this provider."""
        if provider == "tavily":
            if not self.tavily_client:
                return False
            usage = self.usage["tavily"]["usage"]
            if usage >= self.TAVILY_MONTHLY_LIMIT:
                print("Tavily usage limit reached.")
                return False
            return True

        elif provider == "serp":
            if not SERP_API_KEY:
                return False
            usage = self.usage["serp"]["usage"]
            if usage >= self.SERP_MONTHLY_LIMIT:
                print("SERP usage limit reached.")
                return False
            return True

        elif provider == "serper":
            if not SERPER_API_KEY:
                return False
            usage = self.usage["serper"]["lifetime_usage"]
            if usage >= self.SERPER_LIFETIME_LIMIT:
                print("SERPER usage limit (2400) reached. Please update your API key.")
                return False
            return True

        return False

    def _increment_usage(self, provider: str) -> None:
        """Increment usage for the chosen provider."""
        if provider == "tavily":
            self._reset_monthly_usage_if_needed(provider)
            self.usage["tavily"]["usage"] += 1

        elif provider == "serp":
            self._reset_monthly_usage_if_needed(provider)
            self.usage["serp"]["usage"] += 1

        elif provider == "serper":
            # Lifetime usage
            self.usage["serper"]["lifetime_usage"] += 1

    # ---------- Usage Persistence ----------

    def _load_usage(self) -> Dict:
        """Load usage data from disk, or return defaults if not found."""
        if not os.path.exists(self.USAGE_FILE):
            # Return a default structure
            now = datetime.utcnow()
            month_str = now.strftime("%Y-%m")
            return {
                "tavily": {"month": month_str, "usage": 0},
                "serp": {"month": month_str, "usage": 0},
                "serper": {"lifetime_usage": 0},
            }
        try:
            with open(self.USAGE_FILE, "r") as f:
                data = json.load(f)
            return data
        except Exception as e:
            print(f"Error loading usage file: {e}")
            # fallback
            now = datetime.utcnow()
            month_str = now.strftime("%Y-%m")
            return {
                "tavily": {"month": month_str, "usage": 0},
                "serp": {"month": month_str, "usage": 0},
                "serper": {"lifetime_usage": 0},
            }

    def _save_usage(self) -> None:
        """Save current usage structure to disk."""
        try:
            with open(self.USAGE_FILE, "w") as f:
                json.dump(self.usage, f, indent=2)
        except Exception as e:
            print(f"Error saving usage file: {e}")

    def _reset_monthly_usage_if_needed(self, provider: str) -> None:
        """If the month changed, reset usage to 0 for that provider."""
        now = datetime.utcnow()
        curr_month_str = now.strftime("%Y-%m")
        record_month = self.usage[provider].get("month", "")

        if curr_month_str != record_month:
            # new month -> reset usage
            self.usage[provider]["usage"] = 0
            self.usage[provider]["month"] = curr_month_str

if __name__ == "__main__":
    from rich import print
    import time

    search = SearchManager()
    start_time = time.time()
    docs = search.search("What is the capital of Egypt?", results=5)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")
    print(f"Got {len(docs)} documents:\n")
    for i, doc in enumerate(docs):
        print(f"{i+1}. Provider={doc.metadata.get('search_provider')}")
        print(f"   Title={doc.metadata.get('title')}")
        print(f"   URL={doc.metadata.get('url')}")
        snippet = doc.page_content
        snippet_display = snippet if len(snippet) <= 100 else snippet[:100] + "..."
        print(f"   Snippet={snippet_display!r} (length={len(snippet)})\n")
