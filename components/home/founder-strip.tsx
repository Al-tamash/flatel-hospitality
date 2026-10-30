import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAboutContent } from "@/lib/about-content";
import { FounderPortrait } from "@/components/about/founder-card";

/** Slim homepage teaser: one-line mission, founder, link to the full story. */
export function FounderStrip({ locale }: { locale: "en" | "ar" }) {
  const content = getAboutContent(locale);
  const href = locale === "ar" ? "/ar/about" : "/about";

  return (
    <section className="w-full bg-canvas py-10 sm:py-12" aria-label={content.founder.eyebrow}>
      <div className="container-page">
        <div className="border-y border-line py-8 sm:py-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <p className="flex-1 font-heading text-xl sm:text-2xl text-fg leading-snug text-center md:text-start">
            {content.strip.mission}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <FounderPortrait size={56} name={content.founder.name} />
            <div className="text-start">
              <p className="font-heading text-lg text-fg leading-tight">{content.founder.name}</p>
              <p className="text-xs text-gold">{content.founder.role}</p>
            </div>
          </div>
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl border border-line-strong hover:border-gold text-sm font-semibold text-gold transition-colors"
          >
            <span>{content.strip.cta}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
