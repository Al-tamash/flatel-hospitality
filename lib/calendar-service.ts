import { createAdminClient } from "@/lib/supabase/admin";

export interface BlockedDateRecord {
  id: string;
  unit_id: string;
  blocked_date: string;
  reason: string | null;
  created_at?: string;
}

export class CalendarService {
  /**
   * Fetches all blocked dates from Supabase
   */
  static async getBlockedDates(unitSlug?: string): Promise<BlockedDateRecord[]> {
      const supabase = createAdminClient();
      let query = supabase.from("blocked_dates").select("*").order("blocked_date", { ascending: true });

      if (unitSlug) {
        query = query.eq("unit_id", unitSlug.toLowerCase().trim());
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to verify blocked dates: ${error.message}`);
      return (data || []) as BlockedDateRecord[];
  }

  /**
   * Blocks a specific date or date range for a property unit
   */
  static async addBlockedDateRange(
    unitId: string,
    startDateStr: string,
    endDateStr: string,
    reason?: string
  ): Promise<BlockedDateRecord[]> {
    const supabase = createAdminClient();
    const cleanUnitId = unitId.toLowerCase().trim();

    const isDateOnly = (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    };

    if (!cleanUnitId) throw new Error("A residence unit is required.");
    if (!isDateOnly(startDateStr) || !isDateOnly(endDateStr)) {
      throw new Error("Enter valid start and end dates.");
    }
    if (endDateStr < startDateStr) {
      throw new Error("End date must be on or after the start date.");
    }

    const start = new Date(`${startDateStr}T00:00:00.000Z`);
    const end = new Date(`${endDateStr}T00:00:00.000Z`);

    const recordsToInsert: { unit_id: string; blocked_date: string; reason: string | null }[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10);
      recordsToInsert.push({
        unit_id: cleanUnitId,
        blocked_date: dateStr,
        reason: reason || "Manual Maintenance / Private Block",
      });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    const { data, error } = await supabase
      .from("blocked_dates")
      .upsert(recordsToInsert, { onConflict: "unit_id,blocked_date" })
      .select("*");

    if (error) {
      throw new Error(`Failed to block dates: ${error.message}`);
    }

    return (data || []) as BlockedDateRecord[];
  }

  /**
   * Removes a blocked date by its ID
   */
  static async removeBlockedDate(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to remove blocked date: ${error.message}`);
    }
    return true;
  }

  /**
   * Checks if any date in a range is blocked for a unit
   */
  static async isRangeBlocked(
    unitId: string,
    checkInStr: string,
    checkOutStr: string
  ): Promise<{ isBlocked: boolean; blockedDates: string[]; reason?: string }> {
    const cleanUnitId = unitId.toLowerCase().trim();
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    const allBlocks = await this.getBlockedDates(cleanUnitId);
    const overlapping: string[] = [];
    let foundReason: string | undefined;

    for (const b of allBlocks) {
      const bDate = new Date(b.blocked_date);
      // Stay covers check-in up to check-out (excluding check-out day checkout)
      if (bDate >= checkIn && bDate < checkOut) {
        overlapping.push(b.blocked_date);
        if (!foundReason && b.reason) foundReason = b.reason;
      }
    }

    return {
      isBlocked: overlapping.length > 0,
      blockedDates: overlapping,
      reason: foundReason,
    };
  }
}
