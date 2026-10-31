import { NextRequest, NextResponse } from "next/server";
import { BookingService, type CreateGroupBookingData } from "@/lib/booking-service";
import { parseCart, encodeCart } from "@/lib/booking/cart";
import { getPaymentConfigError, getRazorpayClient } from "@/lib/razorpay/client";

/** Starts a multi-flat booking: holds every flat, then opens one Razorpay order for the combined advance. */
export async function POST(req: NextRequest) {
  try {
    const configError = getPaymentConfigError();
    if (configError) {
      return NextResponse.json({ success: false, error: configError }, { status: 503 });
    }

    const body = (await req.json().catch(() => null)) as (Partial<CreateGroupBookingData> & { cart?: string }) | null;
    if (!body || !body.checkInDate || !body.checkOutDate || !body.guest) {
      return NextResponse.json({ success: false, error: "Missing required booking fields." }, { status: 400 });
    }
    if (!body.guest.fullName || !body.guest.email || !body.guest.phone) {
      return NextResponse.json(
        { success: false, error: "Guest full name, email, and phone number are required." },
        { status: 400 }
      );
    }

    // Items arrive as the cart string or as a parsed list; both go through the same strict parser.
    const items = parseCart(typeof body.cart === "string" ? body.cart : Array.isArray(body.items) ? encodeCart(body.items) : null);
    if (!items || items.length < 2) {
      return NextResponse.json({ success: false, error: "Choose between 2 and 4 flats for a combined booking." }, { status: 400 });
    }

    const { groupCode, bookings, totals, advancePayablePaise } = await BookingService.createGroupIntent({
      items,
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      stayPurpose: body.stayPurpose ?? "accommodation_only",
      // Only the ids are read; names and prices come from the server's own catalog
      selectedAddons: Array.isArray(body.selectedAddons) ? body.selectedAddons : [],
      memberCode: body.memberCode,
      guest: body.guest,
    });

    let orderId: string;
    try {
      const order = await getRazorpayClient().orders.create({
        amount: advancePayablePaise,
        currency: "INR",
        receipt: groupCode,
        notes: { groupCode, kind: "booking_group", flats: String(bookings.length) },
      });
      orderId = order.id;
      // One row per flat so each flat's deposit is checked on its own when the payment lands
      for (const booking of bookings) {
        await BookingService.recordPaymentOrder(booking.id, orderId, booking.pricing.advancePayable * 100);
      }
    } catch {
      await BookingService.markGroupFailed(groupCode, "Payment order could not be created; no payment was attempted.");
      console.error("Razorpay group order creation failed.");
      return NextResponse.json(
        { success: false, error: "Secure payment is temporarily unavailable. No payment was taken." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      groupCode,
      bookingCode: groupCode,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        bookingCode: booking.bookingCode,
        unitId: booking.unitId,
        pricing: booking.pricing,
      })),
      totals,
      orderId,
      advancePayable: totals.advancePayable,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initiate reservation.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
