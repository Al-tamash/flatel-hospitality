import assert from "node:assert/strict";
import { buildResultsSummary, isMultiFlatSelection, sortByAvailability } from "../../lib/search/availability";

console.log("Running Search Availability Tests...");

const rooms = [{ slug: "1bhk" }, { slug: "2bhk" }, { slug: "3bhk" }];

// 1. Booked flats go last; unknown counts as bookable (Review Focus 4); otherwise stable
assert.deepEqual(
  sortByAvailability(rooms, { "1bhk": "booked", "2bhk": "available", "3bhk": "unknown" }).map((r) => r.slug),
  ["2bhk", "3bhk", "1bhk"]
);
assert.deepEqual(sortByAvailability(rooms, {}).map((r) => r.slug), ["1bhk", "2bhk", "3bhk"]);

// 2. Results summary
assert.equal(
  buildResultsSummary({ availableCount: 3, checkIn: "2026-11-23", checkOut: "2026-11-26", adults: 2, locale: "en" }),
  "3 flats available · 23–26 Nov · 2 guests"
);
assert.equal(
  buildResultsSummary({ availableCount: 1, checkIn: "2026-11-30", checkOut: "2026-12-02", adults: 2, kids: 1, locale: "en" }),
  "1 flat available · 30 Nov – 2 Dec · 3 guests"
);
assert.equal(buildResultsSummary({ availableCount: 0, locale: "en" }), null);
const arSummary = buildResultsSummary({
  availableCount: 2,
  checkIn: "2026-11-23",
  checkOut: "2026-11-26",
  adults: 2,
  locale: "ar",
})!;
assert.match(arSummary, /[\u0600-\u06FF]/);
assert.doesNotMatch(arSummary, /Nov/, "Arabic summary uses an Arabic month name");

// 3. More than one flat selected
assert.equal(isMultiFlatSelection({ flatTypes: ["1bhk"], totalUnits: 1 }), false);
assert.equal(isMultiFlatSelection({ flatTypes: ["1bhk", "2bhk"], totalUnits: 2 }), true);
assert.equal(isMultiFlatSelection({ flatTypes: ["3bhk"], totalUnits: 2 }), true);

console.log("Search availability tests passed");

// Final review fix: an unverifiable check is "unknown", never "booked" (Review Focus 4)
import { statusFromAvailabilityResponse } from "../../lib/search/availability";
assert.equal(statusFromAvailabilityResponse({ success: true, available: true }), "available");
assert.equal(statusFromAvailabilityResponse({ success: true, available: false }), "booked");
assert.equal(statusFromAvailabilityResponse({ success: true, available: false, verified: false }), "unknown");
assert.equal(statusFromAvailabilityResponse({ success: false }), "unknown");
assert.equal(statusFromAvailabilityResponse(null), "unknown");
console.log("Availability response mapping tests passed");
