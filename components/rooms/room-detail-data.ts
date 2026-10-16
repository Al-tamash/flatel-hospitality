"use client";

import * as React from "react";
import {
  Users,
  BedDouble,
  UtensilsCrossed,
  Bath,
  Wifi,
  Wind,
  Zap,
  Droplets,
  ArrowUpDown,
  Car,
  Tv,
  Sparkles,
  Flame,
  CookingPot,
  Microwave,
  DoorClosed,
  Laptop,
  Shirt,
  ShieldCheck,
  Baby,
  HeartPulse,
  Compass,
  Briefcase,
  Bed,
  Activity,
  Accessibility,
  Ambulance,
  Soup,
  Stethoscope,
  Plane,
  Building2,
  Clock,
  PhoneCall,
  Scroll,
  FileText,
  Camera,
  Scissors,
  Palette,
  Package,
  Gift,
  Landmark,
  UserCheck,
  Heart,
} from "lucide-react";


// 4 Distinct Stay Purposes with authentic brochure mappings (Images 2, 3, 4)
// 5 Distinct Stay Purposes with authentic brochure mappings
export interface TailoredService {
  id: string;
  number?: string;
  title: string;
  shortDesc: string;
  type: "free" | "addon";
  addonId?: string;
  price?: number;
  priceUnit?: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  part: "part1" | "part2";
  isRequestBased?: boolean;
  requiresConfirmation?: boolean;
  eligibilityNote?: string;
}

export interface PurposeConfig {
  id: "medical" | "wedding" | "tourism" | "corporate" | "family";
  label: string;
  shortLabel: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
  brochureImg: string;
  chartTitle?: string;
  services: TailoredService[];
}

