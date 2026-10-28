"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// 5 CLEAN, MINIMAL STAY PURPOSE CARDS (each opens its /stays/[purpose] page)
// Inspired by Image 2: Simple, compact cards with framed imagery and clean bottom labels.
// No heavy badges, no paragraph clutter, just pure luxury and visual clarity.
// =========================================================================

export const FEATURED_PURPOSES = [
  {
    id: "medical",
    purposeKey: "medical",
    title: "Medistay Healthcare",
    titleAr: "السياحة العلاجية (Medistay)",
    imageUrl: "/images/experiences/medistay-luxury-suite.jpg",
    href: "/stays/medical",
    description: "Doctor assistance, wheelchair, hospital bed setup & ambulance coordination.",
    descriptionAr: "مساعدة في مواعيد الأطباء، كراسي متحركة، سرير طبي، وتنسيق الإسعاف.",
  },
  {
    id: "wedding",
    purposeKey: "wedding",
    title: "Wedding & Celebrations",
    titleAr: "الأعراس والمناسبات",
    imageUrl: "/images/purposes/purpose-wedding.jpg",
    href: "/stays/wedding",
    description: "Group check-in for wedding families, garment steamer and optional venue, décor and photography help.",
    descriptionAr: "تسجيل وصول جماعي لعائلات الأعراس، ومكواة بخار، وترتيبات اختيارية للقاعة والديكور والتصوير.",
  },
  {
    id: "tourism",
    purposeKey: "tourism",
    title: "Heritage & Tourism",
    titleAr: "السياحة والتراث",
    imageUrl: "/images/branch-moghal-pura.jpg",
    href: "/stays/tourism",
    description: "Charminar itinerary guide, luggage storage, and 24/7 local desk.",
    descriptionAr: "دليل زيارة تشارمينار، حفظ الأمتعة، ومكتب استقبال على مدار الساعة.",
  },
  {
    id: "family",
    purposeKey: "family",
    title: "Family & Long Stay",
    titleAr: "العائلات والإقامات الطويلة",
    imageUrl: "/images/flats/flat-3bhk-luxury.jpg",
    href: "/stays/family",
    description: "Infant baby cot, private modular kitchen with gas, and board games.",
    descriptionAr: "سرير أطفال مجاني، مطبخ مجهز بالكامل بالغاز، وأجواء عائلية مريحة.",
  },
  {
    id: "corporate",
    purposeKey: "corporate",
    title: "Corporate Executive",
    titleAr: "رجال الأعمال والشركات",
    imageUrl: "/images/experiences/corporate-luxury-desk.jpg",
    href: "/stays/corporate",
    description: "High-speed enterprise Wi-Fi, ergonomic desk setup, and GST invoices.",
    descriptionAr: "إنترنت عالي السرعة، مساحة عمل مريحة، وفواتير ضريبية معتمدة.",
  },
];

interface HeroFeaturedCardsProps {
  className?: string;
}

export function HeroFeaturedCards({ className }: HeroFeaturedCardsProps) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const localePrefix = isAr ? "/ar" : "";

  return (
    <div
      className={cn("w-full select-none max-w-6xl mx-auto", className)}
      aria-label="FLATEL Stay Categories"
    >
      <div className="flex md:grid md:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0 no-scrollbar">
        {FEATURED_PURPOSES.map((card) => (
          <Link
            key={card.id}
            href={`${localePrefix}${card.href}`}
            className={cn(
              "group relative flex flex-col justify-between rounded-2xl overflow-hidden snap-start shrink-0 w-[44%] sm:w-[30%] md:w-auto",
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
                  alt={isAr ? card.titleAr : card.title}
                  fill
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 45vw, 20vw"
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
                {isAr ? card.titleAr : card.title}
              </span>
              <ChevronRight className="w-4 h-4 text-[#E5C178] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
