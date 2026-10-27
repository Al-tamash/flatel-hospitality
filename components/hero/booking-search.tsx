"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import {
  MapPin,
  Calendar as CalendarIcon,
  Home,
  Search,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BranchSelector, type BranchFilter } from "./branch-selector";
import { DateRangePicker } from "./date-range-picker";
import {
  FlatOccupancyModal,
  type FlatOccupancyState,
  type MergedSelectionResult,
} from "./flat-occupancy-modal";

export interface BookingSearchProps {
  initialBranch?: BranchFilter | null;
  className?: string;
}

export function BookingSearch({ initialBranch = null, className }: BookingSearchProps = {}) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const basePath = isAr ? "/ar" : "";

  // 1. Branch Selector State
  const [selectedBranch, setSelectedBranch] = React.useState<BranchFilter | null>(initialBranch);

  // 2. Dates State
  const [checkIn, setCheckIn] = React.useState<Date | null>(null);
  const [checkOut, setCheckOut] = React.useState<Date | null>(null);

  // 3. Guests State
  const [hasSelectedGuests, setHasSelectedGuests] = React.useState(false);
  const [adults, setAdults] = React.useState(2);
  const [childrenCount, setChildrenCount] = React.useState(0);

  // 4. Merged Flat & Occupancy State
  const [selectedFlatTypes, setSelectedFlatTypes] = React.useState<string>("1bhk");
  const [flatOccupancySummary, setFlatOccupancySummary] = React.useState<string>("1 BHK · 2 Guests");
  const [flatOccupancyState, setFlatsOccupancyState] = React.useState<Record<string, FlatOccupancyState> | null>(null);
  const [isFlatOccupancyModalOpen, setIsFlatOccupancyModalOpen] = React.useState(false);

  // 5. Popover Control for Branch & Calendar: 'branch' | 'calendar' | null
  const [activePopover, setActivePopover] = React.useState<"branch" | "calendar" | null>(null);
    const [calendarTargetField, setCalendarTargetField] = React.useState<
      "checkIn" | "checkOut"
    >("checkIn");

    // Read URL query parameters if present
    React.useEffect(() => {
      let isMounted = true;
      queueMicrotask(() => {
        if (!isMounted) return;
        const search = window.location.search;
        if (search) {
          const params = new URLSearchParams(search);
          const b = params.get("branch");
          if (b === "all" || b === "barkas-salala" || b === "moghal-pura") {
            setSelectedBranch(b);
          } else if (initialBranch) {
            setSelectedBranch(initialBranch);
          }
          const ft = params.get("flatType");
          if (ft) {
            setSelectedFlatTypes(ft);
            if (ft !== "all" && ft !== "any") {
              const formatted = ft.toUpperCase();
              setFlatOccupancySummary(`${formatted}`);
            }
          }
          const inParam = params.get("checkIn");
          if (inParam) {
            const parsedIn = parseISO(inParam);
            if (!isNaN(parsedIn.getTime())) setCheckIn(parsedIn);
          }
          const outParam = params.get("checkOut");
          if (outParam) {
            const parsedOut = parseISO(outParam);
            if (!isNaN(parsedOut.getTime())) setCheckOut(parsedOut);
          }
          const aParam = params.get("adults");
          if (aParam) {
            const a = parseInt(aParam, 10);
            if (!isNaN(a) && a >= 1) {
              setAdults(a);
              setHasSelectedGuests(true);
            }
          }
          const kParam = params.get("kids") || params.get("children");
          if (kParam) {
            const k = parseInt(kParam, 10);
            if (!isNaN(k) && k >= 0) {
              setChildrenCount(k);
              setHasSelectedGuests(true);
            }
          }
        } else if (initialBranch) {
          setSelectedBranch(initialBranch);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [initialBranch]);

    // Validation & Inline Message State
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [errorField, setErrorField] = React.useState<
      "branch" | "checkIn" | "checkOut" | "guests" | "flatType" | null
    >(null);

    // Container reference for desktop click-outside dismissal
    const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActivePopover(null);
      }
    };

    if (activePopover) {
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [activePopover]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePopover(null);
        setErrorMessage(null);
      }
    };
    if (activePopover) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePopover]);

  // Derived display helpers
  const nightsCount =
    checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;

  const branchDisplay = React.useMemo(() => {
    if (selectedBranch === "barkas-salala") return "Barkas Salala";
    if (selectedBranch === "moghal-pura") return "Moghal Pura";
    return "All Branches";
  }, [selectedBranch]);

  const dateRangeDisplay = React.useMemo(() => {
    if (checkIn && checkOut) {
      return `${format(checkIn, "d MMM")} – ${format(checkOut, "d MMM")}`;
    }
    if (checkIn) {
      return `${format(checkIn, "d MMM")} – Check-out`;
    }
    return "Select dates";
  }, [checkIn, checkOut]);


  // Handlers for Opening Popovers
  const handleOpenBranch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    setErrorField(null);
    setActivePopover((prev) => (prev === "branch" ? null : "branch"));
  };

  const handleOpenCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    setErrorField(null);
    setCalendarTargetField(checkIn && !checkOut ? "checkOut" : "checkIn");
    setActivePopover((prev) => (prev === "calendar" ? null : "calendar"));
  };

  const handleOpenFlatOccupancy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    setErrorField(null);
    setActivePopover(null);
    setIsFlatOccupancyModalOpen(true);
  };

  const handleApplyFlatOccupancy = (result: MergedSelectionResult) => {
    setFlatsOccupancyState(result.flats);
    setSelectedFlatTypes(result.flatTypesQuery);
    setFlatOccupancySummary(result.summaryLabel);
    setAdults(result.totalAdults);
    setChildrenCount(result.totalKids);
    setHasSelectedGuests(true);
    setErrorMessage(null);
    setErrorField(null);
  };

  const handleDateSelectRange = (inDate: Date | null, outDate: Date | null) => {
    setCheckIn(inDate);
    setCheckOut(outDate);
    setErrorMessage(null);
    setErrorField(null);
  };

  // Form Submission — Frictionless Direct Sync with Available Flats Section
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (checkIn && !checkOut) {
      setErrorMessage("Please select your check-out date.");
      setErrorField("checkOut");
      setCalendarTargetField("checkOut");
      setActivePopover("calendar");
      return;
    }

    if (checkIn && checkOut && differenceInCalendarDays(checkOut, checkIn) < 1) {
      setErrorMessage("Check-out date must be after check-in.");
      setErrorField("checkOut");
      setCalendarTargetField("checkOut");
      setActivePopover("calendar");
      return;
    }

    setErrorMessage(null);
    setErrorField(null);
    setActivePopover(null);

    // Build URL query params and notify FeaturedFlats
    const params = new URLSearchParams();
    if (selectedBranch && selectedBranch !== "all") params.set("branch", selectedBranch);
    if (selectedFlatTypes && selectedFlatTypes !== "all") params.set("flatType", selectedFlatTypes);
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    if (hasSelectedGuests || adults !== 2 || childrenCount !== 0) {
      params.set("adults", adults.toString());
      if (childrenCount > 0) params.set("kids", childrenCount.toString());
    }

    const queryStr = params.toString();
    const newUrl = queryStr ? `${basePath}/?${queryStr}#flats` : `${basePath}/#flats`;

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", newUrl);
      window.dispatchEvent(
        new CustomEvent("flatel:search", {
          detail: {
            branch: selectedBranch || "all",
            flatType: selectedFlatTypes || "all",
            checkIn,
            checkOut,
            adults,
            childrenCount,
          },
        })
      );
      const target = document.getElementById("flats") || document.getElementById("properties");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      <div ref={containerRef} className={cn("relative w-full max-w-6xl mx-auto z-40", className)}>
        {/* Inline Validation Banner */}
        {errorMessage && (
          <div
            role="alert"
            id="booking-search-error"
            className="mb-3 px-4 py-2.5 rounded-xl bg-[rgba(34,24,16,0.9)] border border-[#E5C178] text-[#FAF4EB] text-xs font-sans flex items-center justify-between shadow-lg animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E5C178] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#B8A692] hover:text-[#FAF4EB] p-1 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Airbnb-inspired Booking Bar */}
        <form
          id="booking-search-bar"
          onSubmit={handleSearchSubmit}
          className={cn(
            "w-full rounded-2xl bg-[rgba(34,24,16,0.85)] backdrop-blur-xl border border-[rgba(212,163,89,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.7)]",
            "p-2 sm:p-2.5 transition-all duration-200"
          )}
          aria-label="FLATEL Furnished Flat Booking and Search Bar"
        >
          {/* Desktop Flex Layout (lg:flex) / Mobile & Tablet 2-Column Responsive Grid (grid-cols-2 lg:flex) */}
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-0">
            {/* 1. BRANCH SELECTOR (Full width on mobile, flex-1 on desktop) */}
            <div className="col-span-2 lg:col-span-1 lg:flex-1 relative min-w-0">
              <button
                type="button"
                id="hero-branch-selector-button"
                onClick={handleOpenBranch}
                className={cn(
                  "w-full h-full min-h-[50px] lg:min-h-[64px] px-3.5 sm:px-4 py-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group",
                  "bg-[rgba(22,16,11,0.6)] border border-[rgba(212,163,89,0.2)] lg:bg-transparent lg:border-transparent hover:border-[#E5C178]/50 lg:hover:bg-[rgba(34,24,16,0.6)]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]",
                  activePopover === "branch" && "bg-[rgba(22,16,11,0.9)] ring-1 ring-[#E5C178] border-[#E5C178]"
                )}
                aria-label={`Branch: ${branchDisplay}`}
                aria-expanded={activePopover === "branch"}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-[#E5C178]/10 border border-[#E5C178]/25 flex items-center justify-center shrink-0 lg:bg-transparent lg:border-0 lg:w-auto lg:h-auto">
                    <MapPin className="w-4 h-4 text-[#E5C178] shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 text-start">
                    <span className="text-xs lg:text-[13px] font-sans font-semibold text-[#D4C4B3] uppercase lg:normal-case leading-none">
                      {isAr ? "الفرع / الموقع" : "Branch / Location"}
                    </span>
                    <span className="font-sans text-sm sm:text-base font-semibold text-[#FAF4EB] tracking-normal leading-tight mt-1 truncate">
                      {branchDisplay}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#D4C4B3] shrink-0 ml-2 group-hover:text-[#E5C178] transition-colors" />
              </button>

              {/* Desktop Divider */}
              <div
                className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[rgba(212,163,89,0.18)] pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* 2. CHECK-IN - CHECK-OUT DATE SELECTOR (Full width on mobile with dual-date display, flex-1 on desktop) */}
            <div className="col-span-2 lg:col-span-1 lg:flex-1 relative min-w-0">
              <button
                type="button"
                id="hero-checkin-checkout-date-button"
                onClick={handleOpenCalendar}
                className={cn(
                  "w-full h-full min-h-[50px] lg:min-h-[64px] px-3.5 sm:px-4 py-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group",
                  "bg-[rgba(22,16,11,0.6)] border border-[rgba(212,163,89,0.2)] lg:bg-transparent lg:border-transparent hover:border-[#E5C178]/50 lg:hover:bg-[rgba(34,24,16,0.6)]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]",
                  activePopover === "calendar" && "bg-[rgba(22,16,11,0.9)] ring-1 ring-[#E5C178] border-[#E5C178]"
                )}
                aria-label={`Dates: ${dateRangeDisplay}`}
                aria-expanded={activePopover === "calendar"}
                data-invalid={errorField === "checkOut" || undefined}
                aria-describedby={errorField === "checkOut" ? "booking-search-error" : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-[#E5C178]/10 border border-[#E5C178]/25 flex items-center justify-center shrink-0 lg:bg-transparent lg:border-0 lg:w-auto lg:h-auto">
                    <CalendarIcon className="w-4 h-4 text-[#E5C178] shrink-0" />
                  </div>

                  {/* Desktop Unified Date Range */}
                  <div className="hidden lg:flex flex-col min-w-0 flex-1 text-start">
                    <span className="text-xs lg:text-[13px] font-sans font-semibold text-[#D4C4B3] leading-none">
                      {isAr ? "تسجيل الوصول - تسجيل المغادرة" : "Check-in - Check-out"}
                    </span>
                    <span className="font-sans text-sm sm:text-base font-semibold text-[#FAF4EB] tracking-normal leading-tight mt-1 truncate">
                      {dateRangeDisplay}
                    </span>
                  </div>

                  {/* Mobile Dual Date Columns with Night Duration Indicator */}
                  <div className="lg:hidden flex items-center justify-between min-w-0 flex-1 gap-2.5">
                    <div className="flex flex-col min-w-0 flex-1 text-start">
                      <span className="text-xs font-sans font-semibold text-[#D4C4B3] uppercase leading-none">
                        {isAr ? "تسجيل الوصول" : "Check-In"}
                      </span>
                      <span className="font-sans text-sm font-semibold text-[#FAF4EB] tracking-normal leading-tight mt-1 truncate">
                        {checkIn ? format(checkIn, "d MMM, EEE") : (isAr ? "حدد التاريخ" : "Select date")}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-[rgba(212,163,89,0.18)] shrink-0" aria-hidden="true" />

                    <div className="flex flex-col min-w-0 flex-1 text-start">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-sans font-semibold text-[#D4C4B3] uppercase leading-none">
                          {isAr ? "المغادرة" : "Check-Out"}
                        </span>
                        {nightsCount > 0 && (
                          <span className="text-xs font-mono text-[#E5C178] font-bold">
                            {nightsCount}{isAr ? " ليالٍ" : "N"}
                          </span>
                        )}
                      </div>
                      <span className="font-sans text-sm font-semibold text-[#FAF4EB] tracking-normal leading-tight mt-1 truncate">
                        {checkOut ? format(checkOut, "d MMM, EEE") : (isAr ? "حدد التاريخ" : "Select date")}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#D4C4B3] shrink-0 ml-2 group-hover:text-[#E5C178] transition-colors" />
              </button>

              {/* Desktop Divider */}
              <div
                className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[rgba(212,163,89,0.18)] pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* 3. MERGED FLAT & OCCUPANCY SELECTOR (Full width on mobile, flex-1 on desktop) */}
            <div className="col-span-2 lg:col-span-1 lg:flex-1 relative min-w-0">
              <button
                type="button"
                id="hero-flat-occupancy-button"
                onClick={handleOpenFlatOccupancy}
                className={cn(
                  "w-full h-full min-h-[50px] lg:min-h-[64px] px-3.5 sm:px-4 py-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group",
                  "bg-[rgba(22,16,11,0.6)] border border-[rgba(212,163,89,0.2)] lg:bg-transparent lg:border-transparent hover:border-[#E5C178]/50 lg:hover:bg-[rgba(34,24,16,0.6)]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]",
                  isFlatOccupancyModalOpen && "bg-[rgba(22,16,11,0.9)] ring-1 ring-[#E5C178] border-[#E5C178]"
                )}
                aria-label={`Flat & Occupancy: ${flatOccupancySummary}`}
                aria-haspopup="dialog"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-[#E5C178]/10 border border-[#E5C178]/25 flex items-center justify-center shrink-0 lg:bg-transparent lg:border-0 lg:w-auto lg:h-auto">
                    <Home className="w-4 h-4 text-[#E5C178] shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 text-start">
                    <span className="text-xs lg:text-[13px] font-sans font-semibold text-[#D4C4B3] uppercase lg:normal-case leading-none">
                      {isAr ? "الشقة وعدد الضيوف" : "Flat & Occupancy"}
                    </span>
                    <span className="font-sans text-sm sm:text-base font-semibold text-[#FAF4EB] tracking-normal leading-tight mt-1 truncate">
                      {flatOccupancySummary}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#D4C4B3] shrink-0 ml-2 group-hover:text-[#E5C178] transition-colors" />
              </button>

              {/* Desktop Divider */}
              <div
                className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[rgba(212,163,89,0.18)] pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* 5. SEARCH FLATS PROMINENT CTA (Full width on mobile, auto shrink on desktop) */}
            <div className="col-span-2 lg:col-auto lg:shrink-0 flex items-center p-0.5 lg:p-1 lg:pl-2">
              <button
                type="submit"
                id="hero-search-flats-submit-button"
                className={cn(
                  "w-full min-h-[48px] lg:min-h-[56px] px-6 sm:px-7 py-3 rounded-xl cursor-pointer",
                  "bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 active:scale-[0.98]",
                  "text-[#140E08] font-sans font-bold text-sm sm:text-base tracking-normal",
                  "flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-[#E5C178]/20",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C178]"
                )}
              >
                <Search className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap">
                  {isAr ? "البحث عن الشقق المتاحة" : "Search Available Flats"}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* ======================================================== */}
        {/* DESKTOP POPOVERS (Positioned below/above bar)           */}
        {/* ======================================================== */}
        {activePopover === "branch" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden lg:block absolute bottom-full mb-3 z-50 left-0 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"
          >
            <BranchSelector
              selectedBranch={selectedBranch}
              onSelectBranch={(b) => {
                setSelectedBranch(b);
                setActivePopover(null);
              }}
              onClose={() => setActivePopover(null)}
            />
          </div>
        )}

        {activePopover === "calendar" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden lg:block absolute bottom-full mb-3 z-50 left-[20%] animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"
          >
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectRange={handleDateSelectRange}
              activeField={calendarTargetField}
              onFieldChange={setCalendarTargetField}
              onClose={() => setActivePopover(null)}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* MOBILE MODAL OVERLAY FOR BRANCH & CALENDAR              */}
        {/* ======================================================== */}
        {activePopover && (
          <div
            role="dialog"
            aria-modal="true"
            className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E0A07]/88 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setActivePopover(null)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[360px]">
              {activePopover === "branch" && (
                <BranchSelector
                  selectedBranch={selectedBranch}
                  onSelectBranch={(b) => {
                    setSelectedBranch(b);
                    setActivePopover(null);
                  }}
                  onClose={() => setActivePopover(null)}
                  isMobileModal
                />
              )}
              {activePopover === "calendar" && (
                <DateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelectRange={handleDateSelectRange}
                  activeField={calendarTargetField}
                  onFieldChange={setCalendarTargetField}
                  onClose={() => setActivePopover(null)}
                  isMobileModal
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* UNIFIED FLAT & OCCUPANCY MODAL (Client WhatsApp Aesthetic) */}
      {/* ======================================================== */}
      <FlatOccupancyModal
        isOpen={isFlatOccupancyModalOpen}
        onClose={() => setIsFlatOccupancyModalOpen(false)}
        onApply={handleApplyFlatOccupancy}
        initialSelection={flatOccupancyState}
      />
    </>
  );
}
