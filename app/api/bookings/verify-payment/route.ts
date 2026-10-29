import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/booking-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, groupCode, orderId, paymentId, signature, paymentFailed, reason } = body;

    // Multi-flat booking: one payment confirms every flat in the group
    if (typeof groupCode === "string" && groupCode) {
      if (paymentFailed) {
        await BookingService.markGroupFailed(groupCode, reason || "Payment was declined or cancelled.");
        return NextResponse.json(
          { success: false, error: "Payment declined or failed. The booking has NOT been confirmed." },
          { status: 400 }
        );
      }
      if (!orderId || !paymentId) {
        return NextResponse.json({ success: false, error: "Missing payment transaction reference." }, { status: 400 });
      }
      const group = await BookingService.confirmGroupPayment({ groupCode, orderId, paymentId, signature });
      return NextResponse.json({
        success: true,
        bookingCode: groupCode,
        bookingId: group[0]?.id,
        paymentStatus: group[0]?.paymentStatus,
        bookingStatus: group[0]?.bookingStatus,
        flats: group.length,
        redirectUrl: `/booking-confirmation/${groupCode}`,
      });
    }

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Missing booking ID." },
        { status: 400 }
      );
    }

    // Handle payment failure simulation or webhook failure callback
    if (paymentFailed) {
      const failedBooking = await BookingService.markPaymentFailed(
        bookingId,
        reason || "Payment was declined or cancelled."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Payment declined or failed. The booking has NOT been confirmed.",
          bookingStatus: failedBooking.bookingStatus,
          paymentStatus: failedBooking.paymentStatus,
        },
        { status: 400 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Missing payment transaction reference." },
        { status: 400 }
      );
    }

    // Confirm payment and update booking record atomically
    const booking = await BookingService.confirmPayment({
      bookingId,
      orderId,
      paymentId,
      signature,
    });

    return NextResponse.json({
      success: true,
      bookingCode: booking.bookingCode,
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      redirectUrl: `/booking-confirmation/${booking.bookingCode}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
