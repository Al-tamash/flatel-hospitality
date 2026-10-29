import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Gift,
  Headset,
  Moon,
  Percent,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Starlight } from "@/components/effects/starlight";
import { MembershipCard } from "@/components/membership/membership-card";
import { JoinForm } from "@/components/membership/join-form";
import { SavingsCalculator } from "@/components/membership/savings-calculator";
import { WHATSAPP_CONFIG } from "@/lib/constants";
import { getMembershipContent, type BenefitIcon } from "@/lib/membership/membership-content";

const ICONS: Record<BenefitIcon, LucideIcon> = {
  percent: Percent,
  moon: Moon,
  clock: Clock,
  headset: Headset,
  calendar: CalendarClock,
  gift: Gift,
  tag: Tag,
};

/** The ₹777 Flatel Membership showcase: card, benefits, savings calculator, steps and FAQ. */
export function MembershipPageView({ locale }: { locale: "en" | "ar" }) {
  const content = getMembershipContent(locale);
  const joinUrl = WHATSAPP_CONFIG.getUrl(content.whatsappMessage);
  const propertiesHref = locale === "ar" ? "/ar/properties" : "/properties";

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[#0B0805] border-b border-[rgba(212,163,89,0.18)]">
        <Starlight seed={77} density={120} />
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[460px] bg-[radial-gradient(ellipse_at_top,rgba(212,163,89,0.16)_0%,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-14 sm:py-20 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-start">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(212,163,89,0.4)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5C178]">
              <Sparkles className="w-3.5 h-3.5" />
              {content.eyebrow}
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-[#FAF4EB] font-normal leading-[1.05]">
              {content.headlineLead} <span className="italic text-[#E5C178]">{content.headlineAccent}</span>
            </h1>
            <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-[#D4C4B3] leading-relaxed">
              {content.intro}
            </p>
            <div className="flex items-baseline justify-center lg:justify-start gap-3">
              <span className="font-mono text-4xl sm:text-5xl font-bold text-[#E5C178]">{content.priceLabel}</span>
              <span className="text-sm text-[#B8A692]">{content.priceNote}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <a
                href="#join"
                className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm shadow-md shadow-[#E5C178]/25 hover:brightness-105 transition"
              >
                {content.cta}
              </a>
              <a
                href="#savings"
                className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-xl border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] text-[#E5C178] font-semibold text-sm transition-colors"
              >
                {content.ctaSecondary}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <MembershipCard content={content} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full bg-[#0E0A07] py-16 sm:py-20" aria-labelledby="membership-benefits">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <h2 id="membership-benefits" className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium">
              {content.benefitsHeading}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D4C4B3]">{content.benefitsSub}</p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.benefits.map((benefit) => {
              const Icon = ICONS[benefit.icon];
              return (
                <li
                  key={benefit.title}
                  className="rounded-2xl border border-[rgba(212,163,89,0.22)] bg-[rgba(22,16,11,0.8)] p-6 space-y-3 hover:border-[#E5C178]/55 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl border border-[rgba(212,163,89,0.45)] bg-[#E5C178]/10 flex items-center justify-center text-[#E5C178]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-xl text-[#FAF4EB] font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-[#D4C4B3] leading-relaxed">{benefit.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Savings calculator */}
      <section id="savings" className="w-full bg-[#120D09] py-16 sm:py-20 scroll-mt-24" aria-labelledby="membership-savings">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 id="membership-savings" className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium">
              {content.calculator.heading}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D4C4B3]">{content.calculator.sub}</p>
          </div>
          <SavingsCalculator content={content.calculator} />
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-[#0E0A07] py-16 sm:py-20" aria-labelledby="membership-how">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 id="membership-how" className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium text-center mb-10">
            {content.howHeading}
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[rgba(212,163,89,0.22)] bg-[rgba(22,16,11,0.8)] p-6 space-y-2"
              >
                <span className="font-mono text-sm font-bold text-[#E5C178]">0{index + 1}</span>
                <h3 className="font-heading text-xl text-[#FAF4EB] font-semibold">{step.title}</h3>
                <p className="text-sm text-[#D4C4B3] leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Join */}
      <section id="join" className="w-full bg-[#0E0A07] py-16 sm:py-20 scroll-mt-24" aria-labelledby="membership-join">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 id="membership-join" className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium">
              {content.join.heading}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D4C4B3]">{content.join.sub}</p>
          </div>
          <div className="rounded-2xl border border-[rgba(212,163,89,0.3)] bg-[rgba(22,16,11,0.85)] p-5 sm:p-8">
            <JoinForm content={content} locale={locale} whatsappUrl={joinUrl} propertiesHref={propertiesHref} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-[#120D09] py-16 sm:py-20" aria-labelledby="membership-faq">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="membership-faq" className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium text-center mb-8">
            {content.faqHeading}
          </h2>
          <div className="divide-y divide-[rgba(212,163,89,0.18)] border-y border-[rgba(212,163,89,0.22)]">
            {content.faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[#FAF4EB] font-semibold">
                  {faq.q}
                  <span aria-hidden="true" className="text-[#E5C178] transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#D4C4B3] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[#B8A692]">{content.terms}</p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="w-full bg-[#0E0A07] py-14 text-center border-t border-[rgba(212,163,89,0.18)]">
        <div className="mx-auto max-w-xl px-4 space-y-4">
          <a
            href="#join"
            className="inline-flex items-center gap-2 px-7 min-h-[48px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm shadow-md shadow-[#E5C178]/25 hover:brightness-105 transition"
          >
            {content.cta}
          </a>
          <div>
            <Link href={propertiesHref} className="text-sm text-[#E5C178] hover:underline">
              {locale === "ar" ? "تصفح الشقق" : "Browse the flats"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
