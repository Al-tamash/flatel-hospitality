# Flat Page, Maps, Purpose Pages & Homepage Polish: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the client's UI batch:
- auto-playing gallery
- sticky booking panel with an add-on summary
- purpose-first amenities
- gold-on-black maps (homepage + flat page)
- floating WhatsApp/Call buttons
- starlight effect
- Founder/Mission blocks
- 5 purpose pages
- hero search availability
- a shorter homepage flats section

All in English and Arabic.

**Architecture:**
- **Pure logic lives in small `lib/` modules with `node:assert` tests run by `tsx`.** This covers geometry, autoplay rules, availability sorting, summaries, content and star generation. Same pattern as `tests/i18n/*`.
- **UI goes into focused client components under `components/`.** Pages compose them.
- **Leaflet stays the map engine.** Shared tile/flag/loader pieces serve both maps.
- **No database, payment or booking-logic changes.**

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, Leaflet 1.9 (dynamic import), lucide-react, `tsx` + `node:assert` for tests.

**Spec:** `docs/superpowers/specs/2026-10-28-flat-page-maps-purpose-pages-design.md` (read it first; section numbers below refer to it). Reference screenshots: `docs/superpowers/specs/assets/2026-10-28/`.

## Global Constraints

- **Next.js 16 routes**: read `node_modules/next/dist/docs/` before writing route code. `params` is a `Promise` (see `app/properties/[slug]/page.tsx`).
- **Palette only**: `#0E0A07`, `#16100B`, `#E5C178`, `#C69344`, `#FAF4EB`, `#B8A692`, gold hairlines `rgba(212,163,89,0.18–0.35)`. No green badges, no monospace labels, no white pins.
- **Both locales**:
  - Every guest-facing change works at `/…` and `/ar/…`.
  - Locale comes from `getLocaleFromPath(usePathname())` in client components.
  - Arabic pages under `app/ar/` are separate files; mirror every page change there.
  - RTL: mirror arrows, swipe direction and floating-button side; use logical spacing (`ms-/me-/ps-/pe-/start-/end-`).
- **Phone**: always `CONTACT_PHONE` / `WHATSAPP_CONFIG` from `lib/constants.ts` (+91 79891 00711). Never hard-code a number.
- **No new npm dependencies, no API keys.** Tiles: Carto basemaps (free, keep attribution).
- **No fake urgency or invented numbers**; counts come from data.
- **`prefers-reduced-motion`**: no carousel autoplay, starlight static.
- **Tests**: `npx tsx tests/<area>/<name>.test.ts`, written in the style of `tests/i18n/room-localizer.test.ts` (top-level `assert` calls plus a final `console.log("…passed")`).
- **Done gate per task**: its tests pass + `npm run lint` clean for touched files. UI tasks are also checked in the browser (EN + AR, 1280px + 375px).
- **After the final task**: `graphify update .`

## Review Focus

1. **Arabic/RTL**:
   - carousel "next" must move visually leftward-forward in RTL
   - the swipe direction must match
   - floating buttons must sit bottom-left
   → tests in Task 4 (`nextIndex` with `dir`) and Task 7 (`floatingSide`).
2. **Short desktop screens (≈768px tall)**: the sticky panel must stay fully reachable. → Task 6 browser check at 1280×768.
3. **Flats with only 0–1 photos**: the carousel must not autoplay or show arrows/dots. → Task 4 test (`shouldAutoplay` with `count: 1`).
4. **Availability API failing or slow**: the card must show a neutral "Check on next step" state, never "Booked". It must stay bookable and sort with the available ones. → Task 11 test (`status: "unknown"`).
5. **Map tiles failing (offline/blocked)**: the branch list, Directions and Explore buttons must still work, and the error banner must show. → Task 2 browser check with the Carto host blocked.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/map/geo.ts` | `distanceKm`, `nearestBranch` |
| `lib/map/places.ts` | Branch pins (from `BRANCH_PROFILES`) + Hospitals / Heritage & Shopping places with coordinates |
| `components/map/map-style.ts` | Carto tile URL/options, `buildFlagPinHtml`, `buildPlaceMarkerHtml` |
| `components/map/use-leaflet-map.ts` | Client-only Leaflet loader hook (dynamic import, lazy on visibility) |
| `components/branch-hub.tsx` | Homepage map section: list + map + popup + filters (rewrite of map part) |
| `components/rooms/nearby-map.tsx` | Flat page "What's nearby" map |
| `lib/carousel/autoplay.ts` | `shouldAutoplay`, `nextIndex` |
| `components/media/photo-carousel.tsx` | Shared auto-playing carousel + lightbox |
| `lib/purpose/purpose-services.ts` | `getPurposeServices`, `PURPOSE_IDS` |
| `components/rooms/purpose-services.tsx` | Purpose picker + free/paid services block |
| `lib/booking/addon-summary.ts` | `buildAddonSummary` |
| `lib/floating-contact.ts` | `shouldShowFloatingContact`, `floatingSide`, `buildWhatsAppGreeting` |
| `components/floating-contact.tsx` | Floating WhatsApp + Call buttons |
| `lib/starlight/generate-stars.ts` | Deterministic star field generator |
| `components/effects/starlight.tsx` | Canvas starlight layer |
| `lib/about-content.ts` | Mission/Vision/Founder copy (en/ar) |
| `components/about/mission-vision.tsx`, `components/about/founder-card.tsx`, `components/home/founder-strip.tsx` | About blocks + homepage strip |
| `lib/purpose/purpose-pages.ts` | Purpose page content, recommended flats, FAQ, wedding de-dupe |
| `components/purpose/purpose-page-view.tsx` | Purpose page UI |
| `app/stays/[purpose]/page.tsx`, `app/ar/stays/[purpose]/page.tsx` | Routes |
| `lib/search/availability.ts` | `sortByAvailability`, `buildResultsSummary`, `isMultiFlatSelection` |
| `lib/inventory-stats.ts` | `getTotalResidenceUnits`, `getUnitCapsByFlatType` |

---

### Task 1: Map kit (data, geometry, style)

**Files:**
- Create: `lib/map/geo.ts`, `lib/map/places.ts`, `components/map/map-style.ts`, `components/map/use-leaflet-map.ts`
- Modify: `app/globals.css:336-338` (replace `.flatel-dark-tiles` with `.flatel-gold-tiles`)
- Test: `tests/map/places.test.ts`

**Interfaces:**
- Produces:
  - `distanceKm(a: [number, number], b: [number, number]): number`: haversine.
  - `nearestBranch(p: [number, number]): { slug: string; km: number }`
  - `type PlaceCategory = "hospital" | "heritage"`
  - `interface MapPlace { id: string; name: string; nameAr: string; category: PlaceCategory; coordinates: [number, number]; verified: boolean; source: string }`
  - `MAP_PLACES: MapPlace[]`
  - `BRANCH_PINS: Array<{ slug: string; name: string; nameAr: string; coordinates: [number, number] }>`: derived from `BRANCH_PROFILES` in `lib/branch-data.ts`. Delete the duplicate coordinates in `components/branch-hub.tsx` `BRANCHES_MAP_DATA` in Task 2.
  - `GOLD_TILE_LAYER: { url: string; options: { attribution: string; subdomains: string; maxZoom: number; className: "flatel-gold-tiles" } }`
  - `buildFlagPinHtml(opts: { active: boolean; id: string }): string`
  - `buildPlaceMarkerHtml(category: PlaceCategory): string`
  - `useLeafletMap(containerRef: React.RefObject<HTMLDivElement | null>, opts: { center: [number, number]; zoom: number; lazy?: boolean; scrollWheelZoomOnClick?: boolean }): { map: LeafletMap | null; L: typeof import("leaflet") | null; tileError: boolean; tilesLoading: boolean }`

- [ ] **Step 1: Look up coordinates.**
  - Use OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/search?format=json&q=…`, 1 req/s).
  - **Hospitals**: every hospital in `HOSPITALS_DATA` (`components/hospital-directory-view.tsx:37`) within 12 km of either branch, plus Princess Esra Hospital and Princess Durru Shehvar Children's Hospital.
  - **Heritage & Shopping**: Charminar, Mecca Masjid, Laad Bazaar, Chowmahalla Palace, Salar Jung Museum, Falaknuma Palace.
  - Every entry gets `verified: false` and `source: "<nominatim display_name>"`.
  - If a place can't be found, leave it out and list it in the task report.
