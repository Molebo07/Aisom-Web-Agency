CREATE TABLE public.payfast_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  m_payment_id TEXT,
  pf_payment_id TEXT UNIQUE,
  payment_status TEXT NOT NULL,
  item_name TEXT,
  amount_gross NUMERIC(12,2),
  amount_fee NUMERIC(12,2),
  amount_net NUMERIC(12,2),
  email_address TEXT,
  plan_id TEXT,
  billing_cycle TEXT,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payfast_payments TO authenticated;
GRANT ALL ON public.payfast_payments TO service_role;
ALTER TABLE public.payfast_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payfast payments"
  ON public.payfast_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX idx_payfast_payments_user ON public.payfast_payments(user_id);