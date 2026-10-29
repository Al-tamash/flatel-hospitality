import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MembershipCard } from "@/components/membership/membership-card";
import { getMembershipContent } from "@/lib/membership/membership-content";

/** Homepage teaser for the ₹777 membership: the card, one line of value, link to the full page. */
export function MembershipStrip({ locale }: { locale: "en" | "ar" }) {
  const content = getMembershipContent(locale);
  const href = locale === "ar" ? "/ar/membership" : "/membership";

  return (
    <section className="w-full bg-[#0E0A07] py-10 sm:py-14" aria-label={content.eyebrow}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.85)] px-5 py-8 sm:px-10 grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] items-center">
          <div className="flex justify-center md:justify-start">
            <MembershipCard content={content} className="max-w-[320px]" />
          </div>
          <div className="space-y-4 text-center md:text-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5C178]">{content.eyebrow}</p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB] leading-snug">{content.strip.title}</h2>
            <p className="text-sm sm:text-base text-[#D4C4B3] leading-relaxed">{content.strip.body}</p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] text-sm font-semibold text-[#E5C178] transition-colors"
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
