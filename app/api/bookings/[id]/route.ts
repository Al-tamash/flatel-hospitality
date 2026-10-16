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

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve booking.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
