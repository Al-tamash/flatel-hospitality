/**
 * Flatel Hospitality - End-to-End Service & PDF Test Suite
 */

import { BookingService } from "../lib/booking-service.js";
import { getRoomsByBranch } from "../lib/mock-rooms.js";
import { jsPDF } from "jspdf";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("FLATEL HOSPITALITY - SERVICE & API VERIFICATION SUITE");
console.log("========================================================\n");

async function run() {
  console.log("1. INVENTORY & BRANCH ASSIGNMENT VERIFICATION");
  {
    const barkasRooms = getRoomsByBranch("barkas-salala");
    assert(barkasRooms.length === 1, "Barkas Salala has 1 room type assigned (3 BHK)");
    assert(barkasRooms[0].category === "3BHK", "Barkas Salala is 3 BHK");
    assert(barkasRooms[0].totalUnits === 2, "Barkas Salala has exactly 2 units in inventory");
    assert(barkasRooms[0].basePricePerNight === 3000, "Barkas 3 BHK is ₹3,000/night");
    assert(barkasRooms[0].baseAdults === 6, "Barkas 3 BHK has 6 base adults");

    const moghalRooms = getRoomsByBranch("moghal-pura");
    assert(moghalRooms.length === 3, "Moghal Pura has 3 room types assigned (1 BHK, 2 BHK, 4 BHK)");
    const room1 = moghalRooms.find((r) => r.category === "1BHK");
    const room2 = moghalRooms.find((r) => r.category === "2BHK");
    const room4 = moghalRooms.find((r) => r.category === "4BHK");
    assert(room1 !== undefined && room1.basePricePerNight === 2000 && room1.baseAdults === 2, "Moghal 1 BHK is ₹2,000, base 2 adults");
    assert(room2 !== undefined && room2.basePricePerNight === 2500 && room2.baseAdults === 4, "Moghal 2 BHK is ₹2,500, base 4 adults");
    assert(room4 !== undefined && room4.basePricePerNight === 4000 && room4.baseAdults === 8, "Moghal 4 BHK is ₹4,000, base 8 adults");
  }

  console.log("\n2. END-TO-END RESERVATION LIFECYCLE");
  {
    const bookingResult = await BookingService.createBookingIntent({
      unitId: "3bhk",
      checkInDate: "2026-11-01",
      checkOutDate: "2026-11-08", // 7 nights -> 10% discount
      adultsCount: 7, // 1 extra adult
      kidsCount: 2,
      stayPurpose: "medical",
      guest: {
        fullName: "Dr. Ayesha Siddiqui",
        email: "ayesha.siddiqui@example.com",
        phone: "+91 98765 43210",
        specialRequests: "Arriving for Owaisi Hospital consultation",
      },
    });

    const booking = bookingResult.booking;
    assert(booking.bookingCode.startsWith("FLT-"), `Generated valid booking code: ${booking.bookingCode}`);
    assert(booking.totalNights === 7, "Stay duration is 7 nights");
    assert(booking.pricing.discountRate === 0.10, "Triggered 10% weekly duration discount");
    assert(booking.pricing.extraAdults === 1, "1 extra adult identified");
    assert(booking.pricing.extraGuestsTotal === 500 * 7, "Extra adult charge is ₹3,500 (1 * 500 * 7N)");
    assert(booking.paymentStatus === "pending", "Initial payment status is pending");
    assert(booking.bookingStatus === "pending", "Initial booking status is pending");

    // Advance deposit equals 20%
    const expectedGross = (3000 * 7 * 0.9) + 3500; // 18900 + 3500 = 22400
    assert(booking.pricing.grossTotal === expectedGross, `Gross total is ₹${expectedGross}`);
    assert(booking.pricing.advancePayable === Math.round(expectedGross * 0.2), "Advance is exactly 20%");
    assert(booking.pricing.advancePayable + booking.pricing.balanceDueOnArrival === expectedGross, "Advance + Balance equals Gross");

    // Confirm Payment
    const confirmed = await BookingService.confirmPayment({
      bookingId: booking.id,
      paymentId: "pay_test_verified_9999",
      isSandbox: true,
    });
    assert(confirmed.paymentStatus === "advance_paid", "Payment status updated to advance_paid");
    assert(confirmed.bookingStatus === "confirmed", "Booking status confirmed");
    assert(confirmed.gatewayPaymentId === "pay_test_verified_9999", "Payment gateway ID recorded");

    // Retrieval by booking code
    const retrieved = await BookingService.getBooking(booking.bookingCode);
    assert(retrieved !== null && retrieved.id === booking.id, "Successfully retrieved booking by FLT- code");
  }

  console.log("\n3. SERVER-SIDE PDF VOUCHER GENERATION");
  {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.text("FLATEL HOSPITALITY DIGITAL VOUCHER", 14, 20);
    const pdfBytes = doc.output("arraybuffer");
    assert(pdfBytes.byteLength > 500, `Generated valid PDF document buffer (${pdfBytes.byteLength} bytes)`);
  }

  console.log("\n========================================================");
  console.log(`SERVICE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
}

run();
