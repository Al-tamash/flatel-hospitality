import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { BookingService } from "@/lib/booking-service";
import { MembershipService } from "@/lib/membership/membership-service";

/**
 * Razorpay Webhook Handler
 * Idempotently processes payment captured / failed events and dispatches notifications
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) {
      return NextResponse.json({ success: false, error: "Webhook signature verification is unavailable." }, { status: 401 });
    }
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest();
    const receivedSignature = Buffer.from(signature, "hex");
    if (!crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const bookingId =
      paymentEntity?.notes?.bookingId || orderEntity?.notes?.bookingId;
    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || orderEntity?.id;

    const groupCode = paymentEntity?.notes?.groupCode || orderEntity?.notes?.groupCode;
    if (groupCode && !bookingId) {
      if (event === "payment.captured" || event === "order.paid") {
        if (!paymentId || !orderId) {
          return NextResponse.json({ success: false, error: "Captured payment reference is missing." }, { status: 400 });
        }
        const group = await BookingService.confirmGroupPayment({ groupCode, orderId, paymentId }, true);
        return NextResponse.json({ received: true, event, flats: group.length });
      }
      if (event === "payment.failed") {
        await BookingService.markGroupFailed(groupCode, paymentEntity?.error_description || "Payment failed via gateway.");
        return NextResponse.json({ received: true, event });
      }
      return NextResponse.json({ received: true, event });
    }

    const membershipId = paymentEntity?.notes?.membershipId || orderEntity?.notes?.membershipId;
    if (membershipId && !bookingId) {
      if (event === "payment.captured" || event === "order.paid") {
        if (!paymentId || !orderId) {
          return NextResponse.json({ success: false, error: "Captured payment reference is missing." }, { status: 400 });
        }
        const member = await MembershipService.activate(
          { membershipId, orderId, paymentId, paidAmountPaise: paymentEntity?.amount },
          true
        );
        return NextResponse.json({ received: true, event, membershipStatus: member.status });
      }
      if (event === "payment.failed") {
        await MembershipService.markFailed(membershipId);
        return NextResponse.json({ received: true, event });
      }
      return NextResponse.json({ received: true, event });
    }

    if (!bookingId) {
      // Event without booking ID notes (e.g. external transaction)
      return NextResponse.json({ received: true, note: "No booking ID in notes" });
    }

    if (event === "payment.captured" || event === "order.paid") {
      if (!paymentId) {
        return NextResponse.json({ success: false, error: "Captured payment reference is missing." }, { status: 400 });
      }
      // Idempotently confirm payment
      const booking = await BookingService.confirmPayment({
        bookingId,
        orderId,
        paymentId,
      }, true);

      return NextResponse.json({
        received: true,
        event,
        bookingCode: booking.bookingCode,
        status: booking.bookingStatus,
        notificationStatus: booking.notificationStatus,
      });
    }

    if (event === "payment.failed") {
      const failedBooking = await BookingService.markPaymentFailed(
        bookingId,
        paymentEntity?.error_description || "Payment failed via gateway."
      );

      return NextResponse.json({
        received: true,
        event,
        bookingCode: failedBooking.bookingCode,
        status: failedBooking.bookingStatus,
      });
    }

    return NextResponse.json({ received: true, event });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
