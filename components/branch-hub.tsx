"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  ArrowRight,
  Compass,
  Navigation,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Cross,
  Landmark,
} from "lucide-react";
import type { Marker as LeafletMarker, LayerGroup } from "leaflet";
import { cn } from "@/lib/utils";
import { BRANCHES } from "@/lib/constants";
import { BRANCH_PROFILES } from "@/lib/branch-data";
import { MOCK_ROOMS } from "@/lib/mock-rooms";
import { getTotalResidenceUnits } from "@/lib/inventory-stats";
import { BRANCH_PINS, MAP_PLACES, type PlaceCategory } from "@/lib/map/places";
import { nearestBranch } from "@/lib/map/geo";
import {
  buildFlagPinHtml,
  buildPlaceMarkerHtml,
  FLAG_PIN_ANCHOR,
  FLAG_PIN_SIZE,
} from "@/components/map/map-style";
import { useLeafletMap } from "@/components/map/use-leaflet-map";

export interface BranchHubItem {
  id: string;
  name: string;
  slug: string;
  locationLabel: string;
  verifiedAddress: string;
  description: string;
  imageUrl: string;
  googleMapsUrl: string;
  highlights: string[];
}

export interface BranchMapLocation {
  id: "moghal-pura" | "barkas-salala";
  code: string;
  name: string;
  slug: string;
  tagline: string;
  badge: string;
  verifiedAddress: string;
  description: string;
  imageUrl: string;
  googleMapsUrl: string;
  landmarks: Array<{ name: string; dist: string; time: string }>;
}

const BRANCHES_MAP_DATA: Record<"moghal-pura" | "barkas-salala", BranchMapLocation> = {
  "moghal-pura": {
    id: "moghal-pura",
    code: "BRANCH 01",
    name: "Moghal Pura",
    slug: "moghal-pura",
    tagline: "Historic Old City & Charminar Quarter",
    badge: "HERITAGE, CULTURE & HEALTHCARE",
    verifiedAddress: "Moghal Pura, Near Charminar, Hyderabad, Telangana",
    description:
      "Private 1, 2, and 4 BHK residences near Charminar, with modular kitchens and alternate-day housekeeping.",
    imageUrl: "/images/branch-moghal-pura.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
    landmarks: [
      { name: "Historic Charminar & Laad Bazaar", dist: "", time: "" },
      { name: "Princess Esra Hospital (Deccan Medical)", dist: "", time: "" },
      { name: "Chowmahalla Palace", dist: "", time: "" },
      { name: "Salar Jung Museum", dist: "", time: "" },
    ],
  },
  "barkas-salala": {
    id: "barkas-salala",
    code: "BRANCH 02",
    name: "Barkas Salala",
    slug: "barkas-salala",
    tagline: "Barkas Salala, Hyderabad",
    badge: "BARKAS SALALA",
    verifiedAddress: "Barkas Salala, Near Chandrayangutta, Hyderabad, Telangana",
    description:
      "Grand 3 BHK residences in Barkas Salala for families and medical attendants.",
    imageUrl: "/images/branch-barkas-salala.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
    landmarks: [
      { name: "Princess Durru Shehvar Hospital", dist: "", time: "" },
      { name: "Owaisi Hospital & Research Centre", dist: "", time: "" },
      { name: "Pahadi Shareef Heritage Markets", dist: "", time: "" },
      { name: "Rajiv Gandhi Intl Airport (RGIA)", dist: "", time: "" },
    ],
  },
};

export interface ArabicBranchOverlay {
  name: string;
  code: string;
  tagline: string;
  badge: string;
  verifiedAddress: string;
  address?: string;
  description: string;
  landmarks: Array<{ name: string; dist?: string }>;
}

