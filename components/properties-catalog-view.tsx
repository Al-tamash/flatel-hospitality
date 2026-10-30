"use client";

import * as React from "react";
import { SafeImage } from "@/components/media/safe-image";
import Link from "next/link";
import {
  Users,
  BedDouble,
  ArrowRight,
  MapPin,
  Building2,
  UtensilsCrossed,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getBranchBySlug } from "@/lib/constants";
import type { RoomDetail } from "@/lib/mock-rooms";
import { usePathname } from "next/navigation";
import { getLocaleFromPath } from "@/lib/i18n";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import { ARABIC_BRANCH_OVERLAYS } from "@/components/branch-hub";

const FLAT_IMAGES: Record<string, string> = {
  "1bhk": "/images/flats/flat-1bhk-luxury.jpg",
  "2bhk": "/images/flats/flat-2bhk-luxury.jpg",
  "3bhk": "/images/flats/flat-3bhk-luxury.jpg",
  "4bhk": "/images/flats/flat-4bhk-luxury.jpg",
};

export function PropertiesCatalogView() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const isAr = currentLocale === "ar";
  const localePrefix = isAr ? "/ar" : "";

  const [selectedBranch, setSelectedBranch] = React.useState<string>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [flats, setFlats] = React.useState<RoomDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [inventoryError, setInventoryError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    fetch("/api/inventory")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load residences");
        return response.json();
      })
      .then((data) => {
        if (!data.success || !Array.isArray(data.units)) throw new Error("Invalid inventory response");
        if (isMounted) setFlats(data.units);
      })
      .catch(() => {
        if (isMounted) setInventoryError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const filteredFlats = React.useMemo(() => {
    return flats.filter((flat) => {
      const matchBranch =
        selectedBranch === "all" || flat.branchSlug === selectedBranch;
      const matchCategory =
        selectedCategory === "all" ||
        flat.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchBranch && matchCategory;
    });
  }, [flats, selectedBranch, selectedCategory]);

  return (
    <div className="w-full">
      {/* ======================================================== */}
      {/* 1. FILTER CONTROLS (Champagne Gold Segmented Toggles)    */}
      {/* ======================================================== */}
      <div className="mb-10 p-4 sm:p-6 rounded-2xl bg-surface border border-line flex flex-col xl:flex-row items-center justify-between gap-5">
        {/* Branch Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-gold shrink-0 self-start sm:self-center">
            {isAr ? "الفرع:" : "Branch:"}
          </span>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas border border-line-soft w-full sm:w-auto overflow-x-auto">
            {[
              { id: "all", label: isAr ? "كافة الفروع" : "All Properties" },
              { id: "barkas-salala", label: isAr ? "بركاس صلالة" : "Barkas Salala" },
              { id: "moghal-pura", label: isAr ? "مغل بورة" : "Moghal Pura" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBranch(b.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all whitespace-nowrap cursor-pointer",
                  selectedBranch === b.id
                    ? "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold shadow-xs"
                    : "text-fg-soft hover:text-fg"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* BHK Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-gold shrink-0 self-start sm:self-center">
            {isAr ? "نوع الشقة:" : "Apartment Type:"}
          </span>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas border border-line-soft w-full sm:w-auto overflow-x-auto">
            {[
              { id: "all", label: isAr ? "كافة الشقق" : "All BHK" },
              { id: "1bhk", label: "1 BHK" },
              { id: "2bhk", label: "2 BHK" },
              { id: "3bhk", label: "3 BHK" },
              { id: "4bhk", label: "4 BHK" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all whitespace-nowrap cursor-pointer",
                  selectedCategory === c.id
                    ? "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold shadow-xs"
                    : "text-fg-soft hover:text-fg"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CATALOG LIST (Editorial Showcase Layout)              */}
      {/* ======================================================== */}
      {isLoading ? (
        <p className="py-12 text-center text-sm text-fg-soft" role="status">
          {isAr ? "جاري تحميل الشقق المتوفرة..." : "Loading current residences…"}
        </p>
      ) : filteredFlats.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-surface border border-line">
          <Building2 className="w-12 h-12 text-gold/50 mx-auto mb-3" />
          <h2 className="font-heading text-xl font-bold text-fg">
            {inventoryError
              ? (isAr ? "معلومات الشقق غير متوفرة حالياً" : "Residence information is unavailable")
              : flats.length === 0
                ? (isAr ? "لا توجد شقق مدرجة حالياً" : "No residences are listed")
                : (isAr ? "لا توجد شقق مطابقة للتصفية الحالية" : "No residences match your current filter")}
          </h2>
          <p className="text-sm text-fg-soft mt-1 max-w-md mx-auto">
            {inventoryError
              ? (isAr ? "تعذر تحميل الأسعار والوحدات الشاغرة. يرجى المحاولة مرة أخرى لاحقاً." : "Current residence and rate information could not be loaded. Please try again shortly.")
              : flats.length === 0
                ? (isAr ? "يرجى التحقق لاحقاً من الشقق المتاحة." : "Please check back later for current residence availability.")
                : (isAr ? "جرب التبديل إلى كافة الفروع أو كافة الشقق لعرض المزيد من الخيارات في حيدر أباد." : "Try switching to All Properties or All BHK to view residences across Hyderabad.")}
          </p>
          {flats.length > 0 && <button
            type="button"
            onClick={() => {
              setSelectedBranch("all");
              setSelectedCategory("all");
            }}
            className="mt-5 px-5 py-2.5 rounded-xl bg-raised/90 border border-line text-gold text-xs font-bold uppercase tracking-wider hover:border-gold transition-colors cursor-pointer"
          >
            {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
          </button>}
        </div>
      ) : (
        <div data-stagger className="space-y-8 sm:space-y-10">
          {filteredFlats.map((rawFlat, index) => {
            const flat = getLocalizedRoom(rawFlat, currentLocale);
            const branch = flat.branchSlug ? getBranchBySlug(flat.branchSlug) : undefined;
            const branchOverlay = isAr && flat.branchSlug ? ARABIC_BRANCH_OVERLAYS[flat.branchSlug] : null;
            const branchName = branchOverlay?.badge || branch?.name || (isAr ? "حيدر أباد" : "Hyderabad");
            const branchAddress = branchOverlay?.address || branch?.address || "";
            const photoUrl = FLAT_IMAGES[flat.category.toLowerCase()] || "/images/amenities-bedroom-bg.jpg";

            return (
              <div
                key={flat.id}
                className="card-lift rounded-2xl border border-line bg-surface overflow-hidden shadow-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Photo Column (5 cols) */}
                  <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[300px] lg:min-h-full">
                    <SafeImage
                      src={photoUrl}
                      alt={flat.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 42vw"
                      className="object-cover object-center"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent lg:hidden pointer-events-none"
                      aria-hidden="true"
                    />
                    {/* Category Pill */}
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-canvas/90 backdrop-blur-md border border-line text-xs font-bold text-gold uppercase tracking-wider">
                      {flat.category} · {flat.capacityLabel}
                    </div>
                  </div>

                  {/* Content Column (7 cols) */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      {/* Branch & Locality Header */}
                      <div className="flex items-center gap-2 text-xs font-sans text-gold font-bold uppercase tracking-wider mb-2">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        <span>{branchName}</span>
                        {branchAddress && (
                          <>
                            <span className="text-gold/40">·</span>
                            <span className="text-fg-soft font-normal">{branchAddress}</span>
                          </>
                        )}
                      </div>

                      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-fg">
                        {flat.title}
                      </h2>

                      <p className="text-sm text-fg-soft mt-2 line-clamp-2 leading-relaxed">
                        {flat.shortDescription}
                      </p>

                      {/* Specs Row with Subtle Dividers */}
                      <div className="mt-5 py-3.5 border-y border-line-soft grid grid-cols-3 gap-3 text-xs sm:text-sm text-fg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gold shrink-0" />
                          <span>{flat.specs.guests}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-gold shrink-0" />
                          <span>{flat.specs.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-gold shrink-0" />
                          <span>{flat.specs.kitchen}</span>
                        </div>
                      </div>

                      {/* Inclusions Strip */}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-fg-soft">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-raised/60 border border-line-soft">
                          <Check className="w-3 h-3 text-gold" /> {isAr ? "تنظيف دوري للغرف" : "Alternate-Day Housekeeping"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-raised/60 border border-line-soft">
                          <Check className="w-3 h-3 text-gold" /> {isAr ? "غاز طهي مركزي مجاني" : "Piped Cooking Gas"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-raised/60 border border-line-soft">
                          <Check className="w-3 h-3 text-gold" /> {isAr ? "مولد طاقة احتياطي متواصل" : "Inverter Power Backup"}
                        </span>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="mt-6 pt-5 border-t border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-3xl font-bold text-gold">
                            {formatPrice(flat.basePricePerNight)}
                          </span>
                          <span className="text-xs text-fg-soft font-sans">
                            {isAr ? "/ ليلة (السعر الأساسي)" : "/ night base rate"}
                          </span>
                        </div>
                        <p className="text-xs text-fg/70 mt-0.5">
                          {isAr
                            ? `عربون ٢٠٪ (${formatPrice(Math.round(flat.basePricePerNight * 0.2))}) لتثبيت الحجز`
                            : `20% advance deposit (${formatPrice(Math.round(flat.basePricePerNight * 0.2))}) to reserve`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`${localePrefix}/properties/${flat.slug}`}
                          className="w-full sm:w-auto px-6 py-3 min-h-[46px] rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-105 text-ink font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                        >
                          <span>{isAr ? "حجز الشقة الآن" : "Reserve Suite"}</span>
                          <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
