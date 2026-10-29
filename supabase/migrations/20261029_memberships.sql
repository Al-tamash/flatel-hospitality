-- Flatel Membership (₹777): member records and booking links.
-- Apply to the intended non-production preview database first, in the Supabase SQL editor.
-- Safe to re-run: every statement is idempotent and no existing data is changed.

BEGIN;

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code VARCHAR(20) UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'failed')),
  amount_paise BIGINT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS memberships_email_idx ON public.memberships (lower(email));
CREATE INDEX IF NOT EXISTS memberships_order_idx ON public.memberships (razorpay_order_id);

-- Members are read and written only by the server (service role) and the owner account.
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner admin full access on memberships" ON public.memberships;
CREATE POLICY "Owner admin full access on memberships" ON public.memberships
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

-- Which member (if any) a booking used, and how much the member rate saved.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS membership_id UUID REFERENCES public.memberships(id),
  ADD COLUMN IF NOT EXISTS member_discount_amount INTEGER NOT NULL DEFAULT 0;

COMMIT;
