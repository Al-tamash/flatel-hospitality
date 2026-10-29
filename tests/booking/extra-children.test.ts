import assert from "node:assert/strict";
import { calculateFlatelPrice } from "../../lib/pricing";

console.log("Running Extra Children Fee Tests...");

const oneBhk = { nights: 3, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 };

// 1. Children within the flat's included allowance (1 for a 1 BHK) are free
const included = calculateFlatelPrice({ ...oneBhk, selectedKids: 1 });
assert.equal(included.extraKids, 0);
assert.equal(included.extraGuestsTotal, 0);
assert.equal(included.grossTotal, 6000);

// 2. Each child above the allowance is ₹300 per night
const oneExtra = calculateFlatelPrice({ ...oneBhk, selectedKids: 2 });
assert.equal(oneExtra.extraKids, 1);
assert.equal(oneExtra.extraKidsTotal, 900);
assert.equal(oneExtra.extraGuestsTotal, 900, "child fee is part of the extra guest line");
assert.equal(oneExtra.grossTotal, 6900, "and is counted once in the total");
assert.equal(oneExtra.advancePayable, 1380);

// 3. Adults and children are charged together, each at its own rate
const both = calculateFlatelPrice({ ...oneBhk, selectedAdults: 3, selectedKids: 3 });
assert.equal(both.extraAdults, 1);
assert.equal(both.extraKids, 2);
assert.equal(both.extraGuestsTotal, 1 * 500 * 3 + 2 * 300 * 3);
assert.equal(both.grossTotal, 6000 + both.extraGuestsTotal);

// 4. The allowance grows with the flat: one child per two base adults
const fourBhk = { nights: 2, basePricePerNight: 4000, baseAdults: 8, selectedAdults: 8 };
assert.equal(calculateFlatelPrice({ ...fourBhk, selectedKids: 4 }).extraKids, 0);
assert.equal(calculateFlatelPrice({ ...fourBhk, selectedKids: 5 }).extraKids, 1);
const twoBhk = { nights: 2, basePricePerNight: 2500, baseAdults: 4, selectedAdults: 4 };
assert.equal(calculateFlatelPrice({ ...twoBhk, selectedKids: 2 }).extraKids, 0);
assert.equal(calculateFlatelPrice({ ...twoBhk, selectedKids: 3 }).extraKids, 1);

// 5. Rules can still be overridden explicitly
const custom = calculateFlatelPrice({ ...oneBhk, selectedKids: 2, baseKids: 0, extraKidFee: 100 });
assert.equal(custom.extraKidsTotal, 2 * 100 * 3);

// 6. Discounts apply to the rent only, never to guest fees
const week = calculateFlatelPrice({ nights: 7, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2, selectedKids: 2 });
assert.equal(week.baseRentDiscount, 1400);
assert.equal(week.extraGuestsTotal, 300 * 7);

console.log("Extra children tests passed.");
