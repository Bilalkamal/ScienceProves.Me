-- create_documents_table.sql
-- Creates a documents table with a vector column and an IVFFLAT index.

-- 🆘 WARNING: Dangerous! This will delete all existing data in the documents table!🆘 
-- DROP TABLE IF EXISTS documents;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),           -- pgvector column
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an IVFFLAT index on the embedding column for vector similarity
CREATE INDEX IF NOT EXISTS embedding_index
ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
