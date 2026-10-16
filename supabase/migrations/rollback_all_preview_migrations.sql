-- ==============================================================================
-- FLATEL HOSPITALITY - ROLLBACK MIGRATIONS
-- ==============================================================================
-- Use this script ONLY if you need to revert the changes applied by
-- apply_all_preview_migrations.sql.
-- ==============================================================================

BEGIN;

-- 1. Revert check constraint to previous state
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_stay_purpose_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_stay_purpose_check
  CHECK (stay_purpose IN ('medical', 'wedding', 'tourism', 'corporate', 'family'));

-- 2. Drop the atomic booking function
DROP FUNCTION IF EXISTS public.create_booking_if_available(JSONB, INTEGER);

-- 3. Drop owner-specific policies
DROP POLICY IF EXISTS "Owner admin full access on branches" ON public.branches;
DROP POLICY IF EXISTS "Owner admin full access on units" ON public.units;
DROP POLICY IF EXISTS "Owner admin full access on addon_services" ON public.addon_services;
DROP POLICY IF EXISTS "Owner admin full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner admin full access on blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Owner admin full access on payment_transactions" ON public.payment_transactions;

COMMIT;