export const ARABIC_BRANCH_OVERLAYS: Record<string, ArabicBranchOverlay> = {
  "moghal-pura": {
    name: "مغل بورا",
    code: "الفرع ٠١",
    tagline: "البلدة القديمة التاريخية ومحيط تشارمينار",
    badge: "تراث، ثقافة ورعاية صحية",
    verifiedAddress: "مغل بورا، بالقرب من تشارمينار، حيدر أباد",
    address: "مغل بورا، بالقرب من تشارمينار، حيدر أباد",
    description: "شقق خاصة ١، ٢، و٤ غرف وصالة بالقرب من تشارمينار، مع مطبخ متكامل وتنظيف دوري.",
    landmarks: [
      { name: "تشارمينار وسوق لاد بازار التاريخي", dist: "على بُعد دقائق مشياً" },
      { name: "مستشفى برنسيس إسراء (ديكان الطبية)", dist: "٥ دقائق" },
      { name: "قصر تشوماهالا", dist: "٧ دقائق" },
      { name: "متحف سالار جونغ", dist: "١٠ دقائق" },
    ],
  },
  "barkas-salala": {
    name: "باركاس صلالة",
    code: "الفرع ٠٢",
    tagline: "باركاس صلالة، حيدر أباد",
    badge: "باركاس صلالة",
    verifiedAddress: "باركاس صلالة، بالقرب من شاندريانجونا، حيدر أباد",
    address: "باركاس صلالة، بالقرب من شاندريانجونا، حيدر أباد",
    description: "شقق فسيحة ٣ غرف وصالة في باركاس صلالة للعائلات ومرافقي المرضى.",
    landmarks: [
      { name: "مستشفى برنسيس در الشهوار", dist: "على بُعد دقائق" },
      { name: "مستشفى ومركز أبحاث أويسي", dist: "١٠ دقائق" },
      { name: "أسواق فهدي شريف التراثية", dist: "٥ دقائق" },
      { name: "مطار راجيف غاندي الدولي (RGIA)", dist: "٢٠ دقيقة بالسيارة" },
    ],
  },
};


type BranchId = BranchMapLocation["id"];

const BRANCH_ORDER: BranchId[] = ["moghal-pura", "barkas-salala"];
const FOCUS_ZOOM = 14;
// Popup height + flag height + margin, in px
const POPUP_CLEARANCE = 340;

const PLACE_FILTERS: Array<{ id: PlaceCategory; label: string; labelAr: string; Icon: typeof Cross }> = [
  { id: "hospital", label: "Hospitals", labelAr: "المستشفيات", Icon: Cross },
  { id: "heritage", label: "Heritage & Shopping", labelAr: "التراث والتسوق", Icon: Landmark },
];

function getPin(id: BranchId) {
  return BRANCH_PINS.find((b) => b.slug === id)!;
}

interface BranchHubProps {
  className?: string;
}

