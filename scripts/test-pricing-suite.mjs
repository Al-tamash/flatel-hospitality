/**
 * Flatel Hospitality - Automated Verification Test Suite
 * Tests PRD Section 4, 6, 9.3 and System Requirements
 */

import { calculateFlatelPrice } from "../lib/pricing";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("FLATEL HOSPITALITY - FUNCTIONAL VERIFICATION TEST SUITE");
console.log("========================================================\n");

// Test 1: Base Rent & Nights (1-6 nights: 0% discount)
console.log("1. DURATION DISCOUNT BOUNDARY TESTS");
{
  const fare6 = calculateFlatelPrice({
    nights: 6,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare6.standardBaseRent === 12000, "6 nights standard base rent is ₹12,000");
  assert(fare6.discountRate === 0, "6 nights discount rate is 0%");
  assert(fare6.baseRentDiscount === 0, "6 nights discount amount is ₹0");
  assert(fare6.baseRent === 12000, "6 nights discounted rent is ₹12,000");

  const fare7 = calculateFlatelPrice({
    nights: 7,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare7.standardBaseRent === 14000, "7 nights standard base rent is ₹14,000");
  assert(fare7.discountRate === 0.10, "7 nights triggers exactly 10% discount band");
  assert(fare7.baseRentDiscount === 1400, "7 nights discount amount is ₹1,400");
  assert(fare7.baseRent === 12600, "7 nights discounted base rent is ₹12,600");

  const fare14 = calculateFlatelPrice({
    nights: 14,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare14.discountRate === 0.10, "14 nights discount rate is 10%");
  assert(fare14.baseRentDiscount === 2800, "14 nights discount is ₹2,800");

  const fare15 = calculateFlatelPrice({
    nights: 15,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare15.discountRate === 0.15, "15 nights triggers exactly 15% discount band");
  assert(fare15.baseRentDiscount === 4500, "15 nights discount is ₹4,500");

  const fare27 = calculateFlatelPrice({
    nights: 27,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare27.discountRate === 0.15, "27 nights discount rate is 15%");

  const fare28 = calculateFlatelPrice({
    nights: 28,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare28.discountRate === 0.25, "28 nights triggers exactly 25% monthly discount band");
  assert(fare28.baseRentDiscount === 14000, "28 nights discount is ₹14,000 on ₹56,000");
  assert(fare28.baseRent === 42000, "28 nights discounted base rent is ₹42,000");
}

console.log("\n2. EXTRA ADULT OCCUPANCY & PRICING TESTS");
{
  // 3 BHK at Barkas: base 6 adults, 8 adults selected (+2 extra adults) for 3 nights
  const fare = calculateFlatelPrice({
    nights: 3,
    basePricePerNight: 3000,
    baseAdults: 6,
    selectedAdults: 8,
    extraPersonFee: 500,
  });
  assert(fare.extraAdults === 2, "Calculated 2 extra adults above base 6");
  assert(fare.extraGuestsTotal === 2 * 500 * 3, "Extra adult charge is ₹3,000 (2 * ₹500 * 3N)");
  assert(fare.grossTotal === 9000 + 3000, "Gross total includes base rent + extra adult fee");
}

console.log("\n3. CHILDREN STAY FREE ACCOMMODATION RULE");
{
  const fareWithKids = calculateFlatelPrice({
    nights: 4,
    basePricePerNight: 2500,
    baseAdults: 4,
    selectedAdults: 4,
    selectedKids: 3, // 3 kids aged 0-12
  });
  assert(fareWithKids.extraAdults === 0, "Children do not trigger extra adult fees");
  assert(fareWithKids.extraGuestsTotal === 0, "Extra guest fee is ₹0 for children");
  assert(fareWithKids.grossTotal === 10000, "Gross total is only base rent ₹10,000");
}

console.log("\n4. PAID ADD-ON SERVICES PRICING BASIS");
{
  const fareWithAddons = calculateFlatelPrice({
    nights: 5,
    basePricePerNight: 3000,
    baseAdults: 6,
    selectedAdults: 6,
    selectedPaidAddons: [
      { id: "extra-floor-mattress", price: 500, pricingType: "per_night" }, // ₹500 * 5N = ₹2,500
      { id: "airport-cab", price: 1200, pricingType: "per_booking" }, // flat ₹1,200
    ],
  });
  assert(fareWithAddons.addonsTotal === 2500 + 1200, "Add-ons total calculated correctly: ₹3,700");
  assert(fareWithAddons.grossTotal === 15000 + 3700, "Gross total includes add-ons: ₹18,700");
}

console.log("\n5. 20% ADVANCE AND 80% REMAINING BALANCE INTEGRITY");
{
  const testCases = [
    { nights: 1, rate: 2000, adults: 2, base: 2 },
    { nights: 3, rate: 2500, adults: 5, base: 4 },
    { nights: 7, rate: 3000, adults: 7, base: 6 },
    { nights: 15, rate: 4000, adults: 10, base: 8 },
    { nights: 29, rate: 2000, adults: 3, base: 2 },
  ];

  for (const tc of testCases) {
    const res = calculateFlatelPrice({
      nights: tc.nights,
      basePricePerNight: tc.rate,
      baseAdults: tc.base,
      selectedAdults: tc.adults,
    });
    const sum = res.advancePayable + res.balanceDueOnArrival;
    assert(
      sum === res.grossTotal,
      `Exact split: ₹${res.advancePayable} (20%) + ₹${res.balanceDueOnArrival} (80%) = Gross ₹${res.grossTotal}`
    );
  }
}

console.log("\n6. INPUT REJECTION & VALIDATION TESTS");
{
  let rejectedNights = false;
  try {
    calculateFlatelPrice({ nights: 0, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 });
  } catch {
    rejectedNights = true;
  }
  assert(rejectedNights, "Rejects 0 nights duration");

  let rejectedAdults = false;
  try {
    calculateFlatelPrice({ nights: 2, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 0 });
  } catch {
    rejectedAdults = true;
  }
  assert(rejectedAdults, "Rejects 0 adults count");
}

console.log("\n========================================================");
console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
