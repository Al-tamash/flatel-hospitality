import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/lib/inventory-service";
import { verifyAdminRequest } from "@/lib/auth-guard";
import { isSupportedImageSource } from "@/lib/r2/upload";

/** Mirrors the create-time rules for whichever fields an edit actually sends. */
function validateUnitUpdates(updates: Record<string, unknown>): string | null {
  const isCount = (value: unknown, min: number) => typeof value === "number" && Number.isSafeInteger(value) && value >= min;

  if (updates.title !== undefined && (typeof updates.title !== "string" || !updates.title.trim() || updates.title.length > 100)) {
    return "Enter a title up to 100 characters.";
  }
  if (updates.category !== undefined && !["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].includes(updates.category as string)) {
    return "Choose a valid flat category.";
  }
  if (updates.basePricePerNight !== undefined && !isCount(updates.basePricePerNight, 1)) return "Enter a valid nightly price.";
  if (updates.baseAdults !== undefined && !isCount(updates.baseAdults, 1)) return "Enter a valid base adult count.";
  if (updates.maxAdults !== undefined && !isCount(updates.maxAdults, 1)) return "Enter a valid maximum adult count.";
  if (
    typeof updates.baseAdults === "number" &&
    typeof updates.maxAdults === "number" &&
    updates.maxAdults < updates.baseAdults
  ) {
    return "Maximum adults cannot be below the base adults.";
  }
  if (updates.maxKids !== undefined && !isCount(updates.maxKids, 0)) return "Enter a valid child capacity.";
  if (updates.extraPersonFeePerNight !== undefined && !isCount(updates.extraPersonFeePerNight, 0)) return "Enter a valid extra-person fee.";
  if (updates.totalUnits !== undefined && !isCount(updates.totalUnits, 1)) return "Enter a valid unit count.";

  if (updates.images !== undefined) {
    const images = updates.images;
    if (
      !Array.isArray(images) ||
      images.length === 0 ||
      images.length > 12 ||
      !images.every((image) => typeof image === "string" && isSupportedImageSource(image.trim()))
    ) {
      return "Add between 1 and 12 photos hosted on the photo storage or this site.";
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRequest(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized access." },
        { status: authCheck.status || 401 }
      );
    }

    const units = await InventoryService.getAllUnits({ includeInactive: true });
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
    const {
      title,
      category,
      slug,
      branchSlug,
      basePricePerNight,
      baseAdults,
      maxAdults,
      maxKids,
      extraPersonFeePerNight,
      totalUnits,
      images,
      isAvailable,
    } = body;

    const allowedCategories = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];
    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const cleanSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
    const cleanBranchSlug = typeof branchSlug === "string" ? branchSlug.trim().toLowerCase() : "";
    const price = Number(basePricePerNight);
    const baseAdultCount = Number(baseAdults);
    const maxAdultCount = Number(maxAdults);
    const childCount = Number(maxKids);
    const extraFee = Number(extraPersonFeePerNight);
    const unitCount = Number(totalUnits);
    const cleanImages = Array.isArray(images)
      ? images.filter((image): image is string => typeof image === "string" && image.trim().length > 0).map((image) => image.trim())
      : [];
    const allowedAmenityNames = [
      "Split Air Conditioning",
      "High-Speed Fiber Wi-Fi",
      "Private Modular Kitchen",
      "Smart Android TV",
      "Double-Door Refrigerator",
      "Laundry Washing Machine",
      "Free Covered Parking",
      "100% Inverter Backup",
      "Passenger Elevator Lift",
      "Water Softening Geyser",
      "Alternate-Day Housekeeping",
      "24/7 Security CCTV",
    ];
    const allowedAmenityIcons = ["Wifi", "UtensilsCrossed", "Flame", "Tv", "Refrigerator", "ArrowUpDown", "Droplets", "Zap"];
    const requestedAmenities = Array.isArray(body.amenities) ? body.amenities : [];
    const validAmenities = requestedAmenities.every((amenity: unknown) => {
      if (!amenity || typeof amenity !== "object") return false;
      const record = amenity as Record<string, unknown>;
      return typeof record.name === "string" && allowedAmenityNames.includes(record.name) &&
        typeof record.iconName === "string" && allowedAmenityIcons.includes(record.iconName) &&
        (record.description === undefined || (typeof record.description === "string" && record.description.length <= 160));
    });
    const specs = body.specs && typeof body.specs === "object" ? body.specs as Record<string, unknown> : {};
    const descriptionFields = [body.shortDescription, body.fullDescription, specs.guests, specs.bedrooms, specs.bathroom, specs.kitchen];
    const hasRequiredDescriptions = descriptionFields.every((value) => typeof value === "string" && value.trim().length > 0);
    const branches = await InventoryService.getAllBranches();

    if (!cleanTitle || cleanTitle.length > 100 || !cleanSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug) || cleanSlug.length > 60 || !cleanBranchSlug || !allowedCategories.includes(category) || !branches.some((branch) => branch.slug === cleanBranchSlug) || !Number.isSafeInteger(price) || price <= 0 || !Number.isSafeInteger(baseAdultCount) || baseAdultCount < 1 || !Number.isSafeInteger(maxAdultCount) || maxAdultCount < baseAdultCount || !Number.isSafeInteger(childCount) || childCount < 0 || !Number.isSafeInteger(extraFee) || extraFee < 0 || !Number.isSafeInteger(unitCount) || unitCount < 1 || cleanImages.length === 0 || cleanImages.length > 12 || !cleanImages.every(isSupportedImageSource) || !hasRequiredDescriptions || !validAmenities) {
      return NextResponse.json(
        { success: false, error: "Enter a valid category, branch, price, capacity, at least one photo, and verified residence details." },
        { status: 400 }
      );
    }

    const created = await InventoryService.createUnit({
      title: cleanTitle,
      category,
      slug: cleanSlug,
      branchSlug: cleanBranchSlug,
      basePricePerNight: price,
      baseAdults: baseAdultCount,
      maxAdults: maxAdultCount,
      maxKids: childCount,
      extraPersonFeePerNight: extraFee,
      totalUnits: unitCount,
      images: cleanImages,
      isAvailable: isAvailable ?? true,
      shortDescription: (body.shortDescription as string).trim(),
      fullDescription: (body.fullDescription as string).trim(),
      specs: Object.fromEntries(Object.entries(specs).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])),
      amenities: requestedAmenities,
      landmarks: body.landmarks,
    });

    return NextResponse.json({ success: true, unit: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create unit.";
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
    const { slug, ...updates } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing unit slug." }, { status: 400 });
    }

    const invalid = validateUnitUpdates(updates);
    if (invalid) {
      return NextResponse.json({ success: false, error: invalid }, { status: 400 });
    }

    const updated = await InventoryService.updateUnit(slug, updates);
    return NextResponse.json({ success: true, unit: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update unit.";
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
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing unit slug." }, { status: 400 });
    }

    await InventoryService.deleteUnit(slug);
    return NextResponse.json({ success: true, message: `Unit ${slug} deleted successfully.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete unit.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

