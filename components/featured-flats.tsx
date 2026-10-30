"use client";

import * as React from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Building2, CalendarSearch, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getBranchBySlug, WHATSAPP_CONFIG } from "@/lib/constants";
import { type RoomDetail } from "@/lib/mock-rooms";
import { calculateFlatelPrice } from "@/lib/pricing";
import { encodeCart, isGroupCart, parseCart, type CartItem } from "@/lib/booking/cart";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import {
  buildResultsSummary,
  isMultiFlatSelection,
  sortByAvailability,
  statusFromAvailabilityResponse,
  type AvailabilityStatus,
} from "@/lib/search/availability";

interface FeaturedFlatsProps {
  className?: string;
}

// Flat photography mapping (Curated high-res hero photos)
const FLAT_IMAGES: Record<string, string> = {
  "1bhk": "/images/flats/flat-1bhk-luxury.jpg",
  "2bhk": "/images/flats/flat-2bhk-luxury.jpg",
  "3bhk": "/images/flats/flat-3bhk-luxury.jpg",
  "4bhk": "/images/flats/flat-4bhk-luxury.jpg",
};

export function FeaturedFlats({ className }: FeaturedFlatsProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const dict = getDictionary(currentLocale);
  const isAr = currentLocale === "ar";
  const localePrefix = isAr ? "/ar" : "";

  const [rooms, setRooms] = React.useState<RoomDetail[]>([]);
  const [roomsLoading, setRoomsLoading] = React.useState(true);
  const [inventoryLoadFailed, setInventoryLoadFailed] = React.useState(false);
  // Filters
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterBranch, setFilterBranch] = React.useState<string>("all");
  const [selectedUnits, setSelectedUnits] = React.useState(1);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [availability, setAvailability] = React.useState<Record<string, AvailabilityStatus>>({});

  // Search parameters synced from Hero booking bar
  const [searchDates, setSearchDates] = React.useState<{
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    kids?: number;
    nights?: number;
  }>({});

  // Dynamic fetch from live database API
  React.useEffect(() => {
    fetch("/api/inventory")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load residences");
        return res.json();
      })
      .then((data) => {
        if (!data.success || !Array.isArray(data.units)) throw new Error("Invalid inventory response");
        setRooms(data.units);
      })
      .catch(() => setInventoryLoadFailed(true))
      .finally(() => setRoomsLoading(false));
  }, []);

  // Sync with URL query parameters on mount & navigation
  React.useEffect(() => {
    const handleUrlParams = () => {
      if (typeof window === "undefined") return;

      const sp = new URLSearchParams(window.location.search);
      let branch = sp.get("branch");
      let flatType = sp.get("flatType");
      const checkIn = sp.get("checkIn") || undefined;
      const checkOut = sp.get("checkOut") || undefined;
      const adultsParam = sp.get("adults");
      const kidsParam = sp.get("kids");
      const unitsParam = sp.get("units");

      if (window.location.hash.includes("?")) {
        const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
        if (!branch) branch = hashParams.get("branch");
        if (!flatType) flatType = hashParams.get("flatType");
      }

      if (branch === "barkas-salala" || branch === "moghal-pura") setFilterBranch(branch);
      if (flatType) setFilterType(flatType);
      setSelectedUnits(unitsParam ? Math.max(1, parseInt(unitsParam, 10) || 1) : 1);
      setCart(parseCart(sp.get("cart")) ?? []);

      let nights = 0;
      if (checkIn && checkOut) {
        const inD = parseISO(checkIn);
        const outD = parseISO(checkOut);
        if (!isNaN(inD.getTime()) && !isNaN(outD.getTime())) {
          nights = Math.max(1, differenceInCalendarDays(outD, inD));
        }
      }

      setSearchDates({
        checkIn,
        checkOut,
        adults: adultsParam ? parseInt(adultsParam, 10) : undefined,
        kids: kidsParam ? parseInt(kidsParam, 10) : undefined,
        nights: nights > 0 ? nights : undefined,
      });
    };

    const handleCustomSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{
        branch: string;
        flatType: string;
        checkIn: Date | null;
        checkOut: Date | null;
        adults: number;
        childrenCount: number;
        totalUnits?: number;
        cart?: CartItem[];
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (detail.branch && (detail.branch === "barkas-salala" || detail.branch === "moghal-pura")) {
        setFilterBranch(detail.branch);
      } else if (detail.branch === "all") {
        setFilterBranch("all");
      }

      if (detail.flatType && detail.flatType !== "any") {
        setFilterType(detail.flatType);
      } else {
        setFilterType("all");
      }
      setSelectedUnits(detail.totalUnits && detail.totalUnits > 0 ? detail.totalUnits : 1);
      setCart(Array.isArray(detail.cart) ? detail.cart : []);

      let nights = 0;
      if (detail.checkIn && detail.checkOut) {
        nights = Math.max(1, differenceInCalendarDays(detail.checkOut, detail.checkIn));
      }

      setSearchDates({
        checkIn: detail.checkIn ? format(detail.checkIn, "yyyy-MM-dd") : undefined,
        checkOut: detail.checkOut ? format(detail.checkOut, "yyyy-MM-dd") : undefined,
        adults: detail.adults,
        kids: detail.childrenCount,
        nights: nights > 0 ? nights : undefined,
      });
    };

    handleUrlParams();
    window.addEventListener("popstate", handleUrlParams);
    window.addEventListener("hashchange", handleUrlParams);
    window.addEventListener("flatel:search", handleCustomSearch);
    return () => {
      window.removeEventListener("popstate", handleUrlParams);
      window.removeEventListener("hashchange", handleUrlParams);
      window.removeEventListener("flatel:search", handleCustomSearch);
    };
  }, []);

  // Filtered rooms list
  const filteredRooms = React.useMemo(() => {
    return rooms.filter((room) => {
      if (filterBranch !== "all" && room.branchSlug !== filterBranch) return false;
      if (filterType !== "all") {
        const types = filterType.split(",").map((t) => t.trim().toLowerCase());
        const roomSlug = (room.slug || "").toLowerCase();
        const roomCategory = (room.category || "").toLowerCase();
        const matches = types.some((t) => roomSlug.includes(t) || roomCategory.includes(t) || t.includes(roomSlug));
        if (!matches) return false;
      }
      return true;
    });
  }, [rooms, filterBranch, filterType]);

  // Live availability for the searched dates (one request per visible flat, cancelled on a new search)
  const hasDates = Boolean(searchDates.checkIn && searchDates.checkOut);
  const availabilityKey = hasDates ? `${searchDates.checkIn}|${searchDates.checkOut}|${filteredRooms.map((r) => r.slug).join(",")}` : "";

  React.useEffect(() => {
    if (!availabilityKey) return;
    const [checkIn, checkOut, slugList] = availabilityKey.split("|");
    const slugs = slugList ? slugList.split(",") : [];
    const controller = new AbortController();

    // Mark as loading in a microtask so the effect body itself stays free of synchronous setState
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setAvailability(Object.fromEntries(slugs.map((slug) => [slug, "loading" as const])));
    });

    for (const slug of slugs) {
      const query = new URLSearchParams({ unitId: slug, checkIn, checkOut });
      fetch(`/api/bookings/availability?${query.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { success?: boolean; available?: boolean; verified?: boolean }) => {
          if (controller.signal.aborted) return;
          setAvailability((prev) => ({ ...prev, [slug]: statusFromAvailabilityResponse(data) }));
        })
        .catch(() => {
          if (!controller.signal.aborted) setAvailability((prev) => ({ ...prev, [slug]: "unknown" }));
        });
    }
    return () => controller.abort();
  }, [availabilityKey]);

  const visibleStatus: Record<string, AvailabilityStatus> = hasDates ? availability : {};
  const orderedRooms = sortByAvailability(filteredRooms, visibleStatus);
  const bookableCount = filteredRooms.filter((r) => visibleStatus[r.slug] !== "booked").length;

  const resultsSummary = buildResultsSummary({
    availableCount: bookableCount,
    checkIn: searchDates.checkIn,
    checkOut: searchDates.checkOut,
    adults: searchDates.adults,
    kids: searchDates.kids,
    locale: isAr ? "ar" : "en",
  });

  const multiFlat = isMultiFlatSelection({
    flatTypes: filterType === "all" ? [] : filterType.split(",").filter(Boolean),
    totalUnits: selectedUnits,
  });

  // Several flats chosen: offer one combined booking (same branch, same dates, one payment)
  const groupCart = isGroupCart(cart) ? cart : null;
  const groupRooms = groupCart ? groupCart.map((item) => rooms.find((room) => room.slug === item.slug)) : [];
  const groupKnown = Boolean(groupCart) && !roomsLoading && groupRooms.every(Boolean);
  const groupBranchMix = new Set(groupRooms.filter(Boolean).map((room) => room!.branchSlug)).size > 1;
  const groupUnavailable = groupCart ? groupCart.filter((item) => visibleStatus[item.slug] === "booked") : [];
  const groupEstimate = (() => {
    if (!groupCart || !groupKnown || !searchDates.nights) return null;
    try {
      return groupCart.reduce(
        (sum, item, index) => {
          const room = groupRooms[index]!;
          const fare = calculateFlatelPrice({
            nights: searchDates.nights!,
            basePricePerNight: room.basePricePerNight,
            baseAdults: room.baseAdults,
            selectedAdults: item.adults,
            selectedKids: item.kids,
            extraPersonFee: room.extraPersonFeePerNight,
          });
          return { gross: sum.gross + fare.grossTotal, advance: sum.advance + fare.advancePayable };
        },
        { gross: 0, advance: 0 }
      );
    } catch {
      return null;
    }
  })();
  const groupCheckoutHref =
    groupCart && searchDates.checkIn && searchDates.checkOut
      ? `${localePrefix}/checkout?${new URLSearchParams({ cart: encodeCart(groupCart), checkIn: searchDates.checkIn, checkOut: searchDates.checkOut }).toString()}`
      : null;
  const groupSummary = groupCart
    ? Array.from(
        groupCart.reduce((counts, item, index) => {
          const label = groupRooms[index]?.type ?? item.slug.toUpperCase();
          return counts.set(label, (counts.get(label) ?? 0) + 1);
        }, new Map<string, number>())
      )
        .map(([label, count]) => (count > 1 ? `${count} × ${label}` : label))
        .join(" + ")
    : "";
  const groupBlockedReason = groupBranchMix
    ? isAr
      ? "يجب أن تكون الشقق في فرع واحد. اختر فرعاً واحداً أو احجزها على حدة."
      : "Flats in one combined booking must be at the same branch. Choose one branch, or book them separately."
    : groupUnavailable.length > 0
    ? isAr
      ? "إحدى الشقق غير متاحة في هذه التواريخ. غيّر التواريخ أو الاختيار."
      : "One of these flats isn't available for your dates. Change the dates or your selection."
    : null;

  const clearDates = () => {
    setSearchDates({});
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      for (const key of ["checkIn", "checkOut", "adults", "kids", "units"]) sp.delete(key);
      const q = sp.toString();
      window.history.pushState(null, "", q ? `${localePrefix}/?${q}#flats` : `${localePrefix}/#flats`);
    }
  };

  const editSearch = () => window.dispatchEvent(new CustomEvent("flatel:edit-search"));

  const multiFlatWhatsApp = WHATSAPP_CONFIG.getUrl(
    isAr
      ? "مرحباً فلاتيل، أرغب في حجز أكثر من شقة في نفس الوقت."
      : "Hello Flatel, I'd like to book more than one flat for the same dates."
  );

  const chip = (active: boolean) =>
    cn(
      "px-3.5 min-h-[40px] rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center transition-colors cursor-pointer shrink-0 whitespace-nowrap",
      active
        ? "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold"
        : "text-fg-soft hover:text-fg"
    );

  return (
    <section
      id="flats"
      className={cn(
        "relative w-full bg-canvas text-fg pt-6 sm:pt-8 pb-14 sm:pb-16 lg:pb-20 scroll-mt-16 sm:scroll-mt-20 overflow-hidden",
        className
      )}
      aria-labelledby="featured-flats-heading"
    >
      {/* Ambient Golden Lighting */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-ambient-gold-glow pointer-events-none"
        aria-hidden="true"
      />

      <div id="properties" className="sr-only" aria-hidden="true" />
      <div className="relative container-page z-10">
        {/* Header + one filter row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8 mb-6">
          <div className="max-w-xl">
            <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase">
              {isAr ? "إقامات فندقية مختارة بعناية" : "HANDPICKED RESIDENCES"}
            </span>
            <h2
              id="featured-flats-heading"
              className="mt-2 font-heading text-fg heading-section"
            >
              {isAr ? (
                <>
                  شقق فندقية مفروشة في <span className="text-gold">حيدر أباد</span>
                </>
              ) : (
                <>
                  Serviced Flats in <span className="text-gold">Hyderabad</span>
                </>
              )}
            </h2>
          </div>

          <div
            className="flex items-center gap-1 p-1.5 rounded-full bg-raised/70 border border-line backdrop-blur-md overflow-x-auto no-scrollbar max-w-full -mx-4 sm:mx-0 rounded-none sm:rounded-full border-x-0 sm:border-x"
            role="toolbar"
            aria-label={isAr ? "تصفية الشقق" : "Filter flats"}
          >
            {[
              { id: "all", label: isAr ? "كافة الفروع" : "All branches" },
              { id: "moghal-pura", label: isAr ? "مغل بورا" : "Moghal Pura" },
              { id: "barkas-salala", label: isAr ? "باركاس صلالة" : "Barkas Salala" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={filterBranch === b.id}
                onClick={() => setFilterBranch(b.id)}
                className={chip(filterBranch === b.id)}
              >
                {b.label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px shrink-0 bg-gold/30" aria-hidden="true" />
            {[
              { id: "all", label: isAr ? "كل الأحجام" : "All sizes" },
              { id: "1bhk", label: isAr ? "١ غ + صالة" : "1 BHK" },
              { id: "2bhk", label: isAr ? "٢ غ + صالة" : "2 BHK" },
              { id: "3bhk", label: isAr ? "٣ غ + صالة" : "3 BHK" },
              { id: "4bhk", label: isAr ? "٤ غ + صالة" : "4 BHK" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={filterType === tab.id}
                onClick={() => setFilterType(tab.id)}
                className={chip(filterType === tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary (only after a dated search) */}
        {resultsSummary && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gold/40 bg-raised/85 text-sm" role="status">
            <span className="flex items-center gap-2 text-fg font-medium">
              <CalendarSearch className="w-4 h-4 text-gold" />
              {resultsSummary}
            </span>
            <span className="flex items-center gap-4">
              <button type="button" onClick={editSearch} className="text-gold font-semibold hover:underline cursor-pointer">
                {isAr ? "تعديل البحث" : "Edit search"}
              </button>
              <button
                type="button"
                onClick={clearDates}
                className="text-fg-muted hover:text-fg cursor-pointer inline-flex items-center gap-1"
                aria-label={isAr ? "مسح التواريخ" : "Clear dates"}
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          </div>
        )}

        {/* Several flats chosen: one combined booking */}
        {groupCart && (
          <div className="mb-5 rounded-xl border border-line-strong bg-surface/90 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm sm:text-base font-semibold text-fg">
                {isAr ? `حجز ${groupCart.length} شقق معاً` : `Book ${groupCart.length} flats together`}
                <span className="ms-2 font-normal text-fg-soft">{groupSummary}</span>
              </p>
              {groupEstimate && (
                <p className="text-sm text-fg-soft">
                  {isAr ? "الإجمالي التقريبي " : "Estimated total "}
                  <span className="font-mono font-semibold text-gold">{formatPrice(groupEstimate.gross)}</span>
                  {isAr ? " · العربون " : " · advance "}
                  <span className="font-mono text-fg">{formatPrice(groupEstimate.advance)}</span>
                </p>
              )}
            </div>
            <p className="text-xs text-fg-muted">
              {isAr ? "دفعة واحدة وقسيمة واحدة لجميع الشقق." : "One payment and one voucher for all your flats."}
            </p>
            {groupBlockedReason && (
              <p role="alert" className="text-sm text-danger-soft">{groupBlockedReason}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {groupCheckoutHref && !groupBlockedReason && groupKnown ? (
                <Link
                  href={groupCheckoutHref}
                  className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-sm shadow-md shadow-gold/25 hover:brightness-105"
                >
                  {isAr ? "احجز الشقق معاً" : "Book these flats"}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              ) : !groupCheckoutHref ? (
                <button
                  type="button"
                  onClick={editSearch}
                  className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl border border-line-strong text-gold font-semibold text-sm hover:border-gold cursor-pointer"
                >
                  <CalendarSearch className="w-4 h-4" />
                  {isAr ? "اختر التواريخ للحجز معاً" : "Choose dates to book together"}
                </button>
              ) : null}
              <a href={multiFlatWhatsApp} target="_blank" rel="noopener noreferrer" className="text-sm text-gold font-semibold hover:underline">
                {isAr ? "أو راسلنا عبر واتساب" : "or WhatsApp us"}
              </a>
            </div>
          </div>
        )}

        {/* Several units requested without a flat-by-flat selection (old links): one at a time */}
        {!groupCart && multiFlat && (
          <p className="mb-5 px-4 py-3 rounded-xl border border-line bg-surface/85 text-sm text-fg-soft">
            {isAr ? "تحجز أكثر من شقة؟ احجز كل شقة على حدة، أو " : "Booking multiple flats? Book them one by one, or "}
            <a href={multiFlatWhatsApp} target="_blank" rel="noopener noreferrer" className="text-gold font-semibold hover:underline">
              {isAr ? "راسلنا عبر واتساب وسنحجزها معاً" : "WhatsApp us and we'll hold them together"}
            </a>
            .
          </p>
        )}

        {/* Cards: horizontal swipe on mobile, 4-up grid on desktop */}
        {roomsLoading ? (
          <p className="py-10 text-center text-sm text-fg-soft" role="status">
            {isAr ? "جارٍ تحميل الشقق…" : "Loading current residences…"}
          </p>
        ) : orderedRooms.length > 0 ? (
          <div data-stagger className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-4 sm:gap-5 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {orderedRooms.map((rawRoom) => {
              const room = getLocalizedRoom(rawRoom, currentLocale);
              const branch = room.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
              const imageUrl = FLAT_IMAGES[room.slug] || "/images/flats/flat-1bhk-luxury.jpg";
              const status = visibleStatus[room.slug];
              const booked = status === "booked";

              const queryParams = new URLSearchParams();
              if (searchDates.checkIn) queryParams.set("checkIn", searchDates.checkIn);
              if (searchDates.checkOut) queryParams.set("checkOut", searchDates.checkOut);
              if (searchDates.adults) queryParams.set("adults", searchDates.adults.toString());
              if (searchDates.kids) queryParams.set("kids", searchDates.kids.toString());
              if (!hasDates) queryParams.set("pickDates", "1");
              const detailUrl = `${localePrefix}/properties/${room.slug}?${queryParams.toString()}`;

              const estTotal = room.basePricePerNight * (searchDates.nights || 1);

              const body = (
                <>
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-canvas">
                    <Image
                      src={imageUrl}
                      alt={room.title}
                      fill
                      className={cn(
                        "object-cover object-center transition-transform duration-500 ease-out",
                        !booked && "group-hover:scale-105"
                      )}
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-canvas/20 pointer-events-none" />
                    {branch && (
                      <span className="absolute top-2.5 start-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-fg px-2.5 py-1 rounded-md bg-surface/85 border border-line">
                        <MapPin className="w-3 h-3 text-gold" />
                        {isAr ? (branch.slug === "moghal-pura" ? "مغل بورا" : "باركاس صلالة") : branch.name}
                      </span>
                    )}
                    {hasDates && status && (
                      <span
                        className={cn(
                          "absolute top-2.5 end-2.5 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md",
                          status === "available" && "bg-gradient-to-r from-gold to-gold-deep text-ink",
                          status === "booked" && "bg-surface/92 text-fg-muted border border-line",
                          status === "loading" && "bg-surface/85 text-fg-soft",
                          status === "unknown" && "hidden"
                        )}
                      >
                        {status === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
                        {status === "available" && (isAr ? "متاحة" : "Available")}
                        {status === "booked" && (isAr ? "محجوزة في هذه التواريخ" : "Booked for these dates")}
                        {status === "loading" && (isAr ? "جارٍ التحقق…" : "Checking…")}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="font-heading text-xl sm:text-2xl font-medium text-fg leading-snug group-hover:text-gold transition-colors">
                        {room.title}
                      </h3>
                      <p className="text-sm text-fg-soft mt-1">
                        {room.capacityLabel} · {room.specs.bedrooms}
                      </p>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-3 border-t border-line-soft">
                      <div>
                        <span className="text-xs text-fg-muted">{isAr ? "من" : "from"} </span>
                        <span className="font-heading text-2xl font-medium text-gold tabular-nums">
                          {formatPrice(room.basePricePerNight)}
                        </span>
                        <span className="text-xs text-fg-soft">{isAr ? " / ليلة" : " / night"}</span>
                        {searchDates.nights ? (
                          <span className="block text-xs text-fg-muted mt-0.5">
                            {isAr
                              ? `≈ ${formatPrice(estTotal)} لـ ${searchDates.nights} ليالٍ`
                              : `≈ ${formatPrice(estTotal)} for ${searchDates.nights} nights`}
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-xl text-sm font-bold",
                          booked
                            ? "border border-line text-fg-muted"
                            : "bg-gradient-to-r from-gold to-gold-deep text-ink group-hover:brightness-105"
                        )}
                      >
                        {booked ? (isAr ? "غير متاحة" : "Unavailable") : isAr ? "عرض وحجز" : "View & Book"}
                        {!booked && <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
                      </span>
                    </div>
                  </div>
                </>
              );

              const cardClass = cn(
                "group relative flex flex-col rounded-2xl overflow-hidden bg-surface border min-w-[80vw] sm:min-w-0 snap-center shrink-0 sm:shrink transition-all duration-300",
                booked
                  ? "border-line-soft opacity-55"
                  : "border-line hover:border-gold hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--gold)_20%,transparent)] hover:-translate-y-1"
              );

              return booked ? (
                <div key={room.id} className={cardClass} aria-disabled="true">
                  {body}
                </div>
              ) : (
                <Link key={room.id} href={detailUrl} className={cardClass}>
                  {body}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-raised/70 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl">
            <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto text-gold mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-medium text-fg tracking-normal">
              {inventoryLoadFailed
                ? (isAr ? "تعذر تحميل الوحدات" : "Residences Could Not Be Loaded")
                : rooms.length === 0
                  ? (isAr ? "لا توجد شقق مدرجة حالياً" : "No Residences Are Listed")
                  : (isAr ? "لا توجد شقق مطابقة لهذا الاختيار" : "No Flats Match This Selection")}
            </h3>
            <p className="text-sm sm:text-base text-fg-soft mt-2 leading-relaxed">
              {inventoryLoadFailed
                ? (isAr ? "بيانات الشقق والأسعار غير متاحة مؤقتاً. يرجى المحاولة بعد قليل." : "Current residence and rate information is temporarily unavailable. Please try again shortly.")
                : rooms.length === 0
                  ? (isAr ? "يرجى التحقق لاحقاً من توفر الشقق الفندقية." : "Please check back later for current residence availability.")
                  : filterBranch === "barkas-salala"
                    ? (isAr ? "يتميز فرع باركاس صلالة بشقق ٣ غرف وصالة واسعة. لشقق ١، ٢، و٤ غرف وصالة، تصفح فرع مغل بورا بالقرب من تشارمينار." : "Barkas Salala features spacious 3 BHK residences. For 1, 2, and 4 BHK suites, browse our Moghal Pura branch near Charminar.")
                    : (isAr ? "يرجى تعديل حجم الشقة أو الفرع المختار لعرض الشقق الفندقية المتاحة." : "Try adjusting your flat size or branch selection to view available serviced apartments.")}
            </p>
            {rooms.length > 0 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("all");
                    setFilterBranch("all");
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-sm shadow-md cursor-pointer hover:brightness-105 transition-all min-h-[44px]"
                >
                  {isAr ? "عرض كافة الشقق" : "Show All Residences"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Link to the full catalogue */}
        <div className="mt-8 flex justify-center">
          <Link
            href={`${localePrefix}/properties`}
            className="px-6 min-h-[46px] rounded-xl bg-raised/85 border border-line hover:border-gold text-gold font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all"
          >
            <span>{isAr ? dict.home.exploreResidences : "Explore Full Residences Catalog"}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
