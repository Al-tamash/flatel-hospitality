import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { BookingService } from "@/lib/booking-service";
import type { BookingRecord } from "@/types/booking";
import { getRoomById } from "@/lib/mock-rooms";
import { getBranchBySlug, BRAND_NAME, BRAND_TAGLINE, CONTACT_PHONE, CONTACT_EMAIL } from "@/lib/constants";
import { shapeAndBidiArabic } from "@/lib/i18n/arabic-reshaper";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

let amiriRegularBase64: string | null = null;
let amiriBoldBase64: string | null = null;

function getAmiriFonts() {
  if (!amiriRegularBase64) {
    const regularPath = path.join(process.cwd(), "lib/i18n/fonts/Amiri-Regular.ttf");
    amiriRegularBase64 = fs.readFileSync(regularPath).toString("base64");
  }
  if (!amiriBoldBase64) {
    const boldPath = path.join(process.cwd(), "lib/i18n/fonts/Amiri-Bold.ttf");
    amiriBoldBase64 = fs.readFileSync(boldPath).toString("base64");
  }
  return { regular: amiriRegularBase64, bold: amiriBoldBase64 };
}

/** All flats that belong on this voucher: the whole group for a combined booking, else just the one. */
async function loadVoucherFlats(booking: BookingRecord): Promise<BookingRecord[]> {
  if (!booking.groupCode) return [booking];
  const group = await BookingService.getBookingsByGroup(booking.groupCode);
  return group.length > 1 ? group : [booking];
}

interface GroupNote {
  code: string;
  index: number;
  total: number;
}

