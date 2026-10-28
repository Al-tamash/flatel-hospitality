# Design Document: Flat Page, Maps, Purpose Pages & Homepage Polish

**Date**: 2026-10-28
**Status**: Draft for review
**Project**: Flatel Hospitality Website (`flatel-website`)
**Branch**: `feat/bilingual-en-ar-website`

---

## 1. Intent & the "why"

The client reviewed the live preview against OYO, Agoda and Danube Properties and asked for a batch of UI changes. The common thread: **guests should see the flat, its surroundings and the services for their reason for travelling, without hunting or scrolling through empty space**, and the site should feel as premium as the Flatel brand ("Stay Beyond Hotel", warm black + gold).

Every change here is UI and content. No database, payment or booking-logic changes are in this phase.

---

## 2. Goals, non-goals, anti-goals

### 2.1 Goals (this phase)
1. Auto-playing photo carousel on the flat page and the branch page.
2. The booking/payment panel on the flat page stays put while the content scrolls.
3. Flat page amenities: guest picks a stay purpose first, then sees that purpose's free and paid services, then the regular flat amenities.
4. Embedded gold-on-black map in the flat page's "Nearby" section, OYO-style, with policies directly below.
5. Floating WhatsApp + Call buttons on all guest-facing pages.
6. "Find Your Nearest Flatel" map redesigned: gold roads on black, black/gold flag pins, Danube-style branch list, Hospitals and Heritage filters.
7. Founder card + Mission & Vision on the About page; a slim teaser strip on the homepage.
8. "Starlight" night-sky effect in exactly three places.
9. A dedicated page for each of the 5 stay purposes; 5 purpose cards under the hero link to them.
10. The hero search does a real availability check and shows a clear results summary.
11. The homepage flats section gets shorter and the dead space above it is removed.
12. Everything above works in English and Arabic (`/ar/...`, RTL).

### 2.2 Non-goals (Phase 2, each gets its own design document)
- **Flatel Membership (₹777 join fee)**: on hold until the client confirms benefits (discount %, free-night rule, validity). Nothing membership-related is built now.
- **Multi-flat booking in one checkout**: agreed rules for later, so nothing now contradicts them:
  - same branch only
  - same dates for every flat
  - max 4 flats per booking
  - if any flat is unavailable, the guest is told which one and can swap it
  - one Razorpay payment for the combined 20% advance
  - one voucher listing all flats
- Guest reviews/ratings, "Share this flat", prefilled WhatsApp with dates (suggested, not agreed).

### 2.3 Anti-goals (would make this a failure even if it "works")
- **No fake urgency or invented numbers.** No "8 people booked in last 6 hours" unless backed by real booking data.
- **Starlight is not wallpaper.** If it appears on more than the three agreed places, or makes photos/text harder to read, it has failed.
- **No off-palette UI.** No green "Active" badges, monospace labels or white pins; everything sits in the warm-black / gold system (`#0E0A07`, `#16100B`, `#E5C178`, `#C69344`, `#FAF4EB`, `#B8A692`).
- **Nothing that breaks Arabic/RTL.** Mirrored arrows, flipped floating buttons and logical spacing are required, not nice-to-have.
- **No heavy new dependencies or paid API keys.** Maps stay on Leaflet (already installed) with free tiles.
- **Floating buttons and carousels must not cover the mobile sticky "Book" bar** or block content.

---

## 3. Constraints and facts from the codebase

