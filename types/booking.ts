/**
 * Booking Domain Types
 * Single Source of Truth as per final-prd.md
 */

import type { CalculateFareInput, FareCalculationResult, SelectedPaidAddon } from "@/lib/pricing";

export type StayPurposeType =
  | "medical"
  | "wedding"
  | "tourism"
  | "corporate"
  | "family"
  | "accommodation_only";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "advance_paid"
  | "fully_paid"
  | "failed"
  | "refunded";

/**
 * Fixed 20% online advance policy as per final-prd.md Section 2.1
 * (Full 100% prepayment removed from active booking logic)
 */
export type PaymentOption = "advance_20";

export interface StayPurpose {
  id: string;
  code: StayPurposeType;
  title: string;
  name: string;
  tagline: string;
  description: string;
  contextTag: string;
}

export interface AddonServiceDefinition {
  id: string;
  purposeTag: StayPurposeType;
  serviceName: string;
  isFree: boolean;
  pricingType: "free" | "per_booking" | "per_night" | "per_person" | "quote";
  price: number | null; // null if requiring custom configuration or dynamic quote
  disclaimer: string | null;
  isActive: boolean;
  requiresConfiguration?: boolean;
}

export interface BookingGuest {
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  isInternational?: boolean;
}

export type BookingPricing = FareCalculationResult;

export interface BookingRecord {
  id: string;
  bookingCode: string; // e.g. FLT-84920
  unitId: string;
  guest: BookingGuest;
  stayPurpose: StayPurposeType;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  adultsCount: number;
  kidsCount: number;
  extraGuestsCount: number;
  selectedAddons: SelectedPaidAddon[];
  pricing: BookingPricing;
  paymentOption: PaymentOption;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  balanceCollected: boolean;
  gatewayPaymentId?: string;
  notificationStatus?: "sent" | "failed" | "pending_waba_configuration";
  notificationMessage?: string;
  createdAt: string;
}

export type { CalculateFareInput, FareCalculationResult, SelectedPaidAddon };
