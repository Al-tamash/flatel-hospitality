import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MembershipCard } from "@/components/membership/membership-card";
import { getCardContent, getMembershipContent } from "@/lib/membership/membership-content";

/** Homepage teaser for the Flatel O Signature Membership: the cards, one line of value, link to the full page. */
export function MembershipStrip({ locale }: { locale: "en" | "ar" }) {
  const content = getMembershipContent(locale);
  const href = locale === "ar" ? "/ar/membership" : "/membership";

  return (
    <section className="w-full bg-canvas py-10 sm:py-14" aria-label={content.eyebrow}>
      <div className="container-page">
        <div className="rounded-2xl border border-line bg-surface/85 px-5 py-8 sm:px-10 grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] items-center">
          <div className="flex justify-center md:justify-start">
            <MembershipCard content={getCardContent(content, "platinum")} className="max-w-[320px]" />
          </div>
          <div className="space-y-4 text-center md:text-start">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{content.eyebrow}</p>
            <h2 className="font-heading text-fg heading-section">{content.strip.title}</h2>
            <p className="text-sm sm:text-base text-fg-soft leading-relaxed">{content.strip.body}</p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl border border-line-strong hover:border-gold text-sm font-semibold text-gold transition-colors"
            >
              <span>{content.strip.cta}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
