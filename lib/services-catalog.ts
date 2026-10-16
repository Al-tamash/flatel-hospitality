export interface MedicalServiceItem {
  id: string;
  number: string;
  title: string;
  category: "logistics" | "equipment" | "monitoring" | "premium_care";
  description: string;
  pricingType: "FREE" | "PAID";
  tag: string;
  iconName: string;
}

export interface WeddingServiceItem {
  id: string;
  number: string;
  title: string;
  category: "planning_venue" | "attire_styling" | "ceremony_nikah" | "catering_operations" | "decor_ambience" | "transport_logistics" | "photography_media" | "concierge_gifts";
  description: string;
  details?: string[];
  iconName: string;
}

export interface TourismAttraction {
  id: string;
  name: string;
  category: "heritage_splendour" | "vintage_culture" | "entertainment_bazaars";
  tagline: string;
  bestTime: string;
}

export interface TourismLogisticsService {
  id: string;
  title: string;
  description: string;
  pricingType: "FREE" | "PAID";
  iconName: string;
}

/**
 * 1. MEDICAL & WELLNESS SERVICES (19 items from Client Brochure)
 */
export const MEDICAL_SERVICES: MedicalServiceItem[] = [
  // PART 1: Hospital & Doctor Services (All Free)
  {
    id: "med-01",
    number: "01",
    title: "Hospital & Doctor Appointments Assistance",
    category: "logistics",
    description: "Complete logistics, consultant discovery, and appointment slot scheduling with top specialists at Owaisi, Apollo, KIMS, and Care Hospitals.",
    pricingType: "FREE",
    tag: "Complimentary Care",
    iconName: "CalendarCheck",
  },
  {
    id: "med-02",
    number: "02",
    title: "Hospital | Travel Distance & Timing Assistance",
    category: "logistics",
    description: "Verified map routes, peak traffic estimates, and fast-track navigation guidance for stress-free hospital visits.",
    pricingType: "FREE",
    tag: "Complimentary Transit Assist",
    iconName: "Navigation",
  },
  {
    id: "med-03",
    number: "03",
    title: "24/7 Ambulance Coordination",
    category: "logistics",
    description: "Immediate response team on standby with direct hotlines to emergency medical ambulances in Hyderabad.",
    pricingType: "FREE",
    tag: "Emergency Standby",
    iconName: "Ambulance",
  },
  {
    id: "med-04",
    number: "04",
    title: "24/7 Dedicated Guest Assistance",
    category: "logistics",
    description: "Round-the-clock on-site support staff dedicated to patient attendants and family requests.",
    pricingType: "FREE",
    tag: "24/7 Staff Support",
    iconName: "Headphones",
  },
  {
    id: "med-05",
    number: "05",
    title: "Pharmacy Flatel In-Room Delivery",
    category: "logistics",
    description: "Direct doorstep delivery of prescription medicines and healthcare supplies straight to your apartment.",
    pricingType: "FREE",
    tag: "Doorstep Pharmacy",
    iconName: "Bike",
  },
  {
    id: "med-06",
    number: "06",
    title: "Wheelchair Assistance",
    category: "equipment",
    description: "Clean, sterilized on-site mobility equipment with elevator ramp accessibility throughout Flatel branches.",
    pricingType: "FREE",
    tag: "Mobility In-House",
    iconName: "Accessibility",
  },
  {
    id: "med-07",
    number: "07",
    title: "Hospital Bed & Recovery Kitchen",
    category: "equipment",
    description: "Ergonomic in-room medical bed setup and private furnished kitchen for preparing specialized patient meals.",
    pricingType: "FREE",
    tag: "In-Room Recovery",
    iconName: "Bed",
  },
  {
    id: "med-08",
    number: "08",
    title: "Glucose Stand (IV Stand)",
    category: "equipment",
    description: "Sanitized adjustable IV drip stands provided directly in-suite for intravenous fluids and infusions.",
    pricingType: "FREE",
    tag: "Medical Support",
    iconName: "Activity",
  },
  {
    id: "med-09",
    number: "09",
    title: "Digital Sugar Machine (Glucometer)",
    category: "monitoring",
    description: "High-precision digital blood glucose monitoring devices with test strips available for daily tracking.",
    pricingType: "FREE",
    tag: "Vital Monitoring",
    iconName: "Gauge",
  },
  {
    id: "med-10",
    number: "10",
    title: "Digital BP Machine",
    category: "monitoring",
    description: "Automatic digital blood pressure tracking monitor for continuous cardiac and post-op surveillance.",
    pricingType: "FREE",
    tag: "Vital Monitoring",
    iconName: "HeartPulse",
  },

  // PART 2: Guest Wellness & Amenities (Free + Paid Upgrades)
  {
    id: "med-11",
    number: "11",
    title: "Pulse Oximeter",
    category: "monitoring",
    description: "Fingertip SpO2 pulse oximeter for real-time blood oxygen saturation and pulse rate tracking.",
    pricingType: "FREE",
    tag: "Vital Monitoring",
    iconName: "Activity",
  },
  {
    id: "med-12",
    number: "12",
    title: "Emergency Medical & First Aid Kit",
    category: "equipment",
    description: "Comprehensive medical response box containing sterilized dressings, antiseptics, and emergency supplies.",
    pricingType: "PAID",
    tag: "On Request",
    iconName: "Cross",
  },
  {
    id: "med-13",
    number: "13",
    title: "Professional Leg & Foot Massagers",
    category: "monitoring",
    description: "Therapeutic massage equipment for patient attendants and recovery guests to relieve circulation fatigue.",
    pricingType: "FREE",
    tag: "Guest Wellness",
    iconName: "Sparkles",
  },
  {
    id: "med-14",
    number: "14",
    title: "Dedicated Sanitized Turnover Assist",
    category: "logistics",
    description: "Medical-grade hospital turnover cleaning, linen autoclaving, and deep sanitization for post-op safety.",
    pricingType: "FREE",
    tag: "Medical Hygiene",
    iconName: "ShieldCheck",
  },
  {
    id: "med-15",
    number: "15",
    title: "Dedicated Doctor / Nurse Visits",
    category: "premium_care",
    description: "On-call certified medical consultations, daily nursing dressing, catheter care, and vitals assessment in-suite.",
    pricingType: "PAID",
    tag: "Clinical Care",
    iconName: "Stethoscope",
  },
  {
    id: "med-16",
    number: "16",
    title: "Oxygen Concentrator / Cylinder Setup",
    category: "premium_care",
    description: "Continuous medical oxygen therapy support with concentrator units and emergency backup cylinders.",
    pricingType: "PAID",
    tag: "Therapy Equipment",
    iconName: "Wind",
  },
  {
    id: "med-17",
    number: "17",
    title: "Diet-Specific Meal Preparation",
    category: "premium_care",
    description: "Customized clinical nutrition plans — diabetic-friendly, salt-restricted, soft diet, or post-surgery bland cuisine.",
    pricingType: "PAID",
    tag: "Clinical Nutrition",
    iconName: "Soup",
  },
  {
    id: "med-18",
    number: "18",
    title: "Priority Check-In & Check-Out",
    category: "premium_care",
    description: "Express bedside check-in and flexible discharge matching hospital release timings.",
    pricingType: "PAID",
    tag: "VIP Hospitality",
    iconName: "Clock",
  },
  {
    id: "med-19",
    number: "19",
    title: "Chauffeur-Driven Hospital Car",
    category: "premium_care",
    description: "Dedicated sanitised AC sedan or SUV with vetted driver for routine clinic check-ups and diagnostic transfers.",
    pricingType: "PAID",
    tag: "Private Chauffeur",
    iconName: "Car",
  },
];

