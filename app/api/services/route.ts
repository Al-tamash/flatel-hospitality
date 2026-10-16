import { NextResponse } from "next/server";
import { AddonService } from "@/lib/addon-service";

export async function GET() {
  try {
    const packages = await AddonService.getDynamicPurposePackages();
    const addons = await AddonService.getAllAddons({ onlyActive: true });

    return NextResponse.json({
      success: true,
      packages,
      addons,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load services.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
