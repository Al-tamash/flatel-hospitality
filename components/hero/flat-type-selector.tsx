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
        "w-full rounded-2xl bg-[rgba(34,24,16,0.95)] backdrop-blur-xl border border-[rgba(212,163,89,0.28)] text-[#FAF4EB] shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none",
        isMobileModal ? "p-4 max-w-full" : "p-3 sm:p-4 max-w-[340px] sm:max-w-[370px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,89,0.18)]">
        <div>
          <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#E5C178]">
            Flat Size
          </span>
          <h3 className="text-sm font-sans font-semibold tracking-wide text-[#FAF4EB]">
            Select Flat Type
          </h3>
        </div>
        <span className="text-[11px] font-mono font-medium text-[#E5C178] px-2 py-0.5 rounded-full bg-[#E5C178]/10 border border-[#E5C178]/25">
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
                  ? "bg-[rgba(22,16,11,0.9)] border border-[#E5C178] shadow-xs"
                  : "bg-[rgba(34,24,16,0.5)] hover:bg-[rgba(45,32,22,0.7)] border border-[rgba(212,163,89,0.15)] text-[#B8A692]"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "mt-0.5 p-1.5 rounded-lg border shrink-0 transition-colors",
                    isSelected
                      ? "border-[#E5C178]/50 bg-[#E5C178]/15 text-[#E5C178]"
                      : "border-[rgba(212,163,89,0.15)] bg-[rgba(22,16,11,0.6)] text-[#B8A692]"
                  )}
                >
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-sans text-sm font-medium tracking-wide",
                        isSelected ? "text-[#FAF4EB]" : "text-[#FAF4EB]/90"
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#E5C178] font-semibold">
                      {item.priceNote}
                    </span>
                  </div>
                  <div className="text-[10px] font-sans text-[#B8A692] mt-0.5">
                    {item.capacityNote}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Reset Action if selected */}
      {selectedType !== null && (
        <div className="pt-2.5 mt-2.5 border-t border-[rgba(212,163,89,0.18)] flex justify-end">
          <button
            type="button"
            onClick={() => {
              onSelectType(null);
              if (onClose) onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#B8A692] hover:text-[#E5C178] transition-colors py-1 px-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset flat type</span>
          </button>
        </div>
      )}
    </div>
  );
}