- Next.js 16 App Router, React 19, Tailwind v4. Per `AGENTS.md`, read `node_modules/next/dist/docs/` before writing route code; APIs differ from older Next.js.
- Arabic pages live under `app/ar/...` and mirror English routes; copy comes from `lib/i18n/dictionaries/{en,ar}.ts` or inline `isAr ?` branches (both patterns exist; follow the file you're in).
- Phone for both floating buttons: **+91 79891 00711**, already in `lib/constants.ts` (`CONTACT_PHONE`, `WHATSAPP_CONFIG`). Use those constants; don't hard-code.
- Stay purposes: 5 in `STAY_PURPOSES` (`lib/constants.ts`): `medical`, `wedding`, `family`, `tourism`, `corporate`. Free and paid services per purpose: `PURPOSE_PACKAGES` (`lib/mock-rooms.ts`): `complimentaryServices`, `paidAddons`.
- Branch coordinates are duplicated in `lib/branch-data.ts` and `components/branch-hub.tsx` (`BRANCHES_MAP_DATA`). Consolidate to one source while touching the map.
- No coordinates exist yet for hospitals or heritage places.
- The sticky panel is already coded (`lg:sticky lg:top-28`, `components/rooms/room-detail-view.tsx:641`) but doesn't stick. `<body>` already has `overflow-x-clip` (`app/layout.tsx:55`), which overrides the base-layer `overflow-x: hidden`, so the overflow rule is probably **not** the cause. The likely cause: `BookingSidebar` (dates, guests, purpose dropdown, all add-on toggles) is taller than the viewport and scrolls away. Confirm in the browser first.
- The hero's `FlatOccupancyModal` has hard-coded `availableUnits` (`components/hero/flat-occupancy-modal.tsx`, e.g. 2 BHK = 3) that contradict the inventory `totalUnits` in `lib/mock-rooms.ts` (2 BHK = 1). Inventory is the source of truth.
- Client reference screenshots are saved in `docs/superpowers/specs/assets/2026-10-28/`:

  | File | What it shows |
  |---|---|
  | `ref-oyo-nearby.jpg` | Nearby layout |
  | `ref-gold-map.jpg` | Gold-roads map mood |
  | `ref-flag-pin.png` | Flag pin |
  | `ref-danube-map.jpg` | Branch list + popup |
  | `ref-mission-vision.jpg` | Mission & Vision block |
  | `ref-founder.jpg` | Founder card |
  | `ref-starlight.jpg` | Starlight mood |
- One booking = one flat today (`bookings.unit_id`); checkout takes a single `property` param.

---

## 4. What gets built

### 4.1 Photo carousel: flat page (`/properties/[slug]`) and branch page (`/branches/[slug]`)
- **One shared carousel component** used by both pages. It replaces the desktop collage in `components/rooms/room-gallery.tsx` and the hero gallery in `components/branches/branch-detail-view.tsx`.
- Full-width slider, rounded, gold hairline border, same height as today's collage (≈380–440px desktop, 16:10 mobile).
- **Auto-advances every ~5s.**
- **Pauses when:**
  - the mouse is over it
  - it has keyboard focus
  - the user has touched/swiped it (stays paused for that visit)
  - it's scrolled off-screen
  - the browser tab is hidden
- **Never auto-plays** when `prefers-reduced-motion` is set.
- Controls:
  - prev/next arrows
  - dots
  - a thumbnail strip on desktop
  - swipe on mobile
  - "1 / 8" counter
  - "View all photos"
- Clicking a slide opens the existing fullscreen lightbox at that photo.
- RTL: arrows and swipe direction mirror.
- The first image keeps `priority` loading; the rest lazy-load.

### 4.2 Sticky booking panel (flat page)
- On desktop (`lg+`) the right-hand panel stays visible while the left column scrolls, until the end of the two-column area.
- If the panel is taller than the viewport, it should still be fully reachable. Builder picks the technique, e.g. stick to the bottom when tall, or an inner scroll with a max height of `100vh − header`.
- Mobile keeps its existing sticky bottom "Book" bar.
- Fix the root cause with CSS, not a JS scroll workaround. Confirm in the browser whether it is panel height (likely) or an ancestor's overflow. If you touch any overflow rule, check that horizontal scroll doesn't return anywhere.
- **Panel contents (user decision)**:
  - Panel keeps: dates, guests, the purpose dropdown, and the price breakdown with the pay button.
  - Add-ons shrink to **one summary line**, e.g. "2 add-ons · ₹X · Edit". **Edit** scrolls to the amenities section's add-on list (§4.3).
  - When nothing is selected, the line reads "Add services for your stay →".
  - The full add-on toggles live only in the amenities section.
  - The panel should then fit the viewport at common desktop heights (≥768px). Keep a max-height fallback for short screens.

### 4.3 Amenities: purpose first (flat page)
Order inside the amenities section:
1. **Purpose picker.** Heading "What brings you to Hyderabad?" with 5 compact chips/cards (Medical, Wedding, Family, Tourism, Corporate) plus "Just the stay" (`accommodation_only`).
2. **After a purpose is picked:**
   - "Free with your {purpose} stay": the `complimentaryServices` list, with disclaimers shown.
   - "Add-on services": the `paidAddons` list with prices and an add/remove toggle.
3. **Regular flat amenities** ("Included with your flat"), always shown, below the purpose block.

Rules:
- **No purpose picked yet**: show the picker plus the regular amenities. Don't show any purpose services until one is picked.
- **One shared state**: the purpose and add-ons are the same as in the booking panel's purpose dropdown. That state already lives in `RoomDetailView` (`selectedPurposeId`, `selectedAddonIds`). Picking in either place updates both, and toggled add-ons flow into the price and checkout as they do today.
- `?purpose=` in the URL (from purpose pages or the homepage) pre-selects the purpose, as today.
- **Wedding is its own purpose everywhere.** Remove the `wedding → family` remap in `components/featured-flats.tsx:100`.

### 4.4 "Nearby" section with an embedded map (flat page)
- **Layout (OYO reference):**
  - Section heading "What's nearby".
  - Desktop: two columns, the existing landmark list on the left and the map on the right.
  - Mobile: map stacks under the list.
  - "Stay Policies & House Rules" stays directly below this section.
- **Map:**
  - Same gold-on-black style and flag pin as the homepage map (4.6).
  - Centred on this flat's branch, with the branch flag.
  - Includes "Open in Google Maps" (existing `googleMapsUrl`).
  - Scroll-wheel zoom off until the user clicks the map, so the page scroll isn't hijacked.
- The map loads only when the section is near the viewport (lazy). Leaflet is client-only (dynamic import, as `branch-hub.tsx` already does).

### 4.5 Floating WhatsApp + Call buttons
- On all guest-facing pages, EN and AR. Not on `/admin/*`, not on checkout.
- **Position**: bottom-right (LTR) / bottom-left (RTL), stacked vertically: WhatsApp on top, Call below.
- **Look**:
  - Round, dark (`#16100B`) with a gold ring and gold icon.
  - WhatsApp may use its recognisable glyph in gold.
  - Accessible labels ("Chat on WhatsApp", "Call Flatel").
- **Mobile**: sits above the sticky bottom bars (flat page, branch page) so it never covers the "Book" button. Builder measures the bar height; a CSS variable or offset prop is fine.
- **Links**:
  - WhatsApp: `WHATSAPP_CONFIG.getUrl(...)` with a generic greeting. If on a flat page, the greeting names the flat (cheap and agreed in spirit; dates are not required).
  - Call: `tel:` from `CONTACT_PHONE`.
- Doesn't overlap the cookie/consent UI or the lightbox; hidden while a fullscreen modal/lightbox is open.

### 4.6 "Find Your Nearest Flatel" map (homepage `components/branch-hub.tsx`)

**Map style**
- Switch tiles to **Carto dark** (free, no key), e.g. `dark_all` or `dark_nolabels` + `dark_only_labels`.
- Tint with a CSS filter so roads read **gold on near-black**, close to the client's reference. Replace `.flatel-dark-tiles` in `app/globals.css`.
- Labels stay readable (soft warm-white/gold).
- Keep the tile attribution.

**Flag pin (client's reference image)**
- Black flag body, **gold "F"**, **gold border**, gold pole and base dot.
- Selected branch: same flag, slightly larger, with a soft gold glow (not white).
- **Remove** the monospace text label under the pin; the branch name shows in the list/popup instead.

**Layout (Danube-inspired)**
- **Desktop**:
  - Left: a branch list panel, ~320px. Each row has:
    - photo thumbnail
    - branch name + area
    - "from ₹X / night" (from inventory, as today)
    - **Directions** (Google Maps) and **Explore Flats** (`/branches/[slug]`) buttons
  - Right: the map.
- **On load**: the map fits both branches in view.
- **Clicking a list row**: the map flies to that branch and highlights its flag and the row.
- **Clicking a flag**: a compact popup above the pin with a small photo slider, name, price, Directions + Explore Flats. This **replaces** the large card that covered a third of the map.
- Fix text truncation and price overflow seen in the current card.
- Remove the green "Active & Accepting Guests" badge.
- **Mobile**: map on top; branch cards below as a horizontal swipe row; tapping a card flies the map.
- Keep the stat tiles (2 Branches / N Residences / 24×7). **N counts physical units** (the sum of `totalUnits`, currently 5, which matches what the site shows today), computed from data, not hard-coded. *(Builder-check call.)*

**Filters**
- Two toggle chips above or inside the map: **Hospitals** and **Heritage & Shopping**. Both off by default.
- Hospitals: the hospitals already listed on the site (`components/nearby-hospitals.tsx` / `/hospitals`) within reach of the branches.
- Heritage & Shopping: Charminar, Mecca Masjid, Laad Bazaar, Chowmahalla Palace, Salar Jung Museum, and similar.
- Small gold-outline icon markers, distinct from the branch flags; a tooltip/popup shows the name and approximate distance to the nearest branch.
- **Coordinates are looked up from OpenStreetMap by the builder** and stored in one data file. Each entry carries a `verified: false` flag and a source comment. **The client must verify them before launch**; the handover note lists them.

**Shared map pieces**: tile style, flag pin, and the client-only Leaflet loader are shared by this map and the flat page's Nearby map (4.4).

### 4.7 Founder + Mission & Vision

**About page (`/about`, `/ar/about`), full version** (matches the client's screenshots):
- **"Our Mission & Vision"**:
  - pill label
  - large serif headline ("A stay experience *redefined*.", gold italic on the last word)
  - mission paragraph
  - "VISION" divider
  - italic vision quote
  - three value cards: Guest-first hospitality, Curated comfort, Trusted service
- **"Meet our Founder"** card:
  - round gold-ringed photo
  - "Osama", "Founder & Managing Director"
  - short bio
  - phone + email buttons
  - "Flatel Hospitality Private Limited — A company registered under the Government of India"
- Placement: after the hero / founding story, before the 5-pillar pledge.
- This block gets the **starlight** background (4.8).

**Homepage, slim strip** before the FAQ:
- one-line mission
- small founder photo + name/title
- "Read our story →" linking to `/about`

**Copy**: use this text, transcribed from the client's screenshots (`ref-mission-vision.jpg`, `ref-founder.jpg`). Arabic translations follow the existing dictionary standard.

- **Pill**: OUR MISSION & VISION
- **Headline**: A stay experience *redefined.*
- **Mission**: "Our mission at Flatel is to build Hyderabad's most trusted network of 1,000 premium furnished flats, where the comfort of a flat meets the service of a hotel. We are committed to delivering exceptional hospitality, modern amenities, and thoughtful guest support for leisure travellers, business travellers, families, and medical guests."
- **Vision**: "Our vision is to redefine the stay experience by combining comfort, convenience, care, and trusted service under one premium brand."
- **Value cards**:
  - **Guest-first hospitality**: "Warm, thoughtful service for every traveller — leisure, business, family or medical."
  - **Curated comfort**: "Premium furnishings, modern appliances and design details that feel like home."
  - **Trusted service**: "Verified properties, transparent pricing and 24×7 support you can rely on."
- **Founder**:
  - MEET OUR FOUNDER
  - Osama
  - Founder & Managing Director
  - "Founder of Flatel Hospitality Private Limited — building Hyderabad's most trusted network of premium furnished flats that combine the comfort of a home with the service of a hotel."
- **Footer line**: Flatel Hospitality Private Limited — A company registered under the Government of India
- **Founder phone button**: use `CONTACT_PHONE` (+91 79891 00711), not the 93464 number shown in the screenshot. This keeps one number across the site, per Q4. *(Builder-check call; flagged in the handover.)*

**Assets needed from the client**:
- the founder photo (none in `public/images`)
- confirmation of the email (`hello@flatel.in` in the screenshot)

Until the photo arrives, use a tasteful monogram placeholder (Flatel "F" in a gold ring), not a stock face.

### 4.8 Starlight effect
- Inspired by the Rolls-Royce starlight headliner. **Only in three places:**
  1. behind the hero (behind the search/heading, under the photo overlay)
  2. the About page Mission/Vision + Founder block
  3. the site footer
- Sparse (~100–150 points per section), **warm white and soft gold** (not pure white), varied sizes, a handful of brighter "flare" stars with a 4-point glint.
- Very slow, subtle twinkle.
- Must not reduce text contrast; stays behind content with low opacity.
- **Performance:**
  - one lightweight canvas (or pure CSS) per instance
  - paused when off-screen or the tab is hidden
  - **static (no animation) under `prefers-reduced-motion`**
  - no layout shift; the server render shows the plain background
- One reusable component.

### 4.9 Purpose pages: `/stays/[purpose]` and `/ar/stays/[purpose]`
5 pages: `medical`, `wedding`, `family`, `tourism`, `corporate`. Static params; unknown slug → 404.

Page structure:
1. **Hero**:
   - purpose image (`public/images/purposes/` / `experiences/`)
   - title + tagline from `STAY_PURPOSES`
   - CTA "Book with {purpose} package"
2. **Who it's for**: the `description`, 2–3 short points.
3. **Free services**: `complimentaryServices` (with disclaimers).
4. **Paid add-ons**: `paidAddons` with prices ("on quote" where `price` is null).
5. **Recommended flats**: flat cards suited to the purpose. Wedding/Family → larger flats first; Medical → all, sorted by hospital proximity if available, otherwise default order. Each card links to `/properties/[slug]?purpose={id}`.
6. **One purpose-specific block**:
   - Medical → nearby hospitals (reuse existing hospital component/data)
   - Tourism → heritage circuits (`TOURISM_CIRCUITS`)
   - Wedding → wedding services (`WEDDING_SERVICES`), **leaving out items already listed as paid add-ons in block 4**, so nothing appears twice *(Builder-check call)*
   - Family → bigger flats / kitchen & kids comforts
   - Corporate → work setup (Wi-Fi, desk, GST invoice)
7. **FAQ** (3–5 questions per purpose), then a closing CTA + WhatsApp.

Other requirements:
- **SEO**: unique `title`/`description` per page and language.
- **Homepage purpose cards** (`components/hero-featured-cards.tsx`):
  - grow from 4 to **5 cards** (add Wedding, image `purpose-wedding.jpg`)
  - each links to `/stays/{id}` (or `/ar/stays/{id}`) instead of filtering the homepage
  - layout fits 5 in one row on desktop, horizontal swipe on mobile

### 4.10 Hero search fixes (`components/hero/booking-search.tsx` → `components/featured-flats.tsx`)
Keep the existing flow: search → filters the homepage flats section → flat page pre-filled → checkout. Add the following.

1. **Availability**: when dates are set, each flat card checks `/api/bookings/availability` for those dates.
   - Cards show **"Available"** or **"Booked for these dates"**.
   - Booked flats move to the end, greyed, not bookable.
   - A loading state is shown while checking.
   - Builder decides batching (one request per flat vs. a batch endpoint). If a batch endpoint is added, it's read-only and reuses existing availability logic.
   - **"Available" means at least one unit of that flat type is free for those dates.** Booking stays one flat at a time in this phase, so remaining-unit counts aren't needed. *(Builder-check call.)*
   - Fix the hero's hard-coded `availableUnits` so unit caps come from inventory `totalUnits`.
2. **Results summary bar** above the cards, e.g. "3 flats available · 23–26 Nov · 2 guests · Edit search". "Edit search" scrolls back to the hero search and opens it. Hidden when no search is active.
3. **No dates**: the card's button goes to the flat page **with the date picker opened**, e.g. via a `?pickDates=1` param the flat page honours. With dates, it goes to the flat page pre-filled (not straight to checkout; see 4.11).
4. **More than one flat selected** (two types, or 2+ units of one type): show a small note: "Booking multiple flats? Book them one by one, or WhatsApp us and we'll hold them together." (WhatsApp link.)
5. Wedding stays Wedding (see 4.3).

### 4.11 Homepage flats section: shorter
- **Remove** the purpose chips and the purpose banner from this section (purpose now lives on purpose pages and the flat page). `?purpose=` arriving on the homepage should no longer change this section.
- **Filters**:
  - one row: branch tabs + flat-type chips
  - desktop: a single line
  - mobile: the same row scrolls sideways
- **Card**:
  - whole card clickable
  - photo, name, guests/beds, "from ₹X / night"
  - **one** button "View & Book" → flat page (carrying dates/guests if searched)
  - remove the separate instant-book-to-checkout button; checkout is reached from the flat page so purpose selection isn't skipped
- **Spacing**: today ≈184px of empty space between the hero purpose cards and the "Serviced Flats" heading (hero cards `pb-16` + section `pt-20` + heading `mb-10`). Reduce to roughly 80–96px total. Verify in the browser at desktop and mobile widths; screenshot before/after.

---

## 5. Decided by the user (record of decisions)

| # | Decision |
|---|----------|
| Q1 | Carousel on both flat page and branch page, one shared component |
| Q2 | Full-width auto slider replaces the collage |
| Q3 | Purpose picker first → that purpose's free + paid services → regular amenities |
| Q4 | Floating buttons use **+91 79891 00711** for both WhatsApp and Call |
| Q5 | Membership deferred until client confirms |
| Q6 | Carto dark tiles + gold tint (no MapLibre / no API key) |
| Q7 | Full Founder + Mission/Vision on About; slim strip on homepage |
| Q8 | Nearby: list left, map right, policies below |
| Q9 | Starlight in 3 places only |
| Q10 | Dedicated page per purpose |
| Q11 | Wedding added as the 5th purpose card + page |
| Q12/13 | Map filters: Hospitals + Heritage & Shopping (coordinates looked up, client verifies) |
| Q14 | Hero search: availability, summary bar, no-dates behaviour, multi-flat note, Wedding fix |
| Q15 | Flats section: one filter row, single CTA, less spacing |
| Q16 | Multi-flat booking → Phase 2 |
| Q17 | Multi-flat rules: same branch, same dates, max 4, swap if one unavailable |
| Flag | Black flag, gold F, gold border/pole; selected = gold glow |
| Panel | Booking panel shows add-ons as one summary line; full toggles in amenities |

---

## 6. Left to the builder
- Component boundaries and file names (shared carousel, map pieces, starlight, floating buttons).
- Exact carousel timing/transition, thumbnail sizes.
- The exact CSS filter values for gold tiles. The goal is visual (gold roads, black ground, readable labels), judged against the client's reference in the browser.
- Technique for a sticky panel taller than the viewport.
- Availability request batching.
- FAQ wording per purpose (factual, from existing services data; no invented promises).
- Arabic copy for new strings, following the existing dictionary tone.

---

## 7. Done means
- `npm run lint` and `npm run build` pass; existing tests under `tests/` still pass.
- Each item in §4 checked in the browser in **English and Arabic**, at **desktop (≥1280px)** and **mobile (375px)**, with screenshots.
- Reduced-motion check: carousel doesn't auto-play, starlight is static.
- No horizontal scroll introduced at 320–1440px.
- The handover note lists:
  - the hospital/heritage coordinates needing client verification
  - the missing founder photo
  - the email to confirm
- `graphify update .` run after code changes (per root `AGENTS.md`).

