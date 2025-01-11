# ScienceProves.me - Backend - RAG and API

A sophisticated Retrieval-Augmented Generation (RAG) API system designed to provide accurate, scientifically-grounded answers to research questions by leveraging both local scientific document databases and web searches.

## 🌟 Features

### RAG System
- **Scientific Query Validation**: Ensures questions are scientific in nature before processing
- **Multi-Stage Retrieval Pipeline**:
  1. Scientific Database Search: Primary source for scientific papers with millions of documents from scientific journals 
  2. Web Search Fallback: Searches top scientific journals, Google Scholar, and reputable scientific domains for relevant evidence
  3. Document Reranking: Uses Cohere for optimal document relevance
- **Quality Assurance**:
  - Self-Corrective RAG: Employs iterative refinement and verification techniques to ensure factual accuracy
  - Hallucination Detection: Verifies answer accuracy against source documents
  - Answer Relevance Grading: Ensures responses directly address the question
  - Citation Support: Includes proper academic citations in responses
- **Adaptive Search**: Falls back to web search if local database results are insufficient

### API Features
- **Streaming Support**: Real-time status updates during query processing
- **Query History**: Track and retrieve past queries and answers
- **User Management**: Individual user query tracking and history
- **Comprehensive Responses**: Includes source documents, processing time, and search origin
- **Query Caching**: Optimizes response time by caching frequent or similar questions

### Data Sources
- **arXiv Dataset**: Over 1.7 million research paper abstracts from Cornell University's arXiv dataset
- **Data Ingestion Pipeline**: Custom pipeline for processing and embedding scientific papers
- **Planned Additional Sources**:
  - bioRxiv: Preprint server for biological sciences
  - PubMed: Database of biomedical literature
  - SSRN: Social Science Research Network
  - Nature: Leading international scientific journal
  - And more scientific sources to come...

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- PostgreSQL Database
- Supabase Account
- API Keys for:
  - OpenAI
  - Cohere
  - Tavily
  - SerpAPI/Serper (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BilalKamal/scienceproves-me.git
cd scienceproves-me
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (.env):
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# API Keys
OPENAI_API_KEY=your_openai_key
COHERE_API_KEY=your_cohere_key
TAVILY_API_KEY=your_tavily_key
SERP_API_KEY=your_serp_key
SERPER_API_KEY=your_serper_key

```

### Database Setup

1. Initialize the database tables:
```bash
psql -U your_username -d your_database -f SQL/create_queries_table.sql
```

## 💡 Usage

### Starting the Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### API Endpoints

#### Ask a Scientific Question
```http
POST /ask
Content-Type: application/json

{
    "question": "What is the role of mitochondria in cell energy production?",
    "stream": true,
    "user_id": "user123"
}
```

#### Get Query History
```http
GET /history/{user_id}
```

### RAG System Architecture

The RAG system follows a sophisticated pipeline to ensure accurate scientific answers:

1. **Query Validation**
   - Validates if the question is scientific in nature
   - Uses LLM to assess query validity

2. **Document Retrieval**
   ```python
   # Primary database search
   db_docs = self._retrieve_local_docs(question)
   
   # Fallback to web search if needed
   if not db_docs or self._all_docs_below_threshold(db_docs):
       return self._websearch_path(question)
   ```

3. **Document Processing**
   - Reranking for relevance
   - Metadata extraction
   - Citation formatting

4. **Answer Generation**
   - Context-aware response generation
   - Citation inclusion
   - Quality verification

5. **Quality Control**
   ```python
   # Verify answer quality
   if not self._grade_hallucination(answer, docs):
       return self._websearch_path(question)
   ```


## 📁 Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── question.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   └── models.py
│   ├── main.py
│   └── services/
│       ├── __init__.py
│       └── request_manager.py
├── rag/
│   ├── __init__.py
│   ├── rag.py
│   ├── rag_embeddings.py
│   ├── rag_llm.py
│   ├── rag_prompts.py
│   ├── rag_reranker.py
│   ├── rag_retriever.py
│   └── rag_search_manager.py
├── SQL/
│   ├── create_documents_table.sql
│   ├── create_queries_table.sql
│   └── match_documents.sql
├── main.py
├── requirements.txt
└── vercel.json
├── Data-ingestion/
│   └── data-ingestion.ipynb    # Script for processing arXiv dataset
```


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Thanks to Cornell University and arXiv for providing the extensive research papers dataset
- Thanks to [@JasonGoodison](https://youtube.com/@JasonGoodison) for the idea of a RAG app that answers questions using Scientific papers
- Thanks to [@mckaywrigley](https://x.com/mckaywrigley) for being an incredible mentor and inspiration in RAG development
- Thanks to [@RLanceMartin](https://x.com/RLanceMartin) and [@LangChainAI](https://x.com/LangChainAI) for many of the ideas implemented
- Thanks to [Pixegami](https://www.pixegami.io/) for inspiration
- Thanks to all the amazing developers and creators I've learned from along the way

## 📞 Support

For support, email hello@scienceproves.me or open an issue in the repository.
