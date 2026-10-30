import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Starlight } from "@/components/effects/starlight";
import { MembershipCard } from "@/components/membership/membership-card";
import { MembershipPlans } from "@/components/membership/membership-plans";
import { WHATSAPP_CONFIG } from "@/lib/constants";
import { getCardContent, getMembershipContent } from "@/lib/membership/membership-content";

/** The Flatel O Signature Membership showcase: both cards, join form, steps and FAQ. */
export function MembershipPageView({ locale }: { locale: "en" | "ar" }) {
  const content = getMembershipContent(locale);
  const joinUrl = WHATSAPP_CONFIG.getUrl(content.whatsappMessage);
  const propertiesHref = locale === "ar" ? "/ar/properties" : "/properties";

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-canvas border-b border-line-soft">
        <Starlight seed={77} density={120} />
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[460px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_16%,transparent)_0%,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative z-10 container-page py-14 sm:py-20 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-start">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-line-strong text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              <Sparkles className="w-3.5 h-3.5" />
              {content.eyebrow}
            </span>
            <h1 className="font-heading text-fg heading-hero">
              {content.headlineLead} <span className="italic text-gold">{content.headlineAccent}</span>
            </h1>
            <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-fg-soft leading-relaxed">
              {content.intro}
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-sm shadow-md shadow-gold/25 hover:brightness-105 transition"
              >
                {content.cta}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 lg:items-end">
            <MembershipCard content={getCardContent(content, "platinum")} className="max-w-[380px]" />
            <MembershipCard content={getCardContent(content, "golden")} className="max-w-[380px] lg:-me-6" />
          </div>
        </div>
      </section>

      <MembershipPlans content={content} locale={locale} whatsappUrl={joinUrl} propertiesHref={propertiesHref} />

      {/* How it works */}
      <section className="w-full bg-canvas py-16 sm:py-20" aria-labelledby="membership-how">
        <div className="container-page">
          <h2 id="membership-how" className="font-heading text-fg text-center mb-10 heading-section">
            {content.howHeading}
          </h2>
          <ol data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.steps.map((step, index) => (
              <li
                key={step.title}
                className="border-t border-line pt-6 space-y-2"
              >
                <span className="font-mono text-sm font-bold text-gold">0{index + 1}</span>
                <h3 className="font-heading text-xl text-fg font-semibold">{step.title}</h3>
                <p className="text-sm text-fg-soft leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-surface py-16 sm:py-20" aria-labelledby="membership-faq">
        <div className="container-page">
          <div>
          <h2 id="membership-faq" className="font-heading text-fg text-center mb-8 heading-section">
            {content.faqHeading}
          </h2>
          <div className="divide-y divide-line-soft border-y border-line">
            {content.faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-fg font-semibold">
                  {faq.q}
                  <span aria-hidden="true" className="text-gold transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm text-fg-soft leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-fg-muted">{content.terms}</p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="w-full bg-canvas py-14 text-center border-t border-line-soft">
        <div className="mx-auto max-w-xl px-4 space-y-4">
          <a
            href="#plans"
            className="inline-flex items-center gap-2 px-7 min-h-[48px] rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-sm shadow-md shadow-gold/25 hover:brightness-105 transition"
          >
            {content.cta}
          </a>
          <div>
            <Link href={propertiesHref} className="text-sm text-gold hover:underline">
              {locale === "ar" ? "تصفح الشقق" : "Browse the flats"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
