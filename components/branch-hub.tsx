"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Plane,
  Landmark,
  Compass,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRANCHES } from "@/lib/constants";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

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
  coordinates: [number, number]; // [Latitude, Longitude]
  imageUrl: string;
  googleMapsUrl: string;
  status: string;
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
    coordinates: [17.3570, 78.4815],
    imageUrl: "/images/branch-moghal-pura.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
    status: "Active & Accepting Guests",
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
    coordinates: [17.3185, 78.4905],
    imageUrl: "/images/branch-barkas-salala.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
    status: "Active & Accepting Guests",
    landmarks: [
      { name: "Princess Durru Shehvar Hospital", dist: "", time: "" },
      { name: "Owaisi Hospital & Research Centre", dist: "", time: "" },
      { name: "Pahadi Shareef Heritage Markets", dist: "", time: "" },
      { name: "Rajiv Gandhi Intl Airport (RGIA)", dist: "", time: "" },
    ],
  },
};

interface BranchHubProps {
  className?: string;
}

export function BranchHub({ className }: BranchHubProps) {
  const [activeBranchId, setActiveBranchId] = React.useState<"moghal-pura" | "barkas-salala">("moghal-pura");
  const [branchStartingPrices, setBranchStartingPrices] = React.useState<Partial<Record<"moghal-pura" | "barkas-salala", number>>>({});
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [isTileLoading, setIsTileLoading] = React.useState(true);
  const [hasTileError, setHasTileError] = React.useState(false);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<LeafletMap | null>(null);
  const markersRef = React.useRef<Partial<Record<BranchMapLocation["id"], LeafletMarker>>>({});

  const currentBranch = BRANCHES_MAP_DATA[activeBranchId];

  React.useEffect(() => {
    let isMounted = true;

    fetch("/api/inventory")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { success?: boolean; units?: Array<{ branchSlug?: string; basePricePerNight?: number; isAvailable?: boolean }> } | null) => {
        if (!isMounted || !data?.success || !Array.isArray(data.units)) return;

        const lowestRates: Partial<Record<"moghal-pura" | "barkas-salala", number>> = {};
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
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const startingPriceLabel = (branch: BranchMapLocation) => {
    const livePrice = branchStartingPrices[branch.id];
    return livePrice ? `₹${livePrice.toLocaleString("en-IN")}` : "Check rates";
  };

  // Helper to generate the custom gold Flatel flag pin HTML for Leaflet
  const createMarkerHtml = (branchId: "moghal-pura" | "barkas-salala", isActive: boolean) => {
    const branch = BRANCHES_MAP_DATA[branchId];
    return `
      <div class="relative flatel-marker-pin flex flex-col items-center cursor-pointer select-none" style="transform: translate(-10px, -42px);">
        <!-- Active Beacon Glow Pulse -->
        ${
          isActive
            ? `<div class="absolute -bottom-1 -left-2 w-8 h-8 rounded-full bg-[#E5C178]/30 border border-[#E5C178]/90 animate-ping pointer-events-none"></div>
               <div class="absolute -bottom-0.5 -left-1.5 w-7 h-7 rounded-full bg-[#E5C178]/40 blur-xs pointer-events-none"></div>`
            : ""
        }

        <!-- Custom FLATEL Gold Flag Silhouette Pin -->
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85));">
          <!-- Top Finial Orb -->
          <circle cx="10" cy="6" r="3.2" fill="${isActive ? "#FAF4EB" : "#E5C178"}" stroke="${isActive ? "#FFFFFF" : "#E5C178"}" stroke-width="1.2"/>
          
          <!-- Flagpole -->
          <line x1="10" y1="6" x2="10" y2="44" stroke="${isActive ? "#FAF4EB" : "#E5C178"}" stroke-width="2.5" stroke-linecap="round"/>
          
          <!-- Base Ground Shadow Point -->
          <ellipse cx="10" cy="45" rx="5" ry="2.2" fill="rgba(0,0,0,0.7)"/>
          
          <!-- Swallowtail Pennant Flag with Gold Gradient -->
          <path d="M11 8H36L30 17.5L36 27H11V8Z" fill="url(#flagGoldGrad_${branchId})" stroke="${isActive ? "#FAF4EB" : "#E5C178"}" stroke-width="1.2"/>
          
          <!-- 'F' Monogram Crest -->
          <text x="21" y="20.5" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#140E08" text-anchor="middle" letter-spacing="0.5">F</text>
          
          <defs>
            <linearGradient id="flagGoldGrad_${branchId}" x1="11" y1="8" x2="36" y2="27" gradientUnits="userSpaceOnUse">
              <stop stop-color="${isActive ? "#FAF4EB" : "#E5C178"}"/>
              <stop offset="0.5" stop-color="${isActive ? "#E5C178" : "#C69344"}"/>
              <stop offset="1" stop-color="${isActive ? "#C69344" : "#9E7230"}"/>
            </linearGradient>
          </defs>
        </svg>

        <!-- Compact Label Tooltip -->
        <div class="mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider shadow-xl transition-all ${
          isActive
            ? "bg-[rgba(34,24,16,0.95)] text-[#E5C178] border border-[#E5C178] scale-105"
            : "bg-[rgba(22,16,11,0.9)] text-[#FAF4EB] border border-[rgba(212,163,89,0.3)] opacity-90"
        }">
          ${branch.name}
        </div>
      </div>
    `;
  };

  // Initialize Leaflet Map on Mount (Client-Only, Zero SSR window errors)
  React.useEffect(() => {
    let isMounted = true;

    if (!mapContainerRef.current) return;

    // Dynamically load Leaflet safely to guarantee 100% Next.js App Router SSR compatibility
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const moghalCoords = BRANCHES_MAP_DATA["moghal-pura"].coordinates;
      const barkasCoords = BRANCHES_MAP_DATA["barkas-salala"].coordinates;

      // Fit bounds tightly around the two real branches with balanced padding
      const initialCenter: [number, number] = [17.3378, 78.4860];
      const initialZoom = 13;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 11,
        maxZoom: 18,
        scrollWheelZoom: false, // Prevents scroll-jacking on desktop/mobile
        zoomControl: false, // We customize position to topright so it never collides with overlays
      });

      mapInstanceRef.current = map;

      // Place Zoom controls at top-right to keep bottom and left overlays uncluttered
      L.control.zoom({ position: "topright" }).addTo(map);

      // OpenStreetMap standard tile provider with custom luxury dark filter
      // (100% Free, Zero API Keys Required, No Repeated Watermarks, High Precision Street Map)
      const tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        className: "flatel-dark-tiles",
      }).addTo(map);

      tileLayer.on("loading", () => setIsTileLoading(true));
      tileLayer.on("load", () => {
        setIsTileLoading(false);
        setHasTileError(false);
      });
      tileLayer.on("tileerror", () => {
        setIsTileLoading(false);
        setHasTileError(true);
      });

      // Fit bounds to precisely frame both branches
      map.fitBounds([moghalCoords, barkasCoords], {
        padding: [60, 60],
        maxZoom: 13.5,
      });

      // Create Markers for both verified branches
      const branchKeys: Array<"moghal-pura" | "barkas-salala"> = ["moghal-pura", "barkas-salala"];

      branchKeys.forEach((key) => {
        const data = BRANCHES_MAP_DATA[key];
        // The active marker is applied by the dedicated activeBranchId effect below.
        const isCurrent = false;

        const icon = L.divIcon({
          className: isCurrent ? "flatel-marker-active" : "",
          html: createMarkerHtml(key, isCurrent),
          iconSize: [40, 48],
          iconAnchor: [10, 44],
        });

        const marker = L.marker(data.coordinates, { icon, title: `Flatel ${data.name}` }).addTo(map);

        marker.on("click", () => {
          setActiveBranchId(key);
          map.flyTo(data.coordinates, 13.8, { duration: 1.0 });
        });

        markersRef.current[key] = marker;
      });

      setIsMapReady(true);
      setIsTileLoading(false);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // Update marker icons and pan map smoothly whenever activeBranchId changes
  React.useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import("leaflet").then((L) => {
      const branchKeys: Array<"moghal-pura" | "barkas-salala"> = ["moghal-pura", "barkas-salala"];

      branchKeys.forEach((key) => {
        const marker = markersRef.current[key];
        if (marker) {
          const isCurrent = key === activeBranchId;
          const newIcon = L.divIcon({
            className: isCurrent ? "flatel-marker-active" : "",
            html: createMarkerHtml(key, isCurrent),
            iconSize: [40, 48],
            iconAnchor: [10, 44],
          });
          marker.setIcon(newIcon);
        }
      });

      const target = BRANCHES_MAP_DATA[activeBranchId];
      if (target && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(target.coordinates, 13.8, { duration: 1.0 });
      }
    });
  }, [activeBranchId, isMapReady]);

  const handleSelectBranch = (id: "moghal-pura" | "barkas-salala") => {
    setActiveBranchId(id);
    const target = BRANCHES_MAP_DATA[id];
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.coordinates, 13.8, { duration: 1.0 });
    }
  };

  return (
    <section
      id="locations"
      className={cn(
        "relative w-full bg-[#0E0A07] py-16 sm:py-20 lg:py-24 select-none overflow-hidden",
        className
      )}
      aria-labelledby="branch-hub-heading"
    >
      {/* Anchor alias for #branches navigation */}
      <span id="branches" className="absolute -top-24 pointer-events-none" aria-hidden="true" />

      {/* Subtle Ambient Lighting Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-ambient-gold-glow"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10 space-y-8 sm:space-y-10">
        
        {/* ========================================================= */}
        {/* 1. SECTION INTRODUCTION & VERIFIED STATISTICS              */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-2">
          {/* Left: Heading & Descriptive Copy */}
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5C178]/10 border border-[#E5C178]/30 text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
              <Compass className="w-4 h-4 text-[#E5C178]" />
              <span>ROOTED IN HYDERABAD</span>
            </div>

            <h2
              id="branch-hub-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-[46px] font-normal tracking-normal text-[#FAF4EB] leading-[1.08]"
            >
              Find Your{" "}
              <span className="font-heading italic text-[#E5C178]">
                Nearest Flatel
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-[#D4C4B3] font-sans leading-relaxed">
              Explore FLATEL locations across Hyderabad and discover comfortable flats to stay near the places that matter to you.
            </p>
          </div>

          {/* Right: Data-Backed Statistics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0 w-full sm:w-auto">
            <div className="p-3 sm:p-5 rounded-2xl bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] text-center min-w-0 sm:min-w-[120px] space-y-1 shadow-md">
              <span className="font-heading text-2xl sm:text-4xl font-medium text-[#E5C178] oldstyle-nums block">
                {BRANCHES.length}
              </span>
              <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] text-[#D4C4B3] uppercase block truncate">
                BRANCHES
              </span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] text-center min-w-0 sm:min-w-[120px] space-y-1 shadow-md">
              <span className="font-heading text-2xl sm:text-4xl font-medium text-[#E5C178] oldstyle-nums block">
                5
              </span>
              <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] text-[#D4C4B3] uppercase block truncate">
                RESIDENCES
              </span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] text-center min-w-0 sm:min-w-[120px] space-y-1 shadow-md">
              <span className="font-heading text-2xl sm:text-4xl font-medium text-[#E5C178] oldstyle-nums block">
                24×7
              </span>
              <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] text-[#D4C4B3] uppercase block truncate">
                FRONT DESK
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. THE INTERACTIVE HYDERABAD MAP CONTAINER                 */}
        {/* ========================================================= */}
        <div className="relative rounded-2xl lg:rounded-3xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] overflow-hidden shadow-2xl">
          
          {/* Real Leaflet Map Surface */}
          <div
            ref={mapContainerRef}
            className="w-full h-[280px] sm:h-[420px] md:h-[520px] lg:h-[560px] bg-[#0E0A07] z-0"
            aria-label="Interactive Map of Flatel Branches in Hyderabad"
          />

          {/* Restrained Loading State Indicator */}
          {isTileLoading && (
            <div className="absolute inset-0 bg-[#0E0A07]/70 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10 transition-opacity">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(34,24,16,0.95)] border border-[rgba(212,163,89,0.28)] text-xs text-[#E5C178]">
                <Loader2 className="w-4 h-4 animate-spin text-[#E5C178]" />
                <span className="text-[#FAF4EB] font-medium">Loading Hyderabad Map…</span>
              </div>
            </div>
          )}

          {/* Useful Offline / Tile Error Fallback Banner */}
          {hasTileError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-20 pointer-events-auto">
              <div className="p-3 rounded-xl bg-[rgba(34,24,16,0.95)] border border-amber-500/40 text-xs text-[#B8A692] flex items-center gap-2.5 shadow-xl">
                <AlertCircle className="w-4 h-4 text-[#E5C178] shrink-0" />
                <p className="text-[11px] leading-snug">
                  Network tile connectivity limited. Direct branch details &amp; verified Google Maps directions remain fully active below.
                </p>
              </div>
            </div>
          )}

          {/* ── Overlay 1: Top-Left "Hyderabad Network" Badge ── */}
          <div className="absolute top-4 left-4 z-20 pointer-events-auto">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] shadow-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                  HYDERABAD NETWORK
                </span>
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-[#FAF4EB] tracking-normal">
                {BRANCHES.length} Flatel Branches
              </h3>
              <p className="text-xs sm:text-sm text-[#D4C4B3]">
                Select a marker to explore.
              </p>
            </div>
          </div>

          {/* ── Overlay 2: Desktop Selected Branch Floating Card (Bottom-Right, non-obtrusive) ── */}
          <div className="hidden md:block absolute bottom-5 right-5 max-w-[380px] w-full z-20 pointer-events-auto">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] shadow-2xl space-y-3.5 text-[#FAF4EB]">
              
              {/* Branch Title & Verified Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-semibold text-[#E5C178] tracking-wider">
                      {currentBranch.code}
                    </span>
                    <span className="text-xs font-sans text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                      {currentBranch.status}
                    </span>
                  </div>
                  <h4 className="font-heading text-xl sm:text-2xl font-bold text-[#FAF4EB] tracking-normal">
                    {currentBranch.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#D4C4B3] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E5C178] shrink-0" />
                    <span className="truncate max-w-[210px]">{currentBranch.verifiedAddress}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading text-xl sm:text-2xl font-medium text-[#E5C178] tabular-nums block">
                    from {startingPriceLabel(currentBranch)}
                  </span>
                  <span className="text-xs text-[#D4C4B3] block">
                    / night
                  </span>
                </div>
              </div>

              {/* Suites & Verified Proximity Highlights */}
              <div className="pt-2.5 border-t border-[rgba(212,163,89,0.18)] space-y-2 text-xs sm:text-sm text-[#D4C4B3]">
                <div className="flex items-center justify-between text-xs sm:text-sm text-[#FAF4EB] font-medium">
                  <span>Inventory:</span>
                  <span className="font-sans font-semibold text-[#E5C178]">View available residences</span>
                </div>
                {currentBranch.landmarks.slice(0, 2).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="truncate max-w-[220px] text-[#D4C4B3]">{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1.5">
                <Link
                  href={`/branches/${currentBranch.slug}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <span>Explore Flats</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={currentBranch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-xl bg-[rgba(22,16,11,0.85)] hover:bg-[rgba(45,32,22,0.9)] text-[#FAF4EB] border border-[rgba(212,163,89,0.25)] hover:border-[#E5C178] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
                  title="Open this area in Google Maps"
                >
                  <Navigation className="w-4 h-4 text-[#E5C178]" />
                  <span>Directions</span>
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* ── Overlay 3: Mobile Selected Branch Card (Docked Cleanly Below Map for Full Touch Safety) ── */}
        <div className="block md:hidden mt-3 p-4 sm:p-5 rounded-2xl bg-[rgba(34,24,16,0.92)] border border-[rgba(212,163,89,0.28)] shadow-lg space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#E5C178] font-bold">
                  {currentBranch.code}
                </span>
                <span className="text-xs font-sans text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                  {currentBranch.status}
                </span>
              </div>
              <h4 className="font-heading text-xl font-bold text-[#FAF4EB] tracking-normal">
                {currentBranch.name}
              </h4>
              <p className="text-xs sm:text-sm text-[#D4C4B3] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
                <span>{currentBranch.verifiedAddress}</span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base sm:text-lg font-bold font-mono text-[#E5C178] block">
                from {startingPriceLabel(currentBranch)}
              </span>
              <span className="text-xs text-[#D4C4B3] block">
                / night
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <Link
              href={`/branches/${currentBranch.slug}`}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <span>Explore Flats</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={currentBranch.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3.5 rounded-xl bg-[rgba(22,16,11,0.85)] text-[#FAF4EB] border border-[rgba(212,163,89,0.25)] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <Navigation className="w-4 h-4 text-[#E5C178]" />
              <span>Directions</span>
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. HORIZONTAL BRANCH SELECTOR CHIPS                        */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#D4C4B3]">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-wider text-[#E5C178] font-semibold">
              Select Branch Location
            </span>
            <span className="text-xs sm:text-sm text-[#D4C4B3]">
              Tap any location to focus on map
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {(["moghal-pura", "barkas-salala"] as const).map((branchId) => {
              const branch = BRANCHES_MAP_DATA[branchId];
              const isSelected = activeBranchId === branchId;
              const Icon = branchId === "moghal-pura" ? Landmark : Plane;

              return (
                <button
                  key={branchId}
                  type="button"
                  onClick={() => handleSelectBranch(branchId)}
                  className={cn(
                    "p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer shrink-0 min-w-[260px] sm:min-w-[300px] flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C178]",
                    isSelected
                      ? "bg-[rgba(22,16,11,0.9)] border-[#E5C178] ring-1 ring-[#E5C178]/40 shadow-lg"
                      : "bg-[rgba(34,24,16,0.65)] border-[rgba(212,163,89,0.2)] hover:border-[#E5C178]/40 hover:bg-[rgba(45,32,22,0.8)]"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Select branch ${branch.name}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08]"
                          : "bg-[rgba(22,16,11,0.7)] text-[#E5C178] border border-[rgba(212,163,89,0.2)]"
                      )}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm sm:text-base font-bold text-[#FAF4EB] truncate">
                          {branch.name}
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0 font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#D4C4B3] truncate mt-0.5">
                        {branchId === "moghal-pura" ? "Near Charminar" : "Near Chandrayangutta"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-xs sm:text-sm font-mono font-bold shrink-0 transition-colors",
                      isSelected ? "text-[#E5C178]" : "text-[#D4C4B3]"
                    )}
                  >
                    from {startingPriceLabel(branch)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
