"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { addDays, format, isBefore, startOfToday } from "date-fns";
import {
  MapPin,
  Users,
  BedDouble,
  Bath,
  UtensilsCrossed,
  Zap,
  ExternalLink,
  X,
  ArrowLeft,
  ArrowRight,
  Info,
  ChevronRight,
} from "lucide-react";
import { RoomDetail } from "@/lib/mock-rooms";
import { getBranchBySlug } from "@/lib/constants";
import { RoomGallery } from "@/components/rooms/room-gallery";
import { BookingSidebar } from "@/components/rooms/booking-sidebar";
import { NearbyMap } from "@/components/rooms/nearby-map";
import { PurposeServices } from "@/components/rooms/purpose-services";
import { isPurposeId, pruneAddonsForPurpose } from "@/lib/purpose/purpose-services";
import { nearbyPlaces } from "@/lib/map/places";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import { ARABIC_BRANCH_OVERLAYS } from "@/components/branch-hub";
import { ARABIC_CATEGORIES_TRANSLATIONS } from "@/components/amenities-section";
import { cn } from "@/lib/utils";
import {
  AMENITIES_BENTO,
  getAmenityIllustration,
} from "./room-detail-data";

interface RoomDetailViewProps {
  room: RoomDetail | undefined;
  requestedId: string;
}

function cleanInventoryDescription(value: string): string {
  return value
    .replace(/50\+ Mbps dedicated fiber broadband/gi, "High-speed Wi-Fi")
    .replace(/24\/7 hot water geyser/gi, "water-softening geyser")
    .replace(/step-free ramp and lift to your floor/gi, "passenger elevator access")
    .replace(/100% inverter backup/gi, "inverter power backup")
    .replace(/100% inverter for lights and fans/gi, "inverter power backup");
}

