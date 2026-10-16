import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/booking-service";
import { verifyAdminRequest } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRequest(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized access." },
        { status: authCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const query = searchParams.get("query") || undefined;
    const date = searchParams.get("date") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const bookings = await BookingService.listBookings({
      status,
      query,
      date,
      limit,
    });

    return NextResponse.json({
      success: true,
      bookings,
      total: bookings.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load bookings.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRequest(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized access." },
        { status: authCheck.status || 401 }
      );
    }

    const body = await req.json();
    const { id, balanceCollected, bookingStatus, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID." }, { status: 400 });
    }

    const updated = await BookingService.updateBooking(id, {
      balanceCollected,
      bookingStatus,
      paymentStatus,
    });

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update booking.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
