import { NextRequest } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "reservation@flatel.in";
export const ADMIN_COOKIE_NAME = "flatel_admin_token";

function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  return secret && secret.length >= 32 ? secret : null;
}

/**
 * Generates an HMAC-SHA256 signed admin session token.
 * Valid for 7 days.
 */
export function signAdminToken(): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Admin session signing is unavailable. Configure ADMIN_SECRET_KEY with at least 32 characters.");
  }
  const timestamp = Date.now().toString();
  const data = `${ADMIN_EMAIL}:${timestamp}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Validates an admin session token signature and expiration.
 */
export function verifyAdminToken(token: string): boolean {
  try {
    if (!token || !token.includes(".")) return false;
    const [timestampStr, signature] = token.split(".");
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || timestamp > Date.now()) return false;

    // Check expiration (7 days TTL)
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > sevenDaysMs) return false;

    const secret = getAdminSecret();
    if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
    const expectedData = `${ADMIN_EMAIL}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(expectedData)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

export interface AdminAuthResult {
  authorized: boolean;
  email?: string;
  error?: string;
  status?: number;
}

/**
 * Verifies that an incoming NextRequest has verified administrative privileges.
 * Supports:
 * 1. Admin session cookie (`flatel_admin_token`)
 * 2. Supabase Auth Session cookie with owner email (`reservation@flatel.in`)
 * 3. Secret Bearer token or `x-admin-key` header matching ADMIN_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const secret = getAdminSecret();

  // 1. Check Header (API Token / Secret Key)
  const authHeader = req.headers.get("authorization") || "";
  const adminKeyHeader = req.headers.get("x-admin-key") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (
    (secret && token && token === secret) ||
    (secret && adminKeyHeader && adminKeyHeader === secret)
  ) {
    return { authorized: true, email: ADMIN_EMAIL };
  }

  // 2. Check signed Admin Session Cookie
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (adminCookie && verifyAdminToken(adminCookie)) {
      return { authorized: true, email: ADMIN_EMAIL };
    }
  } catch {
    // Cookie read failed, continue to Supabase check
  }

  // 3. Check Live Supabase Auth Session
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user && user.email) {
      if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return { authorized: true, email: user.email };
      }
    }
  } catch {
    // Supabase auth check failed
  }

  return {
    authorized: false,
    error: "Unauthorized: Administrative privileges required.",
    status: 401,
  };
}

export interface GuestAuthResult {
  authorized: boolean;
  userEmail?: string;
  userPhone?: string;
  error?: string;
  status?: number;
}

/**
 * Verifies that a request to guest reservation endpoints is authorized.
 * Either the caller is an admin or the caller owns the email/phone requested.
 */
export async function verifyGuestRequest(
  req: NextRequest,
  requestedEmail?: string,
  requestedPhone?: string
): Promise<GuestAuthResult> {
  // If caller is admin, grant access to view requested guest bookings
  const adminCheck = await verifyAdminRequest(req);
  if (adminCheck.authorized) {
    return { authorized: true };
  }

  // Otherwise, verify Supabase guest session
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      const userEmail = user.email?.toLowerCase();
      const userPhone = user.user_metadata?.phone?.replace(/[^0-9]/g, "").slice(-10);

      const targetEmail = requestedEmail?.toLowerCase().trim();
      const targetPhone = requestedPhone?.replace(/[^0-9]/g, "").slice(-10);

      // Must match at least one verified credential
      if (
        (targetEmail && userEmail && targetEmail === userEmail) ||
        (targetPhone && userPhone && targetPhone === userPhone)
      ) {
        return {
          authorized: true,
          userEmail: user.email,
          userPhone: user.user_metadata?.phone,
        };
      }
    }
  } catch {
    // Ignore error
  }

  return {
    authorized: false,
    error: "Unauthorized: You must be logged into the account associated with these reservations.",
    status: 401,
  };
}