export function RoomDetailView({ room: rawRoom, requestedId }: RoomDetailViewProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const dict = getDictionary(currentLocale);
  const isAr = currentLocale === "ar";
  const localePrefix = isAr ? "/ar" : "";
  const room = React.useMemo(() => {
    return rawRoom ? getLocalizedRoom(rawRoom, currentLocale) : undefined;
  }, [rawRoom, currentLocale]);

  // Stay Purpose State (Allows "accommodation_only" or one of the 5 purposes)
  const [selectedPurposeId, setSelectedPurposeId] = React.useState<
    "medical" | "wedding" | "tourism" | "corporate" | "family" | "accommodation_only" | null
  >(null);
  const [selectedAddonIds, setSelectedAddonIds] = React.useState<string[]>([]);
  // Arrived from a search without dates: open the date picker so the guest chooses them first
  const [autoOpenCheckIn, setAutoOpenCheckIn] = React.useState(false);

  // Modals
  const [amenitiesModalOpen, setAmenitiesModalOpen] = React.useState(false);
  const [policiesModalOpen, setPoliciesModalOpen] = React.useState(false);

  // Controlled booking dates & guest count
  const [checkIn, setCheckIn] = React.useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = React.useState<Date | undefined>(undefined);
  const [adults, setAdults] = React.useState<number>(room?.baseAdults || 2);
  const [childrenCount, setChildrenCount] = React.useState<number>(0);
  const [selectedBranchSlug] = React.useState<string>(room?.branchSlug || "moghal-pura");
  const [branchInventory, setBranchInventory] = React.useState<RoomDetail[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    fetch("/api/inventory")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { success?: boolean; units?: RoomDetail[] } | null) => {
        if (isMounted && data?.success && Array.isArray(data.units)) setBranchInventory(data.units);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Initialize dates, guests, purpose and addons safely from URL search params
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const urlCheckIn = sp.get("checkIn");
        const urlCheckOut = sp.get("checkOut");
        const urlAdults = sp.get("adults");
        const urlKids = sp.get("kids") || sp.get("children");
        const urlPurpose = sp.get("purpose");
        const urlAddons = sp.get("addons");
        if (sp.get("pickDates") === "1") setAutoOpenCheckIn(true);

        // 1. Dates
        let parsedIn: Date | undefined = undefined;
        let parsedOut: Date | undefined = undefined;

        if (urlCheckIn) {
          const d = new Date(urlCheckIn);
          if (!isNaN(d.getTime()) && !isBefore(d, startOfToday())) {
            parsedIn = d;
          }
        }
        if (urlCheckOut) {
          const d = new Date(urlCheckOut);
          if (!isNaN(d.getTime())) {
            parsedOut = d;
          }
        }

        if (parsedIn && parsedOut && isBefore(parsedIn, parsedOut)) {
          setCheckIn(parsedIn);
          setCheckOut(parsedOut);
        } else if (parsedIn) {
          setCheckIn(parsedIn);
          setCheckOut(addDays(parsedIn, 2));
        } else {
          setCheckIn(addDays(new Date(), 1));
          setCheckOut(addDays(new Date(), 3));
        }

        // 2. Guests
        if (urlAdults) {
          const a = parseInt(urlAdults, 10);
          if (!isNaN(a) && a >= 1) {
            setAdults(Math.min(a, room?.maxAdults || 8));
          }
        }

        if (urlKids) {
          const k = parseInt(urlKids, 10);
          if (!isNaN(k) && k >= 0) {
            const maxKids = room?.maxChildren ?? 10;
            setChildrenCount(Math.min(k, maxKids));
          }
        }

        // 3. Stay Purpose
        if (
          urlPurpose &&
          ["medical", "wedding", "tourism", "corporate", "family", "accommodation_only"].includes(urlPurpose)
        ) {
          setSelectedPurposeId(urlPurpose as typeof selectedPurposeId);
        } else {
          setSelectedPurposeId(null);
        }

        // 4. Addons (only those sold with the chosen purpose)
        if (urlAddons) {
          const ids = urlAddons.split(",").filter(Boolean);
          const purposeForAddons = isPurposeId(urlPurpose) ? urlPurpose : null;
          setSelectedAddonIds(pruneAddonsForPurpose(ids, purposeForAddons));
        }
      } else {
        setCheckIn(addDays(new Date(), 1));
        setCheckOut(addDays(new Date(), 3));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [room?.maxAdults, room?.maxChildren]);

  // Lock body scroll when modals are open
  React.useEffect(() => {
    if (amenitiesModalOpen || policiesModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setAmenitiesModalOpen(false);
          setPoliciesModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [amenitiesModalOpen, policiesModalOpen]);

  const branch = room?.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
  const branchOverlay = isAr && branch?.slug ? ARABIC_BRANCH_OVERLAYS[branch.slug] : null;
  const branchName = branchOverlay?.badge || branch?.name || (isAr ? "حيدر أباد" : "Hyderabad");
  const branchAddress = branchOverlay?.address || branch?.address || "";

  // Filter other suites at this branch (strictly excluding the current room)
  const branchSuites = branchInventory.filter(
    (r) =>
      r.branchSlug === (selectedBranchSlug || branch?.slug || "moghal-pura") &&
      r.id !== room?.id &&
      r.slug !== room?.slug
  );

  const buildSuiteUrl = (suiteSlug: string) => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    if (adults) params.set("adults", adults.toString());
    if (childrenCount > 0) params.set("kids", childrenCount.toString());
    if (selectedPurposeId) params.set("purpose", selectedPurposeId);
    const qStr = params.toString();
    return `${localePrefix}/properties/${suiteSlug}${qStr ? `?${qStr}` : ""}`;
  };

  // Changing purpose drops add-ons that belong to another purpose, so nothing hidden stays in the price
  const handleSelectPurpose = (purpose: typeof selectedPurposeId) => {
    setSelectedPurposeId(purpose);
    setSelectedAddonIds((prev) => pruneAddonsForPurpose(prev, purpose));
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Dynamic Amenities with 3D miniature illustrations & verified specifications
  const essentialAmenities = React.useMemo(() => {
    if (!room) return [];
    if (room.amenities && room.amenities.length > 0) {
      return room.amenities.map((a) => {
        const lower = a.name.toLowerCase();
        const desc = isAr
          ? (a.description || "مشمول مجاناً في الشقة")
          : (lower.includes("wi-fi") || lower.includes("wifi")
            ? "High-speed Wi-Fi"
            : lower.includes("kitchen")
              ? "Private kitchen with cooking facilities"
              : lower.includes("geyser")
                ? "Water-softening geyser"
                : lower.includes("tv")
                  ? "Smart TV"
                  : lower.includes("refrigerator") || lower.includes("fridge")
                    ? "Refrigerator"
                    : lower.includes("lift") || lower.includes("elevator")
                      ? "Passenger elevator access"
                      : lower.includes("water supply")
                        ? "Water supply"
                        : lower.includes("water")
                          ? "RO water purifier"
                          : lower.includes("power") || lower.includes("inverter") || lower.includes("backup")
                            ? "Inverter power backup"
                            : lower.includes("ac") || lower.includes("conditioning")
                              ? "Air conditioning"
                              : a.description && a.description !== "Verified flat inclusion"
                                ? a.description
                                : "Included with this residence");
        return {
          title: a.name,
          desc,
          image: getAmenityIllustration(a.name),
        };
      });
    }
    return [
      {
        title: "Air Conditioning",
        desc: "Air conditioning",
        image: "/images/amenities/icon-air-conditioning.png",
      },
      {
        title: "High-Speed Wi-Fi",
        desc: "High-speed Wi-Fi",
        image: "/images/amenities/icon-high-speed-wifi.png",
      },
      {
        title: "Private Modular Kitchen",
        desc: "Gas stove, refrigerator, RO water and cookware",
        image: "/images/amenities/icon-kitchen-dining.png",
      },
      {
        title: "Laundry Washing Machine",
        desc: "In-unit / on-demand laundry support",
        image: "/images/amenities/icon-laundry-washing.png",
      },
      {
        title: "Alternate-Day Housekeeping",
        desc: "Scheduled sanitization & fresh linens",
        image: "/images/amenities/icon-housekeeping.png",
      },
      {
        title: "Inverter Power Backup",
        desc: "Inverter power backup",
        image: "/images/amenities/icon-power-backup.png",
      },
      {
        title: "Passenger Elevator Lift",
        desc: "Passenger elevator access",
        image: "/images/amenities/icon-elevator.png",
      },
    ];
  }, [room, isAr]);

  // Room landmarks when listed; otherwise the nearest mapped places with straight-line distance
  const roomLandmarks = room?.landmarks;
  const roomBranchSlug = room?.branchSlug;
  const landmarks = React.useMemo(() => {
    if (roomLandmarks && roomLandmarks.length > 0) return roomLandmarks;
    if (!roomBranchSlug) return [];
    return nearbyPlaces(roomBranchSlug, 6).map((place) => ({
      name: isAr ? place.nameAr : place.name,
      time: isAr ? `≈${place.km.toFixed(1)} كم` : `${place.km.toFixed(1)} km`,
      dist: "",
    }));
  }, [roomLandmarks, roomBranchSlug, isAr]);

  if (!room) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-24 text-center select-none">
        <h1 className="font-heading text-fg heading-page">
          {isAr ? "الشقة غير موجودة" : "Residence Not Found"}
        </h1>
        <p className="text-sm text-fg-muted mt-2">
          {isAr
            ? `لم يتم العثور على الشقة برمز "${requestedId}".`
            : `The requested apartment ID "${requestedId}" was not found.`}
        </p>
        <Link
          href={`${localePrefix}/#flats`}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs shadow-md hover:opacity-95 transition-opacity"
        >
          <ArrowLeft className={cn("w-4 h-4", isAr && "rotate-180")} />
          <span>{isAr ? "استكشف كافة الشقق الفندقية" : "Explore All Residences"}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full pb-36 sm:pb-36 lg:pb-24 text-foreground bg-background select-none min-h-screen">
      {/* ======================================================== */}
      {/* 1. TOP BREADCRUMB NAVIGATION                             */}
      {/* ======================================================== */}
      <nav
        aria-label="Breadcrumb"
        className="w-full border-b border-line-soft bg-surface/60"
      >
        <div className="container-page py-2.5 sm:py-3 flex items-center justify-between text-xs text-fg-muted">
          <div className="flex items-center gap-2 min-w-0">
            <Link href={localePrefix || "/"} className="hover:text-fg transition-colors shrink-0">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className={cn("h-3 w-3 text-gold/60 shrink-0", isAr && "rotate-180")} />
            <Link href={`${localePrefix}/properties`} className="hover:text-fg transition-colors shrink-0">
              {dict.nav.properties}
            </Link>
            <ChevronRight className={cn("h-3 w-3 text-gold/60 shrink-0", isAr && "rotate-180")} />
            {branch && (
              <>
                <Link href={`${localePrefix}/branches/${branch.slug}`} className="hover:text-fg transition-colors shrink-0">
                  {branchName}
                </Link>
                <ChevronRight className={cn("h-3 w-3 text-gold/60 shrink-0", isAr && "rotate-180")} />
              </>
            )}
            <span className="text-fg font-medium truncate">
              {room.title}
            </span>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA                                     */}
      {/* ======================================================== */}
      <div className="container-page pt-5 sm:pt-6 space-y-8">
        {/* PROPERTY PHOTO GALLERY */}
        <RoomGallery images={room.gallery} roomTitle={room.title} category={room.category} branchSlug={room.branchSlug} />

        {/* 2-COLUMN LUXURY ARCHITECTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ====================================================== */}
          {/* LEFT COLUMN: Property Details, Amenities, Personalize  */}
          {/* ====================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* ── 1. PROPERTY HEADER & SPECS ── */}
            <section className="space-y-4">
              <div>
                <span className="text-xs font-sans font-medium tracking-[0.14em] uppercase text-gold">
                  {isAr
                    ? `شقق فندقية مجهزة · ${branchName}`
                    : `FLATEL SERVICED RESIDENCE · ${branch?.name?.toUpperCase() || "HYDERABAD"}`}
                </span>
                <h1 data-flat-title className="font-heading text-fg mt-1 heading-page">
                  {room.title}
                </h1>
              </div>

              {/* Location and directions */}
              <div className="flex items-center gap-x-5 gap-y-1 text-sm text-fg-muted flex-wrap">
                <div className="flex items-center gap-1 text-fg/90">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>{branchAddress || "Hyderabad"}</span>
                </div>
                {branch?.googleMapsUrl && (
                  <>
                        <a
                      href={branch.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>{isAr ? "خرائط Google" : "Google Maps"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>

              {/* Minimalist Specs Row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-1 text-sm text-fg">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold" />
                  <span>{isAr ? `حتى ${room.maxAdults} ضيوف` : `Up to ${room.maxAdults} Guests`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-gold" />
                  <span>{room.specs.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-gold" />
                  <span>{room.specs.bathroom}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-gold" />
                  <span>{isAr ? "مطبخ مجهز بالكامل" : "Modular Kitchen"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-gold" />
                  <span>{isAr ? "مولد طاقة احتياطي" : "Inverter Backup"}</span>
                </div>
              </div>

              {/* Nightly Price Banner for immediate understanding */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="font-heading text-2xl sm:text-3xl font-normal text-fg tabular-nums">
                  ₹{room.basePricePerNight.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-fg-muted">{isAr ? "/ ليلة" : "/ night"}</span>
                <span className="text-xs text-gold font-medium ml-2">
                  {isAr ? "عربون ٢٠٪ فقط لتأكيد الحجز" : "Pay 20% now to confirm"}
                </span>
              </div>

              {/* Short Readable Property Description */}
              <p className="text-sm sm:text-base text-fg-muted leading-relaxed pt-1 font-normal">
                {cleanInventoryDescription(room.shortDescription)}
              </p>

              {room.fullDescription && room.fullDescription !== room.shortDescription && (
                <p className="text-xs sm:text-sm text-fg-muted/90 leading-relaxed pt-1 font-normal">
                  {cleanInventoryDescription(room.fullDescription)}
                </p>
              )}
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/22 to-transparent" aria-hidden="true" />

            {/* ── 2. PURPOSE-FIRST SERVICES ── */}
            <section aria-label={isAr ? "خدمات حسب الغرض من الإقامة" : "Services for your stay purpose"}>
              <PurposeServices
                selectedPurposeId={selectedPurposeId}
                selectedAddonIds={selectedAddonIds}
                onSelectPurpose={handleSelectPurpose}
                onToggleAddon={handleToggleAddon}
              />
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/22 to-transparent" aria-hidden="true" />

            {/* ── 2. INCLUDED WITH YOUR FLAT ── */}
            <section data-reveal className="space-y-4" aria-labelledby="amenities-heading">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <h2 id="amenities-heading" className="font-heading text-fg heading-sub">
                    {isAr ? "المزايا المشمولة في الشقة" : "Included with your flat"}
                  </h2>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {isAr
                      ? "مشمولة مجاناً في سعر إقامتك دون أي رسوم إضافية."
                      : "Included in your accommodation at no extra charge."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAmenitiesModalOpen(true)}
                  className="text-xs font-semibold text-gold hover:text-fg cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <span>{isAr ? "عرض كافة المزايا والخدمات" : "View all amenities"}</span>
                  <span className={cn(isAr && "rotate-180")}>→</span>
                </button>
              </div>

              {/* 8 Key Included Amenities: 2-Col Compact on Mobile, 4-Col on Desktop */}
              <div data-stagger className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                {essentialAmenities.map((item) => {
                  return (
                    <div
                      key={item.title}
                      className="group flex flex-col sm:flex-row items-start gap-2 sm:gap-3 py-2"
                    >
                      <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-surface border border-line group-hover:border-gold/60 flex items-center justify-center shrink-0 overflow-hidden p-1 transition-colors shadow-xs">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="44px"
                          className="object-contain p-0.5 group-hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-200"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-fg leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-xs text-fg-muted mt-0.5 leading-snug line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/22 to-transparent" aria-hidden="true" />

            {/* ── 3. LOCATION & NEARBY PLACES ── */}
            <section data-reveal className="space-y-4" aria-labelledby="location-heading">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <h2 id="location-heading" className="font-heading text-fg heading-sub">
                    {isAr ? "ما الذي يوجد بالقرب؟" : "What's nearby"}
                  </h2>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {isAr
                      ? `يقع في ${branchName}. استخدم الخريطة للتوجيه المباشر.`
                      : `Located in ${branch?.name || "Hyderabad"}. Use the map for directions.`}
                  </p>
                </div>
                {branch?.googleMapsUrl && (
                  <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gold hover:text-fg transition-colors"
                  >
                    {isAr ? "فتح التوجيه عبر خرائط Google ←" : "Open Google Maps Navigation →"}
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <ul className="divide-y divide-line-soft border-y border-line-soft text-xs">
                  {landmarks.map((lm) => (
                    <li key={lm.name} className="px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-fg font-medium text-xs">{lm.name}</span>
                      <span className="font-sans text-xs text-gold shrink-0 font-semibold tabular-nums">
                        {lm.time || lm.dist || ""}
                      </span>
                    </li>
                  ))}
                </ul>
                {branch?.slug && <NearbyMap branchSlug={branch.slug} googleMapsUrl={branch.googleMapsUrl} />}
              </div>
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/22 to-transparent" aria-hidden="true" />

            {/* ── 5. POLICIES & HOUSE RULES ── */}
            <section data-reveal className="space-y-4" aria-labelledby="policies-heading">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <h2 id="policies-heading" className="font-heading text-fg heading-sub">
                    {isAr ? "سياسات الإقامة وشروط الحجز" : "Stay Policies & House Rules"}
                  </h2>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {isAr
                      ? "شروط ميسرة وواضحة لتسجيل الوصول والدفع والإلغاء."
                      : "Simple check-in, payment, and cancellation terms."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPoliciesModalOpen(true)}
                  className="text-xs font-semibold text-gold hover:text-fg cursor-pointer transition-colors"
                >
                  {isAr ? "عرض سياسة الإلغاء الكاملة ←" : "View full cancellation policy →"}
                </button>
              </div>

              <div data-stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-fg-muted">
                <div className="space-y-1">
                  <h3 className="text-fg font-medium text-xs">
                    {isAr ? "تسجيل الوصول والمغادرة" : "Check-In & Check-Out"}
                  </h3>
                  <p className="text-xs leading-relaxed text-fg-muted">
                    {isAr ? (
                      <>
                        تسجيل الوصول: <span className="font-medium text-fg">١١:٠٠ ص – ١:٠٠ م</span>
                        <br />
                        تسجيل المغادرة: حتى <span className="font-medium text-fg">١١:٠٠ ص</span>
                      </>
                    ) : (
                      <>
                        Check-in: <span className="font-medium text-fg">11:00 AM – 1:00 PM</span>
                        <br />
                        Check-out: By <span className="font-medium text-fg">11:00 AM</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-fg font-medium text-xs">
                    {isAr ? "شروط الدفع" : "Payment Terms"}
                  </h3>
                  <p className="text-xs leading-relaxed text-fg-muted">
                    {isAr ? (
                      <>
                        عربون <span className="font-medium text-fg">٢٠٪</span> عبر الإنترنت لتثبيت الحجز
                        <br />
                        الرصيد المتبقي <span className="font-medium text-fg">٨٠٪</span> عند الوصول (نقداً أو UPI)
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-fg">20%</span> advance payable online to reserve
                        <br />
                        <span className="font-medium text-fg">80%</span> remaining balance at check-in (Cash / UPI)
                      </>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-fg font-medium text-xs">
                    {isAr ? "سياسة الإلغاء" : "Cancellation Policy"}
                  </h3>
                  <p className="text-xs leading-relaxed text-fg-muted">
                    {isAr ? (
                      <>
                        استرداد <span className="font-medium text-fg">١٠٠٪</span> حتى <span className="font-medium text-fg">٤٨ ساعة</span> قبل الوصول. غير مسترد خلال <span className="font-medium text-fg">٤٨ ساعة</span>. الخدمات الإضافية غير قابلة للاسترداد دائماً.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-fg">100%</span> refund up to <span className="font-medium text-fg">48 hrs</span> before check-in. Non-refundable within <span className="font-medium text-fg">48 hrs</span>. Additional services are always non-refundable.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ====================================================== */}
          {/* RIGHT COLUMN: Sticky Booking Panel                     */}
          {/* ====================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain flatel-thin-scroll space-y-4">
            <div id="reservation-panel" className="w-full max-w-xl mx-auto lg:max-w-none">
              <React.Suspense
                fallback={
                  <div className="h-[400px] w-full animate-pulse rounded-3xl border border-line-soft bg-surface" />
                }
              >
                <BookingSidebar
                  room={room}
                  selectedPurposeId={selectedPurposeId}
                  selectedAddonIds={selectedAddonIds}
                  onSelectPurpose={handleSelectPurpose}
                  onToggleAddon={handleToggleAddon}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  adults={adults}
                  childrenCount={childrenCount}
                  onCheckInChange={setCheckIn}
                  onCheckOutChange={setCheckOut}
                  onAdultsChange={setAdults}
                  onChildrenChange={setChildrenCount}
                  autoOpenCheckIn={autoOpenCheckIn}
                />
              </React.Suspense>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. OTHER RESIDENCES AT THIS BRANCH (Full Width Below)    */}
        {/* ======================================================== */}
        {branchSuites.length > 0 && (
          <section data-reveal className="space-y-4 pt-6 border-t border-line-soft" aria-labelledby="other-flats-heading">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <h2 id="other-flats-heading" className="font-heading text-fg heading-sub">
                  {isAr ? `شقق أخرى في فرع ${branchName}` : `Other Residences at ${branch?.name || "This Location"}`}
                </h2>
                <p className="text-xs text-fg-muted mt-0.5">
                  {isAr ? "قارن بين فئات الشقق الأخرى المتاحة في هذا الفرع." : "Compare other available BHK configurations at this branch."}
                </p>
              </div>
              <span className="text-xs text-gold font-medium hidden sm:inline">
                {isAr ? "استكشف المزيد من الوحدات" : "Explore more configurations"}
              </span>
            </div>

            {/* Mobile: Horizontal Swipeable Snap Slider; Tablet/Desktop: Grid */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 sm:pb-0 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {branchSuites.map((s) => {
                const localizedS = getLocalizedRoom(s, currentLocale);
                const suiteImage = s.gallery?.[0]?.url || "/images/flats/flat-1bhk-luxury.jpg";
                return (
                  <div
                    key={s.id}
                    className="w-[280px] sm:w-auto shrink-0 snap-start group relative flex flex-col justify-between rounded-2xl bg-raised/65 p-3.5 border border-line hover:border-gold/60 hover:shadow-md transition-all backdrop-blur-sm"
                  >
                    {/* Property Image & Badge */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-surface">
                      <Image
                        src={suiteImage}
                        alt={localizedS.title}
                        fill
                        sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Top-left: BHK Type Label */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-surface/90 backdrop-blur-md border border-line text-xs font-sans uppercase tracking-wider text-gold font-semibold">
                          {s.type}
                        </span>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="pt-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-sans text-sm sm:text-base font-semibold text-fg truncate group-hover:text-gold transition-colors">
                          {localizedS.title}
                        </h3>

                        <p className="text-xs text-fg-muted flex items-center gap-1.5 mt-1 truncate">
                          <Users className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>
                            {isAr
                              ? `حتى ${s.maxAdults} ضيوف • ${localizedS.specs.bedrooms}`
                              : `Up to ${s.maxAdults} Guests • ${s.specs.bedrooms}`}
                          </span>
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="mt-3">
                        <div className="pt-2 border-t border-line-soft flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="font-heading text-base font-normal text-fg tabular-nums">
                              ₹{s.basePricePerNight.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-fg-muted">{isAr ? "/ ليلة" : "/ night"}</span>
                          </div>
                          <span className="text-xs text-gold font-medium">
                            {isAr ? "عربون ٢٠٪" : "20% Advance"}
                          </span>
                        </div>

                        <Link
                          href={buildSuiteUrl(s.slug)}
                          className="w-full mt-2.5 h-9 rounded-xl bg-surface hover:bg-gradient-to-r hover:from-gold hover:to-gold-deep border border-line hover:border-transparent text-fg hover:text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] group/btn cursor-pointer"
                        >
                          <span>{isAr ? "عرض التفاصيل" : "View Residence"}</span>
                          <ArrowRight className={cn("w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform", isAr && "rotate-180")} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>


      {/* ======================================================== */}
      {/* MODAL 1: COMPLETE INCLUDED AMENITIES MODAL              */}
      {/* ======================================================== */}
      {amenitiesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-canvas/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setAmenitiesModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface border border-line shadow-2xl text-fg p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line-soft pb-4">
              <div>
                <h3 className="font-heading text-xl font-normal text-fg">
                  {isAr ? "مزايا وتجهيزات الشقة الفندقية" : "Residence amenities"}
                </h3>
                <p className="text-xs text-fg-muted mt-0.5">
                  {isAr
                    ? `قائمة المزايا والتجهيزات المتوفرة في ${room.title} (${branchName}).`
                    : `Amenities listed for ${room.title} (${branch?.name || "Hyderabad"}).`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAmenitiesModalOpen(false)}
                className="h-8 w-8 rounded-full bg-raised hover:bg-raised-hover text-fg flex items-center justify-center border border-line cursor-pointer transition-colors"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informational Notice */}
            <div className="p-3.5 rounded-2xl bg-raised/70 border border-line-soft text-xs text-fg-muted flex items-start gap-2.5">
              <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? "تجهيزات الشقق مشمولة تلقائياً وبشكل مجاني بالكامل في السعر الإجمالي للإقامة دون أي رسوم إضافية خفية."
                  : "Property amenities are compulsory inclusions in the accommodation price for the flats where they are provided. They are purely informational and not separately selectable or chargeable."}
              </p>
            </div>

            {/* 6 Real Categories from AMENITIES_BENTO */}
            <div className="space-y-6">
              {AMENITIES_BENTO.map((cat) => {
                const catIllustration = getAmenityIllustration(cat.category);
                const catKey = cat.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
                const catAr = isAr
                  ? (catKey.includes("living")
                    ? ARABIC_CATEGORIES_TRANSLATIONS["living-bedroom"]
                    : catKey.includes("kitchen")
                    ? ARABIC_CATEGORIES_TRANSLATIONS["kitchen-dining"]
                    : catKey.includes("bath")
                    ? ARABIC_CATEGORIES_TRANSLATIONS["bathroom-care"]
                    : catKey.includes("power") || catKey.includes("laundry")
                    ? ARABIC_CATEGORIES_TRANSLATIONS["power-laundry"]
                    : catKey.includes("service") || catKey.includes("hospitality")
                    ? ARABIC_CATEGORIES_TRANSLATIONS["hospitality-care"]
                    : ARABIC_CATEGORIES_TRANSLATIONS["family-recreation"])
                  : null;

                const catTitle = catAr?.title || cat.category;
                const catDesc = catAr?.subtitle || cat.description;

                return (
                  <div key={cat.category} className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                        <Image
                          src={catIllustration}
                          alt={catTitle}
                          fill
                          sizes="28px"
                          className="object-contain"
                        />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-fg">
                        {catTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-fg-muted italic">
                      {catDesc}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.items.map((it) => {
                        const itemIllustration = getAmenityIllustration(it.name);
                        let itemName = it.name;
                        if (isAr) {
                          const itLower = it.name.toLowerCase();
                          if (itLower.includes("wi-fi") || itLower.includes("wifi")) itemName = "إنترنت واي فاي فائق السرعة";
                          else if (itLower.includes("ac") || itLower.includes("air")) itemName = "تكييف سبليت مستقل";
                          else if (itLower.includes("tv")) itemName = "شاشة ذكية مع تطبيقات البث";
                          else if (itLower.includes("fridge") || itLower.includes("refrigerator")) itemName = "ثلاجة كبيرة ببابين";
                          else if (itLower.includes("gas") || itLower.includes("stove")) itemName = "موقد غاز بالغاز الطبيعي";
                          else if (itLower.includes("geyser") || itLower.includes("water heater")) itemName = "سخان مياه فوري";
                          else if (itLower.includes("ro") || itLower.includes("purifier")) itemName = "فلتر مياه نقي RO";
                          else if (itLower.includes("inverter") || itLower.includes("backup")) itemName = "مولد كهرباء احتياطي ٢٤/٧";
                          else if (itLower.includes("laundry") || itLower.includes("washer")) itemName = "غسالة ملابس آلية";
                          else if (itLower.includes("elevator") || itLower.includes("lift")) itemName = "مصعد كهربائي مريح";
                          else if (itLower.includes("kitchen")) itemName = "مطبخ مجهز بالكامل";
                          else if (itLower.includes("housekeeping")) itemName = "تنظيف دوري مع بياضات نقية";
                          else if (itLower.includes("bed") || itLower.includes("linen")) itemName = "بياضات وأغطية نقية";
                          else if (itLower.includes("desk") || itLower.includes("laptop")) itemName = "مكتب عمل مريح";
                        }

                        return (
                          <div
                            key={it.name}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-raised border border-line-soft text-xs text-fg"
                          >
                            <div className="relative w-6 h-6 rounded-md bg-surface border border-line flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                              <Image
                                src={itemIllustration}
                                alt={itemName}
                                fill
                                sizes="24px"
                                className="object-contain"
                              />
                            </div>
                            <span className="truncate">{itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-line-soft pt-4 flex items-center justify-between text-xs">
              <span className="text-fg-muted font-mono">
                {isAr ? "مشمولة في السعر الأساسي للإقامة • رسوم إضافية ₹٠" : "Included in base nightly rent • ₹0 extra fee"}
              </span>
              <button
                type="button"
                onClick={() => setAmenitiesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs cursor-pointer shadow-md hover:opacity-95"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FULL POLICIES MODAL                            */}
      {/* ======================================================== */}
      {policiesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-canvas/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPoliciesModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface border border-line shadow-2xl text-fg p-6 space-y-5 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="font-heading text-lg font-normal text-fg">
                {isAr ? "سياسات الإقامة والإلغاء في فلاتيل" : "FLATEL Stay & Cancellation Policies"}
              </h3>
              <button
                type="button"
                onClick={() => setPoliciesModalOpen(false)}
                className="h-7 w-7 rounded-full bg-raised hover:bg-raised-hover text-fg flex items-center justify-center border border-line cursor-pointer transition-colors"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-fg-muted leading-relaxed">
              <div>
                <strong className="text-fg block font-semibold mb-1">
                  {isAr ? "الدفع المسبق والرصيد المتبقي" : "Advance Payment & Balance"}
                </strong>
                <p>
                  {isAr ? (
                    <>
                      يتم تأكيد الحجز إلكترونياً بدفع عربون <span className="font-serif tabular-nums text-fg">٢٠٪</span> فقط عبر الإنترنت. الرصيد المتبقي وقدره <span className="font-serif tabular-nums text-fg">٨٠٪</span> يسدد عند استلام الشقة نقداً أو عبر UPI.
                    </>
                  ) : (
                    <>
                      Reservations are secured with a <span className="font-serif tabular-nums text-fg">20%</span> online advance deposit. The remaining <span className="font-serif tabular-nums text-fg">80%</span> balance
                      is strictly payable at check-in by Cash or UPI.
                    </>
                  )}
                </p>
              </div>

              <div>
                <strong className="text-fg block font-semibold mb-1">
                  {isAr ? "الإلغاء والاسترداد" : "Cancellation & Refunds"}
                </strong>
                <p>
                  {isAr ? (
                    <>
                      • إلغاء مجاني (استرداد <span className="font-serif tabular-nums text-fg">١٠٠٪</span> من العربون): عند الإلغاء قبل <span className="font-serif tabular-nums text-fg">٤٨ ساعة</span> أو أكثر من موعد تسجيل الوصول (<span className="font-serif tabular-nums text-fg">١١:٠٠ صباحاً</span>).
                      <br />
                      • غير مسترد: عند الإلغاء خلال <span className="font-serif tabular-nums text-fg">٤٨ ساعة</span> من موعد الوصول يعتبر العربون (<span className="font-serif tabular-nums text-fg">٢٠٪</span>) غير مسترد كرسوم حجز وتثبيت للوحدة.
                      <br />
                      • الخدمات الإضافية تُدفع كاملة وقت الحجز وهي غير قابلة للاسترداد دائماً.
                    </>
                  ) : (
                    <>
                      • Free Cancellation (<span className="font-serif tabular-nums text-fg">100%</span> Refund of 20% advance deposit): If cancelled <span className="font-serif tabular-nums text-fg">48 hours</span> or more prior to check-in (<span className="font-serif tabular-nums text-fg">11:00 AM</span>).
                      <br />
                      • Non-Refundable: Cancellations made within <span className="font-serif tabular-nums text-fg">48 hours</span> of check-in forfeit the <span className="font-serif tabular-nums text-fg">20%</span> advance deposit (date reservation hold fee).
                      <br />
                      • Additional services are paid in full at booking and are always non-refundable.
                    </>
                  )}
                </p>
              </div>

              <div>
                <strong className="text-fg block font-semibold mb-1">
                  {isAr ? "إثبات الهوية الإلزامي" : "Mandatory Photo Identification"}
                </strong>
                <p>
                  {isAr
                    ? "يشترط تقديم إثبات هوية رسمي ساري المفعول (الهوية الوطنية / رخصة القيادة للضيوف المحليين، أو جواز السفر الأصلي للضيوف الدوليين) لجميع النزلاء البالغين."
                    : "Original government-issued photo ID (Aadhaar / Driving License / Voter ID) is required for all domestic adults. International guests must present an original passport."}
                </p>
              </div>
            </div>

            <div className="border-t border-line-soft pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPoliciesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs cursor-pointer shadow-md hover:opacity-95"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
