/**
 * Supabase Database Type Definitions
 * Models the schema for Flatel Hospitality PostgreSQL tables strictly as defined in final-prd.md Section 9.2.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // 1. Branches Table
      branches: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string;
          google_maps_url: string | null;
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["branches"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["branches"]["Insert"]>;
      };

      // 2. Units / Flats Table (1BHK to 5BHK)
      units: {
        Row: {
          id: string;
          branch_id: string;
          title: string;
          category: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
          slug: string;
          base_price_per_night: number;
          base_adults: number;
          max_adults: number;
          max_kids: number | null; // Configurable: specific child safety limit awaiting owner confirmation
          extra_person_fee_per_night: number;
          images: string[];
          is_available: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["units"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
      };

      // 3. Add-on Services Table
      addon_services: {
        Row: {
          id: string;
          purpose_tag: "medical" | "wedding" | "tourism" | "corporate" | "family";
          service_name: string;
          is_free: boolean;
          pricing_type: "free" | "per_booking" | "per_night" | "quote";
          price: number | null; // null if requiring custom quote / configuration
          disclaimer: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["addon_services"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["addon_services"]["Insert"]>;
      };

      // 4. Bookings Table
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          unit_id: string;
          guest_name: string;
          guest_phone: string;
          guest_email: string;
          check_in_date: string;
          check_out_date: string;
          total_nights: number;
          adults_count: number;
          kids_count: number;
          extra_guests_count: number;
          stay_purpose: "medical" | "wedding" | "tourism" | "corporate" | "family" | "accommodation_only";
          selected_addons: Json;
          base_rent_total: number;
          extra_guests_total: number;
          addons_total: number;
          gross_total: number;
          advance_paid_amount: number; // 20%
          balance_due_amount: number; // 80%
          payment_status: "pending" | "advance_paid" | "fully_paid" | "failed" | "cancelled";
          balance_collected: boolean;
          gateway_payment_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };

      // 5. Blocked Calendar Dates
      blocked_dates: {
        Row: {
          id: string;
          unit_id: string;
          blocked_date: string;
          reason: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["blocked_dates"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["blocked_dates"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
