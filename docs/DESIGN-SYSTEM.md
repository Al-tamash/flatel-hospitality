# Flatel design system

One source of truth: **`app/globals.css`**. Components never write a colour; they use a token name. To change the look of the whole site (or one role, e.g. "muted text"), edit the token value in `:root` and nothing else.

## Colour tokens
The gold is the logo's gold (hue 40°; the logo runs from cream highlight `#F8E898` through `#E8C050` to bronze `#886020`). The palette below is that gold on warm obsidian.

| Token | Value | Tailwind use | Role |
|---|---|---|---|
| `canvas` | `#0E0A07` | `bg-canvas` | page background |
| `surface` | `#16100B` | `bg-surface` | header, inputs, panels |
| `raised` | `#221810` | `bg-raised` | cards and popovers on a surface |
| `raised-hover` | `#2A1E14` | `hover:bg-raised-hover` | hover state of raised |
| `gold` | `#E5C178` | `text-gold`, `bg-gold`, `border-gold` | accents, icons, focus ring, buttons |
| `gold-deep` | `#C69344` | `to-gold-deep` | gold gradient end |
| `gold-bright` | `#F0D394` | `hover:text-gold-bright` | hover highlight |
| `bronze` | `#7A5A2A` | `to-bronze` | medallion shadow |
| `ink` | `#140E08` | `text-ink` | text on gold (11:1) |
| `fg` | `#FAF4EB` | `text-fg` | headings, body (18:1) |
| `fg-soft` | `#D4C4B3` | `text-fg-soft` | intro paragraphs (11.6:1) |
| `fg-muted` | `#B8A692` | `text-fg-muted` | captions, metadata (8.4:1) |
| `fg-faint` | `#A89887` | `text-fg-faint` | placeholders (7.1:1, the weakest allowed) |
| `line-soft` | gold 18 % | `border-line-soft`, `divide-line-soft` | dividers inside a block |
| `line` | gold 28 % | `border-line` | card and section borders |
| `line-strong` | gold 50 % | `border-line-strong` | hover / emphasis |
| `control` | gold 60 % | `border-control` | form-field outline (3.7:1, WCAG 1.4.11) |
| `success` `danger` `danger-soft` `whatsapp` | status | `text-success` … | feedback, WhatsApp |

Opacity works on every token: `bg-raised/65`, `text-gold/80`, `border-gold/50`.
`lib/design-tokens.ts` mirrors the few hex values needed outside CSS (Razorpay theme, `theme-color` meta); `tests/design/tokens.test.ts` fails if they drift from `globals.css` or if any text token drops under 4.5:1 on a surface.
The one deliberate exception is the Platinum membership card artwork (silver), which has its own palette inside `membership-card.tsx`.

## Typography
Fonts: Cormorant Garamond (`font-heading`) for headings, DM Sans for text, Cairo for Arabic (applied automatically under `dir="rtl"`).
| Utility | Size (mobile → desktop) | Use |
|---|---|---|
| `heading-hero` | 36 → 48 → 60 px | landing hero, membership, purpose, about |
| `heading-page` | 30 → 36 → 48 px | every other page H1 |
| `heading-section` | 30 → 36 px | H2 section titles |
| `heading-sub` | 20 → 24 px | sub-sections |
| `eyebrow` | 12 px caps, +0.14em | small label above a heading |
Body 16 px / 1.65. Smallest text anywhere is 12 px. Letter-spacing is open, never tight: body +0.01em, headings +0.005em, no negative tracking anywhere; Arabic is always `normal` (spacing breaks Arabic letter joining).

## Layout
- **`container-page`**: the only section wrapper. Same box as the header and hero (max 1280 px, gutters 16 / 24 / 32 / 40 px), so every section's left and right edges line up with the logo and the header actions.
- Narrow reading columns (FAQ, long prose, forms) sit **inside** a `container-page` with `max-w-3xl mx-auto`; they never replace it.
- `section-y`: vertical rhythm between sections (56 px mobile, 80 px desktop).

## When to use a card
A bordered, filled box is the strongest visual device, so it is reserved.
**Use a card** for: things you can open or choose (flats, branches, hospitals, stay purposes), booking / price / checkout panels, membership plans, forms, modals, selectable options.
**Do not use a card** for: amenities, value props, steps, policy topics, trust points, mission/vision, spec rows, landmarks. These are open layouts: icon + text, separated by a `border-t border-line-soft` hairline or plain space.
Card recipe: `rounded-2xl border border-line bg-raised/65 p-5 sm:p-6`; hover `hover:border-line-strong`.

## Focus, motion, forms
Every focusable element gets one gold 2 px ring (global rule). Reduced-motion collapses animation. Fields use `border-control`; placeholders use one global colour.
