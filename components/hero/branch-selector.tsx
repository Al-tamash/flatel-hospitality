"use client";

import * as React from "react";
import { MapPin, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type BranchFilter = "all" | "barkas-salala" | "moghal-pura";

export interface BranchOption {
  id: BranchFilter;
  title: string;
  subtitle: string;
  locationNote: string;
}

export const BRANCH_OPTIONS: BranchOption[] = [
  {
    id: "all",
    title: "All Branches",
    subtitle: "Barkas Salala & Moghal Pura",
    locationNote: "All Hyderabad residences",
  },
  {
    id: "barkas-salala",
    title: "Barkas Salala",
    subtitle: "Near Chandrayangutta",
    locationNote: "Two 3 BHK residences",
  },
  {
    id: "moghal-pura",
    title: "Moghal Pura",
    subtitle: "Near Charminar",
    locationNote: "1 BHK, 2 BHK & 4 BHK residences",
  },
];

interface BranchSelectorProps {
  selectedBranch: BranchFilter | null;
  onSelectBranch: (branch: BranchFilter | null) => void;
  onClose?: () => void;
  className?: string;
  isMobileModal?: boolean;
}

export function BranchSelector({
  selectedBranch,
  onSelectBranch,
  onClose,
  className,
  isMobileModal = false,
}: BranchSelectorProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-[rgba(34,24,16,0.95)] backdrop-blur-xl border border-[rgba(212,163,89,0.28)] text-[#FAF4EB] shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none",
        isMobileModal ? "p-4 max-w-full" : "p-3 sm:p-4 max-w-[340px] sm:max-w-[360px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,89,0.18)]">
        <div>
          <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#E5C178]">
            Select Location
          </span>
          <h3 className="text-sm font-sans font-semibold tracking-wide text-[#FAF4EB]">
            Our Hyderabad Branches
          </h3>
        </div>
        <span className="text-[11px] font-mono font-medium text-[#E5C178] px-2 py-0.5 rounded-full bg-[#E5C178]/10 border border-[#E5C178]/25">
          2 Active Locations
        </span>
      </div>

      {/* Options List */}
      <div className="space-y-1.5" role="radiogroup" aria-label="Select FLATEL Branch">
        {BRANCH_OPTIONS.map((branch) => {
          const isSelected = selectedBranch === branch.id;
          return (
            <button
              key={branch.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                onSelectBranch(branch.id);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full p-3 rounded-xl text-left flex items-start justify-between gap-3 transition-all duration-150 cursor-pointer",
                isSelected
                  ? "bg-[rgba(22,16,11,0.9)] border border-[#E5C178] shadow-xs"
                  : "bg-[rgba(34,24,16,0.5)] hover:bg-[rgba(45,32,22,0.7)] border border-[rgba(212,163,89,0.15)] text-[#B8A692]"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 p-1.5 rounded-lg border shrink-0 transition-colors",
                    isSelected
                      ? "border-[#E5C178]/50 bg-[#E5C178]/15 text-[#E5C178]"
                      : "border-[rgba(212,163,89,0.15)] bg-[rgba(22,16,11,0.6)] text-[#B8A692]"
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div
                    className={cn(
                      "font-sans text-sm font-medium tracking-wide",
                      isSelected ? "text-[#FAF4EB]" : "text-[#FAF4EB]/90"
                    )}
                  >
                    {branch.title}
                  </div>
                  <div className="text-[11px] font-sans text-[#B8A692] mt-0.5">
                    {branch.subtitle}
                  </div>
                  <div className="text-[10px] font-sans text-[#E5C178] mt-0.5">
                    {branch.locationNote}
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
      {selectedBranch !== null && (
        <div className="pt-2.5 mt-2.5 border-t border-[rgba(212,163,89,0.18)] flex justify-end">
          <button
            type="button"
            onClick={() => {
              onSelectBranch(null);
              if (onClose) onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#B8A692] hover:text-[#E5C178] transition-colors py-1 px-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset branch</span>
          </button>
        </div>
      )}
    </div>
  );
}
