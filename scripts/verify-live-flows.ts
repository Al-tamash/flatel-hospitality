/**
 * Live end-to-end check of the membership, single-booking and multi-flat flows against the
 * configured Supabase project, Razorpay TEST keys and Resend.
 *
 *   npx tsx --env-file=.env.local scripts/verify-live-flows.ts --yes
 *
 * It runs the real route handlers in-process and signs payment callbacks with your Razorpay test
 * secret, so no card is needed. Everything it creates uses the guest email delivered@resend.dev
 * (Resend's test inbox) and is deleted again at the end. Never point it at production keys.
 */
import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "delivered@resend.dev";
const TEST_PHONE = "+91 98765 43210";

if (!process.argv.includes("--yes")) {
  console.log("This writes test rows to the configured database and deletes them afterwards. Re-run with --yes.");
  process.exit(1);
}
if (!(process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_")) {
  console.log("Refusing to run: RAZORPAY_KEY_ID is not a rzp_test_ key.");
  process.exit(1);
}

// Fixed secrets for the in-process webhook and cron checks only
process.env.RAZORPAY_WEBHOOK_SECRET = "verify-script-webhook-secret";
process.env.CRON_SECRET = "verify-script-cron-secret-0123456789abcdef";
const usedFallbackSender = !process.env.EMAIL_FROM;
process.env.EMAIL_FROM ||= "Flatel Verify <onboarding@resend.dev>";

// Record every email the app tries to send, and what Resend answered
const emailLog: Array<{ subject: string; to: string; status: number }> = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await realFetch(input, init);
  if (String(input).startsWith("https://api.resend.com/emails") && init?.body) {
    const body = JSON.parse(String(init.body));
    emailLog.push({ subject: body.subject, to: body.to?.[0], status: response.status });
  }
  return response;
}) as typeof fetch;

