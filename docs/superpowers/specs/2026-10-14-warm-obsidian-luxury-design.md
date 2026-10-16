# Design Specification: Warm Obsidian & Champagne Gold Luxury Human-Centric UI Refactor

**Date:** 2026-10-14  
**Author:** Antigravity Architect  
**Status:** Approved  
**Target Repository:** `flatel-website` (Next.js 16, React 19, Tailwind CSS v4)

---

## 1. Executive Summary & Aesthetic Direction

This specification outlines the complete visual and architectural refactoring of the FLATEL Hospitality application from a flat, cold charcoal/slate dark theme to a **Warm Obsidian & Champagne Gold Luxury Human-Centric Design**.

The aesthetic embodies a high-end boutique hospitality experience:
- **Warm Obsidian & Deep Espresso Canvas**: Eliminating all harsh pure blacks (`#000000`), cold greys (`#121316`, `#181A20`, `#1C1E24`), and cool slate borders (`#2E3038`).
- **Ambient Golden Lighting**: Subtle, luminous radial amber gradients and warm light-leaks that provide atmospheric depth and eliminate flat, sterile surfaces.
- **Golden Glassmorphism Cards**: Translucent warm espresso panels (`rgba(34, 24, 16, 0.65)`) with a `backdrop-blur-md` filter, consistent 20px curvature (`rounded-2xl`), and a 1px glowing champagne gold hairline border (`rgba(212, 163, 89, 0.28)`).
- **Champagne Gold Buttons & Accents**: Rich 135-degree gradients (`linear-gradient(135deg, #E5C178 0%, #C69344 100%)`) with readable deep espresso text (`#140E08`), replacing flat yellow buttons.
- **Human-Centric Typography**: Architectural pairing of **Playfair Display** (warm cream `#FAF4EB` with highlighted words in gold `#E5C178`) for headings, and **Plus Jakarta Sans** (warm sand `#B8A692`) for body text.

---

## 2. Design System Tokens & Palette

### 2.1 Color Tokens
| Token Name | Hex / RGBA Value | Semantic Usage |
| :--- | :--- | :--- |
| `--background` | `#0E0A07` | Main page background (Deep Warm Obsidian) |
| `--surface-espresso` | `#16100B` | Secondary elevated surfaces and header base |
| `--surface-card-glass` | `rgba(34, 24, 16, 0.65)` | Glassmorphism card fill for suites, amenities, reviews, FAQ |
| `--surface-card-hover` | `rgba(45, 32, 22, 0.75)` | Interactive card hover surface |
| `--border-gold` | `rgba(212, 163, 89, 0.28)` | Standard glowing gold hairline card border |
| `--border-gold-subtle`| `rgba(212, 163, 89, 0.16)` | Subtle section dividers and inactive tabs |
| `--border-gold-hover` | `rgba(229, 193, 120, 0.65)`| Card and button hover border |
| `--gold-primary` | `#E5C178` | Primary Champagne Gold accent |
| `--gold-secondary` | `#C69344` | Secondary burnished gold for gradients |
| `--gold-gradient` | `linear-gradient(135deg, #E5C178 0%, #C69344 100%)` | Primary CTA buttons |
| `--text-cream` | `#FAF4EB` | Major headings, card titles, key metric numbers |
| `--text-sand` | `#B8A692` | Body copy, descriptions, specifications |
| `--text-muted-taupe` | `#8C7D6F` | Metadata, microcopy, breadcrumbs |
| `--text-espresso` | `#140E08` | High-contrast dark typography on gold buttons |

### 2.2 Typography Mapping
- **Display & Headings (`--font-heading`)**: `Playfair_Display`
  - Font weights: `400` (normal), `600` (semibold), `700` (bold)
  - Color: `#FAF4EB` (Warm Cream)
  - Emphasized / Italic keywords: `#E5C178` (Champagne Gold)
- **Body & Controls (`--font-sans`)**: `Plus_Jakarta_Sans`
  - Font weights: `400` (regular), `500` (medium), `600` (semibold), `700` (bold)
  - Color: `#B8A692` (Warm Sand)
  - High-emphasis labels: `#FAF4EB`

### 2.3 Shared Utility Classes (`app/globals.css`)
```css
/* Ambient Golden Lighting */
.bg-ambient-gold-glow {
  background: radial-gradient(circle at 50% 50%, rgba(212, 163, 89, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* Golden Glassmorphism Card Foundation */
.card-gold-glass {
  background: rgba(34, 24, 16, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1.25rem; /* 20px / rounded-2xl */
  border: 1px solid rgba(212, 163, 89, 0.28);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(212, 163, 89, 0.04);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-gold-glass:hover {
  border-color: rgba(229, 193, 120, 0.65);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55), 0 0 28px rgba(229, 193, 120, 0.15);
  transform: translateY(-2px);
}

/* Champagne Gold Primary Action Button */
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
  transform: translateY(-1px);
}
```

