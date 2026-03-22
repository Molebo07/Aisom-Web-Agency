
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  onboarded BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT,
  color TEXT DEFAULT '#0B1220',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id);

-- Cards table (the core unit)
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug','adr','concept','library','learning','interview','project')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  language TEXT,
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  review_interval INTEGER DEFAULT 1,
  review_ease FLOAT DEFAULT 2.5,
  is_archived BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their cards"
  ON public.cards FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Card embeddings for semantic search
CREATE TABLE public.card_embeddings (
  card_id UUID PRIMARY KEY REFERENCES public.cards(id) ON DELETE CASCADE,
  embedding VECTOR(1536)
);

ALTER TABLE public.card_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own embeddings"
  ON public.card_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cards
      WHERE cards.id = card_embeddings.card_id
      AND cards.user_id = auth.uid()
    )
  );

CREATE INDEX ON public.card_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Semantic search function
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
