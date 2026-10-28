import assert from "node:assert/strict";
import { buildWhatsAppGreeting, floatingSide, shouldShowFloatingContact } from "../../lib/floating-contact";

console.log("Running Floating Contact Tests...");

// 1. Shown on guest pages, hidden on admin and checkout
for (const p of ["/", "/ar", "/properties/2bhk", "/ar/stays/medical", "/about"]) {
  assert.equal(shouldShowFloatingContact(p), true, p);
}
for (const p of ["/admin", "/admin/bookings", "/checkout", "/ar/checkout"]) {
  assert.equal(shouldShowFloatingContact(p), false, p);
}

// 2. Side mirrors in Arabic (Review Focus 1)
assert.equal(floatingSide("en"), "right");
assert.equal(floatingSide("ar"), "left");

// 3. Greeting names the flat when known
assert.match(buildWhatsAppGreeting({ locale: "en", flatTitle: "2 BHK Premium" }), /2 BHK Premium/);
assert.ok(buildWhatsAppGreeting({ locale: "en" }).length > 0);
assert.match(buildWhatsAppGreeting({ locale: "ar" }), /[\u0600-\u06FF]/);

console.log("Floating contact tests passed");