/**
 * 2. WEDDING & CELEBRATION CONCIERGE (17 items from Client Brochure)
 */
export const WEDDING_SERVICES: WeddingServiceItem[] = [
  {
    id: "wed-01",
    number: "01",
    title: "Event Venue Booking Assistance",
    category: "planning_venue",
    description: "Complete assistance in discovering, negotiating, and booking premier Function Halls, Banquet Halls, and Convention Centers across Hyderabad matching your theme and budget.",
    iconName: "Building2",
  },
  {
    id: "wed-02",
    number: "02",
    title: "Wedding Card Printing Services",
    category: "planning_venue",
    description: "End-to-end bespoke invitation design, calligraphic text framing, and high-quality gold foil printing for wedding cards.",
    iconName: "MailOpen",
  },
  {
    id: "wed-03",
    number: "03",
    title: "Bride's Attire Coordination",
    category: "attire_styling",
    description: "Fabric selection, custom zardozi embroidery, master tailoring, and trial coordination for luxury bridal wear (Khada Dupatta, Lehenga, Gowns).",
    iconName: "Sparkles",
  },
  {
    id: "wed-04",
    number: "04",
    title: "Groom's Attire Coordination",
    category: "attire_styling",
    description: "Expert guidance on premium fabrics, bespoke tailoring, and heritage styling for groom outfits (Sherwani, Kurta, Suits, Dastar).",
    iconName: "User",
  },
  {
    id: "wed-05",
    number: "05",
    title: "Footwear Arrangement for Bride & Groom",
    category: "attire_styling",
    description: "Personalized styling, sizing, and boutique sourcing of traditional Mojaris, juttis, and bridal heels perfectly matching wedding ensembles.",
    iconName: "ShoppingBag",
  },
  {
    id: "wed-06",
    number: "06",
    title: "Arrangement for Licensed Qazi",
    category: "ceremony_nikah",
    description: "Hassle-free coordination with authorized licensed Qazi for Nikah ceremonies, including formal Nikahnama documentation and timely attendance.",
    iconName: "Scroll",
  },
  {
    id: "wed-07",
    number: "07",
    title: "Catering & Kitchen Management Services",
    category: "catering_operations",
    description: "Authentic royal Hyderabadi and Arab cuisine preparation — from signature Dum Biryani & Haleem to exclusive desserts (Double ka Meetha, Qubani) — with turnkey kitchen setup.",
    iconName: "Utensils",
  },
  {
    id: "wed-08",
    number: "08",
    title: "On-Site Operations & Catering Control",
    category: "catering_operations",
    description: "Comprehensive supervision during the grand reception to ensure impeccable hospitality standards and eliminate food waste.",
    details: [
      "Preventing unauthorized use, wastage, or removal of food and supplies",
      "Managing venue staff and overseeing banquet waiters for seamless guest service",
      "Hygienic safe packing and prompt delivery of leftover food to the designated family location",
    ],
    iconName: "ShieldAlert",
  },
  {
    id: "wed-09",
    number: "09",
    title: "Grand Stage Decoration Services",
    category: "decor_ambience",
    description: "Modern, traditional, and customized floral stage concepts, crystal chandeliers, royal backdrop drapery, and dynamic lighting rigs.",
    iconName: "Layers",
  },
  {
    id: "wed-10",
    number: "10",
    title: "Wedding Room & Bridal Suite Decoration",
    category: "decor_ambience",
    description: "Romantic and elegant fresh floral styling, aromatic diffusers, and luxury bed styling for the bridal suite and newlywed couple's residence.",
    iconName: "Heart",
  },
  {
    id: "wed-11",
    number: "11",
    title: "Guest Fleet & Luxury Car Arrangements",
    category: "transport_logistics",
    description: "Seamless transport logistics for baraat and guests (Innova Crysta, 7-seaters) along with exotic luxury vehicles (Audi, BMW, Mercedes-Benz) for bride and groom.",
    iconName: "Car",
  },
  {
    id: "wed-12",
    number: "12",
    title: "Wedding Car Decoration Services",
    category: "transport_logistics",
    description: "Artistic floral styling, imported orchids, satin ribbons, and bonnet arrangements for the couple's grand entrance vehicle.",
    iconName: "Gem",
  },
  {
    id: "wed-13",
    number: "13",
    title: "Professional Makeup Artist & Hair Styling",
    category: "attire_styling",
    description: "Coordination with certified bridal makeup artists, HD/Airbrush makeup, artistic hair styling, and professional dupatta draping.",
    iconName: "Sparkle",
  },
  {
    id: "wed-14",
    number: "14",
    title: "Grooming for the Groom",
    category: "attire_styling",
    description: "Complete salon services including haircut, beard sculpting, revitalizing facial cleanup, and wedding-day spa grooming.",
    iconName: "Scissors",
  },
  {
    id: "wed-15",
    number: "15",
    title: "Photography & Videography Coordination",
    category: "photography_media",
    description: "Top candid wedding photographers, 4K cinematic highlight films, drone aerial shoots, traditional coverage, and customized coffee table albums.",
    iconName: "Camera",
  },
  {
    id: "wed-16",
    number: "16",
    title: "Dedicated Wedding On-Site Host Team",
    category: "concierge_gifts",
    description: "Personal on-ground event managers assisting out-of-town guests with check-in, gift distribution, banquet logistics, and itinerary coordination.",
    iconName: "Users",
  },
  {
    id: "wed-17",
    number: "17",
    title: "Wedding Trousseau Packing & Guest Gifts",
    category: "concierge_gifts",
    description: "Artistic theme packaging and luxury gift hampers for close relatives and attendees.",
    details: [
      "Bridal & Groom Trousseau Packing: elegant theme-based packaging, velvet box styling, and ornate tray presentation",
      "Guest Gift Packets: customized packing and distribution of traditional return gifts (Dry fruits, Royal Ittar, Sweets)",
    ],
    iconName: "Gift",
  },
];

