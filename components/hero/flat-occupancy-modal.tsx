"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocaleFromPath } from "@/lib/i18n";

export interface FlatDefinition {
  id: string; // "1bhk", "2bhk", "3bhk", "4bhk"
  title: string;
  pricePerNight: number;
  availableUnits: number;
  baseAdults: number;
  baseKids: number;
  maxExtraAdults: number;
  maxExtraKids: number;
  extraAdultFee: number;
  extraKidFee: number;
}

export const FLAT_DEFINITIONS: FlatDefinition[] = [
  {
    id: "1bhk",
    title: "1 BHK",
    pricePerNight: 2000,
    availableUnits: 1,
    baseAdults: 2,
    baseKids: 1,
    maxExtraAdults: 2,
    maxExtraKids: 1,
    extraAdultFee: 500,
    extraKidFee: 300,
  },
  {
    id: "2bhk",
    title: "2 BHK",
    pricePerNight: 2500,
    availableUnits: 3,
    baseAdults: 4,
    baseKids: 2,
    maxExtraAdults: 2,
    maxExtraKids: 2,
    extraAdultFee: 500,
    extraKidFee: 300,
  },
  {
    id: "3bhk",
    title: "3 BHK",
    pricePerNight: 3000,
    availableUnits: 2,
    baseAdults: 6,
    baseKids: 3,
    maxExtraAdults: 3,
    maxExtraKids: 3,
    extraAdultFee: 500,
    extraKidFee: 300,
  },
  {
    id: "4bhk",
    title: "4 BHK",
    pricePerNight: 4000,
    availableUnits: 1,
    baseAdults: 8,
    baseKids: 4,
    maxExtraAdults: 4,
    maxExtraKids: 4,
    extraAdultFee: 500,
    extraKidFee: 300,
  },
];

export interface FlatOccupancyState {
  units: number;
  baseAdults: number;
  baseKids: number;
  extraAdults: number;
  extraKids: number;
  isAdditionalOpen: boolean;
}

export interface MergedSelectionResult {
  flats: Record<string, FlatOccupancyState>;
  totalUnits: number;
  totalAdults: number;
  totalKids: number;
  totalGuests: number;
  estimatedPricePerNight: number;
  summaryLabel: string;
  flatTypesQuery: string; // "1bhk" or "1bhk,2bhk" or "all"
  primaryFlatType: string | null;
}

interface FlatOccupancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: MergedSelectionResult) => void;
  initialSelection?: Record<string, FlatOccupancyState> | null;
}

