import type { RoomDetail } from "@/lib/mock-rooms";

/** What the flat selector needs to know about one flat type, taken from live inventory. */
export interface FlatDefinition {
  id: string; // inventory slug, e.g. "1bhk"
  title: string;
  pricePerNight: number;
  availableUnits: number;
  baseAdults: number;
  baseKids: number;
  maxExtraAdults: number;
  maxExtraKids: number;
  extraAdultFee: number;
  extraKidFee: number;
  branchSlug?: string;
}

/** Client rule: extra children are ₹300 per night. */
export const EXTRA_KID_FEE_PER_NIGHT = 300;

const CATEGORY_ORDER = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];

/**
 * Builds selector rows from inventory so prices, unit counts and adult limits always match
 * what the admin set. Child allowances follow the house rule of one child per two base adults.
 */
export function buildFlatDefinitions(rooms: RoomDetail[]): FlatDefinition[] {
  return rooms
    .filter((room) => room.isAvailable !== false)
    .map((room) => {
      const childAllowance = Math.max(1, Math.ceil(room.baseAdults / 2));
      return {
        id: room.slug,
        title: room.type,
        pricePerNight: room.basePricePerNight,
        availableUnits: Math.max(1, room.totalUnits ?? 1),
        baseAdults: room.baseAdults,
        baseKids: childAllowance,
        maxExtraAdults: Math.max(0, room.maxAdults - room.baseAdults),
        maxExtraKids: childAllowance,
        extraAdultFee: room.extraPersonFeePerNight,
        extraKidFee: EXTRA_KID_FEE_PER_NIGHT,
        branchSlug: room.branchSlug,
      };
    })
    .sort((a, b) => {
      const rank = (def: FlatDefinition) => {
        const index = CATEGORY_ORDER.indexOf(def.title.replace(/\s+/g, "").toUpperCase());
        return index === -1 ? CATEGORY_ORDER.length : index;
      };
      return rank(a) - rank(b) || a.title.localeCompare(b.title);
    });
}
