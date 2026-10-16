"use client";

import * as React from "react";
import Image from "next/image";
import {
  Wifi,
  Wind,
  Zap,
  Shirt,
  Headphones,
  Tv,
  Refrigerator,
  Droplets,
  Microwave,
  Coffee,
  Sandwich,
  CookingPot,
  Blend,
  Sparkles,
  Bath,
  Clock,
  ShieldCheck,
  Baby,
  Dices,
  Activity,
  BedDouble,
  DoorClosed,
  Laptop,
  Layers,
  PlugZap,
  Flame,
  UtensilsCrossed,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AmenityItem {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  isFlagship?: boolean;
}

export interface AmenityCategory {
  id: string;
  title: string;
  subtitle: string;
  shortLabel: string;
  items: AmenityItem[];
}

export interface AmenityCardPreview {
  id: string;
  slug: string;
  name: string;
  categoryIds: string[];
}

/**
 * 29 Master Inclusions categorized strictly per final-prd.md (Section 5)
 */
export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    id: "living-bedroom",
    title: "Living Room & Bedroom Comfort",
    subtitle: "Spacious climate-controlled suites, quiet ergonomic workspaces & smart entertainment",
    shortLabel: "Living & Bedroom",
    items: [
      { id: "wifi", name: "High-Speed Wi-Fi", category: "Living & Bedroom", icon: Wifi, isFlagship: true },
      { id: "ac", name: "Air Conditioning (AC)", category: "Living & Bedroom", icon: Wind, isFlagship: true },
      { id: "heater", name: "Room Heater", category: "Living & Bedroom", icon: Flame },
      { id: "tv", name: "Smart TV", category: "Living & Bedroom", icon: Tv, isFlagship: true },
      { id: "linens", name: "Premium Linens", category: "Living & Bedroom", icon: BedDouble },
      { id: "wardrobe", name: "Wardrobe & Closet Space", category: "Living & Bedroom", icon: DoorClosed },
      { id: "laptop", name: "Dedicated Laptop Table", category: "Living & Bedroom", icon: Laptop },
      { id: "flooring", name: "Premium Wooden Flooring", category: "Living & Bedroom", icon: Layers },
    ],
  },
  {
    id: "kitchen-dining",
    title: "Kitchen & Dining Essentials",
    subtitle: "Private modular kitchen with piped gas, double-door refrigeration & complete cookware",
    shortLabel: "Kitchen & Dining",
    items: [
      { id: "fridge", name: "Double-Door Refrigerator", category: "Kitchen & Dining", icon: Refrigerator, isFlagship: true },
      { id: "ro", name: "RO Water Purifier", category: "Kitchen & Dining", icon: Droplets, isFlagship: true },
      { id: "microwave", name: "Microwave Oven", category: "Kitchen & Dining", icon: Microwave },
      { id: "kettle", name: "Electric Kettle", category: "Kitchen & Dining", icon: Coffee },
      { id: "toaster", name: "Bread Toaster", category: "Kitchen & Dining", icon: Sandwich },
      { id: "rice", name: "Automatic Rice Cooker", category: "Kitchen & Dining", icon: CookingPot },
      { id: "stove", name: "Gas Stove with Piped Gas", category: "Kitchen & Dining", icon: Flame, isFlagship: true },
      { id: "mixer", name: "Mixer & Grinder", category: "Kitchen & Dining", icon: Blend },
      { id: "crockery", name: "Premium Crockery & Cutlery", category: "Kitchen & Dining", icon: UtensilsCrossed },
      { id: "staples", name: "Complimentary Kitchen Staples", category: "Kitchen & Dining", icon: Sparkles },
    ],
  },
  {
    id: "bathroom-care",
    title: "Bathroom & Personal Care",
    subtitle: "En-suite bathrooms with specialized water-softening geysers & premium toiletries",
    shortLabel: "Bathroom & Care",
    items: [
      { id: "geyser", name: "Water Softening Geyser", category: "Bathroom & Care", icon: Bath, isFlagship: true },
      { id: "toiletries", name: "Premium Toiletries", category: "Bathroom & Care", icon: Sparkles },
    ],
  },
  {
    id: "power-laundry",
    title: "Power, Laundry & Convenience",
    subtitle: "Continuous 24/7 power backup and in-unit automated washer-dryer convenience",
    shortLabel: "Power & Laundry",
    items: [
      { id: "inverter", name: "24/7 Inverter Power Backup", category: "Power & Laundry", icon: Zap, isFlagship: true },
      { id: "washer", name: "AI Front-Load Washer-Dryer", category: "Power & Laundry", icon: Shirt, isFlagship: true },
      { id: "charger", name: "Universal Mobile Chargers", category: "Power & Laundry", icon: PlugZap },
    ],
  },
  {
    id: "hospitality-care",
    title: "Hospitality & Guest Services",
    subtitle: "Scheduled alternate-day housekeeping, 24/7 front desk support & dedicated CCTV security",
    shortLabel: "Hospitality & Care",
    items: [
      { id: "housekeeping", name: "Alternate-Day Housekeeping", category: "Hospitality & Care", icon: Clock, isFlagship: true },
      { id: "concierge", name: "24×7 Front Desk & Support", category: "Hospitality & Care", icon: Headphones, isFlagship: true },
      { id: "security", name: "CCTV & Security in Common Areas", category: "Hospitality & Care", icon: ShieldCheck },
    ],
  },
  {
    id: "family-recreation",
    title: "Family, Games & Recreation",
    subtitle: "Attentive comforts for visiting infants, playful children & evening relaxation",
    shortLabel: "Family & Recreation",
    items: [
      { id: "cot", name: "Baby Cot for Infants", category: "Family & Recreation", icon: Baby },
      { id: "indoor", name: "Indoor Board Games", category: "Family & Recreation", icon: Dices },
      { id: "outdoor", name: "Outdoor Sports Equipment", category: "Family & Recreation", icon: Activity },
    ],
  },
];

