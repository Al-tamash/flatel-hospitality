"use client";

import * as React from "react";
import { HeartPulse, Compass, Briefcase, Users2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const STAY_PURPOSES = [
  {
    id: "all",
    title: "Any Stay Purpose",
    description: "Standard residential accommodation with hotel-level care.",
    contextTag: "All Stays & Travelers",
    icon: Sparkles,
  },
  {
    id: "medical",
    title: "Hospital & Medical Stay",
    description: "For patients and family attendants visiting nearby hospitals.",
    contextTag: "Apollo, Yashoda, KIMS & Owaisi Hospital Proximity",
    icon: HeartPulse,
  },
  {
    id: "tourism",
    title: "Tourism & Heritage (Wanderer)",
    description: "For vacationers exploring Charminar and historic Hyderabad.",
    contextTag: "Charminar, Old City Heritage & Laad Bazaar",
    icon: Compass,
  },
  {
    id: "corporate",
    title: "Corporate & Executive Stay",
    description: "For business professionals requiring quiet workspace & Wi-Fi.",
    contextTag: "High-Speed Wi-Fi & Automated GST Tax Invoices",
    icon: Briefcase,
  },
  {
    id: "family",
    title: "Family Vacation & Long Stay",
    description: "For large families, weddings, and extended holiday visits.",
    contextTag: "Spacious Multi-BHK Suites with Kitchen & Cot",
    icon: Users2,
  },
] as const;

export type StayPurposeId = (typeof STAY_PURPOSES)[number]["id"];

interface StayPurposeSelectorProps {
  selectedPurpose: StayPurposeId | null;
  onSelectPurpose: (purpose: StayPurposeId) => void;
  onClose?: () => void;
  className?: string;
  isMobileModal?: boolean;
}

export function StayPurposeSelector({
  selectedPurpose,
  onSelectPurpose,
  onClose,
  className,
  isMobileModal = false,
}: StayPurposeSelectorProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-[rgba(34,24,16,0.95)] backdrop-blur-xl border border-[rgba(212,163,89,0.28)] text-[#FAF4EB] shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none",
        isMobileModal
          ? "p-5 max-w-full"
          : "p-4 sm:p-5 max-w-[340px] sm:max-w-[380px]",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,89,0.18)]">
        <div>
          <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#E5C178]">
            Purpose of Stay
          </span>
          <h3 className="text-sm font-sans font-semibold tracking-wide text-[#FAF4EB]">
            Tailor Your Flatel Experience
          </h3>
        </div>
        <span className="text-[11px] font-sans text-[#E5C178] font-medium">
          Complimentary Extras
        </span>
      </div>

      <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
        {STAY_PURPOSES.map((item) => {
          const isSelected = (selectedPurpose || "all") === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectPurpose(item.id);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full p-2.5 rounded-xl border text-left transition-all duration-150 flex items-start gap-2.5 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] cursor-pointer",
                isSelected
                  ? "bg-[rgba(22,16,11,0.9)] border-[#E5C178] text-[#FAF4EB] shadow-xs"
                  : "bg-[rgba(34,24,16,0.5)] border-[rgba(212,163,89,0.15)] hover:border-[#E5C178]/50 hover:bg-[rgba(45,32,22,0.7)] text-[#B8A692]"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg mt-0.5 shrink-0 transition-colors",
                  isSelected
                    ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08]"
                    : "bg-[rgba(22,16,11,0.6)] text-[#E5C178] group-hover:bg-[#E5C178]/20"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={cn(
                      "font-sans text-xs sm:text-[13px] font-medium tracking-wide",
                      isSelected
                        ? "text-[#FAF4EB]"
                        : "text-[#FAF4EB] group-hover:text-[#E5C178]"
                    )}
                  >
                    {item.title}
                  </span>
                  {isSelected && (
                    <span className="h-4 w-4 rounded-full bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  )}
                </div>

                <p className="font-sans text-[11px] text-[#B8A692] mt-0.5 leading-snug line-clamp-1">
                  {item.description}
                </p>

                <span className="inline-block mt-0.5 text-[9.5px] font-mono tracking-wide text-[#E5C178]">
                  {item.contextTag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
