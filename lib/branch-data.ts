/**
 * Flatel Hospitality - Branch Master Data & Service
 * Central single source of truth for Branch Profiles, Landmarks & Dynamic Inventory
 */

export interface BranchLandmark {
  name: string;
  dist: string;
  time: string;
  type?: "hospital" | "transit" | "heritage";
}

export interface BranchProfile {
  id: string;
  slug: string;
  code: string;
  name: string;
  badge: string;
  tagline: string;
  verifiedAddress: string;
  description: string;
  coordinates: [number, number]; // [lat, lng]
  googleMapsUrl: string;
  landmarks: BranchLandmark[];
  heroImage: string;
  defaultGallery: Array<{
    id: string;
    src: string;
    title: string;
    category: string;
  }>;
}

export const BRANCH_PROFILES: Record<string, BranchProfile> = {
  "barkas-salala": {
    id: "barkas-salala",
    slug: "barkas-salala",
    code: "BRANCH 02",
    name: "Barkas Salala",
    badge: "BARKAS SALALA",
    tagline: "Serviced residences in Barkas Salala",
    verifiedAddress: "Barkas Salala, Near Chandrayangutta, Hyderabad, Telangana",
    description:
      "Grand 3 BHK residences for families and medical attendants, with equipped kitchens and residential privacy.",
    coordinates: [17.3185, 78.4905],
    googleMapsUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
    heroImage: "/images/branch-barkas-salala.jpg",
    landmarks: [
      { name: "Chandrayangutta Flyover Junction", dist: "", time: "", type: "transit" },
      { name: "Owaisi Hospital & Research Centre", dist: "", time: "", type: "hospital" },
      { name: "Apollo DRDO Hospital", dist: "", time: "", type: "hospital" },
      { name: "Rajiv Gandhi Intl Airport (HYD)", dist: "", time: "", type: "transit" },
    ],
    defaultGallery: [
      {
        id: "b-1",
        src: "/images/branch-barkas-salala.jpg",
        title: "Spacious Living & Balcony Salon",
        category: "Living Lounge",
      },
      {
        id: "b-2",
        src: "/images/amenities-bedroom-bg.jpg",
        title: "Master Suite with King Bed & Warm Ambient Lighting",
        category: "Master Bedroom",
      },
      {
        id: "b-3",
        src: "/images/amenity-kitchen-luxury.jpg",
        title: "Modular Kitchen with Gas Stove & Refrigerator",
        category: "Modular Kitchen",
      },
      {
        id: "b-4",
        src: "/images/amenity-bathroom-luxury.jpg",
        title: "En-Suite Sanitized Bathroom with 24/7 Geyser",
        category: "Bathroom",
      },
      {
        id: "b-5",
        src: "/images/hero-apartment.jpg",
        title: "Family Dining Area & Entertainment Hub",
        category: "Dining Suite",
      },
      {
        id: "b-6",
        src: "/images/flats/flat-3bhk-luxury.jpg",
        title: "Skyline View from Private Suite Balcony",
        category: "Panoramic View",
      },
    ],
  },
  "moghal-pura": {
    id: "moghal-pura",
    slug: "moghal-pura",
    code: "BRANCH 01",
    name: "Moghal Pura",
    badge: "MOGHAL PURA",
    tagline: "Historic Old City & Charminar Quarter",
    verifiedAddress: "Moghal Pura, Near Charminar, Hyderabad, Telangana",
    description:
      "Steps from Charminar and Laad Bazaar. Private 1, 2, and 4 BHK residences with modular kitchens, alternate-day housekeeping, and quiet residential comfort in the historic heart of Hyderabad.",
    coordinates: [17.357, 78.4815],
    googleMapsUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
    heroImage: "/images/branch-moghal-pura.jpg",
    landmarks: [
      { name: "Historic Charminar & Laad Bazaar", dist: "", time: "", type: "heritage" },
      { name: "Princess Esra Hospital (Deccan Medical)", dist: "", time: "", type: "hospital" },
      { name: "Chowmahalla Palace", dist: "", time: "", type: "heritage" },
      { name: "Salar Jung Museum", dist: "", time: "", type: "heritage" },
    ],
    defaultGallery: [
      {
        id: "m-1",
        src: "/images/branch-moghal-pura.jpg",
        title: "Master Living Suite & Classical Proportions",
        category: "Master Suite",
      },
      {
        id: "m-2",
        src: "/images/flats/flat-2bhk-luxury.jpg",
        title: "Central Living Lounge with Velvet Sofa",
        category: "Living Lounge",
      },
      {
        id: "m-3",
        src: "/images/amenities-bedroom-bg.jpg",
        title: "Quiet Air-Conditioned Bedroom",
        category: "Guest Bedroom",
      },
      {
        id: "m-4",
        src: "/images/amenity-kitchen-luxury.jpg",
        title: "Self-Cooking Modular Kitchen Setup",
        category: "Modular Kitchen",
      },
      {
        id: "m-5",
        src: "/images/amenity-bathroom-luxury.jpg",
        title: "Modern En-Suite Bathroom with Hot Water",
        category: "Bathroom",
      },
      {
        id: "m-6",
        src: "/images/flats/flat-4bhk-luxury.jpg",
        title: "Grand Presidential Living Salon with Balcony",
        category: "Presidential Salon",
      },
    ],
  },
};

export function getBranchProfile(slug: string): BranchProfile {
  const clean = slug.toLowerCase().trim();
  return (
    BRANCH_PROFILES[clean] ||
    BRANCH_PROFILES["barkas-salala"]
  );
}
