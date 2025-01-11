# rag_reranker.py
import os
from typing import List, Dict, Any, Union, Optional
from dotenv import load_dotenv
import cohere

load_dotenv()

class ReRankManager:
    """
    A manager for reranking documents using Cohere's Rerank endpoint.
    Creates the Cohere client once, and provides a method to rerank documents.
    """

    def __init__(
        self,
        cohere_api_key: Optional[str] = None,
        default_model: str = "rerank-v3.5",
        default_top_n: int = 5
    ):
        """
        :param cohere_api_key: Your Cohere API key. If not provided, will attempt to load from COHERE_API_KEY env var.
        :param default_model: Default Cohere Rerank model, e.g. 'rerank-v3.5' (multilingual) or 'rerank-english-v3.0'.
        :param default_top_n: Default number of top results to return when reranking.
        """
        if not cohere_api_key:
            cohere_api_key = os.getenv("COHERE_API_KEY")

        if not cohere_api_key:
            raise ValueError(
                "No Cohere API key found. Please set COHERE_API_KEY in your environment "
                "or pass cohere_api_key to ReRankManager."
            )

        self.client = cohere.Client(cohere_api_key)
        self.default_model = default_model
        self.default_top_n = default_top_n

    def rerank_documents(
        self,
        query: str,
        documents: List[Union[str, Dict[str, Any]]],
        top_n: Optional[int] = None,
        model: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Re-rank documents using Cohere's Rerank API.

        :param query: The query you want to search for (str).
        :param documents: A list of documents. 
                          - Each document can be:
                            1) a string (just text)
                            2) a dict with a "content" field or any structure you choose
        :param top_n: Number of top results to return (defaults to self.default_top_n)
        :param model: Rerank model to use (defaults to self.default_model).
        :return: A list of dictionaries with the original document plus a "relevanceScore".
                 Sorted by descending relevanceScore.
        """
        if not documents:
            return []

        if top_n is None:
            top_n = self.default_top_n
        if model is None:
            model = self.default_model

        doc_texts = []
        for doc in documents:
            if isinstance(doc, dict):
                # Expecting the actual text in doc["content"]
                doc_texts.append(doc.get("content", ""))
            else:
                # doc is assumed to be a string
                doc_texts.append(doc)

        try:
            # Call Cohere's Rerank API
            rerank_response = self.client.rerank(
                model=model,
                query=query,
                documents=doc_texts,
                top_n=top_n,
                return_documents=True
            )

            # Build a new list with the original docs + relevanceScore
            reranked_results = []
            for result in rerank_response.results:
                # result.index = the original index in the doc_texts
                orig_doc = documents[result.index]
                # Convert doc to a dict if it's just a string
                if isinstance(orig_doc, str):
                    orig_doc = {"content": orig_doc}

                # Add relevance score
                reranked_results.append({
                    **orig_doc,
                    "relevanceScore": result.relevance_score
                })

            # Sort by descending relevance
            reranked_results.sort(key=lambda x: x["relevanceScore"], reverse=True)
            return reranked_results

        except Exception as e:
            print(f"Error in reranking: {e}")
            fallback = []
            for i, doc in enumerate(documents[:top_n]):
                if isinstance(doc, str):
                    doc = {"content": doc}
                fallback.append({
                    **doc,
                    "relevanceScore": 0.0,  
                })
            return fallback


if __name__ == "__main__":
    reranker = ReRankManager()  

    sample_documents = [
        {"id": 1, "title": "Numerical solution of shock and ramp compression for general material properties", "content": "A general formulation was developed to represent material models for applications in dynamic loading. Numerical method", "url": "https://doi.org/10.1063/1.2975338", "provider": "database", "date": "2025-01-04T19:27:18.541149+00:00"},
        {"id": 2, "title": "Retrieving information from a noisy \"knowledge network\"", "content": "We address the problem of retrieving information from a noisy version of the \"knowledge networks\" introduced by Masl", "url": "https://doi.org/10.1088/1742-5468/2007/08/P08015", "provider": "database", "date": "2025-01-04T19:32:46.061663+00:00"},
        {"id": 3, "title": "Finite strain viscoplasticity with nonlinear kinematic hardening: phenomenological modeling and time integration", "content": "This article deals with a viscoplastic material model of overstress type. The model is based on a multiplicative decom", "url": "https://doi.org/10.1016/j.cma.2007.12.017", "provider": "database", "date": "2025-01-04T19:39:54.710099+00:00"},
        {"id": 4, "title": "Kinetic approaches to particle acceleration at cosmic ray modified shocks", "content": "Kinetic approaches provide an effective description of the process of particle acceleration at shock fronts and allow", "url": "https://doi.org/10.1111/j.1365-2966.2008.12876.x", "provider": "database", "date": "2025-01-04T19:37:58.723542+00:00"},
        {"id": 5, "title": "Sampling using a 'bank' of clues", "content": "An easy-to-implement form of the Metropolis Algorithm is described which, unlike most standard techniques, is well sui", "url": "https://doi.org/10.1016/j.cpc.2008.02.020", "provider": "database", "date": "2025-01-04T19:33:27.359448+00:00"}
    ]

    query_text = "How can numerical methods model material response under shock and ramp compression, including phase transitions and composite deformation paths?"
    results = reranker.rerank_documents(query=query_text, documents=sample_documents, top_n=5)

    for idx, item in enumerate(results):
        print(f"Rank #{idx+1} | Doc ID: {item.get('id')} | Title: {item.get('title')} | "
              f"Relevance: {item['relevanceScore']:.4f} | Content: {item['content'][:50]}...")  
