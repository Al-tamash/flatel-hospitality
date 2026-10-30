import assert from "node:assert/strict";
import { calculateFlatelPrice } from "../../lib/pricing";
import {
  MEMBERSHIP,
  MEMBERSHIP_NAME,
  MEMBERSHIP_TIERS,
  MEMBERSHIP_TIER_IDS,
  getCardContent,
  getMembershipContent,
  getMembershipTier,
  isMembershipTier,
} from "../../lib/membership/membership-content";
import { addMonths, generateMemberCode, normalizeMemberCode, normalizePhone } from "../../lib/membership/membership-service";

console.log("Running Membership Tests...");

const base = { basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 };

// 1. Member rate applies to short stays, per card
const golden = calculateFlatelPrice({ ...base, nights: 3, memberDiscountRate: getMembershipTier("golden").discountPercent / 100 });
assert.equal(golden.discountRate, 0.1);
assert.equal(golden.discountSource, "member");
assert.equal(golden.baseRentDiscount, 600);
assert.equal(golden.grossTotal, 5400);
assert.equal(golden.advancePayable, 1080);

const platinum = calculateFlatelPrice({ ...base, nights: 3, memberDiscountRate: getMembershipTier("platinum").discountPercent / 100 });
assert.equal(platinum.discountRate, 0.15);
assert.equal(platinum.discountSource, "member");
assert.equal(platinum.baseRentDiscount, 900);
assert.equal(platinum.grossTotal, 5100);

// 2. No member: unchanged behaviour
const plain = calculateFlatelPrice({ ...base, nights: 3 });
assert.equal(plain.discountSource, null);
assert.equal(plain.grossTotal, 6000);

// 3. Long stays keep the better discount; the two never stack
const week = calculateFlatelPrice({ ...base, nights: 7, memberDiscountRate: 0.1 });
assert.equal(week.discountRate, 0.1);
assert.equal(week.discountSource, "duration");
const fortnight = calculateFlatelPrice({ ...base, nights: 15, memberDiscountRate: 0.1 });
assert.equal(fortnight.discountRate, 0.15);
assert.equal(fortnight.discountSource, "duration");
const platinumWeek = calculateFlatelPrice({ ...base, nights: 7, memberDiscountRate: 0.15 });
assert.equal(platinumWeek.discountRate, 0.15, "Platinum beats the 10% weekly discount");
assert.equal(platinumWeek.discountSource, "member");

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

// 7. Cards and prices, as supplied by the client
assert.deepEqual([...MEMBERSHIP_TIER_IDS], ["golden", "platinum"]);
assert.equal(MEMBERSHIP_TIERS.golden.price, 4999);
assert.equal(MEMBERSHIP_TIERS.golden.listPrice, 11999);
assert.equal(MEMBERSHIP_TIERS.golden.discountPercent, 10);
assert.equal(MEMBERSHIP_TIERS.platinum.price, 7777);
assert.equal(MEMBERSHIP_TIERS.platinum.listPrice, 54999);
assert.equal(MEMBERSHIP_TIERS.platinum.discountPercent, 15);
assert.equal(MEMBERSHIP_NAME, "Flatel O Signature Membership");
assert.equal(isMembershipTier("golden"), true);
assert.equal(isMembershipTier("platinum"), true);
assert.equal(isMembershipTier("silver"), false);
assert.equal(isMembershipTier(undefined), false);

// 8. Copy exists in both languages for both cards
for (const locale of ["en", "ar"] as const) {
  const content = getMembershipContent(locale);
  assert.ok(content.join.pay.includes("{price}"), `${locale} pay button takes the card price`);
  assert.ok(content.join.consent.includes("{price}"));
  for (const id of MEMBERSHIP_TIER_IDS) {
    const tier = content.tiers[id];
    assert.equal(tier.benefits.length, 5, `${locale} ${id} lists five benefits`);
    assert.equal(tier.price, `₹${MEMBERSHIP_TIERS[id].price.toLocaleString("en-IN")}`);
    assert.equal(tier.listPrice, `₹${MEMBERSHIP_TIERS[id].listPrice.toLocaleString("en-IN")}`);
    assert.equal(getCardContent(content, id).price, tier.price);
  }
}

// 9. Card artwork can show a member's own name and ID
const memberCard = getCardContent(getMembershipContent("en"), "platinum", { holder: "ASHA", id: "FL-AB23CD" });
assert.equal(memberCard.cardHolder, "ASHA");
assert.equal(memberCard.cardId, "FL-AB23CD");
assert.equal(memberCard.tier, "platinum");

console.log("Membership tests passed.");
