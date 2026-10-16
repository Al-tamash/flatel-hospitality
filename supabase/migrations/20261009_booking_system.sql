-- ============================================================================
-- FLATEL HOSPITALITY — COMPLETE PRODUCTION DATABASE MIGRATION
-- Single Source of Truth as per final-prd.md Section 9.2 & types/database.ts
-- Date: 2026-10-09
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BRANCHES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    google_maps_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on branch slug
CREATE INDEX IF NOT EXISTS idx_branches_slug ON public.branches(slug);

-- ----------------------------------------------------------------------------
-- 2. UNITS / RESIDENCES TABLE (1BHK to 5BHK)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    slug VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('1BHK', '2BHK', '3BHK', '4BHK', '5BHK')),
    base_price_per_night NUMERIC(10, 2) NOT NULL CHECK (base_price_per_night >= 0),
    base_adults INTEGER NOT NULL CHECK (base_adults >= 1),
    max_adults INTEGER NOT NULL CHECK (max_adults >= base_adults),
    max_kids INTEGER DEFAULT NULL,
    extra_person_fee_per_night NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    total_units INTEGER NOT NULL DEFAULT 1 CHECK (total_units >= 1),
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on units branch and category
CREATE INDEX IF NOT EXISTS idx_units_branch_id ON public.units(branch_id);
CREATE INDEX IF NOT EXISTS idx_units_category ON public.units(category);

-- ----------------------------------------------------------------------------
-- 3. ADDON SERVICES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addon_services (
    id VARCHAR(50) PRIMARY KEY,
    purpose_tag VARCHAR(30) NOT NULL CHECK (purpose_tag IN ('medical', 'tourism', 'corporate', 'family')),
    service_name VARCHAR(150) NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    pricing_type VARCHAR(20) NOT NULL CHECK (pricing_type IN ('free', 'per_booking', 'per_night', 'quote')),
    price NUMERIC(10, 2) DEFAULT NULL,
    disclaimer TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. BOOKINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. FLT-84920
    unit_id VARCHAR(50) NOT NULL, -- references units(slug)
    guest_name VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(30) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    is_international BOOLEAN NOT NULL DEFAULT FALSE,
    special_requests TEXT,
    stay_purpose VARCHAR(30) NOT NULL CHECK (stay_purpose IN ('medical', 'wedding', 'tourism', 'corporate', 'family', 'accommodation_only')),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INTEGER NOT NULL CHECK (total_nights >= 1),
    adults_count INTEGER NOT NULL CHECK (adults_count >= 1),
    kids_count INTEGER NOT NULL DEFAULT 0 CHECK (kids_count >= 0),
    extra_guests_count INTEGER NOT NULL DEFAULT 0 CHECK (extra_guests_count >= 0),
    selected_addons JSONB DEFAULT '[]'::jsonb,
    base_rent_total NUMERIC(10, 2) NOT NULL,
    extra_guests_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    addons_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gross_total NUMERIC(10, 2) NOT NULL,
    advance_paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 20%
    balance_due_amount NUMERIC(10, 2) NOT NULL, -- 80%
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'advance_paid', 'fully_paid', 'failed', 'cancelled', 'refunded')),
    booking_status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (booking_status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled')),
    balance_collected BOOLEAN NOT NULL DEFAULT FALSE,
    gateway_payment_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_dates_order CHECK (check_out_date > check_in_date)
);

-- Indexes for fast booking lookup
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_unit_dates ON public.bookings(unit_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status, payment_status);

-- ----------------------------------------------------------------------------
-- 5. BLOCKED CALENDAR DATES TABLE (For manual owner blocks or maintenance)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id VARCHAR(50) NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (unit_id, blocked_date)
);

-- ----------------------------------------------------------------------------
-- 6. PAYMENT TRANSACTIONS & WEBHOOK AUDIT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    gateway VARCHAR(30) NOT NULL DEFAULT 'razorpay',
    order_id VARCHAR(100) NOT NULL,
    payment_id VARCHAR(100),
    amount_paise BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'created',
    payload JSONB,
    signature VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. SEED INITIAL VERIFIED BRANCHES
