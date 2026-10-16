-- ==============================================================================
-- FLATEL HOSPITALITY - COMBINED SAFE MIGRATIONS (IDEMPOTENT & ZERO DATA LOSS)
-- ==============================================================================
-- This script applies:
-- 1. 20261016_allow_accommodation_only.sql (Expands stay purpose check constraint)
-- 2. 20261016_atomic_booking_intents.sql (Creates atomic booking stored procedure)
-- 3. 20261016_secure_booking_access.sql (Secures RLS policies to owner admin)
--
-- SAFETY GUARANTEE:
-- - NO rows, tables, or columns are deleted or truncated.
-- - Wrapped in a transaction (rolls back on any unexpected syntax error).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. EXPAND STAY PURPOSE CHECK CONSTRAINT
-- ------------------------------------------------------------------------------
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_stay_purpose_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_stay_purpose_check
  CHECK (stay_purpose IN ('medical', 'wedding', 'tourism', 'corporate', 'family', 'accommodation_only'));

-- ------------------------------------------------------------------------------
-- 2. CREATE ATOMIC BOOKING INTENTS FUNCTION (Double-booking protection)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_if_available(
  p_booking JSONB,
  p_total_units INTEGER
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_booking public.bookings;
  v_overlap_count INTEGER;
BEGIN
  v_booking := jsonb_populate_record(NULL::public.bookings, p_booking);

  IF p_total_units IS NULL OR p_total_units < 1 THEN
    RAISE EXCEPTION 'Residence inventory is unavailable.';
  END IF;
  IF v_booking.unit_id IS NULL OR v_booking.check_in_date IS NULL OR v_booking.check_out_date IS NULL THEN
    RAISE EXCEPTION 'Reservation details are incomplete.';
  END IF;
  IF v_booking.check_out_date <= v_booking.check_in_date THEN
    RAISE EXCEPTION 'Check-out date must be after check-in.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_booking.unit_id));

  IF EXISTS (
    SELECT 1
    FROM public.blocked_dates AS blocked
    WHERE blocked.unit_id = v_booking.unit_id
      AND blocked.blocked_date >= v_booking.check_in_date
      AND blocked.blocked_date < v_booking.check_out_date
  ) THEN
    RAISE EXCEPTION 'The residence is unavailable for one or more selected dates.';
  END IF;

  SELECT COUNT(*) INTO v_overlap_count
  FROM public.bookings AS existing
  WHERE existing.unit_id = v_booking.unit_id
    AND existing.booking_status <> 'cancelled'
    AND existing.payment_status NOT IN ('failed', 'cancelled')
    AND existing.check_in_date < v_booking.check_out_date
    AND existing.check_out_date > v_booking.check_in_date;

  IF v_overlap_count >= p_total_units THEN
    RAISE EXCEPTION 'The residence is no longer available for the selected dates.';
  END IF;

  INSERT INTO public.bookings (
    id, booking_code, unit_id, guest_name, guest_phone, guest_email,
    is_international, special_requests, stay_purpose, check_in_date,
    check_out_date, total_nights, adults_count, kids_count, extra_guests_count,
    selected_addons, base_rent_total, extra_guests_total, addons_total,
    gross_total, advance_paid_amount, balance_due_amount, payment_status,
    booking_status, balance_collected
  ) VALUES (
    COALESCE(v_booking.id, gen_random_uuid()), v_booking.booking_code, v_booking.unit_id,
    v_booking.guest_name, v_booking.guest_phone, v_booking.guest_email,
    COALESCE(v_booking.is_international, FALSE), v_booking.special_requests,
    v_booking.stay_purpose, v_booking.check_in_date, v_booking.check_out_date,
    v_booking.total_nights, v_booking.adults_count, COALESCE(v_booking.kids_count, 0),
    COALESCE(v_booking.extra_guests_count, 0), COALESCE(v_booking.selected_addons, '[]'::jsonb),
    v_booking.base_rent_total, COALESCE(v_booking.extra_guests_total, 0),
    COALESCE(v_booking.addons_total, 0), v_booking.gross_total,
    COALESCE(v_booking.advance_paid_amount, 0), v_booking.balance_due_amount,
    COALESCE(v_booking.payment_status, 'pending'), COALESCE(v_booking.booking_status, 'pending'),
    COALESCE(v_booking.balance_collected, FALSE)
  ) RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking_if_available(JSONB, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_if_available(JSONB, INTEGER) TO service_role;

-- ------------------------------------------------------------------------------
-- 3. SECURE BOOKING ACCESS RLS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read booking by code" ON public.bookings;
DROP POLICY IF EXISTS "Public insert booking intent" ON public.bookings;

DROP POLICY IF EXISTS "Admin full access on branches" ON public.branches;
DROP POLICY IF EXISTS "Admin full access on units" ON public.units;
DROP POLICY IF EXISTS "Admin full access on addon_services" ON public.addon_services;
DROP POLICY IF EXISTS "Admin full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access on blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Admin full access on payment_transactions" ON public.payment_transactions;

DROP POLICY IF EXISTS "Owner admin full access on branches" ON public.branches;
CREATE POLICY "Owner admin full access on branches" ON public.branches
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

DROP POLICY IF EXISTS "Owner admin full access on units" ON public.units;
CREATE POLICY "Owner admin full access on units" ON public.units
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

DROP POLICY IF EXISTS "Owner admin full access on addon_services" ON public.addon_services;
CREATE POLICY "Owner admin full access on addon_services" ON public.addon_services
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

DROP POLICY IF EXISTS "Owner admin full access on bookings" ON public.bookings;
CREATE POLICY "Owner admin full access on bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

DROP POLICY IF EXISTS "Owner admin full access on blocked_dates" ON public.blocked_dates;
CREATE POLICY "Owner admin full access on blocked_dates" ON public.blocked_dates
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

DROP POLICY IF EXISTS "Owner admin full access on payment_transactions" ON public.payment_transactions;
CREATE POLICY "Owner admin full access on payment_transactions" ON public.payment_transactions
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

COMMIT;
