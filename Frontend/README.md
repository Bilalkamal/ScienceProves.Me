
<div align="center">

# 🧬 ScienceProves.Me - Frontend

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg)](https://tailwindcss.com/) [![Clerk](https://img.shields.io/badge/Clerk-6C47FF.svg)](https://clerk.dev/)

</div>




## 🎯 Overview

The ScienceProves.Me frontend brings a sleek, responsive experience to users by seamlessly integrating AI-driven research capabilities with a modern design. Whether you're looking for real-time scientific insights or tracking your query history, our frontend ensures that every interaction is both efficient and aesthetically pleasing.

---

## ✨ Key Features

<div align="center">

| Feature                     | Description |
|-----------------------------|-------------|
| **AI-Powered Research**     | Utilizes advanced RAG technology to sift through millions of papers for precise scientific evidence |
| **Real-time Answers**       | Instantly delivers scientifically-backed responses to your queries |
| **Modern UI**               | Features a sleek, responsive design with dark mode support for optimal viewing |
| **History Tracking**        | Keeps a record of your past queries for easy reference |

</div>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 22.x or later  
- **npm:** 11.x or later

### Installation Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/bilalkamal/scienceproves-me.git
   cd scienceproves-me
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env.local` file in the root directory and add your environment variables:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000  # Ensure your backend server runs on port 8000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Start the Development Server:**

   ```bash
   npm run dev
   ```

   The application will be live at: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```bash
.
├── public/                 # Static assets and images
├── src/
│   ├── app/               # Next.js 15 app directory
│   ├── components/        # Reusable React components
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and helpers
│   └── types/             # TypeScript type definitions
├── .env.local             # Environment variables (local)
├── next.config.ts         # Next.js configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

---

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework for dynamic user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Ensuring robust type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid styling
- [Clerk](https://clerk.dev/) - Seamless authentication and user management
- [Aceternity UI](https://ui.aceternity.com/) - Modern UI components (if applicable)
- [Radix UI](https://www.radix-ui.com/) - Accessible and customizable UI primitives

---

## 🤝 Contributing

We welcome your contributions! If you have ideas for new features or improvements, please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch:**

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit Your Changes:**

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to Your Branch:**

   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request:**  
   We appreciate clear commit messages and issue references whenever possible.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.


---

## 🙏 Acknowledgments

  - Thanks to [@JasonGoodison](https://youtube.com/@JasonGoodison) for inspiring the RAG app idea.  
  - Gratitude to [@mckaywrigley](https://x.com/mckaywrigley) for stellar course on RAG development.
  - Thanks to [@RLanceMartin](https://x.com/RLanceMartin) and [@LangChainAI](https://x.com/LangChainAI) for their videos, courses, and tutorials.
  - Appreciation to [Pixegami](https://www.pixegami.io/) for the amazing RAG tutorials.



**Made with ❤️ by [Bilal](https://github.com/Bilalkamal)**
