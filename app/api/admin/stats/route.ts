import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardStats } from "@/lib/booking-service";
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

    const stats = await getAdminDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard statistics.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

