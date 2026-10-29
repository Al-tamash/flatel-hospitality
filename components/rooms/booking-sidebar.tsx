"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { format, addDays, isBefore, startOfToday, differenceInCalendarDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Users,
  Minus,
  Plus,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Building,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RoomDetail, FacilityAddon, ALL_MASTER_ADDONS } from "@/lib/mock-rooms";
import { WHATSAPP_CONFIG } from "@/lib/constants";
import { calculateFlatelPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { getPurposeLabel, isPurposeId } from "@/lib/purpose/purpose-services";
import { buildAddonSummary } from "@/lib/booking/addon-summary";
import { useFloatingOffset } from "@/components/floating-contact";
import type { StayPurposeType } from "@/types/booking";

interface BookingSidebarProps {
  room: RoomDetail;
  locale?: "en" | "ar";
  selectedPurposeId:
    | "medical"
    | "wedding"
    | "tourism"
    | "corporate"
    | "family"
    | "accommodation_only"
    | null;
  selectedAddonIds: string[];
  onSelectPurpose?: (
    purposeId:
      | "medical"
      | "wedding"
      | "tourism"
      | "corporate"
      | "family"
      | "accommodation_only"
      | null
  ) => void;
  onToggleAddon?: (addonId: string) => void;
  onOpenServiceDrawer?: () => void;
  checkIn?: Date | undefined;
  checkOut?: Date | undefined;
  adults?: number;
  childrenCount?: number;
  onCheckInChange?: (date: Date | undefined) => void;
  onCheckOutChange?: (date: Date | undefined) => void;
  onAdultsChange?: (adults: number) => void;
  onChildrenChange?: (children: number) => void;
  /** Open the check-in picker once on arrival (search without dates). */
  autoOpenCheckIn?: boolean;
}

export const ARABIC_ADDONS_TRANSLATION: Record<string, string> = {
  "doctor-nurse-visits": "زيارات منزلية مخصصة لطبيب أو ممرض",
  "oxygen-concentrator": "تجهيز مكثف أو أسطوانة أكسجين طبي",
  "patient-meal-prep": "إعداد وجبات صحية مخصصة للمريض",
  "priority-check-in": "تسجيل وصول مبكر وتعقيم مكثف إضافي",
  "hospital-cab-transfer": "سيارة بسائق خاص للتوصيل للمستشفيات",
  "airport-station-transfer": "توصيل واستقبال خاص من وإلى المطار",
  "full-day-sightseeing-cab": "سيارة خاصة بسائق لجولة سياحية ليوم كامل",
  "expert-local-guide": "مرشد سياحي وتراثي محلي متخصص",
  "pro-photography-tour": "جلسة تصوير احترافية وتوثيق رقمي",
  "breakfast-hamper": "سلة إفطار حيدر أبادي طازجة يومياً",
  "airport-express-chauffeur": "توصيل تنفيذي سريع من المطار بسيارة وسائق",
  "express-laundry-ironing": "غسيل وكي ملابس سريع في نفس اليوم",
  "executive-meal-subscription": "اشتراك وجبات طازجة يومية للشركات",
  "priority-checkin-checkout": "مرونة تسجيل الوصول المبكر أو المغادرة المتأخرة",
  "extra-floor-mattress": "فرشة نوم إضافية مريحة مع مفارش نظيفة",
  "wedding-venue-booking": "المساعدة في حجز قاعات الأفراح والمناسبات",
  "wedding-card-printing": "تنسيق طباعة وتوصيل بطاقات الدعوة",
  "bride-attire-coordination": "تنسيق أزياء العروس وخياطة البوتيك",
  "groom-attire-coordination": "تنسيق أزياء العريس وخياطة الشيرواني",
  "wedding-stage-decor": "خدمات تزيين جناح العرسان ومنصات المناسبات",
  "luxury-wedding-cars": "تأجير سيارات فارهة لحفلات الزفاف والمواكب",
  "wedding-makeup-artist": "خبيرة تجميل ومصففة شعر احترافية للعروس",
  "wedding-photography": "تنسيق التصوير الفوتوغرافي والفيديو السينمائي",
};

export function BookingSidebar({
  room,
  locale,
  selectedPurposeId,
  selectedAddonIds,
  onSelectPurpose,
  autoOpenCheckIn = false,
  checkIn: controlledCheckIn,
  checkOut: controlledCheckOut,
  adults: controlledAdults,
  childrenCount: controlledChildrenCount,
  onCheckInChange,
  onCheckOutChange,
  onAdultsChange,
  onChildrenChange,
}: BookingSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = locale || (pathname?.startsWith("/ar") ? "ar" : "en");
  const basePath = currentLocale === "ar" ? "/ar" : "";
  const [internalCheckIn, setInternalCheckIn] = React.useState<Date | undefined>(undefined);
  const [internalCheckOut, setInternalCheckOut] = React.useState<Date | undefined>(undefined);
  const [internalAdults, setInternalAdults] = React.useState<number>(room.baseAdults || 2);
  const [internalChildrenCount, setInternalChildrenCount] = React.useState<number>(0);
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  const checkIn = controlledCheckIn !== undefined ? controlledCheckIn : internalCheckIn;
  const checkOut = controlledCheckOut !== undefined ? controlledCheckOut : internalCheckOut;
  const adults = controlledAdults !== undefined ? controlledAdults : internalAdults;
  const childrenCount = controlledChildrenCount !== undefined ? controlledChildrenCount : internalChildrenCount;

  const setCheckIn = (date: Date | undefined) => {
    setInternalCheckIn(date);
    onCheckInChange?.(date);
  };

  const setCheckOut = (date: Date | undefined) => {
    setInternalCheckOut(date);
    onCheckOutChange?.(date);
  };

  const setAdults = (value: number | ((prev: number) => number)) => {
    const newVal = typeof value === "function" ? value(adults) : value;
    setInternalAdults(newVal);
    onAdultsChange?.(newVal);
  };

  const setChildrenCount = (value: number | ((prev: number) => number)) => {
    const newVal = typeof value === "function" ? value(childrenCount) : value;
    setInternalChildrenCount(newVal);
    onChildrenChange?.(newVal);
  };

  // Popover open states
  const [checkInOpen, setCheckInOpen] = React.useState(false);

  React.useEffect(() => {
    if (!autoOpenCheckIn) return;
    const timer = window.setTimeout(() => {
      document.getElementById("reservation-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setCheckInOpen(true);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [autoOpenCheckIn]);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);
  const [guestsOpen, setGuestsOpen] = React.useState(false);


  // Night calculation: differenceInCalendarDays (check-out date is never billed as an extra night)
  // Defaults to 2 nights for UI presentation when dates are being selected
  const totalNights = React.useMemo(() => {
    if (checkIn && checkOut) {
      const diff = differenceInCalendarDays(checkOut, checkIn);
      return Math.max(1, diff);
    }
    return 2;
  }, [checkIn, checkOut]);

  // Capacity validation
  const maxAllowedAdults = room.maxAdults;
  const maxAllowedChildren = room.maxChildren;
  const isAdultsOverCapacity = adults > maxAllowedAdults;
  const isChildrenOverCapacity =
    typeof maxAllowedChildren === "number" ? childrenCount > maxAllowedChildren : false;
  const isOverCapacity = isAdultsOverCapacity || isChildrenOverCapacity;


  const activePurposeLabel =
    selectedPurposeId && (isPurposeId(selectedPurposeId) || selectedPurposeId === "accommodation_only")
      ? getPurposeLabel(selectedPurposeId, currentLocale === "ar" ? "ar" : "en")
      : null;

  const allAvailableAddons = React.useMemo(() => ALL_MASTER_ADDONS, []);
  const activeAddons = React.useMemo(() => {
    return allAvailableAddons.filter((addon) =>
      selectedAddonIds.includes(addon.id)
    );
  }, [allAvailableAddons, selectedAddonIds]);

  // PRD Dynamic Pricing Calculation
  const fareResult = React.useMemo(() => {
    const validPaidAddons = activeAddons
      .filter((a): a is FacilityAddon & { price: number } => typeof a.price === "number")
      .map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
        pricingType: a.pricingType === "per_night" ? ("per_night" as const) : ("per_booking" as const),
      }));

    return calculateFlatelPrice({
      nights: totalNights,
      basePricePerNight: room.basePricePerNight,
      baseAdults: room.baseAdults || 2,
      selectedAdults: adults,
      selectedKids: childrenCount,
      extraPersonFee: room.extraPersonFeePerNight || 500,
      selectedPaidAddons: validPaidAddons,
    });
  }, [totalNights, room, adults, childrenCount, activeAddons]);

  // Add-ons are chosen in the flat page's services section; the panel only summarises them
  const addonSummary = buildAddonSummary({
    selected: activeAddons,
    addonsTotal: fareResult.addonsTotal,
    locale: currentLocale === "ar" ? "ar" : "en",
  });

  const scrollToPurposeServices = () => {
    setIsMobileSheetOpen(false);
    const target = document.getElementById("purpose-addons") || document.getElementById("purpose-services");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addonSummaryButton = (
    <button
      type="button"
      onClick={scrollToPurposeServices}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold text-start transition-colors cursor-pointer",
        addonSummary.hasSelection
          ? "bg-[#E5C178]/10 border-[#E5C178]/60 text-[#FAF4EB] hover:border-[#E5C178]"
          : "bg-[#16100B] border-[rgba(212,163,89,0.25)] text-[#E5C178] hover:border-[#E5C178]"
      )}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        <Sparkles className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
        <span className="truncate">{addonSummary.label}</span>
      </span>
    </button>
  );

  // Central WhatsApp Concierge link (configuration-driven)
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(
    `Hello Flatel, I am interested in reserving the ${room.title} for ${totalNights} nights.`
  );

  const handleProceedToBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverCapacity) return;

    if (!checkIn || !checkOut) {
      setDateError(
        currentLocale === "ar"
          ? "يرجى تحديد تواريخ تسجيل الوصول والمغادرة للمتابعة."
          : "Please select check-in and check-out dates to proceed to secure booking."
      );
      setCheckInOpen(true);
      return;
    }

    setDateError(null);
    const query = new URLSearchParams({
      property: room.slug,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      adults: adults.toString(),
      kids: childrenCount.toString(),
    });

    if (selectedPurposeId) {
      query.set("purpose", selectedPurposeId);
    } else {
      query.set("purpose", "accommodation_only");
    }

    if (selectedAddonIds.length > 0) {
      query.set("addons", selectedAddonIds.join(","));
    }

    const targetUrl = `${basePath}/checkout?${query.toString()}`;
    router.push(targetUrl);
  };

  const panelRef = React.useRef<HTMLElement>(null);
  const [isPanelInView, setIsPanelInView] = React.useState(false);
  const mobileBarRef = React.useRef<HTMLDivElement>(null);
  useFloatingOffset(mobileBarRef, !isPanelInView);

  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPanelInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={panelRef}
      id="booking-panel"
      className="w-full rounded-3xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.75)] p-5 sm:p-6 shadow-2xl lg:backdrop-blur-md"
      aria-label="Reservation Summary and Booking Form"
    >
      {/* Top Pricing Header */}
      <div className="flex items-baseline justify-between border-b border-[rgba(212,163,89,0.2)] pb-4">
        <div>
          <span className="text-xs font-sans font-medium tracking-[0.16em] uppercase text-[#E5C178]">
            {currentLocale === "ar" ? "ابتداءً من" : "Starting from"}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-heading text-2xl sm:text-3xl font-normal tabular-nums text-[#FAF4EB]">
              ₹{room.basePricePerNight.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[#B8A692]">{currentLocale === "ar" ? "/ ليلة" : "/ night"}</span>
          </div>
        </div>
        <div className={cn("text-right", currentLocale === "ar" && "text-left")}>
          <span className="text-xs font-sans font-medium tracking-[0.16em] uppercase text-[#E5C178]">
            {currentLocale === "ar" ? "سياسة عربون ٢٠٪" : "20% Advance Policy"}
          </span>
          <p className="text-xs text-[#B8A692] mt-0.5">
            {currentLocale === "ar" ? "دفع ٨٠٪ عند الوصول" : "Pay 80% on arrival"}
          </p>
        </div>
      </div>

      {/* Date & Guest Form */}
      <form onSubmit={handleProceedToBook} className="mt-5 space-y-3">
        {/* Date Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Check-In */}
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex flex-col items-start justify-center rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/80 p-2.5 text-left hover:bg-[#16100B] hover:border-[rgba(212,163,89,0.45)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] w-full transition-colors"
                  aria-label="Select check-in date"
                />
              }
            >
              <div className="flex items-center gap-1.5 text-xs uppercase font-sans font-semibold tracking-[0.14em] text-[#FAF4EB]/80">
                <CalendarIcon className="h-3 w-3 text-[#E5C178]" /> {currentLocale === "ar" ? "تسجيل الوصول" : "Check-In"}
              </div>
              <span className="text-xs font-medium text-[#FAF4EB] mt-1 truncate w-full">
                {checkIn ? format(checkIn, "d MMM yyyy") : (currentLocale === "ar" ? "اختر التاريخ" : "Select date")}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 bg-[#16100B] border border-[rgba(212,163,89,0.3)] shadow-2xl rounded-2xl z-50 text-[#FAF4EB]"
              align="start"
            >
              <div className="pb-2 mb-2 border-b border-[rgba(212,163,89,0.2)] text-xs font-medium text-[#FAF4EB]">
                {currentLocale === "ar" ? "اختر تاريخ تسجيل الوصول" : "Select Check-in Date"}
              </div>
              {checkInOpen && (
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    setCheckIn(date);
                    setDateError(null);
                    if (date && checkOut && isBefore(checkOut, date)) {
                      setCheckOut(addDays(date, 2));
                    }
                    setCheckInOpen(false);
                  }}
                  disabled={{ before: startOfToday() }}
                  className="rounded-md"
                />
              )}
            </PopoverContent>
          </Popover>

          {/* Check-Out */}
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex flex-col items-start justify-center rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/80 p-2.5 text-left hover:bg-[#16100B] hover:border-[rgba(212,163,89,0.45)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] w-full transition-colors"
                  aria-label="Select check-out date"
                />
              }
            >
              <div className="flex items-center gap-1.5 text-xs uppercase font-sans font-semibold tracking-[0.14em] text-[#FAF4EB]/80">
                <CalendarIcon className="h-3 w-3 text-[#E5C178]" /> {currentLocale === "ar" ? "تسجيل المغادرة" : "Check-Out"}
              </div>
              <span className="text-xs font-medium text-[#FAF4EB] mt-1 truncate w-full">
                {checkOut ? format(checkOut, "d MMM yyyy") : (currentLocale === "ar" ? "اختر التاريخ" : "Select date")}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 bg-[#16100B] border border-[rgba(212,163,89,0.3)] shadow-2xl rounded-2xl z-50 text-[#FAF4EB]"
              align="end"
            >
              <div className="pb-2 mb-2 border-b border-[rgba(212,163,89,0.2)] text-xs font-medium text-[#FAF4EB]">
                {currentLocale === "ar" ? "اختر تاريخ تسجيل المغادرة" : "Select Check-out Date"}
              </div>
              {checkOutOpen && (
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={(date) => {
                    setCheckOut(date);
                    setDateError(null);
                    setCheckOutOpen(false);
                  }}
                  disabled={{
                    before: checkIn ? addDays(checkIn, 1) : startOfToday(),
                  }}
                  className="rounded-md"
                />
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests Selector */}
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex items-center justify-between w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/80 px-3.5 py-2.5 text-left hover:bg-[#16100B] hover:border-[rgba(212,163,89,0.45)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] transition-colors"
                aria-label="Select guests"
              />
            }
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase font-sans font-semibold tracking-[0.14em] text-[#FAF4EB]/80">
                <Users className="h-3 w-3 text-[#E5C178]" /> {currentLocale === "ar" ? "الضيوف" : "Guests"}
              </div>
              <span className="text-xs font-medium text-[#FAF4EB] mt-0.5 block">
                {currentLocale === "ar"
                  ? `${adults} ${adults === 1 ? "بالغ" : "بالغين"}${childrenCount > 0 ? `، ${childrenCount} ${childrenCount === 1 ? "طفل" : "أطفال"}` : ""}`
                  : `${adults} Adult${adults > 1 ? "s" : ""}${childrenCount > 0 ? `, ${childrenCount} Child` : ""}`}
              </span>
            </div>
            <span className="text-xs text-[#E5C178] font-sans font-medium">
              {currentLocale === "ar"
                ? (room.maxChildren !== null
                    ? `حتى ${room.maxAdults} بالغين · حتى ${room.maxChildren} أطفال، والإضافي ₹٣٠٠ لليلة`
                    : `حتى ${room.maxAdults} بالغين · الطفل الإضافي ₹٣٠٠ لليلة`)
                : (room.maxChildren !== null
                    ? `Up to ${room.maxAdults} adults · up to ${room.maxChildren} kids, extra ₹300/night`
                    : `Up to ${room.maxAdults} adults · extra children ₹300/night`)}
            </span>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-4 bg-[#16100B] border border-[rgba(212,163,89,0.3)] shadow-2xl rounded-2xl z-50 space-y-4 text-[#FAF4EB]"
            align="start"
          >
            <div className="border-b border-[rgba(212,163,89,0.2)] pb-2">
              <p className="text-xs font-semibold text-[#FAF4EB]">
                {currentLocale === "ar" ? "سعة الشقة الفندقية" : "Apartment Occupancy"}
              </p>
              <p className="text-[10px] text-[#B8A692] leading-relaxed mt-0.5">
                {currentLocale === "ar"
                  ? `تتسع ${room.title} لما يصل إلى ${room.maxAdults} بالغين (${room.baseAdults} أساسي + ${room.maxExtraGuests} إضافي). ${
                      room.maxChildren !== null
                        ? `سعة سلامة الأطفال: حتى ${room.maxChildren} أطفال. يشمل السعر الأساسي عدداً من الأطفال، ويُحتسب على كل طفل إضافي ₹٣٠٠ لليلة، ويُحتسبون ضمن معايير السعة.`
                        : "يشمل السعر الأساسي عدداً من الأطفال، ويُحتسب على كل طفل إضافي ₹٣٠٠ لليلة، ويُحتسبون ضمن معايير السعة والسلامة."
                    }`
                  : `${room.title} accommodates up to ${room.maxAdults} adults (${room.baseAdults} base + ${room.maxExtraGuests} extra). ${
                      room.maxChildren !== null
                        ? `Child safety capacity: up to ${room.maxChildren} children. The base price includes some children; each extra child is ₹300 per night. All guests count toward safety capacity.`
                        : "The base price includes some children; each extra child is ₹300 per night. All guests count toward safety capacity (exact child limit subject to unit size)."
                    }`}
              </p>
            </div>

            {/* Adults Stepper */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#FAF4EB]">
                  {currentLocale === "ar" ? "البالغين" : "Adults"}
                </p>
                <p className="text-[10px] text-[#B8A692]">
                  {currentLocale === "ar" ? `الحد الأقصى ${room.maxAdults}` : `Max ${room.maxAdults}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                  disabled={adults <= 1}
                  className="h-7 w-7 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#221810] hover:bg-[#2a1e14] hover:border-[#E5C178]/50 flex items-center justify-center text-[#FAF4EB] disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease adults"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#FAF4EB] font-sans">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => setAdults((prev) => Math.min(room.maxAdults, prev + 1))}
                  disabled={adults >= room.maxAdults}
                  className="h-7 w-7 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#221810] hover:bg-[#2a1e14] hover:border-[#E5C178]/50 flex items-center justify-center text-[#FAF4EB] disabled:opacity-40 cursor-pointer"
                  aria-label="Increase adults"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Children Stepper */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#FAF4EB]">
                  {currentLocale === "ar" ? "الأطفال (٠–١٢ سنة)" : "Children (0–12 yrs)"}
                </p>
                <p className="text-[10px] text-[#B8A692]">
                  {currentLocale === "ar"
                    ? (room.maxChildren !== null
                        ? `الحد الأقصى ${room.maxChildren} · الطفل الإضافي ₹٣٠٠ لليلة`
                        : "الطفل الإضافي ₹٣٠٠ لليلة")
                    : (room.maxChildren !== null
                        ? `Max ${room.maxChildren} · Extra child ₹300/night`
                        : "Extra child ₹300/night · Counts toward safety capacity")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                  disabled={childrenCount <= 0}
                  className="h-7 w-7 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#221810] hover:bg-[#2a1e14] hover:border-[#E5C178]/50 flex items-center justify-center text-[#FAF4EB] disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease children"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#FAF4EB] font-sans">
                  {childrenCount}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setChildrenCount((prev) =>
                      room.maxChildren !== null
                        ? Math.min(room.maxChildren, prev + 1)
                        : Math.min(10, prev + 1)
                    )
                  }
                  disabled={
                    room.maxChildren !== null
                      ? childrenCount >= room.maxChildren
                      : childrenCount >= 10
                  }
                  className="h-7 w-7 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#221810] hover:bg-[#2a1e14] hover:border-[#E5C178]/50 flex items-center justify-center text-[#FAF4EB] disabled:opacity-40 cursor-pointer"
                  aria-label="Increase children"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGuestsOpen(false)}
              className="w-full text-xs font-medium border border-[rgba(212,163,89,0.3)] bg-[#221810] hover:bg-[#2a1e14] text-[#FAF4EB]"
            >
              {currentLocale === "ar" ? "تم" : "Done"}
            </Button>
          </PopoverContent>
        </Popover>

        {/* Capacity Warning */}
        {isOverCapacity && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/15 border border-destructive/30 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              {currentLocale === "ar"
                ? (isAdultsOverCapacity
                    ? `تجاوز الحد الأقصى للبالغين (${maxAllowedAdults} بالغين) لهذه الشقة.`
                    : `تجاوزت سعة سلامة الأطفال المسموح بها (${maxAllowedChildren} أطفال).`)
                : (isAdultsOverCapacity
                    ? `Exceeds maximum adult limit (${maxAllowedAdults} adults) for this residence.`
                    : `Exceeds child safety capacity (${maxAllowedChildren} children) for this residence.`)}
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAY PURPOSE & MONETIZATION ADD-ONS                       */}
        {/* ======================================================== */}
        <div className="pt-3 border-t border-[rgba(212,163,89,0.2)] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xs uppercase font-sans tracking-[0.14em] text-[#B8A692] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5C178]" />
              <span>{currentLocale === "ar" ? "الغرض من الإقامة (اختياري)" : "Stay Purpose (Optional)"}</span>
            </span>
            {selectedPurposeId && selectedPurposeId !== "accommodation_only" && (
              <button
                type="button"
                onClick={() => onSelectPurpose?.("accommodation_only")}
                className="text-[11px] text-[#B8A692] hover:text-[#FAF4EB] underline cursor-pointer"
              >
                {currentLocale === "ar" ? "إعادة ضبط" : "Reset"}
              </button>
            )}
          </div>

          {/* Purpose Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedPurposeId || "accommodation_only"}
              onChange={(e) => {
                const val = e.target.value as StayPurposeType;
                onSelectPurpose?.(val);
              }}
              aria-label="Select stay purpose"
              className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B] px-3 py-2 text-xs font-medium text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none cursor-pointer"
            >
              <option value="accommodation_only">{currentLocale === "ar" ? "إقامة قياسية (سكن فقط)" : "Standard Stay (Accommodation Only)"}</option>
              <option value="medical">{currentLocale === "ar" ? "رعاية صحية ومرافقة مرضى (ميدستاي)" : "Hospital & Medical (Medistay)"}</option>
              <option value="wedding">{currentLocale === "ar" ? "حفلات زفاف ومناسبات عائلية" : "Wedding & Event Stay"}</option>
              <option value="family">{currentLocale === "ar" ? "إجازات عائلية وإقامة طويلة" : "Family Long-Stay"}</option>
              <option value="corporate">{currentLocale === "ar" ? "رحلات عمل وتنفيذيون" : "Corporate & Executive"}</option>
              <option value="tourism">{currentLocale === "ar" ? "سياحة واستكشاف المعالم" : "Heritage & Tourism"}</option>
            </select>
          </div>

          {addonSummaryButton}
        </div>

        {/* ======================================================== */}
        {/* DETAILED BOOKING SUMMARY & PRD FORMULA BREAKDOWN        */}
        {/* ======================================================== */}
        <div className="pt-4 border-t border-[rgba(212,163,89,0.2)] space-y-2.5 text-xs">
          <div className="flex justify-between text-[#B8A692]">
            <span>
              ₹{room.basePricePerNight.toLocaleString("en-IN")} × {totalNights}{" "}
              {currentLocale === "ar"
                ? (totalNights === 1 ? "ليلة" : "ليالٍ")
                : (totalNights > 1 ? "nights" : "night")}
            </span>
            <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">
              ₹{fareResult.standardBaseRent.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Duration Discount (10% for 7-14N, 15% for 15-27N, 25% for 28+N) */}
          {fareResult.discountRate > 0 && (
            <div className="flex justify-between text-[#E5C178] font-medium bg-[#E5C178]/10 px-2.5 py-1 rounded-lg border border-[#E5C178]/25 font-sans">
              <span>
                {currentLocale === "ar"
                  ? `خصم الإقامة الطويلة (${fareResult.discountRate * 100}%-)`
                  : `Duration Discount (${fareResult.discountRate * 100}% off)`}
              </span>
              <span className="font-serif tabular-nums">-₹{fareResult.baseRentDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Extra guest fees: adults above base capacity (₹500/night each) and children above the included allowance (₹300/night each) */}
          {fareResult.extraAdults > 0 && (
            <div className="flex justify-between text-[#B8A692]">
              <span>
                {currentLocale === "ar"
                  ? `نزلاء إضافيون (${fareResult.extraAdults} × ₹500 × ${totalNights} ليالٍ)`
                  : `Extra Adults (${fareResult.extraAdults} × ₹500 × ${totalNights}n)`}
              </span>
              <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">
                ₹{(fareResult.extraGuestsTotal - (fareResult.extraKidsTotal ?? 0)).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {(fareResult.extraKids ?? 0) > 0 && (
            <div className="flex justify-between text-[#B8A692]">
              <span>
                {currentLocale === "ar"
                  ? `أطفال إضافيون (${fareResult.extraKids} × ₹300 × ${totalNights} ليالٍ)`
                  : `Extra Children (${fareResult.extraKids} × ₹300 × ${totalNights}n)`}
              </span>
              <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">
                ₹{(fareResult.extraKidsTotal ?? 0).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Paid add-ons (chosen in the services section) */}
          {activeAddons.length > 0 && (
            <div className="flex justify-between text-[#B8A692] pt-1 border-t border-[rgba(212,163,89,0.15)]">
              <span>
                {currentLocale === "ar"
                  ? `الخدمات الإضافية (${activeAddons.length})`
                  : `Add-ons (${activeAddons.length})`}
              </span>
              <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">
                ₹{fareResult.addonsTotal.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-2 border-t border-[rgba(212,163,89,0.2)] text-sm font-semibold text-[#FAF4EB]">
            <span>{currentLocale === "ar" ? "المجموع الإجمالي" : "Gross Total"}</span>
            <span className="font-heading text-xl font-normal text-[#E5C178] tabular-nums">
              ₹{fareResult.grossTotal.toLocaleString("en-IN")}
            </span>
          </div>

          {/* ======================================================== */}
          {/* PAYMENT SPLIT: 20% ADVANCE NOW vs 80% REMAINING BALANCE  */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-[rgba(212,163,89,0.3)] bg-[rgba(229,193,120,0.06)] p-3.5 space-y-2.5 mt-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-[#E5C178]" />
                <span className="font-medium text-[#FAF4EB]">
                  {currentLocale === "ar" ? "عربون حجز أونلاين (٢٠٪)" : "20% Online Advance Deposit"}
                </span>
              </div>
              <span className="font-heading text-lg font-normal text-[#FAF4EB] tabular-nums">
                ₹{fareResult.advancePayable.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(212,163,89,0.2)] text-[#B8A692]">
              <div className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-[#B8A692]" />
                <span>
                  {currentLocale === "ar" ? "المتبقي ٨٠٪ عند الوصول (نقداً / UPI)" : "80% Balance Due on Arrival (Cash / UPI)"}
                </span>
              </div>
              <span className="font-serif text-sm font-medium text-[#FAF4EB]/90 tabular-nums">
                ₹{fareResult.balanceDueOnArrival.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Inline Date Validation Error */}
        {dateError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{dateError}</span>
          </div>
        )}

        {/* Primary CTA: Proceed to Secure Booking */}
        <Button
          type="submit"
          disabled={isOverCapacity}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:opacity-95 text-[#140E08] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[rgba(229,193,120,0.2)] active:scale-[0.99] mt-3 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-[#140E08]" />
          <span>
            {currentLocale === "ar"
              ? `احجز الآن — ادفع ₹${fareResult.advancePayable.toLocaleString("en-IN")} كعربون`
              : `Reserve Now — Pay ₹${fareResult.advancePayable.toLocaleString("en-IN")} Advance`}
          </span>
        </Button>

        {/* Transparent Policy Reassurance */}
        <div className="pt-2 text-center text-xs text-[#B8A692] flex items-center justify-center gap-1.5 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
          <span>
            {currentLocale === "ar"
              ? "ادفع ٢٠٪ الآن · والباقي ٨٠٪ عند تسجيل الوصول · إلغاء مجاني حتى ٤٨ ساعة"
              : "Pay 20% now · Remaining 80% at check-in · Free cancellation up to 48 hrs"}
          </span>
        </div>

        {/* Direct WhatsApp Concierge Help Action */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-2 py-2.5 px-3 rounded-xl border border-[rgba(212,163,89,0.3)] hover:border-[#E5C178] bg-[#16100B]/60 text-xs text-[#FAF4EB] hover:text-[#E5C178] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer group"
          aria-label="Ask questions on WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#25D366] group-hover:scale-110 transition-transform" />
          <span>
            {currentLocale === "ar"
              ? "لديك استفسار؟ تحدث مع موظف الاستقبال عبر واتساب"
              : "Questions? Chat with Front Desk on WhatsApp"}
          </span>
        </a>
      </form>

      {/* Mobile Fixed Bottom Summary & Action */}
      <div
        ref={mobileBarRef}
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(22,16,11,0.96)] backdrop-blur-md border-t border-[rgba(212,163,89,0.25)] px-4 py-3 flex items-center justify-between shadow-2xl transition-all duration-300",
          isPanelInView ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
      >
        <div className="min-w-0 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#B8A692] uppercase tracking-wider truncate font-sans font-medium">
              {checkIn && checkOut
                ? (currentLocale === "ar" ? `إجمالي ${totalNights} ليالٍ` : `${totalNights}N Total`)
                : (currentLocale === "ar" ? "ابتداءً من" : "Starting from")}
            </span>
            {activePurposeLabel && (
              <span className="text-[11px] font-sans font-medium text-[#E5C178] bg-[#E5C178]/10 px-1.5 py-0.5 rounded border border-[#E5C178]/25 truncate max-w-[130px]">
                {activePurposeLabel.split("—")[0].trim()}
              </span>
            )}
          </div>
          <div className="font-heading text-lg font-semibold text-[#FAF4EB] tabular-nums">
            ₹{fareResult.grossTotal.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-[#E5C178] font-sans font-medium tabular-nums">
            {currentLocale === "ar"
              ? `العربون: ₹${fareResult.advancePayable.toLocaleString("en-IN")} (٢٠٪)`
              : `Advance: ₹${fareResult.advancePayable.toLocaleString("en-IN")} (20%)`}
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsMobileSheetOpen(true)}
          className="bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:opacity-95 text-[#140E08] font-bold text-xs h-10 px-4 rounded-xl shadow-md cursor-pointer shrink-0"
        >
          <span>
            {checkIn && checkOut
              ? (currentLocale === "ar" ? "مراجعة وتأكيد الحجز (٢٠٪)" : "Review & Book (20%)")
              : (currentLocale === "ar" ? "تحديد التواريخ والحجز" : "Select Dates & Book")}
          </span>
        </Button>
      </div>

      {/* ======================================================== */}
      {/* MOBILE EXPANDABLE BOOKING BOTTOM SHEET                    */}
      {/* ======================================================== */}
      {isMobileSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-booking-sheet-title"
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#0E0A07]/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMobileSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl bg-[#16100B] border-t border-[rgba(212,163,89,0.3)] p-5 shadow-2xl text-[#FAF4EB] animate-in slide-in-from-bottom duration-200 space-y-4"
          >
            {/* Sheet Handle & Close */}
            <div className="w-10 h-1 rounded-full bg-[rgba(212,163,89,0.3)] mx-auto" />
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(212,163,89,0.2)]">
              <div>
                <span className="text-[11px] font-sans font-medium tracking-[0.18em] uppercase text-[#E5C178]">
                  {currentLocale === "ar" ? "لوحة الحجز السريع" : "Mobile Booking Panel"}
                </span>
                <h3 id="mobile-booking-sheet-title" className="font-heading text-xl font-normal text-[#FAF4EB]">
                  {room.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="h-11 w-11 rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#221810] text-[#B8A692] hover:text-[#FAF4EB] flex items-center justify-center cursor-pointer text-sm font-bold transition-colors"
                aria-label="Close booking panel"
              >
                ✕
              </button>
            </div>

            {/* Dates in Sheet */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCheckInOpen(true)}
                className="flex flex-col items-start p-2.5 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] text-left"
              >
                <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-[#FAF4EB]/80">
                  {currentLocale === "ar" ? "تسجيل الوصول" : "Check-In"}
                </span>
                <span className="text-xs font-medium text-[#FAF4EB] mt-0.5 truncate">
                  {checkIn ? format(checkIn, "d MMM yyyy") : (currentLocale === "ar" ? "اختر التاريخ" : "Select date")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCheckOutOpen(true)}
                className="flex flex-col items-start p-2.5 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] text-left"
              >
                <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-[#FAF4EB]/80">
                  {currentLocale === "ar" ? "تسجيل المغادرة" : "Check-Out"}
                </span>
                <span className="text-xs font-medium text-[#FAF4EB] mt-0.5 truncate">
                  {checkOut ? format(checkOut, "d MMM yyyy") : (currentLocale === "ar" ? "اختر التاريخ" : "Select date")}
                </span>
              </button>
            </div>

            {/* Guests in Sheet */}
            <div className="p-3 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#FAF4EB] block">
                    {currentLocale === "ar" ? "البالغين (١٣+ سنة)" : "Adults (13+ yrs)"}
                  </span>
                  <span className="text-[10px] text-[#B8A692]">
                    {currentLocale === "ar" ? `الحد الأقصى ${room.maxAdults} بالغين` : `Max ${room.maxAdults} adults`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    disabled={adults <= 1}
                    className="h-8 w-8 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#16100B] flex items-center justify-center text-[#FAF4EB] disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center font-sans font-semibold text-sm text-[#FAF4EB]">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.min(room.maxAdults, prev + 1))}
                    disabled={adults >= room.maxAdults}
                    className="h-8 w-8 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#16100B] flex items-center justify-center text-[#FAF4EB] disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(212,163,89,0.2)]">
                <div>
                  <span className="font-medium text-[#FAF4EB] block">
                    {currentLocale === "ar" ? "الأطفال (٠–١٢ سنة)" : "Children (0–12 yrs)"}
                  </span>
                  <span className="text-[10px] text-[#B8A692]">
                    {currentLocale === "ar" ? "الأطفال الإضافيون ₹٣٠٠ لليلة" : "Extra children ₹300/night"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                    disabled={childrenCount <= 0}
                    className="h-8 w-8 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#16100B] flex items-center justify-center text-[#FAF4EB] disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center font-sans font-semibold text-sm text-[#FAF4EB]">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount((prev) => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[#16100B] flex items-center justify-center text-[#FAF4EB] cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stay Purpose in Sheet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-sans font-medium tracking-[0.18em] uppercase text-[#B8A692]">
                  {currentLocale === "ar" ? "الغرض من الإقامة" : "Stay Purpose (Step 2)"}
                </span>
                {selectedPurposeId && (
                  <button
                    type="button"
                    onClick={() => onSelectPurpose && onSelectPurpose("accommodation_only")}
                    className="text-[10px] text-[#B8A692] hover:text-[#FAF4EB] underline cursor-pointer"
                  >
                    {currentLocale === "ar" ? "إقامة فقط" : "Accommodation only"}
                  </button>
                )}
              </div>
              <select
                value={selectedPurposeId || "accommodation_only"}
                onChange={(e) => {
                  const val = e.target.value as StayPurposeType;
                  onSelectPurpose?.(val);
                }}
                className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B] px-3 py-2 text-xs font-medium text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
              >
                <option value="accommodation_only">{currentLocale === "ar" ? "إقامة قياسية (سكن فقط)" : "Standard Stay (Accommodation Only)"}</option>
                <option value="medical">{currentLocale === "ar" ? "رعاية صحية ومرافقة مرضى (ميدستاي)" : "Hospital & Medical (Medistay)"}</option>
                <option value="wedding">{currentLocale === "ar" ? "حفلات زفاف ومناسبات عائلية" : "Wedding & Event Stay"}</option>
                <option value="family">{currentLocale === "ar" ? "إجازات عائلية وإقامة طويلة" : "Family Long-Stay"}</option>
                <option value="corporate">{currentLocale === "ar" ? "رحلات عمل وتنفيذيون" : "Corporate & Executive"}</option>
                <option value="tourism">{currentLocale === "ar" ? "سياحة واستكشاف المعالم" : "Heritage & Tourism"}</option>
              </select>

              {addonSummaryButton}
            </div>

            {/* Sheet Fare Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#B8A692]">
                <span>
                  {currentLocale === "ar"
                    ? `الإيجار الأساسي (${totalNights} ليالٍ)`
                    : `Base Rent (${totalNights}N)`}
                </span>
                <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">₹{fareResult.baseRent.toLocaleString("en-IN")}</span>
              </div>
              {fareResult.extraGuestsTotal > 0 && (
                <div className="flex justify-between text-[#B8A692]">
                  <span>{currentLocale === "ar" ? "رسوم النزلاء الإضافيين" : "Extra Guest Charges"}</span>
                  <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">₹{fareResult.extraGuestsTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {fareResult.addonsTotal > 0 && (
                <div className="flex justify-between text-[#B8A692]">
                  <span>{currentLocale === "ar" ? "الخدمات الإضافية" : "Add-ons"}</span>
                  <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">₹{fareResult.addonsTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[rgba(212,163,89,0.2)] flex justify-between font-semibold text-sm">
                <span>{currentLocale === "ar" ? "المجموع الإجمالي" : "Gross Total"}</span>
                <span className="font-heading text-base font-normal text-[#E5C178] tabular-nums">₹{fareResult.grossTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#E5C178] pt-1">
                <span>{currentLocale === "ar" ? "٢٠٪ عربون الحجز المستحق أونلاين:" : "20% Online Advance Due:"}</span>
                <span className="font-serif font-bold tabular-nums">₹{fareResult.advancePayable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Error in Sheet */}
            {dateError && (
              <p className="text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                {dateError}
              </p>
            )}

            {/* Action CTA in Sheet */}
            <Button
              type="button"
              onClick={handleProceedToBook}
              disabled={isOverCapacity}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm cursor-pointer shadow-lg active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span>
                {currentLocale === "ar"
                  ? `متابعة الحجز الآمن (₹${fareResult.advancePayable.toLocaleString("en-IN")})`
                  : `Proceed to Secure Booking (₹${fareResult.advancePayable.toLocaleString("en-IN")})`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
