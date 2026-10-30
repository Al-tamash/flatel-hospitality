"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Check, Gift, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ARABIC_COMPLIMENTARY_NAMES,
  getServiceDisclaimer,
  PURPOSE_IDS,
  getPurposeChipLabel,
  getPurposeServices,
  isPurposeId,
  type PurposeId,
} from "@/lib/purpose/purpose-services";
import type { FacilityAddon } from "@/lib/mock-rooms";
import { ARABIC_ADDONS_TRANSLATION } from "@/components/rooms/booking-sidebar";

interface PurposeServicesProps {
  selectedPurposeId: string | null;
  selectedAddonIds: string[];
  onSelectPurpose(id: PurposeId | "accommodation_only"): void;
  onToggleAddon(id: string): void;
}

const CHIP_IDS = [...PURPOSE_IDS, "accommodation_only"] as const;

/** Purpose picker, then that purpose's free and paid services. */
export function PurposeServices({
  selectedPurposeId,
  selectedAddonIds,
  onSelectPurpose,
  onToggleAddon,
}: PurposeServicesProps) {
  const isAr = usePathname()?.startsWith("/ar") ?? false;
  const locale = isAr ? "ar" : "en";
  const purpose = isPurposeId(selectedPurposeId) ? selectedPurposeId : null;
  const services = purpose ? getPurposeServices(purpose) : null;

  const priceLabel = (addon: FacilityAddon) => {
    if (addon.price === null) return isAr ? "حسب الطلب" : "On quote";
    const amount = `₹${addon.price.toLocaleString("en-IN")}`;
    const perNight = addon.type === "per_night" || addon.pricingType === "per_night";
    return perNight ? `${amount}${isAr ? " / ليلة" : " / night"}` : amount;
  };

  return (
    <div id="purpose-services" className="space-y-4 scroll-mt-28">
      <div>
        <h2 className="font-heading text-fg heading-sub">
          {isAr ? "ما سبب زيارتك إلى حيدر أباد؟" : "What brings you to Hyderabad?"}
        </h2>
        <p className="text-xs text-fg-muted mt-0.5">
          {isAr
            ? "اختر الغرض من إقامتك لعرض الخدمات المجانية والإضافية المناسبة لك."
            : "Pick your reason for travelling to see the free and add-on services that come with it."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={isAr ? "الغرض من الإقامة" : "Stay purpose"}>
        {CHIP_IDS.map((id) => {
          const active = (selectedPurposeId || "accommodation_only") === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelectPurpose(id)}
              className={cn(
                "px-3.5 min-h-[40px] rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                active
                  ? "bg-gold text-ink border-gold"
                  : "bg-raised/65 text-fg border-line hover:border-gold"
              )}
            >
              {getPurposeChipLabel(id, locale)}
            </button>
          );
        })}
      </div>

      {purpose && services && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div className="border-t border-line pt-4 space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              <Gift className="w-4 h-4" />
              <span>
                {isAr
                  ? `مجاناً مع إقامة ${getPurposeChipLabel(purpose, locale)}`
                  : `Free with your ${getPurposeChipLabel(purpose, locale)} stay`}
              </span>
            </h3>
            <ul className="space-y-2">
              {services.free.map((service) => (
                <li key={service.name} className="flex items-start gap-2 text-xs text-fg">
                  <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span>
                    {(isAr && ARABIC_COMPLIMENTARY_NAMES[service.name]) || service.name}
                    {service.disclaimer && (
                      <span className="block text-xs text-fg-muted mt-0.5">{getServiceDisclaimer(service, locale)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {services.paid.length > 0 && (
            <div
              id="purpose-addons"
              className="border-t border-line pt-4 space-y-3 scroll-mt-28"
            >
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                <Plus className="w-4 h-4" />
                <span>{isAr ? "خدمات إضافية" : "Add-on services"}</span>
              </h3>
              <ul className="space-y-2">
                {services.paid.map((addon) => {
                  const checked = selectedAddonIds.includes(addon.id);
                  return (
                    <li key={addon.id}>
                      <label
                        className={cn(
                          "flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors",
                          checked
                            ? "bg-gold/15 border-gold text-fg"
                            : "bg-surface border-line-soft text-fg-soft hover:border-gold/50"
                        )}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleAddon(addon.id)}
                            className="w-4 h-4 accent-gold shrink-0 cursor-pointer"
                          />
                          <span className="font-medium">
                            {(isAr && ARABIC_ADDONS_TRANSLATION[addon.id]) || addon.name}
                          </span>
                        </span>
                        <span className="font-bold text-gold tabular-nums shrink-0">+{priceLabel(addon)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
