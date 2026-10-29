-- Reverts 20261030_booking_groups.sql. Grouped bookings stay as separate bookings.
BEGIN;

DROP INDEX IF EXISTS public.bookings_group_code_idx;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS group_code;

COMMIT;
