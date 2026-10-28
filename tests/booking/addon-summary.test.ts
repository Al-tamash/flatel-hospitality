import assert from "node:assert/strict";
import { buildAddonSummary } from "../../lib/booking/addon-summary";
import type { FacilityAddon } from "../../lib/mock-rooms";

console.log("Running Add-on Summary Tests...");

const a = { id: "a", name: "A", price: 500 } as FacilityAddon;
const b = { id: "b", name: "B", price: null } as FacilityAddon;

// 1. Nothing selected → invitation
assert.deepEqual(buildAddonSummary({ selected: [], addonsTotal: 0, locale: "en" }), {
  label: "Add services for your stay →",
  hasSelection: false,
});

// 2. One priced add-on
assert.equal(buildAddonSummary({ selected: [a], addonsTotal: 500, locale: "en" }).label, "1 add-on · ₹500 · Edit");

// 3. Priced + on-quote add-ons
assert.equal(
  buildAddonSummary({ selected: [a, b], addonsTotal: 500, locale: "en" }).label,
  "2 add-ons · ₹500 + on quote · Edit"
);

// 4. Arabic
assert.match(buildAddonSummary({ selected: [a], addonsTotal: 500, locale: "ar" }).label, /[\u0600-\u06FF]/);

console.log("Add-on summary tests passed");
