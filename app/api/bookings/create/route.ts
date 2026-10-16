import { NextRequest, NextResponse } from "next/server";
import { BookingService, CreateBookingData } from "@/lib/booking-service";
import { getRazorpayClient } from "@/lib/razorpay/client";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const hasRazorpayCredentials = keyId.startsWith("rzp_") && keySecret.length > 0;
    const isNonProduction = process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

    if (!hasRazorpayCredentials || (isNonProduction && !keyId.startsWith("rzp_test_"))) {
      return NextResponse.json(
        { success: false, error: "Secure test payment is not configured for this environment." },
        { status: 503 }
      );
    }

    const body: CreateBookingData = await req.json();

    // 1. Basic body presence check
    if (!body.unitId || !body.checkInDate || !body.checkOutDate || !body.guest) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields." },
        { status: 400 }
      );
    }

    if (!body.guest.fullName || !body.guest.email || !body.guest.phone) {
      return NextResponse.json(
        { success: false, error: "Guest full name, email, and phone number are required." },
        { status: 400 }
      );
    }

    // 2. Server-side validation & booking intent creation
    const { booking, advancePayablePaise } = await BookingService.createBookingIntent(body);

    // 3. Create a real order in the configured Razorpay account; never mint test-shaped orders.
    let orderId: string;
    try {
      const razorpay = getRazorpayClient();
      const razorpayOrder = await razorpay.orders.create({
        amount: advancePayablePaise,
        currency: "INR",
        receipt: booking.bookingCode,
        notes: {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          property: booking.unitId,
          nights: booking.totalNights.toString(),
        },
      });
      orderId = razorpayOrder.id;
      await BookingService.recordPaymentOrder(booking.id, orderId, advancePayablePaise);
    } catch {
      await BookingService.markPaymentFailed(
        booking.id,
        "Payment order could not be created; no payment was attempted."
      );
      console.error("Razorpay order creation failed.");
      return NextResponse.json(
        { success: false, error: "Secure payment is temporarily unavailable. No payment was taken." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      pricing: booking.pricing,
      orderId,
      advancePayable: booking.pricing.advancePayable,
      currency: "INR",
      keyId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initiate reservation.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
