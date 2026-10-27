"use client";

import * as React from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Building2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getBranchBySlug } from "@/lib/constants";
import { PURPOSE_PACKAGES, type RoomDetail } from "@/lib/mock-rooms";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";

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
  const [activePurpose, setActivePurpose] = React.useState<string | null>(null);

  const activePurposePackage = React.useMemo(() => {
    if (!activePurpose) return null;
    return PURPOSE_PACKAGES.find((p) => p.id === activePurpose) || null;
  }, [activePurpose]);

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
      let purpose = sp.get("purpose");
      let branch = sp.get("branch");
      let flatType = sp.get("flatType");
      const checkIn = sp.get("checkIn") || undefined;
      const checkOut = sp.get("checkOut") || undefined;
      const adultsParam = sp.get("adults");
      const kidsParam = sp.get("kids");

      if (window.location.hash.includes("?")) {
        const hashQuery = window.location.hash.split("?")[1];
        const hashParams = new URLSearchParams(hashQuery);
        if (!purpose) purpose = hashParams.get("purpose");
        if (!branch) branch = hashParams.get("branch");
        if (!flatType) flatType = hashParams.get("flatType");
      }

      if (purpose) {
        if (purpose === "medistay") purpose = "medical";
        if (purpose === "wedding") purpose = "family";
        setActivePurpose(purpose);
      }
      if (branch === "barkas-salala" || branch === "moghal-pura") setFilterBranch(branch);
      if (flatType) {
        setFilterType(flatType);
      }

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

    const handleSetPurpose = (e: Event) => {
      const customEvent = e as CustomEvent<{ purpose: string }>;
      if (customEvent.detail?.purpose) {
        let p = customEvent.detail.purpose;
        if (p === "medistay") p = "medical";
        if (p === "wedding") p = "family";
        setActivePurpose(p);
      }
    };

    handleUrlParams();
    window.addEventListener("popstate", handleUrlParams);
    window.addEventListener("hashchange", handleUrlParams);
    window.addEventListener("flatel:search", handleCustomSearch);
    window.addEventListener("flatel:set-purpose", handleSetPurpose);
    return () => {
      window.removeEventListener("popstate", handleUrlParams);
      window.removeEventListener("hashchange", handleUrlParams);
      window.removeEventListener("flatel:search", handleCustomSearch);
      window.removeEventListener("flatel:set-purpose", handleSetPurpose);
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


  return (
    <section
      id="flats"
      className={cn(
        "relative w-full bg-[#0E0A07] text-[#FAF4EB] py-14 sm:py-18 lg:py-20 scroll-mt-16 sm:scroll-mt-20 overflow-hidden",
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
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 z-10">
        {/* ========================================================== */}
        {/* SECTION HEADER: States inclusions ONCE; zero card clutter  */}
        {/* ========================================================== */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
            HANDPICKED RESIDENCES
          </span>
          <h2
            id="featured-flats-heading"
            className="mt-2.5 font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-normal text-[#FAF4EB] leading-[1.12]"
          >
            Serviced Flats in <span className="text-[#E5C178]">Hyderabad</span>
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#D4C4B3] max-w-xl mx-auto leading-relaxed">
            Private modular kitchen, split AC, high-speed Wi-Fi &amp; alternate-day housekeeping included. Lock dates with 20% advance.
          </p>

          {/* Active Purpose Package Highlight Banner */}
          {activePurposePackage && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-[rgba(34,24,16,0.92)] border border-[#E5C178]/50 shadow-xl max-w-2xl mx-auto backdrop-blur-md animate-in fade-in duration-200 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E5C178]/15 border border-[#E5C178]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#E5C178]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-heading font-semibold text-[#E5C178] uppercase tracking-wider">
                        {activePurposePackage.name}
                      </span>
                      <span className="text-xs font-sans text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                        Complimentary Inclusions Active
                      </span>
                    </div>
                    <p className="text-sm text-[#FAF4EB] font-medium leading-relaxed">
                      {activePurposePackage.tagline}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-1 text-xs text-[#D4C4B3]">
                      {activePurposePackage.freeFacilities.slice(0, 3).map((f) => (
                        <span key={f} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#E5C178]" />
                          <span>{f}</span>
                        </span>
                      ))}
                      {activePurposePackage.freeFacilities.length > 3 && (
                        <span className="text-[#E5C178] font-semibold">
                          +{activePurposePackage.freeFacilities.length - 3} more complimentary benefits
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActivePurpose(null);
                    const sp = new URLSearchParams(window.location.search);
                    sp.delete("purpose");
                    const q = sp.toString();
                    window.history.pushState(null, "", q ? `/?${q}#flats` : "/#flats");
                  }}
                  className="text-xs sm:text-sm font-semibold text-[#E5C178] hover:text-[#FAF4EB] underline cursor-pointer shrink-0"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}

          {/* Active Search / Dates Filter Banner */}
          {searchDates.checkIn && searchDates.checkOut && (
            <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-[rgba(34,24,16,0.85)] border border-[#E5C178]/40 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm max-w-2xl mx-auto backdrop-blur-md animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-[#FAF4EB]">
                <div className="w-6 h-6 rounded-lg bg-[#E5C178]/15 border border-[#E5C178]/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C178]" />
                </div>
                <span>
                  Showing rates for <strong className="text-[#E5C178] font-mono">{searchDates.nights} Nights</strong> ({searchDates.checkIn} to {searchDates.checkOut}) · <strong className="text-[#FAF4EB]">{searchDates.adults || 2} Adults{searchDates.kids ? `, ${searchDates.kids} Children` : ""}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchDates({});
                  if (typeof window !== "undefined") {
                    const sp = new URLSearchParams(window.location.search);
                    sp.delete("checkIn");
                    sp.delete("checkOut");
                    sp.delete("adults");
                    sp.delete("kids");
                    const q = sp.toString();
                    window.history.pushState(null, "", q ? `/?${q}#flats` : "/#flats");
                  }
                }}
                className="text-xs sm:text-sm font-semibold text-[#E5C178] hover:text-[#FAF4EB] underline cursor-pointer"
              >
                Clear Dates
              </button>
            </div>
          )}

          {/* Clean, Non-wrapping Filter Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 max-w-full">
            {/* Flat Size Segmented Control */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-[rgba(34,24,16,0.7)] border border-[rgba(212,163,89,0.22)] shadow-xs max-w-full overflow-x-auto no-scrollbar backdrop-blur-md">
              {[
                { id: "all", label: "All (4)" },
                { id: "1bhk", label: "1 BHK" },
                { id: "2bhk", label: "2 BHK" },
                { id: "3bhk", label: "3 BHK" },
                { id: "4bhk", label: "4 BHK" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id as typeof filterType)}
                  className={cn(
                    "px-3.5 sm:px-4 py-2 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap",
                    filterType === tab.id
                      ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold shadow-xs"
                      : "text-[#D4C4B3] hover:text-[#FAF4EB]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Branch Location Segmented Control */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-[rgba(34,24,16,0.7)] border border-[rgba(212,163,89,0.22)] shadow-xs max-w-full overflow-x-auto no-scrollbar backdrop-blur-md">
              {[
                { id: "all", label: "All Branches" },
                { id: "moghal-pura", label: "Moghal Pura" },
                { id: "barkas-salala", label: "Barkas Salala" },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setFilterBranch(b.id as typeof filterBranch)}
                  className={cn(
                    "px-3.5 sm:px-4 py-2 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap",
                    filterBranch === b.id
                      ? "bg-[rgba(22,16,11,0.95)] text-[#E5C178] border border-[rgba(212,163,89,0.35)] font-bold shadow-xs"
                      : "text-[#D4C4B3] hover:text-[#FAF4EB]"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* CARDS: RESPONSIVE HORIZONTAL SNAP-SCROLL ON MOBILE,        */}
        {/* LUXURY 4-COLUMN GRID ON DESKTOP & 2-COL TABLET             */}
        {/* ========================================================== */}
        {roomsLoading ? (
          <p className="py-10 text-center text-sm text-[#D4C4B3]" role="status">
            Loading current residences…
          </p>
        ) : filteredRooms.length > 0 ? (
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-5 sm:gap-6 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {filteredRooms.map((rawRoom) => {
              const room = getLocalizedRoom(rawRoom, currentLocale);
              const branch = room.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
              const imageUrl = FLAT_IMAGES[room.slug] || "/images/flats/flat-1bhk-luxury.jpg";
              const title = room.title;
              const capacity = room.capacityLabel;
              const bedSpec = room.specs.bedrooms;

              const queryParams = new URLSearchParams();
              if (searchDates.checkIn) queryParams.set("checkIn", searchDates.checkIn);
              if (searchDates.checkOut) queryParams.set("checkOut", searchDates.checkOut);
              if (searchDates.adults) queryParams.set("adults", searchDates.adults.toString());
              if (searchDates.kids) queryParams.set("kids", searchDates.kids.toString());
              if (activePurpose) queryParams.set("purpose", activePurpose);

              const qStr = queryParams.toString();
              const detailUrl = `${localePrefix}/properties/${room.slug}${qStr ? `?${qStr}` : ""}`;
              const instantBookUrl = `${localePrefix}/checkout?property=${room.slug}${qStr ? `&${qStr}` : ""}`;

              const estNights = searchDates.nights || 1;
              const estTotal = room.basePricePerNight * estNights;
              const estAdvance = Math.round(estTotal * 0.2);

              return (
                <div
                  key={room.id}
                  className="group relative flex flex-col justify-between rounded-2xl overflow-hidden bg-[#16100B] border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] hover:shadow-[0_16px_36px_rgba(212,163,89,0.2)] hover:-translate-y-1 transition-all duration-300 min-w-[82vw] sm:min-w-0 snap-center shrink-0 sm:shrink"
                >
                  {/* Photo Top Container */}
                  <Link href={detailUrl} className="relative aspect-[16/11] w-full overflow-hidden bg-[#0E0A07] block cursor-pointer">
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover object-center group-hover:scale-106 transition-transform duration-600 ease-out"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/80 via-transparent to-[#0E0A07]/30 pointer-events-none" />

                    {/* Single Clean Location Badge */}
                    {branch && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#FAF4EB] px-2.5 py-1 rounded-md bg-[rgba(22,16,11,0.85)] backdrop-blur-md border border-[rgba(212,163,89,0.25)] shadow-xs">
                          <MapPin className="w-3 h-3 text-[#E5C178]" />
                          <span>{branch.name}</span>
                        </span>
                      </div>
                    )}

                    {/* Purpose Ready Badge */}
                    {activePurposePackage && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#140E08] px-2.5 py-1 rounded-md bg-gradient-to-r from-[#E5C178] to-[#C69344] shadow-xs">
                          <Sparkles className="w-3 h-3 text-[#140E08]" />
                          <span>{activePurposePackage.name.split(" ")[0]} Ready</span>
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Body: Distinct Titles & Clean Specs */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
                    <div>
                      {/* Distinct Flat Title */}
                      <Link href={detailUrl} className="block group-hover:text-[#E5C178] transition-colors">
                        <h3 className="font-heading text-2xl sm:text-[25px] font-medium text-[#FAF4EB] tracking-normal leading-snug">
                          {title}
                        </h3>
                      </Link>

                      {/* Clean Capacity & Bedroom Spec without trailing dots */}
                      <p className="text-sm sm:text-[15px] text-[#D4C4B3] mt-1.5 font-sans font-medium">
                        {capacity} · {bedSpec}
                      </p>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="pt-3.5 border-t border-[rgba(212,163,89,0.18)] space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading text-3xl sm:text-[32px] font-medium text-[#E5C178] tabular-nums">
                              {formatPrice(room.basePricePerNight)}
                            </span>
                            <span className="text-xs sm:text-sm text-[#D4C4B3] font-sans font-medium">/ night</span>
                          </div>
                          {searchDates.nights ? (
                            <span className="text-xs sm:text-[13px] text-[#FAF4EB]/90 font-medium block mt-0.5">
                              Est: {formatPrice(estTotal)} ({searchDates.nights}N) · {formatPrice(estAdvance)} adv.
                            </span>
                          ) : (
                            <span className="text-xs sm:text-[13px] text-[#D4C4B3] font-medium block mt-0.5">Lock with 20% advance</span>
                          )}
                        </div>
                      </div>

                      {/* Dual Action Buttons: View Details & Instant Book (>= 44px touch targets) */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <Link
                          href={detailUrl}
                          className="py-2.5 px-3 min-h-[44px] rounded-xl border border-[rgba(212,163,89,0.35)] bg-[#18110B] hover:bg-[#241A11] hover:border-[#E5C178] text-[#FAF4EB] text-sm font-semibold text-center transition-all cursor-pointer flex items-center justify-center shadow-xs"
                        >
                          {isAr ? dict.common.viewDetails : "Details"}
                        </Link>

                        <Link
                          href={instantBookUrl}
                          className="py-2.5 px-3 min-h-[44px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 active:scale-[0.98] text-[#140E08] text-sm font-bold text-center transition-all shadow-md shadow-[#E5C178]/15 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{isAr ? dict.common.bookNow : "Book"}</span>
                          <ArrowRight className={cn("w-4 h-4 shrink-0", isAr && "rotate-180")} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.7)] p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#E5C178]/15 border border-[#E5C178]/30 flex items-center justify-center mx-auto text-[#E5C178] mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-medium text-[#FAF4EB] tracking-normal">
              {inventoryLoadFailed ? "Residences Could Not Be Loaded" : filteredRooms.length === 0 && rooms.length === 0 ? "No Residences Are Listed" : "No Flats Match This Selection"}
            </h3>
            <p className="text-sm sm:text-base text-[#D4C4B3] mt-2 leading-relaxed">
              {inventoryLoadFailed
                ? "Current residence and rate information is temporarily unavailable. Please try again shortly."
                : rooms.length === 0
                  ? "Please check back later for current residence availability."
                  : filterBranch === "barkas-salala"
                ? "Barkas Salala features spacious 3 BHK residences. For 1, 2, and 4 BHK suites, browse our Moghal Pura branch near Charminar."
                : "Try adjusting your flat size or branch selection to view available serviced apartments."}
            </p>
            {rooms.length > 0 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFilterType("all");
                  setFilterBranch("all");
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm shadow-md cursor-pointer hover:brightness-105 transition-all min-h-[44px]"
              >
                Show All Residences
              </button>
            </div>
            )}
          </div>
        )}

        {/* Editorial Link to Dedicated /properties Catalog */}
        <div className="mt-10 pt-6 border-t border-[rgba(212,163,89,0.18)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm sm:text-base text-[#D4C4B3]">
            Looking for detailed room specifications, floor plans, or group family configurations?
          </p>
          <Link
            href={`${localePrefix}/properties`}
            className="px-6 py-3 min-h-[46px] rounded-xl bg-[rgba(34,24,16,0.85)] border border-[rgba(212,163,89,0.35)] hover:border-[#E5C178] text-[#E5C178] font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>{isAr ? dict.home.exploreResidences : "Explore Full Residences Catalog"}</span>
            <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </Link>
        </div>
      </div>
    </section>
  );
}
