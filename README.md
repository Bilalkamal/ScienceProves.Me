<div align="center">

# 🧬 ScienceProves.Me

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

> Because "Trust me bro" isn't a valid source anymore.

Your AI-powered research assistant that provides scientifically-backed answers by analyzing millions of academic papers in real-time.

[Live Demo](https://scienceproves.me) · [Report Bug](https://github.com/Bilalkamal/ScienceProves.Me/issues) · [Request Feature](https://github.com/Bilalkamal/ScienceProves.Me/issues)

<img src="./Landing.png" alt="ScienceProves.Me Landing Page" width="100%">

</div>

## 🎯 Overview

ScienceProves.Me revolutionizes research by providing instant, scientifically-backed answers to your questions. Our advanced RAG (Retrieval-Augmented Generation) system analyzes millions of academic papers in real-time, ensuring accurate and verifiable responses.

## ✨ Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔍 **Pure Science** | Only peer-reviewed papers and trusted scientific sources |
| 🚀 **Real-time RAG** | Advanced retrieval-augmented generation for accurate answers |
| 📚 **Full Transparency** | Every answer includes citations and links to original research |
| ✅ **No Hallucinations** | Multi-stage verification ensures factual accuracy |
| 💫 **Modern UX** | Sleek, responsive interface with real-time streaming responses |

</div>

## 🛠️ Technology Stack

<div align="center">

### Frontend
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge)](https://clerk.dev/)

### Backend
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase)](https://supabase.com/)

</div>

## 🚀 Getting Started

Ready to dive in? Check out our detailed setup guides:
- [Frontend Documentation](Frontend/README.md)
- [Backend Documentation](Backend/README.md)

## 📁 Project Architecture

```bash
.
├── Frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/             
│   │   │   ├── ask/
│   │   │   ├── dashboard/
│   │   │   └── history/
│   │   ├── components/      
│   │   │   ├── ui/
│   │   │   ├── nav-bar.tsx
│   │   │   └── footer.tsx
│   │   ├── hooks/          
│   │   └── lib/            
│   ├── public/             
│   ├── next.config.ts
│   └── package.json
│
└── Backend/                  # FastAPI + RAG system
    ├── Data-ingestion/      
    │   └── data-ingestion.ipynb
    ├── SQL/                 
    │   ├── create_documents_table.sql
    │   ├── create_queries_table.sql
    │   └── match_documents.sql
    ├── app/                 
    │   ├── main.py
    │   ├── core/config.py
    │   ├── db/manager.py
    │   └── services/request_manager.py
    ├── rag/                 
    │   ├── rag.py
    │   ├── rag_embeddings.py
    │   ├── rag_llm.py
    │   └── rag_retriever.py
    ├── requirements.txt
    └── vercel.json
```

## 🛣️ Future Roadmap

- [ ] Integration with PubMed and Nature databases
- [ ] Question Caching for faster responses
- [ ] Web Search responses added to DB
- [ ] Advanced citation management system

## 🤝 Contributing

We welcome contributions! Feel free to:
- Open issues for bugs or suggestions
- Submit pull requests
- Share feedback and ideas

## 🙏 Acknowledgments

Special thanks to our amazing community and partners:
- [Cornell University and arXiv](https://arxiv.org/) for the extensive research papers dataset
- [@JasonGoodison](https://youtube.com/@JasonGoodison) for the RAG app concept
- [@mckaywrigley](https://x.com/mckaywrigley) for mentorship in RAG development
- [@RLanceMartin](https://x.com/RLanceMartin) and [@LangChainAI](https://x.com/LangChainAI) for implementation ideas
- [Pixegami](https://www.pixegami.io/) for inspiration

## 📬 Connect With Us

<div align="center">

[![Website](https://img.shields.io/badge/Website-ScienceProves.Me-blue?style=for-the-badge)](https://scienceproves.me)
[![Email](https://img.shields.io/badge/Email-Hello@ScienceProves.Me-red?style=for-the-badge)](mailto:Hello@ScienceProves.Me)
[![GitHub](https://img.shields.io/badge/GitHub-@Bilalkamal-black?style=for-the-badge&logo=github)](https://github.com/Bilalkamal)

</div>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


