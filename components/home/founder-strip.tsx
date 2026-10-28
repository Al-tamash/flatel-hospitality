import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAboutContent } from "@/lib/about-content";
import { FounderPortrait } from "@/components/about/founder-card";

/** Slim homepage teaser: one-line mission, founder, link to the full story. */
export function FounderStrip({ locale }: { locale: "en" | "ar" }) {
  const content = getAboutContent(locale);
  const href = locale === "ar" ? "/ar/about" : "/about";

  return (
    <section className="w-full bg-[#0E0A07] py-10 sm:py-12" aria-label={content.founder.eyebrow}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.85)] px-5 py-6 sm:px-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <p className="flex-1 font-heading text-xl sm:text-2xl text-[#FAF4EB] leading-snug text-center md:text-start">
            {content.strip.mission}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <FounderPortrait size={56} name={content.founder.name} />
            <div className="text-start">
              <p className="font-heading text-lg text-[#FAF4EB] leading-tight">{content.founder.name}</p>
              <p className="text-xs text-[#E5C178]">{content.founder.role}</p>
            </div>
          </div>
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] text-sm font-semibold text-[#E5C178] transition-colors"
          >
            <span>{content.strip.cta}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
