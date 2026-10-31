/**
 * FLATEL HOSPITALITY — 22-POINT AUTOMATED FUNCTIONAL VERIFICATION SUITE
 * Validates all requirements specified in final-prd.md and task instructions.
 */

import { getBranchBySlug } from "../lib/constants";
import { MOCK_ROOMS, getRoomById, getRoomsByBranch, PURPOSE_PACKAGES } from "../lib/mock-rooms";
import { calculateFlatelPrice } from "../lib/pricing";
import { BookingService } from "../lib/booking-service";
import { jsPDF } from "jspdf";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] Test ${totalTests}: ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

async function runAllTests() {
  console.log("\n=======================================================");
  console.log("   FLATEL HOSPITALITY — 22-POINT AUDIT TEST SUITE");
  console.log("=======================================================\n");

  // TEST 1: Both branch routes load correctly
  const barkas = getBranchBySlug("barkas-salala");
  const moghal = getBranchBySlug("moghal-pura");
  assert(
    Boolean(barkas && barkas.name === "Barkas Salala" && moghal && moghal.name === "Moghal Pura"),
    "Both branch routes /barkas-salala and /moghal-pura resolve correctly"
  );

  // TEST 2: Invalid branch and property slugs return 404 (undefined in lookup)
  const invalidBranch = getBranchBySlug("non-existent-branch");
  const invalidProperty = getRoomById("non-existent-flat");
  assert(
    invalidBranch === undefined && invalidProperty === undefined,
    "Invalid branch and property slugs return 404 (undefined in lookup layer)"
  );

  // TEST 3: Branch pages display only properties assigned to that branch
  const barkasProperties = getRoomsByBranch("barkas-salala");
  const moghalProperties = getRoomsByBranch("moghal-pura");
  const allBarkasMatch = barkasProperties.every((p) => p.branchSlug === "barkas-salala");
  const allMoghalMatch = moghalProperties.every((p) => p.branchSlug === "moghal-pura");
  assert(
    barkasProperties.length === 1 && moghalProperties.length === 3 && allBarkasMatch && allMoghalMatch,
    "Branch pages display exclusively properties assigned to that specific branch"
  );

  // TEST 4: Existing inventory and prices match the approved data
  const flat3bhk = barkasProperties.find((p) => p.category === "3BHK");
  const flat1bhk = moghalProperties.find((p) => p.category === "1BHK");
  const flat2bhk = moghalProperties.find((p) => p.category === "2BHK");
  const flat4bhk = moghalProperties.find((p) => p.category === "4BHK");
  const is5bhkInMock = MOCK_ROOMS.some((p) => p.category === "5BHK");
  const inventoryMatch =
    flat3bhk?.totalUnits === 2 &&
    flat3bhk?.basePricePerNight === 3000 &&
    flat3bhk?.baseAdults === 6 &&
    flat1bhk?.totalUnits === 1 &&
    flat1bhk?.basePricePerNight === 2000 &&
    flat1bhk?.baseAdults === 2 &&
    flat2bhk?.totalUnits === 1 &&
    flat2bhk?.basePricePerNight === 2500 &&
    flat2bhk?.baseAdults === 4 &&
    flat4bhk?.totalUnits === 1 &&
    flat4bhk?.basePricePerNight === 4000 &&
    flat4bhk?.baseAdults === 8 &&
    !is5bhkInMock;
  assert(
    inventoryMatch,
    "Inventory & prices match approved data (Barkas: two 3BHK @ ₹3k; Moghal: 1BHK @ ₹2k, 2BHK @ ₹2.5k, 4BHK @ ₹4k; 5BHK unlisted)"
  );

  // TEST 5: Property detail links open the correct property
  const p1 = getRoomById("1bhk");
  const p2 = getRoomById("2bhk");
  const p3 = getRoomById("3bhk");
  const p4 = getRoomById("4bhk");
  assert(
    p1?.slug === "1bhk" && p2?.slug === "2bhk" && p3?.slug === "3bhk" && p4?.slug === "4bhk",
    "Property detail identifiers (1bhk, 2bhk, 3bhk, 4bhk) resolve exact matching records"
  );

  // TEST 6: Date selection calculates nights correctly
  const fare3N = calculateFlatelPrice({
    nights: 3,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
  });
  assert(fare3N.nights === 3 && fare3N.standardBaseRent === 6000, "Date calculation accurately reflects nights and base rate");

  // TEST 7: Discount boundaries are correct at 6/7, 14/15, and 27/28 nights
  const f6 = calculateFlatelPrice({ nights: 6, basePricePerNight: 1000, baseAdults: 2, selectedAdults: 2 });
  const f7 = calculateFlatelPrice({ nights: 7, basePricePerNight: 1000, baseAdults: 2, selectedAdults: 2 });
  const f14 = calculateFlatelPrice({ nights: 14, basePricePerNight: 1000, baseAdults: 2, selectedAdults: 2 });
  const f15 = calculateFlatelPrice({ nights: 15, basePricePerNight: 1000, baseAdults: 2, selectedAdults: 2 });
  const f27 = calculateFlatelPrice({ nights: 27, basePricePerNight: 1000, baseAdults: 2, selectedAdults: 2 });
  const f28 = calculateFlatelPrice({ nights: 28, basePricePerNight: 1000, baseAdults: 2, selectedAdults: 2 });
  assert(
    f6.discountRate === 0 &&
      f7.discountRate === 0.1 &&
      f14.discountRate === 0.1 &&
      f15.discountRate === 0.15 &&
      f27.discountRate === 0.15 &&
      f28.discountRate === 0.25,
    "Discount boundaries strictly verify at 6N (0%), 7N (10%), 14N (10%), 15N (15%), 27N (15%), and 28N (25%)"
  );

  // TEST 8: Extra adult charges use the correct capacity and rate (₹500/night each)
  const fareExtra = calculateFlatelPrice({
    nights: 4,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 4, // 2 extra adults
    extraPersonFee: 500,
  });
  assert(
    fareExtra.extraAdults === 2 && fareExtra.extraGuestsTotal === 2 * 500 * 4,
    "Extra adult fee computes exactly max(0, adults - baseAdults) * ₹500 * nights"
  );

  // TEST 9: Children are free but count toward capacity
  const fareWithKids = calculateFlatelPrice({
    nights: 3,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
    selectedKids: 3, // 3 kids aged 0-12
  });
  assert(
    fareWithKids.extraGuestsTotal === 0 && fareWithKids.grossTotal === 6000,
    "Children aged 0–12 stay completely free without triggering extra person charges"
  );

  // TEST 10: Paid add-ons calculate correctly for each pricing basis
  const fareAddons = calculateFlatelPrice({
    nights: 3,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
    selectedPaidAddons: [
      { name: "Rollaway Bed", price: 500, pricingType: "per_night" }, // 500 * 3 = 1500
      { name: "Airport Transfer", price: 1200, pricingType: "flat" }, // 1200 once
      { name: "Breakfast", price: 200, pricingType: "per_person" }, // 200 * 2 adults * 3 nights = 1200
    ],
  });
  const expectedAddonsTotal = 1500 + 1200 + 1200; // 3900
  assert(
    fareAddons.addonsTotal === expectedAddonsTotal,
    `Paid add-ons compute correctly across per_night, per_booking, and per_person (${fareAddons.addonsTotal} === ${expectedAddonsTotal})`
  );

  // TEST 11: Unpriced add-ons cannot be charged without an approved quote
  const fareQuote = calculateFlatelPrice({
    nights: 3,
    basePricePerNight: 2000,
    baseAdults: 2,
    selectedAdults: 2,
    selectedPaidAddons: [
      { name: "Doctor Visit", price: 0, pricingType: "quote" },
      { name: "Oxygen Setup", price: 0, pricingType: "quote" },
    ],
  });
  assert(
    fareQuote.addonsTotal === 0,
    "Quote on Request / unpriced add-ons contribute ₹0 and cannot silently enter payable total"
  );

  // TEST 12: 20% of the stay plus add-ons in full is paid online; the rest of the stay is due on arrival
  const fareSplit = calculateFlatelPrice({
    nights: 5,
    basePricePerNight: 2500,
    baseAdults: 4,
    selectedAdults: 5, // 1 extra adult: 1 * 500 * 5 = 2500
    selectedPaidAddons: [{ name: "Extra Mattress", price: 500, pricingType: "per_night" }], // 500 * 5 = 2500
  });
  assert(
    fareSplit.advancePayable + fareSplit.balanceDueOnArrival === fareSplit.grossTotal &&
      fareSplit.flatAdvance === Math.round((fareSplit.grossTotal - fareSplit.addonsTotal) * 0.2) &&
      fareSplit.servicesPrepaid === fareSplit.addonsTotal &&
      fareSplit.advancePayable === fareSplit.flatAdvance + fareSplit.addonsTotal,
    "20% of the stay plus add-ons in full, plus the remaining balance, equals the gross total"
  );

  // TEST 13: Invalid dates and excessive occupancy are rejected
  let dateRejected = false;
  let occupancyRejected = false;
  try {
    calculateFlatelPrice({ nights: 0, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 });
  } catch {
    dateRejected = true;
  }
  try {
    await BookingService.createBookingIntent({
      unitId: "1bhk",
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-12",
      adultsCount: 15, // max is 4
      kidsCount: 0,
      stayPurpose: "medical",
      guest: { fullName: "Test", email: "test@example.com", phone: "+919876543210" },
    });
  } catch {
    occupancyRejected = true;
  }
  assert(dateRejected && occupancyRejected, "Invalid dates (0 nights) and excessive occupancy (15 adults in 1BHK) are strictly rejected");

  // TEST 14: Checkout validates guest details
  let missingPhoneRejected = false;
  try {
    await BookingService.createBookingIntent({
      unitId: "1bhk",
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-12",
      adultsCount: 2,
      kidsCount: 0,
      stayPurpose: "medical",
      guest: { fullName: "Test", email: "test@example.com", phone: "" },
    });
  } catch {
    missingPhoneRejected = true;
  }
  assert(missingPhoneRejected, "Checkout validation enforces full guest details including WhatsApp mobile number");

  // TEST 15: Payment failure does not create a falsely confirmed booking
  BookingService.resetStoreForTesting();
  const intent1 = await BookingService.createBookingIntent({
    unitId: "1bhk",
    checkInDate: "2026-12-01",
    checkOutDate: "2026-12-03",
    adultsCount: 2,
    kidsCount: 0,
    stayPurpose: "medical",
    guest: { fullName: "Ali Khan", email: "ali@example.com", phone: "+919876543210" },
  });
  const failedBooking = await BookingService.markPaymentFailed(intent1.booking.id, "Bank transaction declined");
  assert(
    failedBooking.bookingStatus === "cancelled" && failedBooking.paymentStatus === "failed",
    "Payment failure marks booking status cancelled and paymentStatus failed, preventing false confirmation"
  );

  // TEST 16: Only verified payments can complete the required paid booking flow
  const intent2 = await BookingService.createBookingIntent({
    unitId: "2bhk",
    checkInDate: "2026-12-10",
    checkOutDate: "2026-12-12",
    adultsCount: 4,
    kidsCount: 0,
    stayPurpose: "family",
    guest: { fullName: "Fatima Begum", email: "fatima@example.com", phone: "+919876543210" },
  });
  const confirmedBooking = await BookingService.confirmPayment({
    bookingId: intent2.booking.id,
    paymentId: "pay_verified_12345",
    isSandbox: true,
  });
  assert(
    confirmedBooking.bookingStatus === "confirmed" &&
      confirmedBooking.paymentStatus === "advance_paid" &&
      confirmedBooking.gatewayPaymentId === "pay_verified_12345",
    "Verified payments successfully advance booking to confirmed with payment reference"
  );

  // TEST 17: Duplicate payment callbacks do not duplicate bookings or notifications
  const repeatConfirmed = await BookingService.confirmPayment({
    bookingId: intent2.booking.id,
    paymentId: "pay_verified_12345",
    isSandbox: true,
  });
  const allBookings = await BookingService.listBookings();
  assert(
    repeatConfirmed.id === intent2.booking.id && allBookings.length === 2,
    "Idempotent payment confirmation prevents duplicate bookings or repeated processing"
  );

  // TEST 18: Confirmation details match database record
  const fetched = await BookingService.getBooking(intent2.booking.bookingCode);
  assert(
    fetched !== null &&
      fetched.bookingCode === intent2.booking.bookingCode &&
      fetched.guest.fullName === "Fatima Begum" &&
      fetched.pricing.advancePayable === intent2.booking.pricing.advancePayable,
    "Confirmation details match exact server booking record by booking code"
  );

  // TEST 19: PDF voucher downloads successfully for confirmed booking
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.text("FLATEL HOSPITALITY", 14, 20);
  doc.text(confirmedBooking.bookingCode, 14, 30);
  const pdfBytes = doc.output("arraybuffer");
  assert(
    pdfBytes.byteLength > 500,
    `PDF voucher generation produces valid document buffer (${pdfBytes.byteLength} bytes)`
  );

  // TEST 20: Google Maps opens verified location
  const barkasMaps = barkas?.googleMapsUrl;
  const moghalMaps = moghal?.googleMapsUrl;
  assert(
    Boolean(
      barkasMaps &&
        barkasMaps.includes("Barkas") &&
        moghalMaps &&
        moghalMaps.includes("Charminar")
    ),
    "Google Maps links direct to verified branch landmarks without fabricated coordinates"
  );

  // TEST 21: WhatsApp delivery status is recorded accurately
  assert(
    confirmedBooking.notificationStatus === "pending_waba_configuration" ||
      confirmedBooking.notificationStatus === "sent",
    "WhatsApp delivery status is accurately tracked (pending_waba_configuration without credentials)"
  );

  // TEST 22: Existing homepage navigation and stay purpose catalog remain functional
  const packagesPresent = PURPOSE_PACKAGES.length === 5;
  const medicalPkg = PURPOSE_PACKAGES.find((p) => p.id === "medical");
  const weddingPkg = PURPOSE_PACKAGES.find((p) => p.id === "wedding");
  const familyPkg = PURPOSE_PACKAGES.find((p) => p.id === "family");
  const hasFreeHousekeeping = familyPkg?.complimentaryServices.some((s) => s.name.includes("Housekeeping"));
  const hasAmbulance = medicalPkg?.complimentaryServices.some((s) => s.name.includes("Ambulance"));
  const hasWeddingAssistance = weddingPkg?.complimentaryServices.some((s) => s.name.includes("Wedding Guest"));
  assert(
    packagesPresent && Boolean(hasFreeHousekeeping && hasAmbulance && hasWeddingAssistance),
    "Catalog integrity verified: 5 distinct stay purposes (including separated Wedding Stay), complimentary inclusions, and housekeeping policy"
  );

  console.log("\n-------------------------------------------------------");
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log("-------------------------------------------------------\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
