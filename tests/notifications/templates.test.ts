import assert from "node:assert/strict";
import { bookingConfirmationEmail, escapeHtml, membershipReminderEmail, membershipWelcomeEmail } from "../../lib/notifications/templates";
import { sendEmail } from "../../lib/notifications/email";
import { calculateFlatelPrice } from "../../lib/pricing";
import type { BookingRecord } from "../../types/booking";

console.log("Running Notification Template Tests...");

function booking(overrides: Partial<BookingRecord>): BookingRecord {
  const pricing = calculateFlatelPrice({ nights: 2, basePricePerNight: 2000, baseAdults: 2, selectedAdults: 2 });
  return {
    id: "b1",
    bookingCode: "FLT-AAAA1111",
    unitId: "1bhk",
    guest: { fullName: "Asha <script>alert(1)</script>", email: "asha@example.com", phone: "+91 9000000000" },
    stayPurpose: "accommodation_only",
    checkInDate: "2026-12-01",
    checkOutDate: "2026-12-03",
    totalNights: 2,
    adultsCount: 2,
    kidsCount: 0,
    extraGuestsCount: 0,
    selectedAddons: [],
    pricing,
    paymentOption: "advance_20",
    paymentStatus: "advance_paid",
    bookingStatus: "confirmed",
    balanceCollected: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// 1. User-supplied text can never inject markup into an email
assert.equal(escapeHtml(`<b>"x"&'y'</b>`), "&lt;b&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/b&gt;");

// 2. Single booking email
const flatName = (unitId: string) => unitId.toUpperCase();
const single = bookingConfirmationEmail({ bookings: [booking({})], siteUrl: "https://flatel.test", flatName });
assert.equal(single.to, "asha@example.com");
assert.ok(single.subject.includes("FLT-AAAA1111"));
assert.ok(!single.html.includes("<script>"), "guest name is escaped");
assert.ok(single.html.includes("https://flatel.test/booking-confirmation/FLT-AAAA1111"));

// 3. Group email: one message, group reference, every flat, summed money
const group = [
  booking({ groupCode: "FLT-AAAA1111" }),
  booking({ id: "b2", bookingCode: "FLT-BBBB2222", unitId: "3bhk", groupCode: "FLT-AAAA1111" }),
];
const combined = bookingConfirmationEmail({ bookings: group, siteUrl: "https://flatel.test", flatName });
assert.ok(combined.html.includes("FLT-BBBB2222") && combined.html.includes("1BHK") && combined.html.includes("3BHK"));
assert.ok(combined.html.includes("/booking-confirmation/FLT-AAAA1111"), "links use the group reference");
const totalAdvance = group.reduce((sum, b) => sum + b.pricing.advancePayable, 0);
assert.ok(combined.text.includes(`₹${totalAdvance.toLocaleString("en-IN")}`));

// 4. Member emails carry the ID
const member = { fullName: "Asha", email: "asha@example.com", memberCode: "FL-AB23CD", validUntil: "2027-10-29T10:00:00.000Z", siteUrl: "https://flatel.test" };
assert.ok(membershipWelcomeEmail(member).text.includes("FL-AB23CD"));
assert.ok(membershipReminderEmail(member).html.includes("/membership#join"));

// 5. Without email settings nothing is sent and nothing throws
delete process.env.RESEND_API_KEY;
delete process.env.EMAIL_FROM;
void sendEmail(single).then((result) => {
  assert.deepEqual(result, { sent: false, reason: "not_configured" });
  console.log("Notification tests passed.");
});
