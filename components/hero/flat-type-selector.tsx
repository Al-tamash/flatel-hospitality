"use client";

import * as React from "react";
import { Check, Home, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlatTypeFilter = "any" | "1bhk" | "2bhk" | "3bhk" | "4bhk" | "5bhk";

export interface FlatTypeOption {
  id: FlatTypeFilter;
  title: string;
  priceNote: string;
  capacityNote: string;
}

export const FLAT_TYPE_OPTIONS: FlatTypeOption[] = [
  {
    id: "any",
    title: "Any flat",
    priceNote: "Explore All Inventory",
    capacityNote: "1 BHK to 5 BHK residences",
  },
  {
    id: "1bhk",
    title: "1 BHK",
    priceNote: "₹2,000 / night",
    capacityNote: "2 Base Adults (+2 extra) · 1 child included",
  },
  {
    id: "2bhk",
    title: "2 BHK",
    priceNote: "₹2,500 / night",
    capacityNote: "4 Base Adults (+2 extra) · 2 children included",
  },
  {
    id: "3bhk",
    title: "3 BHK",
    priceNote: "₹3,000 / night",
    capacityNote: "6 Base Adults (+3 extra) · Two units at Barkas",
  },
  {
    id: "4bhk",
    title: "4 BHK",
    priceNote: "₹4,000 / night",
    capacityNote: "8 Base Adults (+4 extra) · Moghal Pura",
  },
  {
    id: "5bhk",
    title: "5 BHK",
    priceNote: "Owner Configured",
    capacityNote: "Admin-created inventory & capacity",
  },
];

interface FlatTypeSelectorProps {
  selectedType: FlatTypeFilter | null;
  onSelectType: (type: FlatTypeFilter | null) => void;
  onClose?: () => void;
  className?: string;
  isMobileModal?: boolean;
}

export function FlatTypeSelector({
  selectedType,
  onSelectType,
  onClose,
  className,
  isMobileModal = false,
}: FlatTypeSelectorProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-raised/95 backdrop-blur-xl border border-line text-fg shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none",
        isMobileModal ? "p-4 max-w-full" : "p-3 sm:p-4 max-w-[340px] sm:max-w-[370px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-line-soft">
        <div>
          <span className="text-xs font-sans font-semibold tracking-wider uppercase text-gold">
            Flat Size
          </span>
          <h3 className="text-sm font-sans font-semibold tracking-wide text-fg">
            Select Flat Type
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25">
          1–5 BHK
        </span>
      </div>

      {/* Options List */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1" role="radiogroup" aria-label="Select Flat Type">
        {FLAT_TYPE_OPTIONS.map((item) => {
          const isSelected = selectedType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                onSelectType(item.id);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full p-2.5 sm:p-3 rounded-xl text-left flex items-start justify-between gap-3 transition-all duration-150 cursor-pointer",
                isSelected
                  ? "bg-surface/90 border border-gold shadow-xs"
                  : "bg-raised/50 hover:bg-raised-hover/70 border border-line-soft text-fg-muted"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "mt-0.5 p-1.5 rounded-lg border shrink-0 transition-colors",
                    isSelected
                      ? "border-gold/50 bg-gold/15 text-gold"
                      : "border-line-soft bg-surface/60 text-fg-muted"
                  )}
                >
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-sans text-sm font-medium tracking-wide",
                        isSelected ? "text-fg" : "text-fg/90"
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="font-mono text-xs text-gold font-semibold">
                      {item.priceNote}
                    </span>
                  </div>
                  <div className="text-xs font-sans text-fg-muted mt-0.5">
                    {item.capacityNote}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-gold to-gold-deep text-ink flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Reset Action if selected */}
      {selectedType !== null && (
        <div className="pt-2.5 mt-2.5 border-t border-line-soft flex justify-end">
          <button
            type="button"
            onClick={() => {
              onSelectType(null);
              if (onClose) onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-gold transition-colors py-1 px-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset flat type</span>
          </button>
        </div>
      )}
    </div>
  );
}
