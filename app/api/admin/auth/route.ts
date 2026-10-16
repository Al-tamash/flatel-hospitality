import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  ADMIN_COOKIE_NAME,
  signAdminToken,
  verifyAdminRequest,
} from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const check = await verifyAdminRequest(req);
  return NextResponse.json({
    authorized: check.authorized,
    email: check.email || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password } = body;

    // 1. Admin Logout
    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Signed out of admin portal.",
      });
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: "",
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
      });
      return response;
    }

    // Admin sessions can only be established after Supabase verifies the owner credentials.
    if (action === "login") {
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: "Only authorized administrator credentials may log in here." },
          { status: 403 }
        );
      }

      let isSupabaseValid = false;
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: String(password || ""),
        });
        if (!error && data.user) {
          isSupabaseValid = true;
        }
      } catch {
        // Authentication remains unavailable when Supabase cannot verify credentials.
      }

      if (!isSupabaseValid) {
        return NextResponse.json(
          { success: false, error: "Invalid administrator credentials." },
          { status: 401 }
        );
      }

      const token = signAdminToken();
      const response = NextResponse.json({
        success: true,
        email: ADMIN_EMAIL,
        message: "Admin session authenticated successfully.",
      });
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
