/**
 * Shared Flatel map styling: gold-on-black tiles, flag pins and place markers.
 * Used by the homepage branch map and the flat page "What's nearby" map.
 */
import type { PlaceCategory } from "@/lib/map/places";

// Carto dark basemap (free, no API key). The `.flatel-gold-tiles` CSS filter in
// app/globals.css turns its grey roads gold on a near-black ground.
export const GOLD_TILE_LAYER = {
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  options: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
    className: "flatel-gold-tiles" as const,
  },
};

export const FLAG_PIN_SIZE: [number, number] = [40, 48];
export const FLAG_PIN_ANCHOR: [number, number] = [10, 44];

/** Black Flatel flag with a gold "F", gold border and gold pole. Active flags glow gold. */
export function buildFlagPinHtml({ active, id }: { active: boolean; id: string }): string {
  const glow = active
    ? "filter: drop-shadow(0 0 8px rgba(229,193,120,0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.85)); transform: scale(1.15); transform-origin: 10px 44px;"
    : "filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85));";
  return `
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="${glow}" data-flag="${id}" aria-hidden="true">
      <circle cx="10" cy="6" r="3.2" fill="#E5C178"/>
      <line x1="10" y1="6" x2="10" y2="44" stroke="#E5C178" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="10" cy="45" rx="5" ry="2.2" fill="rgba(0,0,0,0.7)"/>
      <circle cx="10" cy="44" r="2" fill="#E5C178"/>
      <path d="M11 8H36L30 17.5L36 27H11V8Z" fill="#0E0A07" stroke="#E5C178" stroke-width="1.2" stroke-linejoin="round"/>
      <text x="21" y="21.5" font-family="'Cormorant Garamond', Georgia, serif" font-size="13" font-weight="700" fill="#E5C178" text-anchor="middle">F</text>
    </svg>
  `;
}

const PLACE_GLYPHS: Record<PlaceCategory, string> = {
  // Medical cross
  hospital: '<path d="M9.5 5h3v4.5H17v3h-4.5V17h-3v-4.5H5v-3h4.5z" fill="#E5C178"/>',
  // Dome with minarets
  heritage:
    '<path d="M11 4.5c-2.6 1.6-4 3.6-4 6h8c0-2.4-1.4-4.4-4-6z M6 11.5h10V17H6z M4 8h1.4v9H4z M16.6 8H18v9h-1.4z" fill="#E5C178"/>',
};

/** Small dark marker with a gold ring and a category glyph. */
export function buildPlaceMarkerHtml(category: PlaceCategory): string {
  return `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));" aria-hidden="true">
      <circle cx="11" cy="11" r="10" fill="#16100B" stroke="#E5C178" stroke-width="1.2"/>
      ${PLACE_GLYPHS[category]}
    </svg>
  `;
}