// Flat list of all 29 inclusions
export const ALL_AMENITIES_LIST: AmenityItem[] = AMENITY_CATEGORIES.flatMap((c) => c.items);

/**
 * 24 3D Illustrated Amenity Cards partitioned into 2 balanced lines of 12 for dual marquee
 */
export const ROW_1_CARDS: AmenityCardPreview[] = [
  { id: "card-1", slug: "bedroom-comfort", name: "Bedroom Comfort", categoryIds: ["living-bedroom"] },
  { id: "card-2", slug: "kitchen-dining", name: "Kitchen & Dining", categoryIds: ["kitchen-dining"] },
  { id: "card-3", slug: "bathroom-care", name: "Bathroom & Care", categoryIds: ["bathroom-care"] },
  { id: "card-4", slug: "air-conditioning", name: "Air Conditioning", categoryIds: ["living-bedroom"] },
  { id: "card-5", slug: "smart-tv", name: "Smart TV", categoryIds: ["living-bedroom"] },
  { id: "card-6", slug: "living-room", name: "Living Room", categoryIds: ["living-bedroom"] },
  { id: "card-7", slug: "high-speed-wifi", name: "High-Speed Wi-Fi", categoryIds: ["living-bedroom"] },
  { id: "card-8", slug: "laundry-washing", name: "Laundry & Washing", categoryIds: ["power-laundry"] },
  { id: "card-9", slug: "hot-water", name: "Hot Water", categoryIds: ["bathroom-care"] },
  { id: "card-10", slug: "power-backup", name: "Power Backup", categoryIds: ["power-laundry"] },
  { id: "card-11", slug: "refrigerator", name: "Refrigerator", categoryIds: ["kitchen-dining"] },
  { id: "card-12", slug: "microwave", name: "Microwave", categoryIds: ["kitchen-dining"] },
];

