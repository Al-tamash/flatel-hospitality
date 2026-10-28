import * as fs from "fs";
import { AMENITY_CATEGORIES, ALL_AMENITIES_LIST, HIGHLIGHTS_ITEMS } from "../components/amenities-section";

async function verifyAmenitiesRedesign() {
  console.log("=======================================================");
  console.log("   FLATEL HOSPITALITY — AMENITIES 1-TO-1 AUDIT");
  console.log("=======================================================\n");

  let passes = 0;
  let fails = 0;

  function test(name: string, fn: () => boolean) {
    try {
      const ok = fn();
      if (ok) {
        console.log(`[PASS] ${name}`);
        passes++;
      } else {
        console.error(`[FAIL] ${name}`);
        fails++;
      }
    } catch (e: unknown) {
      console.error(`[FAIL] ${name}: ${e instanceof Error ? e.message : String(e)}`);
      fails++;
    }
  }

  // 1. Component Code & Data Integrity
  const source = fs.readFileSync("components/amenities-section.tsx", "utf-8");

  test("Eyebrow contains 'THE FLATEL EXPERIENCE'", () => {
    return source.includes("THE FLATEL EXPERIENCE");
  });

  test("Refined heading contains 'Everything you need to' and 'feel at home.'", () => {
    return source.includes("Everything you need to") && source.includes("feel at home.");
  });

  test("Subtitle matches: 'Thoughtfully designed spaces with modern amenities for a comfortable stay.'", () => {
    return source.includes("Thoughtfully designed spaces with modern amenities for a comfortable stay.");
  });

  test("Filter pills configured compactly with Highlights default", () => {
    return (
      source.includes('label: "Highlights", count: 10') &&
      source.includes('label: "Living & Bedroom", count: 8') &&
      source.includes('label: "Kitchen & Dining", count: 10') &&
      source.includes('label: "Bathroom & Care", count: 2') &&
      source.includes('label: "Power & Laundry", count: 3') &&
      source.includes('label: "Hospitality & Care", count: 3') &&
      source.includes('label: "Family & Recreation", count: 3')
    );
  });

  test("Highlights list contains exactly 10 flagship items", () => {
    return HIGHLIGHTS_ITEMS.length === 10;
  });

  test("No card-based images used (simple icon + text)", () => {
    return !source.includes("/images/amenities/icon-");
  });

  test("Bottom button exists: 'Explore all 29 amenities directory'", () => {
    return source.includes("Explore all 29 amenities directory");
  });

  test("Exactly 6 master categories exist in AMENITY_CATEGORIES", () => {
    return AMENITY_CATEGORIES.length === 6;
  });

  test("Exactly 29 total inclusions exist in ALL_AMENITIES_LIST", () => {
    return ALL_AMENITIES_LIST.length === 29;
  });

  test("Maintains section id='amenities' for anchor navigation", () => {
    return source.includes('id="amenities"');
  });

  test("Full 29-inclusion modal directory exists for complete access without cards", () => {
    return source.includes("isModalOpen") && source.includes("All 29 Master Inclusions");
  });

  test("Accurate semantic Lucide icons are used (Trophy for sports, AirVent for AC, ShowerHead for geyser, WashingMachine for washer)", () => {
    return (
      source.includes("AirVent") &&
      source.includes("ShowerHead") &&
      source.includes("WashingMachine") &&
      source.includes("Trophy") &&
      source.includes("Gamepad2") &&
      source.includes("BatteryCharging") &&
      source.includes("ShoppingBag")
    );
  });

  console.log("\n=======================================================");
  console.log(`AMENITIES AUDIT: ${passes} PASSED | ${fails} FAILED`);
  console.log("=======================================================\n");

  if (fails > 0) process.exit(1);
}

verifyAmenitiesRedesign().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
