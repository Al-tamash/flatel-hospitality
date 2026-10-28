import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  Building2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MissionVision } from "@/components/about/mission-vision";
import { WHATSAPP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us | Flatel Hospitality Hyderabad",
  description:
    "Learn about Flatel Hospitality, our founding story, our 2 prime branches in Barkas Salala and Moghal Pura, and our 5-pillar commitment to residential comfort in Hyderabad.",
};

const PLEDGE_ITEMS = [
  {
    number: "01",
    title: "100% Private Cooking Independence",
    description:
      "Every residence has a dedicated modular kitchen with piped gas, cookware, refrigerator, and starter spices. No expensive room service or forced hotel dining.",
  },
  {
    number: "02",
    title: "Alternate-Day Professional Sanitation",
    description:
      "Complimentary housekeeping every alternate day with floor disinfection, fresh linens, dusting, and trash clearance across daily, bi-weekly, and monthly stays.",
  },
  {
    number: "03",
    title: "Transparent Pricing & 20% Deposit",
    description:
      "Lock your dates with just a 20% advance online payment. The remaining 80% is paid upon arrival via Cash or UPI QR Code, with zero hidden platform charges.",
  },
  {
    number: "04",
    title: "Whole Family Under One Private Roof",
    description:
      "Spacious 1, 2, 3, and 4 BHK residences accommodating 2 to 12 guests with shared living and dining lounges, instead of splitting families across multiple cramped hotel rooms.",
  },
  {
    number: "05",
    title: "Dedicated On-Site Front Desk & Transit Care",
    description:
      "Guest support for hospital travel planning and local recommendations, alongside the residence services listed for each property.",
  },
];

const BRANCH_PROFILES = [
  {
    slug: "barkas-salala",
    name: "Barkas Salala Branch",
    tagline: "Serviced residences in Barkas Salala",
    address: "Barkas Salala, Near Chandrayangutta, Hyderabad, Telangana",
    units: "Two 3 BHK Residences (Up to 9 Guests each)",
    highlights: [
      "3 BHK residences for families and medical visitors",
      "Ask the Flatel team for local travel information",
      "Private kitchens and alternate-day housekeeping",
    ],
    mapUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
  },
  {
    slug: "moghal-pura",
    name: "Moghal Pura Branch",
    tagline: "Historic Heritage Living in the Heart of Old City Hyderabad",
    address: "Moghal Pura, Near Charminar, Hyderabad, Telangana",
    units: "1 BHK, 2 BHK & 4 BHK Residences (2 to 12 Guests)",
    highlights: [
      "Near historic Charminar & Laad Bazaar",
      "Close to Princess Esra Hospital & Princess Durru Shehvar",
      "Vibrant food and cultural heritage corridors at your doorstep",
      "Fully furnished modular kitchens and family dining spaces",
    ],
    mapUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
  },
];

