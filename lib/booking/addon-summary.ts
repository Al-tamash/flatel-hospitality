/** One-line summary of the add-ons chosen for a booking, shown in the booking panel. */
import type { FacilityAddon } from "@/lib/mock-rooms";

export function buildAddonSummary({
  selected,
  addonsTotal,
  locale,
}: {
  selected: FacilityAddon[];
  addonsTotal: number;
  locale: "en" | "ar";
}): { label: string; hasSelection: boolean } {
  const isAr = locale === "ar";
  if (selected.length === 0) {
    return { label: isAr ? "أضف خدمات لإقامتك ←" : "Add services for your stay →", hasSelection: false };
  }

  const count = selected.length;
  const hasQuote = selected.some((addon) => addon.price === null);
  const amount = `₹${addonsTotal.toLocaleString("en-IN")}`;

  if (isAr) {
    const countLabel = count === 1 ? "خدمة إضافية واحدة" : `${count} خدمات إضافية`;
    return { label: `${countLabel} · ${amount}${hasQuote ? " + حسب الطلب" : ""} · تعديل`, hasSelection: true };
  }
  const countLabel = `${count} add-on${count === 1 ? "" : "s"}`;
  return { label: `${countLabel} · ${amount}${hasQuote ? " + on quote" : ""} · Edit`, hasSelection: true };
}
