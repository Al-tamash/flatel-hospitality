# Design Document: Bilingual Website (English & Arabic) for Flatel Hospitality

**Date**: 2026-10-27  
**Status**: Draft for Review  
**Project**: Flatel Hospitality Website (`flatel-website`)  
**Target Languages**: English (`en`, default) & Arabic (`ar`, RTL)

---

## 1. Intent & The "Why"
Flatel Hospitality operates premium furnished service apartments in Hyderabad (Barkas Salala and Moghal Pura). Hyderabad attracts significant international visitors, medical tourists visiting major hospitals (Apollo, Care, Continental, etc.), and diaspora/travelers from Gulf nations.

Providing a first-class Arabic experience alongside English makes the platform natively accessible to Arabic-speaking guests, builds trust, and allows direct link sharing for Arabic bookings.

---

## 2. Goals, Non-Goals & Anti-Goals

### 2.1 Goals
1. **Full Guest-Facing Bilingual Experience**: Every public page, component, search filter, property detail, room specification, amenity, policy, and checkout step must be available in both English and Arabic.
2. **Emaar-Inspired Header Switcher**: A refined, luxury language dropdown in `SiteHeader` (matching the user-provided Emaar reference) with `EN / English` and `العربية / Arabic` and active check indicators.
3. **Flawless RTL (Right-to-Left) Support**: When Arabic is active, `dir="rtl"` is applied, text alignments flip naturally, navigation and chevrons/arrows mirror appropriately, and spacing/margins stay balanced.
4. **Clean URL Structure**:
   - English remains on default routes: `/`, `/properties`, `/properties/[slug]`, `/hospitals`, `/about`, `/policies`, `/branches/[slug]`, `/my-bookings`, `/list-property`, `/checkout`, `/booking-confirmation`.
   - Arabic is explicitly prefixed: `/ar`, `/ar/properties`, `/ar/properties/[slug]`, `/ar/hospitals`, `/ar/about`, `/ar/policies`, `/ar/branches/[slug]`, `/ar/my-bookings`, `/ar/list-property`, `/ar/checkout`, `/ar/booking-confirmation`.
5. **Context-Preserving Language Toggle**: Switching language on any page maintains the user's current view (e.g., viewing `/properties/barkas-3bhk` toggles directly to `/ar/properties/barkas-3bhk`).
6. **Luxury Arabic Typography**: Pair the brand's dark and gold palette (`#0E0A07`, `#E5C178`) with a high-grade Arabic web font (such as Google Fonts `Cairo` or `Tajawal`) that complements `DM Sans` and `Cormorant Garamond`.

### 2.2 Non-Goals
1. **Admin Portal Translation**: The Owner Admin Portal (`/admin/*`) is explicitly kept in simple English for internal operational use.
2. **Multi-Currency Conversion**: Currency remains INR (`₹`) as confirmed, formatted appropriately with Arabic/English locale numerals where suitable.
3. **Backend Database Schema Rewrite**: Existing database tables (bookings, rooms, etc.) remain intact. Translations will be driven through structured, type-safe dictionary files and helper mappers.

### 2.3 Anti-Goals
1. **No Robotic Machine Translation Tone**: Arabic copy must be natural, polite, hospitable, and suited to luxury hospitality ("ضيافة فلاتيل" / "شقق فندقية مفروشة").
2. **No Broken LTR Assumptions**: No hardcoded `left-0`, `pl-4`, or unidirectional arrows (`ChevronRight` hardcoded without RTL consideration) that look broken in RTL.
3. **No Heavy or Flaky Third-Party Bloat**: Keep translation infrastructure lightweight, type-safe, and compatible with Next.js 16 App Router and React 19.

---

## 3. User Experience & Visual Specifications

### 3.1 Header Language Switcher (Emaar Reference)
- Located on the right-hand action bar of `SiteHeader` (desktop) and accessible in the mobile navigation panel.
- Default trigger: Displays `EN` or `العربية` with a subtle chevron indicator.
- Dropdown panel (Floating Gold/Dark card with backdrop blur):
  - Heading: `LANGUAGE` / `اللغة` (subtle uppercase tracking).
  - Option 1: `EN  English` (with checkmark when active).
  - Option 2: `العربية  Arabic` (with checkmark when active).
- Smooth transition, accessible keyboard navigation, and click-outside dismissal.

### 3.2 RTL Layout Mirroring
- Top-level `<html>` tag dynamically receives:
  - English: `lang="en" dir="ltr"`
  - Arabic: `lang="ar" dir="rtl"`
- Logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) and `rtl:` variants ensure padding, borders, margins, and directional badges mirror properly.
- Navigation arrows (e.g. back buttons, breadcrumbs, forward chevrons) invert direction appropriately.

### 3.3 Typography Strategy
- Load `Cairo` or `Tajawal` font via `next/font/google` in `layout.tsx`.
- Assigned via CSS variable `--font-arabic`.
- Applied automatically when `lang="ar"` is active to ensure crisp, elegant Arabic letterforms without layout shifts.

---

## 4. Technical Architecture