/**
 * 3. LEISURE & TOURISM (Attractions & Services from Client Brochure)
 */
export const TOURISM_CIRCUITS: {
  category: "heritage_splendour" | "vintage_culture" | "entertainment_bazaars";
  title: string;
  tagline: string;
  attractions: TourismAttraction[];
}[] = [
  {
    category: "heritage_splendour",
    title: "Heritage Splendour",
    tagline: "Iconic monuments and royal palaces that define Hyderabad's 400-year legacy",
    attractions: [
      { id: "charminar", name: "Charminar", category: "heritage_splendour", tagline: "Global symbol of Hyderabad built in 1591 with 4 towering minarets", bestTime: "Morning & Sunset" },
      { id: "mecca-masjid", name: "Mecca Masjid", category: "heritage_splendour", tagline: "One of India's grandest historic mosques constructed with bricks from Mecca", bestTime: "Early Morning" },
      { id: "chowmahalla", name: "Chowmahalla Palace", category: "heritage_splendour", tagline: "Opulent seat of the Asaf Jahi Nizams featuring magnificent Durbar halls", bestTime: "10:00 AM – 4:00 PM" },
      { id: "golconda-fort", name: "Golconda Fort", category: "heritage_splendour", tagline: "Famous medieval acoustic citadel, diamond trading vaults & sound-and-light show", bestTime: "Late Afternoon" },
    ],
  },
  {
    category: "vintage_culture",
    title: "Vintage Elegance & Culture",
    tagline: "Royal mausoleums, vintage car collections and world-renowned museums",
    attractions: [
      { id: "qutb-shahi", name: "Qutb Shahi Tombs", category: "vintage_culture", tagline: "Serene landscaped necropolis of the 7 founding rulers of the Golconda kingdom", bestTime: "Morning Walk" },
      { id: "purani-haveli", name: "Purani Haveli", category: "vintage_culture", tagline: "Official Nizam residence housing the world's longest wooden wardrobe", bestTime: "11:00 AM – 3:00 PM" },
      { id: "taramati", name: "Taramati Baradari", category: "vintage_culture", tagline: "Semi-circular pavilion on a hilltop with legendary acoustic architecture", bestTime: "Evening" },
      { id: "salar-jung", name: "Salar Jung Museum", category: "vintage_culture", tagline: "One of the world's largest individual artifact collections and famous Musical Clock", bestTime: "10:30 AM – 4:30 PM" },
    ],
  },
  {
    category: "entertainment_bazaars",
    title: "Entertainment & Local Bazaars",
    tagline: "Celebrated studio tours, rich wildlife, artisan crafts, and lacquer pearl shopping",
    attractions: [
      { id: "ramoji", name: "Ramoji Film City", category: "entertainment_bazaars", tagline: "Guinness World Record world's largest integrated film studio and theme park", bestTime: "Full Day Tour" },
      { id: "zoo", name: "Nehru Zoological Park", category: "entertainment_bazaars", tagline: "380 acres of lush biodiversity, lion safaris, and nocturnal animal exhibits", bestTime: "Morning Safari" },
      { id: "shilparamam", name: "Shilparamam Arts Village", category: "entertainment_bazaars", tagline: "Traditional cultural and craft village celebrating Indian rural heritage", bestTime: "Afternoon & Night" },
      { id: "laad-bazaar", name: "Laad Bazaar (Choodi Bazaar)", category: "entertainment_bazaars", tagline: "Historic pedestrian shopping bazaar famed for handcrafted lacquer bangles and pearls", bestTime: "Evening Shopping" },
    ],
  },
];

