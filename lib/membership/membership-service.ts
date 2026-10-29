import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBERSHIP } from "@/lib/membership/membership-content";
import { notifyMembershipJoined } from "@/lib/notifications/dispatch";

/** Unambiguous characters only (no 0/O, 1/I/L) so a member can read the ID out over the phone. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_CODE_ATTEMPTS = 6;

export interface MembershipRecord {
  id: string;
  memberCode: string | null;
  fullName: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "expired" | "cancelled" | "failed";
  amountPaise: number;
  razorpayOrderId: string | null;
  validFrom: string | null;
  validUntil: string | null;
}

/** A verified member whose rate can be applied to a booking. */
export interface VerifiedMember {
  id: string;
  fullName: string;
  memberCode: string;
  validUntil: string;
}

export class MembershipUnavailableError extends Error {
  constructor() {
    super("Membership is not available yet. Please contact us on WhatsApp to join.");
  }
}

function mapRow(row: Record<string, unknown>): MembershipRecord {
  return {
    id: String(row.id),
    memberCode: row.member_code ? String(row.member_code) : null,
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: row.status as MembershipRecord["status"],
    amountPaise: Number(row.amount_paise ?? 0),
    razorpayOrderId: row.razorpay_order_id ? String(row.razorpay_order_id) : null,
    validFrom: row.valid_from ? String(row.valid_from) : null,
    validUntil: row.valid_until ? String(row.valid_until) : null,
  };
}

/** Last 10 digits, so "+91 79891 00711" and "7989100711" compare equal. */
export function normalizePhone(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(-10);
}

export function normalizeMemberCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateMemberCode(): string {
  let suffix = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    suffix += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return `FL-${suffix}`;
}