-- ----------------------------------------------------------------------------
INSERT INTO public.branches (slug, name, address, google_maps_url, status)
VALUES
  ('barkas-salala', 'Barkas Salala', 'Barkas Salala, Near Chandrayangutta, Hyderabad, Telangana', 'https://maps.google.com/?q=Barkas+Salala+Hyderabad', 'active'),
  ('moghal-pura', 'Moghal Pura', 'Moghal Pura, Near Charminar, Hyderabad, Telangana', 'https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad', 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  google_maps_url = EXCLUDED.google_maps_url;

-- ----------------------------------------------------------------------------
-- 8. SEED INITIAL VERIFIED INVENTORY (1BHK, 2BHK, 3BHK, 4BHK)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_barkas_id UUID;
  v_moghal_id UUID;
BEGIN
  SELECT id INTO v_barkas_id FROM public.branches WHERE slug = 'barkas-salala' LIMIT 1;
  SELECT id INTO v_moghal_id FROM public.branches WHERE slug = 'moghal-pura' LIMIT 1;

  -- 1 BHK Moghal Pura
  INSERT INTO public.units (branch_id, slug, title, category, base_price_per_night, base_adults, max_adults, max_kids, extra_person_fee_per_night, total_units, images, is_available)
  VALUES (
    v_moghal_id,
    '1bhk',
    '1 BHK Deluxe Suite',
    '1BHK',
    2000.00,
    2,
    4,
    2,
    500.00,
    1,
    ARRAY['/images/flats/flat-1bhk-luxury.jpg'],
    TRUE
  ) ON CONFLICT (slug) DO UPDATE SET
    base_price_per_night = EXCLUDED.base_price_per_night,
    base_adults = EXCLUDED.base_adults,
    max_adults = EXCLUDED.max_adults,
    extra_person_fee_per_night = EXCLUDED.extra_person_fee_per_night;

  -- 2 BHK Moghal Pura
  INSERT INTO public.units (branch_id, slug, title, category, base_price_per_night, base_adults, max_adults, max_kids, extra_person_fee_per_night, total_units, images, is_available)
  VALUES (
    v_moghal_id,
    '2bhk',
    '2 BHK Family Residence',
    '2BHK',
    2500.00,
    4,
    6,
    2,
    500.00,
    1,
    ARRAY['/images/flats/flat-2bhk-luxury.jpg'],
    TRUE
  ) ON CONFLICT (slug) DO UPDATE SET
    base_price_per_night = EXCLUDED.base_price_per_night,
    base_adults = EXCLUDED.base_adults,
    max_adults = EXCLUDED.max_adults,
    extra_person_fee_per_night = EXCLUDED.extra_person_fee_per_night;

  -- 3 BHK Barkas Salala (2 units as per PRD)
  INSERT INTO public.units (branch_id, slug, title, category, base_price_per_night, base_adults, max_adults, max_kids, extra_person_fee_per_night, total_units, images, is_available)
  VALUES (
    v_barkas_id,
    '3bhk',
    '3 BHK Grand Residence',
    '3BHK',
    3000.00,
    6,
    9,
    3,
    500.00,
    2,
    ARRAY['/images/flats/flat-3bhk-luxury.jpg'],
    TRUE
  ) ON CONFLICT (slug) DO UPDATE SET
    base_price_per_night = EXCLUDED.base_price_per_night,
    base_adults = EXCLUDED.base_adults,
    max_adults = EXCLUDED.max_adults,
    extra_person_fee_per_night = EXCLUDED.extra_person_fee_per_night;

  -- 4 BHK Moghal Pura
  INSERT INTO public.units (branch_id, slug, title, category, base_price_per_night, base_adults, max_adults, max_kids, extra_person_fee_per_night, total_units, images, is_available)
  VALUES (
    v_moghal_id,
    '4bhk',
    '4 BHK Royal Penthouse',
    '4BHK',
    4000.00,
    8,
    12,
    4,
    500.00,
    1,
    ARRAY['/images/flats/flat-4bhk-luxury.jpg'],
    TRUE
  ) ON CONFLICT (slug) DO UPDATE SET
    base_price_per_night = EXCLUDED.base_price_per_night,
    base_adults = EXCLUDED.base_adults,
    max_adults = EXCLUDED.max_adults,
    extra_person_fee_per_night = EXCLUDED.extra_person_fee_per_night;
END $$;

-- ----------------------------------------------------------------------------
-- 9. SEED ADDON SERVICES (PRD Section 6)
-- ----------------------------------------------------------------------------
INSERT INTO public.addon_services (id, purpose_tag, service_name, is_free, pricing_type, price, disclaimer, is_active)
VALUES
  -- Medical
  ('med-doc-nurse', 'medical', 'Dedicated Doctor / Nurse Home Visits', FALSE, 'per_booking', 1500.00, 'Scheduled through certified hospital partners', TRUE),
  ('med-o2', 'medical', 'Oxygen Concentrator / Cylinder Setup', FALSE, 'per_booking', 2500.00, 'Direct clinical coordination with verified vendor', TRUE),
  ('med-diet-meals', 'medical', 'Diet-Specific Patient Meal Preparation', FALSE, 'per_night', 600.00, 'Custom tailored patient meal plan', TRUE),
  ('med-priority-check', 'medical', 'Priority Check-In & Check-Out Window', FALSE, 'per_booking', 500.00, 'Guaranteed priority arrival sanitization', TRUE),
  ('med-cab-transfer', 'medical', 'Chauffeur-Driven Hospital Cab Transfer', FALSE, 'per_booking', 800.00, 'Round trip property to hospital', TRUE),
  -- Tourism
  ('tour-airport-cab', 'tourism', 'Airport / Railway Station Transfer Cab', FALSE, 'per_booking', 1200.00, 'Air-conditioned sanitized cab', TRUE),
  ('tour-walking-tour', 'tourism', 'Old City Guided Walking & Shopping Tour', FALSE, 'per_booking', 1500.00, 'Licensed local historian guide (3 hours)', TRUE),
  ('tour-full-day-cab', 'tourism', 'Full-Day Chauffeur Sightseeing Cab', FALSE, 'per_booking', 3000.00, '8 Hours / 80 Km AC Innova or Sedan', TRUE),
  ('tour-breakfast', 'tourism', 'Authentic Hyderabadi Breakfast Hamper', FALSE, 'per_night', 450.00, 'Fresh Irani Chai, Osmania biscuits, Khichdi Khatta', TRUE),
  -- Corporate
  ('corp-airport-cab', 'corporate', 'Airport Express Chauffeur Transfer', FALSE, 'per_booking', 1200.00, 'Executive sedan with complimentary Wi-Fi hotspot', TRUE),
  ('corp-laundry', 'corporate', 'Same-Day Express Laundry & Ironing', FALSE, 'per_booking', 500.00, 'Suit, shirts, trousers return within 8 hours', TRUE),
  ('corp-meal-plan', 'corporate', 'Healthy Executive Meal Subscription', FALSE, 'per_night', 750.00, 'Nutritious low-oil executive lunches & dinners', TRUE),
  -- Family
  ('fam-mattress', 'family', 'Extra Floor Mattress / Rollaway Bed', FALSE, 'per_night', 500.00, 'Includes clean linen, pillow, and fresh duvet', TRUE),
  ('fam-grocery', 'family', 'Grocery Pre-Stocking Prior to Check-In', FALSE, 'per_booking', 350.00, 'Pre-stocked essentials as per your checklist', TRUE),
  ('fam-home-cook', 'family', 'Private Home Cook for Family Meals', FALSE, 'per_night', 1200.00, 'Personal cook for breakfast, lunch, and dinner', TRUE),
  ('fam-innova', 'family', 'Full-Day Sightseeing Innova / Tempo Traveler', FALSE, 'per_booking', 4500.00, 'Comfortable 7-seater / 12-seater AC vehicle', TRUE)
ON CONFLICT (id) DO UPDATE SET
  service_name = EXCLUDED.service_name,
  is_free = EXCLUDED.is_free,
  price = EXCLUDED.price,
  pricing_type = EXCLUDED.pricing_type;

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read active branches" ON public.branches;
DROP POLICY IF EXISTS "Public read available units" ON public.units;
DROP POLICY IF EXISTS "Public read active addons" ON public.addon_services;
DROP POLICY IF EXISTS "Public read booking by code" ON public.bookings;
DROP POLICY IF EXISTS "Public insert booking intent" ON public.bookings;
DROP POLICY IF EXISTS "Public read blocked dates" ON public.blocked_dates;

DROP POLICY IF EXISTS "Admin full access on branches" ON public.branches;
DROP POLICY IF EXISTS "Admin full access on units" ON public.units;
DROP POLICY IF EXISTS "Admin full access on addon_services" ON public.addon_services;
DROP POLICY IF EXISTS "Admin full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access on blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Admin full access on payment_transactions" ON public.payment_transactions;

-- Public read-only policies
CREATE POLICY "Public read active branches" ON public.branches
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public read available units" ON public.units
    FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Public read active addons" ON public.addon_services
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read blocked dates" ON public.blocked_dates
    FOR SELECT USING (TRUE);

CREATE POLICY "Public read booking by code" ON public.bookings
    FOR SELECT USING (TRUE);

CREATE POLICY "Public insert booking intent" ON public.bookings
    FOR INSERT WITH CHECK (booking_status = 'pending');

-- Authenticated Admin full-access policies
CREATE POLICY "Admin full access on branches" ON public.branches
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access on units" ON public.units
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access on addon_services" ON public.addon_services
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access on bookings" ON public.bookings
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access on blocked_dates" ON public.blocked_dates
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access on payment_transactions" ON public.payment_transactions
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
