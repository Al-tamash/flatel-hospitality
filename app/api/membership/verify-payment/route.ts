import { NextRequest, NextResponse } from "next/server";
import { MembershipService } from "@/lib/membership/membership-service";

/** Confirms a membership payment (signature checked) and returns the new Member ID. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { membershipId, orderId, paymentId, signature, paymentFailed } = (body ?? {}) as Record<string, unknown>;

    if (typeof membershipId !== "string" || !membershipId) {
      return NextResponse.json({ success: false, error: "Missing membership reference." }, { status: 400 });
    }

    if (paymentFailed === true) {
      await MembershipService.markFailed(membershipId);
      return NextResponse.json({ success: false, error: "Payment was not completed. No membership was issued." }, { status: 400 });
    }

    if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string") {
      return NextResponse.json({ success: false, error: "Payment reference is incomplete." }, { status: 400 });
    }

    const member = await MembershipService.activate({ membershipId, orderId, paymentId, signature });
    return NextResponse.json({
      success: true,
      memberCode: member.memberCode,
      fullName: member.fullName,
      tier: member.tier,
      validUntil: member.validUntil,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
