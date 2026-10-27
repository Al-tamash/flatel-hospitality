import assert from "node:assert/strict";
import { getAlternatePath } from "../../lib/i18n";

console.log("Running Language Switcher URL Mapping Tests...");

// English to Arabic mappings
assert.equal(getAlternatePath("/", "ar"), "/ar", "Root '/' should map to '/ar'");
assert.equal(getAlternatePath("/properties", "ar"), "/ar/properties", "Properties should map to '/ar/properties'");
assert.equal(getAlternatePath("/properties/barkas-3bhk", "ar"), "/ar/properties/barkas-3bhk", "Property detail should map to '/ar/properties/barkas-3bhk'");
assert.equal(getAlternatePath("/hospitals", "ar"), "/ar/hospitals", "Hospitals should map to '/ar/hospitals'");
assert.equal(getAlternatePath("/checkout", "ar"), "/ar/checkout", "Checkout should map to '/ar/checkout'");
assert.equal(getAlternatePath("/my-bookings", "ar"), "/ar/my-bookings", "My bookings should map to '/ar/my-bookings'");

// Arabic to English mappings
assert.equal(getAlternatePath("/ar", "en"), "/", "'/ar' should map to root '/'");
assert.equal(getAlternatePath("/ar/properties", "en"), "/properties", "'/ar/properties' should map to '/properties'");
assert.equal(getAlternatePath("/ar/properties/barkas-3bhk", "en"), "/properties/barkas-3bhk", "'/ar/properties/barkas-3bhk' should map to '/properties/barkas-3bhk'");
assert.equal(getAlternatePath("/ar/hospitals", "en"), "/hospitals", "'/ar/hospitals' should map to '/hospitals'");
assert.equal(getAlternatePath("/ar/checkout", "en"), "/checkout", "'/ar/checkout' should map to '/checkout'");

// Idempotent calls
assert.equal(getAlternatePath("/properties", "en"), "/properties", "No-op when already English");
assert.equal(getAlternatePath("/ar/properties", "ar"), "/ar/properties", "No-op when already Arabic");

// Search query preservation test
const switchWithSearch = (path: string, search: string, targetLocale: "en" | "ar") => {
  const alt = getAlternatePath(path, targetLocale);
  return `${alt}${search}`;
};

assert.equal(
  switchWithSearch("/checkout", "?property=1bhk&checkIn=2026-11-01", "ar"),
  "/ar/checkout?property=1bhk&checkIn=2026-11-01",
  "Search params must be preserved when switching to Arabic"
);
assert.equal(
  switchWithSearch("/ar/checkout", "?property=1bhk&checkIn=2026-11-01", "en"),
  "/checkout?property=1bhk&checkIn=2026-11-01",
  "Search params must be preserved when switching to English"
);

console.log("✓ All Language Switcher URL mapping tests passed successfully!");
