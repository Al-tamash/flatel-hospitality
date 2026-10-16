import { NextRequest, NextResponse } from "next/server";
import { CalendarService } from "@/lib/calendar-service";
import { verifyAdminRequest } from "@/lib/auth-guard";
import { InventoryService } from "@/lib/inventory-service";

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
    const unitSlug = searchParams.get("unitSlug") || undefined;

    const blockedDates = await CalendarService.getBlockedDates(unitSlug);

    return NextResponse.json({
      success: true,
      blockedDates,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load calendar blocks.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRequest(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized access." },
        { status: authCheck.status || 401 }
      );
    }

    const body = await req.json();
    const { unitId, startDate, endDate, reason } = body;

    if (!unitId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "unitId, startDate, and endDate are required." },
        { status: 400 }
      );
    }

    if (typeof unitId !== "string" || typeof startDate !== "string" || typeof endDate !== "string") {
      return NextResponse.json(
        { success: false, error: "Unit and dates must be valid text values." },
        { status: 400 }
      );
    }
    if (reason !== undefined && typeof reason !== "string") {
      return NextResponse.json(
        { success: false, error: "The maintenance note must be text." },
        { status: 400 }
      );
    }
    if (typeof reason === "string" && reason.length > 160) {
      return NextResponse.json(
        { success: false, error: "The maintenance note must be 160 characters or fewer." },
        { status: 400 }
      );
    }

    const units = await InventoryService.getAllUnits({ includeInactive: true });
    if (!units.some((unit) => unit.slug.toLowerCase() === unitId.trim().toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Select a valid residence unit." },
        { status: 400 }
      );
    }

    const created = await CalendarService.addBlockedDateRange(unitId, startDate, endDate, reason?.trim());
    return NextResponse.json({ success: true, blockedDates: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add calendar block.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRequest(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized access." },
        { status: authCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing blocked date ID." }, { status: 400 });
    }

    await CalendarService.removeBlockedDate(id);
    return NextResponse.json({ success: true, message: "Blocked date removed successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove blocked date.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
