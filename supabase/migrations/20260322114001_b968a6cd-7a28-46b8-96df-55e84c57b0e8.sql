
-- Fix search_path on search_cards function
CREATE OR REPLACE FUNCTION public.search_cards(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  card_id UUID,
  similarity FLOAT
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT
    ce.card_id,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM public.card_embeddings ce
  JOIN public.cards c ON c.id = ce.card_id
  WHERE c.user_id = auth.uid()
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
$$;