---

## 3. Detailed Component Refactoring Architecture

### 3.1 Foundations (`app/globals.css` & `app/layout.tsx`)
- In `app/layout.tsx`:
  - Bind `Playfair_Display` variable to `--font-heading` and apply it to `h1-h6`.
  - Bind `Plus_Jakarta_Sans` variable to `--font-sans` and apply it as the default `body` font.
  - Update `themeColor` in viewport metadata to `#0E0A07`.
- In `app/globals.css`:
  - Replace `--background` from `#14130F` to `#0E0A07`.
  - Set `--card` to `rgba(34, 24, 16, 0.65)`, `--border` to `rgba(212, 163, 89, 0.28)`.
  - Set `--primary` to `#E5C178`, `--primary-foreground` to `#140E08`.
  - Set `--foreground` to `#FAF4EB`, `--muted-foreground` to `#B8A692`.
  - Add `.bg-ambient-gold-glow`, `.card-gold-glass`, and `.btn-champagne-gold` utilities.

### 3.2 UI Primitives (`components/ui/button.tsx` & `book-now-button.tsx`)
- In `components/ui/button.tsx`:
  - Update `default` variant to utilize `.btn-champagne-gold` styling (`linear-gradient(135deg, #E5C178 0%, #C69344 100%)` with `#140E08` text).
  - Update `outline` variant to warm obsidian glass (`bg-[rgba(34,24,16,0.5)] border-[rgba(212,163,89,0.3)] text-[#FAF4EB] hover:border-[#E5C178] hover:text-[#E5C178]`).
  - Update `secondary` variant to warm espresso surface (`bg-[#16100B] text-[#FAF4EB] border border-[rgba(212,163,89,0.2)]`).
- In `components/ui/book-now-button.tsx`:
  - Apply Champagne Gold gradient and dark espresso text.

### 3.3 Site Header (`components/site-header.tsx`)
- Replace `#121316` background with `bg-[#0E0A07]/90 backdrop-blur-md`.
- Replace `#2E3038` borders with `rgba(212, 163, 89, 0.2)`.
- Brand logo: Warm cream `#FAF4EB` with Champagne Gold `#E5C178` emblem. Tagline: Warm sand `#B8A692`.
- Navigation items: Warm sand `#B8A692`, active/hover in warm cream `#FAF4EB` with subtle gold accent.
- Mobile menu: Warm espresso drawer `bg-[#16100B]` with gold hairline dividers.

### 3.4 Hero Section & Search Bar (`components/hero-section.tsx`, `booking-search.tsx`, `hero-featured-cards.tsx`)
- In `components/hero-section.tsx`:
  - Replace cool black gradients (`from-[#121316]`) with Deep Warm Obsidian vignettes (`from-[#0E0A07]`).
  - Add ambient golden radial light leak: `radial-gradient(circle at 20% 30%, rgba(212, 163, 89, 0.15) 0%, transparent 65%)`.
  - Headline: Playfair Display in warm cream `#FAF4EB`, "Hyderabad" / key terms in Champagne Gold `#E5C178`.
  - Subtitle: Plus Jakarta Sans in warm sand `#B8A692`.
  - "Explore Flats" CTA: Champagne Gold gradient with `#140E08` text.
- In `components/hero/booking-search.tsx`:
  - Container: Glassmorphism card (`bg-[rgba(34,24,16,0.75)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)]`).
  - Input selector buttons: Warm espresso hover states (`hover:bg-[rgba(50,36,24,0.45)]`), gold icons (`#E5C178`), warm sand labels (`#B8A692`), warm cream values (`#FAF4EB`).
  - Search submit button: Champagne Gold gradient with `#140E08` text.
  - Dropdowns & Calendar: Warm espresso glass panels (`bg-[#16100B]/95`) with gold border.
- In `components/hero-featured-cards.tsx`:
  - Purpose cards: `bg-[rgba(34,24,16,0.65)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178]`.

### 3.5 Handpicked Residences / Suites (`components/featured-flats.tsx`)
- Section background: Deep Obsidian `#0E0A07` with ambient golden radial glow.
- Eyebrow: Champagne Gold `#E5C178`. Headline: Playfair Display `#FAF4EB` with highlighted gold text. Subtitle: `#B8A692`.
- Segmented filter controls: Warm espresso glass pill (`bg-[rgba(34,24,16,0.75)] border border-[rgba(212,163,89,0.2)]`), active item in Champagne Gold gradient with `#140E08` text.
- 4 Flat Cards (1, 2, 3, 4 BHK):
  - Base: `bg-[rgba(34,24,16,0.65)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)]`.
  - Title: Playfair Display `#FAF4EB`. Specs: `#B8A692`. Price: `#E5C178`.
  - CTA Button: Champagne Gold gradient with `#140E08` text.