export function FlatOccupancyModal({
  isOpen,
  onClose,
  onApply,
  initialSelection,
}: FlatOccupancyModalProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const isAr = currentLocale === "ar";

  // Default selection: 1 unit of 1 BHK with 2 Adults, 0 Children
  const createDefaultState = React.useCallback((): Record<string, FlatOccupancyState> => {
    const state: Record<string, FlatOccupancyState> = {};
    FLAT_DEFINITIONS.forEach((flat) => {
      if (flat.id === "1bhk") {
        state[flat.id] = {
          units: 1,
          baseAdults: flat.baseAdults,
          baseKids: 0,
          extraAdults: 0,
          extraKids: 0,
          isAdditionalOpen: false,
        };
      } else {
        state[flat.id] = {
          units: 0,
          baseAdults: flat.baseAdults,
          baseKids: 0,
          extraAdults: 0,
          extraKids: 0,
          isAdditionalOpen: false,
        };
      }
    });
    return state;
  }, []);

  const [flatsState, setFlatsState] = React.useState<Record<string, FlatOccupancyState>>(() => {
    if (initialSelection && Object.keys(initialSelection).length > 0) {
      return initialSelection;
    }
    return createDefaultState();
  });

  // Adjust state during render when initialSelection prop changes (standard React pattern)
  const [prevSelection, setPrevSelection] = React.useState(initialSelection);
  if (initialSelection !== prevSelection) {
    setPrevSelection(initialSelection);
    if (initialSelection && Object.keys(initialSelection).length > 0) {
      setFlatsState(initialSelection);
    }
  }

  // Handle ESC key to dismiss modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // State mutators for each flat
  const updateFlatUnits = (flatId: string, delta: number) => {
    setFlatsState((prev) => {
      const flat = FLAT_DEFINITIONS.find((f) => f.id === flatId);
      if (!flat) return prev;
      const current = prev[flatId] || {
        units: 0,
        baseAdults: flat.baseAdults,
        baseKids: 0,
        extraAdults: 0,
        extraKids: 0,
        isAdditionalOpen: false,
      };

      const newUnits = Math.max(0, Math.min(flat.availableUnits, current.units + delta));
      const isNewlyActivated = current.units === 0 && newUnits > 0;

      return {
        ...prev,
        [flatId]: {
          ...current,
          units: newUnits,
          // When newly activated, default to base adults
          baseAdults: isNewlyActivated ? flat.baseAdults : Math.min(current.baseAdults, flat.baseAdults * Math.max(1, newUnits)),
          baseKids: Math.min(current.baseKids, flat.baseKids * Math.max(1, newUnits)),
          extraAdults: newUnits === 0 ? 0 : current.extraAdults,
          extraKids: newUnits === 0 ? 0 : current.extraKids,
          isAdditionalOpen: isNewlyActivated ? false : current.isAdditionalOpen,
        },
      };
    });
  };

  const updateBaseAdults = (flatId: string, delta: number) => {
    setFlatsState((prev) => {
      const flat = FLAT_DEFINITIONS.find((f) => f.id === flatId);
      if (!flat) return prev;
      const current = prev[flatId];
      if (!current || current.units === 0) return prev;

      const maxLimit = flat.baseAdults * current.units;
      const newAdults = Math.max(1, Math.min(maxLimit, current.baseAdults + delta));

      return {
        ...prev,
        [flatId]: {
          ...current,
          baseAdults: newAdults,
        },
      };
    });
  };

  const updateBaseKids = (flatId: string, delta: number) => {
    setFlatsState((prev) => {
      const flat = FLAT_DEFINITIONS.find((f) => f.id === flatId);
      if (!flat) return prev;
      const current = prev[flatId];
      if (!current || current.units === 0) return prev;

      const maxLimit = flat.baseKids * current.units;
      const newKids = Math.max(0, Math.min(maxLimit, current.baseKids + delta));

      return {
        ...prev,
        [flatId]: {
          ...current,
          baseKids: newKids,
        },
      };
    });
  };

  const updateExtraAdults = (flatId: string, delta: number) => {
    setFlatsState((prev) => {
      const flat = FLAT_DEFINITIONS.find((f) => f.id === flatId);
      if (!flat) return prev;
      const current = prev[flatId];
      if (!current || current.units === 0) return prev;

      const maxLimit = flat.maxExtraAdults * current.units;
      const newExtras = Math.max(0, Math.min(maxLimit, current.extraAdults + delta));

      return {
        ...prev,
        [flatId]: {
          ...current,
          extraAdults: newExtras,
        },
      };
    });
  };

  const updateExtraKids = (flatId: string, delta: number) => {
    setFlatsState((prev) => {
      const flat = FLAT_DEFINITIONS.find((f) => f.id === flatId);
      if (!flat) return prev;
      const current = prev[flatId];
      if (!current || current.units === 0) return prev;

      const maxLimit = flat.maxExtraKids * current.units;
      const newExtras = Math.max(0, Math.min(maxLimit, current.extraKids + delta));

      return {
        ...prev,
        [flatId]: {
          ...current,
          extraKids: newExtras,
        },
      };
    });
  };

  const toggleAdditionalAccordion = (flatId: string) => {
    setFlatsState((prev) => {
      const current = prev[flatId];
      if (!current) return prev;
      return {
        ...prev,
        [flatId]: {
          ...current,
          isAdditionalOpen: !current.isAdditionalOpen,
        },
      };
    });
  };

  const handleReset = () => {
    setFlatsState(createDefaultState());
  };

  // Live Aggregate Computations
  const aggregate = React.useMemo(() => {
    let totalUnits = 0;
    let totalAdults = 0;
    let totalKids = 0;
    let estimatedPricePerNight = 0;
    const activeFlats: { id: string; title: string; units: number }[] = [];

    FLAT_DEFINITIONS.forEach((flat) => {
      const state = flatsState[flat.id];
      if (state && state.units > 0) {
        totalUnits += state.units;
        totalAdults += state.baseAdults + state.extraAdults;
        totalKids += state.baseKids + state.extraKids;

        const baseFlatPrice = flat.pricePerNight * state.units;
        const extraAdultFee = state.extraAdults * flat.extraAdultFee;
        const extraKidFee = state.extraKids * flat.extraKidFee;
        estimatedPricePerNight += baseFlatPrice + extraAdultFee + extraKidFee;

        activeFlats.push({
          id: flat.id,
          title: flat.title,
          units: state.units,
        });
      }
    });

    const totalGuests = totalAdults + totalKids;

    // Build human-friendly summary label for search bar
    let summaryLabel = isAr ? "اختر نوع الشقة والنزلاء" : "Select Flat & Occupancy";
    let confirmedBadgeLabel = isAr ? "لم يتم الاختيار" : "None Selected";
    let flatTypesQuery = "all";
    let primaryFlatType: string | null = null;

    if (activeFlats.length === 1) {
      const f = activeFlats[0];
      primaryFlatType = f.id;
      flatTypesQuery = f.id;
      const guestsText = isAr
        ? totalGuests === 1
          ? "ضيف واحد"
          : `${totalGuests} ضيوف`
        : `${totalGuests} ${totalGuests === 1 ? "Guest" : "Guests"}`;

      if (f.units === 1) {
        summaryLabel = `${f.title} · ${guestsText}`;
        confirmedBadgeLabel = `${f.title}`;
      } else {
        summaryLabel = isAr
          ? `${f.units}x ${f.title} · ${guestsText}`
          : `${f.units}x ${f.title} · ${totalGuests} Guests`;
        confirmedBadgeLabel = `${f.units}x ${f.title}`;
      }
    } else if (activeFlats.length > 1) {
      const guestsText = isAr ? `${totalGuests} ضيوف` : `${totalGuests} Guests`;
      const flatsText = isAr ? `${totalUnits} شقق` : `${totalUnits} Flats`;
      summaryLabel = `${flatsText} · ${guestsText}`;
      confirmedBadgeLabel = activeFlats.map((f) => `${f.units}x ${f.title}`).join(" + ");
      flatTypesQuery = activeFlats.map((f) => f.id).join(",");
      primaryFlatType = activeFlats[0].id;
    }

    return {
      totalUnits,
      totalAdults,
      totalKids,
      totalGuests,
      estimatedPricePerNight,
      summaryLabel,
      confirmedBadgeLabel,
      flatTypesQuery,
      primaryFlatType,
    };
  }, [flatsState]);

  const handleApply = () => {
    onApply({
      flats: flatsState,
      totalUnits: aggregate.totalUnits,
      totalAdults: aggregate.totalAdults,
      totalKids: aggregate.totalKids,
      totalGuests: aggregate.totalGuests,
      estimatedPricePerNight: aggregate.estimatedPricePerNight,
      summaryLabel: aggregate.summaryLabel,
      flatTypesQuery: aggregate.flatTypesQuery,
      primaryFlatType: aggregate.primaryFlatType,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-flat-type-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Shell (Drawer on Mobile, Centered Card on Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-2xl bg-[#140E0A] border border-[rgba(212,163,89,0.3)] shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-[#FAF4EB]",
          "flex flex-col overflow-hidden transition-all duration-300",
          // Mobile bottom-sheet curve & max-height
          "rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh]"
        )}
      >
        {/* Subtle Luxury Glow Ring */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#E5C178]/15 blur-3xl pointer-events-none rounded-full"
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="relative px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-[rgba(212,163,89,0.18)] bg-[rgba(22,16,11,0.95)] backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between mb-2">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E5C178]/15 border border-[#E5C178]/35 flex items-center justify-center text-[#E5C178]">
                <Home className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-wider text-xs uppercase text-[#E5C178] font-semibold leading-tight">
                  {isAr ? "ضيافة فلاتيل" : "Flatel Hospitality"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#B8A692] leading-none">
                  {isAr ? "شقق فندقية مجهزة · حيدر أباد" : "Serviced Apartments · Hyderabad"}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.7)] text-[#D4C4B3] hover:text-[#FAF4EB] hover:border-[#E5C178] flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isAr ? "إغلاق نافذة اختيار الشقة" : "Close flat type selector"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Main Title */}
          <div className="flex items-baseline justify-between mt-3">
            <h2
              id="select-flat-type-title"
              className="text-xl sm:text-2xl font-serif font-semibold text-[#FAF4EB] tracking-normal"
            >
              {isAr ? "اختر نوع الشقة" : "Select Flat Type"}
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#E5C178] hover:text-[#FAF4EB] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isAr ? "إعادة ضبط" : "Reset"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Flat Cards Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 sm:space-y-4 overscroll-contain">
          {FLAT_DEFINITIONS.map((flat) => {
            const state = flatsState[flat.id] || {
              units: 0,
              baseAdults: flat.baseAdults,
              baseKids: 0,
              extraAdults: 0,
              extraKids: 0,
              isAdditionalOpen: false,
            };

            const isSelected = state.units > 0;
            const maxBaseAdultsForUnits = flat.baseAdults * Math.max(1, state.units);
            const maxBaseKidsForUnits = flat.baseKids * Math.max(1, state.units);
            const maxExtraAdultsForUnits = flat.maxExtraAdults * Math.max(1, state.units);
            const maxExtraKidsForUnits = flat.maxExtraKids * Math.max(1, state.units);

            return (
              <div
                key={flat.id}
                className={cn(
                  "relative rounded-2xl transition-all duration-200 select-none",
                  isSelected
                    ? "bg-[rgba(30,21,14,0.95)] border-2 border-[#E5C178] shadow-[0_0_20px_rgba(229,193,120,0.3)] ring-1 ring-[#E5C178]/50"
                    : "bg-[rgba(22,16,11,0.65)] border border-[rgba(212,163,89,0.22)] hover:border-[#E5C178]/50 hover:bg-[rgba(28,20,13,0.85)]"
                )}
              >
                {/* Card Top Banner: Title, Price, Stepper */}
                <div className="p-3.5 sm:p-4.5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Title & Price */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isSelected
                            ? "bg-[#E5C178]/20 border border-[#E5C178] text-[#E5C178]"
                            : "bg-[rgba(34,24,16,0.8)] border border-[rgba(212,163,89,0.2)] text-[#D4C4B3]"
                        )}
                      >
                        <Home className="w-5 h-5 stroke-[2]" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#FAF4EB] tracking-wide">
                            {flat.title}
                          </h3>
                          <span className="font-mono text-sm sm:text-base font-bold text-[#E5C178]">
                            ₹{flat.pricePerNight.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[#B8A692]">{isAr ? "/ ليلة" : "/ night"}</span>
                        </div>

                        <span className="text-xs text-[#D4C4B3] mt-0.5 leading-relaxed">
                          {isAr
                            ? `السعة الأساسية: ${flat.baseAdults} بالغين و ${flat.baseKids} أطفال`
                            : `Base Capacity: ${flat.baseAdults} Adults & ${flat.baseKids} ${flat.baseKids === 1 ? "Child" : "Children"}`}
                        </span>
                      </div>
                    </div>

                    {/* Right: Number of Flats Stepper */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[11px] font-sans font-semibold text-[#D4C4B3] uppercase tracking-wider mb-1">
                        {isAr ? "عدد الشقق" : "Number of Flats"}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => updateFlatUnits(flat.id, -1)}
                          disabled={state.units <= 0}
                          className={cn(
                            "w-8 h-8 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.8)] text-[#FAF4EB] flex items-center justify-center transition-colors cursor-pointer",
                            "hover:border-[#E5C178] hover:text-[#E5C178] active:scale-95",
                            state.units <= 0 && "opacity-30 cursor-not-allowed hover:border-[rgba(212,163,89,0.25)] hover:text-[#FAF4EB]"
                          )}
                          aria-label={`Decrease number of ${flat.title} flats`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-6 text-center font-mono text-sm sm:text-base font-bold text-[#FAF4EB]">
                          {state.units}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateFlatUnits(flat.id, 1)}
                          disabled={state.units >= flat.availableUnits}
                          className={cn(
                            "w-8 h-8 rounded-lg border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.8)] text-[#FAF4EB] flex items-center justify-center transition-colors cursor-pointer",
                            "hover:border-[#E5C178] hover:text-[#E5C178] active:scale-95",
                            state.units >= flat.availableUnits && "opacity-30 cursor-not-allowed hover:border-[rgba(212,163,89,0.25)] hover:text-[#FAF4EB]"
                          )}
                          aria-label={`Increase number of ${flat.title} flats`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[10px] text-[#B8A692] mt-1 font-mono">
                        {isAr
                          ? `متبقي ${flat.availableUnits} شقق`
                          : `${flat.availableUnits} ${flat.availableUnits === 1 ? "unit left" : "units left"}`}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Guest Controls when Flat is Selected (units > 0) */}
                  {isSelected && (
                    <div className="mt-3.5 pt-3.5 border-t border-[rgba(212,163,89,0.18)] space-y-3.5 animate-in fade-in duration-150">
                      {/* Actual Guests Arriving (Included in Base) */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-sans font-semibold text-[#E5C178] uppercase tracking-wider">
                            {isAr ? "النزلاء الفعليون (مشمولون في السعر الأساسي)" : "Actual Guests Arriving (Included in Base)"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {/* Base Adults */}
                          <div className="p-2 sm:p-2.5 rounded-xl bg-[rgba(22,16,11,0.7)] border border-[rgba(212,163,89,0.2)] flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-sans font-medium text-[#FAF4EB]">
                                {isAr ? "البالغين" : "Adults"}
                              </span>
                              <span className="text-[10px] text-[#B8A692]">
                                {isAr ? `حد أقصى ${maxBaseAdultsForUnits}` : `Max ${maxBaseAdultsForUnits}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateBaseAdults(flat.id, -1)}
                                disabled={state.baseAdults <= 1}
                                className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Decrease base adults"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-mono text-sm font-bold text-[#FAF4EB]">
                                {state.baseAdults}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateBaseAdults(flat.id, 1)}
                                disabled={state.baseAdults >= maxBaseAdultsForUnits}
                                className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase base adults"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Base Children */}
                          <div className="p-2 sm:p-2.5 rounded-xl bg-[rgba(22,16,11,0.7)] border border-[rgba(212,163,89,0.2)] flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-sans font-medium text-[#FAF4EB]">
                                {isAr ? "الأطفال" : "Children"}
                              </span>
                              <span className="text-[10px] text-[#B8A692]">
                                {isAr ? `حد أقصى ${maxBaseKidsForUnits}` : `Max ${maxBaseKidsForUnits}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateBaseKids(flat.id, -1)}
                                disabled={state.baseKids <= 0}
                                className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Decrease base children"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-mono text-sm font-bold text-[#FAF4EB]">
                                {state.baseKids}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateBaseKids(flat.id, 1)}
                                disabled={state.baseKids >= maxBaseKidsForUnits}
                                className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase base children"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Occupancy (Chargeable) Accordion */}
                      <div className="rounded-xl border border-[rgba(212,163,89,0.2)] bg-[rgba(22,16,11,0.5)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleAdditionalAccordion(flat.id)}
                          className="w-full px-3 py-2 flex items-center justify-between text-left rtl:text-right hover:bg-[rgba(34,24,16,0.6)] transition-colors cursor-pointer"
                          aria-expanded={state.isAdditionalOpen}
                        >
                          <span className="text-xs font-sans font-semibold text-[#D4C4B3] flex items-center gap-1.5">
                            {isAr ? "نزلاء إضافيون (برسوم إضافية)" : "Additional Occupancy (Chargeable)"}
                            {(state.extraAdults > 0 || state.extraKids > 0) && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E5C178]/20 text-[#E5C178]">
                                +{state.extraAdults + state.extraKids}
                              </span>
                            )}
                          </span>
                          {state.isAdditionalOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#E5C178]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#D4C4B3]" />
                          )}
                        </button>

                        {state.isAdditionalOpen && (
                          <div className="p-3 pt-1 border-t border-[rgba(212,163,89,0.15)] space-y-2.5 animate-in fade-in duration-150">
                            {/* Extra Adults */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-[#FAF4EB]">
                                  {isAr
                                    ? `بالغون إضافيون (+${maxExtraAdultsForUnits} متاحين)`
                                    : `Additional Adults (+${maxExtraAdultsForUnits} extra)`}
                                </span>
                                <span className="text-[10px] text-[#E5C178] font-mono">
                                  {isAr ? `₹${flat.extraAdultFee} / ليلة لكل بالغ` : `₹${flat.extraAdultFee} / night per adult`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateExtraAdults(flat.id, -1)}
                                  disabled={state.extraAdults <= 0}
                                  className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Decrease extra adults"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center font-mono text-sm font-bold text-[#FAF4EB]">
                                  {state.extraAdults}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExtraAdults(flat.id, 1)}
                                  disabled={state.extraAdults >= maxExtraAdultsForUnits}
                                  className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Increase extra adults"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Extra Children */}
                            <div className="flex items-center justify-between pt-1 border-t border-[rgba(212,163,89,0.1)]">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-[#FAF4EB]">
                                  {isAr ? "أطفال إضافيون لكل ليلة" : "Additional Children per night"}
                                </span>
                                <span className="text-[10px] text-[#E5C178] font-mono">
                                  {isAr ? `₹${flat.extraKidFee} / ليلة لكل طفل` : `₹${flat.extraKidFee} / night per child`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateExtraKids(flat.id, -1)}
                                  disabled={state.extraKids <= 0}
                                  className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Decrease extra children"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center font-mono text-sm font-bold text-[#FAF4EB]">
                                  {state.extraKids}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExtraKids(flat.id, 1)}
                                  disabled={state.extraKids >= maxExtraKidsForUnits}
                                  className="w-7 h-7 rounded-md border border-[rgba(212,163,89,0.2)] text-[#FAF4EB] flex items-center justify-center hover:border-[#E5C178] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Increase extra children"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer / Floating Action Bar (Exact Client WhatsApp Aesthetic) */}
        <div className="p-4 sm:p-5 border-t border-[rgba(212,163,89,0.2)] bg-[rgba(20,14,10,0.98)] backdrop-blur-md shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left / Center Summary Badge */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(229,193,120,0.12)] border border-[#E5C178]/40 text-[#FAF4EB]">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C178]" />
                <span className="text-xs sm:text-sm font-medium tracking-wide">
                  {isAr ? "المحدد: " : "Confirmed: "}
                  <strong className="text-[#E5C178] font-bold">
                    {aggregate.totalUnits > 0
                      ? aggregate.confirmedBadgeLabel
                      : (isAr ? "اختر شقة" : "Select Flat")}
                  </strong>
                </span>
              </div>

              {aggregate.totalUnits > 0 && (
                <div className="text-right sm:hidden">
                  <span className="text-[10px] text-[#B8A692] block leading-none">
                    {isAr ? "السعر التقديري" : "Est. Rate"}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#E5C178]">
                    ₹{aggregate.estimatedPricePerNight.toLocaleString("en-IN")}{isAr ? "/ليلة" : "/N"}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Price Total & Apply CTA */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {aggregate.totalUnits > 0 && (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#B8A692]">
                    {isAr ? "السعر الإجمالي" : "Total Rate"}
                  </span>
                  <span className="font-mono text-base font-bold text-[#E5C178]">
                    ₹{aggregate.estimatedPricePerNight.toLocaleString("en-IN")}{" "}
                    <span className="text-xs text-[#FAF4EB] font-sans font-normal">
                      {isAr ? "/ ليلة" : "/ night"}
                    </span>
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={aggregate.totalUnits === 0}
                className={cn(
                  "flex-1 sm:flex-initial min-h-[46px] sm:min-h-[48px] px-6 sm:px-7 rounded-xl font-sans font-bold text-sm tracking-wide transition-all cursor-pointer",
                  "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] shadow-md shadow-[#E5C178]/25 hover:brightness-105 active:scale-95",
                  "flex items-center justify-center gap-2",
                  aggregate.totalUnits === 0 && "opacity-40 cursor-not-allowed hover:brightness-100 active:scale-100"
                )}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isAr ? "تأكيد الاختيار" : "Apply Selection"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
