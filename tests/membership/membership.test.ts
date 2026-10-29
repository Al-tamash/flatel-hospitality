import assert from "node:assert/strict";
import { calculateFlatelPrice } from "../../lib/pricing";
import { CALCULATOR_RATES, MEMBERSHIP, calculateMembershipSavings, getMembershipContent } from "../../lib/membership/membership-content";
import { addMonths, generateMemberCode, normalizeMemberCode, normalizePhone } from "../../lib/membership/membership-service";

console.log("Running Membership Tests...");

const base = { basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 };

// 1. Member rate applies to short stays
const short = calculateFlatelPrice({ ...base, nights: 3, memberDiscountRate: 0.1 });
assert.equal(short.discountRate, 0.1);
assert.equal(short.discountSource, "member");
assert.equal(short.baseRentDiscount, 600);
assert.equal(short.grossTotal, 5400);
assert.equal(short.advancePayable, 1080);

// 2. No member: unchanged behaviour
const plain = calculateFlatelPrice({ ...base, nights: 3 });
assert.equal(plain.discountSource, null);
assert.equal(plain.grossTotal, 6000);

// 3. Long stays keep the better duration discount; the two never stack
const week = calculateFlatelPrice({ ...base, nights: 7, memberDiscountRate: 0.1 });
assert.equal(week.discountRate, 0.1);
assert.equal(week.discountSource, "duration");
const fortnight = calculateFlatelPrice({ ...base, nights: 15, memberDiscountRate: 0.1 });
assert.equal(fortnight.discountRate, 0.15);
assert.equal(fortnight.discountSource, "duration");

// 4. A bad member rate cannot zero out the price
const absurd = calculateFlatelPrice({ ...base, nights: 2, memberDiscountRate: 5 });
assert.ok(absurd.discountRate <= 0.5, "member rate is capped");
assert.ok(absurd.grossTotal > 0);

// 5. Member ID helpers
for (let i = 0; i < 200; i += 1) {
  assert.match(generateMemberCode(), /^FL-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
}
assert.equal(normalizeMemberCode(" fl-ab12cd "), "FL-AB12CD");
assert.equal(normalizePhone("+91 79891 00711"), "7989100711");
assert.equal(normalizePhone("7989100711"), "7989100711");

// 6. Validity window
const from = new Date("2026-10-29T10:00:00.000Z");
assert.equal(addMonths(from, MEMBERSHIP.validityMonths).toISOString(), "2027-10-29T10:00:00.000Z");

// 7. Savings calculator
const flat = CALCULATOR_RATES[0];
const calc = calculateMembershipSavings(flat.perNight, 12);
assert.equal(calc.stayDiscount, 2400);
assert.equal(calc.freeNights, 1);
assert.equal(calc.totalSavings, 4400);
assert.equal(calc.netBenefit, 4400 - MEMBERSHIP.price);
assert.equal(calc.breakEvenNights, 4);
assert.ok(calculateMembershipSavings(flat.perNight, 1).netBenefit < 0, "one night does not repay the fee");

// 8. Copy exists in both languages with the join block
for (const locale of ["en", "ar"] as const) {
  const content = getMembershipContent(locale);
  assert.ok(content.join.pay.includes("777"), `${locale} pay button states the fee`);
  assert.equal(content.benefits.length, 7);
  assert.ok(content.calculator.paysForItself.includes("{n}"));
}

console.log("Membership tests passed.");
