ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS product_interest text
  CHECK (product_interest IS NULL OR product_interest IN ('Website', 'AI assistant', 'Both'));
