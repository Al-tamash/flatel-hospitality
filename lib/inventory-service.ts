import { RoomDetail, MOCK_ROOMS, RoomSpec, RoomGalleryImage, Amenity, LandmarkItem } from "@/lib/mock-rooms";
import { BRANCHES, Branch } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CreateUnitInput {
  title: string;
  category: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
  slug: string;
  branchSlug: string;
  basePricePerNight: number;
  baseAdults: number;
  maxAdults: number;
  maxKids?: number | null;
  extraPersonFeePerNight?: number;
  totalUnits?: number;
  images?: string[];
  isAvailable?: boolean;
  shortDescription?: string;
  fullDescription?: string;
  specs?: Partial<RoomSpec>;
  amenities?: Amenity[];
  landmarks?: LandmarkItem[];
}

export interface UpdateUnitInput {
  title?: string;
  category?: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
  branchSlug?: string;
  basePricePerNight?: number;
  baseAdults?: number;
  maxAdults?: number;
  maxKids?: number | null;
  extraPersonFeePerNight?: number;
  totalUnits?: number;
  images?: string[];
  isAvailable?: boolean;
  shortDescription?: string;
  fullDescription?: string;
  specs?: Partial<RoomSpec>;
  amenities?: Amenity[];
  landmarks?: LandmarkItem[];
}

// In-memory runtime cache for high-speed sub-millisecond responses & offline resiliency
let inMemoryUnits: RoomDetail[] = [];
let lastFetchedAt = 0;
const CACHE_TTL_MS = 15000; // 15 seconds fresh cache, revalidates automatically

