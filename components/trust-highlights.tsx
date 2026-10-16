import * as React from "react";
import { Landmark, UtensilsCrossed, ArrowUpDown, Zap } from "lucide-react";

interface HighlightItem {
  index: string;
  title: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    index: "01",
    title: "Explore Hyderabad's Heritage",
    description:
      "Ask our team about local heritage sites and sightseeing options during your stay.",
    tag: "Local Guidance",
    icon: Landmark,
  },
  {
    index: "02",
    title: "A Furnished Residence",
    description:
      "Enjoy the privacy of your own residence, with a kitchen for everyday convenience.",
    tag: "Room to Settle In",
    icon: UtensilsCrossed,
  },
  {
    index: "03",
    title: "Guest Assistance",
    description:
      "Our team can help coordinate stay details and requests during your visit.",
    tag: "Here to Help",
    icon: ArrowUpDown,
  },
  {
    index: "04",
    title: "Power Backup",
    description:
      "Residences include inverter power backup for added peace of mind.",
    tag: "Stay Essentials",
    icon: Zap,
  },
];

export function TrustHighlights() {
  return (
    <section
      id="highlights"
      className="relative w-full border-t border-border/70 bg-background py-14 sm:py-20 lg:py-24"
      aria-labelledby="trust-section-heading"
    >
      {/* Subtle Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(201,168,91,0.05),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          {/* Editorial Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="h-px w-5 sm:w-6 bg-primary" aria-hidden="true" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Why Stay With Us
            </span>
          </div>

          {/* Main Heading (Cormorant Garamond) */}
          <h2
            id="trust-section-heading"
            className="font-heading text-2xl sm:text-3xl md:text-4xl font-normal leading-[1.18] text-foreground tracking-tight text-balance"
          >
            Everything you need for a comfortable stay.
          </h2>

          {/* Supporting Copy (Manrope) */}
          <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed text-balance">
            Our serviced apartments combine the privacy and self-sufficiency of a furnished residence
            with thoughtful hospitality support, ensuring every guest feels truly cared for.
          </p>
        </div>

        {/* Four Primary Highlights Grid */}
        <div className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.index}
                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-[#0B0E10]/90 p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:border-primary/40 hover:bg-[#0B0E10] focus-within:border-primary/50"
              >
                {/* Top Row: Index Numeral & Restrained Icon Badge */}
                <div>
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border/60">
                    <span className="font-heading text-base sm:text-lg font-normal tracking-wider text-primary/70 group-hover:text-primary transition-colors">
                      {item.index}
                    </span>
                    <div
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-border/80 bg-secondary/60 flex items-center justify-center text-primary group-hover:border-primary/30 transition-colors"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Highlight Title */}
                  <h3 className="font-heading text-base sm:text-lg font-normal text-foreground tracking-tight mt-3.5 sm:mt-4 leading-snug">
                    {item.title}
                  </h3>

                  {/* Highlight Description */}
                  <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Tag */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] uppercase tracking-wider font-mono text-primary/80">
                  <span>{item.tag}</span>
                  <span className="h-1 w-1 rounded-full bg-primary/60" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
