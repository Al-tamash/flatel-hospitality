"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RoomDetail, PURPOSE_PACKAGES, FacilityAddon, ALL_MASTER_ADDONS } from "@/lib/mock-rooms";
import { WHATSAPP_CONFIG } from "@/lib/constants";
import { calculateFlatelPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { StayPurposeType } from "@/types/booking";

interface BookingSidebarProps {
  room: RoomDetail;
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
}

export function BookingSidebar({
  room,
  selectedPurposeId,
  selectedAddonIds,
  onSelectPurpose,
  onToggleAddon,
  onOpenServiceDrawer,
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

  // Selected add-ons resolution across all packages
  const activePackage =
    selectedPurposeId && selectedPurposeId !== "accommodation_only"
      ? PURPOSE_PACKAGES.find((p) => p.id === selectedPurposeId) || null
      : null;

  const activePurposeLabel = React.useMemo(() => {
    switch (selectedPurposeId) {
      case "medical":
        return "Medistay — Hospital & Medical";
      case "wedding":
        return "Wedding Stay — Guests & Events";
      case "family":
        return "Family Vacation — Vacation & Long Stay";
      case "tourism":
        return "Wanderer — Heritage & Tourism";
      case "corporate":
        return "Corporate — Business & Executive";
      case "accommodation_only":
        return "Accommodation only";
      default:
        return null;
    }
  }, [selectedPurposeId]);

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

  // Central WhatsApp Concierge link (configuration-driven)
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(
    `Hello Flatel, I am interested in reserving the ${room.title} for ${totalNights} nights.`
  );

  const handleProceedToBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverCapacity) return;

    if (!checkIn || !checkOut) {
      setDateError("Please select check-in and check-out dates to proceed to secure booking.");
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

    const targetUrl = `/checkout?${query.toString()}`;
    router.push(targetUrl);
  };

  const panelRef = React.useRef<HTMLElement>(null);
  const [isPanelInView, setIsPanelInView] = React.useState(false);

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
      className="w-full rounded-3xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.75)] p-5 sm:p-6 shadow-2xl backdrop-blur-md"
      aria-label="Reservation Summary and Booking Form"
    >
      {/* Top Pricing Header */}
      <div className="flex items-baseline justify-between border-b border-[rgba(212,163,89,0.2)] pb-4">
        <div>
          <span className="text-xs font-sans font-medium tracking-[0.16em] uppercase text-[#E5C178]">
            Starting from
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-heading text-2xl sm:text-3xl font-normal tabular-nums text-[#FAF4EB]">
              ₹{room.basePricePerNight.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[#B8A692]">/ night</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-sans font-medium tracking-[0.16em] uppercase text-[#E5C178]">
            20% Advance Policy
          </span>
          <p className="text-xs text-[#B8A692] mt-0.5">Pay 80% on arrival</p>
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
                <CalendarIcon className="h-3 w-3 text-[#E5C178]" /> Check-In
              </div>
              <span className="text-xs font-medium text-[#FAF4EB] mt-1 truncate w-full">
                {checkIn ? format(checkIn, "d MMM yyyy") : "Select date"}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 bg-[#16100B] border border-[rgba(212,163,89,0.3)] shadow-2xl rounded-2xl z-50 text-[#FAF4EB]"
              align="start"
            >
              <div className="pb-2 mb-2 border-b border-[rgba(212,163,89,0.2)] text-xs font-medium text-[#FAF4EB]">
                Select Check-in Date
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
                <CalendarIcon className="h-3 w-3 text-[#E5C178]" /> Check-Out
              </div>
              <span className="text-xs font-medium text-[#FAF4EB] mt-1 truncate w-full">
                {checkOut ? format(checkOut, "d MMM yyyy") : "Select date"}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 bg-[#16100B] border border-[rgba(212,163,89,0.3)] shadow-2xl rounded-2xl z-50 text-[#FAF4EB]"
              align="end"
            >
              <div className="pb-2 mb-2 border-b border-[rgba(212,163,89,0.2)] text-xs font-medium text-[#FAF4EB]">
                Select Check-out Date
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
                <Users className="h-3 w-3 text-[#E5C178]" /> Guests
              </div>
              <span className="text-xs font-medium text-[#FAF4EB] mt-0.5 block">
                {adults} Adult{adults > 1 ? "s" : ""}
                {childrenCount > 0 ? `, ${childrenCount} Child` : ""}
              </span>
            </div>
            <span className="text-xs text-[#E5C178] font-sans font-medium">
              {room.maxChildren !== null
                ? `Up to ${room.maxAdults} adults · ${room.maxChildren} kids stay free`
                : `Up to ${room.maxAdults} adults · Kids stay free`}
            </span>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-4 bg-[#16100B] border border-[rgba(212,163,89,0.3)] shadow-2xl rounded-2xl z-50 space-y-4 text-[#FAF4EB]"
            align="start"
          >
            <div className="border-b border-[rgba(212,163,89,0.2)] pb-2">
              <p className="text-xs font-semibold text-[#FAF4EB]">Apartment Occupancy</p>
              <p className="text-[10px] text-[#B8A692] leading-relaxed mt-0.5">
                {room.title} accommodates up to {room.maxAdults} adults ({room.baseAdults} base + {room.maxExtraGuests} extra).
                {" "}
                {room.maxChildren !== null
                  ? `Child safety capacity: up to ${room.maxChildren} children. Children aged 0–12 stay free but count toward safety capacity.`
                  : "Children aged 0–12 stay free but count toward safety capacity (exact child limit subject to unit size)."}
              </p>
            </div>

            {/* Adults Stepper */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#FAF4EB]">Adults</p>
                <p className="text-[10px] text-[#B8A692]">Max {room.maxAdults}</p>
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
                <p className="text-xs font-medium text-[#FAF4EB]">Children (0–12 yrs)</p>
                <p className="text-[10px] text-[#B8A692]">
                  {room.maxChildren !== null
                    ? `Max ${room.maxChildren} · Stay free (safety capacity)`
                    : "Stay free · Counts toward safety capacity"}
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
              Done
            </Button>
          </PopoverContent>
        </Popover>

        {/* Capacity Warning */}
        {isOverCapacity && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/15 border border-destructive/30 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              {isAdultsOverCapacity
                ? `Exceeds maximum adult limit (${maxAllowedAdults} adults) for this residence.`
                : `Exceeds child safety capacity (${maxAllowedChildren} children) for this residence.`}
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
              <span>Stay Purpose (Optional)</span>
            </span>
            {selectedPurposeId && selectedPurposeId !== "accommodation_only" && (
              <button
                type="button"
                onClick={() => onSelectPurpose?.("accommodation_only")}
                className="text-[11px] text-[#B8A692] hover:text-[#FAF4EB] underline cursor-pointer"
              >
                Reset
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
              <option value="accommodation_only">Standard Stay (Accommodation Only)</option>
              <option value="medical">Hospital & Medical (Medistay)</option>
              <option value="wedding">Wedding & Event Stay</option>
              <option value="family">Family Long-Stay</option>
              <option value="corporate">Corporate & Executive</option>
              <option value="tourism">Heritage & Tourism</option>
            </select>
          </div>

          {/* Active Purpose Details & Add-ons */}
          {selectedPurposeId && selectedPurposeId !== "accommodation_only" && (
            <div className="space-y-2 p-3 rounded-xl bg-[#16100B]/90 border border-[rgba(212,163,89,0.3)] animate-in fade-in duration-200">
              {/* Free Inclusions Notice */}
              <div className="text-[11px] text-emerald-400 flex items-start gap-1.5 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {selectedPurposeId === "medical"
                    ? "Includes doctor appointment coordination, wheelchair assistance & vitals kit at ₹0"
                    : selectedPurposeId === "wedding"
                    ? "Includes group block coordination & garment steaming equipment at ₹0"
                    : selectedPurposeId === "corporate"
                    ? "Includes enterprise high-speed Wi-Fi, work desk & GST invoice at ₹0"
                    : selectedPurposeId === "tourism"
                    ? "Includes Old City monument guides & 24/7 front desk assistance at ₹0"
                    : "Includes family cookware, indoor games & baby support at ₹0"}
                </span>
              </div>

              {/* Available Paid Add-ons */}
              {activePackage && activePackage.paidAddons.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[rgba(212,163,89,0.18)]">
                  <div className="text-[10.5px] font-sans font-semibold uppercase tracking-wider text-[#E5C178]">
                    Add-on Services (Optional)
                  </div>
                  <div className="space-y-1">
                    {activePackage.paidAddons.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      const priceLabel = addon.type === "per_night" || addon.pricingType === "per_night"
                        ? `₹${addon.price}/night`
                        : `₹${addon.price}`;
                      return (
                        <label
                          key={addon.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all",
                            isChecked
                              ? "bg-[#E5C178]/15 border-[#E5C178] text-[#FAF4EB]"
                              : "bg-[#221810]/70 border-[rgba(212,163,89,0.2)] text-[#B8A692] hover:border-[#E5C178]/40"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleAddon?.(addon.id)}
                              className="w-3.5 h-3.5 accent-[#E5C178] rounded cursor-pointer shrink-0"
                            />
                            <span className="font-medium text-[11.5px] truncate">{addon.name}</span>
                          </div>
                          <span className="font-sans font-bold text-[#E5C178] text-xs tabular-nums shrink-0">
                            +{priceLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* DETAILED BOOKING SUMMARY & PRD FORMULA BREAKDOWN        */}
        {/* ======================================================== */}
        <div className="pt-4 border-t border-[rgba(212,163,89,0.2)] space-y-2.5 text-xs">
          <div className="flex justify-between text-[#B8A692]">
            <span>
              ₹{room.basePricePerNight.toLocaleString("en-IN")} × {totalNights} night{totalNights > 1 ? "s" : ""}
            </span>
            <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">
              ₹{fareResult.standardBaseRent.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Duration Discount (10% for 7-14N, 15% for 15-27N, 25% for 28+N) */}
          {fareResult.discountRate > 0 && (
            <div className="flex justify-between text-[#E5C178] font-medium bg-[#E5C178]/10 px-2.5 py-1 rounded-lg border border-[#E5C178]/25 font-sans">
              <span>Duration Discount ({fareResult.discountRate * 100}% off)</span>
              <span className="font-serif tabular-nums">-₹{fareResult.baseRentDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Extra Adult Fees (Adults exceeding base capacity: ₹500/night each) */}
          {fareResult.extraAdults > 0 && (
            <div className="flex justify-between text-[#B8A692]">
              <span>
                Extra Adults ({fareResult.extraAdults} × ₹500 × {totalNights}n)
              </span>
              <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">
                ₹{fareResult.extraGuestsTotal.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Itemized Paid Add-ons */}
          {activeAddons.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-[rgba(212,163,89,0.15)]">
              <div className="flex items-center justify-between text-[10px] font-sans font-medium uppercase tracking-wider text-[#B8A692]">
                <span>Selected Add-ons ({activeAddons.length})</span>
                {onOpenServiceDrawer && (
                  <button
                    type="button"
                    onClick={onOpenServiceDrawer}
                    className="text-[#E5C178] hover:text-[#FAF4EB] lowercase font-sans text-xs cursor-pointer transition-colors"
                  >
                    edit
                  </button>
                )}
              </div>
              {activeAddons.map((addon) => {
                const addonPrice = addon.price;
                const isNumericPrice = typeof addonPrice === "number";
                const subtotal = isNumericPrice
                  ? addon.pricingType === "per_night"
                    ? addonPrice * totalNights
                    : addonPrice
                  : null;

                return (
                  <div key={addon.id} className="flex justify-between items-center text-[#B8A692] text-[11px]">
                    <span className="truncate pr-2">
                      {addon.name}
                      {isNumericPrice && addon.pricingType === "per_night" ? ` (${totalNights}n)` : ""}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-serif text-xs font-medium text-[#FAF4EB] tabular-nums">
                        {subtotal !== null ? `₹${subtotal.toLocaleString("en-IN")}` : "Quote on Request"}
                      </span>
                      {onToggleAddon && (
                        <button
                          type="button"
                          onClick={() => onToggleAddon(addon.id)}
                          className="text-[#B8A692] hover:text-rose-400 p-0.5 text-xs font-bold leading-none cursor-pointer"
                          title="Remove add-on"
                          aria-label={`Remove ${addon.name}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-2 border-t border-[rgba(212,163,89,0.2)] text-sm font-semibold text-[#FAF4EB]">
            <span>Gross Total</span>
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
                <span className="font-medium text-[#FAF4EB]">20% Online Advance Deposit</span>
              </div>
              <span className="font-heading text-lg font-normal text-[#FAF4EB] tabular-nums">
                ₹{fareResult.advancePayable.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(212,163,89,0.2)] text-[#B8A692]">
              <div className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-[#B8A692]" />
                <span>80% Balance Due on Arrival (Cash / UPI)</span>
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
          <span>Reserve Now — Pay ₹{fareResult.advancePayable.toLocaleString("en-IN")} Advance</span>
        </Button>

        {/* Transparent Policy Reassurance */}
        <div className="pt-2 text-center text-xs text-[#B8A692] flex items-center justify-center gap-1.5 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
          <span>Pay 20% now · Remaining 80% at check-in · Free cancellation up to 48 hrs</span>
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
          <span>Questions? Chat with Front Desk on WhatsApp</span>
        </a>
      </form>

      {/* Mobile Fixed Bottom Summary & Action (Hidden smoothly when user is looking at the actual booking panel) */}
      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(22,16,11,0.96)] backdrop-blur-md border-t border-[rgba(212,163,89,0.25)] px-4 py-3 flex items-center justify-between shadow-2xl transition-all duration-300",
          isPanelInView ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
      >
        <div className="min-w-0 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#B8A692] uppercase tracking-wider truncate font-sans font-medium">
              {checkIn && checkOut ? `${totalNights}N Total` : "Starting from"}
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
            Advance: ₹{fareResult.advancePayable.toLocaleString("en-IN")} (20%)
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsMobileSheetOpen(true)}
          className="bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:opacity-95 text-[#140E08] font-bold text-xs h-10 px-4 rounded-xl shadow-md cursor-pointer shrink-0"
        >
          <span>{checkIn && checkOut ? "Review & Book (20%)" : "Select Dates & Book"}</span>
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
                  Mobile Booking Panel
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
                <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-[#FAF4EB]/80">Check-In</span>
                <span className="text-xs font-medium text-[#FAF4EB] mt-0.5 truncate">
                  {checkIn ? format(checkIn, "d MMM yyyy") : "Select date"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCheckOutOpen(true)}
                className="flex flex-col items-start p-2.5 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] text-left"
              >
                <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-[#FAF4EB]/80">Check-Out</span>
                <span className="text-xs font-medium text-[#FAF4EB] mt-0.5 truncate">
                  {checkOut ? format(checkOut, "d MMM yyyy") : "Select date"}
                </span>
              </button>
            </div>

            {/* Guests in Sheet */}
            <div className="p-3 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#FAF4EB] block">Adults (13+ yrs)</span>
                  <span className="text-[10px] text-[#B8A692]">Max {room.maxAdults} adults</span>
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
                  <span className="font-medium text-[#FAF4EB] block">Children (0–12 yrs)</span>
                  <span className="text-[10px] text-[#B8A692]">Free accommodation</span>
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
                  Stay Purpose (Step 2)
                </span>
                {selectedPurposeId && (
                  <button
                    type="button"
                    onClick={() => onSelectPurpose && onSelectPurpose("accommodation_only")}
                    className="text-[10px] text-[#B8A692] hover:text-[#FAF4EB] underline cursor-pointer"
                  >
                    Accommodation only
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
                <option value="accommodation_only">Standard Stay (Accommodation Only)</option>
                <option value="medical">Hospital & Medical (Medistay)</option>
                <option value="wedding">Wedding & Event Stay</option>
                <option value="family">Family Long-Stay</option>
                <option value="corporate">Corporate & Executive</option>
                <option value="tourism">Heritage & Tourism</option>
              </select>

              {activePackage && activePackage.paidAddons.length > 0 && selectedPurposeId !== "accommodation_only" && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#E5C178]">
                    Optional Paid Add-ons
                  </div>
                  <div className="space-y-1">
                    {activePackage.paidAddons.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      const priceLabel = addon.type === "per_night" || addon.pricingType === "per_night"
                        ? `₹${addon.price}/night`
                        : `₹${addon.price}`;
                      return (
                        <label
                          key={addon.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all",
                            isChecked
                              ? "bg-[#E5C178]/15 border-[#E5C178] text-[#FAF4EB]"
                              : "bg-[#16100B] border-[rgba(212,163,89,0.2)] text-[#B8A692]"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleAddon?.(addon.id)}
                              className="w-3.5 h-3.5 accent-[#E5C178] rounded cursor-pointer shrink-0"
                            />
                            <span className="font-medium text-[11px] truncate">{addon.name}</span>
                          </div>
                          <span className="font-sans font-bold text-[#E5C178] text-[11px] tabular-nums shrink-0">
                            +{priceLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sheet Fare Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#221810] border border-[rgba(212,163,89,0.25)] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#B8A692]">
                <span>Base Rent ({totalNights}N)</span>
                <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">₹{fareResult.baseRent.toLocaleString("en-IN")}</span>
              </div>
              {fareResult.extraGuestsTotal > 0 && (
                <div className="flex justify-between text-[#B8A692]">
                  <span>Extra Adults Fee</span>
                  <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">₹{fareResult.extraGuestsTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {fareResult.addonsTotal > 0 && (
                <div className="flex justify-between text-[#B8A692]">
                  <span>Add-ons</span>
                  <span className="font-serif text-sm font-medium text-[#FAF4EB] tabular-nums">₹{fareResult.addonsTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[rgba(212,163,89,0.2)] flex justify-between font-semibold text-sm">
                <span>Gross Total</span>
                <span className="font-heading text-base font-normal text-[#E5C178] tabular-nums">₹{fareResult.grossTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#E5C178] pt-1">
                <span>20% Online Advance Due:</span>
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
              <span>Proceed to Secure Booking (₹{fareResult.advancePayable.toLocaleString("en-IN")})</span>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
