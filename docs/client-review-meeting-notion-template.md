# FLATEL Hospitality — Client Review & Production Handover Meeting

> Copy this page into Notion before the call. Use it to keep the discussion focused, record decisions, and identify what is still needed before production. Keep the tone collaborative: you control the agenda and notes, while the client confirms business facts and approvals.

## Meeting details

- **Date / time:**
- **Client:**
- **FLATEL attendees:**
- **Duration:** 40 minutes
- **Preview URL:** https://flatel-hospitality.vercel.app/
- **Meeting goal:** Confirm visual feedback, content facts, booking rules, and production inputs.
- **Decision maker for final approval:**

## Before the meeting

- [ ] Open the deployed preview and keep it ready to share.
- [ ] Ask the client to bring the photos/screenshots they mentioned, ideally with arrows or short notes.
- [ ] Keep this page open and record each requested change in the tracker below.
- [ ] Have the approved PRD/business notes available, if applicable.
- [ ] Do not put passwords, API keys, payment credentials, guest data, or other secrets in this page, WhatsApp, or meeting notes.

## Opening script

“Thanks for taking the time. I’ve noted your feedback that some icons, layout/order, design details, and font styles don’t match your points closely enough. Aap screenshots ya photos ke through exact reference dikha dijiye. Main har item page aur section ke saath note karunga, phir end mein changes aur priorities aapke saath confirm karunga. Aaj ka goal requirements clear karna hai; implementation timeline impact review ke baad share karunga.”

## 40-minute agenda

### 1. Agree on the goal — 3 min

- [ ] Confirm this is a first-preview review, not a production launch approval.
- [ ] Confirm who will give final design and business-content approval.
- [ ] Agree to review one page/section at a time.

### 2. Review screenshots and design feedback — 15 min

For each image, ask:

- Which page and section is this about?
- What should change: icon, font, size, spacing, alignment, section order, colors, or wording?
- Is the reference for desktop, mobile, or both?
- Should this treatment apply only here, or across the whole site?
- Is the image a final reference, or only an example of the direction?

Check these design points:

- [ ] Icons: exact icon or style, size, placement, and whether to use supplied brand assets.
- [ ] Fonts: heading font, body font, weights, sizes, and any supplied licensed font files.
- [ ] Layout: what should appear first, section order, alignment, whitespace, and CTA placement.
- [ ] Responsive layout: desktop and mobile references or differences.
- [ ] Photos: approved image for each property/section and permission to use it.
- [ ] Copy: exact approved wording where the current text is inaccurate.

### 3. Confirm business facts and booking rules — 10 min

Do not guess or fill gaps with sample values. Confirm what is current and approved:

- [ ] Property/branch names, addresses, map pins, and directions.
- [ ] Residence types, occupancy/capacity, beds, bedrooms, bathrooms, and kitchen details.
- [ ] Amenities and services available at each specific residence.
- [ ] Prices, taxes/fees, discounts, and any date/season variations.
- [ ] Check-in/check-out times, children rules, ID requirements, and house rules.
- [ ] Cancellation/refund window and how refunds are handled.
- [ ] Booking payment split. Current implementation presents a 20% online advance and remaining balance at arrival; confirm this is the approved rule for production.
- [ ] Support phone, WhatsApp, and email that guests should use.
- [ ] Any operational or medical-travel claims that need correction or removal.

### 4. Production requirements — 8 min

Confirm the responsible owner and delivery path for each item. **Never ask the client to paste secret values into Notion or WhatsApp.** Use the relevant provider dashboard or an approved secrets manager, with access limited to the people who need it.

#### Vercel and domain

- [ ] Confirm the production domain and who controls its DNS.
- [ ] Confirm who can grant the developer the correct Vercel project access.
- [ ] Confirm production deployment approval is separate from this preview review.
- [ ] Confirm the client can access the preview URL and whether preview protection is enabled.
- [ ] Set production environment variables in Vercel only, for the Production environment.
- [ ] Review these environment variable names against the deployment code and set only the ones the production setup needs. Ask the account owner to add values directly in Vercel; never copy values into this page.

Current code references these names:

  - Supabase client: `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  - Supabase server access: `SUPABASE_SERVICE_ROLE_KEY`.
  - Admin session signing: `ADMIN_SECRET_KEY`.
  - Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
  - Cloudflare R2 image storage: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`, and `NEXT_PUBLIC_R2_PUBLIC_URL`.
  - WhatsApp contact: `NEXT_PUBLIC_WHATSAPP_NUMBER`.

The two Supabase client key names and two Cloudflare account ID names may be alternatives or serve different code paths. Confirm the actual production requirement with the deployment config before setting them.

#### Supabase and guest accounts

