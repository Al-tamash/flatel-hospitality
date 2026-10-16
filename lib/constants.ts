/**
 * Flatel Hospitality - Core Project Constants
 * Single Source of Truth as per final-prd.md
 */

export const COMPANY_NAME = "Flatel Hospitality Private Limited";
export const BRAND_NAME = "Flatel Hospitality";
export const BRAND_TAGLINE = "The comfort of a flat. The service of a hotel.";
export const CONTACT_PHONE = "+91 7989100711";
export const CONTACT_EMAIL = "reservation@flatel.in";
export const TARGET_DOMAIN = "www.flatel.in";

// Booking & Operational Policies (Strictly matching final-prd.md)
export const BOOKING_POLICY = {
  ADVANCE_PAYMENT_PERCENTAGE: 20,
  REMAINING_BALANCE_PERCENTAGE: 80,
  CHECK_IN_WINDOW: "11:00 AM – 1:00 PM",
  CHECK_IN_START: "11:00 AM",
  CHECK_IN_END: "1:00 PM",
  CHECK_OUT_TIME: "11:00 AM",
  EXTRA_PERSON_FEE_PER_NIGHT: 500,
  FREE_CANCELLATION_HOURS: 48,
  HOUSEKEEPING_SCHEDULE: "Complimentary housekeeping provided on alternate days",
  DURATION_DISCOUNTS: {
    WEEKLY: { minNights: 7, maxNights: 14, discountPercent: 10 },
    BIWEEKLY: { minNights: 15, maxNights: 27, discountPercent: 15 },
    MONTHLY: { minNights: 28, discountPercent: 25 },
  },
} as const;

// Currency & Formatting
export const CURRENCY = {
  CODE: "INR",
  SYMBOL: "₹",
  LOCALE: "en-IN",
} as const;

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: "currency",
    currency: CURRENCY.CODE,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Branches as defined in final-prd.md
export const BRANCHES = [
  {
    id: "barkas-salala",
    name: "Barkas Salala",
    slug: "barkas-salala",
    address: "Barkas Salala, Near Chandrayangutta, Hyderabad, Telangana",
    googleMapsUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
    status: "active",
  },
  {
    id: "moghal-pura",
    name: "Moghal Pura",
    slug: "moghal-pura",
    address: "Moghal Pura, Near Charminar, Hyderabad, Telangana",
    googleMapsUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
    status: "active",
  },
] as const;

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  googleMapsUrl: string;
  status: string;
}

export type BranchItem = (typeof BRANCHES)[number];


export function getBranchBySlug(slug: string): BranchItem | undefined {
  const normalized = slug.toLowerCase().trim();
  return BRANCHES.find((b) => b.slug === normalized || b.id === normalized);
}

// Flat Categories (1BHK to 5BHK) as defined in final-prd.md
export const ROOM_TYPES = [
  { id: "1bhk", name: "1 BHK", label: "1 BHK Furnished Flat", defaultPrice: 2000, baseAdults: 2, maxExtra: 2 },
  { id: "2bhk", name: "2 BHK", label: "2 BHK Furnished Flat", defaultPrice: 2500, baseAdults: 4, maxExtra: 2 },
  { id: "3bhk", name: "3 BHK", label: "3 BHK Furnished Flat", defaultPrice: 3000, baseAdults: 6, maxExtra: 3 },
  { id: "4bhk", name: "4 BHK", label: "4 BHK Furnished Flat", defaultPrice: 4000, baseAdults: 8, maxExtra: 4 },
  { id: "5bhk", name: "5 BHK", label: "5 BHK Luxury Flat (Admin-Configurable)", defaultPrice: null, baseAdults: null, maxExtra: null },
] as const;

// Five Stay Purposes as defined in final-prd.md and business requirements
export const STAY_PURPOSES = [
  {
    id: "medical",
    code: "medical",
    title: "Medistay — Hospital & Medical",
    name: "Medical Stay",
    tagline: "Tailored for patient attendants & healthcare visits",
    description: "Quiet, hygienic spaces equipped for patient attendants and medical visits near premier hospitals.",
    contextTag: "Owaisi, Apollo DRDO, Princess Durru Shehvar, Gandhi, KIMS Proximity",
  },
  {
    id: "wedding",
    code: "wedding",
    title: "Wedding Stay — Wedding Guests & Events",
    name: "Wedding Stay",
    tagline: "Wedding guest housing, group accommodations & celebrations",
    description: "Spacious multi-bedroom residences keeping extended families together with bridal dressing setups and event liaison.",
    contextTag: "Group Housing, Garment Steamer, Banquet Liaison, Luxury Fleet",
  },
  {
    id: "family",
    code: "family",
    title: "Family Vacation & Long Stay",
    name: "Family Stay",
    tagline: "Spacious multi-bedroom suites, full modular kitchens & kids comforts",
    description: "Spacious multi-bedroom residences designed for extended families with duration discounts up to 25%.",
    contextTag: "Multi-BHK Comfort, Modular Kitchen, Infant Cot, Board Games",
  },
  {
    id: "tourism",
    code: "tourism",
    title: "Wanderer — Tourism & Heritage",
    name: "Tourism & Heritage",
    tagline: "Prime city base for vacation, shopping & Old City heritage",
    description: "Prime central locations for shoppers, vacationers, and heritage explorers in Old City Hyderabad.",
    contextTag: "Charminar, Laad Bazaar, Chowmahalla Palace Proximity",
  },
  {
    id: "corporate",
    code: "corporate",
    title: "Corporate & Executive Stay",
    name: "Corporate & Executive",
    tagline: "High-speed Wi-Fi, ergonomic desk & corporate invoice support",
    description: "Dedicated enterprise connectivity, ergonomic workspace, and GST invoice assurance.",
    contextTag: "Quiet Workspace, Fast Wi-Fi, GST Automated Invoice",
  },
] as const;

// WhatsApp Support Configuration (strictly configuration-driven; +91 7989100711)
export const WHATSAPP_CONFIG = {
  PHONE_NUMBER:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "+91 7989100711",
  DISPLAY_NUMBER: "+91 7989100711",
  CLEAN_PHONE: "917989100711",
  DEFAULT_MESSAGE:
    "Hello Flatel Hospitality, I would like to inquire about booking a furnished flat.",
  getUrl(customMessage?: string): string {
    const text = encodeURIComponent(customMessage || this.DEFAULT_MESSAGE);
    const cleanPhone = (this.PHONE_NUMBER || this.CLEAN_PHONE).replace(/[^0-9]/g, "");
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
  },
} as const;

// Header Navigation & Brand Configuration (Strictly aligned with final-prd.md Section 7.1)
export const HEADER_NAVIGATION = {
  brand: {
    title: "FLATEL HOSPITALITY",
    tagline: "The comfort of a flat. The service of a hotel.",
    href: "/",
  },
  links: [
    { label: "Properties", href: "/properties" },
    { label: "Hospitals", href: "/hospitals" },
    { label: "About", href: "/about" },
    { label: "Policies", href: "/policies" },
    { label: "List Property", href: "/list-property" },
  ],
  actions: {
    hotline: {
      label: "+91 7989100711",
      href: "tel:+917989100711",
      title: "Call FLATEL Hospitality Direct Line",
    },
    search: {
      label: "Search",
      title: "Search flats and availability",
    },
    signIn: {
      label: "Sign In",
      title: "Guest Sign In & Access",
    },
    adminPortal: {
      label: "Staff Portal",
      href: "/admin",
      title: "Authorized Personnel Only",
    },
  },
} as const;

