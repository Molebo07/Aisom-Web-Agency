ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_languages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_role text,
ADD COLUMN IF NOT EXISTS github_username varchar(100);