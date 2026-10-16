# Warm Obsidian & Champagne Gold Luxury UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the FLATEL Hospitality application UI from a flat charcoal dark theme into a Warm Obsidian & Champagne Gold luxury human-centric design with golden glassmorphism cards, ambient lighting, and refined typography.

**Architecture:** Establish centralized design tokens and reusable luxury utility classes in `globals.css` and `layout.tsx`. Systematically refactor all UI primitives and homepage sections to eliminate hardcoded cold slate/charcoal colors, implementing translucent warm espresso glass panels (`rgba(34, 24, 16, 0.65)`), champagne gold gradients with dark espresso text (`#140E08`), and editorial Playfair Display / Plus Jakarta Sans typography.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Base UI, Leaflet.

**Spec:** `docs/superpowers/specs/2026-10-14-warm-obsidian-luxury-design.md`

## Global Constraints
- Main Canvas: Deep Espresso / Warm Obsidian (`#0E0A07` and `#16100B`). Zero pure blacks (`#000000`) or cool greys (`#121316`, `#181A20`, `#1C1E24`, `#2E3038`).
- Ambient Golden Lighting: Subtle amber-gold radial gradients (`radial-gradient(circle, rgba(212,163,89,0.12) 0%, transparent 70%)`).
- Glassmorphism Cards: `rgba(34, 24, 16, 0.65)`, `backdrop-blur-md`, `rounded-2xl` (20px radius), `1px solid rgba(212, 163, 89, 0.28)`.
- Buttons & Accents: Champagne Gold gradient (`linear-gradient(135deg, #E5C178 0%, #C69344 100%)`) with dark espresso text (`#140E08`).
- Typography: Headings in `Playfair Display` (`#FAF4EB`, highlighted words `#E5C178`), body copy in `Plus Jakarta Sans` (`#B8A692`).
- Strict TypeScript: No `any`, preserve all existing props and event handlers.

---

### Task 1: Foundational Design Tokens & Typography Binding

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces:
  - CSS variables: `--background: #0E0A07`, `--surface-espresso: #16100B`, `--card: rgba(34, 24, 16, 0.65)`, `--border: rgba(212, 163, 89, 0.28)`, `--primary: #E5C178`, `--primary-foreground: #140E08`, `--foreground: #FAF4EB`, `--muted-foreground: #B8A692`.
  - Utility classes: `.bg-ambient-gold-glow`, `.card-gold-glass`, `.btn-champagne-gold`.
  - Typography bindings: `--font-heading` mapped to `Playfair_Display`, `--font-sans` mapped to `Plus_Jakarta_Sans`.

- [ ] **Step 1: Update font variables in `app/layout.tsx`**
Ensure `Playfair_Display` is configured for `--font-heading` and `Plus_Jakarta_Sans` is configured for `--font-sans`. Update `viewport.themeColor` to `#0E0A07`.
```tsx
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0E0A07",
};
```

- [ ] **Step 2: Update CSS tokens and add luxury utility classes in `app/globals.css`**
Update `:root` / `.dark` design tokens to use Warm Obsidian and Champagne Gold foundations:
```css
:root,
.dark {
  --background: #0E0A07;
  --foreground: #FAF4EB;
  --card: rgba(34, 24, 16, 0.65);
  --card-foreground: #FAF4EB;
  --popover: #16100B;
  --popover-foreground: #FAF4EB;
  --primary: #E5C178;
  --primary-foreground: #140E08;
  --secondary: #16100B;
  --secondary-foreground: #FAF4EB;
  --muted: #16100B;
  --muted-foreground: #B8A692;
  --accent: rgba(34, 24, 16, 0.65);
  --accent-foreground: #E5C178;
  --destructive: #8B2626;
  --destructive-foreground: #FAF4EB;
  --border: rgba(212, 163, 89, 0.28);
  --input: rgba(212, 163, 89, 0.28);
  --ring: #E5C178;
  --radius: 1.25rem;
}

/* Ambient Golden Lighting */
.bg-ambient-gold-glow {
  background: radial-gradient(circle at 50% 50%, rgba(212, 163, 89, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* Golden Glassmorphism Card Utility */
.card-gold-glass {
  background: rgba(34, 24, 16, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  border: 1px solid rgba(212, 163, 89, 0.28);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(212, 163, 89, 0.04);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-gold-glass:hover {
  border-color: rgba(229, 193, 120, 0.65);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55), 0 0 28px rgba(229, 193, 120, 0.15);
}

/* Champagne Gold Primary Button */
.btn-champagne-gold {
  background: linear-gradient(135deg, #E5C178 0%, #C69344 100%);
  color: #140E08 !important;
  font-weight: 700;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 244, 194, 0.35);
  box-shadow: 0 4px 20px rgba(229, 193, 120, 0.25);
  transition: all 0.25s ease;
}

.btn-champagne-gold:hover {
  background: linear-gradient(135deg, #EED18D 0%, #D4A352 100%);
  box-shadow: 0 6px 24px rgba(229, 193, 120, 0.35);
}
```