export const TOURISM_LOGISTICS: TourismLogisticsService[] = [
  {
    id: "tour-01",
    title: "Airport Pick-Up & Drop",
    description: "Flight-tracked private AC transfers directly between Rajiv Gandhi International Airport (RGIA) and your Flatel apartment.",
    pricingType: "PAID",
    iconName: "Plane",
  },
  {
    id: "tour-02",
    title: "Chauffeur-Driven Full-Day Car",
    description: "Dedicated AC Sedan or Luxury SUV with polite, vetted local driver for flexible all-day city sightseeing and shopping.",
    pricingType: "PAID",
    iconName: "Car",
  },
  {
    id: "tour-03",
    title: "Expert Local Guides",
    description: "Multilingual cultural guides providing rich historical stories of the Nizams, architecture, and hidden culinary spots.",
    pricingType: "PAID",
    iconName: "Compass",
  },
  {
    id: "tour-04",
    title: "Full-Day Professional Photography",
    description: "Personal candid photographer accompanying your family across Charminar and palaces for vacation memories.",
    pricingType: "PAID",
    iconName: "Camera",
  },
  {
    id: "tour-05",
    title: "Detailed Monument Guides",
    description: "Curated digital brochures with entrance timings, photography fees, and local etiquettes.",
    pricingType: "FREE",
    iconName: "Info",
  },
  {
    id: "tour-06",
    title: "Customized Itineraries",
    description: "Tailored 1-day, 3-day, or 7-day travel blueprints created by our local team based on your family's pace.",
    pricingType: "FREE",
    iconName: "Map",
  },
];