export const ROW_2_CARDS: AmenityCardPreview[] = [
  { id: "card-13", slug: "dining-space", name: "Dining Space", categoryIds: ["kitchen-dining", "living-bedroom"] },
  { id: "card-14", slug: "work-desk", name: "Work Desk", categoryIds: ["living-bedroom"] },
  { id: "card-15", slug: "outdoor-space", name: "Sports & Recreation", categoryIds: ["family-recreation"] },
  { id: "card-16", slug: "elevator", name: "Elevator", categoryIds: ["power-laundry", "hospitality-care"] },
  { id: "card-17", slug: "security-24-7", name: "24/7 Security & CCTV", categoryIds: ["hospitality-care"] },
  { id: "card-18", slug: "parking", name: "Parking Space", categoryIds: ["hospitality-care"] },
  { id: "card-19", slug: "housekeeping", name: "Alternate-Day Housekeeping", categoryIds: ["hospitality-care"] },
  { id: "card-20", slug: "kitchen-dining", name: "Gas Stove & Cookware", categoryIds: ["kitchen-dining"] },
  { id: "card-21", slug: "outdoor-space", name: "Outdoor Space", categoryIds: ["family-recreation"] },
  { id: "card-22", slug: "children-play-area", name: "Indoor Games & Baby Cot", categoryIds: ["family-recreation"] },
  { id: "card-23", slug: "hot-water", name: "Water Softening Geyser", categoryIds: ["bathroom-care"] },
  { id: "card-24", slug: "concierge-service", name: "24×7 Front Desk Support", categoryIds: ["hospitality-care"] },
];

export const AMENITY_GRID_CARDS: AmenityCardPreview[] = [...ROW_1_CARDS, ...ROW_2_CARDS];

// Filter pills matching user screenshot
const FILTER_TABS = [
  { id: "all", label: "All", count: 29 },
  { id: "living-bedroom", label: "Living & Bedroom", count: 8 },
  { id: "kitchen-dining", label: "Kitchen & Dining", count: 10 },
  { id: "bathroom-care", label: "Bathroom & Care", count: 2 },
  { id: "power-laundry", label: "Power & Laundry", count: 3 },
  { id: "hospitality-care", label: "Hospitality & Care", count: 3 },
  { id: "family-recreation", label: "Family & Recreation", count: 3 },
];

// Helper to duplicate items for an unbroken seamless infinite marquee loop
function repeatForMarquee(items: AmenityCardPreview[], minItems = 12): AmenityCardPreview[] {
  if (items.length === 0) return [];
  let result = [...items];
  while (result.length < minItems) {
    result = [...result, ...items];
  }
  return [...result, ...result]; // duplicate for seamless 50% loop
}

interface AmenitiesSectionProps {
  className?: string;
}

