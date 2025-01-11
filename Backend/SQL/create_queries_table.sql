CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- create_queries_table.sql
-- Creates a 'queries' table to store user queries and their statuses.

-- Drop the queries table if it exists 
-- 🔴 Warning: This will delete all data in the table 🔴 
-- DROP TABLE IF EXISTS queries;

-- Create the queries table
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer JSONB, -- Stores the RAG system's response as JSON
    status TEXT NOT NULL DEFAULT 'pending', -- Possible values: 'pending', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently accessed columns and common query patterns
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
-- Create a compound index for user_id + created_at for optimizing the history endpoint
CREATE INDEX IF NOT EXISTS idx_queries_user_history ON queries(user_id, created_at DESC);
