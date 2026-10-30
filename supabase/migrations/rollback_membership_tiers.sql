-- Reverts 20261031_membership_tiers.sql. Platinum members would lose their tier label.
BEGIN;

ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_tier_check;
ALTER TABLE public.memberships DROP COLUMN IF EXISTS tier;

COMMIT;
