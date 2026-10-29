/**
 * Flatel Hospitality - Inventory & Services Master Data
 * Single Source of Truth as per final-prd.md
 */

export interface RoomGalleryImage {
  id: string;
  category: "Living Area" | "Bedroom" | "Kitchen" | "Bathroom" | "Exterior" | "Dining Lounge";
  alt: string;
  url?: string;
}

export interface RoomSpec {
  guests: string;
  bedrooms: string;
  kitchen: string;
  bathroom: string;
}

export interface Amenity {
  name: string;
  description?: string;
  iconName: "Wifi" | "UtensilsCrossed" | "Flame" | "Tv" | "Refrigerator" | "ArrowUpDown" | "Droplets" | "Zap";
}

export interface LandmarkItem {
  name: string;
  dist: string;
  time: string;
}

export interface RoomDetail {
  id: string;
  slug: string;
  aliases?: string[];
  type: "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK" | "5 BHK";
  category: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
  title: string;
  shortDescription: string;
  fullDescription?: string;
  basePricePerNight: number;
  baseAdults: number;
  maxExtraGuests: number;
  maxAdults: number;
  maxChildren: number | null; // Configurable: specific child safety capacity awaiting owner confirmation
  childCapacityStatus: "awaiting_owner_confirmation" | "confirmed";
  extraPersonFeePerNight: number; // ₹500
  totalUnits: number;
  branchSlug?: string;
  isAvailable?: boolean;
  capacityLabel: string;
  specs: RoomSpec;
  gallery: RoomGalleryImage[];
  amenities: Amenity[];
  landmarks?: LandmarkItem[];
}

export interface FacilityAddon {
  id: string;
  name: string;
  price: number | null; // null if requiring configuration or quote
  type: "one_time" | "per_night" | "quote" | "flat";
  pricingType: "flat" | "per_booking" | "per_night" | "quote";
  isFree?: boolean;
  disclaimer?: string;
  requiresConfiguration?: boolean;
}

export interface ComplimentaryService {
  name: string;
  disclaimer?: string;
}

export interface PurposePackage {
  id: "medical" | "wedding" | "tourism" | "corporate" | "family";
  name: string;
  tagline: string;
  freeFacilities: string[]; // string list for display compatibility
  complimentaryServices: ComplimentaryService[];
  paidAddons: FacilityAddon[];
}

/**
 * 4 Dynamic Stay Purpose Packages strictly matching final-prd.md Section 6
 */
