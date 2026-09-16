CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text NOT NULL DEFAULT 'quote',
  name text,
  business_name text,
  email text NOT NULL,
  phone text,
  industry text,
  budget_range text,
  details text,
  heard_about text,
  page_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(email) BETWEEN 3 AND 254
  AND (name IS NULL OR char_length(name) <= 120)
  AND (business_name IS NULL OR char_length(business_name) <= 160)
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (industry IS NULL OR char_length(industry) <= 80)
  AND (budget_range IS NULL OR char_length(budget_range) <= 80)
  AND (details IS NULL OR char_length(details) <= 5000)
  AND (heard_about IS NULL OR char_length(heard_about) <= 120)
  AND kind IN ('quote','newsletter')
);

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);