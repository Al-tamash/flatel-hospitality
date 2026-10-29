-- Multi-flat bookings: several flats booked together share one group code, one payment and one voucher.
-- Apply to the intended non-production preview database first, in the Supabase SQL editor.
-- Safe to re-run; no existing data is changed.

BEGIN;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS group_code VARCHAR(20);

CREATE INDEX IF NOT EXISTS bookings_group_code_idx ON public.bookings (group_code)
  WHERE group_code IS NOT NULL;

COMMIT;
