/**
 * Room & Unit Domain Types
 * Single Source of Truth as per final-prd.md
 */

export type RoomCategory = "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
export type RoomType = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "5bhk" | "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK" | "5 BHK";

export interface RoomImage {
  key?: string;
  url: string;
  alt: string;
  category?: "living" | "bedroom" | "kitchen" | "bathroom" | "exterior" | "Living Area" | "Bedroom" | "Kitchen" | "Bathroom" | "Exterior" | "Dining Lounge";
}

export interface Amenity {
  id: string;
  label: string;
  icon?: string;
  category?: "comfort" | "connectivity" | "kitchen" | "hygiene" | "service" | "recreation";
}

export interface Unit {
  id: string;
  branchId: string;
  branchSlug: string;
  title: string;
  category: RoomCategory;
  slug: string;
  basePricePerNight: number;
  baseAdults: number;
  maxAdults: number; // baseAdults + maxExtraGuests
  maxKids: number | null; // Configurable: specific child safety limit awaiting owner confirmation
  childCapacityStatus?: "awaiting_owner_confirmation" | "confirmed";
  extraPersonFeePerNight: number; // default ₹500
  totalUnits: number;
  images: string[];
  isAvailable: boolean;
  isAdminCreated?: boolean;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  title?: string;
  type: RoomType;
  category?: RoomCategory;
  description: string;
  basePricePerNight: number;
  baseAdults?: number;
  maxAdults?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  coverImage?: RoomImage;
  gallery: RoomImage[];
  amenities: Amenity[];
  isActive: boolean;
}