export default function AboutPage() {
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(
    "Hello Flatel Support, I would like to know more about your serviced residences."
  );

  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />

      <main className="flex-1 w-full">
        {/* ======================================================== */}
        {/* 1. HERO HEADER (Quiet Luxury Editorial Tone)             */}
        {/* ======================================================== */}
        <section className="relative w-full py-16 sm:py-24 overflow-hidden">
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(212,163,89,0.12)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 text-center z-10">
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.16em] text-[#E5C178] uppercase mb-3">
              ABOUT FLATEL HOSPITALITY
            </p>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl text-[#FAF4EB] font-medium leading-[1.1] max-w-3xl mx-auto">
              The Space of a Home.{" "}
              <span className="italic text-[#E5C178]">The Service of a Hotel.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#D4C4B3] font-sans max-w-2xl mx-auto leading-relaxed">
              Founded in Hyderabad by Osama, Flatel Hospitality was built to replace cramped, expensive hotel rooms with spacious, fully furnished residences where families and medical travelers feel genuinely cared for.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. THE FOUNDING STORY & VISION (Split Editorial)         */}
        {/* ======================================================== */}
        <section className="w-full py-16 sm:py-20 lg:py-24 relative overflow-hidden">
          {/* Moroccan Gold Lattice Watermark Backdrop */}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Visual Story Framed Image */}
              <div className="lg:col-span-6 relative">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(212,163,89,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <Image
                    src="/images/amenities-bedroom-bg.jpg"
                    alt="Flatel Hospitality Suite in Hyderabad"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/70 via-transparent to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#16100B]/90 backdrop-blur-md border border-[rgba(212,163,89,0.25)] text-xs font-sans text-[#FAF4EB]">
                    <span className="text-[#E5C178] font-bold uppercase tracking-wider block mb-0.5">
                      Authentic Residential Living
                    </span>
                    <span>Every residence includes private bedrooms, modular kitchen &amp; living lounge.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Founder Narrative */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                <div>
                  <span className="text-xs font-sans font-bold tracking-[0.14em] text-[#E5C178] uppercase">
                    OUR ORIGIN &amp; PURPOSE
                  </span>
                  <h2 className="font-heading text-2xl sm:text-4xl text-[#FAF4EB] font-medium leading-snug mt-2">
                    Why We Started Flatel in Hyderabad
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-[#D4C4B3] font-sans leading-relaxed">
                  <p>
                    For years, travelers visiting Hyderabad—whether for medical treatments at premier hospitals, extended family weddings, or cultural heritage tours—faced an unfair choice: pay high daily tariffs for cramped 250 sq ft hotel rooms with no kitchen, or rent unmanaged apartments that lacked basic hygiene, clean linens, and dependable security.
                  </p>
                  <p>
                    Flatel Hospitality was created to bridge this gap. We manage our own properties directly in Barkas Salala and Moghal Pura, ensuring that every apartment combines the independence and generous space of a residential home with hotel-grade linen standards, alternate-day sanitation, and round-the-clock on-site guest support.
                  </p>
                </div>

                {/* Founder's Key Metrics */}
                <div className="pt-6 border-t border-[rgba(212,163,89,0.18)] grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium">100%</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#E5C178] block mt-1">
                      Private Kitchens
                    </span>
                  </div>
                  <div>
                    <span className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium">2</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#E5C178] block mt-1">
                      Flagship Branches
                    </span>
                  </div>
                  <div>
                    <span className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium">24/7</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#E5C178] block mt-1">
                      On-Site Care Team
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MissionVision locale="en" />

        {/* ======================================================== */}
        {/* 3. THE 5-PILLAR GUEST PLEDGE (Hairline List Layout)      */}
        {/* ======================================================== */}
        <section className="w-full py-16 sm:py-20 bg-[#120D09]">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                OUR PROMISE TO EVERY GUEST
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium leading-snug mt-2">
                The 5-Pillar Flatel Standard
              </h2>
              <p className="text-sm sm:text-base text-[#D4C4B3] mt-2">
                Every reservation across our properties is governed by these core hospitality guarantees.
              </p>
            </div>

            {/* Hairline Divider List - No Generic Card Slop */}
            <div className="divide-y divide-[rgba(212,163,89,0.18)] border-y border-[rgba(212,163,89,0.22)]">
              {PLEDGE_ITEMS.map((pledge) => (
                <div
                  key={pledge.number}
                  className="py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-[rgba(229,193,120,0.03)] transition-colors px-3 sm:px-4 rounded-lg"
                >
                  <div className="md:col-span-2 flex items-center gap-3">
                    <span className="font-mono text-xs sm:text-sm text-[#E5C178] font-bold tracking-widest">
                      {pledge.number}
                    </span>
                    <span className="md:hidden text-xs uppercase tracking-wider text-[#D4C4B3]">Pledge</span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FAF4EB]">
                      {pledge.title}
                    </h3>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-sm sm:text-base text-[#D4C4B3] font-sans leading-relaxed">
                      {pledge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. TWO PRIME BRANCHES OVERVIEW                           */}
        {/* ======================================================== */}
        <section className="w-full py-16 sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                TWO HYDERABAD LOCATIONS
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl text-[#FAF4EB] font-medium leading-snug mt-2">
                Our Flagship Properties
              </h2>
              <p className="text-sm sm:text-base text-[#D4C4B3] mt-2">
                Strategically positioned in South Hyderabad for airport transit, healthcare access, and Old City heritage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {BRANCH_PROFILES.map((branch) => (
                <div
                  key={branch.slug}
                  className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[#16100B] p-7 sm:p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-[#E5C178] mb-2">
                      <Building2 className="w-4 h-4" />
                      <span>{branch.units}</span>
                    </div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#FAF4EB]">
                      {branch.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#D4C4B3] mt-1 italic">
                      {branch.tagline}
                    </p>
                    <p className="text-xs sm:text-sm text-[#FAF4EB]/80 flex items-center gap-1.5 mt-3">
                      <MapPin className="w-4 h-4 text-[#E5C178] shrink-0" />
                      <span>{branch.address}</span>
                    </p>

                    {/* Highlights with checkmarks */}
                    <ul className="mt-6 space-y-2.5 border-t border-[rgba(212,163,89,0.18)] pt-5 text-xs sm:text-sm text-[#D4C4B3]">
                      {branch.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[rgba(212,163,89,0.18)] flex items-center justify-between">
                    <Link
                      href={`/branches/${branch.slug}`}
                      className="text-xs sm:text-sm font-bold text-[#E5C178] hover:text-[#FAF4EB] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Branch &amp; Flats</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#D4C4B3] hover:text-[#E5C178] transition-colors"
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. GUEST SUPPORT & BOOKING ACTION STRIP                  */}
        {/* ======================================================== */}
        <section className="w-full py-16 sm:py-20 bg-gradient-to-b from-[#120D09] to-[#0E0A07]">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
            <h2 className="font-heading text-2xl sm:text-4xl text-[#FAF4EB] font-medium leading-snug">
              Experience Hyderabadi Hospitality in True Residential Comfort
            </h2>
            <p className="text-sm sm:text-base text-[#D4C4B3] mt-3 max-w-xl mx-auto leading-relaxed">
              Reserve your 1, 2, 3, or 4 BHK flat with a simple 20% advance deposit. Free cancellation up to 48 hours prior to check-in.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/properties"
                className="px-7 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Browse All Residences</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 min-h-[48px] rounded-xl bg-[rgba(34,24,16,0.85)] border border-[rgba(212,163,89,0.35)] hover:border-[#E5C178] text-[#FAF4EB] font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
