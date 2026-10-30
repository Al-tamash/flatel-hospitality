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
      className="rounded-2xl border border-line bg-raised/65 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-sm"
    >
      <div>
        <h3 className="font-heading text-xl sm:text-2xl font-normal text-fg">
          Personalise Your Stay
        </h3>
        <p className="text-xs text-fg-muted font-sans mt-0.5 leading-[1.6]">
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
                  ? "bg-gradient-to-r from-gold to-gold-deep text-ink font-semibold shadow-xs scale-102"
                  : "bg-surface border border-line text-fg-muted hover:text-fg hover:border-gold/50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Curated Box */}
      <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
        {/* Complimentary inclusions list */}
        <div>
          <span className="text-xs uppercase font-sans font-medium tracking-[0.18em] text-success block mb-2">
            Complimentary with your stay ({currentPackage.name.split(" ")[0]}):
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(currentPackage.complimentaryServices || []).slice(0, 5).map((service) => (
              <span
                key={service.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-raised/70 border border-line-soft text-fg text-xs font-sans"
              >
                <Check className="w-3 h-3 text-success shrink-0" />
                <span>{service.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Optional Add-ons */}
        {currentPackage.paidAddons.length > 0 && (
          <div className="pt-2 border-t border-line-soft">
            <span className="text-xs uppercase font-sans font-medium tracking-[0.18em] text-gold block mb-2">
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
                        ? "border-gold bg-gold/15 text-fg font-semibold"
                        : "border-line-soft bg-raised/70 text-fg-muted hover:text-fg"
                    )}
                  >
                    {isChecked ? (
                      <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-fg-muted shrink-0" />
                    )}
                    <span>{addon.name}</span>
                    <span className="text-gold oldstyle-nums text-xs">
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