function mapDbRowToRoomDetail(row: Record<string, unknown>, branchSlug?: string): RoomDetail {
  const slug = String(row.slug || "").toLowerCase();
  const mockFallback = MOCK_ROOMS.find((m) => m.slug.toLowerCase() === slug || m.id.toLowerCase() === slug);

  const category = (row.category as RoomDetail["category"]) || (mockFallback?.category || "1BHK");
  const typeMapping: Record<string, RoomDetail["type"]> = {
    "1BHK": "1 BHK",
    "2BHK": "2 BHK",
    "3BHK": "3 BHK",
    "4BHK": "4 BHK",
    "5BHK": "5 BHK",
  };

  let metaData: {
    shortDescription?: string;
    fullDescription?: string;
    specs?: Partial<RoomSpec>;
    amenities?: Amenity[];
    landmarks?: LandmarkItem[];
  } = {};

  const rawImages: string[] = Array.isArray(row.images) ? (row.images as string[]) : [];
  const cleanImageUrls: string[] = [];

  for (const item of rawImages) {
    if (typeof item === "string" && item.startsWith("meta:")) {
      try {
        metaData = JSON.parse(item.slice(5));
      } catch (e) {
        console.warn("Failed to parse unit metadata string:", e);
      }
    } else if (typeof item === "string" && item.trim()) {
      cleanImageUrls.push(item);
    }
  }

  const finalImages = cleanImageUrls.length > 0
    ? cleanImageUrls
    : (mockFallback?.gallery.map((g) => g.url || "") || [`/images/flats/flat-${slug}-luxury.jpg`]);

  const gallery: RoomGalleryImage[] = finalImages.map((img, idx) => ({
    id: `${slug}-img-${idx + 1}`,
    category: (idx === 0 ? "Living Area" : idx === 1 ? "Bedroom" : idx === 2 ? "Kitchen" : "Bathroom") as RoomGalleryImage["category"],
    alt: `${row.title || slug} Photography ${idx + 1}`,
    url: img,
  }));

  const baseAdults = Number(row.base_adults ?? mockFallback?.baseAdults ?? 2);
  const maxAdults = Number(row.max_adults ?? mockFallback?.maxAdults ?? 4);
  const maxExtra = Math.max(0, maxAdults - baseAdults);

  return {
    id: slug,
    slug,
    aliases: mockFallback?.aliases || [slug, `${slug}-flat`, `${slug}-suite`],
    type: typeMapping[category] || "1 BHK",
    category,
    title: String(row.title || mockFallback?.title || `${category} Luxury Residence`),
    shortDescription:
      metaData.shortDescription ||
      (typeof row.short_description === "string" && row.short_description) ||
      mockFallback?.shortDescription ||
      `Luxury fully furnished ${category} residence featuring premium kitchen, modern air conditioning, and front desk support in Hyderabad.`,
    fullDescription: metaData.fullDescription,
    basePricePerNight: Number(row.base_price_per_night ?? mockFallback?.basePricePerNight ?? 2000),
    baseAdults,
    maxExtraGuests: maxExtra,
    maxAdults,
    maxChildren: row.max_kids !== undefined ? (row.max_kids as number | null) : (mockFallback?.maxChildren ?? 2),
    childCapacityStatus: "confirmed",
    extraPersonFeePerNight: Number(row.extra_person_fee_per_night ?? mockFallback?.extraPersonFeePerNight ?? 500),
    totalUnits: Number(row.total_units ?? mockFallback?.totalUnits ?? 1),
    branchSlug: branchSlug || (row.branch_slug as string) || mockFallback?.branchSlug || "moghal-pura",
    isAvailable: row.is_available !== false,
    capacityLabel: `${baseAdults} Adults Base (Up to ${maxAdults} Guests)`,
    specs: {
      guests: metaData.specs?.guests || mockFallback?.specs?.guests || `Up to ${maxAdults} Guests`,
      bedrooms: metaData.specs?.bedrooms || mockFallback?.specs?.bedrooms || `${category.replace("BHK", "")} Master Bedrooms`,
      kitchen: metaData.specs?.kitchen || mockFallback?.specs?.kitchen || "Fully Equipped Modular Kitchen",
      bathroom: metaData.specs?.bathroom || mockFallback?.specs?.bathroom || "Modern Bathrooms with Softening Geysers",
    },
    gallery,
    amenities: metaData.amenities && metaData.amenities.length > 0 ? metaData.amenities : (mockFallback?.amenities || [
      { name: "High-Speed Wi-Fi", iconName: "Wifi" },
      { name: "Air Conditioning", iconName: "Flame" },
      { name: "Smart Android TV", iconName: "Tv" },
      { name: "Double-Door Refrigerator", iconName: "Refrigerator" },
      { name: "Modular Gas Kitchen", iconName: "UtensilsCrossed" },
      { name: "Water Softening Geyser", iconName: "Droplets" },
      { name: "24/7 Power Inverter", iconName: "Zap" },
      { name: "Passenger Elevator", iconName: "ArrowUpDown" },
    ]),
    landmarks: metaData.landmarks && metaData.landmarks.length > 0 ? metaData.landmarks : undefined,
  };
}

export class InventoryService {
  /** Reads the live unit record for pricing and booking validation. */
  static async getAuthoritativeUnitBySlug(slug: string): Promise<RoomDetail> {
    const cleanSlug = slug.trim().toLowerCase();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("units")
      .select(`*, branches:branch_id (slug, name)`)
      .eq("slug", cleanSlug)
      .eq("is_available", true)
      .maybeSingle();

    if (error) throw new Error(`Could not verify property inventory: ${error.message}`);
    if (!data) throw new Error("This property is no longer available for booking.");
    const branchSlug = (data.branches as { slug?: string } | null)?.slug || "moghal-pura";
    return mapDbRowToRoomDetail(data, branchSlug);
  }

  /**
   * Fetches all units from Supabase or cached storage
   */
  static async getAllUnits(options?: { includeInactive?: boolean }): Promise<RoomDetail[]> {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    const shouldRefresh = now - lastFetchedAt > CACHE_TTL_MS;

    if (!shouldRefresh && lastFetchedAt > 0) {
      return options?.includeInactive ? inMemoryUnits : inMemoryUnits.filter((unit) => unit.isAvailable !== false);
    }

    try {
      const supabase = createAdminClient();
      const { data: dbUnits, error } = await supabase
        .from("units")
        .select(`
          *,
          branches:branch_id (
            slug,
            name
          )
        `)
        .order("base_price_per_night", { ascending: true });

      if (error) throw new Error(`Could not load property inventory: ${error.message}`);

      const mapped = (dbUnits || []).map((u) => {
        const bSlug = (u.branches as { slug?: string } | null)?.slug || "moghal-pura";
        return mapDbRowToRoomDetail(u, bSlug);
      });

      inMemoryUnits = mapped;
      lastFetchedAt = now;
      return options?.includeInactive ? mapped : mapped.filter((unit) => unit.isAvailable !== false);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Could not load property inventory.");
    }
  }

