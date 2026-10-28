# Bilingual (English & Arabic) Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Flatel Hospitality platform into a full-featured bilingual website supporting English (default LTR) and Arabic (path-prefixed `/ar`, full RTL mirroring, Arabic luxury typography, localized content, and Arabic PDF vouchers) with an Emaar-inspired header dropdown switcher.

**Architecture:** A modular dictionary-driven i18n architecture without heavy third-party bloat. English remains on clean default routes (`/`, `/properties`), while Arabic is served via `/ar/...` with `dir="rtl"` and `lang="ar"`. Page components are shared via localized wrappers to prevent code duplication, and an Emaar-style language selector handles seamless, context-preserving switching between matching routes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (with RTL logical properties and variants), `next/font/google` (Cairo / Tajawal for Arabic), jsPDF with Arabic TTF font & bidi support.

**Spec:** [`docs/superpowers/specs/2026-10-27-bilingual-en-ar-website-design.md`](file:///c:/Users/Mohd%20Azimullah/Downloads/hotel-main/hotel-main/docs/superpowers/specs/2026-10-27-bilingual-en-ar-website-design.md)

## Global Constraints
- Next.js 16 Compatibility: In Next.js 16, `params` and `searchParams` are Promises and MUST be awaited before reading.
- Owner Admin Portal (`/admin/*`): Strictly remains in simple English as agreed.
- Booking & Payment Security: Razorpay integration, Supabase booking transactions, and pricing amounts (INR ₹) must remain completely stable without regressions.
- Strict TypeScript: No `any` types; all dictionary keys and localized mapper structures must be strictly typed.
- Zero Artificial AI Copy: Arabic translations must be natural, respectful, and idiomatic for luxury hospitality.

## Review Focus
1. **Context-Preserving Route Switching**: Switching language on deeply nested routes (e.g. `/properties/barkas-3bhk` -> `/ar/properties/barkas-3bhk`) must preserve all path segments and query parameters instead of dropping the user on the home page.
2. **RTL Directional Inversion**: Back buttons, breadcrumb chevrons, and pagination arrows must flip direction in RTL, while non-directional media icons (phone, email, calendar) must remain standard.
3. **Arabic PDF Voucher Shaping**: Arabic script in the PDF must render connected cursive ligatures with correct bidirectional character order without producing disjointed or inverted letters.
4. **Hydration & SSR Consistency**: `<html>` tag attributes `dir` and `lang` must match between server and client without causing Next.js hydration mismatch errors.
5. **Mobile Drawer Language Selector**: The Emaar-style language switch must be readily accessible on mobile screens inside the navigation drawer without horizontal overflow.

---

### Task 1: Core i18n Types, Dictionary Architecture & Arabic Font Setup

**Files:**
- Create: `lib/i18n/types.ts`
- Create: `lib/i18n/dictionaries/en.ts`
- Create: `lib/i18n/dictionaries/ar.ts`
- Create: `lib/i18n/index.ts`
- Modify: `app/layout.tsx:1-55`
- Test: `tests/i18n/dictionaries.test.ts`

**Interfaces:**
- Consumes: Existing navigation constants from `lib/constants.ts`
- Produces:
  - `type Locale = 'en' | 'ar'`
  - `type Dictionary = typeof enDictionary`
  - `getDictionary(locale: Locale): Dictionary`
  - `getLocaleFromPath(pathname: string): Locale`
  - Google Font `Cairo` integrated into root CSS variables (`--font-arabic`).

- [ ] **Step 1: Write the failing dictionary test**
Create `tests/i18n/dictionaries.test.ts` to assert that all top-level and nested dictionary keys in `ar.ts` exactly match `en.ts`, and `getDictionary` returns the expected dictionary for `'en'` and `'ar'`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/i18n/dictionaries.test.ts` (or standard runner).
Expected: FAIL with missing module `lib/i18n/index`.

- [ ] **Step 3: Implement `types.ts`, `en.ts`, `ar.ts`, and `index.ts`**
Define complete type definitions and translate all core UI namespaces (`common`, `nav`, `home`, `properties`, `rooms`, `hospitals`, `about`, `policies`, `myBookings`, `listProperty`, `checkout`, `confirmation`, `auth`).

- [ ] **Step 4: Update `app/layout.tsx` for Arabic Google Font & Dynamic Lang/Dir**
Add `Cairo` font from `next/font/google` with `variable: "--font-arabic"`, subsets `["arabic", "latin"]`. Support dynamic `lang` and `dir` attributes based on active route.

- [ ] **Step 5: Run test to verify it passes**
Run: `npx tsx tests/i18n/dictionaries.test.ts`
Expected: PASS with 100% key parity between English and Arabic.

- [ ] **Step 6: Commit**
```bash
git add lib/i18n/ app/layout.tsx tests/i18n/
git commit -m "feat(i18n): initialize dictionary architecture, arabic font and types"
```

---

### Task 2: Emaar-Style Header Language Switcher & Navigation Localizer

**Files:**
- Create: `components/ui/language-switcher.tsx`
- Modify: `components/site-header.tsx`
- Modify: `components/site-footer.tsx`
- Test: `tests/i18n/language-switcher.test.ts`

**Interfaces:**
- Consumes:
  - `Locale`, `getDictionary` from `lib/i18n/index`
  - `usePathname`, `useRouter` from `next/navigation`
- Produces:
  - `<LanguageSwitcher currentLocale={locale} />` rendering the Emaar-style dropdown with `EN | English` and `العربية | Arabic`, check indicators, and context-preserving URL switching.
  - Localized `SiteHeader` and `SiteFooter` displaying Arabic labels when on `/ar/*`.

- [ ] **Step 1: Write unit test for URL path switching**
Test function `getAlternatePath(currentPathname: string, targetLocale: Locale): string`
- `/properties` with `'ar'` -> `/ar/properties`
- `/ar/properties/barkas-3bhk` with `'en'` -> `/properties/barkas-3bhk`
- `/` with `'ar'` -> `/ar`
- `/ar` with `'en'` -> `/`

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/i18n/language-switcher.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `LanguageSwitcher` and update `SiteHeader` & `SiteFooter`**
Build the Emaar-style dropdown card with backdrop blur, gold accent border, keyboard navigation, and click-outside dismissal. Integrate into both desktop navigation bar and mobile drawer. Update navigation links to point to `/ar/...` when active locale is Arabic.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/i18n/language-switcher.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add components/ui/language-switcher.tsx components/site-header.tsx components/site-footer.tsx tests/i18n/
git commit -m "feat(i18n): add emaar-style language switcher and localized header/footer"
```

---

### Task 3: Localized Data Layer & Room Master Data Mapper

**Files:**
- Create: `lib/i18n/room-localizer.ts`
- Modify: `lib/mock-rooms.ts`
- Test: `tests/i18n/room-localizer.test.ts`

**Interfaces:**
- Consumes: `RoomDetail` from `lib/mock-rooms.ts`, `Locale` from `lib/i18n/types`
- Produces:
  - `getLocalizedRoom(room: RoomDetail, locale: Locale): LocalizedRoomDetail`
  - `getLocalizedRooms(rooms: RoomDetail[], locale: Locale): LocalizedRoomDetail[]`
  - Localized titles (e.g. "جناح عائلي فاخر ٣ غرف وصالة"), short descriptions, full descriptions, amenities, and room specs (guests, bedrooms, kitchens, bathrooms).

- [ ] **Step 1: Write the failing test for `room-localizer`**
Test that passing a room with `locale: 'ar'` returns Arabic title, translated specs ("ضيوف", "غرف نوم", "مطبخ"), and translated amenity descriptions.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx tsx tests/i18n/room-localizer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/i18n/room-localizer.ts`**
Create dictionary mapping for all property titles, specs, categories, and amenities, returning strongly-typed `LocalizedRoomDetail`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx tsx tests/i18n/room-localizer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/i18n/room-localizer.ts tests/i18n/room-localizer.test.ts
git commit -m "feat(i18n): implement room and inventory arabic localizer"
```

---

### Task 4: Arabic Layout, Route Structure & Core Public Pages

**Files:**
- Create: `app/ar/layout.tsx`
- Create: `app/ar/page.tsx`
- Create: `app/ar/properties/page.tsx`
- Create: `app/ar/properties/[slug]/page.tsx`
- Create: `app/ar/branches/[slug]/page.tsx`
- Create: `app/ar/hospitals/page.tsx`
- Create: `app/ar/about/page.tsx`
- Create: `app/ar/policies/page.tsx`
- Create: `app/ar/my-bookings/page.tsx`
- Create: `app/ar/list-property/page.tsx`
- Modify: Corresponding component views to support `locale` prop and RTL CSS classes.

**Interfaces:**
- Consumes: `getDictionary('ar')`, `getLocalizedRoom`, existing component views (`PropertiesCatalogView`, `HospitalDirectoryView`, etc.)
- Produces: Complete Arabic route tree under `/ar/...` rendering RTL UI with Arabic typography and localized content.

- [ ] **Step 1: Create `app/ar/layout.tsx`**
Ensure layout wraps all `/ar` children with `dir="rtl"` and passes `locale="ar"` context.

- [ ] **Step 2: Create `app/ar/page.tsx` (Arabic Home Page)**
Connect hero section, quick booking search bar, featured flats, trust highlights, and FAQ section with Arabic dictionary.

- [ ] **Step 3: Create `app/ar/properties/page.tsx` & `[slug]/page.tsx`**
Wire `PropertiesCatalogView` and property detail view with `locale="ar"`, ensuring BHK filter pills, occupancy tags, and specs grid mirror properly in RTL.

- [ ] **Step 4: Create remaining Arabic pages (`hospitals`, `about`, `policies`, `my-bookings`, `list-property`)**
Wire dictionary props and ensure back buttons / chevrons flip in RTL.

- [ ] **Step 5: Verify build & compile for all Arabic routes**
Run: `npm run build`
Expected: Successful Next.js build generating all `/ar/...` static and dynamic routes.

- [ ] **Step 6: Commit**
```bash
git add app/ar/ components/
git commit -m "feat(i18n): implement arabic route tree and public pages"
```

---

### Task 5: Arabic Booking, Checkout & Confirmation Flow

**Files:**
- Create: `app/ar/checkout/page.tsx`
- Create: `app/ar/booking-confirmation/page.tsx`
- Modify: `components/checkout/checkout-view.tsx`
- Modify: `components/confirmation/booking-confirmation-view.tsx`
- Modify: `components/hero/availability-modal.tsx`
- Modify: `components/hero/booking-search.tsx`

**Interfaces:**
- Consumes: `getDictionary('ar')`, `useAuth`, `BookingService`
- Produces: Arabic checkout review, localized guest information form, RTL date pickers, localized payment summary (20% advance / 80% check-in), and Arabic booking confirmation view.

- [ ] **Step 1: Update booking search and availability modals for Arabic**
Localize check-in/out date labels, guest count selector, branch selector, and occupancy warnings.

- [ ] **Step 2: Localize `CheckoutView` for Arabic**
Translate form inputs (Full Name, Phone Number, Email, Purpose of Stay), add-ons selection, and price breakdown table with RTL alignment.

- [ ] **Step 3: Localize `BookingConfirmationView` for Arabic**
Display booking confirmation ID, stay details, check-in instructions, and download voucher trigger in Arabic.

- [ ] **Step 4: Test booking flow in Arabic**
Run: Next.js dev server verification or automated test verifying `/ar/checkout` and `/ar/booking-confirmation` render properly in RTL.

- [ ] **Step 5: Commit**
```bash
git add app/ar/checkout/ app/ar/booking-confirmation/ components/checkout/ components/confirmation/ components/hero/
git commit -m "feat(i18n): localize booking search, checkout, and confirmation flows"
```

---

### Task 6: Arabic PDF Voucher Generation Architecture

**Files:**
- Modify: `app/api/bookings/[id]/voucher/route.ts`
- Create: `lib/pdf/arabic-voucher.ts`
- Test: `tests/pdf/arabic-voucher.test.ts`

**Interfaces:**
- Consumes: Booking details from Supabase / Mock data, `?lang=ar` query parameter.
- Produces: Fully formatted Arabic PDF voucher binary with embedded Arabic font, RTL layout, and translated booking fields.

- [ ] **Step 1: Write test for Arabic PDF endpoint parameter handling**
Verify `/api/bookings/[id]/voucher?lang=ar` returns `Content-Type: application/pdf` with Arabic metadata.

- [ ] **Step 2: Implement Arabic font loading and RTL text shaping for PDF voucher**
Embed an Arabic font (Cairo or Amiri TTF) in jsPDF or implement high-fidelity server-rendered HTML template for PDF generation that handles cursive Arabic shaping and RTL alignment without distortion.

- [ ] **Step 3: Wire Arabic voucher trigger in `BookingConfirmationView`**
Ensure download button on `/ar/booking-confirmation` calls `/api/bookings/[id]/voucher?lang=ar`.

- [ ] **Step 4: Verify generated PDF voucher**
Verify that the output PDF has valid Arabic text and proper layout.

- [ ] **Step 5: Commit**
```bash
git add app/api/bookings/[id]/voucher/ lib/pdf/ tests/pdf/
git commit -m "feat(i18n): implement arabic pdf voucher generation with font embedding"
```

---

### Task 7: Responsive RTL QA, Visual Polish & Production Build Verification

**Files:**
- Modify: Any layout or styling adjustments across `app/globals.css`, `components/` for seamless RTL rendering.

**Interfaces:**
- Consumes: All completed components and routes.
- Produces: Production-ready bilingual site with zero linting errors, zero broken layouts, and smooth Emaar-style switching.

- [ ] **Step 1: Check mobile, tablet, and desktop breakpoints in RTL**
Verify at 375px, 768px, and 1280px:
- Language switcher dropdown positioning.
- Header logo and mobile drawer RTL symmetry.
- Form field icons and chevrons properly mirrored.
- No horizontal scrolling (`overflow-x-clip` intact).

- [ ] **Step 2: Run linter and type-checker**
Run: `npm run lint` and `npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Run full production build**
Run: `npm run build`
Expected: Clean Next.js 16 build with all English and Arabic routes generated.

- [ ] **Step 4: Final commit**
```bash
git add .
git commit -m "chore(i18n): complete rtl visual polish and production verification"
```
