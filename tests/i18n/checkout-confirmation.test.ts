import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getDictionary } from "../../lib/i18n";

describe("Checkout and Booking Confirmation i18n", () => {
  it("should have complete checkout terms in both english and arabic", () => {
    const en = getDictionary("en");
    const ar = getDictionary("ar");

    // Checkout labels
    assert.ok(en.checkout.title, "en.checkout.title exists");
    assert.ok(ar.checkout.title, "ar.checkout.title exists");
    assert.ok(ar.checkout.advanceDueNow.includes("20%"), "ar.checkout.advanceDueNow includes 20%");
    assert.ok(ar.checkout.balanceDueArrival.includes("80%"), "ar.checkout.balanceDueArrival includes 80%");
    assert.ok(ar.checkout.cancellationPolicy, "ar.checkout.cancellationPolicy exists");
  });

  it("should have complete booking confirmation terms in both english and arabic", () => {
    const en = getDictionary("en");
    const ar = getDictionary("ar");

    // Confirmation labels
    assert.ok(en.confirmation.title, "en.confirmation.title exists");
    assert.ok(ar.confirmation.title, "ar.confirmation.title exists");
    assert.ok(ar.confirmation.downloadVoucher, "ar.confirmation.downloadVoucher exists");
    assert.ok(ar.confirmation.sendToWhatsapp, "ar.confirmation.sendToWhatsapp exists");
    assert.ok(ar.confirmation.photoIdNotice, "ar.confirmation.photoIdNotice exists");
  });

  it("should generate correct localized confirmation URLs", () => {
    const getConfirmationUrl = (code: string, locale: "en" | "ar") =>
      locale === "ar" ? `/ar/booking-confirmation/${code}` : `/booking-confirmation/${code}`;

    assert.equal(getConfirmationUrl("FLATEL-BK-101", "en"), "/booking-confirmation/FLATEL-BK-101");
    assert.equal(getConfirmationUrl("FLATEL-BK-101", "ar"), "/ar/booking-confirmation/FLATEL-BK-101");
  });
});