- [ ] **Step 2: Write the failing test** `tests/map/places.test.ts`:

```ts
assert.ok(Math.abs(distanceKm([17.3616, 78.4747], [17.3616, 78.4747])) < 1e-9);
assert.ok(Math.abs(distanceKm([17.3185, 78.4905], [17.357, 78.4815]) - 4.38) < 0.2); // Barkas ↔ Moghal Pura
assert.equal(BRANCH_PINS.length, 2);
assert.deepEqual(BRANCH_PINS.find(b => b.slug === "moghal-pura")!.coordinates, [17.357, 78.4815]);
for (const p of MAP_PLACES) {
  assert.ok(p.coordinates[0] > 17.2 && p.coordinates[0] < 17.6 && p.coordinates[1] > 78.3 && p.coordinates[1] < 78.7, p.name);
  assert.equal(p.verified, false);
  assert.ok(p.nameAr.length > 0 && p.source.length > 0);
}
assert.ok(MAP_PLACES.some(p => p.category === "hospital") && MAP_PLACES.some(p => p.category === "heritage"));
assert.equal(nearestBranch([17.3616, 78.4747]).slug, "moghal-pura"); // Charminar
const flag = buildFlagPinHtml({ active: false, id: "x" });
assert.match(flag, /#E5C178/i); assert.match(flag, /#0E0A07|#000|#16100B/i);
assert.doesNotMatch(flag, /monospace/i);
assert.match(buildFlagPinHtml({ active: true, id: "x" }), /drop-shadow|glow/i);
assert.match(GOLD_TILE_LAYER.url, /basemaps\.cartocdn\.com\/dark_/);
```

- [ ] **Step 3: Run it and confirm it fails.** `npx tsx tests/map/places.test.ts` → fails because the modules don't exist yet.
- [ ] **Step 4: Implement the modules.**
  - **Flag** (per `ref-flag-pin.png`): black flag body, gold "F", gold 1.2px border, gold pole and base dot. Active adds a gold `drop-shadow` glow and a ~15% scale-up.
  - **Place marker**: 22px dark circle with a gold ring and a gold lucide-style glyph (cross for hospital, dome for heritage).
  - **`.flatel-gold-tiles`**: a CSS filter (e.g. `sepia(1) saturate(…) hue-rotate(…) brightness(…)`) tuned in the browser until the roads read gold on near-black like `ref-gold-map.jpg`, with labels still readable.
  - **`useLeafletMap`**:
    - dynamically imports `leaflet` + its CSS
    - when `lazy`, waits for an `IntersectionObserver` (rootMargin 200px)
    - when `scrollWheelZoomOnClick`, keeps scroll-wheel zoom disabled until the first click
    - exposes the tile `loading` / `load` / `tileerror` state
    - removes the map on unmount
- [ ] **Step 5: Run the tests and confirm they pass.** `npx tsx tests/map/places.test.ts` → `Map places tests passed`.
- [ ] **Step 6: Commit.** `git add lib/map components/map app/globals.css tests/map && git commit -m "feat(map): shared gold map kit, places data and flag pin"`

### Task 2: "Find Your Nearest Flatel" redesign

**Files:**
- Modify: `components/branch-hub.tsx` (map/card part; keep the section heading)
- Create: `lib/inventory-stats.ts`
- Test: `tests/map/inventory-stats.test.ts`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces:
  - `getTotalResidenceUnits(rooms: Array<{ totalUnits?: number }>): number`
  - `getUnitCapsByFlatType(rooms: Array<{ slug: string; totalUnits?: number }>): Record<string, number>` (also used in Task 11)

- [ ] **Step 1: Write the failing test.**