  /**
   * Fetches a single unit by slug or id
   */
  static async getUnitBySlug(slug: string): Promise<RoomDetail | null> {
    const cleanSlug = slug.trim().toLowerCase();
    const all = await this.getAllUnits({ includeInactive: true });
    
    const found = all.find(
      (u) =>
        u.slug.toLowerCase() === cleanSlug ||
        u.id.toLowerCase() === cleanSlug ||
        u.aliases?.some((a) => a.toLowerCase() === cleanSlug)
    );

    if (found) return found;

    // Check directly in Supabase if not found in list
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("units")
        .select(`
          *,
          branches:branch_id (
            slug,
            name
          )
        `)
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        const bSlug = (data.branches as { slug?: string } | null)?.slug || "moghal-pura";
        const mapped = mapDbRowToRoomDetail(data, bSlug);
        // update cache
        inMemoryUnits = [...inMemoryUnits.filter((u) => u.slug !== mapped.slug), mapped];
        return mapped;
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Fetches units assigned to a specific branch
   */
  static async getUnitsByBranch(branchSlug: string): Promise<RoomDetail[]> {
    const all = await this.getAllUnits();
    const clean = branchSlug.trim().toLowerCase();
    return all.filter((u) => (u.branchSlug || "").toLowerCase() === clean);
  }

  /**
   * Creates a new unit in Supabase and syncs to memory
   */
  static async createUnit(input: CreateUnitInput): Promise<RoomDetail> {
    const supabase = createAdminClient();

    // Look up branch_id
    const { data: branchData } = await supabase
      .from("branches")
      .select("id")
      .eq("slug", input.branchSlug)
      .maybeSingle();

    const branchId = branchData?.id || null;

    const cleanImages = (input.images || []).filter((img) => !img.startsWith("meta:"));
    if (cleanImages.length === 0) {
      cleanImages.push(`/images/flats/flat-${input.slug}-luxury.jpg`);
    }

    const metaPayload: Record<string, unknown> = {};
    if (input.shortDescription) metaPayload.shortDescription = input.shortDescription;
    if (input.fullDescription) metaPayload.fullDescription = input.fullDescription;
    if (input.specs) metaPayload.specs = input.specs;
    if (input.amenities) metaPayload.amenities = input.amenities;
    if (input.landmarks) metaPayload.landmarks = input.landmarks;

    const imagesToSave = Object.keys(metaPayload).length > 0
      ? [...cleanImages, `meta:${JSON.stringify(metaPayload)}`]
      : cleanImages;

    const payload = {
      branch_id: branchId,
      slug: input.slug.toLowerCase().trim(),
      title: input.title.trim(),
      category: input.category,
      base_price_per_night: input.basePricePerNight,
      base_adults: input.baseAdults,
      max_adults: input.maxAdults,
      max_kids: input.maxKids ?? 2,
      extra_person_fee_per_night: input.extraPersonFeePerNight ?? 500,
      total_units: input.totalUnits ?? 1,
      images: imagesToSave,
      is_available: input.isAvailable ?? true,
    };

    const { data, error } = await supabase
      .from("units")
      .insert(payload)
      .select(`
        *,
        branches:branch_id (
          slug,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create unit in database: ${error.message}`);
    }

    const bSlug = (data.branches as { slug?: string } | null)?.slug || input.branchSlug;
    const newDetail = mapDbRowToRoomDetail(data, bSlug);
    
    // Invalidate and refresh cache
    inMemoryUnits = [...inMemoryUnits.filter((u) => u.slug !== newDetail.slug), newDetail];
    lastFetchedAt = Date.now();

    return newDetail;
  }

