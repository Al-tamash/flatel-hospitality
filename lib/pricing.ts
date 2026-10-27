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
  baseKids?: number; // included in base price (default based on BHK, e.g. 1 for 1BHK)
  extraPersonFee?: number; // default ₹500
  extraKidFee?: number; // default ₹300 per night as per client rule
  selectedPaidAddons?: SelectedPaidAddon[];
}

export interface FareCalculationResult {
  nights: number;
  standardBaseRent: number;
  discountRate: number; // 0, 0.10, 0.15, or 0.25
  baseRentDiscount: number;
  baseRent: number; // discounted base rent
  extraAdults: number;
  extraGuestsTotal: number;
  extraKids?: number;
  extraKidsTotal?: number;
  addonsTotal: number;
  grossTotal: number;
  advancePayable: number; // 20%
  balanceDueOnArrival: number; // 80%
}

/**
 * Calculates Flatel reservation pricing including:
 * 1. Automatic duration-based discounts on base rent (10% for 7-14N, 15% for 15-27N, 25% for 28+N)
 * 2. Extra adult fees (₹500/night for adults above base occupancy; kids 0-12 are free)
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

  const baseRentDiscount = Math.round(standardBaseRent * discountRate);
  const discountedBaseRent = standardBaseRent - baseRentDiscount;

  // 2. Extra Person Fee (Adults exceeding base capacity; extra children exceeding baseKids charged extraKidFee)
  const extraAdults = Math.max(0, selectedAdults - baseAdults);
  const extraGuestsTotal = extraAdults * extraPersonFee * nights;

  // Extra Kids Fee calculation (if baseKids defined or extraKidFee provided)
  const baseKids = input.baseKids ?? 0;
  const extraKidFee = input.extraKidFee ?? 300;
  const hasExtraKidRule = input.extraKidFee !== undefined || input.baseKids !== undefined;
  const extraKids = hasExtraKidRule ? Math.max(0, selectedKids - baseKids) : 0;
  const extraKidsTotal = extraKids * extraKidFee * nights;

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
  const grossTotal = Math.round(discountedBaseRent + extraGuestsTotal + extraKidsTotal + addonsTotal);
  const advancePayable = Math.round(grossTotal * 0.20);
  const balanceDueOnArrival = grossTotal - advancePayable;

  return {
    nights,
    standardBaseRent,
    discountRate,
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
