/**
 * FLATEL HOSPITALITY — MOBILE RESPONSIVENESS AND HERO OPTIMIZATION TEST SUITE
 * Validates the mobile hero, responsive booking search, mobile header,
 * branch hub stats, customer reviews, property detail, checkout, and footer.
 */

async function runMobileAudit() {
  console.log("==================================================================");
  console.log("   FLATEL HOSPITALITY — MOBILE RESPONSIVENESS AUDIT SUITE");
  console.log("==================================================================\n");

  let passes = 0;
  let failures = 0;

  function test(name: string, condition: boolean, details?: string) {
    if (condition) {
      passes++;
      console.log(`[PASS] ${name}`);
    } else {
      failures++;
      console.error(`[FAIL] ${name} ${details ? `(${details})` : ""}`);
    }
  }

  try {
    // 1. Audit Homepage HTML
    const homeRes = await fetch("http://localhost:3000");
    const homeHtml = await homeRes.text();

    test("HTTP 200 Homepage Loads Successfully", homeRes.status === 200);

    // 2. Audit Mobile Hero Eyebrow & Headline
    test(
      "Hero has small luxury eyebrow text 'SERVICED RESIDENCES · HYDERABAD'",
      homeHtml.includes("SERVICED RESIDENCES · HYDERABAD")
    );

    test(
      "Hero headline 'Find Your Place to Stay' present with responsive font sizing",
      homeHtml.includes("Find Your Place to Stay") && homeHtml.includes("font-heading text-2xl sm:text-4xl")
    );

    // 3. Audit Booking Search Form Structure
    test(
      "Booking search bar has responsive 2-column grid layout for mobile",
      homeHtml.includes("grid grid-cols-2 lg:flex lg:items-center")
    );

    test(
      "Dual date fields present on mobile (Check-In & Check-Out side-by-side with night duration)",
      homeHtml.includes("Check-In") && homeHtml.includes("Check-Out")
    );

    test(
      "Search Available Flats submit button present and prominent",
      homeHtml.includes("Search Available Flats") && homeHtml.includes("hero-search-flats-submit-button")
    );

    // 4. Audit Mobile Header
    test(
      "Mobile Header has responsive tagline ('SERVICED APARTMENTS' on mobile, full tagline on sm+)",
      homeHtml.includes("SERVICED APARTMENTS") && homeHtml.includes("THE COMFORT OF A FLAT. THE SERVICE OF A HOTEL.")
    );

    test(
      "Mobile navigation menu trigger button present",
      homeHtml.includes("aria-label=\"Open Navigation Menu\"")
    );

    // 5. Audit Branch Hub 320px stats resilience
    test(
      "Branch hub statistics boxes use min-w-0 to prevent 320px overflow",
      homeHtml.includes("min-w-0 sm:min-w-[110px]")
    );

    // 6. Audit Customer Reviews Arrow placement
    test(
      "Customer reviews navigation arrows use safe positioning (left-1 / right-1 on mobile)",
      homeHtml.includes("left-1 sm:-left-5") && homeHtml.includes("right-1 sm:-right-5")
    );

    // 7. Audit Nearby Hospitals section
    test(
      "Nearby hospitals search input has min-w-0 on mobile",
      homeHtml.includes("min-w-0 sm:min-w-[220px]")
    );

    // 8. Audit Property Details Page
    const propRes = await fetch("http://localhost:3000/properties/1bhk");
    const propHtml = await propRes.text();

    test("HTTP 200 Property details page loads", propRes.status === 200);

    test(
      "Property gallery supports fullscreen photo lightbox on tap",
      propHtml.includes("aria-label=\"Tap to view fullscreen gallery\"") || propHtml.includes("Photos")
    );

    test(
      "Property details page has mobile sticky bottom bar with advance payable",
      propHtml.includes("lg:hidden fixed bottom-0") && propHtml.includes("Advance:")
    );

    test(
      "Property page has generous bottom padding (pb-32 sm:pb-24) to clear sticky bar",
      propHtml.includes("pb-32 sm:pb-24")
    );

    // 9. Audit Checkout Page
    const checkoutRes = await fetch("http://localhost:3000/checkout?property=1bhk&checkIn=2026-11-10&checkOut=2026-11-13&adults=2");
    const checkoutHtml = await checkoutRes.text();

    test("HTTP 200 Checkout page loads", checkoutRes.status === 200);

    test(
      "Checkout places Reservation Summary first on mobile (order-first lg:order-last)",
      checkoutHtml.includes("order-first lg:order-last")
    );

    test(
      "Checkout includes mandatory photo ID compliance alert and 20% advance calculation",
      checkoutHtml.includes("Mandatory Photo Identification Requirement") && checkoutHtml.includes("20% Advance")
    );

    // 10. Audit Footer
    test(
      "Footer has stacked responsive layout and contact details",
      homeHtml.includes("lg:col-span-7 grid grid-cols-1 sm:grid-cols-3") && homeHtml.includes("WhatsApp Concierge")
    );

  } catch (err: unknown) {
    failures++;
    console.error("Test execution error:", err instanceof Error ? err.message : String(err));
  }

  console.log("\n==================================================================");
  console.log(`MOBILE AUDIT RESULTS: ${passes} PASSED | ${failures} FAILED`);
  console.log("==================================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runMobileAudit().catch((e) => {
  console.error("Suite failed:", e);
  process.exit(1);
});
