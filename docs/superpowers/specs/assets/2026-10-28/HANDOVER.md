# Handover: Flat page, maps, purpose pages & homepage polish

**Date**: 2026-10-28 · **Branch**: `feat/bilingual-en-ar-website` · **Spec**: `../../2026-10-28-flat-page-maps-purpose-pages-design.md`

## What shipped
- Auto-playing photo carousel on flat pages and branch pages (pauses on hover/touch, off-screen, hidden tab; no autoplay under reduced motion).
- Sticky booking panel on the flat page; add-ons now show as one summary line ("2 add-ons · ₹X · Edit").
- Purpose-first amenities: guest picks a purpose, then sees that purpose's free and paid services, then the regular flat amenities.
- Gold-on-black maps: homepage "Find Your Nearest Flatel" (branch list, flag popups, Hospitals / Heritage filters) and the flat page "What's nearby".
- Floating WhatsApp + Call buttons (+91 79891 00711) on all guest pages; hidden on checkout and admin; sit above the mobile Book bar; left side in Arabic.
- Starlight night sky in the hero, footer and the About page Mission/Founder block.
- Mission & Vision + Founder card on About (EN + AR); founder strip on the homepage.
- Five purpose pages: `/stays/medical`, `/stays/wedding`, `/stays/family`, `/stays/tourism`, `/stays/corporate` (+ `/ar/...`); five purpose cards under the hero link to them.
- Hero search: per-flat availability for the chosen dates, results summary bar, multi-flat note, date picker opens when booking without dates.
- Homepage flats section: one filter row, single "View & Book" button, gap above it cut from ~184px to ~98px.

## Client to confirm before launch
1. **Founder photo** — none in the project yet; the card shows a gold "F" monogram. Set `FOUNDER_PHOTO` in `lib/about-content.ts` once the photo is added under `public/images/`.
2. **Founder email** — `hello@flatel.in` (from the screenshot). Change `FOUNDER_EMAIL` in `lib/about-content.ts` if different.
3. **Founder phone** — the card uses +91 79891 00711 (site-wide number). The client's screenshot showed +91 93464 13282.
4. **Map locations** — looked up from OpenStreetMap; please check each pin. Edit `lib/map/places.ts` and set `verified: true` when confirmed.

| Place | Type | Lat, Lng | Nearest branch | Source |
|---|---|---|---|---|
| Princess Esra Hospital | hospital | 17.3564481, 78.4741711 | ≈0.8 km from moghal-pura | Princess Esra Hospital, Charminar Road, Panjeshah, Moghalpura |
| Princess Durru Shehvar Children's & General Hospital | hospital | 17.367312, 78.4826575 | ≈1.2 km from moghal-pura | Princess Durru Shehvar Children's And General Hospital, Purani Haveli Road |
| Owaisi Hospital & Research Centre | hospital | 17.340848, 78.5067444 | ≈3.0 km from barkas-salala | Owaisi Hospital and Research Centre, Kanchanbagh |
| Apollo DRDO Hospital | hospital | 17.3421825, 78.5073095 | ≈3.2 km from barkas-salala | Apollo DRDO Hospital, Inner Ring Road, Kanchanbagh |
| Aware Global Hospital | hospital | 17.345958, 78.5399126 | ≈6.1 km from barkas-salala | Aware Gleneagles Global Hospital, Road No 4, LB Nagar |
| Yashoda Hospitals | hospital | 17.4245627, 78.4569401 | ≈8.0 km from moghal-pura | Yashoda Hospital, Raj Bhavan Road, Khairatabad |
| Virinchi Hospitals | hospital | 17.4080948, 78.4514943 | ≈6.5 km from moghal-pura | Virinchi Hospitals, Road Number 1, Masab Tank |
| Gandhi Hospital | hospital | 17.4231228, 78.5034539 | ≈7.7 km from moghal-pura | Gandhi Hospital, Boyiguda Road, Musheerabad |
| KIMS Hospitals | hospital | 17.4372705, 78.4826822 | ≈8.9 km from moghal-pura | KIMS Hospital, Minister's Road, Secunderabad |
| Apollo Hospitals, Jubilee Hills | hospital | 17.4149358, 78.4131784 | ≈9.7 km from moghal-pura | Apollo Hospitals, Road Number 3, Film Nagar, Jubilee Hills |
| Charminar | heritage | 17.3616024, 78.4746421 | ≈0.9 km from moghal-pura | Charminar, Charminar Circle, Khilwat |
| Mecca Masjid | heritage | 17.36066, 78.4736063 | ≈0.9 km from moghal-pura | Mecca Masjid, Charminar Road, Khilwat |
| Laad Bazaar | heritage | 17.3625085, 78.4729754 | ≈1.1 km from moghal-pura | Laad Bazaar, Khilwat |
| Chowmahalla Palace | heritage | 17.3575817, 78.4717055 | ≈1.0 km from moghal-pura | Chowmahalla Palace, Khilwat Road |
| Salar Jung Museum | heritage | 17.371392, 78.4801498 | ≈1.6 km from moghal-pura | Salar Jung Museum, Darul Shifa Road |
| Falaknuma Palace | heritage | 17.3318413, 78.4658488 | ≈3.0 km from barkas-salala | Falaknuma Palace, Falaknuma Road |

5. **Arabic copy** — new Arabic text (purpose services, purpose pages, mission/founder) should get a native read-through.
6. **Map tiles** — Carto now requires an API key, so the maps use Esri World Dark Gray tiles (free, keyless), tinted gold.

## Phase 2 (not built)
- Flatel Membership (₹777) — waiting on benefits (discount %, free-night rule, validity).
- Multi-flat booking in one checkout — agreed rules: same branch, same dates, max 4 flats, swap if one is unavailable, one payment, one voucher.
