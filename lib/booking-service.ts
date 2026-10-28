import crypto from "crypto";
import {
  BookingRecord,
  StayPurposeType,
  SelectedPaidAddon,
} from "@/types/booking";
import { calculateFlatelPrice, FareCalculationResult } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { InventoryService } from "@/lib/inventory-service";
import { CalendarService } from "@/lib/calendar-service";
import { getMasterAddonById } from "@/lib/mock-rooms";

export interface CreateBookingData {
  unitId: string; // e.g. "1bhk", "2bhk", "3bhk", "4bhk", "5bhk"
  checkInDate: string; // "YYYY-MM-DD"
  checkOutDate: string; // "YYYY-MM-DD"
  adultsCount: number;
  kidsCount: number;
  stayPurpose: StayPurposeType;
  selectedAddons?: SelectedPaidAddon[];
  guest: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
    isInternational?: boolean;
  };
}

export interface PaymentVerificationData {
  bookingId: string;
  orderId?: string;
  paymentId: string;
  signature?: string;
  /** Accepted for legacy callers only; never changes payment verification. */
  isSandbox?: boolean;
}

export interface DashboardStats {
  todayArrivals: number;
  activeOccupancies: number;
  totalAdvanceCollected: number;
  pendingBalanceDue: number;
  occupancyRate: number;
  totalBookings: number;
}

// In-memory fallback and runtime cache
const globalBookingsMap = new Map<string, BookingRecord>();
let isTestIsolatedStore = false;

