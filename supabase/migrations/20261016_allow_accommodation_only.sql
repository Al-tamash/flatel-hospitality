-- Keep the persisted booking purpose aligned with the existing checkout option.
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_stay_purpose_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_stay_purpose_check
  CHECK (stay_purpose IN ('medical', 'wedding', 'tourism', 'corporate', 'family', 'accommodation_only'));
