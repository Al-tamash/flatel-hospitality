-- Reverts 20261029_memberships.sql. Deletes all member records; use only on the preview database.
BEGIN;

ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS member_discount_amount,
  DROP COLUMN IF EXISTS membership_id;

DROP TABLE IF EXISTS public.memberships;

COMMIT;
