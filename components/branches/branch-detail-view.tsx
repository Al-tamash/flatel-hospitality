"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  format,
  addDays,
  startOfToday,
  isBefore,
} from "date-fns";
import {
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Users,
  BedDouble,
  CheckCircle2,
  Share2,
  Car,
  Tv,
  UtensilsCrossed,
  ShieldCheck,
  CheckCheck,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  ChevronDown,
  Maximize2,
  Navigation,
} from "lucide-react";
import { BranchItem } from "@/lib/constants";
import { RoomDetail } from "@/lib/mock-rooms";
import { getBranchProfile } from "@/lib/branch-data";
import { cn } from "@/lib/utils";

interface BranchDetailViewProps {
  branch: BranchItem;
  properties: RoomDetail[];
}

export function BranchDetailView({ branch, properties }: BranchDetailViewProps) {
  const router = useRouter();
  const profile = React.useMemo(() => getBranchProfile(branch.slug), [branch.slug]);

  // Selected flat state (defaults to first available property)
  const [selectedRoomSlug, setSelectedRoomSlug] = React.useState<string>(
    properties[0]?.slug || "3bhk"
  );

  const selectedProperty = React.useMemo(() => {
    return properties.find((p) => p.slug === selectedRoomSlug) || properties[0];
  }, [properties, selectedRoomSlug]);

  // Client-safe Date selection state
  const [today, setToday] = React.useState<Date | null>(null);
  const [checkIn, setCheckIn] = React.useState<Date | null>(null);
  const [checkOut, setCheckOut] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const t = startOfToday();
    queueMicrotask(() => {
      setToday(t);
      setCheckIn(addDays(t, 1));
      setCheckOut(addDays(t, 2));
    });
  }, []);

  // Guests state
  const [adults, setAdults] = React.useState<number>(selectedProperty?.baseAdults || 2);
  const [childrenCount, setChildrenCount] = React.useState<number>(0);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = React.useState<boolean>(false);
  const guestDropdownRef = React.useRef<HTMLDivElement>(null);

  // Synchronize base adults when selected property changes
  React.useEffect(() => {
    if (selectedProperty) {
      queueMicrotask(() => {
        setAdults((prev) => Math.min(Math.max(prev, 1), selectedProperty.maxAdults));
      });
    }
  }, [selectedProperty]);

  // Close guest dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        guestDropdownRef.current &&
        !guestDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGuestDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic gallery photos compiled from unit images and curated branch photography
  const galleryPhotos = React.useMemo(() => {
    const list = [...profile.defaultGallery];

    // If live properties have custom photos, incorporate them dynamically
    properties.forEach((p) => {
      if (p.gallery && p.gallery.length > 0) {
        p.gallery.forEach((g, gIdx) => {
          if (g.url && !list.some((item) => item.src === g.url)) {
            list.push({
              id: `${p.slug}-${gIdx}`,
              src: g.url,
              title: `${p.title} — ${g.category}`,
              category: g.category,
            });
          }
        });
      }
    });

    return list;
  }, [profile, properties]);

  // Hero Image preview state (Controlled via clicking thumbnails)
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number>(0);

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = React.useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = React.useState<number>(0);

  // Share feedback
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);

  // Dynamic starting price from actual properties
  const startingPrice = React.useMemo(() => {
    if (properties && properties.length > 0) {
      return Math.min(...properties.map((p) => p.basePricePerNight));
    }
    return 3000;
  }, [properties]);

  // Handle Share link
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Flatel Hospitality - ${branch.name}`,
            text: `Explore furnished serviced flats at Flatel Hospitality ${branch.name}, Hyderabad.`,
            url: window.location.href,
          });
          return;
        } catch {
          // fallback
        }
      }
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Direct checkout routing (No WhatsApp, 100% booking website flow)
  const handleProceedBooking = () => {
    const todayDate = today || startOfToday();
    const effectiveCheckIn = checkIn || addDays(todayDate, 1);
    const effectiveCheckOut =
      checkOut && isBefore(effectiveCheckIn, checkOut)
        ? checkOut
        : addDays(effectiveCheckIn, 1);

    const checkInStr = format(effectiveCheckIn, "yyyy-MM-dd");
    const checkOutStr = format(effectiveCheckOut, "yyyy-MM-dd");

    const queryParams = new URLSearchParams({
      property: selectedProperty?.slug || properties[0]?.slug || "3bhk",
      roomId: selectedProperty?.slug || properties[0]?.slug || "3bhk",
      branch: branch.slug,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults: adults.toString(),
      kids: childrenCount.toString(),
      children: childrenCount.toString(),
    });

    router.push(`/checkout?${queryParams.toString()}`);
  };

  return (
    <div className="w-full bg-[#0E0A07] text-[#FAF4EB] font-sans pb-24 selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB BAR (Flatel Obsidian Style)                */}
      {/* ======================================================== */}
      <nav
        aria-label="Breadcrumb"
        className="w-full border-b border-[rgba(212,163,89,0.2)] bg-[#16100B]/60 py-3 text-xs text-[#D4C4B3]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#FAF4EB] transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-[#D4C4B3]/50 shrink-0" />
            <Link href="/branches" className="hover:text-[#FAF4EB] transition-colors">
              Branches
            </Link>
            <ChevronRight className="h-3 w-3 text-[#D4C4B3]/50 shrink-0" />
            <span className="text-[#D4C4B3]/70">Hyderabad</span>
            <ChevronRight className="h-3 w-3 text-[#D4C4B3]/50 shrink-0" />
            <span className="text-[#FAF4EB] font-medium truncate">
              {branch.name} Serviced Residences
            </span>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO TITLE & ACTIONS                                   */}
      {/* ======================================================== */}
      <section className="w-full pt-6 pb-4 sm:pt-8 sm:pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#E5C178] animate-pulse" />
                <span className="text-xs font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                  {profile.badge}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#FAF4EB] font-normal tracking-tight">
                  {branch.name} Serviced Residences
                </h1>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-[#D4C4B3]">
                <MapPin className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
                <span>{branch.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] hover:bg-[#221810] text-[#FAF4EB] text-xs font-medium transition-colors cursor-pointer shadow-sm"
                aria-label="Share property link"
              >
                {copiedLink ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#D4C4B3]" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {branch.googleMapsUrl && (
                <a
                  href={branch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] hover:bg-[#221810] text-[#E5C178] text-xs font-medium transition-colors shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. HERO GALLERY (INTERACTIVE) & BOOKING CARD SPLIT        */}
      {/* ======================================================== */}
      <section className="w-full pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT: Photo Preview & Thumbnails Grid (Approx 66% width) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* PRIMARY LARGE IMAGE (PREVIEW DRIVEN BY SELECTED THUMBNAIL) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setLightboxIndex(selectedImageIndex);
                  setIsLightboxOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setLightboxIndex(selectedImageIndex);
                    setIsLightboxOpen(true);
                  }
                }}
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group border border-[rgba(212,163,89,0.28)] bg-[#16100B] shadow-2xl"
                aria-label={`View enlarged photo: ${galleryPhotos[selectedImageIndex]?.title || "Residence Photo"}`}
              >
                <Image
                  key={galleryPhotos[selectedImageIndex]?.src || "main"}
                  src={galleryPhotos[selectedImageIndex]?.src || profile.heroImage}
                  alt={galleryPhotos[selectedImageIndex]?.title || `${branch.name} Serviced Residence`}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover object-center transition-all duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-[#FAF4EB] flex items-end justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#0E0A07]/85 backdrop-blur-md text-[10px] font-sans font-semibold tracking-wider uppercase text-[#E5C178] border border-[rgba(212,163,89,0.2)] mb-1">
                      {galleryPhotos[selectedImageIndex]?.category || "Interior"}
                    </span>
                    <h2 className="font-heading text-base sm:text-lg font-medium leading-tight text-[#FAF4EB] drop-shadow-md">
                      {galleryPhotos[selectedImageIndex]?.title}
                    </h2>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E0A07]/80 backdrop-blur-md text-[#FAF4EB] border border-white/10 text-xs font-medium">
                    <Maximize2 className="w-3.5 h-3.5 text-[#E5C178]" />
                    <span>Fullscreen</span>
                  </span>
                </div>
              </div>

              {/* 4 THUMBNAILS ROW (CLICKING CHOOSES AND PREVIEWS IN BIG IMAGE) */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {galleryPhotos.slice(0, 3).map((photo, index) => {
                  const isSelected = selectedImageIndex === index;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border bg-[#16100B]",
                        isSelected
                          ? "ring-2 ring-[#E5C178] border-[#E5C178] shadow-md shadow-[#E5C178]/20"
                          : "border-[rgba(212,163,89,0.25)] opacity-75 hover:opacity-100 hover:border-[#E5C178]/60"
                      )}
                      aria-label={`Preview photo ${index + 1}: ${photo.title}`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.title}
                        fill
                        sizes="(max-width: 1024px) 25vw, 16vw"
                        className="object-cover object-center"
                      />
                    </button>
                  );
                })}

                {/* 4th Thumbnail slot with "+Photos" button */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(3)}
                    className={cn(
                      "relative w-full h-full rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border bg-[#16100B]",
                      selectedImageIndex >= 3
                        ? "ring-2 ring-[#E5C178] border-[#E5C178] shadow-md shadow-[#E5C178]/20"
                        : "border-[rgba(212,163,89,0.25)] opacity-80 hover:opacity-100"
                    )}
                    aria-label="Preview more photos"
                  >
                    <Image
                      src={galleryPhotos[3]?.src || galleryPhotos[0]?.src}
                      alt="More photos"
                      fill
                      sizes="(max-width: 1024px) 25vw, 16vw"
                      className="object-cover object-center"
                    />
                  </button>

                  {/* Overlay button to open full lightbox */}
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxIndex(3);
                      setIsLightboxOpen(true);
                    }}
                    className="absolute inset-0 bg-[#0E0A07]/65 backdrop-blur-[2px] flex items-center justify-center text-[#FAF4EB] font-sans font-semibold text-xs sm:text-sm hover:bg-[#0E0A07]/55 transition-colors cursor-pointer"
                  >
                    <span>+{galleryPhotos.length} Photos</span>
                  </button>
                </div>
              </div>

              {/* 4 CORE VALUE PROPS (Responsive Recomposition: Swipeable on Mobile) */}
              <div className="pt-3">
                <div className="flex sm:grid sm:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        Spacious Flats
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        Ideal for families &amp; groups
                      </span>
                    </div>
                  </div>

                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        Fully Furnished
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        Modern interiors &amp; kitchen
                      </span>
                    </div>
                  </div>

                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        Flexible Check-in
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        11:00 AM – 1:00 PM
                      </span>
                    </div>
                  </div>

                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        Housekeeping
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        Alternate-day service
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: FLOATING LUXURY BOOKING CARD (34% width) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.85)] p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
                
                {/* Rate Header */}
                <div className="pb-4 border-b border-[rgba(212,163,89,0.2)] flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#D4C4B3]">Starting from</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-heading text-2xl sm:text-3xl font-bold text-[#E5C178]">
                        ₹<span className="tabular-nums">{startingPrice.toLocaleString("en-IN")}</span>
                      </span>
                      <span className="text-xs text-[#D4C4B3]">/ night</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active &amp; Available
                  </span>
                </div>

                {/* Flat Category Selector (If multiple flats available) */}
                {properties.length > 1 && (
                  <div>
                    <label htmlFor="branch-residence-category" className="block text-[11px] uppercase tracking-wider text-[#D4C4B3] font-medium mb-1.5">
                      Select Residence Category
                    </label>
                    <select
                      id="branch-residence-category"
                      value={selectedRoomSlug}
                      onChange={(e) => setSelectedRoomSlug(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] text-xs sm:text-sm text-[#FAF4EB] focus:outline-none focus:ring-1 focus:ring-[#E5C178] cursor-pointer"
                    >
                      {properties.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.title} (₹{p.basePricePerNight.toLocaleString("en-IN")}/N · {p.baseAdults} Adults)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Check-In & Check-Out Date Pickers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="branch-check-in" className="block text-[11px] uppercase tracking-wider text-[#D4C4B3] font-medium mb-1">
                      Check-in
                    </label>
                    <input
                      id="branch-check-in"
                      type="date"
                      min={today ? format(today, "yyyy-MM-dd") : undefined}
                      value={checkIn ? format(checkIn, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newIn = new Date(e.target.value);
                          setCheckIn(newIn);
                          if (checkOut && !isBefore(newIn, checkOut)) {
                            setCheckOut(addDays(newIn, 1));
                          }
                        }
                      }}
                      className="w-full h-11 px-3 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] text-xs text-[#FAF4EB] focus:outline-none focus:ring-1 focus:ring-[#E5C178] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label htmlFor="branch-check-out" className="block text-[11px] uppercase tracking-wider text-[#D4C4B3] font-medium mb-1">
                      Check-out
                    </label>
                    <input
                      id="branch-check-out"
                      type="date"
                      min={
                        checkIn
                          ? format(addDays(checkIn, 1), "yyyy-MM-dd")
                          : today
                          ? format(addDays(today, 1), "yyyy-MM-dd")
                          : undefined
                      }
                      value={checkOut ? format(checkOut, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newOut = new Date(e.target.value);
                          if (checkIn && !isBefore(checkIn, newOut)) {
                            setCheckOut(addDays(checkIn, 1));
                          } else {
                            setCheckOut(newOut);
                          }
                        }
                      }}
                      className="w-full h-11 px-3 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] text-xs text-[#FAF4EB] focus:outline-none focus:ring-1 focus:ring-[#E5C178] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Guests Selector */}
                <div className="relative" ref={guestDropdownRef}>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D4C4B3] font-medium mb-1">
                    Guests
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                    className="w-full h-11 px-3 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] text-xs sm:text-sm text-[#FAF4EB] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#E5C178]" />
                      <span>
                        {adults} {adults === 1 ? "Adult" : "Adults"}
                        {childrenCount > 0 ? `, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}` : ""}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#D4C4B3]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isGuestDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] shadow-2xl z-30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-medium text-[#FAF4EB]">Adults</span>
                          <span className="text-[10px] text-[#D4C4B3]">Age 13+</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                            disabled={adults <= 1}
                            className="w-7 h-7 rounded-lg border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] text-[#FAF4EB] disabled:opacity-40 cursor-pointer flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">{adults}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAdults((prev) =>
                                selectedProperty
                                  ? Math.min(selectedProperty.maxAdults, prev + 1)
                                  : prev + 1
                              )
                            }
                            disabled={selectedProperty ? adults >= selectedProperty.maxAdults : false}
                            className="w-7 h-7 rounded-lg border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] text-[#FAF4EB] disabled:opacity-40 cursor-pointer flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[rgba(212,163,89,0.18)]">
                        <div>
                          <span className="block text-xs font-medium text-[#FAF4EB]">Children</span>
                          <span className="text-[10px] text-emerald-400">0–12 yrs (Stay free)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                            disabled={childrenCount <= 0}
                            className="w-7 h-7 rounded-lg border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] text-[#FAF4EB] disabled:opacity-40 cursor-pointer flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">{childrenCount}</span>
                          <button
                            type="button"
                            onClick={() => setChildrenCount((prev) => Math.min(4, prev + 1))}
                            disabled={childrenCount >= 4}
                            className="w-7 h-7 rounded-lg border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] text-[#FAF4EB] disabled:opacity-40 cursor-pointer flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Booking Action (Direct Checkout) */}
                <button
                  type="button"
                  onClick={handleProceedBooking}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm hover:brightness-105 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <span>Check Availability</span>
                  <ArrowRight className="w-4 h-4 text-[#140E08]" />
                </button>

                {/* Booking Policy Micro-notes */}
                <div className="pt-2 border-t border-[rgba(212,163,89,0.2)] space-y-1.5 text-[11px] text-[#D4C4B3]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>20% advance payment to hold reservation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ABOUT THIS PROPERTY (Split Layout)                    */}
      {/* ======================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-[rgba(212,163,89,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#E5C178]">
                About this property
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight">
                Independent comfort with hotel reliability
              </h2>
              <p className="text-sm sm:text-base text-[#D4C4B3] leading-relaxed pt-1 font-sans">
                {profile.description}
              </p>
            </div>

            {/* Right Suite Photo */}
            <div className="md:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(212,163,89,0.28)] bg-[#16100B] shadow-xl">
                <Image
                  src={
                    branch.slug === "barkas-salala"
                      ? "/images/amenities-bedroom-bg.jpg"
                      : "/images/flats/flat-2bhk-luxury.jpg"
                  }
                  alt={`${branch.name} Master Suite`}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. AVAILABLE RESIDENCES (Mobile Recomposed Carousel)     */}
      {/* ======================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-[rgba(212,163,89,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#E5C178] block">
                Available Residences
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
                Explore units at {branch.name}
              </h2>
            </div>

            <Link
              href="/properties"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#E5C178] hover:text-[#FAF4EB] transition-colors"
            >
              <span>View all residences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards: Horizontal Snap-Scroll on Mobile, Grid on Desktop (Rule 4.3) */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {properties.map((property) => (
              <div
                key={property.id}
                className="w-[84vw] max-w-[340px] shrink-0 snap-center md:w-auto rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] backdrop-blur-md overflow-hidden flex flex-col justify-between hover:border-[#E5C178]/60 transition-colors shadow-lg"
              >
                {/* Photo */}
                <div className="relative aspect-[16/10] w-full bg-[#16100B]">
                  <Image
                    src={
                      property.gallery?.find((g) => g.url)?.url ||
                      (property.slug.includes("1bhk")
                        ? "/images/flats/flat-1bhk-luxury.jpg"
                        : property.slug.includes("2bhk")
                        ? "/images/flats/flat-2bhk-luxury.jpg"
                        : property.slug.includes("3bhk")
                        ? "/images/flats/flat-3bhk-luxury.jpg"
                        : property.slug.includes("4bhk")
                        ? "/images/flats/flat-4bhk-luxury.jpg"
                        : profile.heroImage)
                    }
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 84vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-[#FAF4EB]">
                      {property.title}
                    </h3>

                    {/* Specs Row */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-[#D4C4B3]">
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-[#E5C178]" />
                        <span>{property.specs.bedrooms}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#E5C178]" />
                        <span>Up to {property.maxAdults} Guests</span>
                      </span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-[rgba(212,163,89,0.18)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#D4C4B3] uppercase block">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-lg font-bold text-[#E5C178]">
                          ₹<span className="tabular-nums">{property.basePricePerNight.toLocaleString("en-IN")}</span>
                        </span>
                        <span className="text-xs text-[#D4C4B3]">/ night</span>
                      </div>
                    </div>

                    <Link
                      href={`/properties/${property.slug}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] hover:bg-[#221810] text-[#FAF4EB] text-xs font-semibold transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-center gap-1.5 pt-2 text-[11px] text-[#D4C4B3]/60">
            <span>← Swipe to explore all flats →</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. AMENITIES (Compact 4x2 Grid, Clean & Restrained)       */}
      {/* ======================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-[rgba(212,163,89,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-6 sm:mb-8">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#E5C178] block">
              Amenities
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
              Thoughtfully equipped for a comfortable stay
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Tv className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Living Area</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  Sofa, TV, Wi-Fi
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <UtensilsCrossed className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Kitchen &amp; Dining</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  Refrigerator, Microwave
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Air Conditioning</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  In all bedrooms
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Housekeeping</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  Regular cleaning service
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Car className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Parking</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  On-site parking
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Security</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  24/7 security
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Lift Access</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  Elevator &amp; ramp entry
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Users className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">Family Friendly</span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  Safe &amp; peaceful setting
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. LOCATION & NEARBY LANDMARKS (Dynamic from Profile)    */}
      {/* ======================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-[rgba(212,163,89,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#E5C178] block">
                  Location
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
                  Well connected in Hyderabad
                </h2>
              </div>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-[#D4C4B3]">
                <MapPin className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                <span>{branch.address}</span>
              </div>

              {branch.googleMapsUrl && (
                <a
                  href={branch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] hover:bg-[#221810] text-[#E5C178] text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Right: Map Graphic Box & Landmarks */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Map Preview Box */}
              <div className="sm:col-span-7 h-48 rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] relative overflow-hidden flex flex-col items-center justify-center p-4 text-center shadow-lg">
                <div className="w-10 h-10 rounded-full bg-[#E5C178]/20 border border-[#E5C178]/40 flex items-center justify-center text-[#E5C178] mb-2">
                  <Navigation className="w-5 h-5 text-[#E5C178]" />
                </div>
                <span className="font-heading text-sm font-semibold text-[#FAF4EB]">
                  {branch.name} Serviced Residences
                </span>
                <span className="text-[11px] text-[#D4C4B3] mt-0.5">
                  {profile.tagline}
                </span>
              </div>

              {/* Landmarks List */}
              <div className="sm:col-span-5 space-y-3">
                <span className="text-xs font-semibold text-[#FAF4EB] uppercase tracking-wider block">
                  Nearby landmarks
                </span>
                <div className="space-y-2 text-xs">
                  {profile.landmarks.map((lm, i) => (
                    <div key={i} className="flex items-center text-[#D4C4B3]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5C178]" />
                        <span className="text-[#FAF4EB]">{lm.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. POLICIES (Important Information)                      */}
      {/* ======================================================== */}
      <section className="w-full py-12 sm:py-16 border-t border-[rgba(212,163,89,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-6 sm:mb-8">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#E5C178] block">
              Policies
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
              Important information
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                Check-in / Check-out
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                11:00 AM – 1:00 PM / 11:00 AM
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                20% Advance Hold
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                Balance 80% on arrival
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                Cancellation Policy
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                Free up to 48 hours
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                Guest Verification
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                Valid Govt ID required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. MOBILE BOTTOM RESERVATION BAR (Non-Intrusive CTA)    */}
      {/* ======================================================== */}
      <aside
        aria-label="Mobile reservation bar"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#16100B]/95 backdrop-blur-md border-t border-[rgba(212,163,89,0.28)] px-4 py-3 shadow-2xl flex items-center justify-between gap-3"
      >
        <div>
          <span className="block text-[10px] text-[#D4C4B3] uppercase">Starting from</span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-lg font-bold text-[#E5C178]">
              ₹<span className="tabular-nums">{startingPrice.toLocaleString("en-IN")}</span>
            </span>
            <span className="text-[11px] text-[#D4C4B3]">/ night</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedBooking}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-semibold text-xs shadow-md flex items-center gap-1.5 cursor-pointer border-none hover:brightness-105"
        >
          <span>Check Availability</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#140E08]" />
        </button>
      </aside>

      {/* ======================================================== */}
      {/* 11. FULLSCREEN PHOTO LIGHTBOX MODAL                      */}
      {/* ======================================================== */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0E0A07]/95 flex flex-col justify-between p-4 sm:p-6 text-[#FAF4EB] animate-in fade-in duration-200"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full px-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#E5C178] font-mono">
                {galleryPhotos[lightboxIndex]?.category}
              </span>
              <h3 className="font-heading text-sm sm:text-base font-semibold truncate max-w-xs sm:max-w-md">
                {galleryPhotos[lightboxIndex]?.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#D4C4B3]">
                {lightboxIndex + 1} / {galleryPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-[#16100B] hover:bg-[#221810] border border-[rgba(212,163,89,0.28)] flex items-center justify-center transition-colors text-[#FAF4EB] cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image */}
          <div className="relative flex-1 max-w-5xl mx-auto w-full my-4 flex items-center justify-center">
            <Image
              src={galleryPhotos[lightboxIndex]?.src || profile.heroImage}
              alt={galleryPhotos[lightboxIndex]?.title || "Property Photo"}
              fill
              className="object-contain"
              sizes="90vw"
            />

            {/* Prev Button */}
            <button
              type="button"
              onClick={() =>
                setLightboxIndex(
                  (prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0E0A07]/80 hover:bg-[#16100B] border border-[rgba(212,163,89,0.28)] flex items-center justify-center text-[#FAF4EB] transition-colors cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() =>
                setLightboxIndex((prev) => (prev + 1) % galleryPhotos.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0E0A07]/80 hover:bg-[#16100B] border border-[rgba(212,163,89,0.28)] flex items-center justify-center text-[#FAF4EB] transition-colors cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Thumbnails */}
          <div className="max-w-xl mx-auto w-full flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
            {galleryPhotos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "relative w-14 h-10 rounded-md overflow-hidden shrink-0 border transition-all cursor-pointer bg-[#16100B]",
                  i === lightboxIndex
                    ? "border-[#E5C178] ring-2 ring-[#E5C178]/60"
                    : "border-[rgba(212,163,89,0.2)] opacity-60 hover:opacity-100"
                )}
              >
                <Image src={photo.src} alt={photo.title} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
