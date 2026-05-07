
DROP FUNCTION IF EXISTS public.search_cards(vector, double precision, integer);

CREATE OR REPLACE FUNCTION public.search_cards(
  query_embedding vector,
  user_id uuid,
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 10
)
RETURNS TABLE(card_id uuid, similarity double precision)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT
    ce.card_id,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM public.card_embeddings ce
  JOIN public.cards c ON c.id = ce.card_id
  WHERE c.user_id = search_cards.user_id
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
$$;
