# Handover: Membership (₹777), admin photo upload, flat selector

**Date**: 2026-10-29 · **Branch**: `feat/bilingual-en-ar-website`

## What shipped
- **Admin photo upload (Cloudflare R2)** — `POST /api/admin/upload` (admin-only; JPG/PNG/WebP checked by file signature; max 4 MB each, 12 per call). Admin → Inventory → Gallery Photos and *New residence* now have drag-and-drop upload, cover photo, reorder, remove and "paste a link". Big photos are shrunk in the browser first (Vercel's body limit is ~4.5 MB). Verified against the real bucket: upload returns a public URL that loads.
- **Inventory edits are validated** — `PATCH /api/admin/inventory` now rejects bad prices, capacities, categories and photo hosts (create already did).
- **Custom R2 domain** — if `NEXT_PUBLIC_R2_PUBLIC_URL` is a custom domain (not `*.r2.dev`) it is allowed automatically in `next.config.ts` and in the photo validation.
- **Flat selector** (`components/hero/flat-occupancy-modal.tsx`) — brand/logo block removed, Reset and Close share the title row, Extra Adults / Extra Children sit in one row, hint "Tap + on more than one flat type", "Only 1 available" wording.
- **Flatel Membership** — `/membership` and `/ar/membership`: animated gold member card, 7 benefits, savings calculator, how-it-works, FAQ, WhatsApp join button. Homepage strip (EN + AR), "Membership" in the desktop and mobile nav. Header spacing tightened at 1024px so the extra link fits.

## UPDATE 2026-10-30 — membership is now "Flatel O Signature Membership" (Golden + Platinum)
The client replaced the single ₹777 card with two cards. **This supersedes the proposed-benefits table and the ₹777 notes below.**

| | Golden Card | Platinum Card |
|---|---|---|
| Price (struck-through list price) | **₹4,999** (₹11,999) | **₹7,777** (₹54,999) |
| Stay discount, all direct bookings | 10% | 15% |
| Airport transfer | Pickup only, 5-seater, 4×/year (once per quarter) | Pickup and drop, 7-seater, 4×/year (once per quarter) |
| Check-in | Priority and early check-in, subject to availability | Guaranteed check-in, 4×/year (once per quarter) |
| Welcome kit (Osmania biscuits etc.) | Yes | Yes |
| Dedicated priority support | Yes | Yes |

- **One file holds the numbers and copy**: `lib/membership/membership-content.ts` (`MEMBERSHIP_TIERS`, EN + AR). The page, cards, emails and the booking price all read from it.
- **Server decides the price and rate**: `POST /api/membership/create` takes `tier` (`golden` | `platinum`); the browser never sends a price. Checkout applies 10% or 15% from the member's stored tier (still not stacked with long-stay discounts: the higher wins).
- **Setup required**: run `supabase/migrations/20261031_membership_tiers.sql` after `20261029_memberships.sql` (`rollback_membership_tiers.sql` reverts). It adds `memberships.tier`; any existing ₹777 rows become `golden` (same 10%). Until it runs, joining shows "not open yet" with the WhatsApp fallback.
- **Removed** (not in the client's list): free night after 10 stays, 10% add-on discount, referral credit, free date change, 2-hour early check-in/late check-out, and the savings calculator (at ₹4,999+ it never pays back on room rate alone, so it would have shown a loss).
- **Applied by staff, not the website**: airport pickup/drop, priority/guaranteed check-in, welcome kit and priority support. Guests are told to WhatsApp their Member ID. Only the discount is automatic. Nobody is tracking the "4 times a year, once per quarter" limit yet.
- **Assumed, please confirm with the client**: 12-month validity (they did not say; "4 times annually" implies a year), and that "Complimentary Only Airport Pickup" means pickup only. Arabic copy needs a native read-through.
- **Not verified end to end**: no real payment was run (tables not migrated here). Unit tests (`npx tsx tests/membership/membership.test.ts`, `tests/notifications/templates.test.ts`), `tsc` and ESLint pass; `scripts/verify-live-flows.ts` was updated for tiers but not run.

## (Superseded) Client must confirm — membership benefits are PROPOSED
All numbers live in `lib/membership/membership-content.ts` (one place; page, card, strip and calculator read from it). Set `CONFIRMED_BY_CLIENT` to `true` after sign-off.

| Benefit | Proposed | Notes |
|---|---|---|
| Fee / validity | ₹777 one-time, 12 months | |
| Stay discount | 10% on nightly rate, direct bookings | pays back in ~4 nights |
| Free night | after 10 paid nights | |
| Early check-in / late check-out | up to 2 h, subject to availability | |
| Priority concierge | member WhatsApp line | needs a staff process |
| Free date change | once per booking | |
| Add-on discount | 10% | |
| Refer & earn | ₹500 stay credit | |

Arabic copy needs a native read-through.

## Membership purchase and member rate (built, needs one setup step)
- **Join online** — `/membership#join` (EN + AR): name, email, mobile, consent → Razorpay ₹777 → the member's own card with their **Member ID** (`FL-XXXXXX`), copy button, ID remembered on the device.
- **APIs** — `POST /api/membership/create`, `/verify-payment` (signature checked), `/verify` (checkout preview; answers are uniform so IDs cannot be discovered). The Razorpay webhook also activates memberships (`notes.membershipId`), so a closed browser tab still issues the ID.
- **Checkout** — optional "Flatel Member ID" field. The rate applies only if the ID matches the booking's email or mobile and is valid on the check-in date; the server re-checks and recomputes the price, the browser never decides it. Member rate and long-stay discount (10% / 15% / 25%) **do not stack** — the guest gets the higher one. The booking records `membership_id` and `member_discount_amount`.
- **Setup required before it works**: run `supabase/migrations/20261029_memberships.sql` in the Supabase SQL editor (preview project first; `rollback_memberships.sql` reverts it). Until then the join form shows "not open yet" with a WhatsApp button and checkout rejects Member IDs; normal bookings are unaffected.
- **Webhook**: in the Razorpay dashboard the existing webhook must include `payment.captured` (and/or `order.paid`) and `payment.failed`; nothing new to add if already set.
- **Not verified end to end**: the happy path (real test payment → ID issued → member rate at checkout) could not be run because the table does not exist yet. Pricing, ID helpers and the savings maths are unit-tested (`npx tsx tests/membership/membership.test.ts`, `tests/r2/upload.test.ts`).
- **Admin** — `/admin/members` (new nav item): search, status filter, "Resend ID" email, "Cancel". A daily job (`/api/cron/membership-expiry`, scheduled in `vercel.json`) marks lapsed memberships expired and emails members 14 days before their year ends.
- **Not built**: add-on discount, free night, early check-in and free date change are promised on the page but applied by staff (manual) until the client confirms the rules.

## Multi-flat booking (built, needs one setup step)
- **Selector** — reads live inventory (`/api/inventory`), so admin price, unit and capacity changes show immediately; it never falls back to sample data (loading and "Try again" states). Max 4 flats; every flat keeps at least one adult; guests are split across units of the same type.
- **Search results** — choosing 2+ flats shows a "Book N flats together" panel with an estimated total and a button to the combined checkout. The cart travels in the URL (`?cart=1bhk.2.0,3bhk.4.1` = slug.adults.kids per flat).
- **Rules enforced on the server** (`BookingService.createGroupIntent`): 2–4 flats, same branch, same dates, every flat held in turn; if any flat cannot be held the others are released and nothing is charged. One Razorpay order for the combined 20% advance; one confirmation; one PDF voucher (one page per flat). The group is named by its first flat's booking code, stored in `bookings.group_code`.
- **Setup required**: run `supabase/migrations/20261030_booking_groups.sql` (`rollback_booking_groups.sql` reverts it). Until then a combined booking fails cleanly with "not available yet" before any payment; single-flat bookings are unaffected.
- **Not covered**: add-on services are not offered in the combined checkout (single-flat checkout still has them).

## Email (built, needs keys)
Booking confirmations (one email per booking or per group) and Member ID emails go through Resend. Set `RESEND_API_KEY`, `EMAIL_FROM` (a verified sender) and `NEXT_PUBLIC_SITE_URL` in Vercel. Without them nothing is sent and nothing breaks. `CRON_SECRET` (32+ random characters) is required for the expiry job.

## Before pushing to GitHub / Vercel
1. Run the two migrations in Supabase (memberships first, then booking groups) on the preview project.
2. Add the environment variables to Vercel: Supabase, Razorpay (test keys for preview), Cloudflare R2, `ADMIN_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`.
3. Razorpay webhook URL: `https://<your-domain>/api/webhooks/razorpay` with `payment.captured`, `order.paid`, `payment.failed`.
4. After the first deploy, make one test membership payment and one 2-flat booking end to end (neither could be run locally without the tables).

## Extra-children fee (client confirmed: charged)
Every booking path now charges ₹300 per night for each child above the flat's included allowance — one child per two base adults (1 BHK 1, 2 BHK 2, 3 BHK 3, 4 BHK 4). The rule lives in `lib/pricing.ts`, so single checkout, combined checkout, the flat page, search estimates and the server all agree. It is stored and shown as one "Extra guest charges (adults & children)" line. The selector only lets extras be added once the included guests are full, so its estimate matches the final price. "Children stay free" copy was replaced on policies, FAQ, voucher, confirmation, flat pages and the guest selectors (EN + AR). **Confirm with the client:** the included-child allowance above (it came from the selector's earlier rule) and the Arabic wording.

## Known gaps
1. Admin save/delete flows and the Razorpay webhook have not been exercised against a live database; no test runner is wired in `package.json` (run tests with `npx tsx tests/<folder>/<file>.test.ts`).
2. The booking-confirmation API reads a per-server cache first, so on serverless a just-paid single booking could briefly look unconfirmed on another instance (pre-existing; combined bookings read fresh from the database).

## Where the four settings come from
- `EMAIL_FROM` — must be an address on a domain verified in Resend (Resend dashboard → Domains). The account currently has only `jsscommunication.com` verified, so `.env.local` uses `Flatel Hospitality <reservation@jsscommunication.com>`. **Verify the Flatel domain (e.g. flatel.in) in Resend and switch to it** so customers see Flatel's own address. Test: `npx tsx --env-file=.env.local scripts/check-email.ts`.
- `RAZORPAY_WEBHOOK_SECRET` — a secret you choose. Razorpay dashboard → Settings → Webhooks → Add webhook: URL `https://<your-domain>/api/webhooks/razorpay`, events `payment.captured`, `order.paid`, `payment.failed`, and paste the same secret there and in Vercel.
- `CRON_SECRET` — a random secret generated for you; put the same value in Vercel (Vercel then sends it to the daily job automatically).
- `NEXT_PUBLIC_SITE_URL` — your public address (`http://localhost:3000` locally, e.g. `https://www.flatel.in` on Vercel).

## Live verification
`npx tsx --env-file=.env.local scripts/verify-live-flows.ts --yes` runs the real route handlers against your Supabase, Razorpay **test** keys and Resend (payments are signed with your test secret, no card needed). It covers membership purchase, forged-signature rejection, member rate, extra-child fee, single and multi-flat booking, vouchers, both webhooks, admin members, the expiry job and email delivery, then deletes everything it created (guest email `delivered@resend.dev`). Last run: 40/40 passed. It refuses to run with non-test Razorpay keys.

## Housekeeping
- A 1×1 test image was uploaded to the R2 bucket at `upload-test/` while verifying; delete it from the Cloudflare dashboard if you like.
- R2 bucket must have public access enabled for photos to display.
