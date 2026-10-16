import * as fs from "fs";
import { AMENITY_CATEGORIES, ALL_AMENITIES_LIST, AMENITY_GRID_CARDS } from "../components/amenities-section";

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

  test("Subtitle matches screenshot: 'Thoughtfully designed spaces with modern amenities for a comfortable stay.'", () => {
    return source.includes("Thoughtfully designed spaces with modern amenities for a comfortable stay.");
  });

  test("All 7 filter pills match screenshot (All (29), Living & Bedroom (8), Kitchen & Dining (10), etc.)", () => {
    return (
      source.includes('label: "All", count: 29') &&
      source.includes('label: "Living & Bedroom", count: 8') &&
      source.includes('label: "Kitchen & Dining", count: 10') &&
      source.includes('label: "Bathroom & Care", count: 2') &&
      source.includes('label: "Power & Laundry", count: 3') &&
      source.includes('label: "Hospitality & Care", count: 3') &&
      source.includes('label: "Family & Recreation", count: 3')
    );
  });

  test("Grid contains exactly 24 3D amenity cards matching screenshot rows", () => {
    return AMENITY_GRID_CARDS.length === 24;
  });

  test("All 24 high-clarity 3D icon and card files exist in public/images/amenities/", () => {
    return AMENITY_GRID_CARDS.every((card) =>
      fs.existsSync(`public/images/amenities/icon-${card.slug}.png`) &&
      fs.existsSync(`public/images/amenities/card-${card.slug}.png`)
    );
  });

  test("Bottom button matches screenshot: 'Explore all 29 amenities'", () => {
    return source.includes("Explore all 29 amenities");
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

  test("Full 29-inclusion modal directory exists for complete access", () => {
    return source.includes("isModalOpen") && source.includes("All 29 Master Inclusions");
  });

  test("Two-line marquee animations configured (animate-marquee-left & animate-marquee-right)", () => {
    return (
      source.includes("animate-marquee-left") &&
      source.includes("animate-marquee-right") &&
      source.includes("line1Items") &&
      source.includes("line2Items")
    );
  });

  // 2. Live HTTP Verification on Homepage
  try {
    const res = await fetch("http://localhost:3000/");
    const html = await res.text();

    test("HTTP 200 OK on Homepage", () => res.status === 200);
    test("Homepage renders 'THE FLATEL EXPERIENCE'", () => html.includes("THE FLATEL EXPERIENCE"));
    test("Homepage renders 'Everything you need to' & 'feel at home.'", () =>
      html.includes("Everything you need to") && html.includes("feel at home."));
    test("Homepage contains id='amenities'", () => html.includes('id="amenities"'));
    test("Homepage HTML includes high-clarity 3D icon image paths", () =>
      html.includes("icon-bedroom-comfort") &&
      html.includes("icon-kitchen-dining") &&
      html.includes("icon-air-conditioning"));
    test("Homepage HTML contains 'Explore all 29 amenities'", () =>
      html.includes("Explore all 29 amenities"));
    test("Homepage HTML contains 'animate-marquee-left' and 'animate-marquee-right'", () =>
      html.includes("animate-marquee-left") && html.includes("animate-marquee-right"));
  } catch (err: unknown) {
    console.error("HTTP verification error:", err instanceof Error ? err.message : String(err));
    fails++;
  }

  console.log("\n=======================================================");
  console.log(`AMENITIES 1-TO-1 AUDIT: ${passes} PASSED | ${fails} FAILED`);
  console.log("=======================================================\n");

  if (fails > 0) process.exit(1);
}

verifyAmenitiesRedesign().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
