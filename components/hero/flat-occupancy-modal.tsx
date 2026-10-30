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
import type { FlatDefinition } from "@/lib/booking/flat-definitions";
import { MAX_CART_FLATS, buildCartItems, type CartItem } from "@/lib/booking/cart";

export type { FlatDefinition };

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
  /** One entry per physical flat, with the guests assigned to it. */
  cart: CartItem[];
}

interface FlatOccupancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: MergedSelectionResult) => void;
  initialSelection?: Record<string, FlatOccupancyState> | null;
  /** Live flat types from inventory; null until loaded. */
  flats: FlatDefinition[] | null;
  flatsStatus: "loading" | "ready" | "error";
  onRetryFlats: () => void;
}

export function FlatOccupancyModal({
  isOpen,
  onClose,
  onApply,
  initialSelection,
  flats,
  flatsStatus,
  onRetryFlats,
}: FlatOccupancyModalProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const isAr = currentLocale === "ar";

  const definitions = React.useMemo(() => flats ?? [], [flats]);

  const [flatsState, setFlatsState] = React.useState<Record<string, FlatOccupancyState>>(() =>
    initialSelection && Object.keys(initialSelection).length > 0 ? initialSelection : {}
  );

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

  const emptyState = (flat: FlatDefinition, units: number): FlatOccupancyState => ({
    units,
    baseAdults: flat.baseAdults,
    baseKids: 0,
    extraAdults: 0,
    extraKids: 0,
    isAdditionalOpen: false,
  });

  /** Until the guest touches anything, the first flat type is pre-selected with one unit. */
  const stateFor = (flat: FlatDefinition, index: number): FlatOccupancyState =>
    flatsState[flat.id] ?? emptyState(flat, Object.keys(flatsState).length === 0 && index === 0 ? 1 : 0);

  const patchFlat = (
    flatId: string,
    change: (current: FlatOccupancyState, flat: FlatDefinition) => FlatOccupancyState
  ) => {
    setFlatsState((prev) => {
      const flat = definitions.find((f) => f.id === flatId);
      if (!flat) return prev;
      const untouched = Object.keys(prev).length === 0;
      const full: Record<string, FlatOccupancyState> = {};
      definitions.forEach((def, index) => {
        full[def.id] = prev[def.id] ?? emptyState(def, untouched && index === 0 ? 1 : 0);
      });
      return { ...full, [flatId]: change(full[flatId], flat) };
    });
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const updateFlatUnits = (flatId: string, delta: number) =>
    patchFlat(flatId, (current, flat) => {
      const newUnits = clamp(current.units + delta, 0, flat.availableUnits);
      const isNewlyActivated = current.units === 0 && newUnits > 0;
      return {
        ...current,
        units: newUnits,
        // Every unit needs at least one adult, and guests can't exceed what the units hold
        baseAdults:
          newUnits === 0
            ? flat.baseAdults
            : clamp(isNewlyActivated ? flat.baseAdults : current.baseAdults, newUnits, flat.baseAdults * newUnits),
        baseKids: newUnits === 0 ? 0 : Math.min(current.baseKids, flat.baseKids * newUnits),
        extraAdults: newUnits === 0 ? 0 : Math.min(current.extraAdults, flat.maxExtraAdults * newUnits),
        extraKids: newUnits === 0 ? 0 : Math.min(current.extraKids, flat.maxExtraKids * newUnits),
        isAdditionalOpen: isNewlyActivated ? false : current.isAdditionalOpen,
      };
    });

  const updateBaseAdults = (flatId: string, delta: number) =>
    patchFlat(flatId, (current, flat) =>
      current.units === 0
        ? current
        : (() => {
            const baseAdults = clamp(current.baseAdults + delta, current.units, flat.baseAdults * current.units);
            return { ...current, baseAdults, extraAdults: baseAdults < flat.baseAdults * current.units ? 0 : current.extraAdults };
          })()
    );

  const updateBaseKids = (flatId: string, delta: number) =>
    patchFlat(flatId, (current, flat) =>
      current.units === 0
        ? current
        : (() => {
            const baseKids = clamp(current.baseKids + delta, 0, flat.baseKids * current.units);
            return { ...current, baseKids, extraKids: baseKids < flat.baseKids * current.units ? 0 : current.extraKids };
          })()
    );

  const updateExtraAdults = (flatId: string, delta: number) =>
    patchFlat(flatId, (current, flat) =>
      current.units === 0
        ? current
        : current.baseAdults < flat.baseAdults * current.units
        ? current
        : { ...current, extraAdults: clamp(current.extraAdults + delta, 0, flat.maxExtraAdults * current.units) }
    );

  const updateExtraKids = (flatId: string, delta: number) =>
    patchFlat(flatId, (current, flat) =>
      current.units === 0
        ? current
        : current.baseKids < flat.baseKids * current.units
        ? current
        : { ...current, extraKids: clamp(current.extraKids + delta, 0, flat.maxExtraKids * current.units) }
    );

  const toggleAdditionalAccordion = (flatId: string) =>
    patchFlat(flatId, (current) => ({ ...current, isAdditionalOpen: !current.isAdditionalOpen }));

  const handleReset = () => {
    setFlatsState({});
  };

  // Live Aggregate Computations
  const aggregate = React.useMemo(() => {
    let totalUnits = 0;
    let totalAdults = 0;
    let totalKids = 0;
    let estimatedPricePerNight = 0;
    const activeFlats: { id: string; title: string; units: number }[] = [];
    const cart: CartItem[] = [];

    definitions.forEach((flat, index) => {
      const state = stateFor(flat, index);
      if (state.units > 0) {
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
        cart.push(
          ...buildCartItems(flat.id, state.units, state.baseAdults + state.extraAdults, state.baseKids + state.extraKids)
        );
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
      cart,
      tooManyFlats: totalUnits > MAX_CART_FLATS,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stateFor reads flatsState, which is listed
  }, [flatsState, definitions, isAr]);

  const handleApply = () => {
    const fullState: Record<string, FlatOccupancyState> = {};
    definitions.forEach((def, index) => {
      fullState[def.id] = stateFor(def, index);
    });
    onApply({
      flats: fullState,
      totalUnits: aggregate.totalUnits,
      totalAdults: aggregate.totalAdults,
      totalKids: aggregate.totalKids,
      totalGuests: aggregate.totalGuests,
      estimatedPricePerNight: aggregate.estimatedPricePerNight,
      summaryLabel: aggregate.summaryLabel,
      flatTypesQuery: aggregate.flatTypesQuery,
      primaryFlatType: aggregate.primaryFlatType,
      cart: aggregate.cart,
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
        className="fixed inset-0 bg-canvas/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Shell (Drawer on Mobile, Centered Card on Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-2xl bg-surface border border-line shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-fg",
          "flex flex-col overflow-hidden transition-all duration-300",
          // Mobile bottom-sheet curve & max-height
          "rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh]"
        )}
      >
        {/* Subtle Luxury Glow Ring */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-gold/15 blur-3xl pointer-events-none rounded-full"
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="relative px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-line-soft bg-surface/95 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="select-flat-type-title"
              className="font-heading text-fg heading-sub"
            >
              {isAr ? "اختر نوع الشقة" : "Select Flat Type"}
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gold hover:text-fg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAr ? "إعادة ضبط" : "Reset"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-line bg-surface/70 text-fg-soft hover:text-fg hover:border-gold flex items-center justify-center transition-colors cursor-pointer"
                aria-label={isAr ? "إغلاق نافذة اختيار الشقة" : "Close flat type selector"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-fg-muted">
            {isAr
              ? "يمكنك اختيار أكثر من نوع شقة — اضغط + على كل نوع تريده."
              : "Need more space? Tap + on more than one flat type to combine them."}
          </p>
        </div>

        {/* Scrollable Flat Cards Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 sm:space-y-4 overscroll-contain">
          {flatsStatus === "loading" && !flats && (
            <p role="status" className="py-10 text-center text-sm text-fg-soft">
              {isAr ? "جارٍ تحميل الشقق…" : "Loading current flats…"}
            </p>
          )}
          {flatsStatus === "error" && !flats && (
            <div role="alert" className="py-10 text-center space-y-3">
              <p className="text-sm text-fg-soft">
                {isAr ? "تعذر تحميل الشقق الآن." : "We couldn't load the flats right now."}
              </p>
              <button
                type="button"
                onClick={onRetryFlats}
                className="px-4 min-h-[40px] rounded-lg border border-line-strong text-sm font-semibold text-gold hover:border-gold cursor-pointer"
              >
                {isAr ? "حاول مرة أخرى" : "Try again"}
              </button>
            </div>
          )}
          {definitions.map((flat, index) => {
            const state = stateFor(flat, index);

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
                    ? "bg-raised/95 border-2 border-gold shadow-[0_0_20px_color-mix(in_srgb,var(--gold)_30%,transparent)] ring-1 ring-gold/50"
                    : "bg-surface/65 border border-line hover:border-gold/50 hover:bg-raised/85"
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
                            ? "bg-gold/20 border border-gold text-gold"
                            : "bg-raised/80 border border-line-soft text-fg-soft"
                        )}
                      >
                        <Home className="w-5 h-5 stroke-[2]" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-fg tracking-wide">
                            {flat.title}
                          </h3>
                          <span className="font-mono text-sm sm:text-base font-bold text-gold">
                            ₹{flat.pricePerNight.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-fg-muted">{isAr ? "/ ليلة" : "/ night"}</span>
                        </div>

                        <span className="text-xs text-fg-soft mt-0.5 leading-relaxed">
                          {isAr
                            ? `السعة الأساسية: ${flat.baseAdults} بالغين و ${flat.baseKids} أطفال`
                            : `Base Capacity: ${flat.baseAdults} Adults & ${flat.baseKids} ${flat.baseKids === 1 ? "Child" : "Children"}`}
                        </span>
                      </div>
                    </div>

                    {/* Right: Number of Flats Stepper */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-sans font-semibold text-fg-soft uppercase tracking-wider mb-1">
                        {isAr ? "عدد الشقق" : "Number of Flats"}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => updateFlatUnits(flat.id, -1)}
                          disabled={state.units <= 0}
                          className={cn(
                            "w-8 h-8 rounded-lg border border-line bg-surface/80 text-fg flex items-center justify-center transition-colors cursor-pointer",
                            "hover:border-gold hover:text-gold active:scale-95",
                            state.units <= 0 && "opacity-30 cursor-not-allowed hover:border-line hover:text-fg"
                          )}
                          aria-label={`Decrease number of ${flat.title} flats`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-6 text-center font-mono text-sm sm:text-base font-bold text-fg">
                          {state.units}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateFlatUnits(flat.id, 1)}
                          disabled={state.units >= flat.availableUnits}
                          className={cn(
                            "w-8 h-8 rounded-lg border border-line bg-surface/80 text-fg flex items-center justify-center transition-colors cursor-pointer",
                            "hover:border-gold hover:text-gold active:scale-95",
                            state.units >= flat.availableUnits && "opacity-30 cursor-not-allowed hover:border-line hover:text-fg"
                          )}
                          aria-label={`Increase number of ${flat.title} flats`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs text-fg-muted mt-1 font-mono">
                        {isAr
                          ? `متاح ${flat.availableUnits} شقق`
                          : flat.availableUnits === 1
                            ? "Only 1 available"
                            : `${flat.availableUnits} available`}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Guest Controls when Flat is Selected (units > 0) */}
                  {isSelected && (
                    <div className="mt-3.5 pt-3.5 border-t border-line-soft space-y-3.5 animate-in fade-in duration-150">
                      {/* Actual Guests Arriving (Included in Base) */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-sans font-semibold text-gold uppercase tracking-wider">
                            {isAr ? "النزلاء الفعليون (مشمولون في السعر الأساسي)" : "Actual Guests Arriving (Included in Base)"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {/* Base Adults */}
                          <div className="p-2 sm:p-2.5 rounded-xl bg-surface/70 border border-line-soft flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-sans font-medium text-fg">
                                {isAr ? "البالغين" : "Adults"}
                              </span>
                              <span className="text-xs text-fg-muted">
                                {isAr ? `حد أقصى ${maxBaseAdultsForUnits}` : `Max ${maxBaseAdultsForUnits}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateBaseAdults(flat.id, -1)}
                                disabled={state.baseAdults <= 1}
                                className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Decrease base adults"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-mono text-sm font-bold text-fg">
                                {state.baseAdults}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateBaseAdults(flat.id, 1)}
                                disabled={state.baseAdults >= maxBaseAdultsForUnits}
                                className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase base adults"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Base Children */}
                          <div className="p-2 sm:p-2.5 rounded-xl bg-surface/70 border border-line-soft flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-sans font-medium text-fg">
                                {isAr ? "الأطفال" : "Children"}
                              </span>
                              <span className="text-xs text-fg-muted">
                                {isAr ? `حد أقصى ${maxBaseKidsForUnits}` : `Max ${maxBaseKidsForUnits}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateBaseKids(flat.id, -1)}
                                disabled={state.baseKids <= 0}
                                className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Decrease base children"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-mono text-sm font-bold text-fg">
                                {state.baseKids}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateBaseKids(flat.id, 1)}
                                disabled={state.baseKids >= maxBaseKidsForUnits}
                                className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase base children"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Occupancy (Chargeable) Accordion */}
                      <div className="rounded-xl border border-line-soft bg-surface/50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleAdditionalAccordion(flat.id)}
                          className="w-full px-3 py-2 flex items-center justify-between text-left rtl:text-right hover:bg-raised/60 transition-colors cursor-pointer"
                          aria-expanded={state.isAdditionalOpen}
                        >
                          <span className="text-xs font-sans font-semibold text-fg-soft flex items-center gap-1.5">
                            {isAr ? "نزلاء إضافيون (برسوم إضافية)" : "Additional Occupancy (Chargeable)"}
                            {(state.extraAdults > 0 || state.extraKids > 0) && (
                              <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-gold/20 text-gold">
                                +{state.extraAdults + state.extraKids}
                              </span>
                            )}
                          </span>
                          {state.isAdditionalOpen ? (
                            <ChevronUp className="w-4 h-4 text-gold" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-fg-soft" />
                          )}
                        </button>

                        {state.isAdditionalOpen && (
                          <div className="p-2.5 border-t border-line-soft grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 animate-in fade-in duration-150">
                            <p className="sm:col-span-2 text-xs text-fg-muted">
                              {isAr
                                ? "تُضاف رسوم النزلاء الإضافيين بعد اكتمال النزلاء المشمولين أعلاه."
                                : "Extra guests are charged once the included guests above are full."}
                            </p>
                            {/* Extra Adults */}
                            <div className="p-2 sm:p-2.5 rounded-xl bg-surface/70 border border-line-soft flex items-center justify-between gap-2">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-fg">
                                  {isAr ? "بالغون إضافيون" : "Extra Adults"}
                                  <span className="text-xs text-fg-muted font-normal">
                                    {isAr ? ` · حد أقصى ${maxExtraAdultsForUnits}` : ` · Max ${maxExtraAdultsForUnits}`}
                                  </span>
                                </span>
                                <span className="text-xs text-gold font-mono">
                                  {isAr ? `₹${flat.extraAdultFee} / ليلة لكل بالغ` : `₹${flat.extraAdultFee} / night per adult`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateExtraAdults(flat.id, -1)}
                                  disabled={state.extraAdults <= 0}
                                  className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Decrease extra adults"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center font-mono text-sm font-bold text-fg">
                                  {state.extraAdults}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExtraAdults(flat.id, 1)}
                                  disabled={state.extraAdults >= maxExtraAdultsForUnits || state.baseAdults < maxBaseAdultsForUnits}
                                  className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Increase extra adults"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Extra Children */}
                            <div className="p-2 sm:p-2.5 rounded-xl bg-surface/70 border border-line-soft flex items-center justify-between gap-2">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-fg">
                                  {isAr ? "أطفال إضافيون" : "Extra Children"}
                                  <span className="text-xs text-fg-muted font-normal">
                                    {isAr ? ` · حد أقصى ${maxExtraKidsForUnits}` : ` · Max ${maxExtraKidsForUnits}`}
                                  </span>
                                </span>
                                <span className="text-xs text-gold font-mono">
                                  {isAr ? `₹${flat.extraKidFee} / ليلة لكل طفل` : `₹${flat.extraKidFee} / night per child`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateExtraKids(flat.id, -1)}
                                  disabled={state.extraKids <= 0}
                                  className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Decrease extra children"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center font-mono text-sm font-bold text-fg">
                                  {state.extraKids}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExtraKids(flat.id, 1)}
                                  disabled={state.extraKids >= maxExtraKidsForUnits || state.baseKids < maxBaseKidsForUnits}
                                  className="w-7 h-7 rounded-md border border-line-soft text-fg flex items-center justify-center hover:border-gold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="p-4 sm:p-5 border-t border-line-soft bg-[rgba(20,14,10,0.98)] backdrop-blur-md shrink-0">
          {aggregate.tooManyFlats && (
            <p role="alert" className="mb-3 text-xs text-danger-soft">
              {isAr ? `يمكنك حجز ${MAX_CART_FLATS} شقق كحد أقصى في حجز واحد.` : `You can book up to ${MAX_CART_FLATS} flats in one booking.`}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left / Center Summary Badge */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/12 border border-gold/40 text-fg">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs sm:text-sm font-medium tracking-wide">
                  {isAr ? "المحدد: " : "Confirmed: "}
                  <strong className="text-gold font-bold">
                    {aggregate.totalUnits > 0
                      ? aggregate.confirmedBadgeLabel
                      : (isAr ? "اختر شقة" : "Select Flat")}
                  </strong>
                </span>
              </div>

              {aggregate.totalUnits > 0 && (
                <div className="text-right sm:hidden">
                  <span className="text-xs text-fg-muted block leading-none">
                    {isAr ? "السعر التقديري" : "Est. Rate"}
                  </span>
                  <span className="font-mono text-sm font-bold text-gold">
                    ₹{aggregate.estimatedPricePerNight.toLocaleString("en-IN")}{isAr ? "/ليلة" : "/N"}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Price Total & Apply CTA */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {aggregate.totalUnits > 0 && (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs uppercase tracking-wider text-fg-muted">
                    {isAr ? "السعر الإجمالي" : "Total Rate"}
                  </span>
                  <span className="font-mono text-base font-bold text-gold">
                    ₹{aggregate.estimatedPricePerNight.toLocaleString("en-IN")}{" "}
                    <span className="text-xs text-fg font-sans font-normal">
                      {isAr ? "/ ليلة" : "/ night"}
                    </span>
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={aggregate.totalUnits === 0 || aggregate.tooManyFlats}
                className={cn(
                  "flex-1 sm:flex-initial min-h-[46px] sm:min-h-[48px] px-6 sm:px-7 rounded-xl font-sans font-bold text-sm tracking-wide transition-all cursor-pointer",
                  "bg-gradient-to-r from-gold to-gold-deep text-ink shadow-md shadow-gold/25 hover:brightness-105 active:scale-95",
                  "flex items-center justify-center gap-2",
                  (aggregate.totalUnits === 0 || aggregate.tooManyFlats) && "opacity-40 cursor-not-allowed hover:brightness-100 active:scale-100"
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
