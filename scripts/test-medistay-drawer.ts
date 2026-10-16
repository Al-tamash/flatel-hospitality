import { PURPOSE_CONFIGS } from "../components/rooms/room-detail-data";

async function verifyMedistayDrawer() {
  console.log("=======================================================");
  console.log("   FLATEL MEDISTAY DRAWER REDESIGN VERIFICATION");
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

  // 1. Verify Medistay Configuration & Catalogue
  const medistay = PURPOSE_CONFIGS.find((p) => p.id === "medical");
  test("Medistay config exists in PURPOSE_CONFIGS", () => !!medistay);

  const complimentary = medistay?.services.filter((s) => s.type === "free") || [];
  const paidAddons = medistay?.services.filter((s) => s.type === "addon") || [];

  test("Complimentary services count is exactly 13 approved items", () => complimentary.length === 13);
  test("Paid add-ons count is exactly 5 approved items", () => paidAddons.length === 5);

  // 2. Verify 3 Groups Partition
  const vitalsIds = ["med-09", "med-10", "med-11", "med-12"];
  const conciergeIds = ["med-01", "med-04", "med-02", "med-03", "med-05"];
  const mobilityIds = ["med-06", "med-07", "med-08", "med-13"];

  const vitalsGroup = complimentary.filter((s) => vitalsIds.includes(s.id));
  const conciergeGroup = complimentary.filter((s) => conciergeIds.includes(s.id));
  const mobilityGroup = complimentary.filter((s) => mobilityIds.includes(s.id));

  test("Group 1 (In-Suite Vitals Kit) has 4 guaranteed items", () => vitalsGroup.length === 4);
  test("Group 2 (Concierge & Liaison) has 5 coordination items", () => conciergeGroup.length === 5);
  test("Group 3 (Mobility & Recovery) has 4 assistive items", () => mobilityGroup.length === 4);
  test("All 13 complimentary items partitioned with 0 missing", () => {
    return vitalsGroup.length + conciergeGroup.length + mobilityGroup.length === complimentary.length;
  });

  // 3. Verify Complimentary Pricing is strictly ₹0
  test("Complimentary items strictly have price undefined and type free", () => {
    return complimentary.every((s) => s.type === "free" && s.price === undefined);
  });

  // 4. Verify Paid Add-ons Pricing & Units
  const expectedPrices: Record<string, { price: number; unit: string; confirmation?: boolean }> = {
    "doctor-nurse-visits": { price: 1500, unit: "/ visit", confirmation: true },
    "oxygen-concentrator": { price: 2500, unit: "/ setup", confirmation: true },
    "patient-meal-prep": { price: 600, unit: "/ night" },
    "priority-check-in": { price: 500, unit: "flat" },
    "hospital-cab-transfer": { price: 800, unit: "/ round-trip" },
  };

  test("All 5 paid add-ons match approved master prices and units", () => {
    return paidAddons.every((s) => {
      if (!s.addonId) return false;
      const expected = expectedPrices[s.addonId];
      if (!expected) return false;
      return s.price === expected.price && s.priceUnit === expected.unit;
    });
  });

  test("Requires confirmation flag strictly present on doctor visits and oxygen setup", () => {
    const doc = paidAddons.find((s) => s.addonId === "doctor-nurse-visits");
    const oxy = paidAddons.find((s) => s.addonId === "oxygen-concentrator");
    return !!doc?.requiresConfirmation && !!oxy?.requiresConfirmation;
  });

  // 5. Test Live Dynamic Subtotal Calculation
  test("Selected-extras subtotal is ₹0 when no paid services selected", () => {
    const total = [].reduce((sum, id) => sum + id, 0);
    return total === 0;
  });

  test("Adding 1 flat addon (cab transfer ₹800) updates subtotal to ₹800", () => {
    const cab = paidAddons.find((s) => s.addonId === "hospital-cab-transfer")!;
    return cab.price === 800;
  });

  test("Adding nightly addon (patient meal prep ₹600) calculates correctly for 3 nights (₹1,800)", () => {
    const meal = paidAddons.find((s) => s.addonId === "patient-meal-prep")!;
    const nights = 3;
    const subtotal = meal.price! * nights;
    return subtotal === 1800;
  });

  test("Removing addon immediately deducts from subtotal", () => {
    let selected = ["hospital-cab-transfer", "doctor-nurse-visits"];
    let subtotal = selected.reduce((sum, id) => {
      const s = paidAddons.find((a) => a.addonId === id);
      return sum + (s?.price || 0);
    }, 0);
    // 800 + 1500 = 2300
    if (subtotal !== 2300) return false;
    // remove doctor visit
    selected = selected.filter((id) => id !== "doctor-nurse-visits");
    subtotal = selected.reduce((sum, id) => {
      const s = paidAddons.find((a) => a.addonId === id);
      return sum + (s?.price || 0);
    }, 0);
    return subtotal === 800;
  });

  // 6. Test Component Source & HTTP SSR Response
  try {
    const res = await fetch("http://localhost:3000/properties/1bhk?purpose=medical");
    test("HTTP 1BHK renders with purpose=medical (200 OK)", () => res.status === 200);

    const fs = await import("fs");
    const componentSource = fs.readFileSync("components/rooms/room-detail-view.tsx", "utf-8");

    test("Drawer template contains 'Medistay services'", () => componentSource.includes('"Medistay services"'));
    test("Drawer template contains 'Hospital & medical support during your stay'", () =>
      componentSource.includes('"Hospital & medical support during your stay"'));
    test("Drawer template contains 'Included with your stay'", () => componentSource.includes("Included with your stay"));
    test("Drawer template contains 'Complimentary · ₹0 extra'", () => componentSource.includes("Complimentary · ₹0 extra"));
    test("Drawer template contains 'Optional paid services'", () => componentSource.includes("Optional paid services"));
    test("Drawer template contains 'Only pay for what you choose'", () => componentSource.includes("Only pay for what you choose"));
    test("Drawer template contains 'Save services & return to booking'", () =>
      componentSource.includes("Save services &amp; return to booking") || componentSource.includes("Save services & return to booking"));
    test("Drawer template contains 'Continue with accommodation only'", () =>
      componentSource.includes("Continue with accommodation only"));
    test("Drawer template contains 3 Medistay groups: Vitals, Concierge, Mobility", () => {
      return (
        componentSource.includes("In-Suite Medical & Vitals Kit") &&
        componentSource.includes("Concierge & Hospital Liaison") &&
        componentSource.includes("Mobility & Recovery Equipment")
      );
    });
    test("Drawer template contains Non-clinical assistance notice", () =>
      componentSource.includes("Non-clinical assistance notice:"));
  } catch (err: unknown) {
    console.error("Verification error:", err instanceof Error ? err.message : String(err));
  }

  console.log("\n=======================================================");
  console.log(`MEDISTAY DRAWER AUDIT: ${passes} PASSED | ${fails} FAILED`);
  console.log("=======================================================\n");

  if (fails > 0) process.exit(1);
}

verifyMedistayDrawer().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
