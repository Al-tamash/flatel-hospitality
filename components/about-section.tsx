"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  className?: string;
}

export function AboutSection({ className }: AboutSectionProps) {
  return (
    <section
      id="about"
      className={cn(
        "scroll-mt-20 relative w-full bg-[#0E0A07] text-[#FAF4EB] py-20 sm:py-24 lg:py-28 border-t border-[rgba(212,163,89,0.22)] select-none overflow-hidden",
        className
      )}
      aria-labelledby="about-heading"
    >
      {/* Luxury Subtle Radial Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/4 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,89,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* Moroccan Gold Lattice Watermark Backdrop (Mamounia Metamorphosis Style) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
        style={{
          backgroundImage: `url('/images/patterns/flatel-gold-lattice.svg')`,
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          backgroundSize: "600px auto",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
        {/* Symmetrical Gold Horizontal Line Header */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-14">
          <div className="h-[1px] w-12 sm:w-20 md:w-28 bg-gradient-to-r from-transparent to-[#E5C178]/80" />
          <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
            ABOUT FLATEL HOSPITALITY
          </span>
          <div className="h-[1px] w-12 sm:w-20 md:w-28 bg-gradient-to-l from-transparent to-[#E5C178]/80" />
        </div>

        {/* ========================================================== */}
        {/* 2-COLUMN LUXURY EDITORIAL (MATCHING USER REFERENCE DESIGN) */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
          {/* -------------------------------------------------------- */}
          {/* LEFT COLUMN: EDITORIAL, STORY, METRICS & MAP CTA (6 COLS)*/}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-7">
            {/* 1. Small Top Category Tagline */}
            <div>
              <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                SERVICED APARTMENTS IN HYDERABAD
              </span>

              {/* 2. Main Headline in Editorial Cormorant Garamond */}
              <h2
                id="about-heading"
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-normal text-[#FAF4EB] leading-[1.08] mt-3"
              >
                The Space of an Apartment.{" "}
                <span className="font-heading italic text-[#E5C178] block sm:inline lg:block">
                  The Care of a Hotel.
                </span>
              </h2>
            </div>

            {/* 3. Two Story Narrative Paragraphs in DM Sans */}
            <div className="space-y-4 text-base sm:text-lg text-[#D4C4B3] font-sans font-normal leading-relaxed">
              <p>
                We started Flatel to solve a real problem travelers face in Hyderabad: paying high rates for cramped hotel rooms with no kitchen, or dealing with unmanaged rental apartments that lack cleanliness and reliable support.
              </p>
              <p>
                Across our Barkas Salala and Moghal Pura properties, every flat comes fully furnished with a private modular kitchen, regular housekeeping, clean linens, and a local support team on call around the clock.
              </p>
            </div>

            {/* 4. Three Metrics with Oldstyle Numerals */}
            <div className="pt-6 border-t border-[rgba(212,163,89,0.18)] grid grid-cols-3 gap-4">
              <div>
                <div className="font-heading text-4xl sm:text-5xl text-[#FAF4EB] font-medium tracking-normal oldstyle-nums">
                  100%
                </div>
                <div className="text-xs sm:text-sm font-sans font-bold tracking-[0.12em] uppercase text-[#E5C178] mt-1.5">
                  Private Kitchens
                </div>
              </div>

              <div>
                <div className="font-heading text-4xl sm:text-5xl text-[#FAF4EB] font-medium tracking-normal oldstyle-nums">
                  2
                </div>
                <div className="text-xs sm:text-sm font-sans font-bold tracking-[0.12em] uppercase text-[#E5C178] mt-1.5">
                  Prime Branches
                </div>
              </div>

              <div>
                <div className="font-heading text-4xl sm:text-5xl text-[#FAF4EB] font-medium tracking-normal oldstyle-nums">
                  24/7
                </div>
                <div className="text-xs sm:text-sm font-sans font-bold tracking-[0.12em] uppercase text-[#E5C178] mt-1.5">
                  Front Desk Care
                </div>
              </div>
            </div>

            {/* 5. Champagne Gold Button: "VIEW ON MAP" / EXPLORE BRANCHES */}
            <div className="pt-2">
              <Link
                href="/#locations"
                className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] font-sans text-xs sm:text-sm uppercase font-bold tracking-[0.12em] transition-all duration-200 shadow-md shadow-[#E5C178]/20 active:scale-[0.98] cursor-pointer"
              >
                <MapPin className="w-4 h-4 stroke-[2]" />
                <span>View on Map</span>
              </Link>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* RIGHT COLUMN: LUXURY PHOTO + FLOATING QUOTE (6 COLS)     */}
          {/* -------------------------------------------------------- */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0 pb-10 sm:pb-12 lg:pb-8">
            {/* Framed Architectural / Bedroom Photograph */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[14/10] rounded-2xl overflow-hidden border border-[rgba(212,163,89,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              <Image
                src="/images/amenities-bedroom-bg.jpg"
                alt="Flatel Luxury Serviced Residence Suite in Hyderabad"
                fill
                priority
                quality={95}
                className="object-cover object-center scale-[1.02] hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Subtle Vignette Gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/80 via-transparent to-[#0E0A07]/30 pointer-events-none"
                aria-hidden="true"
              />

              {/* Location Tag at Top-Right of Image */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-md bg-[#16100B]/90 backdrop-blur-md border border-[rgba(212,163,89,0.3)] text-xs font-mono tracking-[0.14em] uppercase text-[#FAF4EB]">
                BARKAS &amp; MOGHAL PURA, HYDERABAD
              </div>
            </div>

            {/* Overlapping Floating Quote Card at Bottom-Left of Photo */}
            <div className="absolute -bottom-2 left-2.5 sm:-bottom-4 sm:left-6 md:-bottom-6 md:left-8 max-w-[calc(100%-1.25rem)] sm:max-w-[340px] rounded-xl bg-[rgba(34,24,16,0.85)] backdrop-blur-md border border-[rgba(212,163,89,0.32)] p-4 sm:p-5 shadow-[0_20px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(212,163,89,0.06)] z-20 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-2 text-[#E5C178] mb-1.5">
                <Star className="w-4 h-4 fill-[#E5C178]" />
                <span className="text-xs font-sans font-bold tracking-[0.14em] uppercase">
                  FOUNDER&apos;S PLEDGE
                </span>
              </div>

              <p className="font-heading italic text-sm sm:text-base text-[#FAF4EB] leading-snug">
                &ldquo;Real homes with private kitchens, clean spaces, and genuine care for every guest.&rdquo;
              </p>

              <div className="mt-2 text-xs font-mono text-[#D4C4B3] uppercase tracking-wider font-semibold">
                — OSAMA, MANAGING DIRECTOR
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