### 3.6 Effortless Reservation Journey (`components/booking-steps.tsx`)
- Section background: Deep Obsidian `#0E0A07` with ambient glow.
- Process cards: Golden glassmorphism `rgba(34, 24, 16, 0.65)` with `rounded-2xl` and gold borders.
- Step index numbers & icons: Champagne Gold `#E5C178`. Titles: `#FAF4EB`. Subtitles: `#B8A692`.

### 3.7 Prime Branches & Map Hub (`components/branch-hub.tsx`)
- Section background: Deep Obsidian `#0E0A07`.
- Leaflet Map surface filter: Updated to warm charcoal/obsidian tones:
  `filter: brightness(0.68) invert(1) contrast(2.4) hue-rotate(170deg) saturate(0.2) brightness(0.8) !important;`
- Branch summary cards & overlay controls: `bg-[rgba(34,24,16,0.75)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)]`.
- Branch titles: Playfair Display `#FAF4EB`. Action buttons: Champagne Gold gradient.

### 3.8 Signature Amenities Marquee & Modal (`components/amenities-section.tsx`)
- Section background: Deep Obsidian `#0E0A07` with radial ambient amber light.
- Marquee cards: `bg-[rgba(34,24,16,0.65)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178]`.
- Marquee edge fades: Gradients transitioning to `#0E0A07` (instead of `#121316`).
- Directory modal: Warm obsidian backdrop (`rgba(14, 10, 7, 0.88)`), modal container `bg-[#16100B] border border-[rgba(212,163,89,0.3)]`.

### 3.9 Nearby Hospitals & Medical Support (`components/nearby-hospitals.tsx`)
- Section background: Deep Obsidian `#0E0A07`.
- Hospital directory cards: `bg-[rgba(34,24,16,0.65)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)]`.
- Badges & action links: Warm gold accents.

### 3.10 Verified Guest Reviews (`components/reviews-section.tsx`)
- Section backdrop: Luxury living room photo with warm obsidian darkening overlay (`from-[#0E0A07]/90 via-[#0E0A07]/75 to-[#0E0A07]/95`).
- Floating review card: `bg-[rgba(34,24,16,0.75)] backdrop-blur-md rounded-2xl border border-[rgba(212,163,89,0.28)] shadow-[0_25px_60px_rgba(0,0,0,0.65)]`.
- 5-Star rating & reviewer name: Champagne Gold `#E5C178`. Review quote: Warm cream `#FAF4EB`.
- Navigation arrows: Warm espresso circular buttons with gold border and gold hover fill.

### 3.11 About Flatel Editorial (`components/about-section.tsx`)
- Section background: Deep Obsidian `#0E0A07` with ambient glow.
- Headline: Playfair Display in warm cream `#FAF4EB`, italic phrase in Champagne Gold `#E5C178`.
- Metrics cards: `bg-[rgba(34,24,16,0.65)] rounded-2xl border border-[rgba(212,163,89,0.25)]`, numbers in `#FAF4EB`.

### 3.12 Frequently Asked Questions (`components/faq-section.tsx`)
- Section background: Deep Obsidian `#0E0A07`.
- Accordion items: Golden glassmorphism cards (`bg-[rgba(34,24,16,0.65)] rounded-2xl border border-[rgba(212,163,89,0.28)] mb-3 p-4 sm:p-5`).
- Question: Playfair Display italic in warm cream `#FAF4EB`, expanding to `#E5C178`.
- Answer: Warm sand `#B8A692`.

### 3.13 Site Footer (`components/site-footer.tsx`)
- Surface: Deep Obsidian `#0E0A07` with hairline gold border `border-[rgba(212,163,89,0.22)]`.
- Brand lockup: Warm cream & gold emblem. Navigation links: Warm sand `#B8A692` with gold hover transition.

---

## 4. Verification & Quality Assurance Strategy

1. **Compilation & Type Safety**:
   - Run `npm run build` or `npx tsc --noEmit` to verify strict TypeScript adherence and zero missing imports or broken props.
2. **Design System & Contrast Audit**:
   - Verify that no cold slate (`#121316`, `#181A20`, `#1C1E24`, `#2E3038`, `#A1A1AA`) remains in active homepage views.
   - Verify text readability against WCAG AA standards:
     - Warm Cream `#FAF4EB` on Warm Obsidian `#0E0A07` (Contrast ratio > 15:1, exceeds AAA).
     - Warm Sand `#B8A692` on Warm Obsidian `#0E0A07` (Contrast ratio > 7:1, exceeds AAA).
     - Dark Espresso text `#140E08` on Champagne Gold `#E5C178` (Contrast ratio > 9:1, exceeds AAA).
3. **Responsive Composition Checks**:
   - Verify 375px (iPhone SE), 390px (iPhone 14/15), 768px (iPad), and 1280px+ (Desktop) breakpoints.
   - Ensure zero horizontal overflow (`overflow-x: hidden`).
   - Ensure glassmorphism cards and button touch targets maintain >= 44px on mobile.
