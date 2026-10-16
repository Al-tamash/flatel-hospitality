import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/inventory-service";

export async function GET() {
  try {
    const units = await InventoryService.getAllUnits();
    const branches = await InventoryService.getAllBranches();

    return NextResponse.json({
      success: true,
      units,
      branches,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load inventory.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
