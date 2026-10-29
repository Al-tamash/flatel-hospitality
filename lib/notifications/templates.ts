import type { EmailMessage } from "@/lib/notifications/email";
import { MEMBERSHIP } from "@/lib/membership/membership-content";
import type { BookingRecord } from "@/types/booking";

const GOLD = "#C69344";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0E0A07;font-family:Arial,Helvetica,sans-serif;color:#FAF4EB">
<div style="max-width:560px;margin:0 auto;padding:28px 20px">
<p style="letter-spacing:.2em;font-size:12px;color:${GOLD};margin:0 0 6px">FLATEL HOSPITALITY</p>
<h1 style="font-size:22px;margin:0 0 18px;font-weight:600">${escapeHtml(title)}</h1>
${bodyHtml}
<p style="font-size:12px;color:#B8A692;margin-top:28px">The comfort of a flat. The service of a hotel. · Hyderabad</p>
</div></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:22px 0"><a href="${escapeHtml(href)}" style="background:${GOLD};color:#140E08;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block">${escapeHtml(label)}</a></p>`;
}

interface MemberEmailInput {
  fullName: string;
  email: string;
  memberCode: string;
  validUntil: string;
  siteUrl: string;
}

export function membershipWelcomeEmail(input: MemberEmailInput): EmailMessage {
  const until = formatDate(input.validUntil);
  const html = layout(
    `Welcome, ${input.fullName}`,
    `<p style="line-height:1.6;color:#D4C4B3">Your Flatel Membership is active until <strong>${escapeHtml(until)}</strong>.
Use this Member ID at checkout, with the same email or mobile number, to get ${MEMBERSHIP.stayDiscountPercent}% off your stay.</p>
<p style="font-size:28px;letter-spacing:.14em;font-family:monospace;color:${GOLD};margin:18px 0"><strong>${escapeHtml(input.memberCode)}</strong></p>
${button(`${input.siteUrl}/properties`, "Browse flats")}
<p style="font-size:13px;color:#B8A692">The ${inr(MEMBERSHIP.price)} membership fee is non-refundable once a Member ID is issued.</p>`
  );
  const text = `Welcome to Flatel Membership, ${input.fullName}.\n\nYour Member ID: ${input.memberCode}\nValid until: ${until}\n\nEnter it at checkout with the same email or mobile number to get ${MEMBERSHIP.stayDiscountPercent}% off your stay.\n${input.siteUrl}/properties`;
  return { to: input.email, subject: `Welcome to Flatel Membership — your Member ID ${input.memberCode}`, html, text };
}

export function membershipReminderEmail(input: MemberEmailInput): EmailMessage {
  const until = formatDate(input.validUntil);
  const html = layout(
    "Your membership ends soon",
    `<p style="line-height:1.6;color:#D4C4B3">Hi ${escapeHtml(input.fullName)}, your Flatel Membership (${escapeHtml(input.memberCode)}) ends on <strong>${escapeHtml(until)}</strong>.
Book before then to use your member rate, or join again to keep it going.</p>
${button(`${input.siteUrl}/membership#join`, "Renew membership")}`
  );
  const text = `Hi ${input.fullName}, your Flatel Membership (${input.memberCode}) ends on ${until}. Book before then to use your member rate, or renew: ${input.siteUrl}/membership#join`;
  return { to: input.email, subject: "Your Flatel Membership ends soon", html, text };
}

/** One email for a booking, or for a whole multi-flat group. */
export function bookingConfirmationEmail(input: {
  bookings: BookingRecord[];
  siteUrl: string;
  flatName: (unitId: string) => string;
}): EmailMessage {
  const [first] = input.bookings;
  const reference = first.groupCode ?? first.bookingCode;
  const sum = (pick: (b: BookingRecord) => number) => input.bookings.reduce((total, b) => total + pick(b), 0);
  const advance = sum((b) => b.pricing.advancePayable);
  const balance = sum((b) => b.pricing.balanceDueOnArrival);
  const total = sum((b) => b.pricing.grossTotal);

  const rows = input.bookings
    .map(
      (b) =>
        `<tr><td style="padding:6px 0;color:#FAF4EB">${escapeHtml(input.flatName(b.unitId))}<br><span style="font-size:12px;color:#B8A692">${b.adultsCount} adults${b.kidsCount > 0 ? `, ${b.kidsCount} children` : ""} · ${escapeHtml(b.bookingCode)}</span></td><td style="padding:6px 0;text-align:right;color:#FAF4EB">${inr(b.pricing.grossTotal)}</td></tr>`
    )
    .join("");

  const html = layout(
    `Booking confirmed, ${first.guest.fullName}`,
    `<p style="line-height:1.6;color:#D4C4B3">Your stay is confirmed: <strong>${escapeHtml(first.checkInDate)}</strong> to <strong>${escapeHtml(first.checkOutDate)}</strong> (${first.totalNights} ${first.totalNights === 1 ? "night" : "nights"}).</p>
<p style="color:#B8A692;font-size:13px;margin:14px 0 4px">Booking reference</p>
<p style="font-size:22px;letter-spacing:.1em;font-family:monospace;color:${GOLD};margin:0 0 12px"><strong>${escapeHtml(reference)}</strong></p>
<table style="width:100%;border-collapse:collapse;border-top:1px solid #3a2c1d;border-bottom:1px solid #3a2c1d">${rows}</table>
<p style="color:#D4C4B3;line-height:1.7;font-size:14px">Total stay ${inr(total)}<br>Advance paid ${inr(advance)}<br>Balance due on arrival ${inr(balance)}</p>
${button(`${input.siteUrl}/booking-confirmation/${reference}`, "View booking & download voucher")}
<p style="font-size:13px;color:#B8A692">Please carry a valid photo ID at check-in.</p>`
  );
  const text = `Booking confirmed, ${first.guest.fullName}.\nReference: ${reference}\n${first.checkInDate} to ${first.checkOutDate}\nTotal ${inr(total)}, advance paid ${inr(advance)}, balance on arrival ${inr(balance)}.\nVoucher: ${input.siteUrl}/booking-confirmation/${reference}`;
  return { to: first.guest.email, subject: `Booking confirmed — ${reference}`, html, text };
}
