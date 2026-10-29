import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/booking-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const booking = await BookingService.getBooking(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.bookingStatus !== "confirmed" || booking.paymentStatus !== "advance_paid") {
      return NextResponse.json(
        { success: false, error: "This reservation has not been confirmed." },
        { status: 409 }
      );
    }

    // Multi-flat booking: return every flat so the confirmation can show them together
    const group = booking.groupCode ? await BookingService.getBookingsByGroup(booking.groupCode) : [];

    return NextResponse.json({
      success: true,
      booking,
      group: group.length > 1 ? group : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve booking.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
