"use client";

import * as React from "react";
import {
  HeartPulse,
  Compass,
  Briefcase,
  UsersRound,
  Check,
  Plus,
} from "lucide-react";
import { PURPOSE_PACKAGES, PurposePackage } from "@/lib/mock-rooms";
import { cn } from "@/lib/utils";

interface PurposeAddonsProps {
  selectedPurposeId: "medical" | "tourism" | "corporate" | "family";
  onSelectPurpose: (purposeId: "medical" | "tourism" | "corporate" | "family") => void;
  selectedAddonIds: string[];
  onToggleAddon: (addonId: string) => void;
}

const PURPOSE_TABS = [
  { id: "medical", label: "Medical / Healthcare", icon: HeartPulse },
  { id: "tourism", label: "Tourism & Heritage", icon: Compass },
  { id: "corporate", label: "Corporate & Business", icon: Briefcase },
  { id: "family", label: "Family Vacation", icon: UsersRound },
] as const;

export function PurposeAddons({
  selectedPurposeId,
  onSelectPurpose,
  selectedAddonIds,
  onToggleAddon,
}: PurposeAddonsProps) {
  const currentPackage: PurposePackage =
    PURPOSE_PACKAGES.find((p) => p.id === selectedPurposeId) || PURPOSE_PACKAGES[0];

  return (
    <div
      id="stay-purpose-sec"
      className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm"
    >
      <div>
        <h3 className="font-heading text-xl sm:text-2xl font-normal text-[#FAF4EB] tracking-[-0.01em]">
          Personalise Your Stay
        </h3>
        <p className="text-xs text-[#B8A692] font-sans mt-0.5 leading-[1.6]">
          Select your visit focus to unlock tailored complimentary care and optional arrangements.
        </p>
      </div>

      {/* 4 Sleek Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {PURPOSE_TABS.map((tab) => {
          const isSelected = tab.id === selectedPurposeId;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectPurpose(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer",
                isSelected
                  ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-semibold shadow-xs scale-102"
                  : "bg-[#16100B] border border-[rgba(212,163,89,0.22)] text-[#B8A692] hover:text-[#FAF4EB] hover:border-[#E5C178]/50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Curated Box */}
      <div className="p-4 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.22)] space-y-3">
        {/* Complimentary inclusions list */}
        <div>
          <span className="text-[11px] uppercase font-sans font-medium tracking-[0.18em] text-[#34D399] block mb-2">
            Complimentary with your stay ({currentPackage.name.split(" ")[0]}):
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(currentPackage.complimentaryServices || []).slice(0, 5).map((service) => (
              <span
                key={service.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(34,24,16,0.7)] border border-[rgba(212,163,89,0.18)] text-[#FAF4EB] text-[11px] font-sans"
              >
                <Check className="w-3 h-3 text-[#34D399] shrink-0" />
                <span>{service.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Optional Add-ons */}
        {currentPackage.paidAddons.length > 0 && (
          <div className="pt-2 border-t border-[rgba(212,163,89,0.18)]">
            <span className="text-[11px] uppercase font-sans font-medium tracking-[0.18em] text-[#E5C178] block mb-2">
              Optional Add-ons:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentPackage.paidAddons.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                const isNumeric = typeof addon.price === "number";

                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => onToggleAddon(addon.id)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-sans transition-colors cursor-pointer",
                      isChecked
                        ? "border-[#E5C178] bg-[#E5C178]/15 text-[#FAF4EB] font-semibold"
                        : "border-[rgba(212,163,89,0.2)] bg-[rgba(34,24,16,0.7)] text-[#B8A692] hover:text-[#FAF4EB]"
                    )}
                  >
                    {isChecked ? (
                      <Check className="w-3.5 h-3.5 text-[#E5C178] shrink-0" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[#B8A692] shrink-0" />
                    )}
                    <span>{addon.name}</span>
                    <span className="text-[#E5C178] oldstyle-nums text-[10px]">
                      {isNumeric
                        ? addon.pricingType === "per_night"
                          ? `(₹${addon.price}/n)`
                          : `(₹${addon.price})`
                        : "(On Request)"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
