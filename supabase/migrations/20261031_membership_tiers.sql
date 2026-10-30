-- Flatel O Signature Membership: Golden and Platinum cards.
-- Run AFTER 20261029_memberships.sql, on the preview database first, in the Supabase SQL editor.
-- Safe to re-run. Existing memberships (the old single card) become 'golden', which keeps the same 10% rate.

BEGIN;

ALTER TABLE public.memberships
  ADD COLUMN IF NOT EXISTS tier VARCHAR(20) NOT NULL DEFAULT 'golden';

ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_tier_check;
ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_tier_check CHECK (tier IN ('golden', 'platinum'));

COMMIT;
