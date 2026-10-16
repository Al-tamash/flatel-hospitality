-- Restrict booking records and administrative writes to the owner account.
-- Apply only to the intended non-production preview database after confirming isolation.

DROP POLICY IF EXISTS "Public read booking by code" ON public.bookings;
DROP POLICY IF EXISTS "Public insert booking intent" ON public.bookings;

DROP POLICY IF EXISTS "Admin full access on branches" ON public.branches;
DROP POLICY IF EXISTS "Admin full access on units" ON public.units;
DROP POLICY IF EXISTS "Admin full access on addon_services" ON public.addon_services;
DROP POLICY IF EXISTS "Admin full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access on blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Admin full access on payment_transactions" ON public.payment_transactions;

CREATE POLICY "Owner admin full access on branches" ON public.branches
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

CREATE POLICY "Owner admin full access on units" ON public.units
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

CREATE POLICY "Owner admin full access on addon_services" ON public.addon_services
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

CREATE POLICY "Owner admin full access on bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

CREATE POLICY "Owner admin full access on blocked_dates" ON public.blocked_dates
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');

CREATE POLICY "Owner admin full access on payment_transactions" ON public.payment_transactions
  FOR ALL TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'reservation@flatel.in');