export const PURPOSE_CONFIGS: PurposeConfig[] = [
  {
    id: "medical",
    label: "Hospital & Medical Stay",
    shortLabel: "Hospital & Medical",
    badge: "19 HOSPITAL CARE INCLUSIONS • 24/7 AMBULANCE LIAISON",
    icon: HeartPulse,
    tagline: "Patients, doctors & healthcare visits",
    description:
      "Specially configured for patients and attendants visiting Hyderabad's premier hospitals (Apollo, KIMS, Owaisi, Princess Esra, AIG).",
    brochureImg: "/images/services/hospital-services-brochure.jpg",
    chartTitle: "Hospital & Doctor Services [Part 1] & Guest Wellness [Part 2]",
    services: [
      // Part 1: Hospital & Doctor Services (Complimentary)
      {
        id: "med-01",
        number: "01",
        title: "Doctor Appointments Assistance",
        shortDesc: "Logistics, scheduling & doctor liaison",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Stethoscope,
        part: "part1",
        eligibilityNote: "Complimentary coordination with hospital desks",
      },
      {
        id: "med-02",
        number: "02",
        title: "Hospital Distance & Route Timing",
        shortDesc: "Proximity mapping & quick routes to key hospitals",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Compass,
        part: "part1",
        eligibilityNote: "Included in suite information guide",
      },
      {
        id: "med-03",
        number: "03",
        title: "24/7 Ambulance Coordination Desk",
        shortDesc: "Immediate emergency hospital response team",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Ambulance,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Coordination is complimentary (₹0); ambulance transit fee paid directly to provider if dispatched",
      },
      {
        id: "med-04",
        number: "04",
        title: "24/7 Dedicated Guest Assistance",
        shortDesc: "Round-the-clock on-site support staff",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: PhoneCall,
        part: "part1",
        eligibilityNote: "24/7 on-site front desk available for attendants",
      },
      {
        id: "med-05",
        number: "05",
        title: "Pharmacy Flatel Express Delivery",
        shortDesc: "In-room prescription medication delivery",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Package,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Delivery coordination is ₹0 extra; medicine pharmacy bill paid directly by guest",
      },
      {
        id: "med-06",
        number: "06",
        title: "Wheelchair Assistance & Lift Ramp",
        shortDesc: "On-site mobility equipment & ramp access",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Accessibility,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Request upon check-in; subject to on-site inventory",
      },
      {
        id: "med-07",
        number: "07",
        title: "Hospital Bed Setup Assistance",
        shortDesc: "Clinical bed support & private kitchen for patient diets",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Bed,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Request requiring confirmation prior to arrival",
      },
      {
        id: "med-08",
        number: "08",
        title: "Glucose Stand (IV Stand)",
        shortDesc: "Support stand for intravenous fluids",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Activity,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Request upon arrival; provided in-suite",
      },
      {
        id: "med-09",
        number: "09",
        title: "Digital Blood Sugar Machine",
        shortDesc: "Digital glucometer for instant sugar checks",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Activity,
        part: "part1",
        eligibilityNote: "Sterilized device provided in wellness kit",
      },
      {
        id: "med-10",
        number: "10",
        title: "Digital BP Machine",
        shortDesc: "Automatic blood pressure monitor",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: HeartPulse,
        part: "part1",
        eligibilityNote: "Included in medical kit in flat",
      },
      // Part 2: Guest Wellness & Concierge (Image 2)
      {
        id: "med-11",
        number: "11",
        title: "Fingertip Pulse Oximeter",
        shortDesc: "Vital sign blood oxygen monitoring",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Activity,
        part: "part2",
        eligibilityNote: "Included in medical kit in flat",
      },
      {
        id: "med-12",
        number: "12",
        title: "First-Aid Emergency Kit",
        shortDesc: "Sterilized bandages & emergency supplies",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: ShieldCheck,
        part: "part2",
        eligibilityNote: "Pre-stocked in residential suite",
      },
      {
        id: "med-13",
        number: "13",
        title: "Professional Relaxation Massagers",
        shortDesc: "Hand & leg recovery massagers for attendants",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Sparkles,
        part: "part2",
        isRequestBased: true,
        eligibilityNote: "Request upon arrival; subject to inventory",
      },
      // Optional Paid Add-ons (Explicitly selectable)
      {
        id: "med-14",
        number: "14",
        title: "Dedicated Doctor / Nurse Visits",
        shortDesc: "On-call visiting doctor & wound dressing",
        type: "addon",
        addonId: "doctor-nurse-visits",
        price: 1500,
        priceUnit: "/ visit",
        badge: "₹1,500 / VISIT",
        icon: Stethoscope,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "med-15",
        number: "15",
        title: "Medical Oxygen Concentrator / Cylinder",
        shortDesc: "Continuous oxygen therapy support setup",
        type: "addon",
        addonId: "oxygen-concentrator",
        price: 2500,
        priceUnit: "/ setup",
        badge: "₹2,500 SETUP",
        icon: Wind,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "med-16",
        number: "16",
        title: "Diet-Specific Meal Preparation",
        shortDesc: "Doctor-prescribed nutrition & diet meals",
        type: "addon",
        addonId: "patient-meal-prep",
        price: 600,
        priceUnit: "/ night",
        badge: "₹600 / NIGHT",
        icon: Soup,
        part: "part2",
      },
      {
        id: "med-17",
        number: "17",
        title: "Priority Check-In & Check-Out",
        shortDesc: "Flexible arrival & departure window",
        type: "addon",
        addonId: "priority-check-in",
        price: 500,
        priceUnit: "flat",
        badge: "₹500 FLAT",
        icon: Clock,
        part: "part2",
      },
      {
        id: "med-18",
        number: "18",
        title: "Chauffeur Hospital Transit Cab",
        shortDesc: "Sanitized AC car for clinic appointments",
        type: "addon",
        addonId: "hospital-cab-transfer",
        price: 800,
        priceUnit: "/ round-trip",
        badge: "₹800 / TRIP",
        icon: Car,
        part: "part2",
      },
    ],
  },
  {
    id: "wedding",
    label: "Wedding Stay & Celebrations",
    shortLabel: "Wedding Stay",
    badge: "WEDDING GROUP HOUSING & ON-SITE SUPPORT",
    icon: Heart,
    tagline: "Dedicated wedding support, group guest housing & celebratory suites",
    description:
      "House your wedding relatives together under one shared roof. Enjoy group guest check-in, bridal vanity setups, and dedicated liaison for banquet halls, attire tailoring, and luxury fleets.",
    brochureImg: "/images/wedding/flatel-royal-wedding.jpg",
    chartTitle: "Wedding Inclusions & Optional Support Services",
    services: [
      // In-Suite Complimentary Inclusions
      {
        id: "wed-steam",
        number: "★",
        title: "Heavy Garment Steamer & Vanity Setup",
        shortDesc: "High-wattage steamer for lehengas & suits",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Sparkles,
        part: "part1",
        eligibilityNote: "Included in bridal & family suites",
      },
      {
        id: "wed-kitchen",
        number: "★",
        title: "Equipped Kitchen for Large Family Reheating",
        shortDesc: "Full gas stove & double-door fridge for feasts and chai",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: CookingPot,
        part: "part1",
        eligibilityNote: "Standard modular kitchen inclusion",
      },
      {
        id: "wed-desk",
        number: "★",
        title: "Wedding Guest Group Coordinator Desk",
        shortDesc: "Single contact for family room keys & baggage",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Users,
        part: "part1",
        eligibilityNote: "Turnkey coordination for multiple booked units",
      },
      {
        id: "wed-clean",
        number: "★",
        title: "Housekeeping on Alternate Days",
        shortDesc: "Regular sanitization and upkeep of family residences",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: ShieldCheck,
        part: "part1",
        eligibilityNote: "Scheduled alternate-day service",
      },
      {
        id: "wed-cot",
        number: "★",
        title: "Infant Baby Cot & High Chair",
        shortDesc: "Child-safe sterilized cot for visiting families",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Baby,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Request upon arrival; subject to inventory",
      },
      // Optional Paid Wedding Concierge Add-ons
      {
        id: "wed-mattress",
        number: "★",
        title: "Extra Floor Mattress / Rollaway Bed",
        shortDesc: "Comfortable extra bed with hotel linens",
        type: "addon",
        addonId: "extra-floor-mattress",
        price: 500,
        priceUnit: "/ night",
        badge: "₹500 / NIGHT",
        icon: BedDouble,
        part: "part2",
      },
      {
        id: "wed-01",
        number: "01",
        title: "Event Venue Booking Liaison",
        shortDesc: "Function Halls, Banquets & Convention Halls",
        type: "addon",
        addonId: "wedding-venue-booking",
        price: 2500,
        priceUnit: "flat",
        badge: "₹2,500 LIAISON",
        icon: Building2,
        part: "part1",
        requiresConfirmation: true,
      },
      {
        id: "wed-02",
        number: "02",
        title: "Wedding Card Printing Services",
        shortDesc: "End-to-end design, framing & custom printing",
        type: "addon",
        addonId: "wedding-card-printing",
        price: 1200,
        priceUnit: "flat",
        badge: "₹1,200 PRINTING",
        icon: FileText,
        part: "part1",
        requiresConfirmation: true,
      },
      {
        id: "wed-03",
        number: "03",
        title: "Bride's Attire Coordination",
        shortDesc: "Fabric selection, embroidery & bridal tailoring",
        type: "addon",
        addonId: "bride-attire-coordination",
        price: 1500,
        priceUnit: "flat",
        badge: "₹1,500 BOUTIQUE",
        icon: Sparkles,
        part: "part1",
        requiresConfirmation: true,
      },
      {
        id: "wed-04",
        number: "04",
        title: "Groom's Attire Coordination",
        shortDesc: "Design selection & bespoke sherwani tailoring",
        type: "addon",
        addonId: "groom-attire-coordination",
        price: 1500,
        priceUnit: "flat",
        badge: "₹1,500 TAILORING",
        icon: Shirt,
        part: "part1",
        requiresConfirmation: true,
      },
      {
        id: "wed-09",
        number: "09",
        title: "Stage Decoration Services",
        shortDesc: "Floral stage designs & modern lighting setups",
        type: "addon",
        addonId: "wedding-stage-decor",
        price: 4000,
        priceUnit: "flat",
        badge: "₹4,000 STYLING",
        icon: Sparkles,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-10",
        number: "10",
        title: "Wedding Room & Bridal Suite Décor",
        shortDesc: "Romantic floral styling for bridal suite",
        type: "addon",
        addonId: "wedding-room-decor",
        price: 2000,
        priceUnit: "flat",
        badge: "₹2,000 DÉCOR",
        icon: BedDouble,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-11",
        number: "11",
        title: "Car Arrangement (7-Seater & Luxury Fleet)",
        shortDesc: "Audi, BMW, Benz & guest transport fleet",
        type: "addon",
        addonId: "luxury-wedding-cars",
        price: 3500,
        priceUnit: "flat",
        badge: "₹3,500 FLEET",
        icon: Car,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-12",
        number: "12",
        title: "Wedding Car Decoration Services",
        shortDesc: "Floral, net & ribbon styling for entry vehicle",
        type: "addon",
        addonId: "wedding-car-decor",
        price: 1500,
        priceUnit: "flat",
        badge: "₹1,500 FLORAL",
        icon: Gift,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-13",
        number: "13",
        title: "Professional Bridal Makeup & Hair",
        shortDesc: "Top certified artists for makeup & draping",
        type: "addon",
        addonId: "wedding-makeup-artist",
        price: 2500,
        priceUnit: "flat",
        badge: "₹2,500 ARTIST",
        icon: Palette,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-14",
        number: "14",
        title: "Grooming for the Groom",
        shortDesc: "Complete salon haircut, beard styling & grooming",
        type: "addon",
        addonId: "groom-grooming",
        price: 1500,
        priceUnit: "flat",
        badge: "₹1,500 SALON",
        icon: Scissors,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-15",
        number: "15",
        title: "Photography & Videography Coordination",
        shortDesc: "Candid photography, cinematic films & drone",
        type: "addon",
        addonId: "wedding-photography",
        price: 3500,
        priceUnit: "flat",
        badge: "₹3,500 MEDIA",
        icon: Camera,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-16",
        number: "16",
        title: "Wedding Guest Welcome Desk & Host",
        shortDesc: "Guest welcome desk & event schedule coordination",
        type: "addon",
        addonId: "wedding-concierge",
        price: 2500,
        priceUnit: "flat",
        badge: "₹2,500 ON-SITE HOST",
        icon: UserCheck,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "wed-17",
        number: "17",
        title: "Wedding Packing & Guest Gift Services",
        shortDesc: "Trousseau packaging & custom gift packets",
        type: "addon",
        addonId: "wedding-packing-gifts",
        price: 1500,
        priceUnit: "flat",
        badge: "₹1,500 PACKING",
        icon: Package,
        part: "part2",
        requiresConfirmation: true,
      },
    ],
  },
  {
    id: "family",
    label: "Family Vacation & Long Stay",
    shortLabel: "Family & Long Stay",
    badge: "MODULAR KITCHEN • BABY COT • EXTENDED DISCOUNTS",
    icon: Users,
    tagline: "Spacious multi-bedroom suites & duration discounts up to 25%",
    description:
      "Vacationing with children or staying for an extended visit? Enjoy fully equipped private modular kitchens, infant baby cots, kids games, and automatic duration discounts (10% weekly, 25% monthly).",
    brochureImg: "/images/flats/flat-3bhk-luxury.jpg",
    chartTitle: "In-Flat Family Essentials & Extended Stay Add-Ons",
    services: [
      // Complimentary Inclusions
      {
        id: "fam-cot",
        number: "★",
        title: "Infant Baby Cot & High Chair",
        shortDesc: "Sterilized baby cot with clean mattress & booster chair",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Baby,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Request upon arrival; provided in suite",
      },
      {
        id: "fam-kitchen",
        number: "★",
        title: "Equipped Modular Kitchen with Gas Stove",
        shortDesc: "Double-door fridge, RO water, microwave, mixer & basic spices",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: CookingPot,
        part: "part1",
        eligibilityNote: "Standard modular kitchen inclusion",
      },
      {
        id: "fam-games",
        number: "★",
        title: "Family Indoor Board Games",
        shortDesc: "Carrom board, chess & snakes and ladders for family bonding",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Sparkles,
        part: "part1",
        eligibilityNote: "Available in flat for family leisure",
      },
      {
        id: "fam-sports",
        number: "★",
        title: "Kids Sports Equipment",
        shortDesc: "Badminton rackets, shuttlecocks & football kit for kids",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Activity,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Request upon check-in; subject to availability",
      },
      {
        id: "fam-clean",
        number: "★",
        title: "Alternate-Day Housekeeping",
        shortDesc: "Routine sanitization, dust removal & clean bathroom upkeep",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: ShieldCheck,
        part: "part1",
        eligibilityNote: "Standard schedule across all stays",
      },
      {
        id: "fam-tv",
        number: "★",
        title: "Smart TV with OTT Apps",
        shortDesc: "High-definition streaming entertainment with fiber Wi-Fi",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Tv,
        part: "part1",
        eligibilityNote: "Included in master living lounge",
      },
      // Paid Family Add-ons
      {
        id: "fam-mattress",
        number: "★",
        title: "Extra Floor Mattress / Rollaway Bed",
        shortDesc: "Comfortable extra bed with hotel linens & duvet",
        type: "addon",
        addonId: "extra-floor-mattress",
        price: 500,
        priceUnit: "/ night",
        badge: "₹500 / NIGHT",
        icon: BedDouble,
        part: "part2",
      },
      {
        id: "fam-grocery",
        number: "01",
        title: "Grocery Pre-Stocking Prior to Check-In",
        shortDesc: "Kitchen stocked with milk, bread, fruits & snacks before arrival",
        type: "addon",
        addonId: "fam-grocery-prestock",
        price: 350,
        priceUnit: "flat",
        badge: "₹350 SERVICE",
        icon: Package,
        part: "part2",
      },
      {
        id: "fam-cook",
        number: "02",
        title: "Private Home Cook for Family Meals",
        shortDesc: "Dedicated cook preparing fresh home-cooked meals daily",
        type: "addon",
        addonId: "fam-home-cook",
        price: 1200,
        priceUnit: "/ night",
        badge: "₹1,200 / NIGHT",
        icon: UtensilsCrossed,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "fam-tempo",
        number: "03",
        title: "Full-Day Sightseeing Innova / Tempo Traveler",
        shortDesc: "Spacious AC vehicle for multi-generational family day excursions",
        type: "addon",
        addonId: "fam-tempo-traveler",
        price: 4500,
        priceUnit: "flat",
        badge: "₹4,500 / DAY",
        icon: Car,
        part: "part2",
        requiresConfirmation: true,
      },
    ],
  },
  {
    id: "tourism",
    label: "Leisure & Heritage Tourism",
    shortLabel: "Tourism & Heritage",
    badge: "12 HISTORIC SIGHTS • PRIVATE CHAUFFEUR FLEET",
    icon: Compass,
    tagline: "Charminar, shopping & Old City heritage",
    description:
      "Explore Hyderabad's heritage sites, including Charminar, Chowmahalla Palace, and Laad Bazaar. Chauffeur-driven sightseeing is available as a paid add-on.",
    brochureImg: "/images/services/tourism-services-brochure.jpg",
    chartTitle: "City Destinations & Experiences | Premium Services & Logistics",
    services: [
      // Complimentary Guides & Inclusions
      {
        id: "tour-01",
        number: "01",
        title: "Heritage Splendour Trail Guide",
        shortDesc: "Charminar, Mecca Masjid & Golconda Fort routing",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Landmark,
        part: "part1",
        eligibilityNote: "Included city itinerary guide",
      },
      {
        id: "tour-02",
        number: "02",
        title: "Vintage Elegance & Royal Palaces Map",
        shortDesc: "Chowmahalla Palace & Salar Jung Museum timing plan",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Building2,
        part: "part1",
        eligibilityNote: "Included in welcome brochure",
      },
      {
        id: "tour-04",
        number: "03",
        title: "Customized Itinerary Planning",
        shortDesc: "Tailored day-by-day monument timing plan",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Scroll,
        part: "part1",
        eligibilityNote: "Front desk route assistance",
      },
      {
        id: "tour-05",
        number: "04",
        title: "Luggage Holding & Flexible Departure",
        shortDesc: "Secure storage tailored around tour schedules",
        type: "free",
        badge: "ON REQUEST · ₹0",
        icon: Clock,
        part: "part1",
        isRequestBased: true,
        eligibilityNote: "Available at property desk on arrival/departure",
      },
      {
        id: "tour-06",
        number: "05",
        title: "Old City Food & Chai Trail Guide",
        shortDesc: "Authentic Dum Biryani, Irani Chai & pearl shops",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Soup,
        part: "part1",
        eligibilityNote: "Curated local food recommendation list",
      },
      // Paid Logistics & Add-ons
      {
        id: "tour-07",
        number: "06",
        title: "Airport Pick-up & Drop (Expressway)",
        shortDesc: "Flight-tracked private AC transit to RGIA",
        type: "addon",
        addonId: "airport-station-transfer",
        price: 1200,
        priceUnit: "/ trip",
        badge: "₹1,200 / TRIP",
        icon: Plane,
        part: "part2",
      },
      {
        id: "tour-08",
        number: "07",
        title: "Chauffeur-Driven Full-Day Sightseeing",
        shortDesc: "Dedicated AC Sedan or Innova with vetted driver",
        type: "addon",
        addonId: "full-day-sightseeing-cab",
        price: 3000,
        priceUnit: "/ day",
        badge: "₹3,000 / DAY",
        icon: Car,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "tour-09",
        number: "08",
        title: "Expert Multilingual Local Guide",
        shortDesc: "Certified cultural storyteller for Charminar",
        type: "addon",
        addonId: "expert-local-guide",
        price: 1500,
        priceUnit: "flat",
        badge: "₹1,500 GUIDE",
        icon: UserCheck,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "tour-10",
        number: "09",
        title: "Full-Day Professional Photography",
        shortDesc: "Candid personal photographer for vacation",
        type: "addon",
        addonId: "pro-photography-tour",
        price: 2500,
        priceUnit: "flat",
        badge: "₹2,500 PHOTO",
        icon: Camera,
        part: "part2",
        requiresConfirmation: true,
      },
      {
        id: "tour-11",
        number: "10",
        title: "Authentic Hyderabadi Breakfast Hamper",
        shortDesc: "Hot morning Irani breakfast delivered to flat",
        type: "addon",
        addonId: "breakfast-hamper",
        price: 450,
        priceUnit: "/ night",
        badge: "₹450 / NIGHT",
        icon: UtensilsCrossed,
        part: "part2",
      },
    ],
  },
  {
    id: "corporate",
    label: "Corporate Executive Suites",
    shortLabel: "Corporate Suites",
    badge: "HIGH-SPEED FIBER WI-FI • AUTOMATED GST INVOICE",
    icon: Briefcase,
    tagline: "Remote work, work desk & GST invoices",
    description:
      "Engineered for business executives, consultants, and remote teams. Enjoy reliable high-speed fiber internet, ergonomic work desk, quiet top-floor suites, and automated company tax invoices.",
    brochureImg: "/images/services/hospital-services-brochure.jpg",
    chartTitle: "Corporate Executive Amenities & Support",
    services: [
      // Complimentary Inclusions
      {
        id: "corp-01",
        number: "01",
        title: "High-Speed Fiber Wi-Fi (50+ Mbps)",
        shortDesc: "Low-latency broadband for Zoom/Teams calls",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Wifi,
        part: "part1",
        eligibilityNote: "Dedicated in-suite fiber broadband connection",
      },
      {
        id: "corp-02",
        number: "02",
        title: "Ergonomic Workstation & Multi-Plug",
        shortDesc: "Dedicated laptop desk & universal surge strip",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Laptop,
        part: "part1",
        eligibilityNote: "Included in master suite work corner",
      },
      {
        id: "corp-03",
        number: "03",
        title: "Automated GST Corporate Tax Invoice",
        shortDesc: "Instant business invoice with company GSTIN",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: Scroll,
        part: "part1",
        eligibilityNote: "Issued on booking confirmation with company GSTIN",
      },
      {
        id: "corp-04",
        number: "04",
        title: "Silent Floor Guarantee for Focus",
        shortDesc: "Peaceful upper-floor allocation away from street",
        type: "free",
        badge: "INCLUDED · ₹0",
        icon: ShieldCheck,
        part: "part1",
        eligibilityNote: "Allocated subject to floor availability",
      },
      // Paid Corporate Add-ons
      {
        id: "corp-05",
        number: "05",
        title: "Airport Express Chauffeur Transfer",
        shortDesc: "Airport transfer by chauffeur-driven vehicle",
        type: "addon",
        addonId: "airport-express-chauffeur",
        price: 1200,
        priceUnit: "/ trip",
        badge: "₹1,200 / TRIP",
        icon: Plane,
        part: "part2",
      },
      {
        id: "corp-06",
        number: "06",
        title: "Same-Day Express Laundry & Ironing",
        shortDesc: "Prompt pressing & dry-cleaning for formals",
        type: "addon",
        addonId: "express-laundry-ironing",
        price: 500,
        priceUnit: "flat",
        badge: "₹500 LAUNDRY",
        icon: Shirt,
        part: "part2",
      },
      {
        id: "corp-07",
        number: "07",
        title: "Healthy Executive Meal Subscription",
        shortDesc: "Freshly prepared wholesome homestyle meals",
        type: "addon",
        addonId: "executive-meal-subscription",
        price: 750,
        priceUnit: "/ night",
        badge: "₹750 / NIGHT",
        icon: Soup,
        part: "part2",
      },
      {
        id: "corp-08",
        number: "08",
        title: "Flexible Early Check-In / Late Check-Out",
        shortDesc: "Tailored arrival & departure timing window",
        type: "addon",
        addonId: "priority-checkin-checkout",
        price: 500,
        priceUnit: "flat",
        badge: "₹500 FLEXIBLE",
        icon: Clock,
        part: "part2",
        requiresConfirmation: true,
      },
    ],
  },
];