/** Draws one flat's voucher onto the current page of the document. */
function renderVoucherPage(doc: jsPDF, booking: BookingRecord, isArabic: boolean, groupNote?: GroupNote) {
  const rawRoom = getRoomById(booking.unitId);
  const room = isArabic && rawRoom ? getLocalizedRoom(rawRoom, "ar") : rawRoom;
  const branch = rawRoom?.branchSlug ? getBranchBySlug(rawRoom.branchSlug) : undefined;
  const branchName = branch
    ? (isArabic ? (branch.name === "Barkas Salala" ? "باركاس سلالة" : "مغل بورا") : branch.name)
    : (isArabic ? "حيدر أباد" : "Hyderabad");
  const branchAddress = branch
    ? (isArabic ? (branch.slug === "barkas-salala" ? "باركاس سلالة، قرب مطار راجيف غاندي، حيدر أباد" : "مغل بورا، قرب مستشفى برنس ومستشفيات البلدة القديمة") : branch.address)
    : "Barkas Salala / Moghal Pura, Hyderabad, Telangana";


  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Background Accent Bar
  doc.setFillColor(14, 10, 7); // #0E0A07 Warm Obsidian
  doc.rect(0, 0, pageWidth, 42, "F");

  // Gold decorative top line
  doc.setFillColor(229, 193, 120); // #E5C178 Champagne Gold
  doc.rect(0, 0, pageWidth, 3, "F");

  if (isArabic) {
    // Load Arabic Amiri Fonts
    const { regular, bold } = getAmiriFonts();
    doc.addFileToVFS("Amiri-Regular.ttf", regular);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.addFileToVFS("Amiri-Bold.ttf", bold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");

    // Brand Name in Arabic (Right Aligned)
    doc.setTextColor(250, 244, 235);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(18);
    doc.text(shapeAndBidiArabic("ضيافة فلاتيل حيدر أباد"), pageWidth - 14, y, { align: "right" });

    // Tagline in Arabic
    doc.setTextColor(184, 166, 146);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(9);
    doc.text(shapeAndBidiArabic("شقق فندقية مفروشة ومخدمة بالكامل"), pageWidth - 14, y + 7, { align: "right" });

    // Booking Code Pill Badge (Left Aligned)
    doc.setFillColor(22, 16, 11);
    doc.roundedRect(14, 10, 58, 16, 2, 2, "F");
    doc.setTextColor(229, 193, 120);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(8);
    doc.text(shapeAndBidiArabic("حجز فندقي مؤكد"), 43, 15, { align: "center" });
    doc.setTextColor(250, 244, 235);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(booking.bookingCode, 43, 22, { align: "center" });

    y = 50;

    // Section 1: Guest & Residence Summary Box
    doc.setDrawColor(212, 163, 89);
    doc.setFillColor(252, 250, 247);
    doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, "FD");

    // Right Column: Guest Details
    doc.setTextColor(100, 100, 100);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(8.5);
    doc.text(shapeAndBidiArabic("بيانات النزيل الأساسي"), pageWidth - 20, y + 8, { align: "right" });

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11.5);
    doc.text(shapeAndBidiArabic(booking.guest.fullName), pageWidth - 20, y + 15, { align: "right" });

    doc.setTextColor(80, 80, 80);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(9);
    doc.text(shapeAndBidiArabic(`الهاتف: ${booking.guest.phone}`), pageWidth - 20, y + 21, { align: "right" });
    doc.text(shapeAndBidiArabic(`البريد: ${booking.guest.email || "غير محدد"}`), pageWidth - 20, y + 26, { align: "right" });
    if (booking.guest.isInternational) {
      doc.text(shapeAndBidiArabic("النزيل: زائر دولي (جواز سفر)"), pageWidth - 20, y + 32, { align: "right" });
    }

    // Left Column: Reserved Residence
    const colMidX = pageWidth / 2 - 5;
    doc.setTextColor(100, 100, 100);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(8.5);
    doc.text(shapeAndBidiArabic("تفاصيل الإقامة المحجوزة"), colMidX, y + 8, { align: "right" });

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11.5);
    doc.text(shapeAndBidiArabic(room ? room.title : booking.unitId), colMidX, y + 15, { align: "right" });

    doc.setTextColor(80, 80, 80);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(9);
    doc.text(shapeAndBidiArabic(`الفرع: ${branchName}`), colMidX, y + 21, { align: "right" });
    doc.text(shapeAndBidiArabic(`الموقع: ${branchAddress.slice(0, 42)}`), colMidX, y + 26, { align: "right" });
    doc.text(shapeAndBidiArabic(`نوع الإقامة: ${booking.stayPurpose === "medical" ? "علاجية" : booking.stayPurpose === "wedding" ? "أعراس" : booking.stayPurpose === "family" ? "عائلية" : "سياحية"}`), colMidX, y + 32, { align: "right" });

    y += 46;

    // Section 2: Stay Schedule & Timings Box
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, "FD");

    // Check-in (Right)
    doc.setTextColor(100, 100, 100);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(8);
    doc.text(shapeAndBidiArabic("تاريخ وفترة تسجيل الوصول"), pageWidth - 20, y + 7, { align: "right" });
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10.5);
    doc.text(booking.checkInDate, pageWidth - 20, y + 14, { align: "right" });
    doc.setTextColor(120, 80, 20);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8.5);
    doc.text(shapeAndBidiArabic("١١:٠٠ صباحاً – ١:٠٠ ظهراً"), pageWidth - 20, y + 20, { align: "right" });

    // Check-out (Center)
    doc.setTextColor(100, 100, 100);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(8);
    doc.text(shapeAndBidiArabic("تاريخ وموعد تسجيل المغادرة"), pageWidth / 2 + 10, y + 7, { align: "right" });
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10.5);
    doc.text(booking.checkOutDate, pageWidth / 2 + 10, y + 14, { align: "right" });
    doc.setTextColor(120, 80, 20);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8.5);
    doc.text(shapeAndBidiArabic("١١:٠٠ صباحاً"), pageWidth / 2 + 10, y + 20, { align: "right" });

    // Duration & Guests (Left)
    doc.setTextColor(100, 100, 100);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(8);
    doc.text(shapeAndBidiArabic("مدة الإقامة وعدد النزلاء"), 65, y + 7, { align: "right" });
    doc.setTextColor(20, 20, 20);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(10.5);
    doc.text(shapeAndBidiArabic(`${booking.totalNights} ليال إقامة`), 65, y + 14, { align: "right" });
    doc.setTextColor(80, 80, 80);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8.5);
    doc.text(shapeAndBidiArabic(`${booking.adultsCount} بالغين${booking.kidsCount > 0 ? ` · ${booking.kidsCount} أطفال` : ""}`), 65, y + 20, { align: "right" });

    y += 38;

    // Section 3: Financial & Payment Split Table
    doc.setTextColor(20, 20, 20);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(11);
    doc.text(shapeAndBidiArabic("تفاصيل التكلفة وسند دفع العربون المالي"), pageWidth - 14, y, { align: "right" });

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    const printArabicFareRow = (label: string, amount: string, isBold = false) => {
      doc.setFont("Amiri", isBold ? "bold" : "normal");
      doc.setFontSize(9);
      doc.setTextColor(isBold ? 20 : 60, isBold ? 20 : 60, isBold ? 20 : 60);
      doc.text(shapeAndBidiArabic(label), pageWidth - 20, y, { align: "right" });
      doc.text(amount, 20, y);
      y += 6;
    };

    printArabicFareRow(
      `قيمة الإقامة الأساسية (${booking.totalNights} ليال)`,
      `INR ${booking.pricing.standardBaseRent.toLocaleString("en-IN")}`
    );

    if (booking.pricing.baseRentDiscount > 0) {
      printArabicFareRow(
        `خصم مدة الإقامة (${Math.round(booking.pricing.discountRate * 100)}%)`,
        `- INR ${booking.pricing.baseRentDiscount.toLocaleString("en-IN")}`
      );
    }

    if (booking.pricing.extraGuestsTotal > 0) {
      printArabicFareRow(
        "رسوم النزلاء الإضافيين (بالغون وأطفال)",
        `INR ${booking.pricing.extraGuestsTotal.toLocaleString("en-IN")}`
      );
    }

    if (booking.pricing.addonsTotal > 0) {
      printArabicFareRow(
        `الخدمات الإضافية المختارة`,
        `INR ${booking.pricing.addonsTotal.toLocaleString("en-IN")}`
      );
    }

    y += 1;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, pageWidth - 20, y);
    y += 5;

    printArabicFareRow(
      "إجمالي تكلفة الإقامة الكاملة",
      `INR ${booking.pricing.grossTotal.toLocaleString("en-IN")}`,
      true
    );

    y += 2;

    // Advance Paid Banner Box (Green)
    doc.setFillColor(235, 245, 235);
    doc.setDrawColor(180, 220, 180);
    doc.roundedRect(14, y, pageWidth - 28, 15, 2, 2, "FD");
    doc.setTextColor(20, 110, 35);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(9.5);
    doc.text(shapeAndBidiArabic("عربون مقدم ٢٠٪ مسدد عبر الإنترنت — مؤكد وموثق رسمياً"), pageWidth - 20, y + 6, { align: "right" });
    doc.setFontSize(11);
    doc.text(`INR ${booking.pricing.advancePayable.toLocaleString("en-IN")}`, 20, y + 6);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8);
    doc.text(shapeAndBidiArabic(`مرجع إيصال الدفع: ${booking.gatewayPaymentId || "DIRECT-GATEWAY-TXN"} · الحالة: مؤكد`), pageWidth - 20, y + 11.5, { align: "right" });

    y += 19;

    // Remaining Balance Due on Arrival Box (Gold)
    doc.setFillColor(254, 248, 235);
    doc.setDrawColor(240, 215, 160);
    doc.roundedRect(14, y, pageWidth - 28, 15, 2, 2, "FD");
    doc.setTextColor(150, 95, 20);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(9.5);
    doc.text(shapeAndBidiArabic("المبلغ المتبقي ٨٠٪ يسدد عند الوصول لدى موظف الاستقبال"), pageWidth - 20, y + 6, { align: "right" });
    doc.setFontSize(11);
    doc.text(`INR ${booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")}`, 20, y + 6);
    doc.setFont("Amiri", "normal");
    doc.setFontSize(8);
    doc.text(shapeAndBidiArabic("يُدفع عند تسجيل الوصول نقداً أو عبر UPI لدى مكتب الاستقبال"), pageWidth - 20, y + 11.5, { align: "right" });

    y += 21;

    // Section 4: House Rules, ID Policy & Cancellation (Arabic)
    doc.setTextColor(20, 20, 20);
    doc.setFont("Amiri", "bold");
    doc.setFontSize(9.5);
    doc.text(shapeAndBidiArabic("إرشادات النزلاء الهامة وشروط الإقامة"), pageWidth - 14, y, { align: "right" });
    y += 4;

    doc.setFont("Amiri", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);

    const arabicRules = [
      "١. إثبات الهوية الإلزامي: يُشترط تقديم إثبات هوية رسمي أصلي لكل بالغ (جواز سفر للنزلاء الدوليين).",
      "٢. مواعيد الدخول والمغادرة: تسجيل الوصول القياسي من الساعة ١١:٠٠ صباحاً إلى ١:٠٠ ظهراً، وتسجيل المغادرة الساعة ١١:٠٠ صباحاً.",
      "٣. خدمة النظافة: يتم توفير خدمة تنظيف غرف دورية مجانية يوماً بعد يوم.",
      "٤. سياسة الإلغاء والاسترداد: عربون الحجز (٢٠٪) مسترد بالكامل عند الإلغاء قبل ٤٨ ساعة من موعد الوصول، وغير مسترد خلال ٤٨ ساعة.",
      "٥. إقامة الأطفال: تشمل كل شقة عدداً من الأطفال ضمن السعر الأساسي، ويُحتسب على كل طفل إضافي ٣٠٠ روبية في الليلة.",
    ];

    for (const rule of arabicRules) {
      doc.text(shapeAndBidiArabic(rule), pageWidth - 14, y, { align: "right" });
      y += 4.5;
    }

    y += 4;

    // Footer Contact Info in Arabic
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      shapeAndBidiArabic(`مكتب استقبال ضيافة فلاتيل · الهاتف: ${CONTACT_PHONE} · البريد: ${CONTACT_EMAIL} · حيدر أباد، الهند`),
      pageWidth / 2,
      y,
      { align: "center" }
    );
  } else {
    // Standard English PDF generation
    doc.setTextColor(250, 244, 235);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(BRAND_NAME.toUpperCase(), 14, y);

    doc.setTextColor(184, 166, 146);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(BRAND_TAGLINE, 14, y + 6);

    doc.setFillColor(22, 16, 11);
    doc.roundedRect(pageWidth - 65, 10, 51, 15, 2, 2, "F");
    doc.setTextColor(229, 193, 120);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CONFIRMED BOOKING", pageWidth - 60, 16);
    doc.setTextColor(250, 244, 235);
    doc.setFontSize(12);
    doc.text(booking.bookingCode, pageWidth - 60, 22);

    y = 50;

    doc.setDrawColor(212, 163, 89);
    doc.setFillColor(252, 250, 247);
    doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, "FD");

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
    doc.text(`Email: ${booking.guest.email || "N/A"}`, 20, y + 26);
    if (booking.guest.isInternational) {
      doc.text("Guest Type: International Passport Holder", 20, y + 31);
    }

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

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, "FD");

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
        "Extra Guest Charges (adults & children)",
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
      "5. Children Policy: Each flat includes children up to its base allowance; additional children are INR 300 per child per night. All guests count toward safety occupancy limits.",
    ];

    for (const rule of rules) {
      doc.text(rule, 14, y);
      y += 4.5;
    }

    y += 4;

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
  }

  if (groupNote) {
    const label = isArabic
      ? shapeAndBidiArabic(`حجز مشترك ${groupNote.code} · الشقة ${groupNote.index + 1} من ${groupNote.total}`)
      : `Combined booking ${groupNote.code} - Flat ${groupNote.index + 1} of ${groupNote.total}`;
    doc.setTextColor(229, 193, 120);
    doc.setFont(isArabic ? "Amiri" : "helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label, pageWidth / 2, 8, { align: "center" });
  }
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

    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "en";
    const isArabic = lang === "ar";

    const flats = await loadVoucherFlats(booking);
    if (flats.some((flat) => flat.bookingStatus !== "confirmed" || flat.paymentStatus !== "advance_paid")) {
      return NextResponse.json(
        { success: false, error: "A voucher is available after payment is confirmed." },
        { status: 409 }
      );
    }

    // Initialize A4 PDF document: one page per flat, one file for the whole booking
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const groupCode = flats.length > 1 ? booking.groupCode : undefined;
    flats.forEach((flat, index) => {
      if (index > 0) doc.addPage();
      renderVoucherPage(doc, flat, isArabic, groupCode ? { code: groupCode, index, total: flats.length } : undefined);
    });

    // Generate PDF Buffer
    const pdfOutput = doc.output("arraybuffer");
    const fileCode = groupCode ?? booking.bookingCode;
    const filename = isArabic
      ? `FLATEL-VOUCHER-${fileCode}-AR.pdf`
      : `FLATEL-VOUCHER-${fileCode}.pdf`;

    return new NextResponse(pdfOutput, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