const results: Array<{ ok: boolean; name: string; detail?: string }> = [];
function check(name: string, ok: boolean, detail?: string) {
  results.push({ ok, name, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `\n      ${detail}` : ""}`);
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

async function cleanup() {
  const { data: bookings } = await admin.from("bookings").select("id").eq("guest_email", TEST_EMAIL);
  const ids = (bookings ?? []).map((row) => row.id as string);
  if (ids.length > 0) {
    await admin.from("payment_transactions").delete().in("booking_id", ids);
    await admin.from("bookings").delete().in("id", ids);
  }
  await admin.from("memberships").delete().like("email", "delivered%@resend.dev");
}

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function call(handler: (req: NextRequest, ctx?: any) => Promise<Response>, req: NextRequest, ctx?: unknown) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const res = await handler(req, ctx);
  const type = res.headers.get("content-type") || "";
  if (type.includes("application/json")) return { status: res.status, json: (await res.json()) as Json, bytes: null as Buffer | null };
  return { status: res.status, json: {} as Json, bytes: Buffer.from(await res.arrayBuffer()) };
}

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
const get = (path: string, headers: Record<string, string> = {}) => new NextRequest(`http://localhost${path}`, { headers });

const sign = (orderId: string, paymentId: string) =>
  crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${paymentId}`).digest("hex");

function webhookRequest(event: string, entity: Record<string, unknown>) {
  const raw = JSON.stringify({ event, payload: { payment: { entity } } });
  const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex");
  return new NextRequest("http://localhost/api/webhooks/razorpay", {
    method: "POST",
    headers: { "x-razorpay-signature": signature, "content-type": "application/json" },
    body: raw,
  });
}

async function main() {
  const membershipCreate = (await import("../app/api/membership/create/route")).POST;
  const membershipVerifyPayment = (await import("../app/api/membership/verify-payment/route")).POST;
  const membershipVerify = (await import("../app/api/membership/verify/route")).POST;
  const bookingCreate = (await import("../app/api/bookings/create/route")).POST;
  const groupCreate = (await import("../app/api/bookings/create-group/route")).POST;
  const bookingVerify = (await import("../app/api/bookings/verify-payment/route")).POST;
  const bookingGet = (await import("../app/api/bookings/[id]/route")).GET;
  const voucherGet = (await import("../app/api/bookings/[id]/voucher/route")).GET;
  const webhook = (await import("../app/api/webhooks/razorpay/route")).POST;
  const adminMembers = await import("../app/api/admin/members/route");
  const cron = (await import("../app/api/cron/membership-expiry/route")).GET;
  const { calculateFlatelPrice } = await import("../lib/pricing");
  const { InventoryService } = await import("../lib/inventory-service");

  const adminHeaders = { "x-admin-key": process.env.ADMIN_SECRET_KEY || "" };
  console.log(`Email sender: ${usedFallbackSender ? "EMAIL_FROM is not set; using Resend's onboarding sender for this run" : "your EMAIL_FROM"}\n`);

  await cleanup();

  // ---------------------------------------------------------------- membership purchase
  console.log("== Membership purchase");
  const created = await call(membershipCreate, post("/api/membership/create", { fullName: "Verify Member", email: TEST_EMAIL, phone: TEST_PHONE, tier: "golden" }));
  check("Golden order is for ₹4,999", created.json.amount === 4999, JSON.stringify(created.json));
  const noTier = await call(membershipCreate, post("/api/membership/create", { fullName: "No Tier", email: "delivered+notier@resend.dev", phone: TEST_PHONE }));
  check("membership without a card choice is refused", noTier.status === 400 && !noTier.json.success);
  check("membership order created", created.status === 200 && created.json.success && String(created.json.orderId).startsWith("order_"), JSON.stringify(created.json));
  const membershipId: string = created.json.membershipId;
  const orderId: string = created.json.orderId;

  const badSig = await call(membershipVerifyPayment, post("/api/membership/verify-payment", { membershipId, orderId, paymentId: "pay_verify_1", signature: "0".repeat(64) }));
  check("forged payment signature is rejected", badSig.status === 400 && !badSig.json.success);
  const stillPending = await admin.from("memberships").select("status").eq("id", membershipId).single();
  check("membership stays pending after a forged signature", stillPending.data?.status === "pending");

  const paid = await call(membershipVerifyPayment, post("/api/membership/verify-payment", { membershipId, orderId, paymentId: "pay_verify_1", signature: sign(orderId, "pay_verify_1") }));
  const memberCode: string = paid.json.memberCode;
  check("valid signature activates the membership and issues a Member ID", paid.json.success && /^FL-[A-Z0-9]{6}$/.test(memberCode ?? ""), JSON.stringify(paid.json));

  const again = await call(membershipVerifyPayment, post("/api/membership/verify-payment", { membershipId, orderId, paymentId: "pay_verify_1", signature: sign(orderId, "pay_verify_1") }));
  check("repeating the callback is safe (same Member ID)", again.json.memberCode === memberCode);

  const duplicate = await call(membershipCreate, post("/api/membership/create", { fullName: "Verify Member", email: TEST_EMAIL, phone: TEST_PHONE, tier: "platinum" }));
  check("a second purchase while active is refused", duplicate.status === 400 && /already/i.test(String(duplicate.json.error)));

  const goodLookup = await call(membershipVerify, post("/api/membership/verify", { code: memberCode, email: TEST_EMAIL }));
  check("Member ID verifies for the right email", goodLookup.status === 200 && goodLookup.json.success);
  const wrongLookup = await call(membershipVerify, post("/api/membership/verify", { code: memberCode, email: "someone.else@example.com", phone: "+91 90000 00000" }));
  check("Member ID is rejected for someone else's contact details", wrongLookup.status === 404);

  // ---------------------------------------------------------------- single booking with member rate and extra child
  console.log("\n== Single booking (member rate + extra child)");
  const unit = await InventoryService.getAuthoritativeUnitBySlug("1bhk");
  const singleBody = {
    unitId: "1bhk",
    checkInDate: "2027-03-10",
    checkOutDate: "2027-03-12",
    adultsCount: 2,
    kidsCount: 2,
    stayPurpose: "accommodation_only",
    memberCode,
    guest: { fullName: "Verify Guest", email: TEST_EMAIL, phone: TEST_PHONE },
  };
  const single = await call(bookingCreate, post("/api/bookings/create", singleBody));
  check("booking created with a Razorpay order", single.status === 200 && single.json.success, JSON.stringify(single.json));
  const expected = calculateFlatelPrice({
    nights: 2,
    basePricePerNight: unit.basePricePerNight,
    baseAdults: unit.baseAdults,
    selectedAdults: 2,
    selectedKids: 2,
    extraPersonFee: unit.extraPersonFeePerNight,
    memberDiscountRate: 0.1,
  });
  check("price = member rate (10%) + one extra child at ₹300/night", single.json.pricing?.grossTotal === expected.grossTotal && single.json.pricing?.discountSource === "member", `got ${single.json.pricing?.grossTotal}, expected ${expected.grossTotal}`);
  const bookingRow = await admin.from("bookings").select("membership_id, member_discount_amount, extra_guests_total, gross_total").eq("booking_code", single.json.bookingCode).single();
  check("booking row records the member and the saving", bookingRow.data?.membership_id === membershipId && bookingRow.data?.member_discount_amount > 0, JSON.stringify(bookingRow));
  check("extra child fee is stored in the extra guest charges", bookingRow.data?.extra_guests_total === 600, `extra_guests_total=${bookingRow.data?.extra_guests_total}`);

  const wrongMember = await call(bookingCreate, post("/api/bookings/create", { ...singleBody, checkInDate: "2027-03-20", checkOutDate: "2027-03-22", guest: { fullName: "Other", email: "other@example.com", phone: "+91 90000 00000" } }));
  check("member rate is refused when the Member ID doesn't match the guest", wrongMember.status === 400 && /Member ID/i.test(String(wrongMember.json.error)));

  const singlePay = await call(bookingVerify, post("/api/bookings/verify-payment", { bookingId: single.json.bookingId, orderId: single.json.orderId, paymentId: "pay_verify_2", signature: sign(single.json.orderId, "pay_verify_2") }));
  check("single booking confirmed after a signed payment", singlePay.json.success && singlePay.json.bookingStatus === "confirmed", JSON.stringify(singlePay.json));
  const singleGet = await call(bookingGet, get(`/api/bookings/${single.json.bookingCode}`), { params: Promise.resolve({ id: single.json.bookingCode }) });
  check("confirmation API returns the confirmed booking", singleGet.status === 200 && singleGet.json.success);
  const singleVoucher = await call(voucherGet, get(`/api/bookings/${single.json.bookingCode}/voucher`), { params: Promise.resolve({ id: single.json.bookingCode }) });
  check("voucher PDF is generated", singleVoucher.status === 200 && singleVoucher.bytes?.subarray(0, 4).toString() === "%PDF");

  // ---------------------------------------------------------------- multi-flat booking
  console.log("\n== Multi-flat booking");
  const groupBody = (checkIn: string, checkOut: string) => ({
    cart: "1bhk.2.0,2bhk.4.0",
    checkInDate: checkIn,
    checkOutDate: checkOut,
    stayPurpose: "accommodation_only",
    guest: { fullName: "Verify Group", email: TEST_EMAIL, phone: TEST_PHONE },
  });
  const group = await call(groupCreate, post("/api/bookings/create-group", groupBody("2027-04-10", "2027-04-12")));
  check("two flats held with one combined Razorpay order", group.status === 200 && group.json.success && group.json.bookings?.length === 2, JSON.stringify(group.json));
  const groupCode: string = group.json.groupCode;
  const groupRows = await admin.from("bookings").select("booking_code, group_code, payment_status").eq("group_code", groupCode);
  check("both flats share the group code (first flat's code)", (groupRows.data?.length ?? 0) === 2 && groupCode === group.json.bookings?.[0]?.bookingCode);
  const sumAdvance = (group.json.bookings as Json[]).reduce((sum, b) => sum + b.pricing.advancePayable, 0);
  check("the order amount equals the sum of both advances", group.json.advancePayable === sumAdvance);

  const clash = await call(groupCreate, post("/api/bookings/create-group", groupBody("2027-04-10", "2027-04-12")));
  check("the same flats are refused for the same dates", clash.status === 400 && /Nothing was charged/i.test(String(clash.json.error)), JSON.stringify(clash.json));
  const leftover = await admin.from("bookings").select("booking_code, payment_status, booking_status").eq("guest_email", TEST_EMAIL).eq("check_in_date", "2027-04-10").is("group_code", null);
  check("a failed combined attempt leaves nothing held", (leftover.data ?? []).every((row) => row.booking_status === "cancelled"), JSON.stringify(leftover.data));

  const mixed = await call(groupCreate, post("/api/bookings/create-group", { ...groupBody("2027-05-10", "2027-05-12"), cart: "1bhk.2.0,3bhk.4.0" }));
  check("flats at different branches are refused", mixed.status === 400 && /same branch/i.test(String(mixed.json.error)), JSON.stringify(mixed.json));

  const groupPay = await call(bookingVerify, post("/api/bookings/verify-payment", { groupCode, orderId: group.json.orderId, paymentId: "pay_verify_3", signature: sign(group.json.orderId, "pay_verify_3") }));
  check("one signed payment confirms every flat", groupPay.json.success && groupPay.json.flats === 2, JSON.stringify(groupPay.json));
  const paidRows = await admin.from("bookings").select("payment_status, booking_status").eq("group_code", groupCode);
  check("all flats are confirmed in the database", (paidRows.data ?? []).length === 2 && (paidRows.data ?? []).every((r) => r.payment_status === "advance_paid" && r.booking_status === "confirmed"));
  const groupGet = await call(bookingGet, get(`/api/bookings/${groupCode}`), { params: Promise.resolve({ id: groupCode }) });
  check("confirmation API returns the whole group", groupGet.json.group?.length === 2);
  const groupVoucher = await call(voucherGet, get(`/api/bookings/${groupCode}/voucher`), { params: Promise.resolve({ id: groupCode }) });
  const pageCount = groupVoucher.bytes ? (groupVoucher.bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length : 0;
  check("one voucher PDF with a page per flat", groupVoucher.status === 200 && pageCount === 2, `pages=${pageCount}`);

  // group confirmed through the Razorpay webhook instead of the browser
  const webhookGroup = await call(groupCreate, post("/api/bookings/create-group", groupBody("2027-06-10", "2027-06-12")));
  const hook = await call(webhook, webhookRequest("payment.captured", { id: "pay_verify_4", order_id: webhookGroup.json.orderId, amount: webhookGroup.json.advancePayable * 100, notes: { groupCode: webhookGroup.json.groupCode } }));
  check("Razorpay webhook confirms a combined booking", hook.json.received === true && hook.json.flats === 2, JSON.stringify(hook.json));

  // membership confirmed through the webhook too
  const hookMember = await call(membershipCreate, post("/api/membership/create", { fullName: "Webhook Member", email: "delivered+webhook@resend.dev", phone: TEST_PHONE, tier: "platinum" }));
  check("Platinum order is for ₹7,777", hookMember.json.amount === 7777, JSON.stringify(hookMember.json));
  const hookMemberPay = await call(webhook, webhookRequest("payment.captured", { id: "pay_verify_5", order_id: hookMember.json.orderId, amount: 777700, notes: { membershipId: hookMember.json.membershipId } }));
  check("Razorpay webhook activates a membership", hookMemberPay.json.received === true && hookMemberPay.json.membershipStatus === "active", JSON.stringify(hookMemberPay.json));
  const badAmount = await call(membershipCreate, post("/api/membership/create", { fullName: "Amount Member", email: "delivered+amount@resend.dev", phone: TEST_PHONE, tier: "golden" }));
  const badAmountPay = await call(webhook, webhookRequest("payment.captured", { id: "pay_verify_6", order_id: badAmount.json.orderId, amount: 100, notes: { membershipId: badAmount.json.membershipId } }));
  check("webhook rejects a membership payment of the wrong amount", badAmountPay.status >= 400, JSON.stringify(badAmountPay.json));
  const unsigned = await call(webhook, new NextRequest("http://localhost/api/webhooks/razorpay", { method: "POST", headers: { "x-razorpay-signature": "0".repeat(64) }, body: "{}" }));
  check("webhook with a bad signature is refused", unsigned.status === 401);

  // ---------------------------------------------------------------- admin and cron
  console.log("\n== Admin members and expiry job");
  const noAuth = await call(adminMembers.GET, get("/api/admin/members"));
  check("admin members list requires login", noAuth.status === 401);
  const list = await call(adminMembers.GET, get("/api/admin/members?query=verify", adminHeaders));
  check("admin lists the test member", list.json.success && (list.json.members as Json[]).some((m) => m.memberCode === memberCode), JSON.stringify(list.json).slice(0, 200));
  const resend = await call(adminMembers.PATCH, new NextRequest("http://localhost/api/admin/members", { method: "PATCH", headers: { ...adminHeaders, "content-type": "application/json" }, body: JSON.stringify({ id: membershipId, action: "resend" }) }));
  check("admin can email the Member ID again", resend.json.success === true, JSON.stringify(resend.json));

  const cronNoAuth = await call(cron, get("/api/cron/membership-expiry"));
  check("expiry job requires its secret", cronNoAuth.status === 401);
  await admin.from("memberships").update({ valid_until: new Date(Date.now() + 5 * 86_400_000).toISOString() }).eq("id", membershipId);
  const cronRun = await call(cron, get("/api/cron/membership-expiry", { authorization: `Bearer ${process.env.CRON_SECRET}` }));
  check("expiry job emails a member whose year ends within 14 days", cronRun.json.success && cronRun.json.reminded >= 1, JSON.stringify(cronRun.json));
  const reminded = await admin.from("memberships").select("reminder_sent_at").eq("id", membershipId).single();
  check("the reminder is recorded so it is not sent twice", Boolean(reminded.data?.reminder_sent_at));
  await admin.from("memberships").update({ valid_until: new Date(Date.now() - 86_400_000).toISOString() }).eq("id", membershipId);
  const cronExpire = await call(cron, get("/api/cron/membership-expiry", { authorization: `Bearer ${process.env.CRON_SECRET}` }));
  check("expiry job marks a lapsed membership as expired", cronExpire.json.success && cronExpire.json.expired >= 1, JSON.stringify(cronExpire.json));
  const lapsed = await call(membershipVerify, post("/api/membership/verify", { code: memberCode, email: TEST_EMAIL }));
  check("an expired Member ID no longer gets the rate", lapsed.status === 404);

  // ---------------------------------------------------------------- email
  console.log("\n== Email (Resend)");
  console.log(emailLog.map((entry) => `   ${entry.status}  ${entry.subject}  -> ${entry.to}`).join("\n") || "   (no email requests made)");
  check("emails were accepted by Resend", emailLog.length >= 3 && emailLog.every((entry) => entry.status === 200 || entry.status === 201), `${emailLog.length} requests`);
  const subjects = emailLog.map((entry) => entry.subject).join(" | ");
  check("member welcome, booking confirmation and reminder emails were all sent", /Welcome to Flatel Membership/.test(subjects) && /Booking confirmed/.test(subjects) && /ends soon/.test(subjects), subjects);
}

main()
  .catch((error) => {
    console.error("\nUnexpected error:", error);
    check("script completed without an unexpected error", false, String(error));
  })
  .finally(async () => {
    await cleanup().catch(() => undefined);
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed. Test rows removed.`);
    process.exit(failed.length > 0 ? 1 : 0);
  });