### 4.1 Route & Middleware Structure
- **English Routes**: Handled cleanly at the root (`app/...`).
- **Arabic Routes**: Handled under `app/ar/...` (or standard Next.js App Router dynamic locale structure `app/[locale]/...` with middleware rewrite / redirect support).
  - Recommended Next.js 16 approach:
    - Root layout detects active locale from path.
    - Route handlers and page views render content using dictionary loader.
    - Arabic route group `app/ar/(routes)/...` shares re-usable page view components with localized props, avoiding duplicated UI code.

### 4.2 Translation Dictionary Architecture (`lib/i18n/`)
- Type-safe dictionary setup:
  - `lib/i18n/dictionaries/en.ts`
  - `lib/i18n/dictionaries/ar.ts`
  - `lib/i18n/types.ts`
- Structured namespaces:
  - `common`: Navbar, footer, buttons ("Book Now", "View Details", "Back"), currency labels.
  - `home`: Hero headline, subtitle, quick search bar, trust highlights, amenities overview, FAQs.
  - `properties`: Filters, branch cards, property specifications (1 BHK, 2 BHK, 3 BHK, guests, bedrooms, bathrooms).
  - `rooms`: Room details, gallery captions, detailed specifications, medical amenities, policies summary, check-in instructions.
  - `hospitals`: Nearby medical directory, distance badges, special medical concierge features.
  - `about`: Brand story, company background, hospitality ethos.
  - `policies`: Cancellation terms, check-in/out policies, payment schedules (20% advance, 80% check-in).
  - `checkout`: Guest details form, purpose of stay, add-ons selection, price breakdown, payment gateway steps.
  - `auth`: Guest sign-in/sign-up modals, OTP prompts, profile dropdown.

### 4.3 Room & Property Master Data Localizer
- `lib/mock-rooms.ts` and `lib/branch-data.ts` contain master descriptions and amenity specs.
- A dedicated helper `getLocalizedRoom(room, locale)` dynamically maps titles, short descriptions, specifications, and amenity names into Arabic when `locale === 'ar'`.

### 4.4 Arabic PDF Voucher Generation Architecture
- When a voucher is downloaded from an Arabic booking session or via `/api/bookings/[id]/voucher?lang=ar`:
  - The voucher endpoint must render an authentic Arabic PDF document.
  - Standard `jspdf` Helvetica font does not support Arabic characters. The PDF generator will embed an Arabic TTF font (e.g. Cairo or Amiri) with proper bidirectional (bidi) text processing and Arabic character reshaping, or generate a clean server-side HTML-based print preview tailored for RTL voucher printing.
  - Vouchers in Arabic will include translated guest details, check-in instructions, financial breakdown (20% advance / 80% check-in), property address, and emergency contact details.

---

## 5. Scope Breakdown by Page & Component

| Component / Page | English Path | Arabic Path | Translation & RTL Scope |
| :--- | :--- | :--- | :--- |
| **Site Header & Footer** | All pages | `/ar/*` | Emaar-style switcher, nav links, contact buttons, legal copyright |
| **Home Page** | `/` | `/ar` | Hero section, search widget, featured flats, trust badges, FAQs |
| **Properties Catalog** | `/properties` | `/ar/properties` | Property cards, BHK filters, occupancy tags, pricing badges |
| **Property Detail View** | `/properties/[slug]` | `/ar/properties/[slug]` | Gallery captions, specs grid, amenity icons, booking sidebar |
| **Branches Hub** | `/branches/[slug]`| `/ar/branches/[slug]`| Branch intro, location landmarks, available units list |
| **Hospitals Directory**| `/hospitals` | `/ar/hospitals` | Hospital list, distance tags, medical stay services |
| **About Us** | `/about` | `/ar/about` | Brand ethos, company information |
| **Policies** | `/policies` | `/ar/policies` | 20/80 payment rules, cancellation windows, house rules |
| **My Reservations** | `/my-bookings` | `/ar/my-bookings` | Booking lookup, reservation cards, payment status badges |
| **List Property** | `/list-property` | `/ar/list-property` | Host listing inquiry form, benefits, submission flow |
| **Checkout Flow** | `/checkout` | `/ar/checkout` | Guest details form, purpose selection, payment breakdown |
| **Confirmation & Voucher** | `/booking-confirmation` | `/ar/booking-confirmation`| Booking summary card, PDF voucher trigger & Arabic PDF generation, contact hotline |
| **Auth Modals** | Global modal | Global modal (RTL) | Login, Signup, OTP prompts, error messages |
| **Admin Portal** | `/admin/*` | N/A | Excluded — remains in English as agreed |

---

## 6. Constraints & Safety Checks
1. **Next.js 16 Compatibility**: `params` and `searchParams` are Promises in Next.js 16 and must be awaited (`const { slug } = await params;`).
2. **Preserve Booking & Payment Logic**: Razorpay and Supabase integration logic must not be modified or broken during localization.
3. **Strict TypeScript**: Zero `any` types; all dictionary keys strictly typed.
4. **No Premature Coding**: Implementation will strictly begin only after design approval and detailed execution plan review.

---

## 7. What's Left to the Builder
- Selection of exact Google Arabic font (`Cairo` vs `Tajawal` - both tested for gold luxury contrast).
- Organization of shared page wrapper components between root and `/ar/` routes to avoid code duplication.
- Micro-adjustments for RTL spacing and animations on mobile touch devices.
