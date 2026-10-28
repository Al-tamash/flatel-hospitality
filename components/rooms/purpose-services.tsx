"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Check, Gift, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ARABIC_COMPLIMENTARY_NAMES,
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
        <h3 className="font-heading text-lg sm:text-xl font-normal text-[#FAF4EB]">
          {isAr ? "ما سبب زيارتك إلى حيدر أباد؟" : "What brings you to Hyderabad?"}
        </h3>
        <p className="text-xs text-[#B8A692] mt-0.5">
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
                  ? "bg-[#E5C178] text-[#140E08] border-[#E5C178]"
                  : "bg-[rgba(34,24,16,0.65)] text-[#FAF4EB] border-[rgba(212,163,89,0.3)] hover:border-[#E5C178]"
              )}
            >
              {getPurposeChipLabel(id, locale)}
            </button>
          );
        })}
      </div>

      {purpose && services && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(34,24,16,0.65)] p-4 space-y-3">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E5C178]">
              <Gift className="w-4 h-4" />
              <span>
                {isAr
                  ? `مجاناً مع إقامة ${getPurposeChipLabel(purpose, locale)}`
                  : `Free with your ${getPurposeChipLabel(purpose, locale)} stay`}
              </span>
            </h4>
            <ul className="space-y-2">
              {services.free.map((service) => (
                <li key={service.name} className="flex items-start gap-2 text-xs text-[#FAF4EB]">
                  <Check className="w-3.5 h-3.5 text-[#E5C178] shrink-0 mt-0.5" />
                  <span>
                    {(isAr && ARABIC_COMPLIMENTARY_NAMES[service.name]) || service.name}
                    {service.disclaimer && !isAr && (
                      <span className="block text-[11px] text-[#B8A692] mt-0.5">{service.disclaimer}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {services.paid.length > 0 && (
            <div
              id="purpose-addons"
              className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(34,24,16,0.65)] p-4 space-y-3 scroll-mt-28"
            >
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E5C178]">
                <Plus className="w-4 h-4" />
                <span>{isAr ? "خدمات إضافية" : "Add-on services"}</span>
              </h4>
              <ul className="space-y-2">
                {services.paid.map((addon) => {
                  const checked = selectedAddonIds.includes(addon.id);
                  return (
                    <li key={addon.id}>
                      <label
                        className={cn(
                          "flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors",
                          checked
                            ? "bg-[#E5C178]/15 border-[#E5C178] text-[#FAF4EB]"
                            : "bg-[#16100B] border-[rgba(212,163,89,0.2)] text-[#D4C4B3] hover:border-[#E5C178]/50"
                        )}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleAddon(addon.id)}
                            className="w-4 h-4 accent-[#E5C178] shrink-0 cursor-pointer"
                          />
                          <span className="font-medium">
                            {(isAr && ARABIC_ADDONS_TRANSLATION[addon.id]) || addon.name}
                          </span>
                        </span>
                        <span className="font-bold text-[#E5C178] tabular-nums shrink-0">+{priceLabel(addon)}</span>
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
