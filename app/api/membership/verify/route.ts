import { NextRequest, NextResponse } from "next/server";
import { MEMBERSHIP } from "@/lib/membership/membership-content";
import { MembershipService } from "@/lib/membership/membership-service";

/**
 * Checkout preview: is this Member ID valid for this guest? Answers are deliberately
 * uniform ("not valid") so the endpoint cannot be used to discover which IDs exist.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { code, email, phone, stayStart } = (body ?? {}) as Record<string, unknown>;

  const member =
    typeof code === "string"
      ? await MembershipService.findForBooking({
          code,
          email: typeof email === "string" ? email : undefined,
          phone: typeof phone === "string" ? phone : undefined,
          stayStart: typeof stayStart === "string" ? stayStart : undefined,
        }).catch(() => null)
      : null;

  if (!member) {
    return NextResponse.json({ success: false, error: "Member ID not valid for this email or phone number." }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    memberName: member.fullName,
    discountPercent: MEMBERSHIP.stayDiscountPercent,
    validUntil: member.validUntil,
  });
}