export const PURPOSE_PACKAGES: PurposePackage[] = [
  {
    id: "medical",
    name: "Hospital & Medical Stay (Medistay)",
    tagline: "Tailored for patient attendants & healthcare visits",
    complimentaryServices: [
      { name: "Hospital & Doctor Appointments Assistance" },
      { name: "Hospital Travel Distance & Timing Guide" },
      {
        name: "24/7 Ambulance Coordination",
        disclaimer: "Coordination is complimentary; third-party ambulance transit charges apply if booked.",
      },
      { name: "24/7 Guest Assistance Desk" },
      {
        name: "Pharmacy Flatel Delivery",
        disclaimer: "Delivery coordination free; pharmacy medicine bill paid by guest.",
      },
      { name: "Wheelchair Assistance" },
      { name: "Hospital Bed Setup" },
      { name: "Glucose Stand (IV Stand)" },
      { name: "Blood Sugar Machine (Glucometer)" },
      { name: "Blood Pressure (BP) Machine" },
      { name: "Pulse Oximeter" },
      { name: "First-Aid Kit" },
      { name: "Relaxation Massagers (Leg & Hand Massagers)" },
      { name: "Sanitized Deep Housekeeping" },
    ],
    freeFacilities: [
      "Hospital & Doctor Appointments Assistance",
      "Hospital Travel Distance & Timing Guide",
      "24/7 Ambulance Coordination",
      "24/7 Guest Assistance Desk",
      "Pharmacy Flatel Delivery",
      "Wheelchair Assistance",
      "Hospital Bed Setup",
      "Glucose Stand (IV Stand)",
      "Blood Sugar Machine (Glucometer)",
      "Blood Pressure (BP) Machine",
      "Pulse Oximeter",
      "First-Aid Kit",
      "Relaxation Massagers (Leg & Hand)",
      "Sanitized Deep Housekeeping",
    ],
    paidAddons: [
      {
        id: "doctor-nurse-visits",
        name: "Dedicated Doctor / Nurse Home Visits",
        price: 1500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Scheduled visiting doctor & wound dressing support.",
      },
      {
        id: "oxygen-concentrator",
        name: "Oxygen Concentrator / Cylinder Setup",
        price: 2500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Medical-grade oxygen concentrator setup in suite.",
      },
      {
        id: "patient-meal-prep",
        name: "Diet-Specific Patient Meal Preparation",
        price: 600,
        type: "per_night",
        pricingType: "per_night",
        requiresConfiguration: false,
        disclaimer: "Tailored clinical diet meals prepared fresh daily.",
      },
      {
        id: "priority-check-in",
        name: "Priority Check-In & Deep Sanitization",
        price: 500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Guaranteed priority arrival and deep sanitization window.",
      },
      {
        id: "hospital-cab-transfer",
        name: "Chauffeur-Driven Hospital Cab Transfer",
        price: 800,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Round-trip sanitized AC cab for clinic and hospital appointments.",
      },
    ],
  },
  {
    id: "tourism",
    name: "Tourism & Heritage Stay (Wanderer)",
    tagline: "Prime city base for vacation, shopping & Old City heritage",
    complimentaryServices: [
      { name: "Detailed Monument Guides & Information (Free)" },
      { name: "Customized Itinerary Planning & Route Advice (Free)" },
      { name: "Old City & Charminar Heritage Walking Blueprint" },
      { name: "24/7 Local Front Desk & Guidance" },
      { name: "Luggage Storage Assistance on Arrival / Departure" },
    ],
    freeFacilities: [
      "Detailed Monument Guides & Information",
      "Customized Itinerary Planning & Route Advice",
      "Old City & Charminar Heritage Blueprint",
      "24/7 Local Front Desk & Guidance",
      "Luggage Storage on Arrival / Departure",
    ],
    paidAddons: [
      {
        id: "airport-station-transfer",
        name: "Airport Pick-Up & Drop (Private AC Transfer)",
        price: 1200,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Flight-tracked private airport transit between RGIA and Flatel.",
      },
      {
        id: "full-day-sightseeing-cab",
        name: "Chauffeur-Driven Full-Day Sightseeing Sedan / SUV",
        price: 3000,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Dedicated private vehicle with polite vetted local driver (8h / 80km).",
      },
      {
        id: "expert-local-guide",
        name: "Expert Multilingual Local Heritage Guide",
        price: 1500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Certified cultural guide for Charminar, Golconda & Museums.",
      },
      {
        id: "pro-photography-tour",
        name: "Full-Day Professional Photography & Media Shoot",
        price: 2500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Candid personal photographer for family vacation memories.",
      },
      {
        id: "breakfast-hamper",
        name: "Authentic Hyderabadi Breakfast Hamper",
        price: 450,
        type: "per_night",
        pricingType: "per_night",
        requiresConfiguration: false,
        disclaimer: "Daily Irani Chai, Osmania biscuits & hot breakfast delivered to suite.",
      },
    ],
  },
  {
    id: "corporate",
    name: "Corporate & Executive Stay",
    tagline: "High-speed Wi-Fi, ergonomic desk & corporate invoice support",
    complimentaryServices: [
      { name: "High-Speed Dedicated Enterprise Wi-Fi" },
      { name: "Ergonomic Work Desk & Laptop Table" },
      { name: "Universal Fast Charger & Multi-Plug Extension" },
      { name: "Automated GST Invoice / Corporate Tax Receipt" },
      { name: "Silent Workspace Guarantee" },
    ],
    freeFacilities: [
      "High-Speed Enterprise Wi-Fi",
      "Ergonomic Work Desk & Laptop Table",
      "Universal Fast Charger & Extension",
      "Automated GST Invoice / Tax Receipt",
      "Silent Workspace Guarantee",
    ],
    paidAddons: [
      {
        id: "airport-express-chauffeur",
        name: "Airport Express Chauffeur Transfer",
        price: 1200,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Executive express chauffeur transit between RGIA and Flatel.",
      },
      {
        id: "express-laundry-ironing",
        name: "Same-Day Express Laundry & Ironing",
        price: 500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Same-day express dry cleaning and formal ironing.",
      },
      {
        id: "executive-meal-subscription",
        name: "Healthy Executive Meal Subscription",
        price: 750,
        type: "per_night",
        pricingType: "per_night",
        requiresConfiguration: false,
        disclaimer: "Daily fresh executive homestyle lunches and dinners.",
      },
      {
        id: "priority-checkin-checkout",
        name: "Flexible Early Check-In / Late Check-Out",
        price: 500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Tailored arrival and departure timing window.",
      },
    ],
  },
  {
    id: "wedding",
    name: "Wedding Stay — Wedding Guests & Events",
    tagline: "Wedding guest housing, group accommodations & celebrations",
    complimentaryServices: [
      { name: "Wedding Guest Group Check-In & Luggage Coordination" },
      { name: "Heavy Garment Steamer & Full Vanity Mirror Setup" },
      { name: "Equipped Kitchen for Large Family Reheating & Chai" },
      { name: "Housekeeping on Alternate Days" },
      { name: "24/7 Wedding Logistics & Front Desk Support" },
    ],
    freeFacilities: [
      "Wedding Guest Group Check-In Coordination",
      "Heavy Garment Steamer & Vanity Setup",
      "Equipped Kitchen for Large Family Reheating",
      "Housekeeping on Alternate Days",
      "24/7 Wedding Logistics & Front Desk Support",
    ],
    paidAddons: [
      {
        id: "extra-floor-mattress",
        name: "Extra Floor Mattress / Rollaway Bed",
        price: 500,
        type: "per_night",
        pricingType: "per_night",
        requiresConfiguration: false,
        disclaimer: "Comfortable floor mattress with fresh duvet and hotel pillows.",
      },
      {
        id: "wedding-venue-booking",
        name: "Event Venue Booking Liaison",
        price: 2500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Discovery and booking coordination for banquet & convention halls.",
      },
      {
        id: "wedding-card-printing",
        name: "Wedding Card Printing & Delivery Liaison",
        price: 1200,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "End-to-end design framing, customized printing & flat delivery.",
      },
      {
        id: "bride-attire-coordination",
        name: "Bride's Attire Coordination & Boutique Liaison",
        price: 1500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Fabric sourcing, embroidery & boutique tailoring coordination.",
      },
      {
        id: "groom-attire-coordination",
        name: "Groom's Attire Coordination & Bespoke Tailoring",
        price: 1500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Design selection & sherwani tailoring coordination.",
      },
      {
        id: "wedding-stage-decor",
        name: "Stage & Suite Decoration Services",
        price: 4000,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Modern floral stage styling & celebratory suite decorations.",
      },
      {
        id: "luxury-wedding-cars",
        name: "Luxury Wedding Fleet Arrangement (Audi / Benz / Innova)",
        price: 3500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Transport fleet logistics for groom entrance and family transit.",
      },
      {
        id: "wedding-makeup-artist",
        name: "Professional Bridal Makeup Artist & Hair Styling",
        price: 2500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Top certified artist for bridal makeup, hair styling & draping.",
      },
      {
        id: "wedding-photography",
        name: "Photography & Cinematic Videography Coordination",
        price: 3500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Candid photographer, cinematic wedding highlight film & drone.",
      },
    ],
  },
  {
    id: "family",
    name: "Family Vacation & Long Stay",
    tagline: "Spacious multi-bedroom suites, full modular kitchens & family comforts",
    complimentaryServices: [
      { name: "Infant Baby Cot & High Chair" },
      { name: "Fully Equipped Modular Kitchen with Gas Stove & Staples" },
      { name: "Family Indoor Board Games (Carrom, Chess, Snakes & Ladders)" },
      { name: "Kids Outdoor Sports Equipment (Badminton, Football)" },
      { name: "Housekeeping on Alternate Days" },
      { name: "Smart TV with Streaming Apps" },
    ],
    freeFacilities: [
      "Infant Baby Cot & High Chair",
      "Fully Equipped Kitchen with Gas & Basic Staples",
      "Family Indoor Board Games (Carrom, Chess)",
      "Kids Outdoor Sports Equipment",
      "Housekeeping on Alternate Days",
      "Smart TV with Streaming Apps",
    ],
    paidAddons: [
      {
        id: "extra-floor-mattress",
        name: "Extra Floor Mattress / Rollaway Bed",
        price: 500,
        type: "per_night",
        pricingType: "per_night",
        requiresConfiguration: false,
        disclaimer: "Comfortable floor mattress with fresh duvet and hotel pillows.",
      },
      {
        id: "fam-grocery-prestock",
        name: "Grocery Pre-Stocking Prior to Check-In",
        price: 350,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Pre-stocked kitchen essentials and snacks ready before arrival (bill paid by guest).",
      },
      {
        id: "fam-home-cook",
        name: "Private Home Cook for Family Meals",
        price: 1200,
        type: "per_night",
        pricingType: "per_night",
        requiresConfiguration: false,
        disclaimer: "Dedicated private cook preparing breakfast, lunch, and dinner.",
      },
      {
        id: "fam-tempo-traveler",
        name: "Full-Day Sightseeing Innova / Tempo Traveler Booking",
        price: 4500,
        type: "flat",
        pricingType: "per_booking",
        requiresConfiguration: false,
        disclaimer: "Spacious 7-seater / 12-seater AC vehicle for family city excursions.",
      },
    ],
  },
];