- [ ] **Step 3: Verify TypeScript and compilation**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 2: Core UI Primitives Refactor

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/book-now-button.tsx`
- Modify: `components/ui/card.tsx`

**Interfaces:**
- Consumes: `.btn-champagne-gold`, `.card-gold-glass` from Task 1.
- Produces: Updated `Button`, `BookNowButton`, and `Card` primitives adhering to Warm Obsidian & Champagne Gold luxury styling.

- [ ] **Step 1: Refactor `components/ui/button.tsx`**
Update `buttonVariants`:
- `default`: `bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold border border-[#FFF4C2]/35 shadow-md shadow-[#E5C178]/20 hover:brightness-105 active:scale-[0.98]`
- `outline`: `border-[rgba(212,163,89,0.3)] bg-[rgba(34,24,16,0.65)] backdrop-blur-md text-[#FAF4EB] hover:border-[#E5C178] hover:text-[#E5C178] hover:bg-[rgba(50,36,24,0.65)]`
- `secondary`: `bg-[#16100B] text-[#FAF4EB] border border-[rgba(212,163,89,0.22)] hover:border-[rgba(212,163,89,0.4)]`

- [ ] **Step 2: Refactor `components/ui/book-now-button.tsx`**
Update `variantStyles`:
- `primary`: Champagne Gold gradient (`bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold border border-[#FFF4C2]/35 shadow-md shadow-[#E5C178]/20`)
- `secondary`: Warm espresso glass (`bg-[rgba(34,24,16,0.65)] text-[#FAF4EB] border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178]`)
- `outline`: `border border-[rgba(212,163,89,0.6)] text-[#E5C178] hover:bg-[rgba(212,163,89,0.1)]`

- [ ] **Step 3: Refactor `components/ui/card.tsx`**
Ensure base `Card` applies `card-gold-glass` with `rounded-2xl` and warm typography defaults.

- [ ] **Step 4: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 3: Site Header & Navigation Refactor

**Files:**
- Modify: `components/site-header.tsx`

**Interfaces:**
- Consumes: Design tokens from Task 1 and buttons from Task 2.
- Produces: Warm Obsidian header with golden hairline border, warm cream brand lettering, and espresso glass dropdowns.

- [ ] **Step 1: Replace cold backgrounds and borders**
Replace `bg-[#121316]` with `bg-[#0E0A07]/92 backdrop-blur-md`.
Replace `border-[#2E3038]` with `border-[rgba(212,163,89,0.22)]`.

- [ ] **Step 2: Update brand lockup & nav links**
- "FLATEL" text: `font-heading font-bold text-xl sm:text-2xl text-[#FAF4EB] tracking-tight`.
- Tagline: `text-[#B8A692] text-[10px] sm:text-[11px]`.
- Navigation links: default `text-[#B8A692]`, hover `text-[#FAF4EB] hover:border-b-2 hover:border-[#E5C178]`.
- Active branch pill: `bg-[rgba(34,24,16,0.85)] border border-[rgba(212,163,89,0.35)] text-[#E5C178]`.

- [ ] **Step 3: Update dropdown menus and mobile drawer**
- Dropdown panel: `bg-[#16100B]/95 backdrop-blur-xl border border-[rgba(212,163,89,0.28)] shadow-2xl rounded-2xl`.
- Mobile drawer: `bg-[#0E0A07] border-l border-[rgba(212,163,89,0.25)] text-[#FAF4EB]`.

- [ ] **Step 4: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 4: Hero Section, Booking Search Bar & Purpose Cards Refactor

**Files:**
- Modify: `components/hero-section.tsx`
- Modify: `components/hero/booking-search.tsx`
- Modify: `components/hero-featured-cards.tsx`

**Interfaces:**
- Consumes: `.bg-ambient-gold-glow`, `.card-gold-glass`, `.btn-champagne-gold`.
- Produces: Cinematic warm hero fold with ambient light leaks, Playfair Display headline, golden glassmorphism search bar, and 4 purpose cards.

- [ ] **Step 1: Refactor `components/hero-section.tsx`**
- Replace vignette gradients from `#121316` to `#0E0A07`.
- Add golden-amber radial light-leak overlay:
```tsx
<div
  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(212,163,89,0.14)_0%,transparent_70%)]"
  aria-hidden="true"
/>
```
- Eyebrow: `text-[#E5C178] tracking-[0.25em]`.
- Headline: `font-heading text-[#FAF4EB]` with highlighted words in `text-[#E5C178]`.
- Subtitle: `font-sans text-[#B8A692]`.
- Explore CTA: `btn-champagne-gold`.

- [ ] **Step 2: Refactor `components/hero/booking-search.tsx`**
- Main search bar container:
```tsx
className={cn(
  "relative w-full rounded-2xl p-2 sm:p-2.5 lg:p-3",
  "bg-[rgba(34,24,16,0.75)] backdrop-blur-md",
  "border border-[rgba(212,163,89,0.28)]",
  "shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_24px_rgba(212,163,89,0.06)]"
)}
```
- Selector buttons:
  - Background: `bg-[rgba(22,16,11,0.6)] lg:bg-transparent border border-[rgba(212,163,89,0.2)] lg:border-transparent hover:border-[#E5C178]/50 lg:hover:bg-[rgba(50,36,24,0.45)]`
  - Icons: `text-[#E5C178]`
  - Field label: `text-[#B8A692]`
  - Field value: `text-[#FAF4EB]`
  - Desktop dividers: `bg-[rgba(212,163,89,0.18)]`
- Submit Button: `btn-champagne-gold` with dark espresso text `#140E08`.
- Dropdown Popovers: `bg-[#16100B]/95 backdrop-blur-xl border border-[rgba(212,163,89,0.28)] rounded-2xl`.

- [ ] **Step 3: Refactor `components/hero-featured-cards.tsx`**
- Purpose Cards:
```tsx
className="group relative flex flex-col justify-between rounded-2xl overflow-hidden bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] hover:shadow-[0_16px_36px_rgba(212,163,89,0.18)] hover:-translate-y-1 transition-all duration-300"
```
- Card titles in `font-heading text-[#FAF4EB] group-hover:text-[#E5C178]`.

- [ ] **Step 4: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 5: Handpicked Residences / Suites Section Refactor

**Files:**
- Modify: `components/featured-flats.tsx`

**Interfaces:**
- Consumes: `.bg-ambient-gold-glow`, `.card-gold-glass`, `.btn-champagne-gold`.
- Produces: 4 Luxury suite cards with golden glassmorphism surfaces, Playfair Display typography, and Champagne Gold CTA buttons.

- [ ] **Step 1: Refactor Section wrapper and ambient lighting**
Replace `bg-[#14130F]` with `bg-[#0E0A07]`.
Add ambient radial golden glow:
```tsx
<div
  className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,89,0.12),transparent_70%)]"
  aria-hidden="true"
/>
```

- [ ] **Step 2: Refactor Section Header & Segmented Filter Controls**
- Eyebrow: `text-[#E5C178]`.
- Title: `font-heading text-2xl sm:text-3xl md:text-4xl text-[#FAF4EB]`.
- Subtitle: `text-[#B8A692]`.
- Filter controls container: `bg-[rgba(34,24,16,0.7)] border border-[rgba(212,163,89,0.22)] backdrop-blur-md rounded-full p-1`.
- Active tab: `bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold shadow-xs`.
- Inactive tab: `text-[#B8A692] hover:text-[#FAF4EB]`.

- [ ] **Step 3: Refactor 4 Flat Cards**
- Card container:
```tsx
className="group relative flex flex-col justify-between rounded-2xl overflow-hidden bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] hover:shadow-[0_16px_36px_rgba(212,163,89,0.2)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
```
- Branch location badge: `bg-[#0E0A07]/85 backdrop-blur-md border border-[rgba(212,163,89,0.3)] text-[#FAF4EB]`.
- Flat title: `font-heading text-base sm:text-lg font-bold text-[#FAF4EB] group-hover:text-[#E5C178] transition-colors`.
- Specs: `text-xs text-[#B8A692]`.
- Price: `font-heading text-lg sm:text-xl font-bold text-[#E5C178]`.
- CTA Button: `btn-champagne-gold px-3.5 py-1.5 text-xs inline-flex items-center gap-1`.

- [ ] **Step 4: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 6: Booking Steps & Branch Hub (Map) Refactor

**Files:**
- Modify: `components/booking-steps.tsx`
- Modify: `components/branch-hub.tsx`

**Interfaces:**
- Consumes: `.bg-ambient-gold-glow`, `.card-gold-glass`.
- Produces: Warm obsidian 3-step reservation cards and warm charcoal Leaflet map container.

- [ ] **Step 1: Refactor `components/booking-steps.tsx`**
- Replace `bg-[#0E0F12]` with `bg-[#0E0A07]`.
- Add golden ambient glow: `rgba(212,163,89,0.12)`.
- Step and perk cards: `bg-[rgba(34,24,16,0.65)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)]`.
- Step numerals: `font-heading text-[#E5C178]`. Titles: `text-[#FAF4EB]`. Subtitles: `text-[#B8A692]`.

- [ ] **Step 2: Refactor `components/branch-hub.tsx`**
- Replace `bg-[#121316]` with `bg-[#0E0A07]`.
- Map container framing: `rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] overflow-hidden shadow-2xl`.
- Leaflet map tile filter (warm obsidian tuning):
```css
filter: brightness(0.7) invert(1) contrast(2.4) hue-rotate(180deg) saturate(0.2) brightness(0.85) !important;
```
- Branch summary card & overlays: `bg-[rgba(34,24,16,0.85)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)] text-[#FAF4EB]`.
- Branch metric boxes: `bg-[rgba(34,24,16,0.65)] rounded-2xl border border-[rgba(212,163,89,0.28)]`.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 7: Amenities Marquee & Modal Directory Refactor

**Files:**
- Modify: `components/amenities-section.tsx`

**Interfaces:**
- Consumes: `.card-gold-glass`, `.btn-champagne-gold`.
- Produces: Dual-line marquee amenity cards with warm golden glassmorphism and deep espresso directory modal.

- [ ] **Step 1: Refactor section background and ambient lighting**
Replace `bg-[#121316]` with `bg-[#0E0A07]`.
Edge fades: `from-[#0E0A07] to-transparent`.
Ambient glow: `rgba(212, 163, 89, 0.12)`.

- [ ] **Step 2: Refactor Marquee amenity card (`renderCard`)**
```tsx
className="group relative rounded-2xl bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] p-2.5 sm:p-3 md:p-3.5 flex flex-col items-center justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.22)] hover:scale-105 transition-all duration-300 w-[155px] sm:w-[180px] md:w-[195px] h-[124px] sm:h-[140px] md:h-[150px] select-none cursor-pointer shrink-0 overflow-hidden"
```
Card title: `text-[#FAF4EB] group-hover:text-[#E5C178]`.

- [ ] **Step 3: Refactor 29 Amenities Directory Modal**
- Modal backdrop: `bg-[#0E0A07]/88 backdrop-blur-md`.
- Modal dialog: `bg-[#16100B] border border-[rgba(212,163,89,0.3)] rounded-2xl shadow-2xl`.
- Category headers: `text-[#FAF4EB] font-heading` with gold bullets `#E5C178`.

- [ ] **Step 4: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 8: Medical Directory, Reviews, About, FAQ & Footer Refactor

**Files:**
- Modify: `components/nearby-hospitals.tsx`
- Modify: `components/reviews-section.tsx`
- Modify: `components/about-section.tsx`
- Modify: `components/faq-section.tsx`
- Modify: `components/site-footer.tsx`

**Interfaces:**
- Consumes: `.bg-ambient-gold-glow`, `.card-gold-glass`, `.btn-champagne-gold`.
- Produces: Complete luxury human-centric finish across the remaining homepage sections.

- [ ] **Step 1: Refactor `components/nearby-hospitals.tsx`**
- Replace `bg-[#121316]` with `bg-[#0E0A07]`.
- Hospital record cards: `card-gold-glass` (`rgba(34,24,16,0.65)`, `rounded-2xl`, `border-[rgba(212,163,89,0.28)]`).
- Badges and buttons in Champagne Gold accents.

- [ ] **Step 2: Refactor `components/reviews-section.tsx`**
- Background overlay: `from-[#0E0A07]/90 via-[#0E0A07]/75 to-[#0E0A07]/95`.
- Floating review card:
```tsx
className="w-full rounded-2xl sm:rounded-3xl bg-[rgba(34,24,16,0.75)] backdrop-blur-xl text-[#FAF4EB] px-8 py-5 sm:p-8 md:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.65)] border border-[rgba(212,163,89,0.28)] relative overflow-hidden"
```
- Customer name and 5-star ratings: `text-[#E5C178]`.
- Review text: `font-sans text-sm sm:text-base text-[#FAF4EB]`.
- Circular navigation buttons: `bg-[#16100B] border border-[rgba(212,163,89,0.35)] text-[#FAF4EB] hover:bg-[#E5C178] hover:text-[#140E08]`.

- [ ] **Step 3: Refactor `components/about-section.tsx`**
- Background: `bg-[#0E0A07]` + ambient gold lighting.
- Headline: `font-heading text-[#FAF4EB]` with highlighted phrase in `text-[#E5C178]`.
- Story paragraphs: `text-[#B8A692]`.
- 3 Metrics cards: `bg-[rgba(34,24,16,0.65)] rounded-2xl border border-[rgba(212,163,89,0.25)] p-4`. Metric numbers in `#FAF4EB`.

- [ ] **Step 4: Refactor `components/faq-section.tsx`**
- Background: `bg-[#0E0A07]`.
- Accordion items: Golden glassmorphism cards (`bg-[rgba(34,24,16,0.65)] rounded-2xl border border-[rgba(212,163,89,0.28)] mb-3 p-4 sm:p-5`).
- Question: `font-heading text-base sm:text-lg italic text-[#FAF4EB]` (expanded: `text-[#E5C178]`).
- Answer: `font-sans text-xs sm:text-sm text-[#B8A692] leading-relaxed`.

- [ ] **Step 5: Refactor `components/site-footer.tsx`**
- Background: `bg-[#0E0A07] border-t border-[rgba(212,163,89,0.22)]`.
- Headings: `font-heading text-[#FAF4EB]`.
- Links: `text-[#B8A692] hover:text-[#E5C178]`.
- Conversion banner: `bg-[rgba(34,24,16,0.65)] border-b border-[rgba(212,163,89,0.18)]`.

- [ ] **Step 6: Verify build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 9: Final Quality Gate, Design Audit & Verification

**Files:**
- Audit across all modified files in `app/` and `components/`.

**Interfaces:**
- Produces: Verified, production-ready Warm Obsidian & Champagne Gold luxury homepage.

- [ ] **Step 1: Run complete Next.js production build**
Run: `npm run build`
Expected: Build passes with 0 errors, static pages generated cleanly.

- [ ] **Step 2: Grep search for remaining cold hex colors**
Verify no occurrences of `#121316`, `#181A20`, `#1C1E24`, `#2E3038`, `#A1A1AA` in homepage components.

- [ ] **Step 3: Verify responsive layout and interactive states**
Ensure no horizontal scrollbar on 375px/390px/768px/1280px viewports. Confirm cards maintain 20px curvature and buttons maintain >= 44px height.
