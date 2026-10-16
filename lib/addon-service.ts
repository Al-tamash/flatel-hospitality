import { PURPOSE_PACKAGES, PurposePackage, FacilityAddon } from "@/lib/mock-rooms";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AddonRecord {
  id: string;
  purpose_tag: "medical" | "wedding" | "tourism" | "corporate" | "family";
  service_name: string;
  is_free: boolean;
  pricing_type: "flat" | "free" | "per_booking" | "per_night" | "quote";
  price: number | null;
  disclaimer: string | null;
  is_active: boolean;
}

export interface CreateAddonInput {
  id: string;
  purpose_tag: "medical" | "wedding" | "tourism" | "corporate" | "family";
  service_name: string;
  is_free: boolean;
  pricing_type: "flat" | "free" | "per_booking" | "per_night" | "quote";
  price: number | null;
  disclaimer?: string;
  is_active?: boolean;
}


export class AddonService {
  /**
   * Fetches all addon services from Supabase
   */
  static async getAllAddons(options?: { onlyActive?: boolean }): Promise<AddonRecord[]> {
    try {
      const supabase = createAdminClient();
      let query = supabase.from("addon_services").select("*").order("created_at", { ascending: true });

      if (options?.onlyActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as AddonRecord[];
      }
    } catch (err) {
      console.warn("Failed to fetch addon services from Supabase:", err);
    }

    // Default fallback from mock-rooms
    const fallback: AddonRecord[] = [];
    for (const pkg of PURPOSE_PACKAGES) {
      for (const addon of pkg.paidAddons) {
        fallback.push({
          id: addon.id,
          purpose_tag: pkg.id,
          service_name: addon.name,
          is_free: Boolean(addon.isFree),
          pricing_type: addon.pricingType || "per_booking",
          price: addon.price,
          disclaimer: addon.disclaimer || null,
          is_active: true,
        });
      }
    }
    return fallback;
  }

  /**
   * Fetches addons for a specific purpose
   */
  static async getAddonsByPurpose(purpose: string): Promise<AddonRecord[]> {
    const all = await this.getAllAddons({ onlyActive: true });
    return all.filter((a) => a.purpose_tag === purpose);
  }

  /**
   * Updates an addon service (price, is_free, is_active, etc.)
   */
  static async updateAddon(id: string, updates: Partial<AddonRecord>): Promise<AddonRecord> {
    const supabase = createAdminClient();

    const dbUpdates: Record<string, unknown> = {};
    if (updates.service_name !== undefined) dbUpdates.service_name = updates.service_name;
    if (updates.is_free !== undefined) dbUpdates.is_free = updates.is_free;
    if (updates.pricing_type !== undefined) dbUpdates.pricing_type = updates.pricing_type;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.disclaimer !== undefined) dbUpdates.disclaimer = updates.disclaimer;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

    const { data, error } = await supabase
      .from("addon_services")
      .update(dbUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update addon ${id}: ${error.message}`);
    }

    return data as AddonRecord;
  }

  /**
   * Creates a new addon service
   */
  static async createAddon(input: CreateAddonInput): Promise<AddonRecord> {
    const supabase = createAdminClient();

    const payload = {
      id: input.id.trim(),
      purpose_tag: input.purpose_tag,
      service_name: input.service_name.trim(),
      is_free: input.is_free,
      pricing_type: input.pricing_type,
      price: input.price,
      disclaimer: input.disclaimer || null,
      is_active: input.is_active ?? true,
    };

    const { data, error } = await supabase
      .from("addon_services")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create addon service: ${error.message}`);
    }

    return data as AddonRecord;
  }

  /**
   * Deletes an addon service
   */
  static async deleteAddon(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("addon_services").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete addon ${id}: ${error.message}`);
    }
    return true;
  }

  /**
   * Assembles dynamic PurposePackages combining static master complimentary lists with live DB addons
   */
  static async getDynamicPurposePackages(): Promise<PurposePackage[]> {
    const dbAddons = await this.getAllAddons({ onlyActive: true });

    return PURPOSE_PACKAGES.map((pkg) => {
      const liveAddonsForPkg = dbAddons.filter((a) => a.purpose_tag === pkg.id);

      const dynamicPaidAddons: FacilityAddon[] = liveAddonsForPkg.map((a) => {
        const pricingType: FacilityAddon["pricingType"] =
          a.pricing_type === "free" ? "per_booking" : a.pricing_type;
        return {
          id: a.id,
          name: a.service_name,
          price: a.price,
          type: (a.pricing_type === "free" ? "flat" : a.pricing_type) as FacilityAddon["type"],
          pricingType,
          isFree: a.is_free,
          disclaimer: a.disclaimer || undefined,
          requiresConfiguration: a.price === null || a.pricing_type === "quote",
        };
      });


      return {
        ...pkg,
        paidAddons: dynamicPaidAddons.length > 0 ? dynamicPaidAddons : pkg.paidAddons,
      };
    });
  }
}
