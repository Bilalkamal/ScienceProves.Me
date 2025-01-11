-- match_documents.sql
-- Drops and re-creates the match_documents function (RPC) that returns 
-- documents ordered by similarity above a given threshold.

DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id bigint,
    title text,
    content text,
    embedding vector(1536),
    url text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id::bigint,
    d.title::text,
    d.content::text,
    d.embedding::vector(1536),
    d.url::text,
    d.created_at::timestamp with time zone,
    d.updated_at::timestamp with time zone,
    (1 - (d.embedding <=> query_embedding))::float AS similarity
  FROM documents d
  WHERE d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