export const TOURISM_DESTINATION_CATEGORIES = [
  {
    category: "heritage",
    title: "Heritage Splendour",
    badge: "HISTORIC CORE",
    places: [
      { name: "Charminar", desc: "1591 Monument & Bazaar" },
      { name: "Mecca Masjid", desc: "Grand Granite Mosque" },
      { name: "Chowmahalla Palace", desc: "Nizam's Royal Seat" },
      { name: "Golconda Fort", desc: "Medieval Acoustic Citadel" },
    ],
  },
  {
    category: "vintage",
    title: "Vintage Elegance & Culture",
    badge: "ROYAL TREASURIES",
    places: [
      { name: "Qutb Shahi Tombs", desc: "Royal Domed Necropolis" },
      { name: "Purani Haveli", desc: "Nizam Wardrobe Museum" },
      { name: "Taramati Baradari", desc: "Historic Music Pavilion" },
      { name: "Salar Jung Museum", desc: "World Antique Treasury" },
    ],
  },
  {
    category: "entertainment",
    title: "Entertainment & Local Bazaars",
    badge: "SHOPPING & SAFARI",
    places: [
      { name: "Ramoji Film City", desc: "World Film Studio Tour" },
      { name: "Nehru Zoological Park", desc: "380-Acre Safari Park" },
      { name: "Shilparamam", desc: "Arts & Cultural Village" },
      { name: "Laad Bazaar", desc: "Famous Pearls & Bangles" },
    ],
  },
];

