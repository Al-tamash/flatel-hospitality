/**
 * Multi-flat cart: one entry per physical flat, so "2 x 3 BHK" is two entries.
 * Travels in the URL as `slug.adults.kids` joined by commas, e.g. `1bhk.2.0,3bhk.4.1`.
 */

export interface CartItem {
  slug: string;
  adults: number;
  kids: number;
}

/** Agreed rule: at most four flats in one booking. */
export const MAX_CART_FLATS = 4;

const SEGMENT = /^([a-z0-9-]{1,40})\.(\d{1,2})\.(\d{1,2})$/;

export function encodeCart(items: CartItem[]): string {
  return items.map((item) => `${item.slug}.${item.adults}.${item.kids}`).join(",");
}

/** Strict parse: any malformed segment, a zero-adult flat or more than four flats returns null. */
export function parseCart(raw: string | null | undefined): CartItem[] | null {
  if (!raw) return null;
  const segments = raw.split(",").map((part) => part.trim()).filter(Boolean);
  if (segments.length === 0 || segments.length > MAX_CART_FLATS) return null;

  const items: CartItem[] = [];
  for (const segment of segments) {
    const match = SEGMENT.exec(segment);
    if (!match) return null;
    const adults = Number(match[2]);
    const kids = Number(match[3]);
    if (adults < 1) return null;
    items.push({ slug: match[1], adults, kids });
  }
  return items;
}

/** Split a guest total across flats as evenly as possible, larger shares first. */
export function splitGuests(total: number, parts: number): number[] {
  if (parts < 1) return [];
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0));
}

/** Expand "units x flat type with these guests" into one cart entry per physical flat. */
export function buildCartItems(slug: string, units: number, adults: number, kids: number): CartItem[] {
  const adultShares = splitGuests(adults, units);
  const kidShares = splitGuests(kids, units);
  return adultShares.map((adultShare, index) => ({
    slug,
    adults: Math.max(1, adultShare),
    kids: kidShares[index] ?? 0,
  }));
}

/** More than one flat in the cart means the multi-flat checkout is needed. */
export function isGroupCart(items: CartItem[] | null | undefined): items is CartItem[] {
  return Boolean(items && items.length > 1);
}