export function addMonths(from: Date, months: number): Date {
  const result = new Date(from.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

/** The table is created by supabase/migrations/20261029_memberships.sql. */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /memberships/i.test(error.message ?? "") && /does not exist|schema cache/i.test(error.message ?? "");
}

export class MembershipService {
  /** Creates a pending membership, refusing a second purchase while one is still active. */
  static async createPending(input: { fullName: string; email: string; phone: string }): Promise<MembershipRecord> {
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();

    if (fullName.length < 3 || fullName.length > 120) throw new Error("Enter your full name (at least 3 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) throw new Error("Enter a valid email address.");
    if (normalizePhone(phone).length < 10) throw new Error("Enter a valid 10-digit mobile number.");

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("memberships")
      .select("id")
      .eq("status", "active")
      .gt("valid_until", new Date().toISOString())
      .eq("email", email)
      .limit(1);
    if (isMissingTable(lookupError)) throw new MembershipUnavailableError();
    if (lookupError) throw new Error("Membership could not be started. Please try again.");
    if (existing && existing.length > 0) {
      throw new Error("An active membership already exists for this email. Use your Member ID when booking, or contact us for help.");
    }

    const { data, error } = await supabase
      .from("memberships")
      .insert({
        full_name: fullName,
        email,
        phone,
        status: "pending",
        amount_paise: MEMBERSHIP.price * 100,
        currency: "INR",
      })
      .select("*")
      .single();
    if (isMissingTable(error)) throw new MembershipUnavailableError();
    if (error || !data) throw new Error("Membership could not be started. Please try again.");
    return mapRow(data);
  }

  static async recordOrder(id: string, orderId: string): Promise<void> {
    const { error } = await createAdminClient()
      .from("memberships")
      .update({ razorpay_order_id: orderId, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error("Membership payment could not be recorded.");
  }

  static async getById(id: string): Promise<MembershipRecord | null> {
    const { data, error } = await createAdminClient().from("memberships").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
  }

  /**
   * Activates a paid membership and issues its Member ID. Safe to call twice
   * (browser callback and webhook): an already-active membership is returned as is.
   */
  static async activate(
    input: { membershipId: string; orderId: string; paymentId: string; signature?: string; paidAmountPaise?: number },
    trustedWebhook = false
  ): Promise<MembershipRecord> {
    const membership = await this.getById(input.membershipId);
    if (!membership) throw new Error("Membership not found.");
    if (membership.status === "active" && membership.memberCode) return membership;
    if (membership.status === "cancelled") throw new Error("This membership was cancelled.");

    if (!membership.razorpayOrderId || membership.razorpayOrderId !== input.orderId) {
      throw new Error("Payment order does not match this membership.");
    }
    if (input.paidAmountPaise !== undefined && input.paidAmountPaise !== membership.amountPaise) {
      throw new Error("Payment amount does not match the membership fee.");
    }

    if (!trustedWebhook) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret || !input.signature) {
        throw new Error("Payment could not be verified. Please contact support before retrying.");
      }
      const expected = crypto.createHmac("sha256", keySecret).update(`${input.orderId}|${input.paymentId}`).digest();
      const received = /^[a-f0-9]{64}$/i.test(input.signature) ? Buffer.from(input.signature, "hex") : Buffer.alloc(0);
      if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
        throw new Error("Invalid payment signature verification failed.");
      }
    }

    const supabase = createAdminClient();
    const now = new Date();
    const validUntil = addMonths(now, MEMBERSHIP.validityMonths);

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const { data, error } = await supabase
        .from("memberships")
        .update({
          status: "active",
          member_code: generateMemberCode(),
          razorpay_payment_id: input.paymentId,
          valid_from: now.toISOString(),
          valid_until: validUntil.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", membership.id)
        .in("status", ["pending", "failed"])
        .select("*")
        .maybeSingle();

      if (!error && data) {
        const activated = mapRow(data);
        await notifyMembershipJoined(activated);
        return activated;
      }
      if (error?.code === "23505") continue; // member code collision: draw another
      if (error) throw new Error("Payment was verified, but the membership could not be saved. Contact support before retrying.");

      // No row updated: another request activated it first.
      const current = await this.getById(membership.id);
      if (current?.status === "active") return current;
      throw new Error("Membership could not be activated.");
    }
    throw new Error("Membership could not be activated. Contact support before retrying.");
  }


  /** Admin list, newest first. Pending and failed attempts are included so unpaid starts are visible. */
  static async listAll(filters?: { status?: string; query?: string }): Promise<MembershipRecord[]> {
    let query = createAdminClient().from("memberships").select("*").order("created_at", { ascending: false }).limit(500);
    if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
    const { data, error } = await query;
    if (isMissingTable(error)) throw new MembershipUnavailableError();
    if (error || !data) throw new Error("Members could not be loaded.");

    const needle = filters?.query?.trim().toLowerCase();
    const rows = data.map(mapRow);
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.fullName, row.email, row.phone, row.memberCode ?? ""].some((value) => value.toLowerCase().includes(needle))
    );
  }

  static async cancel(id: string): Promise<MembershipRecord> {
    const { data, error } = await createAdminClient()
      .from("memberships")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error || !data) throw new Error("Membership could not be cancelled.");
    return mapRow(data);
  }

  /** Marks memberships past their end date as expired; returns how many changed. */
  static async expireOverdue(): Promise<number> {
    const { data, error } = await createAdminClient()
      .from("memberships")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("status", "active")
      .lt("valid_until", new Date().toISOString())
      .select("id");
    if (isMissingTable(error)) throw new MembershipUnavailableError();
    if (error) throw new Error("Expired memberships could not be updated.");
    return data?.length ?? 0;
  }

  /** Active members ending within `days` who have not had a reminder yet. */
  static async findEndingSoon(days: number): Promise<MembershipRecord[]> {
    const horizon = new Date(Date.now() + days * 86_400_000).toISOString();
    const { data, error } = await createAdminClient()
      .from("memberships")
      .select("*")
      .eq("status", "active")
      .is("reminder_sent_at", null)
      .gt("valid_until", new Date().toISOString())
      .lte("valid_until", horizon);
    if (error || !data) return [];
    return data.map(mapRow);
  }

  static async markReminderSent(id: string): Promise<void> {
    await createAdminClient()
      .from("memberships")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", id);
  }

  static async markFailed(id: string): Promise<void> {
    await createAdminClient()
      .from("memberships")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending");
  }

  /**
   * Finds an active member for a Member ID, but only when the booking's email or
   * phone matches the membership, so a shared ID alone does not unlock the rate.
   * Every failure returns null so callers cannot tell "unknown ID" from "wrong contact".
   */
  static async findForBooking(input: {
    code: string;
    email?: string;
    phone?: string;
    stayStart?: string;
  }): Promise<VerifiedMember | null> {
    const code = normalizeMemberCode(input.code);
    if (!/^FL-[A-Z0-9]{6}$/.test(code)) return null;

    const { data, error } = await createAdminClient().from("memberships").select("*").eq("member_code", code).maybeSingle();
    if (error || !data) return null;
    const member = mapRow(data);

    const stayStart = input.stayStart ? new Date(input.stayStart) : new Date();
    const checkAt = Number.isNaN(stayStart.getTime()) ? new Date() : stayStart;
    if (member.status !== "active" || !member.validUntil || new Date(member.validUntil) < checkAt) return null;

    const emailMatches = Boolean(input.email) && member.email.toLowerCase() === input.email!.trim().toLowerCase();
    const phoneMatches = Boolean(input.phone) && normalizePhone(member.phone) === normalizePhone(input.phone!);
    if (!emailMatches && !phoneMatches) return null;

    return { id: member.id, fullName: member.fullName, memberCode: code, validUntil: member.validUntil };
  }
}
