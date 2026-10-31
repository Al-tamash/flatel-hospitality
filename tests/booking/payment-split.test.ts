import assert from "node:assert/strict";
import { calculateFlatelPrice } from "../../lib/pricing";

console.log("Running Payment Split Tests...");

const stay = { nights: 3, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 };

// 1. No add-ons: 20% of the stay, exactly as before
const plain = calculateFlatelPrice(stay);
assert.equal(plain.grossTotal, 6000);
assert.equal(plain.flatAdvance, 1200);
assert.equal(plain.servicesPrepaid, 0);
assert.equal(plain.advancePayable, 1200);
assert.equal(plain.balanceDueOnArrival, 4800);

// 2. Add-ons are paid in full online; only the stay is split 20/80
const withServices = calculateFlatelPrice({
  ...stay,
  selectedPaidAddons: [
    { name: "Airport Transfer", price: 1200, pricingType: "flat" },
    { name: "Rollaway Bed", price: 500, pricingType: "per_night" }, // 1500
  ],
});
assert.equal(withServices.addonsTotal, 2700);
assert.equal(withServices.grossTotal, 8700);
assert.equal(withServices.flatAdvance, 1200, "20% of the 6000 stay only");
assert.equal(withServices.servicesPrepaid, 2700);
assert.equal(withServices.advancePayable, 3900, "20% of the stay + services in full");
assert.equal(withServices.balanceDueOnArrival, 4800, "the 80% stay balance is unchanged by add-ons");
assert.equal(withServices.advancePayable + withServices.balanceDueOnArrival, withServices.grossTotal);

// 3. Extra guest fees belong to the stay, so they follow the 20% rule
const extraGuest = calculateFlatelPrice({ ...stay, selectedAdults: 3 }); // +500 * 3 = 1500
assert.equal(extraGuest.grossTotal, 7500);
assert.equal(extraGuest.flatAdvance, 1500);
assert.equal(extraGuest.servicesPrepaid, 0);

// 4. Discounts lower the stay, and so the 20%, but never the add-ons
const week = calculateFlatelPrice({
  nights: 7,
  basePricePerNight: 2000,
  baseAdults: 2,
  selectedAdults: 2,
  selectedPaidAddons: [{ name: "Decoration", price: 3000, pricingType: "per_booking" }],
});
assert.equal(week.baseRent, 12600);
assert.equal(week.flatAdvance, 2520);
assert.equal(week.servicesPrepaid, 3000);
assert.equal(week.advancePayable, 5520);

// 5. Quote-only services cannot be charged online
const quote = calculateFlatelPrice({ ...stay, selectedPaidAddons: [{ name: "Doctor Visit", price: 0, pricingType: "quote" }] });
assert.equal(quote.servicesPrepaid, 0);
assert.equal(quote.advancePayable, 1200);

console.log("Payment split tests passed.");