// 6 Approved Categories Supported Strictly by Real Data (final-prd.md Section 5)
export const AMENITIES_BENTO = [
  {
    category: "Kitchen",
    icon: UtensilsCrossed,
    description: "Fully equipped private modular kitchen with cooking appliances and basics",
    items: [
      { name: "Double-Door Refrigerator", icon: UtensilsCrossed },
      { name: "RO Water Purifier (Safe Drinking Water)", icon: Droplets },
      { name: "Gas Stove with Piped/Cylinder Gas", icon: Flame },
      { name: "Microwave Oven & Electric Kettle", icon: Microwave },
      { name: "Cookware, Pans, Plates & Cutlery", icon: CookingPot },
      { name: "Complimentary Kitchen Staples (Tea, Sugar, Salt)", icon: Sparkles },
    ],
  },
  {
    category: "Comfort",
    icon: BedDouble,
    description: "Air-conditioned bedrooms with hotel bedding, storage & entertainment",
    items: [
      { name: "Split Air Conditioning (AC) in Bedrooms", icon: Wind },
      { name: "Sanitized Hotel Linens, Comforters & Pillows", icon: Sparkles },
      { name: "Smart TV with OTT Streaming (Netflix, YouTube)", icon: Tv },
      { name: "Spacious Wardrobe & Luggage Storage", icon: DoorClosed },
      { name: "Ergonomic Laptop Work Desk", icon: Laptop },
    ],
  },
  {
    category: "Connectivity",
    icon: Wifi,
    description: "Dedicated fiber broadband and universal power access",
    items: [
      { name: "High-Speed Fiber Wi-Fi (50+ Mbps Dedicated)", icon: Wifi },
      { name: "Universal Mobile Chargers & Surge Multi-Plug", icon: Zap },
    ],
  },
  {
    category: "Bathroom",
    icon: Bath,
    description: "Private bathrooms with constant hot water and fresh hygiene kits",
    items: [
      { name: "Water Softening Geyser (24/7 Hot Water)", icon: Droplets },
      { name: "Fresh Bath Towels & Sanitized Toiletries", icon: Sparkles },
      { name: "Dual 24/7 Municipal & Borewell Water Supply", icon: Droplets },
    ],
  },
  {
    category: "Housekeeping",
    icon: Clock,
    description: "Scheduled hygiene maintenance and in-unit laundry convenience",
    items: [
      { name: "Alternate-Day Housekeeping & Sanitization", icon: ShieldCheck },
      { name: "In-Unit / On-Demand Washing Machine Support", icon: Shirt },
    ],
  },
  {
    category: "Safety & Building",
    icon: ShieldCheck,
    description: "Inverter power backup and security in common areas",
    items: [
      { name: "Inverter Power Backup", icon: Zap },
      { name: "Passenger Elevator", icon: ArrowUpDown },
      { name: "Parking", icon: Car },
      { name: "24/7 CCTV & Secure Entry Access", icon: ShieldCheck },
    ],
  },
];