/**
 * Authoritative Master Catalog of all Paid Addons across all 5 stay purposes
 */
export const ALL_MASTER_ADDONS: FacilityAddon[] = Array.from(
  new Map(
    PURPOSE_PACKAGES.flatMap((p) => p.paidAddons).map((addon) => [addon.id, addon])
  ).values()
);

export function getMasterAddonById(id: string): FacilityAddon | undefined {
  return ALL_MASTER_ADDONS.find((addon) => addon.id === id);
}

/**
 * Inventory Seed Data strictly matching final-prd.md Section 4
 * Default Units:
 * 1 BHK: 1 Unit, ₹2,000 / night, 2 Base Adults, up to 2 Extra Persons
 * 2 BHK: 1 Unit, ₹2,500 / night, 4 Base Adults, up to 2 Extra Persons
 * 3 BHK: 2 Units at Barkas, ₹3,000 / night, 6 Base Adults, up to 3 Extra Persons
 * 4 BHK: 1 Unit, ₹4,000 / night, 8 Base Adults, up to 4 Extra Persons
 * 5 BHK: Admin-created, custom pricing & occupancy
 * Extra adult fee: ₹500 / night
 * Children: included up to the base allowance (1 BHK 1, 2 BHK 2, 3 BHK 3, 4 BHK 4); extra children ₹300 / night
 */