function generateBookingCode(): string {
  // Format: FLT-XXXXXXXX (12 characters, fits within database VARCHAR(20) limit)
  return `FLT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function mapDbRowToBookingRecord(row: Record<string, unknown>): BookingRecord {
  return {
    id: String(row.id || ""),
    bookingCode: String(row.booking_code || ""),
    unitId: String(row.unit_id || ""),
    guest: {
      fullName: String(row.guest_name || ""),
      email: String(row.guest_email || ""),
      phone: String(row.guest_phone || ""),
      specialRequests: String(row.special_requests || ""),
      isInternational: Boolean(row.is_international),
    },
    stayPurpose: (row.stay_purpose as StayPurposeType) || "accommodation_only",
    checkInDate: String(row.check_in_date || ""),
    checkOutDate: String(row.check_out_date || ""),
    totalNights: Number(row.total_nights || 1),
    adultsCount: Number(row.adults_count || 1),
    kidsCount: Number(row.kids_count || 0),
    extraGuestsCount: Number(row.extra_guests_count || 0),
    selectedAddons: (row.selected_addons as SelectedPaidAddon[]) || [],
    pricing: {
      nights: Number(row.total_nights || 1),
      standardBaseRent: Number(row.base_rent_total || 0),
      discountRate: 0,
      baseRentDiscount: 0,
      baseRent: Number(row.base_rent_total || 0),
      extraAdults: Number(row.extra_guests_count || 0),
      extraGuestsTotal: Number(row.extra_guests_total || 0),
      addonsTotal: Number(row.addons_total || 0),
      grossTotal: Number(row.gross_total || 0),
      advancePayable: Number(row.advance_paid_amount || 0),
      balanceDueOnArrival: Number(row.balance_due_amount || 0),
    },
    paymentOption: "advance_20",
    paymentStatus: (row.payment_status || "pending") as BookingRecord["paymentStatus"],
    bookingStatus: (row.booking_status || "pending") as BookingRecord["bookingStatus"],
    balanceCollected: Boolean(row.balance_collected),
    gatewayPaymentId: row.gateway_payment_id ? String(row.gateway_payment_id) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export class BookingService {
  static async recordPaymentOrder(bookingId: string, orderId: string, amountPaise: number): Promise<void> {
    if (!Number.isSafeInteger(amountPaise) || amountPaise < 1) {
      throw new Error("Payment amount is invalid.");
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("payment_transactions").insert({
      booking_id: bookingId,
      gateway: "razorpay",
      order_id: orderId,
      amount_paise: amountPaise,
      currency: "INR",
      status: "created",
    });
    if (error) throw new Error(`Could not save payment order: ${error.message}`);
  }

  /**
   * Verifies if a unit is available between check-in and check-out dates
   * (Checks BOTH confirmed bookings and calendar blackouts)
   */
  static async checkAvailability(
    unitId: string,
    checkInDate: string,
    checkOutDate: string,
    excludeBookingId?: string
  ): Promise<{ available: boolean; reason?: string; verified?: boolean }> {
    let room;
    try {
      room = await InventoryService.getAuthoritativeUnitBySlug(unitId);
    } catch (error) {
      // Could not look the unit up at all: not "booked", just unverified (still blocks booking)
      return {
        available: false,
        verified: false,
        reason: error instanceof Error ? error.message : "Property availability could not be verified.",
      };
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return { available: false, reason: "Invalid dates provided." };
    }

    if (checkOut <= checkIn) {
      return { available: false, reason: "Check-out date must be after check-in date." };
    }

    // 1. Check Calendar Blackouts from Supabase blocked_dates
    const blackoutCheck = await CalendarService.isRangeBlocked(room.slug, checkInDate, checkOutDate);
    if (blackoutCheck.isBlocked) {
      return {
        available: false,
        reason: blackoutCheck.reason || "The selected dates are blocked for property maintenance or private hold.",
      };
    }

    // 2. Check Overlapping Bookings from Supabase
    let existingOverlapsCount = 0;
    if (!isTestIsolatedStore) {
        const supabase = createAdminClient();
        const { data: dbBookings, error } = await supabase
          .from("bookings")
          .select("id, check_in_date, check_out_date, booking_status, payment_status")
          .eq("unit_id", room.slug)
          .neq("booking_status", "cancelled")
          .neq("payment_status", "failed");
        if (error) throw new Error(`Could not verify reservation availability: ${error.message}`);

        if (dbBookings && dbBookings.length > 0) {
          for (const b of dbBookings) {
            if (excludeBookingId && b.id === excludeBookingId) continue;
            const bIn = new Date(b.check_in_date);
            const bOut = new Date(b.check_out_date);
            if (checkIn < bOut && checkOut > bIn) {
              existingOverlapsCount++;
            }
          }
        }
    } else {
      const memBookings = Array.from(globalBookingsMap.values()).filter((b) => {
        if (b.unitId !== room.id && b.unitId !== room.slug) return false;
        if (excludeBookingId && b.id === excludeBookingId) return false;
        if (b.bookingStatus === "cancelled" || b.paymentStatus === "failed") return false;
        const bIn = new Date(b.checkInDate);
        const bOut = new Date(b.checkOutDate);
        return checkIn < bOut && checkOut > bIn;
      });
      existingOverlapsCount = memBookings.length;
    }


    if (existingOverlapsCount >= room.totalUnits) {
      return {
        available: false,
        reason: `All ${room.totalUnits} unit(s) of ${room.title} are reserved for the selected dates.`,
      };
    }

    return { available: true };
  }

  /**
   * Server-side independent calculation and booking intent creation
   */
  static async createBookingIntent(data: CreateBookingData): Promise<{
    booking: BookingRecord;
    advancePayablePaise: number;
    requiresPayment: boolean;
  }> {
    const room = await InventoryService.getAuthoritativeUnitBySlug(data.unitId);

    // 1. Strict date parsing & validation
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error("Invalid check-in or check-out date format.");
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((checkOut.getTime() - checkIn.getTime()) / oneDayMs);
    if (diffDays < 1) {
      throw new Error("Stay duration must be at least 1 night.");
    }

    // 2. Strict guest occupancy validation
    if (data.adultsCount < 1) {
      throw new Error("At least 1 adult guest is required.");
    }
    if (data.adultsCount > room.maxAdults) {
      throw new Error(
        `Selected adults (${data.adultsCount}) exceeds property limit of ${room.maxAdults} adults.`
      );
    }
    if (
      typeof room.maxChildren === "number" &&
      data.kidsCount > room.maxChildren
    ) {
      throw new Error(
        `Selected children (${data.kidsCount}) exceeds safety capacity of ${room.maxChildren}.`
      );
    }

    // Guest contact validation
    if (!data.guest || typeof data.guest !== "object") {
      throw new Error("Guest details are required.");
    }
    if (!data.guest.fullName?.trim()) {
      throw new Error("Guest full name is required.");
    }
    if (!data.guest.email?.trim() || !data.guest.email.includes("@")) {
      throw new Error("Valid guest email address is required.");
    }
    if (!data.guest.phone?.trim() || data.guest.phone.trim().length < 8) {
      throw new Error("Valid WhatsApp mobile phone number is required.");
    }

    // 3. Availability check
    const availability = await this.checkAvailability(
      room.slug,
      data.checkInDate,
      data.checkOutDate
    );
    if (!availability.available) {
      throw new Error(availability.reason || "Property is unavailable for the selected dates.");
    }

    // 4. Server-Side Trusted Price Recalculation using authoritative master catalog
    const verifiedAddons: SelectedPaidAddon[] = [];
    const allAddons: SelectedPaidAddon[] = [];
    if (data.selectedAddons && Array.isArray(data.selectedAddons)) {
      for (const rawAddon of data.selectedAddons) {
        if (!rawAddon || !rawAddon.id) continue;
        const master = getMasterAddonById(rawAddon.id);
        if (master && typeof master.price === "number" && master.price > 0) {
          const trustedAddon: SelectedPaidAddon = {
            id: master.id,
            name: master.name,
            price: master.price,
            pricingType: master.pricingType === "per_night" ? "per_night" : "per_booking",
          };
          allAddons.push(trustedAddon);
          verifiedAddons.push(trustedAddon);
        } else if (master) {
          allAddons.push({
            id: master.id,
            name: master.name,
            price: 0,
            pricingType: "quote",
          });
        }
      }
    }

    const fareResult: FareCalculationResult = calculateFlatelPrice({
      nights: diffDays,
      basePricePerNight: room.basePricePerNight,
      baseAdults: room.baseAdults,
      selectedAdults: data.adultsCount,
      selectedKids: data.kidsCount,
      extraPersonFee: room.extraPersonFeePerNight,
      selectedPaidAddons: verifiedAddons,
    });

    const bookingId = crypto.randomUUID();
    let bookingCode = generateBookingCode();
    while (Array.from(globalBookingsMap.values()).some((b) => b.bookingCode === bookingCode)) {
      bookingCode = generateBookingCode();
    }

    const bookingRecord: BookingRecord = {
      id: bookingId,
      bookingCode,
      unitId: room.slug,
      guest: {
        fullName: data.guest.fullName.trim(),
        email: data.guest.email.trim().toLowerCase(),
        phone: data.guest.phone.trim(),
        specialRequests: data.guest.specialRequests?.trim() || "",
        isInternational: Boolean(data.guest.isInternational),
      },
      stayPurpose: data.stayPurpose || "accommodation_only",
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      totalNights: diffDays,
      adultsCount: data.adultsCount,
      kidsCount: data.kidsCount,
      extraGuestsCount: fareResult.extraAdults,
      selectedAddons: allAddons,
      pricing: fareResult,
      paymentOption: "advance_20",
      paymentStatus: "pending",
      bookingStatus: "pending",
      balanceCollected: false,
      createdAt: new Date().toISOString(),
    };

    // Persist under a per-unit database lock so concurrent requests cannot overbook inventory.
    if (!isTestIsolatedStore) {
        const supabase = createAdminClient();
        const { error } = await supabase.rpc("create_booking_if_available", {
          p_total_units: room.totalUnits,
          p_booking: {
            id: bookingRecord.id,
            booking_code: bookingRecord.bookingCode,
            unit_id: bookingRecord.unitId,
            guest_name: bookingRecord.guest.fullName,
            guest_phone: bookingRecord.guest.phone,
            guest_email: bookingRecord.guest.email,
            is_international: bookingRecord.guest.isInternational ?? false,
            special_requests: bookingRecord.guest.specialRequests || null,
            stay_purpose: bookingRecord.stayPurpose,
            check_in_date: bookingRecord.checkInDate,
            check_out_date: bookingRecord.checkOutDate,
            total_nights: bookingRecord.totalNights,
            adults_count: bookingRecord.adultsCount,
            kids_count: bookingRecord.kidsCount,
            extra_guests_count: bookingRecord.extraGuestsCount,
            selected_addons: bookingRecord.selectedAddons,
            base_rent_total: bookingRecord.pricing.baseRent,
            extra_guests_total: bookingRecord.pricing.extraGuestsTotal,
            addons_total: bookingRecord.pricing.addonsTotal,
            gross_total: bookingRecord.pricing.grossTotal,
            advance_paid_amount: bookingRecord.pricing.advancePayable,
            balance_due_amount: bookingRecord.pricing.balanceDueOnArrival,
            payment_status: bookingRecord.paymentStatus,
            booking_status: bookingRecord.bookingStatus,
            balance_collected: bookingRecord.balanceCollected,
          },
        });
        if (error) throw new Error(`Could not save reservation details: ${error.message}`);
    }
    globalBookingsMap.set(bookingId, bookingRecord);


    return {
      booking: bookingRecord,
      advancePayablePaise: fareResult.advancePayable * 100,
      requiresPayment: fareResult.advancePayable > 0,
    };
  }

  /**
   * Retrieves booking by UUID or booking code (e.g. FLT-84920)
   */
  static async getBooking(identifier: string): Promise<BookingRecord | null> {
    const normalized = identifier.trim().toUpperCase();

    // Check memory first
    for (const booking of globalBookingsMap.values()) {
      if (booking.bookingCode.toUpperCase() === normalized || booking.id === identifier) {
        return booking;
      }
    }

    // Query Supabase
    try {
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier.trim());
      const query = supabase.from("bookings").select("*");
      
      const { data, error } = isUuid
        ? await query.eq("id", identifier.trim()).maybeSingle()
        : await query.eq("booking_code", normalized).maybeSingle();

      if (!error && data) {
        const record = mapDbRowToBookingRecord(data);
        globalBookingsMap.set(record.id, record);
        return record;
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Server-side payment verification and confirmation
   */
  static async confirmPayment(data: PaymentVerificationData, trustedWebhook = false): Promise<BookingRecord> {
    const booking = await this.getBooking(data.bookingId);
    if (!booking) {
      throw new Error(`Booking ${data.bookingId} not found.`);
    }

    if (booking.paymentStatus === "advance_paid" && booking.bookingStatus === "confirmed") {
      return booking;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!data.orderId || !data.paymentId) {
      throw new Error("Payment reference is incomplete.");
    }

    let paymentTransactionId: string | undefined;
    if (!isTestIsolatedStore) {
      const supabase = createAdminClient();
      const { data: transaction, error } = await supabase
        .from("payment_transactions")
        .select("id, amount_paise, status")
        .eq("booking_id", booking.id)
        .eq("order_id", data.orderId)
        .maybeSingle();
      if (error || !transaction) throw new Error("Payment order does not match this reservation.");
      if (Number(transaction.amount_paise) !== Math.round(booking.pricing.advancePayable * 100)) {
        throw new Error("Payment order amount does not match the required deposit.");
      }
      if (transaction.status !== "created" && transaction.status !== "authorized") {
        throw new Error("Payment order is no longer valid.");
      }
      paymentTransactionId = String(transaction.id);
    }

    if (!trustedWebhook) {
      if (!keySecret || !data.orderId || !data.signature || !data.paymentId) {
        throw new Error("Payment could not be verified. Please contact support before retrying.");
      }
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${data.orderId}|${data.paymentId}`)
        .digest("hex");

      const expected = Buffer.from(generatedSignature, "hex");
      const received = /^[a-f0-9]{64}$/i.test(data.signature)
        ? Buffer.from(data.signature, "hex")
        : Buffer.alloc(0);
      if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
        throw new Error("Invalid payment signature verification failed.");
      }
    }

    const confirmedPayment = {
      paymentStatus: "advance_paid" as const,
      bookingStatus: "confirmed" as const,
      gatewayPaymentId: data.paymentId,
    };

    if (!isTestIsolatedStore) {
      try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: confirmedPayment.paymentStatus,
          booking_status: confirmedPayment.bookingStatus,
          gateway_payment_id: confirmedPayment.gatewayPaymentId,
        })
        .eq("id", booking.id);
      if (error) throw error;
      const { error: transactionError } = await supabase
        .from("payment_transactions")
        .update({ payment_id: data.paymentId, status: "captured", signature: data.signature || null })
        .eq("id", paymentTransactionId);
      if (transactionError) throw transactionError;
      } catch {
        throw new Error("Payment was verified, but the reservation could not be saved. Contact support before retrying.");
      }
    }

    Object.assign(booking, confirmedPayment, { notificationStatus: "pending" as const });
    globalBookingsMap.set(booking.id, booking);

    return booking;
  }

  /**
   * Records payment failure
   */
  static async markPaymentFailed(bookingId: string, reason?: string): Promise<BookingRecord> {
    const booking = await this.getBooking(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    if (booking.paymentStatus === "advance_paid") {
      throw new Error("A paid reservation cannot be marked as failed.");
    }

    booking.paymentStatus = "failed";
    booking.bookingStatus = "cancelled";
    booking.notificationMessage = reason || "Payment transaction failed.";

    globalBookingsMap.set(booking.id, booking);

    try {
      const supabase = createAdminClient();
      await supabase
        .from("bookings")
        .update({
          payment_status: booking.paymentStatus,
          booking_status: booking.bookingStatus,
        })
        .eq("id", booking.id);
    } catch {
      // ignore
    }

    return booking;
  }

  /**
   * Updates booking balance collection status or status
   */
  static async updateBooking(
    id: string,
    updates: {
      balanceCollected?: boolean;
      bookingStatus?: BookingRecord["bookingStatus"];
      paymentStatus?: BookingRecord["paymentStatus"];
    }
  ): Promise<BookingRecord> {
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error(`Booking ${id} not found.`);
    }

    if (updates.balanceCollected !== undefined) {
      booking.balanceCollected = updates.balanceCollected;
      if (updates.balanceCollected && booking.bookingStatus === "confirmed") {
        booking.bookingStatus = "checked_in";
      }
    }
    if (updates.bookingStatus !== undefined) {
      booking.bookingStatus = updates.bookingStatus;
    }
    if (updates.paymentStatus !== undefined) {
      booking.paymentStatus = updates.paymentStatus;
    }

    globalBookingsMap.set(booking.id, booking);

    try {
      const supabase = createAdminClient();
      const dbUpdates: Record<string, unknown> = {};
      if (updates.balanceCollected !== undefined) dbUpdates.balance_collected = booking.balanceCollected;
      if (booking.bookingStatus) dbUpdates.booking_status = booking.bookingStatus;
      if (booking.paymentStatus) dbUpdates.payment_status = booking.paymentStatus;

      await supabase.from("bookings").update(dbUpdates).eq("id", booking.id);
    } catch {
      // ignore
    }

    return booking;
  }

  /**
   * Lists all bookings with dynamic search and status filters
   */
  static async listBookings(filters?: {
    status?: string;
    query?: string;
    date?: string;
    limit?: number;
  }): Promise<BookingRecord[]> {
    if (isTestIsolatedStore) {
      let testList = Array.from(globalBookingsMap.values());
      if (filters?.status && filters.status !== "all") {
        testList = testList.filter((b) => b.bookingStatus === filters.status);
      }
      return testList;
    }

    try {
      const supabase = createAdminClient();
      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("booking_status", filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const records = data.map(mapDbRowToBookingRecord);
        for (const r of records) {
          globalBookingsMap.set(r.id, r);
        }

        let filtered = records;
        if (filters?.query) {
          const q = filters.query.toLowerCase().trim();
          filtered = filtered.filter(
            (b) =>
              b.bookingCode.toLowerCase().includes(q) ||
              b.guest.fullName.toLowerCase().includes(q) ||
              b.guest.phone.includes(q) ||
              b.guest.email.toLowerCase().includes(q) ||
              b.unitId.toLowerCase().includes(q)
          );
        }
        return filtered;
      }
    } catch {
      // fallback
    }

    let all = Array.from(globalBookingsMap.values());
    if (filters?.status && filters.status !== "all") {
      all = all.filter((b) => b.bookingStatus === filters.status);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      all = all.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.guest.fullName.toLowerCase().includes(q) ||
          b.guest.phone.includes(q) ||
          b.guest.email.toLowerCase().includes(q) ||
          b.unitId.toLowerCase().includes(q)
      );
    }
    return all;
  }

  /**
   * Calculates live KPIs for Admin Dashboard
   */
  static async getAdminStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split("T")[0];
    const allBookings = await this.listBookings();

    let todayArrivals = 0;
    let activeOccupancies = 0;
    let totalAdvanceCollected = 0;
    let pendingBalanceDue = 0;

    for (const b of allBookings) {
      if (b.bookingStatus === "cancelled" || b.paymentStatus === "failed") continue;

      // Arrivals today
      if (b.checkInDate === today) {
        todayArrivals++;
      }

      // Active occupancies
      if (today >= b.checkInDate && today < b.checkOutDate) {
        activeOccupancies++;
      }

      // 20% advance collected
      if (b.paymentStatus === "advance_paid" || b.paymentStatus === "fully_paid") {
        totalAdvanceCollected += b.pricing.advancePayable;
      }

      // Pending 80% due
      if (!b.balanceCollected) {
        pendingBalanceDue += b.pricing.balanceDueOnArrival;
      }
    }

    const units = await InventoryService.getAllUnits();
    const totalCapacityUnits = units.reduce((acc, u) => acc + (u.totalUnits || 1), 0);
    const occupancyRate = totalCapacityUnits > 0
      ? Math.min(100, Math.round((activeOccupancies / totalCapacityUnits) * 100))
      : 0;

    return {
      todayArrivals,
      activeOccupancies,
      totalAdvanceCollected,
      pendingBalanceDue,
      occupancyRate,
      totalBookings: allBookings.length,
    };
  }

  /**
   * Filter bookings for a specific guest by phone or email
   */
  static async getBookingsByGuest(filter: { email?: string; phone?: string }): Promise<BookingRecord[]> {
    const all = await this.listBookings();
    const cleanPhone = filter.phone ? filter.phone.replace(/[^0-9]/g, "").slice(-10) : "";
    const cleanEmail = filter.email?.toLowerCase().trim() || "";

    return all.filter((b) => {
      const bEmail = b.guest.email.toLowerCase().trim();
      const bPhone = b.guest.phone.replace(/[^0-9]/g, "").slice(-10);
      if (cleanEmail && bEmail && cleanEmail === bEmail) return true;
      if (cleanPhone && bPhone && cleanPhone === bPhone) return true;
      return false;
    });
  }

  /**
   * Reset store (for testing purposes)
   */
  static resetStoreForTesting(): void {
    isTestIsolatedStore = true;
    globalBookingsMap.clear();
  }

}



export async function getAdminDashboardStats(): Promise<DashboardStats> {
  return BookingService.getAdminStats();
}

