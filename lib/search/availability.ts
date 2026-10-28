/** Availability-aware ordering and summaries for the homepage search results. */
import { format, parseISO, isSameMonth } from "date-fns";
import { ar } from "date-fns/locale";

export type AvailabilityStatus = "available" | "booked" | "unknown" | "loading";

/** Booked flats go last; everything else (including unknown) keeps its order. */
export function sortByAvailability<T extends { slug: string }>(
  rooms: T[],
  status: Record<string, AvailabilityStatus>
): T[] {
  const rank = (slug: string) => (status[slug] === "booked" ? 1 : 0);
  return rooms
    .map((room, index) => ({ room, index }))
    .sort((a, b) => rank(a.room.slug) - rank(b.room.slug) || a.index - b.index)
    .map(({ room }) => room);
}

function dateRange(checkIn: string, checkOut: string, locale: "en" | "ar"): string {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const opts = locale === "ar" ? { locale: ar } : undefined;
  return isSameMonth(start, end)
    ? `${format(start, "d", opts)}–${format(end, "d MMM", opts)}`
    : `${format(start, "d MMM", opts)} – ${format(end, "d MMM", opts)}`;
}

/** e.g. "3 flats available · 23–26 Nov · 2 guests"; null when no dated search is active. */
export function buildResultsSummary(input: {
  availableCount: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  kids?: number;
  locale: "en" | "ar";
}): string | null {
  const { availableCount, checkIn, checkOut, adults = 0, kids = 0, locale } = input;
  if (!checkIn || !checkOut) return null;
  const guests = adults + kids;
  const range = dateRange(checkIn, checkOut, locale);

  if (locale === "ar") {
    const flats =
      availableCount === 0 ? "لا توجد شقق متاحة" : availableCount === 1 ? "شقة واحدة متاحة" : `${availableCount} شقق متاحة`;
    return [flats, range, guests > 0 ? `${guests} ضيوف` : null].filter(Boolean).join(" · ");
  }
  const flats =
    availableCount === 0 ? "No flats available" : `${availableCount} flat${availableCount === 1 ? "" : "s"} available`;
  return [flats, range, guests > 0 ? `${guests} guest${guests === 1 ? "" : "s"}` : null].filter(Boolean).join(" · ");
}

/** True when the guest asked for more than one flat (several types, or several units of one type). */
export function isMultiFlatSelection(sel: { flatTypes: string[]; totalUnits: number }): boolean {
  return sel.flatTypes.length > 1 || sel.totalUnits > 1;
}

/** Map /api/bookings/availability's response to a card status; anything unverified stays bookable. */
export function statusFromAvailabilityResponse(
  data: { success?: boolean; available?: boolean; verified?: boolean } | null
): AvailabilityStatus {
  if (!data || data.success !== true || data.verified === false) return "unknown";
  return data.available ? "available" : "booked";
}
