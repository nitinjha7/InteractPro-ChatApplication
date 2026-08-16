CREATE INDEX IF NOT EXISTS embeddings_embedding_hnsw
  ON embeddings USING hnsw (embedding vector_cosine_ops);