  /**
   * Updates an existing unit in Supabase
   */
  static async updateUnit(slug: string, updates: UpdateUnitInput): Promise<RoomDetail> {
    const supabase = createAdminClient();
    const cleanSlug = slug.toLowerCase().trim();

    const dbUpdates: Record<string, unknown> = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.basePricePerNight !== undefined) dbUpdates.base_price_per_night = updates.basePricePerNight;
    if (updates.baseAdults !== undefined) dbUpdates.base_adults = updates.baseAdults;
    if (updates.maxAdults !== undefined) dbUpdates.max_adults = updates.maxAdults;
    if (updates.maxKids !== undefined) dbUpdates.max_kids = updates.maxKids;
    if (updates.extraPersonFeePerNight !== undefined) dbUpdates.extra_person_fee_per_night = updates.extraPersonFeePerNight;
    if (updates.totalUnits !== undefined) dbUpdates.total_units = updates.totalUnits;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;

    const hasMetaUpdates =
      updates.images !== undefined ||
      updates.shortDescription !== undefined ||
      updates.fullDescription !== undefined ||
      updates.specs !== undefined ||
      updates.amenities !== undefined ||
      updates.landmarks !== undefined;

    if (hasMetaUpdates) {
      const existing = inMemoryUnits.find((u) => u.slug === cleanSlug);
      const cleanImages = updates.images !== undefined
        ? updates.images.filter((img) => !img.startsWith("meta:"))
        : (existing?.gallery.map((g) => g.url || "").filter(Boolean) as string[] || []);

      const metaPayload = {
        shortDescription: updates.shortDescription !== undefined ? updates.shortDescription : existing?.shortDescription,
        fullDescription: updates.fullDescription !== undefined ? updates.fullDescription : existing?.fullDescription,
        specs: updates.specs !== undefined ? updates.specs : existing?.specs,
        amenities: updates.amenities !== undefined ? updates.amenities : existing?.amenities,
        landmarks: updates.landmarks !== undefined ? updates.landmarks : existing?.landmarks,
      };

      dbUpdates.images = [...cleanImages, `meta:${JSON.stringify(metaPayload)}`];
    } else if (updates.images !== undefined) {
      dbUpdates.images = updates.images;
    }

    if (updates.branchSlug) {
      const { data: branchData } = await supabase
        .from("branches")
        .select("id")
        .eq("slug", updates.branchSlug)
        .maybeSingle();

      if (branchData) {
        dbUpdates.branch_id = branchData.id;
      }
    }

    const { data, error } = await supabase
      .from("units")
      .update(dbUpdates)
      .eq("slug", cleanSlug)
      .select(`
        *,
        branches:branch_id (
          slug,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update unit ${cleanSlug}: ${error.message}`);
    }

    const bSlug = (data.branches as { slug?: string } | null)?.slug || updates.branchSlug || "moghal-pura";
    const updatedDetail = mapDbRowToRoomDetail(data, bSlug);

    // Update memory cache
    inMemoryUnits = inMemoryUnits.map((u) => (u.slug === cleanSlug ? updatedDetail : u));
    lastFetchedAt = Date.now();

    return updatedDetail;
  }

  /**
   * Deletes a unit from Supabase
   */
  static async deleteUnit(slug: string): Promise<boolean> {
    const supabase = createAdminClient();
    const cleanSlug = slug.toLowerCase().trim();

    const { error } = await supabase
      .from("units")
      .delete()
      .eq("slug", cleanSlug);

    if (error) {
      throw new Error(`Failed to delete unit ${cleanSlug}: ${error.message}`);
    }

    inMemoryUnits = inMemoryUnits.filter((u) => u.slug !== cleanSlug);
    lastFetchedAt = Date.now();
    return true;
  }

  /**
   * Retrieves all branches from Supabase
   */
  static async getAllBranches(): Promise<Branch[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from("branches").select("*");
      if (!error && data && data.length > 0) {
        return data.map((b) => ({
          id: b.slug as "barkas-salala" | "moghal-pura",
          slug: b.slug as "barkas-salala" | "moghal-pura",
          name: b.name,
          address: b.address,
          googleMapsUrl: b.google_maps_url || "https://maps.google.com",
          status: (b.status || "active") as "active",
        }));
      }
    } catch {
      // fallback
    }
    return [...BRANCHES];
  }

}

