"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CALCULATOR_RATES,
  MEMBERSHIP,
  calculateMembershipSavings,
  type MembershipContent,
} from "@/lib/membership/membership-content";

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 60;

const inr = (value: number) => `₹${Math.abs(value).toLocaleString("en-IN")}`;

/** Lets a guest see, for their own stay pattern, how quickly the ₹777 pays back. */
export function SavingsCalculator({ content }: { content: MembershipContent["calculator"] }) {
  const [flatId, setFlatId] = React.useState<(typeof CALCULATOR_RATES)[number]["id"]>("1bhk");
  const [nights, setNights] = React.useState(7);

  const flat = CALCULATOR_RATES.find((item) => item.id === flatId) ?? CALCULATOR_RATES[0];
  const result = calculateMembershipSavings(flat.perNight, nights);
  const isPositive = result.netBenefit >= 0;

  return (
    <div className="rounded-2xl border border-[rgba(212,163,89,0.3)] bg-[rgba(22,16,11,0.85)] p-5 sm:p-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="space-y-6">
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8A692] mb-2">
              {content.flatLabel}
            </legend>
            <div className="flex flex-wrap gap-2">
              {CALCULATOR_RATES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFlatId(item.id)}
                  aria-pressed={item.id === flatId}
                  className={cn(
                    "min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer",
                    item.id === flatId
                      ? "border-[#E5C178] bg-[#E5C178]/15 text-[#E5C178]"
                      : "border-[rgba(212,163,89,0.25)] text-[#D4C4B3] hover:border-[#E5C178]/60"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="membership-nights" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8A692]">
                {content.nightsLabel}
              </label>
              <span className="font-mono text-lg font-bold text-[#FAF4EB]">
                {nights} <span className="text-xs font-normal text-[#B8A692]">{content.nightsUnit}</span>
              </span>
            </div>
            <input
              id="membership-nights"
              type="range"
              min={MIN_NIGHTS}
              max={MAX_NIGHTS}
              value={nights}
              onChange={(event) => setNights(Number(event.target.value))}
              className="w-full accent-[#E5C178] cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#B8A692] font-mono">
              <span>{MIN_NIGHTS}</span>
              <span>{MAX_NIGHTS}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4" aria-live="polite">
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#D4C4B3]">{content.youSave}</dt>
              <dd className="font-mono font-semibold text-[#FAF4EB]">{inr(result.totalSavings)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#D4C4B3]">{content.membershipCost}</dt>
              <dd className="font-mono font-semibold text-[#FAF4EB]">− {inr(MEMBERSHIP.price)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-[rgba(212,163,89,0.25)] pt-3">
              <dt className="font-semibold text-[#FAF4EB]">{content.netBenefit}</dt>
              <dd
                className={cn(
                  "font-mono text-2xl font-bold",
                  isPositive ? "text-[#E5C178]" : "text-[#D4C4B3]"
                )}
              >
                {isPositive ? "+" : "−"}
                {inr(result.netBenefit)}
              </dd>
            </div>
          </dl>
          <p className="rounded-xl bg-[#E5C178]/10 border border-[#E5C178]/30 px-4 py-3 text-sm text-[#FAF4EB] leading-relaxed">
            {(isPositive ? content.paysForItself : content.notYet).replace("{n}", String(result.breakEvenNights))}
          </p>
        </div>
      </div>
      <p className="mt-5 text-[11px] text-[#B8A692]">{content.footnote}</p>
    </div>
  );
}
