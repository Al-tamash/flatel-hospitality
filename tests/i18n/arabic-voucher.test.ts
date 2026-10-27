import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { reshapeArabic, shapeAndBidiArabic } from "../../lib/i18n/arabic-reshaper";

describe("Arabic PDF Voucher Generation", () => {
  it("should verify Amiri TTF font files exist and are readable", () => {
    const regularPath = path.join(process.cwd(), "lib/i18n/fonts/Amiri-Regular.ttf");
    const boldPath = path.join(process.cwd(), "lib/i18n/fonts/Amiri-Bold.ttf");

    assert.ok(fs.existsSync(regularPath), "Amiri-Regular.ttf exists");
    assert.ok(fs.existsSync(boldPath), "Amiri-Bold.ttf exists");
    assert.ok(fs.statSync(regularPath).size > 100_000, "Amiri-Regular has valid size");
  });

  it("should correctly reshape Arabic characters into cursive forms", () => {
    const original = "فلاتيل";
    const reshaped = reshapeArabic(original);

    // Initial Feh (0xFED3), Medial Lam (0xFEE0), Alef (0xFE8E), Isolated/Initial Teh (0xFE97), Medial Yeh (0xFEF4), Final Lam (0xFEDE)
    assert.notEqual(reshaped, original, "Reshaped string differs from raw unicode");
    assert.ok(reshaped.charCodeAt(0) >= 0xfe80, "Glyphs are in Presentation Forms-B");
  });

  it("should correctly process Lam-Alef ligature", () => {
    const text = "سلالة";
    const reshaped = reshapeArabic(text);
    // Contains Lam-Alef ligature
    const hasLigature = Array.from(reshaped).some(
      (c) => c.charCodeAt(0) >= 0xfef5 && c.charCodeAt(0) <= 0xfefc
    );
    assert.ok(hasLigature, "Lam-Alef ligature was formed");
  });

  it("should successfully generate a PDF document with embedded Arabic font", () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const fontBase64 = fs.readFileSync(path.join(process.cwd(), "lib/i18n/fonts/Amiri-Regular.ttf")).toString("base64");
    doc.addFileToVFS("Amiri-Regular.ttf", fontBase64);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri", "normal");

    const arabicText = shapeAndBidiArabic("قسيمة حجز مؤكد - ضيافة فلاتيل حيدر أباد");
    doc.text(arabicText, 100, 30, { align: "right" });

    const output = doc.output("arraybuffer");
    assert.ok(output.byteLength > 1000, "Generated PDF has non-trivial byte length");

    const header = Buffer.from(output.slice(0, 5)).toString("ascii");
    assert.equal(header, "%PDF-", "Generated file has valid PDF magic header");
  });
});