export function BranchHub({ className }: BranchHubProps) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const localePrefix = isAr ? "/ar" : "";

  const [activeBranchId, setActiveBranchId] = React.useState<BranchId>("moghal-pura");
  const [popupBranchId, setPopupBranchId] = React.useState<BranchId | null>(null);
  const [popupPhoto, setPopupPhoto] = React.useState(0);
  const [popupPoint, setPopupPoint] = React.useState<{ x: number; y: number } | null>(null);
  const [activeFilters, setActiveFilters] = React.useState<PlaceCategory[]>([]);
  const [branchStartingPrices, setBranchStartingPrices] = React.useState<Partial<Record<BranchId, number>>>({});
  const [residenceUnits, setResidenceUnits] = React.useState(() => getTotalResidenceUnits(MOCK_ROOMS));

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const markersRef = React.useRef<Partial<Record<BranchId, LeafletMarker>>>({});
  const placeLayersRef = React.useRef<Partial<Record<PlaceCategory, LayerGroup>>>({});

  const { map, L, tileError, tilesLoading } = useLeafletMap(mapContainerRef, {
    center: [17.3378, 78.486],
    zoom: 13,
  });

  React.useEffect(() => {
    let isMounted = true;

    fetch("/api/inventory")
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          data: {
            success?: boolean;
            units?: Array<{ branchSlug?: string; basePricePerNight?: number; isAvailable?: boolean; totalUnits?: number }>;
          } | null
        ) => {
          if (!isMounted || !data?.success || !Array.isArray(data.units)) return;

          const lowestRates: Partial<Record<BranchId, number>> = {};
          for (const unit of data.units) {
            const branchSlug = unit.branchSlug;
            const rate = Number(unit.basePricePerNight);
            if (
              (branchSlug === "moghal-pura" || branchSlug === "barkas-salala") &&
              unit.isAvailable !== false &&
              Number.isFinite(rate) &&
              rate > 0
            ) {
              lowestRates[branchSlug] = Math.min(lowestRates[branchSlug] ?? rate, rate);
            }
          }
          setBranchStartingPrices(lowestRates);
          if (data.units.length > 0) setResidenceUnits(getTotalResidenceUnits(data.units));
        }
      )
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const startingPriceLabel = (id: BranchId) => {
    const livePrice = branchStartingPrices[id];
    if (!livePrice) return isAr ? "تحقق من الأسعار" : "Check rates";
    return isAr ? `من ₹${livePrice.toLocaleString("en-IN")}` : `from ₹${livePrice.toLocaleString("en-IN")}`;
  };

  const branchName = (id: BranchId) => (isAr ? ARABIC_BRANCH_OVERLAYS[id].name : BRANCHES_MAP_DATA[id].name);
  const branchArea = (id: BranchId) =>
    isAr ? ARABIC_BRANCH_OVERLAYS[id].verifiedAddress : BRANCHES_MAP_DATA[id].verifiedAddress;

  // Branch flags + initial framing of both branches
  React.useEffect(() => {
    if (!map || !L) return;
    const markers: Partial<Record<BranchId, LeafletMarker>> = {};
    for (const id of BRANCH_ORDER) {
      const pin = getPin(id);
      const marker = L.marker(pin.coordinates, {
        icon: L.divIcon({ className: "", html: buildFlagPinHtml({ active: false, id }), iconSize: FLAG_PIN_SIZE, iconAnchor: FLAG_PIN_ANCHOR }),
        title: `Flatel ${pin.name}`,
        keyboard: true,
      }).addTo(map);
      marker.on("click", () => {
        setActiveBranchId(id);
        setPopupBranchId(id);
        setPopupPhoto(0);
        // Make room above the flag so the popup is never clipped by the map edge
        const point = map.latLngToContainerPoint(pin.coordinates);
        if (point.y < POPUP_CLEARANCE) map.panBy([0, point.y - POPUP_CLEARANCE]);
      });
      markers[id] = marker;
    }
    markersRef.current = markers;
    map.fitBounds(
      BRANCH_ORDER.map((id) => getPin(id).coordinates),
      { padding: [80, 80], maxZoom: 14 }
    );
    return () => {
      for (const marker of Object.values(markers)) marker?.remove();
      markersRef.current = {};
    };
  }, [map, L]);

  // Active flag styling
  React.useEffect(() => {
    if (!L) return;
    for (const id of BRANCH_ORDER) {
      const active = id === activeBranchId;
      markersRef.current[id]?.setIcon(
        L.divIcon({ className: "", html: buildFlagPinHtml({ active, id }), iconSize: FLAG_PIN_SIZE, iconAnchor: FLAG_PIN_ANCHOR })
      );
      markersRef.current[id]?.setZIndexOffset(active ? 1000 : 0);
    }
  }, [activeBranchId, L, map]);

  // Hospitals / heritage layers
  React.useEffect(() => {
    if (!map || !L) return;
    const layers: Partial<Record<PlaceCategory, LayerGroup>> = {};
    for (const filter of PLACE_FILTERS) {
      const group = L.layerGroup();
      for (const place of MAP_PLACES.filter((p) => p.category === filter.id)) {
        const nearest = nearestBranch(place.coordinates);
        const nearestPin = getPin(nearest.slug as BranchId);
        const label = isAr
          ? `${place.nameAr} · ≈${nearest.km.toFixed(1)} كم من ${nearestPin.nameAr}`
          : `${place.name} · ≈${nearest.km.toFixed(1)} km from ${nearestPin.name}`;
        L.marker(place.coordinates, {
          icon: L.divIcon({ className: "", html: buildPlaceMarkerHtml(place.category), iconSize: [22, 22], iconAnchor: [11, 11] }),
          title: label,
        })
          .bindTooltip(label, { className: "flatel-map-tooltip", direction: "top", offset: [0, -10] })
          .addTo(group);
      }
      layers[filter.id] = group;
    }
    placeLayersRef.current = layers;
    return () => {
      for (const group of Object.values(layers)) group?.remove();
      placeLayersRef.current = {};
    };
  }, [map, L, isAr]);

  React.useEffect(() => {
    if (!map) return;
    for (const filter of PLACE_FILTERS) {
      const group = placeLayersRef.current[filter.id];
      if (!group) continue;
      if (activeFilters.includes(filter.id)) group.addTo(map);
      else group.remove();
    }
  }, [activeFilters, map, isAr]);

  // Keep the popup anchored above its flag while the map moves
  React.useEffect(() => {
    if (!map || !popupBranchId) return;
    const update = () => {
      const point = map.latLngToContainerPoint(getPin(popupBranchId).coordinates);
      setPopupPoint({ x: point.x, y: point.y });
    };
    update();
    map.on("move zoom resize", update);
    return () => {
      map.off("move zoom resize", update);
    };
  }, [map, popupBranchId]);

  const handleSelectBranch = (id: BranchId) => {
    setActiveBranchId(id);
    setPopupBranchId(null);
    map?.flyTo(getPin(id).coordinates, FOCUS_ZOOM, { duration: 1.0 });
  };

  const toggleFilter = (id: PlaceCategory) =>
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const popupGallery = popupBranchId ? BRANCH_PROFILES[popupBranchId].defaultGallery : [];

  const priceSuffix = (id: BranchId) =>
    branchStartingPrices[id] ? (
      <span className="text-xs font-normal text-fg-muted">{isAr ? " / ليلة" : " / night"}</span>
    ) : null;

  const branchActions = (id: BranchId, compact = false) => (
    <div className="flex items-center gap-2">
      <a
        href={BRANCHES_MAP_DATA[id].googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex-1 rounded-lg border border-line bg-canvas hover:border-gold text-fg font-semibold inline-flex items-center justify-center gap-1.5 transition-colors min-h-[40px]",
          compact ? "px-2.5 text-xs" : "px-3 text-xs"
        )}
      >
        <Navigation className="w-3.5 h-3.5 text-gold" />
        <span>{isAr ? "الاتجاهات" : "Directions"}</span>
      </a>
      <Link
        href={`${localePrefix}/branches/${id}`}
        className={cn(
          "flex-1 rounded-lg bg-gradient-to-r from-gold to-gold-deep hover:brightness-105 text-ink font-bold inline-flex items-center justify-center gap-1.5 transition-all min-h-[40px]",
          compact ? "px-2.5 text-xs" : "px-3 text-xs"
        )}
      >
        <span>{isAr ? "استكشف الشقق" : "Explore Flats"}</span>
        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
      </Link>
    </div>
  );

  const iconButton =
    "h-7 w-7 rounded-full bg-canvas/85 border border-line text-fg flex items-center justify-center cursor-pointer";

  return (
    <section
      id="locations"
      className={cn("relative w-full bg-canvas py-16 sm:py-20 lg:py-24 select-none overflow-hidden", className)}
      aria-labelledby="branch-hub-heading"
    >
      {/* Anchor alias for #branches navigation */}
      <span id="branches" className="absolute -top-24 pointer-events-none" aria-hidden="true" />

      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-ambient-gold-glow"
        aria-hidden="true"
      />

      <div className="container-page relative z-10 space-y-8 sm:space-y-10">
        {/* 1. Heading + stats */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-2">
          <div className="max-w-2xl space-y-3 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase">
              <Compass className="w-4 h-4 text-gold" />
              <span>{isAr ? "أصالة حيدر أباد" : "ROOTED IN HYDERABAD"}</span>
            </div>

            <h2
              id="branch-hub-heading"
              className="font-heading text-fg heading-section"
            >
              {isAr ? (
                <>
                  اعثر على <span className="font-heading italic text-gold">أقرب فرع لفلاتيل</span>
                </>
              ) : (
                <>
                  Find Your <span className="font-heading italic text-gold">Nearest Flatel</span>
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-fg-soft font-sans leading-relaxed">
              {isAr
                ? "استكشف فروع فلاتيل في حيدر أباد واعثر على شقق مريحة للإقامة بالقرب من وجهاتك الهامة."
                : "Explore FLATEL locations across Hyderabad and discover comfortable flats to stay near the places that matter to you."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0 w-full sm:w-auto">
            {[
              { value: String(BRANCHES.length), label: isAr ? "فروع" : "BRANCHES" },
              { value: String(residenceUnits), label: isAr ? "شقق فندقية" : "RESIDENCES" },
              { value: "24×7", label: isAr ? "استقبال ٢٤×٧" : "FRONT DESK" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center min-w-0 sm:min-w-[120px] space-y-1 px-2 sm:px-4"
              >
                <span className="font-heading text-2xl sm:text-4xl font-medium text-gold oldstyle-nums block">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] text-fg-soft uppercase block truncate">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Branch list + map */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-0 rounded-2xl lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:overflow-hidden lg:shadow-2xl">
          {/* Desktop branch list */}
          <div className="hidden lg:flex flex-col border-e border-line-soft">
            <div className="px-5 py-4 border-b border-line-soft">
              <span className="text-xs font-semibold tracking-[0.14em] uppercase text-gold">
                {isAr ? "شبكة فروع حيدر أباد" : "Hyderabad Network"}
              </span>
              <p className="font-heading text-lg text-fg mt-0.5">
                {isAr ? `${BRANCHES.length} فروع لفلاتيل` : `${BRANCHES.length} Flatel Branches`}
              </p>
            </div>
            <ul className="flex-1 divide-y divide-line-soft">
              {BRANCH_ORDER.map((id) => {
                const selected = id === activeBranchId;
                return (
                  <li key={id}>
                    <div
                      className={cn(
                        "p-4 space-y-3 transition-colors",
                        selected ? "bg-gold/8" : "hover:bg-gold/4"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectBranch(id)}
                        aria-pressed={selected}
                        className="w-full flex items-center gap-3 text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg"
                      >
                        <div
                          className={cn(
                            "relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border",
                            selected ? "border-gold" : "border-line"
                          )}
                        >
                          <Image src={BRANCH_PROFILES[id].heroImage} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block font-heading text-lg font-semibold text-fg leading-tight">
                            {branchName(id)}
                          </span>
                          <span className="flex items-start gap-1 text-xs text-fg-muted mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-px" />
                            <span className="line-clamp-2">{branchArea(id)}</span>
                          </span>
                          <span className="block text-sm font-semibold text-gold mt-1 tabular-nums">
                            {startingPriceLabel(id)}
                            {priceSuffix(id)}
                          </span>
                        </div>
                      </button>
                      {branchActions(id)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Map */}
          <div className="relative rounded-2xl lg:rounded-none border border-line lg:border-0 overflow-hidden bg-canvas">
            <div
              ref={mapContainerRef}
              className="w-full h-[320px] sm:h-[420px] lg:h-[560px] bg-canvas z-0"
              aria-label={isAr ? "خريطة فروع فلاتيل في حيدر أباد" : "Interactive map of Flatel branches in Hyderabad"}
            />

            {/* Place filters */}
            <div className="absolute top-3 start-3 z-20 flex flex-wrap gap-2">
              {PLACE_FILTERS.map(({ id, label, labelAr, Icon }) => {
                const on = activeFilters.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleFilter(id)}
                    aria-pressed={on}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-full text-xs font-semibold border backdrop-blur-md transition-colors cursor-pointer",
                      on
                        ? "bg-gold text-ink border-gold"
                        : "bg-canvas/85 text-fg border-line hover:border-gold"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isAr ? labelAr : label}</span>
                  </button>
                );
              })}
            </div>

            {(tilesLoading || !map) && !tileError && (
              <div className="absolute inset-0 bg-canvas/70 flex items-center justify-center pointer-events-none z-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-raised/95 border border-line text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span className="text-fg font-medium">
                    {isAr ? "جارٍ تحميل خريطة حيدر أباد…" : "Loading Hyderabad map…"}
                  </span>
                </div>
              </div>
            )}

            {tileError && (
              <div className="absolute bottom-4 inset-x-4 z-20 flex justify-center">
                <div className="max-w-md p-3 rounded-xl bg-surface/95 border border-line-strong text-xs leading-snug text-fg-soft flex items-center gap-2.5 shadow-xl">
                  <AlertCircle className="w-4 h-4 text-gold shrink-0" />
                  <p>
                    {isAr
                      ? "تعذّر تحميل الخريطة حالياً. تفاصيل الفروع وروابط الاتجاهات عبر خرائط Google تعمل بشكل طبيعي."
                      : "The map couldn’t load right now. Branch details and Google Maps directions still work."}
                  </p>
                </div>
              </div>
            )}

            {/* Compact popup anchored above the clicked flag */}
            {popupBranchId && popupPoint && (
              <div
                role="dialog"
                aria-label={branchName(popupBranchId)}
                className="absolute z-30 w-[260px] -translate-x-1/2 -translate-y-full rounded-xl bg-surface border border-line shadow-2xl overflow-hidden text-start"
                style={{ left: popupPoint.x, top: popupPoint.y - 54 }}
              >
                <div className="relative h-32 bg-canvas">
                  {popupGallery[popupPhoto] && (
                    <Image
                      src={popupGallery[popupPhoto].src}
                      alt={popupGallery[popupPhoto].title}
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  )}
                  {popupGallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPopupPhoto((i) => (i - 1 + popupGallery.length) % popupGallery.length)}
                        className={cn(iconButton, "absolute start-2 top-1/2 -translate-y-1/2")}
                        aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
                      >
                        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPopupPhoto((i) => (i + 1) % popupGallery.length)}
                        className={cn(iconButton, "absolute end-2 top-1/2 -translate-y-1/2")}
                        aria-label={isAr ? "الصورة التالية" : "Next photo"}
                      >
                        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setPopupBranchId(null)}
                    className={cn(iconButton, "absolute top-2 end-2")}
                    aria-label={isAr ? "إغلاق" : "Close"}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 space-y-2.5">
                  <div>
                    <p className="font-heading text-lg font-semibold text-fg leading-tight">
                      {branchName(popupBranchId)}
                    </p>
                    <p className="text-xs text-fg-muted mt-0.5">{branchArea(popupBranchId)}</p>
                    <p className="text-sm font-semibold text-gold mt-1 tabular-nums">
                      {startingPriceLabel(popupBranchId)}
                      {priceSuffix(popupBranchId)}
                    </p>
                  </div>
                  {branchActions(popupBranchId, true)}
                </div>
              </div>
            )}
          </div>

          {/* Mobile branch cards */}
          <div className="lg:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 no-scrollbar">
            {BRANCH_ORDER.map((id) => {
              const selected = id === activeBranchId;
              return (
                <div
                  key={id}
                  className={cn(
                    "snap-start shrink-0 w-[85%] sm:w-[340px] p-3.5 rounded-2xl border space-y-3 bg-surface/92",
                    selected ? "border-gold" : "border-line"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectBranch(id)}
                    aria-pressed={selected}
                    className="w-full flex items-center gap-3 text-start cursor-pointer"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-line">
                      <Image src={BRANCH_PROFILES[id].heroImage} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-heading text-lg font-semibold text-fg leading-tight">
                        {branchName(id)}
                      </span>
                      <span className="block text-xs text-fg-muted line-clamp-1">{branchArea(id)}</span>
                      <span className="block text-sm font-semibold text-gold tabular-nums">
                        {startingPriceLabel(id)}
                      </span>
                    </div>
                  </button>
                  {branchActions(id)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
