"use client";

import * as React from "react";
import { Minus, Plus, Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestSelectorProps {
  adults: number;
  childrenCount: number;
  onChangeAdults: (val: number) => void;
  onChangeChildren: (val: number) => void;
  onConfirm?: () => void;
  onReset?: () => void;
  onClose?: () => void;
  className?: string;
  isMobileModal?: boolean;
}

export function GuestSelector({
  adults,
  childrenCount,
  onChangeAdults,
  onChangeChildren,
  onConfirm,
  onReset,
  onClose,
  className,
  isMobileModal = false,
}: GuestSelectorProps) {
  const minAdults = 1;
  const maxAdults = 12; // 4 BHK allows up to 12 adults (8 base + 4 extra)
  const minChildren = 0;
  const maxChildren = 8;

  const totalGuests = adults + childrenCount;

  const handleDone = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-raised/95 backdrop-blur-xl border border-line text-fg shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none",
        isMobileModal
          ? "p-5 max-w-full"
          : "p-4 sm:p-5 max-w-[340px] sm:max-w-[360px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-line-soft">
        <div>
          <span className="text-xs font-sans font-semibold tracking-wider uppercase text-gold">
            Occupancy
          </span>
          <h3 className="text-sm font-sans font-semibold tracking-wide text-fg">
            Guests Staying
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-gold px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30">
          {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Adults Row */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-sm sm:text-base font-sans font-medium text-fg">
              Adults
            </div>
            <div className="text-xs font-sans text-fg-muted">
              Guests aged 13+ years
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChangeAdults(Math.max(minAdults, adults - 1))}
              disabled={adults <= minAdults}
              className={cn(
                "h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-line bg-surface/70 text-fg hover:border-gold hover:text-gold active:bg-raised/80 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer",
                adults <= minAdults && "opacity-25 cursor-not-allowed hover:border-line hover:text-fg"
              )}
              aria-label="Decrease adults"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-7 text-center font-mono text-base sm:text-lg font-semibold text-fg">
              {adults}
            </span>

            <button
              type="button"
              onClick={() => onChangeAdults(Math.min(maxAdults, adults + 1))}
              disabled={adults >= maxAdults}
              className={cn(
                "h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-line bg-surface/70 text-fg hover:border-gold hover:text-gold active:bg-raised/80 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer",
                adults >= maxAdults && "opacity-25 cursor-not-allowed hover:border-line hover:text-fg"
              )}
              aria-label="Increase adults"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children Row */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-sm sm:text-base font-sans font-medium text-fg">
              Children
            </div>
            <div className="text-xs font-sans text-gold">
              Ages 0–12 · Extra children ₹300/night
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChangeChildren(Math.max(minChildren, childrenCount - 1))}
              disabled={childrenCount <= minChildren}
              className={cn(
                "h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-line bg-surface/70 text-fg hover:border-gold hover:text-gold active:bg-raised/80 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer",
                childrenCount <= minChildren && "opacity-25 cursor-not-allowed hover:border-line hover:text-fg"
              )}
              aria-label="Decrease children"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-7 text-center font-mono text-base sm:text-lg font-semibold text-fg">
              {childrenCount}
            </span>

            <button
              type="button"
              onClick={() => onChangeChildren(Math.min(maxChildren, childrenCount + 1))}
              disabled={childrenCount >= maxChildren}
              className={cn(
                "h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-line bg-surface/70 text-fg hover:border-gold hover:text-gold active:bg-raised/80 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer",
                childrenCount >= maxChildren && "opacity-25 cursor-not-allowed hover:border-line hover:text-fg"
              )}
              aria-label="Increase children"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Flat Capacity Note */}
      <div className="mt-4 p-2.5 rounded-lg bg-surface/70 border border-line-soft flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-fg-muted leading-relaxed">
          1 BHK (2 base, max 4) • 2 BHK (4 base, max 6) • 3 BHK (6 base, max 9) • 4 BHK (8 base, max 12). Each flat includes children up to its base allowance (1 BHK 1, 2 BHK 2, 3 BHK 3, 4 BHK 4); extra children are ₹300 per night. Specific child safety limits awaiting owner confirmation.
        </p>
      </div>

      {/* Bottom Actions: Reset & Done */}
      <div className="pt-3 mt-4 border-t border-line-soft flex items-center justify-between gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-sans text-fg-muted hover:text-fg transition-colors rounded-sm focus:outline-none cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-fg-muted" />
            <span>Reset</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleDone}
          className="flex-1 py-2.5 min-h-[42px] rounded-lg bg-gradient-to-r from-gold to-gold-deep hover:brightness-105 text-ink text-xs font-sans font-bold tracking-wider uppercase transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-fg cursor-pointer"
        >
          Confirm Guests
        </button>
      </div>
    </div>
  );
}
