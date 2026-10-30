import { NextRequest, NextResponse } from "next/server";
import { getMembershipTier, isMembershipTier } from "@/lib/membership/membership-content";
import { MembershipService, MembershipUnavailableError } from "@/lib/membership/membership-service";
import { getPaymentConfigError, getRazorpayClient } from "@/lib/razorpay/client";

/** Starts a Golden or Platinum purchase: saves a pending member and opens a Razorpay order. */
export async function POST(req: NextRequest) {
  try {
    const configError = getPaymentConfigError();
    if (configError) {
      return NextResponse.json({ success: false, error: configError }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Missing membership details." }, { status: 400 });
    }
    const { fullName, email, phone, tier } = body as Record<string, unknown>;
    if (typeof fullName !== "string" || typeof email !== "string" || typeof phone !== "string") {
      return NextResponse.json({ success: false, error: "Name, email and mobile number are required." }, { status: 400 });
    }
    if (!isMembershipTier(tier)) {
      return NextResponse.json({ success: false, error: "Choose the Golden or Platinum card." }, { status: 400 });
    }

    // The price comes from the server-side tier, never from the browser.
    const membership = await MembershipService.createPending({ fullName, email, phone, tier });

    let orderId: string;
    try {
      const order = await getRazorpayClient().orders.create({
        amount: membership.amountPaise,
        currency: "INR",
        receipt: `MEM-${membership.id.slice(0, 8).toUpperCase()}`,
        notes: { membershipId: membership.id, kind: "membership", tier: membership.tier },
      });
      orderId = order.id;
      await MembershipService.recordOrder(membership.id, orderId);
    } catch {
      await MembershipService.markFailed(membership.id);
      console.error("Razorpay membership order creation failed.");
      return NextResponse.json(
        { success: false, error: "Secure payment is temporarily unavailable. No payment was taken." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      membershipId: membership.id,
      orderId,
      amount: getMembershipTier(membership.tier).price,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    if (error instanceof MembershipUnavailableError) {
      return NextResponse.json({ success: false, error: error.message, unavailable: true }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Membership could not be started.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