export const STAY_PURPOSE_ILLUSTRATIONS = {
  medical: "/images/purposes/purpose-medistay.jpg",
  wedding: "/images/purposes/purpose-wedding.jpg",
  family: "/images/purposes/purpose-family.jpg",
  tourism: "/images/purposes/purpose-wanderer.jpg",
  corporate: "/images/purposes/purpose-corporate.jpg",
} as const;

/**
 * 3D Illustrated Amenity Mapping
 * Returns high-resolution, softly rendered 3D miniature object asset path
 */
export function getAmenityIllustration(nameOrCategory: string): string {
  const lower = (nameOrCategory || "").toLowerCase();

  if (
    lower.includes("wi-fi") ||
    lower.includes("wifi") ||
    lower.includes("broadband") ||
    lower.includes("internet") ||
    lower.includes("connectivity")
  ) {
    return "/images/amenities/icon-high-speed-wifi.png";
  }
  if (
    lower.includes("ac") ||
    lower.includes("air condition") ||
    lower.includes("climate") ||
    lower.includes("split air")
  ) {
    return "/images/amenities/icon-air-conditioning.png";
  }
  if (
    lower.includes("washing") ||
    lower.includes("laundry") ||
    lower.includes("clothes") ||
    lower.includes("dryer")
  ) {
    return "/images/amenities/icon-laundry-washing.png";
  }
  if (
    lower.includes("parking") ||
    lower.includes("car") ||
    lower.includes("garage") ||
    lower.includes("vehicle")
  ) {
    return "/images/amenities/icon-parking.png";
  }
  if (
    lower.includes("housekeeping") ||
    lower.includes("sanitization") ||
    lower.includes("cleaning") ||
    lower.includes("maid")
  ) {
    return "/images/amenities/icon-housekeeping.png";
  }
  if (
    lower.includes("inverter") ||
    lower.includes("power") ||
    lower.includes("backup") ||
    lower.includes("blackout") ||
    lower.includes("electricity") ||
    lower.includes("charger") ||
    lower.includes("plug")
  ) {
    return "/images/amenities/icon-power-backup.png";
  }
  if (
    lower.includes("elevator") ||
    lower.includes("lift") ||
    lower.includes("ramp") ||
    lower.includes("step-free")
  ) {
    return "/images/amenities/icon-elevator.png";
  }
  if (lower.includes("refrigerator") || lower.includes("fridge")) {
    return "/images/amenities/icon-refrigerator.png";
  }
  if (
    lower.includes("microwave") ||
    lower.includes("kettle") ||
    lower.includes("toaster") ||
    lower.includes("cooker") ||
    lower.includes("mixer")
  ) {
    return "/images/amenities/icon-microwave.png";
  }
  if (
    lower.includes("kitchen") ||
    lower.includes("stove") ||
    lower.includes("gas") ||
    lower.includes("cookware") ||
    lower.includes("staples")
  ) {
    return "/images/amenities/icon-kitchen-dining.png";
  }
  if (
    lower.includes("hot water") ||
    lower.includes("geyser") ||
    lower.includes("purifier") ||
    lower.includes("ro water") ||
    lower.includes("water supply")
  ) {
    return "/images/amenities/icon-hot-water.png";
  }
  if (
    lower.includes("tv") ||
    lower.includes("television") ||
    lower.includes("netflix") ||
    lower.includes("streaming") ||
    lower.includes("ott")
  ) {
    return "/images/amenities/icon-smart-tv.png";
  }
  if (
    lower.includes("wardrobe") ||
    lower.includes("linen") ||
    lower.includes("pillow") ||
    lower.includes("bed") ||
    lower.includes("comforter") ||
    lower.includes("comfort")
  ) {
    return "/images/amenities/icon-bedroom-comfort.png";
  }
  if (
    lower.includes("bathroom") ||
    lower.includes("bath") ||
    lower.includes("towel") ||
    lower.includes("toilet") ||
    lower.includes("hygiene")
  ) {
    return "/images/amenities/icon-bathroom-care.png";
  }
  if (
    lower.includes("desk") ||
    lower.includes("laptop") ||
    lower.includes("workstation") ||
    lower.includes("work")
  ) {
    return "/images/amenities/icon-work-desk.png";
  }
  if (
    lower.includes("security") ||
    lower.includes("cctv") ||
    lower.includes("safety") ||
    lower.includes("entry")
  ) {
    return "/images/amenities/icon-security-24-7.png";
  }
  if (
    lower.includes("concierge") ||
    lower.includes("doctor") ||
    lower.includes("appointment") ||
    lower.includes("assistance") ||
    lower.includes("liaison")
  ) {
    return "/images/amenities/icon-concierge-service.png";
  }
  if (
    lower.includes("dining") ||
    lower.includes("cutlery") ||
    lower.includes("plates")
  ) {
    return "/images/amenities/icon-dining-space.png";
  }
  if (
    lower.includes("play") ||
    lower.includes("cot") ||
    lower.includes("baby") ||
    lower.includes("kids") ||
    lower.includes("game")
  ) {
    return "/images/amenities/icon-children-play-area.png";
  }
  if (
    lower.includes("fitness") ||
    lower.includes("wellness") ||
    lower.includes("massage") ||
    lower.includes("gym")
  ) {
    return "/images/amenities/icon-fitness-wellness.png";
  }
  if (lower.includes("living") || lower.includes("lounge")) {
    return "/images/amenities/icon-living-room.png";
  }

  return "/images/amenities/icon-bedroom-comfort.png";
}

