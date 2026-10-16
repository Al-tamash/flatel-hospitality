import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/booking-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!unitId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: "unitId, checkIn, and checkOut are required." },
        { status: 400 }
      );
    }

    const result = await BookingService.checkAvailability(unitId, checkIn, checkOut);

    return NextResponse.json({
      success: true,
      available: result.available,
      reason: result.reason,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify availability.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
