import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { BookingService } from "@/lib/booking-service";
import { getRoomById } from "@/lib/mock-rooms";
import { getBranchBySlug, BRAND_NAME, BRAND_TAGLINE, CONTACT_PHONE, CONTACT_EMAIL } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const booking = await BookingService.getBooking(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.bookingStatus !== "confirmed" || booking.paymentStatus !== "advance_paid") {
      return NextResponse.json(
        { success: false, error: "A voucher is available after payment is confirmed." },
        { status: 409 }
      );
    }

    const room = getRoomById(booking.unitId);
    const branch = room?.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
    const branchName = branch ? branch.name : "Hyderabad";
    const branchAddress = branch
      ? branch.address
      : "Barkas Salala / Moghal Pura, Hyderabad, Telangana";

    // Initialize A4 PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    // Header Background Accent Bar
    doc.setFillColor(14, 10, 7); // #0E0A07 Warm Obsidian
    doc.rect(0, 0, pageWidth, 42, "F");

    // Gold decorative top line
    doc.setFillColor(229, 193, 120); // #E5C178 Champagne Gold
    doc.rect(0, 0, pageWidth, 3, "F");

    // Brand Name
    doc.setTextColor(250, 244, 235); // #FAF4EB Warm Ivory
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(BRAND_NAME.toUpperCase(), 14, y);

    // Tagline
    doc.setTextColor(184, 166, 146); // #B8A692 Warm Sand
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(BRAND_TAGLINE, 14, y + 6);

    // Booking Code Pill Badge (Right Aligned)
    doc.setFillColor(22, 16, 11); // #16100B Warm Espresso
    doc.roundedRect(pageWidth - 65, 10, 51, 15, 2, 2, "F");
    doc.setTextColor(229, 193, 120); // #E5C178
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CONFIRMED BOOKING", pageWidth - 60, 16);
    doc.setTextColor(250, 244, 235);
    doc.setFontSize(12);
    doc.text(booking.bookingCode, pageWidth - 60, 22);

    y = 50;

    // Section 1: Guest & Residence Summary Box
    doc.setDrawColor(212, 163, 89);
    doc.setFillColor(252, 250, 247);
    doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, "FD");

    // Left Column: Guest Details
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PRIMARY GUEST", 20, y + 8);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.text(booking.guest.fullName, 20, y + 15);

    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Phone: ${booking.guest.phone}`, 20, y + 21);
    doc.text(`Email: ${booking.guest.email}`, 20, y + 26);
    if (booking.guest.isInternational) {
      doc.text("Guest Type: International Passport Holder", 20, y + 31);
    }

    // Right Column: Reserved Property
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("RESERVED RESIDENCE", pageWidth / 2 + 5, y + 8);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.text(room ? room.title : booking.unitId.toUpperCase(), pageWidth / 2 + 5, y + 15);

    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Branch: ${branchName}`, pageWidth / 2 + 5, y + 21);
    doc.text(`Address: ${branchAddress.slice(0, 48)}`, pageWidth / 2 + 5, y + 26);
    doc.text(`Stay Purpose: ${booking.stayPurpose.toUpperCase()}`, pageWidth / 2 + 5, y + 31);

    y += 44;

    // Section 2: Stay Schedule & Timings
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, "FD");

    // Check-in
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("CHECK-IN DATE & WINDOW", 20, y + 7);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10.5);
    doc.text(booking.checkInDate, 20, y + 14);
    doc.setTextColor(120, 80, 20);
    doc.setFontSize(8);
    doc.text("11:00 AM – 1:00 PM", 20, y + 20);

    // Check-out
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("CHECK-OUT DATE & TIME", 75, y + 7);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10.5);
    doc.text(booking.checkOutDate, 75, y + 14);
    doc.setTextColor(120, 80, 20);
    doc.setFontSize(8);
    doc.text("11:00 AM", 75, y + 20);

    // Total Duration
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("DURATION & GUESTS", 135, y + 7);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10.5);
    doc.text(`${booking.totalNights} Night${booking.totalNights > 1 ? "s" : ""}`, 135, y + 14);
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.text(
      `${booking.adultsCount} Adult${booking.adultsCount > 1 ? "s" : ""}${booking.kidsCount > 0 ? `, ${booking.kidsCount} Child(ren)` : ""}`,
      135,
      y + 20
    );

    y += 38;

    // Section 3: Financial & Payment Split Table
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PAYMENT BREAKDOWN & ADVANCE VOUCHER", 14, y);

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    const printFareRow = (label: string, amount: string, isBold = false) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(isBold ? 20 : 60, isBold ? 20 : 60, isBold ? 20 : 60);
      doc.text(label, 20, y);
      doc.text(amount, pageWidth - 20, y, { align: "right" });
      y += 6;
    };

    printFareRow(
      `Standard Base Rent (${booking.totalNights} nights)`,
      `INR ${booking.pricing.standardBaseRent.toLocaleString("en-IN")}`
    );

    if (booking.pricing.baseRentDiscount > 0) {
      printFareRow(
        `Duration Discount (${Math.round(booking.pricing.discountRate * 100)}%)`,
        `- INR ${booking.pricing.baseRentDiscount.toLocaleString("en-IN")}`
      );
    }

    if (booking.pricing.extraGuestsTotal > 0) {
      printFareRow(
        `Extra Adult Fee (${booking.extraGuestsCount} adults @ INR 500/night)`,
        `INR ${booking.pricing.extraGuestsTotal.toLocaleString("en-IN")}`
      );
    }

    if (booking.pricing.addonsTotal > 0) {
      printFareRow(
        `Selected Paid Add-on Services`,
        `INR ${booking.pricing.addonsTotal.toLocaleString("en-IN")}`
      );
    }

    y += 1;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, pageWidth - 20, y);
    y += 5;

    printFareRow(
      "GROSS BOOKING TOTAL",
      `INR ${booking.pricing.grossTotal.toLocaleString("en-IN")}`,
      true
    );

    y += 2;

    // Advance Paid Banner Box
    doc.setFillColor(235, 245, 235);
    doc.setDrawColor(180, 220, 180);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "FD");
    doc.setTextColor(20, 110, 35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("20% ADVANCE ONLINE DEPOSIT — VERIFIED & PAID", 20, y + 6);
    doc.setFontSize(10.5);
    doc.text(
      `INR ${booking.pricing.advancePayable.toLocaleString("en-IN")}`,
      pageWidth - 20,
      y + 6,
      { align: "right" }
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      `Payment Ref: ${booking.gatewayPaymentId || "DIRECT-GATEWAY-TXN"} · Status: Confirmed`,
      20,
      y + 11
    );

    y += 18;

    // Remaining Balance Due on Arrival Box
    doc.setFillColor(254, 248, 235);
    doc.setDrawColor(240, 215, 160);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "FD");
    doc.setTextColor(150, 95, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("80% REMAINING BALANCE DUE AT PROPERTY ON ARRIVAL", 20, y + 6);
    doc.setFontSize(10.5);
    doc.text(
      `INR ${booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")}`,
      pageWidth - 20,
      y + 6,
      { align: "right" }
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Payable upon check-in via Cash or UPI at the front desk", 20, y + 11);

    y += 20;

    // Section 4: House Rules, ID Policy & Cancellation
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("IMPORTANT GUEST GUIDELINES & POLICIES", 14, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);

    const rules = [
      "1. Mandatory ID: Domestic guests must present an original government-issued photo ID for each adult (Aadhaar/Driving License/Voter ID). International guests must present an original physical passport and valid visa.",
      "2. Check-in Window: Standard check-in is 11:00 AM – 1:00 PM. Check-out is 11:00 AM.",
      "3. Housekeeping: Complimentary housekeeping is provided on alternate days.",
      "4. Cancellation Terms: The 20% advance booking deposit is fully refundable if cancelled at least 48 hours prior to check-in. Cancellations within 48 hours are non-refundable.",
      "5. Children Policy: Children aged 0–12 stay free of accommodation charge and count toward safety occupancy limits.",
    ];

    for (const rule of rules) {
      doc.text(rule, 14, y);
      y += 4.5;
    }

    y += 4;

    // Footer Contact Info
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `FLATEL Hospitality Front Desk · Helpline: ${CONTACT_PHONE} · Email: ${CONTACT_EMAIL} · Hyderabad, TS`,
      pageWidth / 2,
      y,
      { align: "center" }
    );

    // Generate PDF Buffer
    const pdfOutput = doc.output("arraybuffer");

    return new NextResponse(pdfOutput, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FLATEL-VOUCHER-${booking.bookingCode}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("PDF Voucher generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate digital voucher PDF." },
      { status: 500 }
    );
  }
}
