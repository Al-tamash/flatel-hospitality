"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MapPin, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocaleFromPath } from "@/lib/i18n";

export type BranchFilter = "all" | "barkas-salala" | "moghal-pura";

export interface BranchOption {
  id: BranchFilter;
  title: string;
  subtitle: string;
  locationNote: string;
}

export const BRANCH_OPTIONS_EN: BranchOption[] = [
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

export const BRANCH_OPTIONS_AR: BranchOption[] = [
  {
    id: "all",
    title: "كافة الفروع",
    subtitle: "بركاس صلالة ومغل بورا",
    locationNote: "جميع شقق حيدر أباد",
  },
  {
    id: "barkas-salala",
    title: "بركاس صلالة",
    subtitle: "بالقرب من شاندريانجونا وطريق المطار",
    locationNote: "شقق فسيحة ٣ غرف وصالة",
  },
  {
    id: "moghal-pura",
    title: "مغل بورة",
    subtitle: "بالقرب من تشارمينار والمدينة القديمة",
    locationNote: "شقق ١ و٢ و٤ غرف وصالة",
  },
];

export const BRANCH_OPTIONS = BRANCH_OPTIONS_EN;

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
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const isAr = currentLocale === "ar";
  const branchOptions = isAr ? BRANCH_OPTIONS_AR : BRANCH_OPTIONS_EN;

  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-raised/95 backdrop-blur-xl border border-line text-fg shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none",
        isMobileModal ? "p-4 max-w-full" : "p-3 sm:p-4 max-w-[340px] sm:max-w-[360px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-line-soft">
        <div>
          <span className="text-xs font-sans font-semibold tracking-wider uppercase text-gold">
            {isAr ? "اختر الموقع" : "Select Location"}
          </span>
          <h3 className="text-sm font-sans font-semibold tracking-wide text-fg">
            {isAr ? "فروع فلاتيل في حيدر أباد" : "Our Hyderabad Branches"}
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25">
          {isAr ? "فرعان رئيسيان" : "2 Active Locations"}
        </span>
      </div>

      {/* Options List */}
      <div className="space-y-1.5" role="radiogroup" aria-label={isAr ? "اختر فرع فلاتيل" : "Select FLATEL Branch"}>
        {branchOptions.map((branch) => {
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
                "w-full p-3 rounded-xl text-left rtl:text-right flex items-start justify-between gap-3 transition-all duration-150 cursor-pointer",
                isSelected
                  ? "bg-surface/90 border border-gold shadow-xs"
                  : "bg-raised/50 hover:bg-raised-hover/70 border border-line-soft text-fg-muted"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 p-1.5 rounded-lg border shrink-0 transition-colors",
                    isSelected
                      ? "border-gold/50 bg-gold/15 text-gold"
                      : "border-line-soft bg-surface/60 text-fg-muted"
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div
                    className={cn(
                      "font-sans text-sm font-medium tracking-wide",
                      isSelected ? "text-fg" : "text-fg/90"
                    )}
                  >
                    {branch.title}
                  </div>
                  <div className="text-xs font-sans text-fg-muted mt-0.5">
                    {branch.subtitle}
                  </div>
                  <div className="text-xs font-sans text-gold mt-0.5">
                    {branch.locationNote}
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
      {selectedBranch !== null && (
        <div className="pt-2.5 mt-2.5 border-t border-line-soft flex justify-end">
          <button
            type="button"
            onClick={() => {
              onSelectBranch(null);
              if (onClose) onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-gold transition-colors py-1 px-2 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isAr ? "إعادة ضبط الفرع" : "Reset branch"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