export const MOCK_ROOMS: RoomDetail[] = [
  {
    id: "1bhk",
    slug: "1bhk",
    aliases: ["deluxe-1bhk", "1-bhk"],
    type: "1 BHK",
    category: "1BHK",
    title: "1 BHK Deluxe Suite",
    shortDescription:
      "A serene and stylish 1 BHK suite in Moghal Pura near Charminar, featuring a king-size master bed, living area with smart TV, equipped kitchen, and 24/7 hot water geyser.",
    basePricePerNight: 2000,
    baseAdults: 2,
    maxExtraGuests: 2,
    maxAdults: 4, // 2 base + 2 extra
    maxChildren: null,
    childCapacityStatus: "awaiting_owner_confirmation",
    extraPersonFeePerNight: 500,
    totalUnits: 1,
    branchSlug: "moghal-pura",
    capacityLabel: "2 Base Adults (+2 Extra Allowed) · 1 child included, extra ₹300/night",
    specs: {
      guests: "2 Base Adults (+2 Extra Allowed)",
      bedrooms: "1 Master Bedroom",
      kitchen: "Equipped Kitchenette",
      bathroom: "1 Private Bathroom",
    },
    gallery: [
      { id: "img-1", category: "Bedroom", alt: "1 BHK Luxury Master Bedroom with King Bed and Smart TV", url: "/images/flats/flat-1bhk-luxury.jpg" },
      { id: "img-2", category: "Kitchen", alt: "1 BHK Modular Kitchen with RO water and gas stove", url: "/images/amenity-kitchen-luxury.jpg" },
      { id: "img-3", category: "Living Area", alt: "1 BHK Cozy Living Corner and lounge space", url: "/images/flats/flat-1bhk.jpg" },
      { id: "img-4", category: "Exterior", alt: "Moghal Pura Branch historic location near Charminar", url: "/images/branch-moghal-pura.jpg" },
    ],
    amenities: [
      { name: "High-Speed Wi-Fi", description: "50+ Mbps dedicated fiber broadband", iconName: "Wifi" },
      { name: "Modular Kitchen", description: "Gas stove, fridge, cookware & RO water", iconName: "UtensilsCrossed" },
      { name: "Hot Water Geyser", description: "24/7 continuous hot water in bathroom", iconName: "Flame" },
      { name: "Smart Android TV", description: "HD display with streaming OTT apps", iconName: "Tv" },
      { name: "Refrigerator", description: "Double-door fridge with freezer", iconName: "Refrigerator" },
      { name: "Passenger Elevator", description: "Step-free ramp and lift to your floor", iconName: "ArrowUpDown" },
      { name: "24/7 Water Supply", description: "Purified drinking and dual water supply", iconName: "Droplets" },
      { name: "Power Backup", description: "100% inverter for lights and fans", iconName: "Zap" },
    ],
  },
  {
    id: "2bhk",
    slug: "2bhk",
    aliases: ["premium-2bhk", "2-bhk"],
    type: "2 BHK",
    category: "2BHK",
    title: "2 BHK Family Residence",
    shortDescription:
      "Spacious modern residence in Moghal Pura with 2 private bedrooms, plush living lounge, modular dining kitchen, and floor-to-ceiling windows with Hyderabad skyline views.",
    basePricePerNight: 2500,
    baseAdults: 4,
    maxExtraGuests: 2,
    maxAdults: 6, // 4 base + 2 extra
    maxChildren: null,
    childCapacityStatus: "awaiting_owner_confirmation",
    extraPersonFeePerNight: 500,
    totalUnits: 1,
    branchSlug: "moghal-pura",
    capacityLabel: "4 Base Adults (+2 Extra Allowed) · 2 children included, extra ₹300/night",
    specs: {
      guests: "4 Base Adults (+2 Extra Allowed)",
      bedrooms: "2 Private Bedrooms",
      kitchen: "Fully Equipped Kitchen",
      bathroom: "2 Bathrooms",
    },
    gallery: [
      { id: "img-1", category: "Living Area", alt: "2 BHK Designer Living Lounge with velvet sofa and city views", url: "/images/flats/flat-2bhk-luxury.jpg" },
      { id: "img-2", category: "Bedroom", alt: "2 BHK Master Suite with warm ambient lighting", url: "/images/flats/flat-1bhk-luxury.jpg" },
      { id: "img-3", category: "Kitchen", alt: "2 BHK Modular Chef-Ready Kitchen with breakfast bar", url: "/images/amenity-kitchen-luxury.jpg" },
      { id: "img-4", category: "Exterior", alt: "Moghal Pura Branch building facade and parking", url: "/images/branch-moghal-pura.jpg" },
    ],
    amenities: [
      { name: "High-Speed Wi-Fi", description: "50+ Mbps dedicated fiber broadband", iconName: "Wifi" },
      { name: "Modular Kitchen", description: "Gas stove, fridge, cookware & RO water", iconName: "UtensilsCrossed" },
      { name: "Hot Water Geyser", description: "24/7 continuous hot water in bathroom", iconName: "Flame" },
      { name: "Smart Android TV", description: "HD display with streaming OTT apps", iconName: "Tv" },
      { name: "Refrigerator", description: "Double-door fridge with freezer", iconName: "Refrigerator" },
      { name: "Passenger Elevator", description: "Step-free ramp and lift to your floor", iconName: "ArrowUpDown" },
      { name: "24/7 Water Supply", description: "Purified drinking and dual water supply", iconName: "Droplets" },
      { name: "Power Backup", description: "100% inverter for lights and fans", iconName: "Zap" },
    ],
  },
  {
    id: "3bhk",
    slug: "3bhk",
    aliases: ["grand-3bhk", "3-bhk"],
    type: "3 BHK",
    category: "3BHK",
    title: "3 BHK Grand Residence",
    shortDescription:
      "Expansive 3-bedroom family residence at Barkas Salala with large living-dining hall, scenic balcony, full modular kitchen, and instant transit to airport highway and hospitals.",
    basePricePerNight: 3000,
    baseAdults: 6,
    maxExtraGuests: 3,
    maxAdults: 9, // 6 base + 3 extra
    maxChildren: null,
    childCapacityStatus: "awaiting_owner_confirmation",
    extraPersonFeePerNight: 500,
    totalUnits: 2, // 2 Units at Barkas
    branchSlug: "barkas-salala",
    capacityLabel: "6 Base Adults (+3 Extra Allowed) · 3 children included, extra ₹300/night",
    specs: {
      guests: "6 Base Adults (+3 Extra Allowed)",
      bedrooms: "3 Private Bedrooms",
      kitchen: "Fully Furnished Kitchen",
      bathroom: "3 Bathrooms",
    },
    gallery: [
      { id: "img-1", category: "Living Area", alt: "3 BHK Grand Living & Dining Salon with scenic sunset balcony", url: "/images/flats/flat-3bhk-luxury.jpg" },
      { id: "img-2", category: "Living Area", alt: "3 BHK Plush Sofa Lounge with panoramic window view", url: "/images/branch-barkas-salala.jpg" },
      { id: "img-3", category: "Bedroom", alt: "3 BHK Master Suite with plush king bedding", url: "/images/branch-moghal-pura.jpg" },
      { id: "img-4", category: "Kitchen", alt: "3 BHK Large Modular Kitchen with refrigerator and stove", url: "/images/amenity-kitchen-luxury.jpg" },
    ],
    amenities: [
      { name: "High-Speed Wi-Fi", description: "50+ Mbps dedicated fiber broadband", iconName: "Wifi" },
      { name: "Modular Kitchen", description: "Gas stove, fridge, cookware & RO water", iconName: "UtensilsCrossed" },
      { name: "Hot Water Geyser", description: "24/7 continuous hot water in bathroom", iconName: "Flame" },
      { name: "Smart Android TV", description: "HD display with streaming OTT apps", iconName: "Tv" },
      { name: "Refrigerator", description: "Double-door fridge with freezer", iconName: "Refrigerator" },
      { name: "Passenger Elevator", description: "Step-free ramp and lift to your floor", iconName: "ArrowUpDown" },
      { name: "24/7 Water Supply", description: "Purified drinking and dual water supply", iconName: "Droplets" },
      { name: "Power Backup", description: "100% inverter for lights and fans", iconName: "Zap" },
    ],
  },
  {
    id: "4bhk",
    slug: "4bhk",
    aliases: ["luxury-4bhk", "4-bhk"],
    type: "4 BHK",
    category: "4BHK",
    title: "4 BHK Royal Penthouse",
    shortDescription:
      "Prestigious 4-bedroom presidential residence in Moghal Pura with marble floors, gold detailing, 4 en-suite bathrooms, huge dining salon, and private balcony overlooking Charminar.",
    basePricePerNight: 4000,
    baseAdults: 8,
    maxExtraGuests: 4,
    maxAdults: 12, // 8 base + 4 extra
    maxChildren: null,
    childCapacityStatus: "awaiting_owner_confirmation",
    extraPersonFeePerNight: 500,
    totalUnits: 1,
    branchSlug: "moghal-pura",
    capacityLabel: "8 Base Adults (+4 Extra Allowed) · 4 children included, extra ₹300/night",
    specs: {
      guests: "8 Base Adults (+4 Extra Allowed)",
      bedrooms: "4 Grand Bedrooms",
      kitchen: "Full Modular Kitchen",
      bathroom: "4 Bathrooms",
    },
    gallery: [
      { id: "img-1", category: "Living Area", alt: "4 BHK Grand Presidential Living Salon with balcony and chandelier", url: "/images/flats/flat-4bhk-luxury.jpg" },
      { id: "img-2", category: "Bedroom", alt: "4 BHK Master Presidential Suite", url: "/images/branch-moghal-pura.jpg" },
      { id: "img-3", category: "Living Area", alt: "4 BHK Sunlit Lounge and dining area", url: "/images/flats/flat-4bhk.jpg" },
      { id: "img-4", category: "Kitchen", alt: "4 BHK Executive Kitchen with full appliances and RO water", url: "/images/amenity-kitchen-luxury.jpg" },
    ],
    amenities: [
      { name: "High-Speed Wi-Fi", description: "50+ Mbps dedicated fiber broadband", iconName: "Wifi" },
      { name: "Modular Kitchen", description: "Gas stove, fridge, cookware & RO water", iconName: "UtensilsCrossed" },
      { name: "Hot Water Geyser", description: "24/7 continuous hot water in bathroom", iconName: "Flame" },
      { name: "Smart Android TV", description: "HD display with streaming OTT apps", iconName: "Tv" },
      { name: "Refrigerator", description: "Double-door fridge with freezer", iconName: "Refrigerator" },
      { name: "Passenger Elevator", description: "Step-free ramp and lift to your floor", iconName: "ArrowUpDown" },
      { name: "24/7 Water Supply", description: "Purified drinking and dual water supply", iconName: "Droplets" },
      { name: "Power Backup", description: "100% inverter for lights and fans", iconName: "Zap" },
    ],
  },
];

/**
 * 5 BHK Category Descriptor (Admin-configurable; no fabricated pricing)
 */
export const ADMIN_CONFIGURABLE_CATEGORIES = [
  {
    category: "5BHK",
    title: "5 BHK Luxury Residence",
    description: "Configured dynamically by Flatel Administration via Owner Admin Panel.",
    isAdminCreated: true,
  },
] as const;

export function getRoomById(id: string): RoomDetail | undefined {
  const normalized = id.toLowerCase().trim();
  return MOCK_ROOMS.find(
    (r) =>
      r.id === normalized ||
      r.slug === normalized ||
      (r.aliases && r.aliases.includes(normalized)) ||
      (normalized.includes("1") && r.category === "1BHK") ||
      (normalized.includes("2") && r.category === "2BHK") ||
      (normalized.includes("3") && r.category === "3BHK") ||
      (normalized.includes("4") && r.category === "4BHK")
  );
}

export function getRoomBySlug(slug: string): RoomDetail | undefined {
  return getRoomById(slug);
}

export function getRoomsByBranch(branchSlug: string): RoomDetail[] {
  const normalized = branchSlug.toLowerCase().trim();
  return MOCK_ROOMS.filter((r) => r.branchSlug === normalized);
}