```ts
assert.equal(getTotalResidenceUnits(MOCK_ROOMS), 5);
assert.deepEqual(getUnitCapsByFlatType(MOCK_ROOMS), { "1bhk": 1, "2bhk": 1, "3bhk": 2, "4bhk": 1 });
assert.equal(getTotalResidenceUnits([{}, { totalUnits: 2 }]), 3); // missing → 1
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/map/inventory-stats.test.ts` → fails.
- [ ] **Step 3: Implement `lib/inventory-stats.ts`.** A missing `totalUnits` counts as 1.
- [ ] **Step 4: Run it and confirm it passes.**
- [ ] **Step 5: Rebuild the map area in `branch-hub.tsx`** (spec §4.6).
  - **Layout**:
    - Desktop: a ~320px branch list on the left (thumbnail from `heroImage`, name + area, "from ₹X / night" from the existing inventory fetch, **Directions** + **Explore Flats**). The map is on the right.
    - Mobile: map on top, then a horizontal snap row of branch cards.
  - **Map behaviour**:
    - Map via `useLeafletMap` + `GOLD_TILE_LAYER`.
    - On load: `fitBounds` over `BRANCH_PINS` with padding.
    - Clicking a row/card calls `flyTo` and sets the active flag.
    - Clicking a flag opens a compact Leaflet popup (small photo slider of the branch's `defaultGallery`, name, price, two buttons) styled dark/gold.
  - **Delete**:
    - the big overlay card
    - the green "Active & Accepting Guests" badge
    - the monospace pin label
    - `BRANCHES_MAP_DATA` coordinates (use `BRANCH_PINS`)
  - **Filters**: two chips, **Hospitals** and **Heritage & Shopping**, both off by default. They toggle `MAP_PLACES` layers. Each marker tooltip shows `name` + `≈{km} km from {nearest branch}`.
  - **Stat tile**: "Residences" = `getTotalResidenceUnits(rooms)`.
  - Keep the tile-error banner.
  - Arabic: names via `nameAr` / existing branch translations; the list sits on the right in RTL.
- [ ] **Step 6: Check in the browser.**
  - Home at 1280px and 375px, EN and AR: both pins visible on load, gold roads.
  - Popup text not truncated, price inside the card.
  - Filters toggle the markers.
  - Then block `basemaps.cartocdn.com` (DevTools request blocking): the banner shows and the list buttons still work.
  - Screenshot each state.
- [ ] **Step 7: Commit.** `git add components/branch-hub.tsx lib/inventory-stats.ts tests/map && git commit -m "feat(home): Danube-style branch map with gold tiles, flag pins and place filters"`

### Task 3: Flat page "What's nearby" map

**Files:**
- Create: `components/rooms/nearby-map.tsx`
- Modify: `components/rooms/room-detail-view.tsx:513-551` (Location section)

**Interfaces:**
- Consumes: `useLeafletMap`, `GOLD_TILE_LAYER`, `buildFlagPinHtml`, `BRANCH_PINS`.
- Produces: `<NearbyMap branchSlug: string; googleMapsUrl?: string />`

- [ ] **Step 1: Build `NearbyMap`.**
  - Map uses `lazy: true` and `scrollWheelZoomOnClick: true`.
  - Centred on the branch pin at zoom ~15, with an active flag.
  - "Open in Google Maps" link overlaid bottom-start.
  - Height 320px desktop / 240px mobile.
- [ ] **Step 2: Restructure the Location section** (per `ref-oyo-nearby.jpg`).
  - Heading: "What's nearby" / Arabic equivalent.
  - `lg:` grid with the landmark list (existing `landmarks`, single column) on the left and `NearbyMap` on the right. Mobile stacks the map under the list.
  - The policies section stays directly after.
- [ ] **Step 3: Check in the browser.**
  - `/properties/3bhk` and `/ar/properties/3bhk`, 1280px and 375px.
  - The map loads only when scrolled near (Network panel shows no tile requests on first paint).
  - The page scroll isn't captured by the map before a click.
- [ ] **Step 4: Commit.** `git commit -am "feat(flat): embedded gold map in What's nearby"` (plus `git add` for the new file).

### Task 4: Shared auto-playing photo carousel

**Files:**
- Create: `lib/carousel/autoplay.ts`, `components/media/photo-carousel.tsx`
- Modify: `components/rooms/room-gallery.tsx` (becomes a thin wrapper or is replaced at its call site `room-detail-view.tsx:361`), `components/branches/branch-detail-view.tsx:292-410` (hero gallery) and its lightbox `:1110-1160` if superseded
- Test: `tests/carousel/autoplay.test.ts`

**Interfaces:**
- Produces:
  - `interface AutoplayState { count: number; hovered: boolean; focused: boolean; userInteracted: boolean; inView: boolean; pageVisible: boolean; reducedMotion: boolean }`
  - `shouldAutoplay(s: AutoplayState): boolean`
  - `nextIndex(current: number, count: number, step: 1 | -1): number`: wraps; the caller passes `step` already mirrored for RTL by the button/swipe mapping.
  - `swipeStep(deltaX: number, dir: "ltr" | "rtl", threshold?: number): 0 | 1 | -1`: default threshold 40.
  - `AUTOPLAY_INTERVAL_MS = 5000`
  - `<PhotoCarousel images: Array<{ url: string; alt: string; category?: string }>; title: string; className?: string />`

- [ ] **Step 1: Write the failing test.**

```ts
const base = { count: 5, hovered: false, focused: false, userInteracted: false, inView: true, pageVisible: true, reducedMotion: false };
assert.equal(shouldAutoplay(base), true);
for (const k of ["hovered", "focused", "userInteracted", "reducedMotion"] as const) assert.equal(shouldAutoplay({ ...base, [k]: true }), false, k);
assert.equal(shouldAutoplay({ ...base, inView: false }), false);
assert.equal(shouldAutoplay({ ...base, pageVisible: false }), false);
assert.equal(shouldAutoplay({ ...base, count: 1 }), false);
assert.equal(shouldAutoplay({ ...base, count: 0 }), false);
assert.equal(nextIndex(4, 5, 1), 0); assert.equal(nextIndex(0, 5, -1), 4);
assert.equal(swipeStep(-60, "ltr"), 1); assert.equal(swipeStep(-60, "rtl"), -1);
assert.equal(swipeStep(60, "ltr"), -1); assert.equal(swipeStep(10, "ltr"), 0);
assert.equal(AUTOPLAY_INTERVAL_MS, 5000);
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/carousel/autoplay.test.ts`
- [ ] **Step 3: Implement `lib/carousel/autoplay.ts`.**
- [ ] **Step 4: Run it and confirm it passes.**
- [ ] **Step 5: Build `PhotoCarousel`** (spec §4.1).
  - **Size and look**: full width, `h-[380px] md:h-[440px]` desktop, `aspect-[16/10]` mobile, rounded with a gold hairline border.
  - **Controls**: arrows, dots, a desktop thumbnail strip, an `n / total` counter, and a "View all photos" pill.
  - **Lightbox**: clicking a slide opens it at that index (Esc / arrow keys).
  - **Loading**: the first image `priority`, the rest lazy.
  - **Autoplay**: the timer runs only while `shouldAutoplay(...)` is true.
    - `inView` via `IntersectionObserver`
    - `pageVisible` via `visibilitychange`
    - `reducedMotion` via `matchMedia`
    - `userInteracted` set on touch/swipe/arrow click and kept for that visit
  - **Accessibility**: `aria-roledescription="carousel"`, each slide labelled. Arrow icons mirror in RTL.
  - **Fallback**: keep `room-gallery.tsx`'s 5-image fallback when fewer than 4 images are passed, but a genuinely single image still hides the controls.
- [ ] **Step 6: Use it on both pages.** Flat page replaces the `RoomGallery` collage. Branch page replaces the hero gallery (`galleryPhotos` mapped to `{ url: src, alt: title, category }`).
- [ ] **Step 7: Check in the browser.**
  - Both pages, EN and AR, 1280px and 375px.
  - It advances every ~5s, pauses on hover, stops after a swipe.
  - With DevTools "Emulate prefers-reduced-motion" it does not advance.
- [ ] **Step 8: Commit.** `git add … && git commit -m "feat(gallery): shared auto-playing photo carousel on flat and branch pages"`

### Task 5: Purpose-first amenities

**Files:**
- Create: `lib/purpose/purpose-services.ts`, `components/rooms/purpose-services.tsx`
- Modify: `components/rooms/room-detail-view.tsx:457-509` (amenities section)
- Test: `tests/purpose/purpose-services.test.ts`

**Interfaces:**
- Consumes: `PURPOSE_PACKAGES` (`lib/mock-rooms.ts`), `STAY_PURPOSES` (`lib/constants.ts`).
- Produces:
  - `PURPOSE_IDS = ["medical", "wedding", "family", "tourism", "corporate"] as const`
  - `type PurposeId = typeof PURPOSE_IDS[number]`
  - `isPurposeId(v: string | null | undefined): v is PurposeId`
  - `getPurposeServices(id: PurposeId): { free: ComplimentaryService[]; paid: FacilityAddon[] }`
  - `getPurposeLabel(id: PurposeId | "accommodation_only", locale: "en" | "ar"): string`: moved out of `booking-sidebar.tsx:187-222`. The sidebar imports it from here.
  - `<PurposeServices selectedPurposeId: string | null; selectedAddonIds: string[]; onSelectPurpose(id: string): void; onToggleAddon(id: string): void />`. The root element has `id="purpose-services"`; the paid list has `id="purpose-addons"`. Task 6 scrolls to these anchors.

- [ ] **Step 1: Write the failing test.**

```ts
assert.deepEqual([...PURPOSE_IDS], ["medical", "wedding", "family", "tourism", "corporate"]);
assert.ok(isPurposeId("wedding")); assert.ok(!isPurposeId("accommodation_only")); assert.ok(!isPurposeId(null));
for (const id of PURPOSE_IDS) {
  const { free, paid } = getPurposeServices(id);
  const pkg = PURPOSE_PACKAGES.find(p => p.id === id)!;
  assert.deepEqual(free, pkg.complimentaryServices); assert.deepEqual(paid, pkg.paidAddons);
}
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/purpose/purpose-services.test.ts`
- [ ] **Step 3: Implement it. Run it and confirm it passes.**
- [ ] **Step 4: Build `PurposeServices`** (spec §4.3).
  - Heading "What brings you to Hyderabad?" plus 6 chips: the 5 purposes plus "Just the stay" = `accommodation_only`.
  - **When a purpose is selected**:
    - "Free with your {purpose} stay": the `free` list with disclaimers.
    - "Add-on services": the `paid` list with prices ("On quote" when `price === null`) and add/remove toggles calling `onToggleAddon`.
  - **No purpose selected** (or `accommodation_only`): show only the chips.
  - Arabic labels: reuse the purpose labels already in `booking-sidebar.tsx:187-222` (move them into `lib/purpose/purpose-services.ts` as `getPurposeLabel(id, locale)` so the sidebar and this component share them).
- [ ] **Step 5: Wire it into `room-detail-view.tsx`.**
  - Section order: `PurposeServices` first, then the existing "Included with your flat" grid.
  - Pass the existing `selectedPurposeId`, `selectedAddonIds`, `setSelectedPurposeId`, `handleToggleAddon`, so it is one shared state with the booking panel.
- [ ] **Step 6: Check in the browser.**
  - Picking a chip updates the panel's purpose dropdown and vice versa.
  - Toggling an add-on changes the panel price.
  - `?purpose=wedding` pre-selects Wedding.
  - EN and AR.
- [ ] **Step 7: Commit.** `git add … && git commit -m "feat(flat): purpose-first services in amenities section"`

### Task 6: Sticky booking panel + add-on summary line

**Files:**
- Create: `lib/booking/addon-summary.ts`
- Modify: `components/rooms/booking-sidebar.tsx:643-700` (desktop add-on list) and `:1108-1140` (mobile sheet add-on list); `components/rooms/room-detail-view.tsx:641` (sticky wrapper)
- Test: `tests/booking/addon-summary.test.ts`

**Interfaces:**
- Consumes: `FacilityAddon` (`lib/mock-rooms.ts`), the existing pricing used by the sidebar for add-on totals (reuse; don't re-implement pricing rules).
- Produces: `buildAddonSummary(input: { selected: FacilityAddon[]; addonsTotal: number; locale: "en" | "ar" }): { label: string; hasSelection: boolean }`

- [ ] **Step 1: Write the failing test.**

```ts
const a = { id: "a", name: "A", price: 500 } as FacilityAddon, b = { id: "b", name: "B", price: null } as FacilityAddon;
assert.deepEqual(buildAddonSummary({ selected: [], addonsTotal: 0, locale: "en" }), { label: "Add services for your stay →", hasSelection: false });
assert.equal(buildAddonSummary({ selected: [a], addonsTotal: 500, locale: "en" }).label, "1 add-on · ₹500 · Edit");
assert.equal(buildAddonSummary({ selected: [a, b], addonsTotal: 500, locale: "en" }).label, "2 add-ons · ₹500 + on quote · Edit");
assert.ok(buildAddonSummary({ selected: [a], addonsTotal: 500, locale: "ar" }).label.length > 0);
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/booking/addon-summary.test.ts`
- [ ] **Step 3: Implement it.** The amount is formatted with `toLocaleString("en-IN")`; Arabic uses the dictionary tone. Run it and confirm it passes.
- [ ] **Step 4: Replace the add-on toggle lists** in both the desktop panel and the mobile sheet with one summary button.
  - The click scrolls to `#purpose-addons`. With no purpose selected, it scrolls to `#purpose-services`. On mobile it closes the sheet first.
  - Keep the purpose dropdown, dates, guests, the price breakdown and the pay button.
- [ ] **Step 5: Make the panel stick.**
  - Confirm in the browser why it doesn't stick today (panel height vs. ancestor overflow; see spec §3).
  - With the shorter panel it should stick via the existing `lg:sticky lg:top-28`.
  - Fallback for short screens: `lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto` on the panel wrapper.
  - If an ancestor overflow is the cause, change it to `clip`, and recheck horizontal scroll at 320 / 768 / 1440px.
- [ ] **Step 6: Check in the browser.**
  - At 1280×900 and **1280×768**: the panel stays in view while scrolling the left column to the end of the grid, and every control is reachable.
  - On mobile the bottom bar is unchanged.
  - EN and AR.
- [ ] **Step 7: Commit.** `git add … && git commit -m "feat(flat): sticky booking panel with add-on summary line"`

### Task 7: Floating WhatsApp + Call buttons

**Files:**
- Create: `lib/floating-contact.ts`, `components/floating-contact.tsx`
- Modify: `app/layout.tsx` (mount once inside `<AuthProvider>`); `components/rooms/booking-sidebar.tsx:911` and `components/branches/branch-detail-view.tsx:1082` (sticky bars set `--floating-offset`)
- Test: `tests/floating/floating-contact.test.ts`

**Interfaces:**
- Produces:
  - `shouldShowFloatingContact(pathname: string): boolean`: false for `/admin…`, `/checkout`, `/ar/checkout`.
  - `floatingSide(locale: "en" | "ar"): "right" | "left"`
  - `buildWhatsAppGreeting(opts: { locale: "en" | "ar"; flatTitle?: string }): string`
  - `<FloatingContact />`: reads the pathname. Gets the flat title from `document.querySelector("[data-flat-title]")` set on the flat page `<h1>`, so it is decoupled.

- [ ] **Step 1: Write the failing test.**

```ts
for (const p of ["/", "/ar", "/properties/2bhk", "/ar/stays/medical", "/about"]) assert.equal(shouldShowFloatingContact(p), true, p);
for (const p of ["/admin", "/admin/bookings", "/checkout", "/ar/checkout"]) assert.equal(shouldShowFloatingContact(p), false, p);
assert.equal(floatingSide("en"), "right"); assert.equal(floatingSide("ar"), "left");
assert.match(buildWhatsAppGreeting({ locale: "en", flatTitle: "2 BHK Premium" }), /2 BHK Premium/);
assert.ok(buildWhatsAppGreeting({ locale: "en" }).length > 0);
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/floating/floating-contact.test.ts`
- [ ] **Step 3: Implement it. Run it and confirm it passes.**
- [ ] **Step 4: Build `FloatingContact`.**
  - **Placement**: fixed, `bottom: calc(1rem + var(--floating-offset, 0px))`, side from `floatingSide`, z-index below modals (`z-30`). Stack order: WhatsApp on top, Call below.
  - **Look**: 48px round, `#16100B` with a gold ring and gold icon. Reuse the `WhatsAppIcon` SVG from `components/site-footer.tsx:27` (export it).
  - **Links**: WhatsApp → `WHATSAPP_CONFIG.getUrl(buildWhatsAppGreeting(...))`, `target="_blank" rel="noopener noreferrer"`. Call → `tel:${CONTACT_PHONE}`.
  - **Labels**: `aria-label` "Chat on WhatsApp" / "Call Flatel" (Arabic equivalents).
  - **Hide** while `document.body.style.overflow === "hidden"` (lightbox/modals lock scroll; observe via `MutationObserver` on `body[style]`).
  - **Mobile sticky bars** set `--floating-offset` on `document.documentElement` to their height while mounted on `<lg`, and reset it on unmount.
- [ ] **Step 5: Check in the browser.**
  - Home, flat page and branch page at 375px: the buttons sit above the Book bar, not covering it.
  - `/ar`: buttons on the left.
  - `/checkout` and `/admin`: no buttons.
  - Opening the lightbox hides them.
- [ ] **Step 6: Commit.** `git add … && git commit -m "feat(site): floating WhatsApp and call buttons"`

### Task 8: Starlight effect

**Files:**
- Create: `lib/starlight/generate-stars.ts`, `components/effects/starlight.tsx`
- Modify: `components/hero-section.tsx` (behind the heading/search, under the photo overlay), `components/site-footer.tsx` (footer background)
- Test: `tests/starlight/generate-stars.test.ts`

**Interfaces:**
- Produces:
  - `interface Star { x: number; y: number; r: number; color: string; baseAlpha: number; twinkleSpeed: number; phase: number; flare: boolean }`. `x` and `y` are fractions 0–1.
  - `STAR_COLORS = ["#FFF8EC", "#FAF4EB", "#F3E2BD", "#E5C178"]`
  - `generateStars(opts: { seed: number; count: number }): Star[]`: deterministic (seeded PRNG such as mulberry32).
  - `<Starlight className?: string; density?: number />`: default `density` 130. An absolute-fill `<canvas aria-hidden>`, `pointer-events-none`.

- [ ] **Step 1: Write the failing test.**

```ts
const s1 = generateStars({ seed: 7, count: 130 }), s2 = generateStars({ seed: 7, count: 130 });
assert.deepEqual(s1, s2); assert.equal(s1.length, 130);
assert.ok(s1.every(s => s.x >= 0 && s.x <= 1 && s.y >= 0 && s.y <= 1 && STAR_COLORS.includes(s.color)));
const flares = s1.filter(s => s.flare).length; assert.ok(flares >= 3 && flares <= 10);
assert.ok(s1.every(s => s.baseAlpha <= 0.85 && s.r <= 2.2));
assert.notDeepEqual(generateStars({ seed: 8, count: 130 }), s1);
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/starlight/generate-stars.test.ts`
- [ ] **Step 3: Implement the generator. Run it and confirm it passes.**
- [ ] **Step 4: Build `Starlight`.**
  - Canvas sized to its parent (`ResizeObserver`, devicePixelRatio aware).
  - **Twinkle**: slow, alpha oscillating ±30% over 4–9s per star. Flares draw a 4-point glint.
  - **Rendering**: draws only after mount (server render = empty), with a fixed seed per instance so it doesn't jump.
  - **Pausing**: the rAF loop pauses when off-screen (`IntersectionObserver`) or the tab is hidden.
  - **Reduced motion**: draws one static frame.
  - **Opacity**: layer opacity ≤ 0.7 so text contrast is unchanged.
- [ ] **Step 5: Mount it in the hero and the footer.** (The About block mounts it in Task 9.) Check text contrast over it.
- [ ] **Step 6: Check in the browser.**
  - Home hero and footer, EN and AR, desktop and mobile.
  - Reduced-motion → static.
  - CPU idle when scrolled away (Performance panel: no rAF while off-screen).
- [ ] **Step 7: Commit.** `git add … && git commit -m "feat(design): starlight night-sky layer in hero and footer"`

### Task 9: Mission & Vision, Founder, homepage strip

**Files:**
- Create: `lib/about-content.ts`, `components/about/mission-vision.tsx`, `components/about/founder-card.tsx`, `components/home/founder-strip.tsx`
- Modify: `app/about/page.tsx`, `app/ar/about/page.tsx` (insert after the founding-story section, before the 5-pillar pledge); `app/page.tsx`, `app/ar/page.tsx` (strip before `<FaqSection />`)
- Test: `tests/about/about-content.test.ts`

**Interfaces:**
- Consumes: `<Starlight />` (Task 8), `CONTACT_PHONE`.
- Produces:
  - `getAboutContent(locale: "en" | "ar"): { pill; headlineLead; headlineAccent; mission; visionLabel; vision; values: Array<{ title; body }>; founder: { eyebrow; name; role; bio; email }; companyLine; companySub; strip: { mission; cta } }`
  - `FOUNDER_PHOTO: string | null`: `null` until the client sends the photo, so the founder card renders the gold-ring "F" monogram.

- [ ] **Step 1: Write the failing test.** It pins the spec §4.7 copy exactly:

```ts
const en = getAboutContent("en");
assert.equal(en.headlineLead, "A stay experience"); assert.equal(en.headlineAccent, "redefined.");
assert.ok(en.mission.startsWith("Our mission at Flatel is to build Hyderabad's most trusted network of 1,000 premium furnished flats"));
assert.equal(en.vision, "Our vision is to redefine the stay experience by combining comfort, convenience, care, and trusted service under one premium brand.");
assert.deepEqual(en.values.map(v => v.title), ["Guest-first hospitality", "Curated comfort", "Trusted service"]);
assert.equal(en.founder.name, "Osama"); assert.equal(en.founder.role, "Founder & Managing Director");
assert.equal(en.companyLine, "Flatel Hospitality Private Limited");
const ar = getAboutContent("ar");
assert.equal(ar.values.length, 3); assert.ok(ar.mission.length > 0 && /[؀-ۿ]/.test(ar.mission));
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/about/about-content.test.ts`
- [ ] **Step 3: Implement `lib/about-content.ts`.**
  - English copy is verbatim from spec §4.7.
  - Arabic follows the dictionary tone.
  - `founder.email = "hello@flatel.in"` (pending client confirmation; listed in the handover).
  - Run the test and confirm it passes.
- [ ] **Step 4: Build the components** (per `ref-mission-vision.jpg` and `ref-founder.jpg`).
  - **MissionVision**: centred, with a `<Starlight />` background, a pill, a serif headline with a gold italic accent, the mission paragraph, the "VISION" divider, the italic vision quote, and 3 value cards with gold-outline icons.
  - **FounderCard**: photo or monogram in a gold ring, eyebrow, name, role, bio, a phone button (`tel:`) and an email button (`mailto:`), then the company lines.
  - **FounderStrip**: one row with the mission line, small photo/monogram + name/role, and a "Read our story →" link to `/about` or `/ar/about`.
- [ ] **Step 5: Mount them in the four pages.**
- [ ] **Step 6: Check in the browser.** `/about`, `/ar/about`, `/`, `/ar` at 1280px and 375px; compare against the reference screenshots.
- [ ] **Step 7: Commit.** `git add … && git commit -m "feat(about): mission & vision, founder card and homepage strip"`

### Task 10: Purpose pages + 5 purpose cards

**Files:**
- Create: `lib/purpose/purpose-pages.ts`, `components/purpose/purpose-page-view.tsx`, `app/stays/[purpose]/page.tsx`, `app/ar/stays/[purpose]/page.tsx`
- Modify: `components/hero-featured-cards.tsx` (5 cards, new hrefs, layout)
- Test: `tests/purpose/purpose-pages.test.ts`

**Interfaces:**
- Consumes: `PURPOSE_IDS`, `isPurposeId`, `getPurposeServices`, `getPurposeLabel` (Task 5); `MOCK_ROOMS` / `InventoryService` for flats; `HOSPITALS_DATA`, `TOURISM_CIRCUITS`, `WEDDING_SERVICES`.
- Produces:
  - `getPurposePage(id: PurposeId, locale: "en" | "ar"): { title; tagline; description; points: string[]; heroImage: string; seo: { title; description }; faq: Array<{ q; a }>; extraBlock: "hospitals" | "heritage" | "wedding" | "family" | "corporate" }`
  - `recommendFlats<T extends { slug: string; maxAdults: number }>(id: PurposeId, rooms: T[]): T[]`
  - `weddingServicesExcludingPaid(services: WeddingServiceItem[], paid: FacilityAddon[]): WeddingServiceItem[]`: drops items whose normalized `title` matches a paid add-on `name` (case-insensitive, punctuation stripped, either contains the other). Note: `WeddingServiceItem` uses `title`, not `name`.
  - `purposeHref(id: PurposeId, locale: "en" | "ar"): string`

- [ ] **Step 1: Write the failing test.**

```ts
for (const id of PURPOSE_IDS) for (const l of ["en", "ar"] as const) {
  const p = getPurposePage(id, l);
  assert.ok(p.title && p.seo.title && p.seo.description && p.faq.length >= 3 && p.faq.length <= 5, `${id}/${l}`);
}
assert.equal(purposeHref("medical", "en"), "/stays/medical"); assert.equal(purposeHref("wedding", "ar"), "/ar/stays/wedding");
const rooms = [{ slug: "1bhk", maxAdults: 2 }, { slug: "4bhk", maxAdults: 8 }, { slug: "2bhk", maxAdults: 4 }];
assert.deepEqual(recommendFlats("wedding", rooms).map(r => r.slug), ["4bhk", "2bhk", "1bhk"]);
assert.deepEqual(recommendFlats("family", rooms).map(r => r.slug), ["4bhk", "2bhk", "1bhk"]);
assert.deepEqual(recommendFlats("medical", rooms).map(r => r.slug), ["1bhk", "4bhk", "2bhk"]); // default order
const paid = getPurposeServices("wedding").paid;
const kept = weddingServicesExcludingPaid(WEDDING_SERVICES, paid);
assert.ok(kept.length < WEDDING_SERVICES.length);
assert.ok(kept.every(s => !paid.some(p => p.name.toLowerCase() === s.title.toLowerCase())));
assert.equal(getPurposePage("medical", "en").extraBlock, "hospitals");
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/purpose/purpose-pages.test.ts`
- [ ] **Step 3: Implement `lib/purpose/purpose-pages.ts`.**
  - Title, tagline and description come from `STAY_PURPOSES`.
  - Hero images: medical → `/images/purposes/purpose-medistay.jpg`, wedding → `purpose-wedding.jpg`, family → `purpose-family.jpg`, tourism → `purpose-wanderer.jpg`, corporate → `purpose-corporate.jpg`.
  - FAQ answers only restate facts already in the services data and `BOOKING_POLICY`.
  - Run the test and confirm it passes.
- [ ] **Step 4: Build `PurposePageView`** with spec §4.9's 7 blocks in order.
  - CTA → `/properties/{slug}?purpose={id}` (first recommended flat) and a "See all flats" link to `/properties?purpose={id}`.
  - **Extra block** per purpose:
    - hospitals: reuse `HOSPITALS_DATA` cards
    - heritage: `TOURISM_CIRCUITS`
    - wedding: `weddingServicesExcludingPaid(...)`
    - family / corporate: short feature list from `getPurposePage(...).points`
  - Close with a WhatsApp CTA.
- [ ] **Step 5: Add the routes.**
  - `generateStaticParams` returns the 5 ids.
  - `generateMetadata` uses `seo`.
  - Unknown slug → `notFound()`.
  - Each route renders `SiteHeader` + `PurposePageView` + `SiteFooter`, same shell as `app/properties/[slug]/page.tsx`.
- [ ] **Step 6: Update the hero cards.**
  - Add a Wedding card (`/images/purposes/purpose-wedding.jpg`, "Wedding & Celebrations" / Arabic).
  - `href` uses `purposeHref`, and the `handleCardClick` filter behaviour is removed.
  - Layout: `lg:grid-cols-5`; mobile is a horizontal snap row.
- [ ] **Step 7: Check in the browser.**
  - All 10 URLs (5 × EN/AR) render.
  - `/stays/unknown` → 404.
  - The CTA lands on the flat page with the purpose pre-selected (Task 5).
  - The cards at 1280px and 375px.
- [ ] **Step 8: Commit.** `git add … && git commit -m "feat(purpose): dedicated stay pages and 5 purpose cards"`

### Task 11: Hero search availability + shorter flats section

**Files:**
- Create: `lib/search/availability.ts`
- Modify: `components/featured-flats.tsx` (remove the purpose banner/chips and the `wedding→family` remap at `:98-102`; one filter row; card redesign; availability; summary bar; multi-flat note; spacing), `components/hero-section.tsx:134` (bottom padding), `components/hero/flat-occupancy-modal.tsx:23-75` (caps from `getUnitCapsByFlatType`), `components/hero/booking-search.tsx` (dispatch the selected units count in the `flatel:search` detail; expose "Edit search" re-open via a `flatel:edit-search` event), `components/rooms/room-detail-view.tsx` + `components/rooms/booking-sidebar.tsx` (honour `?pickDates=1` by opening the check-in picker on load: new prop `autoOpenCheckIn?: boolean`)
- Test: `tests/search/availability.test.ts`

**Interfaces:**
- Consumes: `getUnitCapsByFlatType` (Task 2); `GET /api/bookings/availability?unitId&checkIn&checkOut` → `{ success, available, reason }`. Call it once per visible flat card, in parallel, aborting on a new search.
- Produces:
  - `type AvailabilityStatus = "available" | "booked" | "unknown" | "loading"`
  - `sortByAvailability<T extends { slug: string }>(rooms: T[], status: Record<string, AvailabilityStatus>): T[]`: booked last, stable otherwise.
  - `buildResultsSummary(input: { availableCount: number; checkIn?: string; checkOut?: string; adults?: number; kids?: number; locale: "en" | "ar" }): string | null`: `null` when no search is active.
  - `isMultiFlatSelection(sel: { flatTypes: string[]; totalUnits: number }): boolean`

- [ ] **Step 1: Write the failing test.**

```ts
const rooms = [{ slug: "1bhk" }, { slug: "2bhk" }, { slug: "3bhk" }];
assert.deepEqual(sortByAvailability(rooms, { "1bhk": "booked", "2bhk": "available", "3bhk": "unknown" }).map(r => r.slug), ["2bhk", "3bhk", "1bhk"]);
assert.deepEqual(sortByAvailability(rooms, {}).map(r => r.slug), ["1bhk", "2bhk", "3bhk"]);
assert.equal(buildResultsSummary({ availableCount: 3, checkIn: "2026-11-23", checkOut: "2026-11-26", adults: 2, locale: "en" }), "3 flats available · 23–26 Nov · 2 guests");
assert.equal(buildResultsSummary({ availableCount: 0, locale: "en" }), null);
assert.equal(isMultiFlatSelection({ flatTypes: ["1bhk"], totalUnits: 1 }), false);
assert.equal(isMultiFlatSelection({ flatTypes: ["1bhk", "2bhk"], totalUnits: 2 }), true);
assert.equal(isMultiFlatSelection({ flatTypes: ["3bhk"], totalUnits: 2 }), true);
```

- [ ] **Step 2: Run it and confirm it fails.** `npx tsx tests/search/availability.test.ts`
- [ ] **Step 3: Implement it.** Month formatting via `date-fns` `format`; cross-month ranges render "30 Nov – 2 Dec". Run the test and confirm it passes.
- [ ] **Step 4: Availability in `featured-flats.tsx`.**
  - When `searchDates.checkIn/checkOut` are set, fetch the status per card.
  - **Badges**:
    - "Available" (gold)
    - "Booked for these dates": card greyed, button disabled
    - "Checking…" while loading
    - `unknown`: no badge, card stays bookable (Review Focus 4)
  - Sort with `sortByAvailability`.
  - Before the flats can be tested against `/api/bookings/availability`, confirm in `lib/booking-service.ts` that `checkAvailability(slug, …)` accounts for multiple units of one type ("available = at least one unit free", spec §4.10). If it doesn't, report it rather than changing booking logic.
- [ ] **Step 5: The section itself** (spec §4.10–4.11).
  - **Remove**: the purpose banner, the purpose chips, `activePurpose` in links, and the `flatel:set-purpose` listener.
  - **Filters**: one row (branch tabs + flat-type chips), `flex-nowrap overflow-x-auto` on mobile.
  - **Card**:
    - the whole card is a link
    - photo, name, guests/beds, "from ₹X / night"
    - one "View & Book" button → `/properties/{slug}` with dates/guests; without dates it appends `pickDates=1`
    - delete the instant-book-to-checkout button
  - **Summary bar** from `buildResultsSummary` + "Edit search" (scrolls to the hero, dispatches `flatel:edit-search`).
  - **Multi-flat note** when `isMultiFlatSelection(...)` is true: "Booking multiple flats? Book them one by one, or WhatsApp us and we'll hold them together." with the WhatsApp link.
  - **Spacing**: reduce the hero cards' `pb-12 sm:pb-16` and the section's `py-14 sm:py-18 lg:py-20` / heading `mb-8 sm:mb-10` so the gap between the purpose cards and the "Serviced Flats" heading is 80–96px on desktop.
- [ ] **Step 6: Occupancy modal caps from inventory.** Replace the hard-coded `availableUnits` with `getUnitCapsByFlatType(MOCK_ROOMS)` (2 BHK cap becomes 1).
- [ ] **Step 7: `pickDates=1`.** `room-detail-view.tsx` reads it next to `checkIn` (`:94-98`) and passes `autoOpenCheckIn` to `BookingSidebar`. The sidebar opens the check-in picker once on mount (desktop) or the mobile sheet with the picker (mobile).
- [ ] **Step 8: Check in the browser.**
  - Search with dates → badges + summary bar.
  - Block `/api/bookings/availability` → cards stay bookable, no "Booked" label.
  - Pick 2× 3 BHK → note shown.
  - No-dates "View & Book" → the flat page opens with the date picker open.
  - Measure the gap with a screenshot before and after (desktop + 375px).
  - EN and AR.
- [ ] **Step 9: Commit.** `git add … && git commit -m "feat(home): availability-aware search results and compact flats section"`

### Task 12: Final verification and handover

**Files:**
- Create: `docs/superpowers/specs/assets/2026-10-28/HANDOVER.md`

- [ ] **Step 1: Run every test.** `for f in tests/**/*.test.ts; do npx tsx "$f" || exit 1; done` → every suite prints its "passed" line, including the 5 existing `tests/i18n` suites.
- [ ] **Step 2: Lint and build.** `npm run lint` → 0 errors. `npm run build` → succeeds, and the route list includes `/stays/[purpose]` and `/ar/stays/[purpose]`.
- [ ] **Step 3: Sweep in the browser.**
  - At 320 / 375 / 768 / 1280 / 1440px, EN and AR, on home, flat page, branch page, about, one purpose page: no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`).
  - Reduced-motion: carousel and starlight static.
  - Screenshots saved alongside the handover.
- [ ] **Step 4: Write `HANDOVER.md`.**
  - the `MAP_PLACES` table (name, coordinates, source) marked "client to verify"
  - the missing founder photo (`FOUNDER_PHOTO = null`)
  - email `hello@flatel.in` to confirm
  - founder-card phone uses 79891 00711 (the screenshot shows 93464 13282), to confirm
  - Phase 2 items: membership, multi-flat booking
- [ ] **Step 5: Update the graph.** `graphify update .`
- [ ] **Step 6: Commit.** `git add docs && git commit -m "docs: handover notes for flat page, maps and purpose pages batch"`
