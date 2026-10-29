import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth-guard";
import { MembershipService, MembershipUnavailableError } from "@/lib/membership/membership-service";
import { isEmailConfigured } from "@/lib/notifications/email";
import { notifyMembershipJoined } from "@/lib/notifications/dispatch";

async function requireAdmin(req: NextRequest) {
  const authCheck = await verifyAdminRequest(req);
  if (authCheck.authorized) return null;
  return NextResponse.json(
    { success: false, error: authCheck.error || "Unauthorized access." },
    { status: authCheck.status || 401 }
  );
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const members = await MembershipService.listAll({
      status: searchParams.get("status") ?? undefined,
      query: searchParams.get("query") ?? undefined,
    });
    return NextResponse.json({ success: true, members, emailConfigured: isEmailConfigured() });
  } catch (error: unknown) {
    if (error instanceof MembershipUnavailableError) {
      return NextResponse.json({ success: false, error: "The memberships table has not been created yet. Run the memberships migration in Supabase.", unavailable: true }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Failed to load members.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/** Admin actions on one member: cancel the membership, or email the Member ID again. */
export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = (await req.json().catch(() => null)) as { id?: unknown; action?: unknown } | null;
    if (!body || typeof body.id !== "string" || (body.action !== "cancel" && body.action !== "resend")) {
      return NextResponse.json({ success: false, error: "Choose a member and an action." }, { status: 400 });
    }

    if (body.action === "cancel") {
      const member = await MembershipService.cancel(body.id);
      return NextResponse.json({ success: true, member });
    }

    const member = await MembershipService.getById(body.id);
    if (!member || member.status !== "active") {
      return NextResponse.json({ success: false, error: "Only active members can be emailed their ID." }, { status: 400 });
    }
    if (!isEmailConfigured()) {
      return NextResponse.json({ success: false, error: "Email is not configured. Set RESEND_API_KEY and EMAIL_FROM." }, { status: 503 });
    }
    await notifyMembershipJoined(member);
    return NextResponse.json({ success: true, member });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Action failed.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
