"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  ChevronDown,
  Navigation,
} from "lucide-react";
import { BranchItem } from "@/lib/constants";
import { RoomDetail } from "@/lib/mock-rooms";
import { getBranchProfile } from "@/lib/branch-data";
import { ARABIC_BRANCH_OVERLAYS } from "@/components/branch-hub";
import { PhotoCarousel } from "@/components/media/photo-carousel";

interface BranchDetailViewProps {
  branch: BranchItem;
  properties: RoomDetail[];
}

export function BranchDetailView({ branch, properties }: BranchDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const basePath = isAr ? "/ar" : "";
  const profile = React.useMemo(() => getBranchProfile(branch.slug), [branch.slug]);
  const branchOverlay = isAr && branch?.slug ? ARABIC_BRANCH_OVERLAYS[branch.slug] : null;
  const branchDisplayName = branchOverlay?.name || branch.name;
  const branchBadge = branchOverlay?.badge || profile.badge;
  const branchAddress = branchOverlay?.verifiedAddress || branchOverlay?.address || branch.address;
  const branchDescription = branchOverlay?.description || profile.description;
  const branchTagline = branchOverlay?.tagline || profile.tagline;
  const branchLandmarks = branchOverlay?.landmarks || profile.landmarks;

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

    router.push(`${basePath}/checkout?${queryParams.toString()}`);
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
            <Link href={basePath || "/"} className="hover:text-[#FAF4EB] transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className="h-3 w-3 text-[#D4C4B3]/50 shrink-0" />
            <Link href={`${basePath}/branches`} className="hover:text-[#FAF4EB] transition-colors">
              {isAr ? "الفروع" : "Branches"}
            </Link>
            <ChevronRight className="h-3 w-3 text-[#D4C4B3]/50 shrink-0" />
            <span className="text-[#D4C4B3]/70">{isAr ? "حيدر أباد" : "Hyderabad"}</span>
            <ChevronRight className="h-3 w-3 text-[#D4C4B3]/50 shrink-0 rtl:rotate-180" />
            <span className="text-[#FAF4EB] font-medium truncate">
              {isAr ? `شقق فندقية مجهزة — ${branchDisplayName}` : `${branch.name} Serviced Residences`}
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
                  {branchBadge}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#FAF4EB] font-normal tracking-tight">
                  {isAr ? `شقق فندقية مجهزة — ${branchDisplayName}` : `${branch.name} Serviced Residences`}
                </h1>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-[#D4C4B3]">
                <MapPin className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
                <span>{branchAddress}</span>
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
                    <span className="text-emerald-400">{isAr ? "تم نسخ الرابط" : "Link Copied"}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#D4C4B3]" />
                    <span>{isAr ? "مشاركة" : "Share"}</span>
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
                  <span>{isAr ? "عرض على الخريطة" : "View on Map"}</span>
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
              
              <PhotoCarousel
                images={galleryPhotos.map((photo) => ({ url: photo.src, alt: photo.title, category: photo.category }))}
                title={branch.name}
                frameClassName="aspect-[16/10] sm:aspect-[16/9]"
              />

              {/* 4 CORE VALUE PROPS (Responsive Recomposition: Swipeable on Mobile) */}
              <div className="pt-3">
                <div className="flex sm:grid sm:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        {isAr ? "شقق فسيحة وواسعة" : "Spacious Flats"}
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        {isAr ? "مثالية للعائلات والمجموعات" : "Ideal for families & groups"}
                      </span>
                    </div>
                  </div>

                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        {isAr ? "مفروشة بالكامل" : "Fully Furnished"}
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        {isAr ? "تصاميم عصرية ومطبخ مجهز" : "Modern interiors & kitchen"}
                      </span>
                    </div>
                  </div>

                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        {isAr ? "تسجيل وصول مرن" : "Flexible Check-in"}
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        {isAr ? "١١:٠٠ صباحاً – ١:٠٠ ظهراً" : "11:00 AM – 1:00 PM"}
                      </span>
                    </div>
                  </div>

                  <div className="w-[65vw] sm:w-auto shrink-0 snap-start flex items-start gap-2.5 p-3 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)]">
                    <div className="w-8 h-8 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.2)] flex items-center justify-center text-[#E5C178] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF4EB]">
                        {isAr ? "خدمة تنظيف فندقية" : "Housekeeping"}
                      </span>
                      <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                        {isAr ? "خدمة تنظيف دورية منتظمة" : "Alternate-day service"}
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
                    <span className="text-xs text-[#D4C4B3]">{isAr ? "ابتداءً من" : "Starting from"}</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-heading text-2xl sm:text-3xl font-bold text-[#E5C178]">
                        ₹<span className="tabular-nums">{startingPrice.toLocaleString("en-IN")}</span>
                      </span>
                      <span className="text-xs text-[#D4C4B3]">{isAr ? "/ ليلة" : "/ night"}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {isAr ? "متاح وجاهز للحجز" : "Active & Available"}
                  </span>
                </div>

                {/* Flat Category Selector (If multiple flats available) */}
                {properties.length > 1 && (
                  <div>
                    <label htmlFor="branch-residence-category" className="block text-[11px] uppercase tracking-wider text-[#D4C4B3] font-medium mb-1.5">
                      {isAr ? "اختر فئة الشقة الفندقية" : "Select Residence Category"}
                    </label>
                    <select
                      id="branch-residence-category"
                      value={selectedRoomSlug}
                      onChange={(e) => setSelectedRoomSlug(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] text-xs sm:text-sm text-[#FAF4EB] focus:outline-none focus:ring-1 focus:ring-[#E5C178] cursor-pointer"
                    >
                      {properties.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.title} (₹{p.basePricePerNight.toLocaleString("en-IN")}{isAr ? "/ليلة" : "/N"} · {p.baseAdults} {isAr ? "بالغين" : "Adults"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Check-In & Check-Out Date Pickers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="branch-check-in" className="block text-[11px] uppercase tracking-wider text-[#D4C4B3] font-medium mb-1">
                      {isAr ? "تسجيل الوصول" : "Check-in"}
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
                      {isAr ? "تسجيل المغادرة" : "Check-out"}
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
                    {isAr ? "الضيوف" : "Guests"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                    className="w-full h-11 px-3 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] text-xs sm:text-sm text-[#FAF4EB] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#E5C178]" />
                      <span>
                        {isAr
                          ? `${adults} ${adults === 1 ? "بالغ" : "بالغين"}${childrenCount > 0 ? `، ${childrenCount} ${childrenCount === 1 ? "طفل" : "أطفال"}` : ""}`
                          : `${adults} ${adults === 1 ? "Adult" : "Adults"}${childrenCount > 0 ? `, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}` : ""}`}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#D4C4B3]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isGuestDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] shadow-2xl z-30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-medium text-[#FAF4EB]">
                            {isAr ? "البالغين" : "Adults"}
                          </span>
                          <span className="text-[10px] text-[#D4C4B3]">
                            {isAr ? "١٣ سنة فما فوق" : "Age 13+"}
                          </span>
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
                          <span className="block text-xs font-medium text-[#FAF4EB]">
                            {isAr ? "الأطفال" : "Children"}
                          </span>
                          <span className="text-[10px] text-emerald-400">
                            {isAr ? "٠–١٢ سنة (إقامة مجانية)" : "0–12 yrs (Stay free)"}
                          </span>
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
                  <span>{isAr ? "التحقق من التوفر ومتابعة الحجز" : "Check Availability"}</span>
                  <ArrowRight className="w-4 h-4 text-[#140E08] rtl:rotate-180" />
                </button>

                {/* Booking Policy Micro-notes */}
                <div className="pt-2 border-t border-[rgba(212,163,89,0.2)] space-y-1.5 text-[11px] text-[#D4C4B3]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {isAr ? "عربون ٢٠٪ لتأكيد حجز الشقة فوراً" : "20% advance payment to hold reservation"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {isAr ? "إلغاء مجاني حتى ٤٨ ساعة قبل موعد الوصول" : "Free cancellation up to 48 hours before check-in"}
                    </span>
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
                {isAr ? "عن هذا الفرع" : "About this property"}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight">
                {isAr ? "راحة البيت المستقل مع موثوقية الخدمة الفندقية" : "Independent comfort with hotel reliability"}
              </h2>
              <p className="text-sm sm:text-base text-[#D4C4B3] leading-relaxed pt-1 font-sans">
                {branchDescription}
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
                  alt={`${branchDisplayName} Master Suite`}
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
                {isAr ? "الشقق المتوفرة" : "Available Residences"}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
                {isAr ? `استكشف الوحدات المتاحة في ${branchDisplayName}` : `Explore units at ${branch.name}`}
              </h2>
            </div>

            <Link
              href={`${basePath}/properties`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#E5C178] hover:text-[#FAF4EB] transition-colors"
            >
              <span>{isAr ? "عرض كافة الإقامات" : "View all residences"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
                        <span>{isAr ? `حتى ${property.maxAdults} ضيوف` : `Up to ${property.maxAdults} Guests`}</span>
                      </span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-[rgba(212,163,89,0.18)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#D4C4B3] uppercase block">
                        {isAr ? "من" : "From"}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-lg font-bold text-[#E5C178]">
                          ₹<span className="tabular-nums">{property.basePricePerNight.toLocaleString("en-IN")}</span>
                        </span>
                        <span className="text-xs text-[#D4C4B3]">{isAr ? "/ ليلة" : "/ night"}</span>
                      </div>
                    </div>

                    <Link
                      href={`${basePath}/properties/${property.slug}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[#16100B] hover:bg-[#221810] text-[#FAF4EB] text-xs font-semibold transition-colors"
                    >
                      <span>{isAr ? "عرض التفاصيل" : "View Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-center gap-1.5 pt-2 text-[11px] text-[#D4C4B3]/60">
            <span>{isAr ? "← اسحب لاستعراض كافة الشقق →" : "← Swipe to explore all flats →"}</span>
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
              {isAr ? "المزايا والتجهيزات" : "Amenities"}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
              {isAr ? "مجهزة بعناية فائقة لإقامة مريحة وممتعة" : "Thoughtfully equipped for a comfortable stay"}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Tv className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "صالة جلوس واسعة" : "Living Area"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "أريكة مريحة، تلفزيون ذكي، واي فاي" : "Sofa, TV, Wi-Fi"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <UtensilsCrossed className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "مطبخ وتناول طعام" : "Kitchen & Dining"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "ثلاجة، مايكروويف، موقد غاز" : "Refrigerator, Microwave"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "تكييف هواء مركزي" : "Air Conditioning"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "في جميع غرف النوم" : "In all bedrooms"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "تنظيف فندقي دوري" : "Housekeeping"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "تنظيف منتظم وتعقيم شامل" : "Regular cleaning service"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Car className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "مواقف سيارات خاصة" : "Parking"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "مواقف سيارات مؤمنة" : "On-site parking"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "أمن وحراسة ٢٤/٧" : "Security"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "حراسة مدار الساعة وكاميرات مراقبة" : "24/7 security"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Building2 className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "مصعد كهربائي" : "Lift Access"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "مصعد حديث ومدخل ميسر" : "Elevator & ramp entry"}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] flex items-start gap-3">
              <Users className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-semibold text-[#FAF4EB]">
                  {isAr ? "مناسبة للعائلات" : "Family Friendly"}
                </span>
                <span className="block text-[11px] text-[#D4C4B3] mt-0.5">
                  {isAr ? "بيئة آمنة وهادئة تماماً" : "Safe & peaceful setting"}
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
                  {isAr ? "الموقع الجغرافي" : "Location"}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
                  {isAr ? "موقع استراتيجي متصل بأهم معالم حيدر أباد" : "Well connected in Hyderabad"}
                </h2>
              </div>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-[#D4C4B3]">
                <MapPin className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                <span>{branchAddress}</span>
              </div>

              {branch.googleMapsUrl && (
                <a
                  href={branch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] hover:bg-[#221810] text-[#E5C178] text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>{isAr ? "عرض على خرائط Google" : "View on Google Maps"}</span>
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
                  {isAr ? `شقق فندقية مجهزة — ${branchDisplayName}` : `${branch.name} Serviced Residences`}
                </span>
                <span className="text-[11px] text-[#D4C4B3] mt-0.5">
                  {branchTagline}
                </span>
              </div>

              {/* Landmarks List */}
              <div className="sm:col-span-5 space-y-3">
                <span className="text-xs font-semibold text-[#FAF4EB] uppercase tracking-wider block">
                  {isAr ? "معالم قريبة ومراكز حيوية" : "Nearby landmarks"}
                </span>
                <div className="space-y-2 text-xs">
                  {branchLandmarks.map((lm, i) => (
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
              {isAr ? "السياسات والشروط" : "Policies"}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal tracking-tight mt-1">
              {isAr ? "معلومات هامة للإقامة" : "Important information"}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                {isAr ? "تسجيل الوصول / المغادرة" : "Check-in / Check-out"}
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                {isAr ? "١١:٠٠ ص – ١:٠٠ م / ١١:٠٠ ص" : "11:00 AM – 1:00 PM / 11:00 AM"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                {isAr ? "عربون حجز ٢٠٪" : "20% Advance Hold"}
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                {isAr ? "المتبقي ٨٠٪ عند الوصول" : "Balance 80% on arrival"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                {isAr ? "سياسة الإلغاء" : "Cancellation Policy"}
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                {isAr ? "إلغاء مجاني حتى ٤٨ ساعة" : "Free up to 48 hours"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(34,24,16,0.65)] border border-[rgba(212,163,89,0.22)] space-y-1">
              <span className="block text-xs font-semibold text-[#FAF4EB]">
                {isAr ? "إثبات الهوية" : "Guest Verification"}
              </span>
              <span className="block text-xs text-[#D4C4B3]">
                {isAr ? "مطلوب هوية رسمية سارية" : "Valid Govt ID required"}
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
          <span className="block text-[10px] text-[#D4C4B3] uppercase">
            {isAr ? "ابتداءً من" : "Starting from"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-lg font-bold text-[#E5C178]">
              ₹<span className="tabular-nums">{startingPrice.toLocaleString("en-IN")}</span>
            </span>
            <span className="text-[11px] text-[#D4C4B3]">{isAr ? "/ ليلة" : "/ night"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedBooking}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-semibold text-xs shadow-md flex items-center gap-1.5 cursor-pointer border-none hover:brightness-105"
        >
          <span>{isAr ? "التحقق من التوفر" : "Check Availability"}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#140E08] rtl:rotate-180" />
        </button>
      </aside>

    </div>
  );
}
