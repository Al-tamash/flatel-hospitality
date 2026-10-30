"use client";

import * as React from "react";
import { Check, Clock, Gift, Headset, Percent, Plane, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { JoinForm } from "@/components/membership/join-form";
import {
  MEMBERSHIP_TIER_IDS,
  type BenefitIcon,
  type MembershipContent,
  type MembershipTierId,
} from "@/lib/membership/membership-content";

const ICONS: Record<BenefitIcon, LucideIcon> = {
  percent: Percent,
  plane: Plane,
  clock: Clock,
  gift: Gift,
  headset: Headset,
};

interface MembershipPlansProps {
  content: MembershipContent;
  locale: "en" | "ar";
  whatsappUrl: string;
  propertiesHref: string;
}

/** The two cards side by side, then the join form for whichever one is selected. */
export function MembershipPlans({ content, locale, whatsappUrl, propertiesHref }: MembershipPlansProps) {
  const [tier, setTier] = React.useState<MembershipTierId>("golden");

  const choose = (id: MembershipTierId) => {
    setTier(id);
    document.getElementById("join")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section id="plans" className="w-full bg-canvas py-16 sm:py-20 scroll-mt-24" aria-labelledby="membership-plans">
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <h2 id="membership-plans" className="font-heading text-fg heading-section">
              {content.plansHeading}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-fg-soft">{content.plansSub}</p>
          </div>

          <div data-stagger className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MEMBERSHIP_TIER_IDS.map((id) => {
              const plan = content.tiers[id];
              const isSelected = id === tier;
              return (
                <article
                  key={id}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-surface/85 p-6 sm:p-7 card-lift",
                    isSelected ? "border-gold" : "border-line"
                  )}
                >
                  <h3 className="font-heading text-2xl sm:text-3xl text-fg font-medium">{plan.name}</h3>
                  <p className="mt-1 text-sm text-fg-soft">{plan.tagline}</p>

                  <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-4xl font-bold text-gold">{plan.price}</span>
                    <span className="font-mono text-lg text-fg-muted line-through decoration-fg-muted/70">{plan.listPrice}</span>
                    <span className="text-xs text-fg-muted">{plan.priceNote}</span>
                  </div>

                  <ul className="mt-6 space-y-4 flex-1">
                    {plan.benefits.map((benefit) => {
                      const Icon = ICONS[benefit.icon];
                      return (
                        <li key={benefit.title} className="flex gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-gold/10 text-gold">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-fg">{benefit.title}</p>
                            <p className="mt-0.5 text-sm text-fg-soft leading-relaxed">{benefit.body}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    onClick={() => choose(id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "mt-7 inline-flex w-full items-center justify-center gap-2 min-h-[48px] rounded-xl font-bold text-sm transition cursor-pointer",
                      isSelected
                        ? "bg-gradient-to-r from-gold to-gold-deep text-ink shadow-md shadow-gold/25 hover:brightness-105"
                        : "border border-line-strong text-gold hover:border-gold"
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {isSelected ? content.selected : plan.choose}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="join" className="w-full bg-surface py-16 sm:py-20 scroll-mt-24" aria-labelledby="membership-join">
        <div className="container-page">
          <div className="text-center mb-8">
            <h2 id="membership-join" className="font-heading text-fg heading-section">
              {content.join.heading}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-fg-soft">{content.join.sub}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface/85 p-5 sm:p-8">
            <JoinForm
              content={content}
              locale={locale}
              whatsappUrl={whatsappUrl}
              propertiesHref={propertiesHref}
              tier={tier}
              onTierChange={setTier}
            />
          </div>
        </div>
      </section>
    </>
  );
}
