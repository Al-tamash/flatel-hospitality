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

  return (
    <section
      className="relative z-20 w-full bg-[#0E0A07] overflow-visible select-none"
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
            className="object-cover object-[center_32%] sm:object-center scale-[1.01] transition-transform duration-1000"
            sizes="100vw"
          />

          {/* Top Vignette: Seamless gradient merge with sticky header */}
          <div
            className="absolute inset-x-0 top-0 h-28 sm:h-40 bg-gradient-to-b from-[#0E0A07] via-[#0E0A07]/80 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Contrast Gradient: Guarantees readability for headline */}
          <div
            className={cn(
              "absolute inset-y-0 w-full lg:w-[70%] pointer-events-none",
              isAr
                ? "right-0 bg-gradient-to-l from-[#0E0A07]/98 via-[#0E0A07]/88 sm:via-[#0E0A07]/80 to-[#0E0A07]/40 sm:to-transparent"
                : "left-0 bg-gradient-to-r from-[#0E0A07]/98 via-[#0E0A07]/88 sm:via-[#0E0A07]/80 to-[#0E0A07]/40 sm:to-transparent"
            )}
            aria-hidden="true"
          />

          {/* Ambient Golden Radial Light Leak */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none",
              isAr
                ? "bg-[radial-gradient(circle_at_80%_35%,rgba(212,163,89,0.15)_0%,transparent_65%)]"
                : "bg-[radial-gradient(circle_at_20%_35%,rgba(212,163,89,0.15)_0%,transparent_65%)]"
            )}
            aria-hidden="true"
          />

          {/* Overall Soft Ambient Overlay */}
          <div
            className="absolute inset-0 bg-[#0E0A07]/45 pointer-events-none"
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
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-14 lg:pt-20 pb-3 sm:pb-8">
          <div className={cn("max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out", isAr ? "text-right" : "text-left")}>
            {/* Luxury Eyebrow Text & Golden Horizontal Accent */}
            <div className={cn("flex items-center gap-2.5 mb-2.5 sm:mb-4", isAr && "flex-row-reverse justify-end")}>
              <div
                className="w-8 sm:w-12 h-1 bg-[#E5C178] rounded-full shadow-xs shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                {dict.home.heroBadge}
              </span>
            </div>

            {/* Headline with Luxury Proportions */}
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-semibold tracking-normal text-[#FAF4EB] leading-[1.12]">
              {dict.home.heroTitleLine1}{" "}
              <span className="text-[#E5C178] block sm:inline">{dict.home.heroTitleHighlight}</span>
            </h1>

            {/* Subtitle with Generous Line Height */}
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-base md:text-lg text-[#D4C4B3] font-sans font-normal leading-relaxed max-w-xl text-balance">
              {dict.home.heroSubtitle}
            </p>

            {/* Explore Flats CTA Button */}
            <div className="mt-5 sm:mt-7 hidden sm:block">
              <Link
                href={`${localePrefix}/properties`}
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] font-sans font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-lg shadow-[#E5C178]/25 active:scale-[0.98] group"
              >
                <span>{dict.home.exploreResidences}</span>
                {isAr ? (
                  <ArrowLeft className="w-4 h-4 text-[#140E08] transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-[#140E08] transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Integrated Booking Search Bar */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 mt-auto pt-2 sm:pt-6">
          <BookingSearch />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. UNDER THE HERO: 4 PURPOSE CARDS                      */}
      {/* ======================================================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 pb-8">
        <HeroFeaturedCards />
      </div>
    </section>
  );
}

