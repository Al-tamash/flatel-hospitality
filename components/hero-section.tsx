"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { BookingSearch } from "@/components/hero/booking-search";
import { HeroFeaturedCards } from "@/components/hero-featured-cards";
import { getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { Starlight } from "@/components/effects/starlight";
import { cn } from "@/lib/utils";
import { EASE_OUT, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

interface HeroSectionProps {
  /** Optional custom hero background image URL (e.g. from Cloudflare R2) */
  customImageUrl?: string;
}

export function HeroSection({ customImageUrl }: HeroSectionProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const dict = getDictionary(currentLocale);
  const isAr = currentLocale === "ar";
  const localePrefix = isAr ? "/ar" : "";
  const heroImageSrc = customImageUrl || "/images/hero-apartment.jpg";
  const sectionRef = React.useRef<HTMLElement>(null);

  // Entrance: photo settles from a slow zoom, then the headline block and the
  // booking bar rise in sequence. Vertical-only so LTR and RTL behave the same.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
        tl.from("[data-hero-bg]", { scale: 1.14, duration: 2.4, ease: "power2.out" }, 0)
          .from("[data-hero-accent]", { scaleX: 0, transformOrigin: isAr ? "right center" : "left center", duration: 0.6 }, 0.15)
          .from("[data-hero-item]", { autoAlpha: 0, y: 28, duration: 0.8, stagger: 0.12, clearProps: "transform,opacity,visibility" }, 0.2)
          .from("[data-hero-search]", { autoAlpha: 0, y: 36, duration: 0.9, clearProps: "transform,opacity,visibility" }, 0.7)
          .from("[data-hero-cards]", { autoAlpha: 0, y: 32, duration: 0.9, clearProps: "transform,opacity,visibility" }, 0.9);
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [isAr] }
  );

  return (
    <section
      ref={sectionRef}
      data-motion
      className="relative z-20 w-full bg-canvas overflow-visible select-none"
      aria-label="FLATEL Hospitality — Find Your Place to Stay"
    >
      {/* ======================================================== */}
      {/* 1. CINEMATIC LUXURY APARTMENT BACKGROUND & OVERLAYS      */}
      {/* ======================================================== */}
      <div className="relative w-full min-h-[460px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-between">
        {/* Background Image Container with deliberate mobile crop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src={heroImageSrc}
            alt="FLATEL Hospitality Serviced Apartments in Hyderabad"
            fill
            priority
            data-hero-bg
            className="object-cover object-[center_32%] sm:object-center scale-[1.01] transition-transform duration-1000"
            sizes="100vw"
          />

          {/* Top Vignette: Seamless gradient merge with sticky header */}
          <div
            className="absolute inset-x-0 top-0 h-28 sm:h-40 bg-gradient-to-b from-canvas via-canvas/80 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Contrast Gradient: Guarantees readability for headline */}
          <div
            className={cn(
              "absolute inset-y-0 w-full lg:w-[70%] pointer-events-none",
              isAr
                ? "right-0 bg-gradient-to-l from-canvas/98 via-canvas/88 sm:via-canvas/80 to-canvas/40 sm:to-transparent"
                : "left-0 bg-gradient-to-r from-canvas/98 via-canvas/88 sm:via-canvas/80 to-canvas/40 sm:to-transparent"
            )}
            aria-hidden="true"
          />

          {/* Ambient Golden Radial Light Leak */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none",
              isAr
                ? "bg-[radial-gradient(circle_at_80%_35%,color-mix(in_srgb,var(--gold)_15%,transparent)_0%,transparent_65%)]"
                : "bg-[radial-gradient(circle_at_20%_35%,color-mix(in_srgb,var(--gold)_15%,transparent)_0%,transparent_65%)]"
            )}
            aria-hidden="true"
          />

          {/* Overall Soft Ambient Overlay */}
          <div
            className="absolute inset-0 bg-canvas/45 pointer-events-none"
            aria-hidden="true"
          />

          {/* Starlight night sky over the dark side of the hero, fading out over the photo */}
          <Starlight
            seed={7}
            className={cn(
              isAr
                ? "[mask-image:linear-gradient(to_left,black_0%,black_35%,transparent_70%)]"
                : "[mask-image:linear-gradient(to_right,black_0%,black_35%,transparent_70%)]"
            )}
          />
        </div>

        {/* ======================================================== */}
        {/* 2. HERO EDITORIAL (Purpose-Built for Mobile & RTL)       */}
        {/* ======================================================== */}
        <div className="relative z-10 w-full container-page pt-6 sm:pt-14 lg:pt-20 pb-3 sm:pb-8">
          <div className={cn("max-w-2xl", isAr ? "text-right" : "text-left")}>
            {/* Luxury Eyebrow Text & Golden Horizontal Accent */}
            <div data-hero-item className={cn("flex items-center gap-2.5 mb-2.5 sm:mb-4", isAr && "flex-row-reverse justify-end")}>
              <div
                data-hero-accent
                className="w-8 sm:w-12 h-1 bg-gold rounded-full shadow-xs shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase">
                {dict.home.heroBadge}
              </span>
            </div>

            {/* Headline with Luxury Proportions */}
            <h1 data-hero-item className="font-heading text-fg heading-hero">
              {dict.home.heroTitleLine1}{" "}
              <span className="text-gold block sm:inline">{dict.home.heroTitleHighlight}</span>
            </h1>

            {/* Subtitle with Generous Line Height */}
            <p data-hero-item className="mt-3.5 sm:mt-5 text-sm sm:text-base md:text-lg text-fg-soft font-sans font-normal leading-relaxed max-w-xl text-balance">
              {dict.home.heroSubtitle}
            </p>

            {/* Explore Flats CTA Button */}
            <div data-hero-item className="mt-5 sm:mt-7 hidden sm:block">
              <Link
                href={`${localePrefix}/properties`}
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-105 text-ink font-sans font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-lg shadow-gold/25 active:scale-[0.98] group"
              >
                <span>{dict.home.exploreResidences}</span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4 text-ink transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-ink transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Integrated Booking Search Bar */}
        <div data-hero-search className="relative z-30 w-full container-page mt-auto pt-2 sm:pt-6">
          <BookingSearch />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. UNDER THE HERO: 4 PURPOSE CARDS                      */}
      {/* ======================================================== */}
      <div data-hero-cards className="relative z-20 w-full container-page pt-6 sm:pt-8 pb-8">
        <HeroFeaturedCards />
      </div>
    </section>
  );
}

