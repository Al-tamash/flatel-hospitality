import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Our Branches | Flatel Hospitality Hyderabad",
  description:
    "Explore Flatel Hospitality serviced branches in Barkas Salala and Moghal Pura, Hyderabad. Premium furnished 1 to 4 BHK flats.",
};

const BRANCH_CARDS = [
  {
    name: "Barkas Salala Serviced Residences",
    slug: "barkas-salala",
    location: "Near Chandrayangutta & Airport Expressway",
    address: "Barkas Salala, Near Chandrayangutta, Hyderabad, Telangana",
    tagline: "Spacious 3 BHK family residences with quiet privacy and direct airport transit.",
    unitsSummary: "Two 3 BHK Residences · Up to 9 Guests",
    startingRate: "₹3,000",
    image: "/images/branch-barkas-salala.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
  },
  {
    name: "Moghal Pura Serviced Residences",
    slug: "moghal-pura",
    location: "Steps from Charminar & Historic Old City",
    address: "Moghal Pura, Near Charminar, Hyderabad, Telangana",
    tagline: "Central heritage location with 1 BHK, 2 BHK, and grand 4 BHK residences.",
    unitsSummary: "1, 2 & 4 BHK Residences · 2–12 Guests",
    startingRate: "₹2,000",
    image: "/images/branch-moghal-pura.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
  },
];

export default function BranchesIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <SiteHeader />

      <main className="flex-1 w-full py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-primary block mb-2">
              Our Locations
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-foreground font-normal tracking-tight">
              Flatel Serviced Branches
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Find our serviced residences in Moghal Pura and Barkas Salala, with the privacy of an independent flat and support from our hospitality team.
            </p>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BRANCH_CARDS.map((b) => (
              <div
                key={b.slug}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-colors shadow-lg"
              >
                {/* Photo */}
                <div className="relative aspect-[16/10] w-full bg-secondary">
                  <Image
                    src={b.image}
                    alt={b.name}
                    fill
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#0E0A07]/60 backdrop-blur-md text-[11px] font-medium text-foreground border border-white/10">
                      {b.unitsSummary}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{b.location}</span>
                    </div>

                    <h2 className="font-heading text-2xl font-normal text-foreground">
                      {b.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                      {b.tagline}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Starting from</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-xl font-bold text-foreground">
                          {b.startingRate}
                        </span>
                        <span className="text-xs text-muted-foreground">/ night</span>
                      </div>
                    </div>

                    <Link
                      href={`/branches/${b.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-semibold text-xs hover:brightness-105 transition-all shadow-sm"
                    >
                      <span>Explore Branch</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#140E08]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
