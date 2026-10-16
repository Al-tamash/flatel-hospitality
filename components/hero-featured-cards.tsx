"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// 4 CLEAN, MINIMAL STAY PURPOSE CARDS
// Inspired by Image 2: Simple, compact cards with framed imagery and clean bottom labels.
// No heavy badges, no paragraph clutter, just pure luxury and visual clarity.
// =========================================================================

export const FEATURED_PURPOSES = [
  {
    id: "medical",
    purposeKey: "medical",
    title: "Medistay Healthcare",
    imageUrl: "/images/experiences/medistay-luxury-suite.jpg",
    href: "/?purpose=medical#flats",
    description: "Doctor assistance, wheelchair, hospital bed setup & ambulance coordination.",
  },
  {
    id: "tourism",
    purposeKey: "tourism",
    title: "Heritage & Tourism",
    imageUrl: "/images/branch-moghal-pura.jpg",
    href: "/?purpose=tourism#flats",
    description: "Charminar itinerary guide, luggage storage, and 24/7 local desk.",
  },
  {
    id: "family",
    purposeKey: "family",
    title: "Family & Long Stay",
    imageUrl: "/images/flats/flat-3bhk-luxury.jpg",
    href: "/?purpose=family#flats",
    description: "Infant baby cot, private modular kitchen with gas, and board games.",
  },
  {
    id: "corporate",
    purposeKey: "corporate",
    title: "Corporate Executive",
    imageUrl: "/images/experiences/corporate-luxury-desk.jpg",
    href: "/?purpose=corporate#flats",
    description: "High-speed enterprise Wi-Fi, ergonomic desk setup, and GST invoices.",
  },
];

interface HeroFeaturedCardsProps {
  className?: string;
}

export function HeroFeaturedCards({ className }: HeroFeaturedCardsProps) {
  const handleCardClick = (e: React.MouseEvent, card: (typeof FEATURED_PURPOSES)[number]) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      sp.set("purpose", card.purposeKey);
      const newUrl = `/?${sp.toString()}#flats`;
      window.history.pushState(null, "", newUrl);
      window.dispatchEvent(
        new CustomEvent("flatel:set-purpose", {
          detail: { purpose: card.purposeKey },
        })
      );
      const target = document.getElementById("flats") || document.getElementById("properties");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div
      className={cn("w-full select-none max-w-6xl mx-auto", className)}
      aria-label="FLATEL Stay Categories"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
        {FEATURED_PURPOSES.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            onClick={(e) => handleCardClick(e, card)}
            className={cn(
              "group relative flex flex-col justify-between rounded-2xl overflow-hidden",
              "bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)]",
              "hover:border-[#E5C178] hover:shadow-[0_16px_36px_rgba(212,163,89,0.2)]",
              "hover:-translate-y-1 transition-all duration-300",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E5C178]"
            )}
          >
            {/* Framed Image Container with concentric inner radius */}
            <div className="p-2 sm:p-2.5 pb-1">
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#16100B]">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {/* Subtle soft dark gradient overlay for depth */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/50 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Clean Editorial Bottom Label (Flattened hierarchy, no nested card) */}
            <div className="px-3.5 py-3 flex items-center justify-between gap-1.5 border-t border-[rgba(212,163,89,0.18)]">
              <span className="text-sm sm:text-[15px] font-semibold text-[#FAF4EB] group-hover:text-[#E5C178] transition-colors leading-tight line-clamp-1">
                {card.title}
              </span>
              <ChevronRight className="w-4 h-4 text-[#E5C178] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
