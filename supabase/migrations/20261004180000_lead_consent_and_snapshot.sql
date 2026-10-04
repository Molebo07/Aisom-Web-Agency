ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS package_interest text,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;

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
  AND (package_interest IS NULL OR char_length(package_interest) <= 80)
  AND (website_url IS NULL OR char_length(website_url) <= 220)
  AND (details IS NULL OR char_length(details) <= 5000)
  AND (heard_about IS NULL OR char_length(heard_about) <= 120)
  AND kind IN ('quote', 'snapshot', 'newsletter')
  AND (kind NOT IN ('quote', 'snapshot') OR consent_at IS NOT NULL)
  AND (kind <> 'newsletter' OR marketing_consent_at IS NOT NULL)
);