- [ ] Identify the approved production Supabase project (separate from preview/test).
- [ ] Confirm production database backup and rollback expectations before migrations.
- [ ] Review and apply only approved migrations to production through the agreed process.
- [ ] Confirm row-level security and admin/guest access rules are in place.
- [ ] Confirm Email sign-up and sign-in are enabled. Guest account creation now uses email/password; phone OTP was removed because the phone provider was unsupported. Guest phone is collected during reservation checkout.
- [ ] Confirm whether email confirmation is required and provide an approved sender address/domain and SMTP/email delivery setup.
- [ ] Confirm the approved admin login email. The current code recognizes `reservation@flatel.in` as the admin identity; confirm or request a change before launch.

#### Razorpay payments

- [ ] Confirm the merchant account is production-approved and KYC is complete.
- [ ] Add live Razorpay credentials and webhook secret securely in Vercel; do not send them in chat.
- [ ] Confirm the production webhook URL and required payment events with the developer.
- [ ] Confirm the payment success/failure, pending, cancellation, and retry expectations.
- [ ] Agree on final sandbox verification before any live payment is accepted.
- [ ] Do not use a real guest booking or payment as a test.

#### Images, messaging, and support

- [ ] Confirm approved property/gallery images and who can upload them.
- [ ] If the Cloudflare R2 image store will be used in production, arrange the bucket and credentials securely; confirm the public image URL.
- [ ] Confirm the business WhatsApp support number and guest-facing contact details.
- [ ] Confirm whether email/WhatsApp booking notifications are required, and who owns their provider setup and message templates.

#### Legal and search details

- [ ] Approve privacy notice, terms, cancellation/refund policy, and guest rules.
- [ ] Approve page titles, business description, logo, and social preview image.
- [ ] Confirm the business name and address that should appear in public search results.

### 5. Recap decisions and next steps — 4 min

- [ ] Read back the top-priority changes.
- [ ] Confirm which items are approved, which need client-provided material, and which remain undecided.
- [ ] Agree who will provide each missing item and by when.
- [ ] Say that delivery estimates will follow after scope and technical impact are reviewed.
- [ ] Send the client a written summary after the meeting.

## Change tracker

Use one row per requested change. Keep the acceptance criteria observable and specific.

| ID | Page / section | Current issue | Desired result / acceptance check | Reference image | Device | Priority | Client confirmed? | Status |
|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  | Desktop / Mobile / Both | Must / Should / Later | Yes / No | Open |
| 2 |  |  |  |  | Desktop / Mobile / Both | Must / Should / Later | Yes / No | Open |
| 3 |  |  |  |  | Desktop / Mobile / Both | Must / Should / Later | Yes / No | Open |

## Business facts requiring written confirmation

| Fact / rule | Current understanding | Client-approved value | Evidence / source | Approved by | Date |
|---|---|---|---|---|---|
| Payment split | 20% online advance; balance at arrival |  |  |  |  |
| Cancellation / refund |  |  |  |  |  |
| Check-in / check-out |  |  |  |  |  |
| Property capacity / amenities |  |  |  |  |  |
| Prices / taxes / fees |  |  |  |  |  |
| Support contacts |  |  |  |  |  |

## Production inputs tracker

| Input | Responsible person | Secure delivery method | Needed by | Status |
|---|---|---|---|---|
| Production domain / DNS access |  | Provider access invite |  | Not started |
| Vercel project access and production approval |  | Vercel team/project invite |  | Not started |
| Production Supabase project and migration approval |  | Supabase project access; never paste service-role key in notes |  | Not started |
| Supabase email confirmation / sender setup |  | Supabase/email provider dashboard |  | Not started |
| Razorpay live account and webhook setup |  | Razorpay dashboard; secrets entered into Vercel securely |  | Not started |
| Approved property content and photography |  | Shared approved folder |  | Not started |
| Cloudflare R2 production setup, if required |  | Cloudflare dashboard / secrets manager |  | Not started |
| Approved policies and contact details |  | Final document or written approval |  | Not started |

## Parking lot — not a decision for today

Put unrelated requests or new features here so the page-by-page review stays on time.

| Request | Why it is deferred | Follow-up owner | Follow-up date |
|---|---|---|---|
|  |  |  |  |

## Meeting decisions

- **Must-fix items before next preview:**
- **Items approved as-is:**
- **Client materials/facts still needed:**
- **Production blockers:**
- **Items deferred:**
- **Next review date:**
- **Meeting summary sent:** [ ]

## Closing script

“Main decisions recap kar deta hoon: [top changes]. Aap [materials/facts] [date] tak share karenge. Main pehle impact aur scope check karke written update dunga. Production deploy ko alag approval aur production checks ke baad hi karenge. Kya meri notes mein koi point galat ya missing hai?”

## After the meeting

- [ ] Send the client the confirmed change list and unresolved questions.
- [ ] Separate visual changes from content/business-rule changes.
- [ ] Do not change prices, policies, property claims, payment rules, or production data without written approval.
- [ ] Do not deploy to production until all production blockers, access, environment, payment, backup, and approval checks are complete.
