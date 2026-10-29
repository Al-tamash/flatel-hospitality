/**
 * Flatel Hospitality - Dynamic Pricing Engine
 * Strictly implements the pricing rules from final-prd.md Section 9.3
 */

export interface SelectedPaidAddon {
  id?: string;
  name?: string;
  price: number;
  pricingType: "flat" | "per_booking" | "per_night" | "per_person" | "quote";
}

export interface CalculateFareInput {
  nights: number;
  basePricePerNight: number;
  baseAdults: number;
  selectedAdults: number;
  selectedKids?: number; // children count
  baseKids?: number; // children included in the base price; default: one per two base adults (1 BHK 1, 2 BHK 2, 3 BHK 3, 4 BHK 4)
  extraPersonFee?: number; // default ₹500
  extraKidFee?: number; // default ₹300 per child per night (client rule)
  selectedPaidAddons?: SelectedPaidAddon[];
  /**
   * Verified Flatel member discount on the base rent (e.g. 0.10). It is a floor, not an
   * extra: the guest gets whichever is higher of this and the duration discount.
   */
  memberDiscountRate?: number;
}

export interface FareCalculationResult {
  nights: number;
  standardBaseRent: number;
  discountRate: number; // 0, 0.10, 0.15, or 0.25
  /** What set `discountRate`: the stay length, the member rate, or nothing. */
  discountSource: "duration" | "member" | null;
  baseRentDiscount: number;
  baseRent: number; // discounted base rent
  extraAdults: number;
  /** Extra adult and extra child charges together. */
  extraGuestsTotal: number;
  extraKids?: number;
  /** The children part of `extraGuestsTotal`, for display only; never add it on top. */
  extraKidsTotal?: number;
  addonsTotal: number;
  grossTotal: number;
  advancePayable: number; // 20%
  balanceDueOnArrival: number; // 80%
}

/**
 * Calculates Flatel reservation pricing including:
 * 1. Automatic duration-based discounts on base rent (10% for 7-14N, 15% for 15-27N, 25% for 28+N)
 * 2. Extra guest fees: ₹500/night per adult above base occupancy, and ₹300/night per child
 *    above the children included with the flat
 * 3. Paid add-on services (flat or per-night)
 * 4. 20% online advance deposit and 80% remaining balance payable on arrival
 */
export function calculateFlatelPrice(input: CalculateFareInput): FareCalculationResult {
  const {
    nights,
    basePricePerNight,
    baseAdults,
    selectedAdults,
    selectedKids = 0,
    extraPersonFee = 500,
    selectedPaidAddons = [],
  } = input;

  // Strict Validation
  if (nights < 1) {
    throw new Error("Stay duration must be at least 1 night.");
  }
  if (selectedAdults < 1) {
    throw new Error("At least 1 adult guest is required.");
  }
  if (selectedKids < 0) {
    throw new Error("Children count cannot be negative.");
  }
  if (basePricePerNight < 0) {
    throw new Error("Base price per night cannot be negative.");
  }

  // 1. Base Rent with Automatic Duration Discounts
  const standardBaseRent = basePricePerNight * nights;
  let discountRate = 0;

  if (nights >= 28) {
    discountRate = 0.25; // 25% discount for monthly stays (28+ nights)
  } else if (nights >= 15) {
    discountRate = 0.15; // 15% discount for 15-27 nights
  } else if (nights >= 7) {
    discountRate = 0.10; // 10% discount for weekly stays (7-14 nights)
  }

  let discountSource: FareCalculationResult["discountSource"] = discountRate > 0 ? "duration" : null;
  const memberRate = Math.min(Math.max(input.memberDiscountRate ?? 0, 0), 0.5);
  if (memberRate > discountRate) {
    discountRate = memberRate;
    discountSource = "member";
  }

  const baseRentDiscount = Math.round(standardBaseRent * discountRate);
  const discountedBaseRent = standardBaseRent - baseRentDiscount;

  // 2. Extra Person Fee (Adults exceeding base capacity; extra children exceeding baseKids charged extraKidFee)
  const extraAdults = Math.max(0, selectedAdults - baseAdults);
  const extraAdultsTotal = extraAdults * extraPersonFee * nights;

  // Extra children: every child above the flat's included allowance pays the per-night child fee
  const baseKids = input.baseKids ?? Math.ceil(baseAdults / 2);
  const extraKidFee = input.extraKidFee ?? 300;
  const extraKids = Math.max(0, selectedKids - baseKids);
  const extraKidsTotal = extraKids * extraKidFee * nights;

  // Stored and shown as one "extra guest charges" line (adults and children together)
  const extraGuestsTotal = extraAdultsTotal + extraKidsTotal;

  // 3. Paid Add-ons Total (flat/per_booking vs per_night vs per_person)
  const addonsTotal = selectedPaidAddons.reduce((sum, addon) => {
    if (!addon.price || addon.price <= 0 || addon.pricingType === "quote") {
      return sum;
    }
    if (addon.pricingType === "per_night") {
      return sum + addon.price * nights;
    }
    if (addon.pricingType === "per_person") {
      return sum + addon.price * selectedAdults * nights;
    }
    return sum + addon.price;
  }, 0);

  // 4. Gross Total & 20% Deposit Split
  const grossTotal = Math.round(discountedBaseRent + extraGuestsTotal + addonsTotal);
  const advancePayable = Math.round(grossTotal * 0.20);
  const balanceDueOnArrival = grossTotal - advancePayable;

  return {
    nights,
    standardBaseRent,
    discountRate,
    discountSource,
    baseRentDiscount,
    baseRent: discountedBaseRent,
    extraAdults,
    extraGuestsTotal,
    extraKids,
    extraKidsTotal,
    addonsTotal,
    grossTotal,
    advancePayable,
    balanceDueOnArrival,
  };
}