export function AmenitiesSection({ className }: AmenitiesSectionProps) {
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Compute items for Line 1 (moving left) and Line 2 (moving right)
  const { line1Items, line2Items } = React.useMemo(() => {
    if (activeFilter === "all") {
      return {
        line1Items: repeatForMarquee(ROW_1_CARDS, 12),
        line2Items: repeatForMarquee(ROW_2_CARDS, 12),
      };
    }

    // Filter items based on active category
    const filtered = AMENITY_GRID_CARDS.filter((card) => card.categoryIds.includes(activeFilter));
    const half = Math.ceil(filtered.length / 2);
    const row1 = filtered.slice(0, half);
    const row2 = filtered.slice(half);

    return {
      line1Items: repeatForMarquee(row1.length > 0 ? row1 : filtered, 10),
      line2Items: repeatForMarquee(row2.length > 0 ? row2 : filtered, 10),
    };
  }, [activeFilter]);

  // Lock body scroll when modal is active
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Reusable individual amenity card component matching website dark & gold theme
  const renderCard = (item: AmenityCardPreview, keyPrefix: string, index: number) => (
    <div
      key={`${keyPrefix}-${item.id}-${index}`}
      onClick={() => setIsModalOpen(true)}
      className="group relative rounded-2xl bg-gradient-to-b from-[rgba(34,24,16,0.85)] via-[rgba(26,18,12,0.8)] to-[rgba(18,12,8,0.9)] border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] p-2.5 sm:p-3 md:p-3.5 flex flex-col items-center justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(212,163,89,0.25)] hover:scale-105 transition-all duration-300 w-[165px] sm:w-[188px] md:w-[205px] h-[132px] sm:h-[144px] md:h-[154px] select-none cursor-pointer shrink-0 overflow-hidden backdrop-blur-md"
      title={`View ${item.name} details`}
    >
      {/* Subtle Warm Golden Ambient Radial Aura Behind 3D Icon */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,163,89,0.18),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_50%_35%,rgba(212,163,89,0.3),transparent_70%)] transition-colors duration-300"
        aria-hidden="true"
      />

      {/* Subtle Top Golden Rim Highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5C178]/60 to-transparent"
        aria-hidden="true"
      />

      {/* 3D Illustration Floating Transparently on Luxury Black Surface */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[58px] sm:min-h-[66px] md:min-h-[72px] z-10">
        <Image
          src={`/images/amenities/icon-${item.slug}.png`}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 160px, 200px"
          className="object-contain object-center p-0.5 group-hover:scale-110 drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)] transition-transform duration-300"
          quality={100}
        />
      </div>

      {/* Warm Golden / Off-White Vector Typography Matching Website Theme */}
      <span className="font-sans text-xs sm:text-[13.5px] md:text-sm font-semibold text-[#FAF4EB] group-hover:text-[#E5C178] tracking-normal text-center leading-snug w-full line-clamp-2 px-1 mt-1 z-10 transition-colors">
        {item.name}
      </span>
    </div>
  );

  return (
    <section
      id="amenities"
      className={cn(
        "scroll-mt-20 relative w-full bg-[#0E0A07] text-[#FAF4EB] py-16 sm:py-20 lg:py-24 select-none overflow-hidden",
        className
      )}
      aria-labelledby="amenities-heading"
    >
      {/* Subtle Luxury Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-ambient-gold-glow"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10 space-y-7 sm:space-y-9">
        
        {/* ========================================================== */}
        {/* 1. TOP HEADER SECTION                                      */}
        {/* ========================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
            THE FLATEL EXPERIENCE
          </p>

          {/* Main Heading in Cormorant Garamond Serif */}
          <h2
            id="amenities-heading"
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-medium tracking-normal text-[#FAF4EB] leading-[1.08]"
          >
            Everything you need to{" "}
            <span className="font-heading italic text-[#E5C178]">
              feel at home.
            </span>
          </h2>

          {/* Subtitle in DM Sans */}
          <p className="mt-2 text-sm sm:text-base md:text-lg text-[#D4C4B3] font-sans font-normal max-w-xl mx-auto leading-relaxed">
            Thoughtfully designed spaces with modern amenities for a comfortable stay.
          </p>
        </div>

        {/* ========================================================== */}
        {/* 2. FILTER PILLS (IDENTICAL TO SCREENSHOT)                  */}
        {/* ========================================================== */}
        <div className="flex flex-nowrap items-center justify-start gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1.5 pt-1 lg:flex-wrap lg:justify-center lg:gap-2 lg:overflow-visible">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-4 py-2 min-h-[44px] rounded-full text-xs sm:text-sm font-sans font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C178] lg:px-3",
                  isActive
                    ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold shadow-md shadow-[#E5C178]/20"
                    : "bg-[rgba(34,24,16,0.65)] text-[#D4C4B3] hover:text-[#FAF4EB] border border-[rgba(212,163,89,0.2)] hover:border-[#E5C178]/40"
                )}
                aria-pressed={isActive}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* 3. TWO-LINE INFINITE MARQUEE SHOWCASE (LEFT & RIGHT)       */}
        {/* ========================================================== */}
        <div className="relative w-full overflow-hidden py-1 sm:py-2 space-y-3.5 sm:space-y-4">
          {/* Subtle Ambient Left & Right Gradient Edge Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 md:w-36 bg-gradient-to-r from-[#0E0A07] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 md:w-36 bg-gradient-to-l from-[#0E0A07] to-transparent z-10" />

          {/* Line 1: Moving Continuously to the Left */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee-left flex items-center gap-3 sm:gap-3.5 md:gap-4" aria-hidden="true">
              {line1Items.map((item, idx) => renderCard(item, "row1", idx))}
            </div>
          </div>

          {/* Line 2: Moving Continuously to the Right */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee-right flex items-center gap-3 sm:gap-3.5 md:gap-4" aria-hidden="true">
              {line2Items.map((item, idx) => renderCard(item, "row2", idx))}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 4. EXPLORE ALL 29 AMENITIES BUTTON (IDENTICAL TO SCREENSHOT) */}
        {/* ========================================================== */}
        <div className="flex items-center justify-center pt-2 sm:pt-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group px-7 py-3 min-h-[44px] rounded-xl bg-transparent hover:bg-[#E5C178]/10 border border-[#E5C178]/70 hover:border-[#E5C178] text-sm font-sans font-semibold text-[#E5C178] transition-all duration-200 cursor-pointer flex items-center gap-2.5 shadow-sm"
          >
            <span>Explore all 29 amenities</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>

      {/* ========================================================== */}
      {/* 5. COMPLETE 29 AMENITIES DIRECTORY MODAL                   */}
      {/* ========================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-amenities-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#0E0A07]/85 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[rgba(34,24,16,0.96)] border border-[rgba(212,163,89,0.28)] shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden z-10 animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4.5 bg-[rgba(34,24,16,0.98)] backdrop-blur-md border-b border-[rgba(212,163,89,0.18)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5C178]" />
                  <span className="text-xs font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase">
                    COMPLETE FLATEL RESIDENCE DIRECTORY
                  </span>
                </div>
                <h3
                  id="all-amenities-dialog-title"
                  className="font-heading text-xl sm:text-2xl font-semibold text-[#FAF4EB] mt-0.5 tracking-normal"
                >
                  All 29 Master Inclusions
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 w-9 rounded-lg bg-[rgba(22,16,11,0.7)] border border-[rgba(212,163,89,0.25)] flex items-center justify-center text-[#D4C4B3] hover:text-[#FAF4EB] hover:border-[#E5C178] transition-colors cursor-pointer"
                aria-label="Close amenities dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: All 6 Categories */}
            <div className="p-6 overflow-y-auto space-y-7 flex-1">
              {AMENITY_CATEGORIES.map((category) => {
                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[rgba(212,163,89,0.18)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5C178]" />
                      <h4 className="font-heading text-base sm:text-lg font-semibold text-[#FAF4EB] tracking-normal">
                        {category.title}
                      </h4>
                      <span className="text-xs sm:text-sm text-[#D4C4B3]">
                        ({category.items.length} items)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="p-3 sm:p-3.5 rounded-xl bg-[rgba(22,16,11,0.7)] border border-[rgba(212,163,89,0.2)] flex items-center gap-3 hover:border-[#E5C178]/40 transition-colors"
                          >
                            <div className="h-9 w-9 rounded-full bg-[rgba(34,24,16,0.9)] border border-[rgba(212,163,89,0.3)] flex items-center justify-center text-[#E5C178] shrink-0">
                              <ItemIcon className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-sm sm:text-[15px] font-medium text-[#FAF4EB]">
                              {item.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-20 px-6 py-4 bg-[rgba(34,24,16,0.98)] backdrop-blur-md border-t border-[rgba(212,163,89,0.18)] flex items-center justify-between text-xs sm:text-sm text-[#D4C4B3]">
              <span>Verified standard inclusions across all Barkas &amp; Moghal Pura flats</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm hover:brightness-105 transition-all cursor-pointer min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
