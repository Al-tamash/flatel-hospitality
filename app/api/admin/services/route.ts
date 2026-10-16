import { NextRequest, NextResponse } from "next/server";
import { AddonService } from "@/lib/addon-service";
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

    const addons = await AddonService.getAllAddons();
    const packages = await AddonService.getDynamicPurposePackages();

    return NextResponse.json({
      success: true,
      addons,
      packages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load services.";
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
    const { id, purpose_tag, service_name, is_free, pricing_type, price, disclaimer } = body;

    const allowedPurposes = ["medical", "tourism", "corporate", "family", "wedding"];
    const cleanId = typeof id === "string" ? id.trim().toLowerCase() : "";
    const cleanName = typeof service_name === "string" ? service_name.trim() : "";
    const cleanDisclaimer = typeof disclaimer === "string" ? disclaimer.trim() : "";
    const cleanPrice = price === null || price === undefined ? null : Number(price);
    const validPricingType = is_free
      ? pricing_type === "free"
      : ["per_booking", "per_night", "quote"].includes(pricing_type);

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanId) ||
      cleanId.length > 80 ||
      !allowedPurposes.includes(purpose_tag) ||
      !cleanName || cleanName.length > 100 ||
      typeof is_free !== "boolean" ||
      !validPricingType ||
      (pricing_type === "quote" ? cleanPrice !== null : !is_free && (!Number.isSafeInteger(cleanPrice) || cleanPrice === null || cleanPrice <= 0)) ||
      (disclaimer !== null && disclaimer !== undefined && typeof disclaimer !== "string") ||
      cleanDisclaimer.length > 240
    ) {
      return NextResponse.json(
        { success: false, error: "Enter a valid service name, category, pricing type, and price." },
        { status: 400 }
      );
    }

    const created = await AddonService.createAddon({
      id: cleanId,
      purpose_tag,
      service_name: cleanName,
      is_free,
      pricing_type,
      price: is_free || pricing_type === "quote" ? null : cleanPrice,
      disclaimer: cleanDisclaimer || undefined,
      is_active: true,
    });

    return NextResponse.json({ success: true, addon: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create addon service.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing addon service ID." }, { status: 400 });
    }

    const updated = await AddonService.updateAddon(id, updates);
    return NextResponse.json({ success: true, addon: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update addon service.";
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
      return NextResponse.json({ success: false, error: "Missing addon service ID." }, { status: 400 });
    }

    await AddonService.deleteAddon(id);
    return NextResponse.json({ success: true, message: `Addon ${id} deleted successfully.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete addon service.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
