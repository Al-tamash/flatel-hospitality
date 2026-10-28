import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { getAboutContent } from "@/lib/about-content";
import { Starlight } from "@/components/effects/starlight";
import { FounderCard } from "@/components/about/founder-card";

const VALUE_ICONS = [HeartHandshake, Sparkles, ShieldCheck];

/** Mission & Vision plus the founder card, on the starlight night sky. */
export function MissionVision({ locale }: { locale: "en" | "ar" }) {
  const content = getAboutContent(locale);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0B0805] py-16 sm:py-24"
      aria-labelledby="mission-vision-heading"
    >
      <Starlight seed={19} density={140} />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(212,163,89,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-16">
        <div className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(212,163,89,0.4)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5C178]">
            <Sparkles className="w-3.5 h-3.5" />
            {content.pill}
          </span>
          <h2
            id="mission-vision-heading"
            className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#FAF4EB] font-normal leading-[1.08]"
          >
            {content.headlineLead}{" "}
            <span className="italic text-[#E5C178]">{content.headlineAccent}</span>
          </h2>
          <p className="mx-auto max-w-3xl text-sm sm:text-base text-[#D4C4B3] leading-relaxed">{content.mission}</p>

          <div className="flex items-center justify-center gap-4 pt-4" aria-hidden="true">
            <span className="h-px w-16 sm:w-24 bg-[rgba(212,163,89,0.5)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E5C178]">
              {content.visionLabel}
            </span>
            <span className="h-px w-16 sm:w-24 bg-[rgba(212,163,89,0.5)]" />
          </div>
          <blockquote className="mx-auto max-w-3xl font-heading italic text-2xl sm:text-3xl text-[#FAF4EB] leading-snug">
            “{content.vision}”
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.values.map((value, i) => {
            const Icon = VALUE_ICONS[i] ?? Sparkles;
            return (
              <div
                key={value.title}
                className="rounded-2xl border border-[rgba(212,163,89,0.22)] bg-[rgba(22,16,11,0.8)] p-6 text-center space-y-3"
              >
                <div className="mx-auto w-11 h-11 rounded-xl border border-[rgba(212,163,89,0.45)] flex items-center justify-center text-[#E5C178]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-xl text-[#FAF4EB]">{value.title}</h3>
                <p className="text-sm text-[#B8A692] leading-relaxed">{value.body}</p>
              </div>
            );
          })}
        </div>

        <FounderCard locale={locale} />
      </div>
    </section>
  );
}
