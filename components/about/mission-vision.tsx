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
      className="relative w-full overflow-hidden bg-canvas py-16 sm:py-24"
      aria-labelledby="mission-vision-heading"
    >
      <Starlight seed={19} density={140} />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_12%,transparent)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 container-page space-y-14 sm:space-y-16">
        <div className="text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-line-strong text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            <Sparkles className="w-3.5 h-3.5" />
            {content.pill}
          </span>
          <h2
            id="mission-vision-heading"
            className="font-heading text-fg heading-section"
          >
            {content.headlineLead}{" "}
            <span className="italic text-gold">{content.headlineAccent}</span>
          </h2>
          <p className="mx-auto max-w-3xl text-sm sm:text-base text-fg-soft leading-relaxed">{content.mission}</p>

          <div className="flex items-center justify-center gap-4 pt-4" aria-hidden="true">
            <span className="h-px w-16 sm:w-24 bg-gold/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              {content.visionLabel}
            </span>
            <span className="h-px w-16 sm:w-24 bg-gold/50" />
          </div>
          <blockquote className="mx-auto max-w-3xl font-heading italic text-2xl sm:text-3xl text-fg leading-snug">
            “{content.vision}”
          </blockquote>
        </div>

        <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.values.map((value, i) => {
            const Icon = VALUE_ICONS[i] ?? Sparkles;
            return (
              <div
                key={value.title}
                className="border-t border-line pt-6 text-center space-y-3"
              >
                <div className="mx-auto w-11 h-11 rounded-xl border border-line-strong flex items-center justify-center text-gold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-xl text-fg">{value.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{value.body}</p>
              </div>
            );
          })}
        </div>

        <FounderCard locale={locale} />
      </div>
    </section>
  );
}
