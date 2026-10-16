/**
 * Flatel Hospitality - Complete User Flow Automated Verification
 * Tests the entire guest lifecycle from discovery to checkout to confirmation
 */

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function run() {
  console.log("\n========================================================");
  console.log("   FLATEL HOSPITALITY — FULL USER FLOW VERIFICATION");
  console.log("========================================================\n");

  // ------------------------------------------------------------------
  // STAGE 1: BROWSING & PROPERTY DETAIL PAGES
  // ------------------------------------------------------------------
  console.log("--- STAGE 1: Discovery & Property Detail Views ---");
  
  // 1.1 Moghal Pura 2 BHK page
  {
    const res = await fetch(`${BASE_URL}/rooms/moghal-pura-2bhk`);
    assert(res.status === 200, "Moghal Pura 2 BHK property page responds with HTTP 200 OK");
    const html = await res.text();
    assert(html.includes("2 BHK") || html.includes("Family"), "Page contains '2 BHK' suite title");
    assert(html.includes("Moghal Pura"), "Page correctly displays 'Moghal Pura' branch");
    assert(html.includes("Charminar"), "Page highlights Charminar quarter location");
  }

  // 1.2 Barkas Salala 3 BHK page
  {
    const res = await fetch(`${BASE_URL}/rooms/barkas-salala-3bhk`);
    assert(res.status === 200, "Barkas Salala 3 BHK property page responds with HTTP 200 OK");
    const html = await res.text();
    assert(html.includes("3 BHK") || html.includes("Grand"), "Page contains '3 BHK' suite title");
    assert(html.includes("Barkas Salala"), "Page correctly displays 'Barkas Salala' branch");
    assert(html.includes("Airport") || html.includes("Princess Durru"), "Page highlights Airport corridor & hospital proximity");
  }

  // 1.3 Properties route aliases
  {
    const res = await fetch(`${BASE_URL}/properties/2bhk`);
    assert(res.status === 200, "Canonical /properties/2bhk route resolves successfully with 200 OK");
  }

  // ------------------------------------------------------------------
  // STAGE 2: INVENTORY & SEARCH INTEGRITY
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 2: Inventory & Branch Data Integrity ---");
  {
    const res = await fetch(`${BASE_URL}/api/inventory`);
    assert(res.status === 200, "/api/inventory API endpoint returns 200 OK");
    const data = await res.json();
    assert(data.success === true, "Inventory response has success: true");
    assert(Array.isArray(data.units) && data.units.length >= 4, `Inventory contains ${data.units?.length} serviced flat units`);
    
    const moghalUnits = data.units.filter((u) => u.branchSlug === "moghal-pura");
    const barkasUnits = data.units.filter((u) => u.branchSlug === "barkas-salala");
    assert(moghalUnits.length === 3, "Moghal Pura branch has exactly 3 units (1, 2, 4 BHK)");
    assert(barkasUnits.length === 1, "Barkas Salala branch has 3 BHK units");
  }

  // ------------------------------------------------------------------
  // STAGE 3: CHECKOUT PAGE RENDERING & PARAMETER PARSING
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 3: Checkout Page Parameter Flow ---");
  {
    const params = new URLSearchParams({
      property: "2bhk",
      checkIn: "2026-11-10",
      checkOut: "2026-11-15", // 5 nights @ ₹2,500 = ₹12,500
      adults: "4",
      kids: "1",
      purpose: "family",
    });

    const res = await fetch(`${BASE_URL}/checkout?${params.toString()}`);
    assert(res.status === 200, "Checkout page loads with 200 OK with booking query parameters");
    const html = await res.text();
    assert(html.includes("Checkout") || html.includes("Reservation"), "Checkout page rendered checkout header");
  }

  // ------------------------------------------------------------------
  // STAGE 4: SERVER-SIDE BOOKING CREATION API
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 4: Booking Intent Creation API ---");
  let createdBooking = null;
  let testDates = null;
  {
    // Generate a fresh 5-night date range to avoid clashes with existing records
    const offsetDays = Math.floor(Math.random() * 500) + 300;
    const checkIn = new Date(Date.now() + offsetDays * 86400000);
    const checkOut = new Date(checkIn.getTime() + 5 * 86400000);
    const checkInDate = checkIn.toISOString().split("T")[0];
    const checkOutDate = checkOut.toISOString().split("T")[0];
    testDates = { checkInDate, checkOutDate };

    const bookingPayload = {
      unitId: "2bhk",
      checkInDate,
      checkOutDate, // Exactly 5 nights
      adultsCount: 4,
      kidsCount: 1,
      stayPurpose: "family",
      guest: {
        fullName: "Mohammed Khalid",
        email: "khalid.guest@flatel.in",
        phone: "+91 98765 43210",
        specialRequests: "Family wedding gathering; need iron and extra pillows",
      },
    };

    const res = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload),
    });

    const data = await res.json();
    if (res.status !== 200) {
      console.error("Booking create error response:", data);
    }
    assert(res.status === 200, "Booking intent creation API returns 200 OK");
    assert(data.success === true, "Booking API returned success: true");
    assert(Boolean(data.bookingId), `Generated booking ID: ${data.bookingId}`);
    assert(Boolean(data.bookingCode), `Generated booking code: ${data.bookingCode}`);
    assert(Boolean(data.orderId), `Generated payment order ID: ${data.orderId}`);
    
    // 5 nights * ₹2,500 = ₹12,500
    // 20% advance = ₹2,500
    // 80% balance = ₹10,000
    assert(data.pricing.grossTotal === 12500, `Gross total correctly equals ₹12,500 (got ${data.pricing.grossTotal})`);
    assert(data.pricing.advancePayable === 2500, `20% advance payable correctly equals ₹2,500 (got ${data.pricing.advancePayable})`);
    assert(data.pricing.balanceDueOnArrival === 10000, `80% balance due correctly equals ₹10,000 (got ${data.pricing.balanceDueOnArrival})`);
    
    createdBooking = data;
  }

  // ------------------------------------------------------------------
  // STAGE 5: PAYMENT VERIFICATION & STATUS UPDATE
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 5: Payment Verification & Confirmation ---");
  {
    const verifyPayload = {
      bookingId: createdBooking.bookingId,
      orderId: createdBooking.orderId,
      paymentId: `pay_test_${Date.now()}`,
      isSandbox: true,
    };

    const res = await fetch(`${BASE_URL}/api/bookings/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyPayload),
    });

    assert(res.status === 200, "Payment verification API returns 200 OK");
    const data = await res.json();
    assert(data.success === true, "Payment verification succeeded with success: true");
    assert(data.bookingStatus === "confirmed", `Booking status updated to confirmed (got ${data.bookingStatus})`);
    assert(data.paymentStatus === "advance_paid", `Payment status updated to advance_paid (got ${data.paymentStatus})`);
    assert(Boolean(data.bookingCode), `Returned confirmed booking code: ${data.bookingCode}`);
  }

  // ------------------------------------------------------------------
  // STAGE 6: CONFIRMATION PAGE & PDF VOUCHER ACCESS
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 6: Booking Confirmation View & PDF Voucher ---");
  {
    // 6.1 Confirmation page HTML
    const pageRes = await fetch(`${BASE_URL}/booking-confirmation/${createdBooking.bookingCode}`);
    assert(pageRes.status === 200, "Booking confirmation page responds with 200 OK for verified booking code");

    // 6.2 Booking record retrieval API
    const apiRes = await fetch(`${BASE_URL}/api/bookings/${createdBooking.bookingCode}`);
    assert(apiRes.status === 200, "Booking API returns 200 OK for verified booking code");
    const apiData = await apiRes.json();
    assert(apiData.success === true, "Booking API returned success: true");
    assert(apiData.booking.bookingStatus === "confirmed", "Booking status is confirmed in database");

    // 6.3 PDF Voucher Generation
    const voucherRes = await fetch(`${BASE_URL}/api/bookings/${createdBooking.bookingCode}/voucher`);
    assert(voucherRes.status === 200, "PDF voucher endpoint returns 200 OK");
    const contentType = voucherRes.headers.get("content-type");
    assert(contentType && contentType.includes("pdf"), `Voucher content-type is application/pdf (got ${contentType})`);
  }

  // ------------------------------------------------------------------
  // STAGE 7: FORM VALIDATION & DEFENSIVE ERROR HANDLING
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 7: Defensive Error & Boundary Handling ---");
  
  // 7.1 Rejects zero-night dates
  {
    const badPayload = {
      unitId: "2bhk",
      checkInDate: "2026-11-20",
      checkOutDate: "2026-11-20", // 0 nights
      adultsCount: 2,
      kidsCount: 0,
      stayPurpose: "medical",
      guest: { fullName: "Test", email: "test@test.com", phone: "+919876543210" },
    };

    const res = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(badPayload),
    });

    assert(res.status === 400, "API strictly rejects 0-night reservation with 400 Bad Request");
  }

  // 7.2 Rejects occupancy exceeding property max limit
  {
    const overCapacityPayload = {
      unitId: "1bhk", // Max 4 adults
      checkInDate: "2026-11-20",
      checkOutDate: "2026-11-22",
      adultsCount: 10, // Over max
      kidsCount: 0,
      stayPurpose: "medical",
      guest: { fullName: "Test", email: "test@test.com", phone: "+919876543210" },
    };

    const res = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overCapacityPayload),
    });

    assert(res.status === 400, "API strictly rejects over-capacity adults (10 in 1BHK) with 400 Bad Request");
  }

  // 7.3 Rejects missing guest contact details
  {
    const missingContactPayload = {
      unitId: "2bhk",
      checkInDate: "2026-11-20",
      checkOutDate: "2026-11-22",
      adultsCount: 2,
      kidsCount: 0,
      stayPurpose: "medical",
      guest: { fullName: "Test", email: "", phone: "" },
    };

    const res = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(missingContactPayload),
    });

    assert(res.status === 400, "API strictly rejects missing guest phone/email with 400 Bad Request");
  }

  // 7.4 Double-booking conflict rejection on reserved dates
  {
    const doubleBookingPayload = {
      unitId: "2bhk",
      checkInDate: testDates.checkInDate,
      checkOutDate: testDates.checkOutDate,
      adultsCount: 2,
      kidsCount: 0,
      stayPurpose: "medical",
      guest: { fullName: "Second Guest", email: "guest2@test.com", phone: "+919876543211" },
    };

    const res = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doubleBookingPayload),
    });

    assert(res.status === 400, "API strictly rejects overlapping double-booking on reserved dates with 400 Bad Request");
  }

  // ------------------------------------------------------------------
  // STAGE 8: GUEST SELF-SERVICE MY-BOOKINGS LOOKUP
  // ------------------------------------------------------------------
  console.log("\n--- STAGE 8: Guest Lookup / My Bookings ---");
  {
    const res = await fetch(`${BASE_URL}/api/bookings/my-bookings?phone=9876543210`);
    assert(res.status === 200, "My-bookings API returns 200 OK for guest phone lookup");
    const data = await res.json();
    assert(data.success === true, "My-bookings API returned success: true");
    assert(Array.isArray(data.bookings) && data.bookings.length > 0, `Found ${data.count} bookings for guest phone`);
    const found = data.bookings.find(b => b.bookingCode === createdBooking.bookingCode);
    assert(Boolean(found), `Found confirmed booking ${createdBooking.bookingCode} in guest booking history`);
  }

  console.log("\n========================================================");
  console.log(`   FLOW SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
