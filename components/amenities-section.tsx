"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Wifi,
  AirVent,
  Tv,
  Flame,
  BedDouble,
  DoorClosed,
  Laptop,
  Layers,
  Refrigerator,
  Droplets,
  Microwave,
  Coffee,
  Utensils,
  CookingPot,
  Blend,
  UtensilsCrossed,
  ShoppingBag,
  ShowerHead,
  Sparkles,
  Zap,
  WashingMachine,
  BatteryCharging,
  Clock,
  Headphones,
  ShieldCheck,
  Baby,
  Gamepad2,
  Trophy,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AmenityItem {
  id: string;
  name: string;
  detail: string;
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

/**
 * 29 Master Inclusions categorized strictly per final-prd.md (Section 5)
 * Every amenity features an authentic, semantically matched Lucide icon and micro-detail.
 */
export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    id: "living-bedroom",
    title: "Living Room & Bedroom Comfort",
    subtitle: "Climate-controlled suites, quiet ergonomic workspaces & smart entertainment",
    shortLabel: "Living & Bedroom",
    items: [
      { id: "wifi", name: "High-Speed Wi-Fi", detail: "High-speed optical fiber across all rooms", category: "Living & Bedroom", icon: Wifi, isFlagship: true },
      { id: "ac", name: "Split Air Conditioning", detail: "Individual climate control in living & bedrooms", category: "Living & Bedroom", icon: AirVent, isFlagship: true },
      { id: "heater", name: "Room Heater", detail: "Supplemental winter heating upon request", category: "Living & Bedroom", icon: Flame },
      { id: "tv", name: "Smart TV with OTT", detail: "HD display with built-in streaming apps", category: "Living & Bedroom", icon: Tv, isFlagship: true },
      { id: "linens", name: "Premium Fresh Linens", detail: "Sanitized bedsheets, comforters & soft pillows", category: "Living & Bedroom", icon: BedDouble },
      { id: "wardrobe", name: "Wardrobe & Closet", detail: "Full-height wardrobe with hangers & storage", category: "Living & Bedroom", icon: DoorClosed },
      { id: "laptop", name: "Dedicated Laptop Table", detail: "Ergonomic work desk with power outlets", category: "Living & Bedroom", icon: Laptop },
      { id: "flooring", name: "Wooden Finish Flooring", detail: "Elegant wooden textured floor in master suites", category: "Living & Bedroom", icon: Layers },
    ],
  },
  {
    id: "kitchen-dining",
    title: "Kitchen & Dining Essentials",
    subtitle: "Private modular kitchen with piped gas, double-door refrigeration & complete cookware",
    shortLabel: "Kitchen & Dining",
    items: [
      { id: "fridge", name: "Double-Door Refrigerator", detail: "Full refrigeration with separate freezer section", category: "Kitchen & Dining", icon: Refrigerator, isFlagship: true },
      { id: "ro", name: "RO Water Purifier", detail: "Multi-stage reverse osmosis drinking water", category: "Kitchen & Dining", icon: Droplets, isFlagship: true },
      { id: "stove", name: "Gas Stove with Piped Gas", detail: "Safe 2-burner gas stove with continuous supply", category: "Kitchen & Dining", icon: Flame, isFlagship: true },
      { id: "microwave", name: "Microwave Oven", detail: "Digital microwave for reheating & defrosting", category: "Kitchen & Dining", icon: Microwave },
      { id: "kettle", name: "Electric Water Kettle", detail: "Fast-boiling stainless steel kettle for tea & coffee", category: "Kitchen & Dining", icon: Coffee },
      { id: "toaster", name: "Bread Toaster", detail: "Quick morning breakfast toaster with browning dial", category: "Kitchen & Dining", icon: Utensils },
      { id: "rice", name: "Automatic Rice Cooker", detail: "One-touch electric cooker with keep-warm mode", category: "Kitchen & Dining", icon: CookingPot },
      { id: "mixer", name: "Mixer & Grinder", detail: "Multi-jar mixer grinder for family meal prep", category: "Kitchen & Dining", icon: Blend },
      { id: "crockery", name: "Complete Cookware & Cutlery", detail: "Non-stick pans, plates, bowls, cups & cutlery", category: "Kitchen & Dining", icon: UtensilsCrossed },
      { id: "staples", name: "Starter Kitchen Staples", detail: "Complimentary tea, sugar, salt & basic spices", category: "Kitchen & Dining", icon: ShoppingBag },
    ],
  },
  {
    id: "bathroom-care",
    title: "Bathroom & Personal Care",
    subtitle: "En-suite bathrooms with specialized water-softening geysers & fresh toiletries",
    shortLabel: "Bathroom & Care",
    items: [
      { id: "geyser", name: "Water Softening Geyser", detail: "24/7 hot water with hair & skin softener", category: "Bathroom & Care", icon: ShowerHead, isFlagship: true },
      { id: "toiletries", name: "Premium Toiletries", detail: "Body wash, shampoo, dental kits & fresh towels", category: "Bathroom & Care", icon: Sparkles },
    ],
  },
  {
    id: "power-laundry",
    title: "Power, Laundry & Convenience",
    subtitle: "Continuous 24/7 power backup and in-unit automated washer-dryer convenience",
    shortLabel: "Power & Laundry",
    items: [
      { id: "inverter", name: "24/7 Inverter Power Backup", detail: "Continuous backup for lights, fans, Wi-Fi & TV", category: "Power & Laundry", icon: Zap, isFlagship: true },
      { id: "washer", name: "AI Front-Load Washer", detail: "Automated in-unit washing with free detergent", category: "Power & Laundry", icon: WashingMachine, isFlagship: true },
      { id: "charger", name: "Universal Charging Station", detail: "Multi-pin cords for Type-C, Lightning & Micro-USB", category: "Power & Laundry", icon: BatteryCharging },
    ],
  },
  {
    id: "hospitality-care",
    title: "Hospitality & Guest Services",
    subtitle: "Scheduled alternate-day housekeeping, 24/7 front desk support & dedicated CCTV security",
    shortLabel: "Hospitality & Care",
    items: [
      { id: "housekeeping", name: "Alternate-Day Housekeeping", detail: "Sanitized cleaning, linen renewal & trash removal", category: "Hospitality & Care", icon: Clock, isFlagship: true },
      { id: "concierge", name: "24×7 Front Desk & Support", detail: "Round-the-clock guest assistance & local guide", category: "Hospitality & Care", icon: Headphones, isFlagship: true },
      { id: "security", name: "24/7 CCTV & Secure Entry", detail: "Continuous monitoring in common areas & lobby", category: "Hospitality & Care", icon: ShieldCheck },
    ],
  },
  {
    id: "family-recreation",
    title: "Family, Games & Recreation",
    subtitle: "Attentive comforts for visiting infants, playful children & evening relaxation",
    shortLabel: "Family & Recreation",
    items: [
      { id: "cot", name: "Infant Baby Cot", detail: "Safe wooden baby crib with mattress (on request)", category: "Family & Recreation", icon: Baby },
      { id: "indoor", name: "Family Board Games", detail: "Carrom board, Chess, Ludo & playing cards", category: "Family & Recreation", icon: Gamepad2 },
      { id: "outdoor", name: "Sports & Play Equipment", detail: "Badminton racquets, shuttles & kids football", category: "Family & Recreation", icon: Trophy },
    ],
  },
];

// Flat list of all 29 inclusions
export const ALL_AMENITIES_LIST: AmenityItem[] = AMENITY_CATEGORIES.flatMap((c) => c.items);

// Backward compatibility export
export const AMENITY_GRID_CARDS: AmenityItem[] = ALL_AMENITIES_LIST;

// 10 Key Flagship Highlights for the Default Clean View
export const HIGHLIGHTS_ITEMS: AmenityItem[] = [
  { id: "wifi", name: "High-Speed Wi-Fi", detail: "Optical fiber in all rooms", category: "Living & Bedroom", icon: Wifi, isFlagship: true },
  { id: "ac", name: "Split Air Conditioning", detail: "Climate-controlled suites", category: "Living & Bedroom", icon: AirVent, isFlagship: true },
  { id: "inverter", name: "24/7 Power Backup", detail: "Continuous inverter support", category: "Power & Laundry", icon: Zap, isFlagship: true },
  { id: "fridge", name: "Double-Door Refrigerator", detail: "With separate freezer", category: "Kitchen & Dining", icon: Refrigerator, isFlagship: true },
  { id: "stove", name: "Piped Gas Stove", detail: "Modular kitchen setup", category: "Kitchen & Dining", icon: Flame, isFlagship: true },
  { id: "ro", name: "RO Water Purifier", detail: "Pure drinking water on tap", category: "Kitchen & Dining", icon: Droplets, isFlagship: true },
  { id: "geyser", name: "Water Softening Geyser", detail: "24/7 hot shower water", category: "Bathroom & Care", icon: ShowerHead, isFlagship: true },
  { id: "washer", name: "AI Front-Load Washer", detail: "In-unit automated laundry", category: "Power & Laundry", icon: WashingMachine, isFlagship: true },
  { id: "tv", name: "Smart TV with OTT", detail: "HD streaming entertainment", category: "Living & Bedroom", icon: Tv, isFlagship: true },
  { id: "housekeeping", name: "Alternate-Day Housekeeping", detail: "Sanitization & fresh linens", category: "Hospitality & Care", icon: Clock, isFlagship: true },
];

export const ARABIC_AMENITIES_TRANSLATIONS: Record<string, { name: string; detail: string }> = {
  wifi: { name: "إنترنت فائق السرعة", detail: "ألياف ضوئية قوية في كافة الغرف" },
  ac: { name: "تكييف سبليت مستقل", detail: "تحكم منفصل بالحرارة في كل غرفة" },
  heater: { name: "مدفأة غرف", detail: "تدفئة إضافية متوفرة عند الطلب" },
  tv: { name: "شاشة ذكية مع تطبيقات البث", detail: "شاشة عالية الدقة مع قنوات رقمية" },
  linens: { name: "مفارش وشراشف نقية", detail: "أغطية معقمة ووسائد فندقية مريحة" },
  wardrobe: { name: "خزانة ملابس كاملة", detail: "خزانة واسعة مع علاقات وأرفف" },
  laptop: { name: "مكتب عمل مخصص", detail: "طاولة عمل مريحة مع منافذ طاقة" },
  flooring: { name: "أرضيات بتشطيب خشبي", detail: "أرضيات خشبية أنيقة في الأجنحة" },
  fridge: { name: "ثلاجة كبيرة ببابين", detail: "تبريد كامل مع فريزر منفصل" },
  ro: { name: "فلتر تنقية مياه الشرب (RO)", detail: "مياه شرب نقية مكررة عبر التناضح العكسي" },
  stove: { name: "موقد غاز طبيعي", detail: "موقد آمن مع إمداد غاز مستمر مجاناً" },
  microwave: { name: "فرن ميكروويف", detail: "ميكروويف لتسخين وتجهيز الأطعمة بسرعة" },
  kettle: { name: "غلاية مياه كهربائية", detail: "غلاية سريعة للشاي والقهوة" },
  toaster: { name: "محمصة خبز", detail: "محمصة إفطار كهربائية سريعة" },
  rice: { name: "طباخة أرز كهربائية", detail: "طهي بلمسة واحدة مع حفظ الحرارة" },
  mixer: { name: "خلاط ومطحنة كهربائية", detail: "خلاط متعدد الاستخدامات للوجبات" },
  crockery: { name: "أواني وأدوات مائدة كاملة", detail: "أواني طهي وصحون وأكواب وملاعق" },
  staples: { name: "أساسيات مطبخ مجانية", detail: "شاي، سكر، ملح وتوابل عند الوصول" },
  geyser: { name: "سخان مياه فوري", detail: "مياه دافئة على مدار الساعة" },
  toiletries: { name: "مستلزمات نظافة فاخرة", detail: "شامبو، صابون، مناشف ومجموعات عناية" },
  inverter: { name: "مولد كهرباء احتياطي ٢٤/٧", detail: "تشغيل متواصل للإنارة والمراوح والإنترنت" },
  washer: { name: "غسالة ملابس آلية", detail: "غسيل آلي داخل الشقة مع مسحوق مجاني" },
  charger: { name: "شاحن متعدد المنافذ", detail: "وصلات شحن لكافة أنواع الأجهزة" },
  housekeeping: { name: "تنظيف فندقي دوري", detail: "تنظيف شامل يوماً بعد يوم مجاناً" },
  desk: { name: "استقبال ومساعد ضيوف ٢٤/٧", detail: "فريق محلي متخصص لخدمتكم بأي وقت" },
  cctv: { name: "حراسة وكاميرات مراقبة", detail: "أمان تام للمبنى ومداخل الشقق" },
  parking: { name: "مواقف سيارات آمنة", detail: "مواقف مجانية خاصة بسيارات النزلاء" },
  "baby-cot": { name: "سرير أطفال رضع مجاني", detail: "سرير مريح وآمن للأطفال دون رسوم" },
  "board-games": { name: "ألعاب لوحية عائلية", detail: "ألعاب ترفيهية مسلية لكافة أفراد العائلة" },
};

export const ARABIC_CATEGORIES_TRANSLATIONS: Record<string, { title: string; subtitle: string; shortLabel: string }> = {
  "living-bedroom": {
    title: "راحة غرف النوم والمعيشة",
    subtitle: "أجنحة مكيفة ومساحات عمل مريحة وترفيه ذكي",
    shortLabel: "المعيشة والنوم",
  },
  "kitchen-dining": {
    title: "تجهيزات المطبخ وتناول الطعام",
    subtitle: "مطبخ مستقل بالغاز الطبيعي، ثلاجة ببابين وأواني طهي كاملة",
    shortLabel: "المطبخ والطعام",
  },
  "bathroom-care": {
    title: "الحمام والعناية الشخصية",
    subtitle: "دورات مياه خاصة مزودة بسخانات فورية ومستلزمات نظافة فاخرة",
    shortLabel: "الحمام والعناية",
  },
  "power-laundry": {
    title: "الكهرباء والغسيل والراحة",
    subtitle: "مولد كهرباء احتياطي ٢٤/٧ وغسالة ملابس آلية داخل الشقة",
    shortLabel: "الكهرباء والغسيل",
  },
  "hospitality-care": {
    title: "خدمات الضيافة والعناية بالنزلاء",
    subtitle: "تنظيف فندقي دوري، مكتب استقبال على مدار الساعة وحراسة أمنية",
    shortLabel: "خدمات الضيافة",
  },
  "family-recreation": {
    title: "تجهيزات العائلة والترفيه",
    subtitle: "أسرّة للأطفال الرضع وألعاب عائلية مسلية مجاناً",
    shortLabel: "العائلة والترفيه",
  },
};

// Filter pills for the compact section
const FILTER_TABS = [
  { id: "highlights", label: "Highlights", labelAr: "أبرز المزايا", count: 10 },
  { id: "living-bedroom", label: "Living & Bedroom", labelAr: "المعيشة والنوم", count: 8 },
  { id: "kitchen-dining", label: "Kitchen & Dining", labelAr: "المطبخ والطعام", count: 10 },
  { id: "bathroom-care", label: "Bathroom & Care", labelAr: "الحمام والعناية", count: 2 },
  { id: "power-laundry", label: "Power & Laundry", labelAr: "الكهرباء والغسيل", count: 3 },
  { id: "hospitality-care", label: "Hospitality & Care", labelAr: "خدمات الضيافة", count: 3 },
  { id: "family-recreation", label: "Family & Recreation", labelAr: "العائلة والترفيه", count: 3 },
];

interface AmenitiesSectionProps {
  className?: string;
}

export function AmenitiesSection({ className }: AmenitiesSectionProps) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");

  const [activeFilter, setActiveFilter] = React.useState<string>("highlights");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalActiveTab, setModalActiveTab] = React.useState<string>("all");

  // Helper to localize single amenity item
  const getLocalizedItem = React.useCallback(
    (item: AmenityItem): AmenityItem => {
      if (!isAr) return item;
      const trans = ARABIC_AMENITIES_TRANSLATIONS[item.id];
      if (!trans) return item;
      return {
        ...item,
        name: trans.name,
        detail: trans.detail,
      };
    },
    [isAr]
  );

  // Compute items for the active filter tab
  const displayedItems = React.useMemo(() => {
    let rawItems: AmenityItem[];
    if (activeFilter === "highlights") {
      rawItems = HIGHLIGHTS_ITEMS;
    } else {
      const cat = AMENITY_CATEGORIES.find((c) => c.id === activeFilter);
      rawItems = cat ? cat.items : HIGHLIGHTS_ITEMS;
    }
    return rawItems.map(getLocalizedItem);
  }, [activeFilter, getLocalizedItem]);

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

  // Filtered categories for the modal
  const modalCategories = React.useMemo(() => {
    const list = modalActiveTab === "all"
      ? AMENITY_CATEGORIES
      : AMENITY_CATEGORIES.filter((c) => c.id === modalActiveTab);

    if (!isAr) return list;

    return list.map((category) => {
      const catTrans = ARABIC_CATEGORIES_TRANSLATIONS[category.id];
      return {
        ...category,
        title: catTrans?.title || category.title,
        subtitle: catTrans?.subtitle || category.subtitle,
        shortLabel: catTrans?.shortLabel || category.shortLabel,
        items: category.items.map(getLocalizedItem),
      };
    });
  }, [modalActiveTab, isAr, getLocalizedItem]);

  return (
    <section
      id="amenities"
      className={cn(
        "scroll-mt-20 relative w-full bg-canvas text-fg py-14 sm:py-18 select-none overflow-hidden",
        className
      )}
      aria-labelledby="amenities-heading"
    >
      {/* Subtle Warm Luxury Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[550px] bg-ambient-gold-glow opacity-70"
        aria-hidden="true"
      />

      <div className="container-page relative z-10 space-y-7 sm:space-y-8">
        
        {/* ========================================================== */}
        {/* 1. TOP HEADER SECTION                                      */}
        {/* ========================================================== */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <p className="text-xs font-sans font-semibold tracking-[0.14em] text-gold uppercase">
            {isAr ? "خدمات وتجهيزات فندقية متكاملة" : "THE FLATEL EXPERIENCE"}
          </p>

          <h2
            id="amenities-heading"
            className="font-heading text-fg heading-section"
          >
            {isAr ? (
              <>
                كل ما تحتاجه{" "}
                <span className="font-heading italic text-gold">
                  لتشعر وكأنك في بيتك.
                </span>
              </>
            ) : (
              <>
                Everything you need to{" "}
                <span className="font-heading italic text-gold">
                  feel at home.
                </span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-fg-soft font-sans font-normal max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "مساحات مصممة بعناية مع تجهيزات ومرافق عصرية لإقامة غاية في الراحة."
              : "Thoughtfully designed spaces with modern amenities for a comfortable stay."}
          </p>
        </div>

        {/* ========================================================== */}
        {/* 2. CATEGORY PILLS (RESPONSIVE WRAP, NO CLIPPING)          */}
        {/* ========================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-4xl mx-auto pt-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 min-h-[36px] rounded-full text-xs font-sans font-medium tracking-wide transition-all duration-200 cursor-pointer shrink-0 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  isActive
                    ? "bg-gold text-ink font-semibold shadow-sm shadow-gold/30"
                    : "bg-surface text-fg-soft hover:text-fg hover:bg-raised border border-line-soft"
                )}
                aria-pressed={isActive}
              >
                <span>{isAr ? tab.labelAr : tab.label}</span>
                <span className={cn(
                  "ml-1.5 text-xs px-1.5 py-0.2 rounded-full",
                  isActive ? "bg-ink/20 text-ink" : "bg-gold/12 text-gold"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* 3. HUMAN-CRAFTED AMENITIES SHOWCASE                        */}
        {/* Clean, balanced layout with semantic icons & micro-details */}
        {/* ========================================================== */}
        <div className="w-full pt-2 pb-1">
          <div data-stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {displayedItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-raised/90 border border-line flex items-center justify-center text-gold shrink-0 group-hover:scale-105 transition-transform">
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  <div className={cn("min-w-0 flex-1", isAr ? "text-right" : "text-left")}>
                    <h3 className="text-xs sm:text-sm font-medium text-fg group-hover:text-gold transition-colors leading-snug truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-fg-faint leading-tight line-clamp-1 mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================== */}
        {/* 4. EXPLORE ALL 29 AMENITIES BUTTON                         */}
        {/* ========================================================== */}
        <div className="flex flex-col items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setModalActiveTab("all");
              setIsModalOpen(true);
            }}
            className="group px-6 py-2.5 min-h-[42px] rounded-xl bg-transparent hover:bg-gold/10 border border-gold/70 hover:border-gold text-xs sm:text-sm font-sans font-semibold text-gold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>{isAr ? "استكشف دليل كافة التجهيزات الـ ٢٩" : "Explore all 29 amenities directory"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </button>
          <span className="text-xs text-fg-faint">
            {isAr
              ? "مزايا شاملة في المعيشة، المطبخ، الكهرباء، العناية والترفيه"
              : "Complete inclusions across living, kitchen, power, care & recreation"}
          </span>
        </div>

      </div>

      {/* ========================================================== */}
      {/* 5. COMPLETE 29 AMENITIES DIRECTORY MODAL                   */}
      {/* Spacious, uncrowded layout with category quick-filter tabs */}
      {/* ========================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-amenities-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-200"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-canvas/85 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-surface border border-line shadow-[0_24px_64px_rgba(0,0,0,0.9)] overflow-hidden z-10 animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 px-6 sm:px-8 py-5 bg-surface/98 backdrop-blur-md border-b border-line-soft flex items-start justify-between gap-4">
              <div className={cn(isAr ? "text-right" : "text-left")}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-xs font-sans font-semibold tracking-[0.14em] text-gold uppercase">
                    {isAr ? "دليل مرافق وتجهيزات فلاتيل" : "FLATEL RESIDENCE DIRECTORY"}
                  </span>
                </div>
                <h3
                  id="all-amenities-dialog-title"
                  className="font-heading text-xl sm:text-2xl font-semibold text-fg mt-0.5 tracking-normal"
                >
                  {isAr ? "كافة التجهيزات الأساسية الـ ٢٩" : "All 29 Master Inclusions"}
                </h3>
                <p className="text-xs text-fg-muted mt-0.5 font-sans">
                  {isAr
                    ? "تجهيزات قياسية معتمدة متوفرة في كافة شقق باركاس ومغل بورا الفندقية."
                    : "Verified standard inclusions across all Barkas & Moghal Pura serviced apartments."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 w-9 rounded-full bg-surface border border-line flex items-center justify-center text-fg-soft hover:text-fg hover:border-gold transition-colors cursor-pointer shrink-0 mt-1"
                aria-label="Close amenities dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-Modal Category Quick-Filter Pills (Prevents Crowding) */}
            <div className="px-6 sm:px-8 py-3 bg-surface border-b border-line-soft flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setModalActiveTab("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-colors cursor-pointer",
                  modalActiveTab === "all"
                    ? "bg-gold text-ink font-bold"
                    : "bg-raised text-fg-soft hover:text-fg"
                )}
              >
                {isAr ? "الكل (٢٩)" : "All (29)"}
              </button>
              {AMENITY_CATEGORIES.map((cat) => {
                const label = isAr ? ARABIC_CATEGORIES_TRANSLATIONS[cat.id]?.shortLabel || cat.shortLabel : cat.shortLabel;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setModalActiveTab(cat.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-colors cursor-pointer",
                      modalActiveTab === cat.id
                        ? "bg-gold text-ink font-bold"
                        : "bg-raised text-fg-soft hover:text-fg"
                    )}
                  >
                    {label} ({cat.items.length})
                  </button>
                );
              })}
            </div>

            {/* Modal Body: Spacious, Breathable Categorized List */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              {modalCategories.map((category) => {
                return (
                  <div key={category.id} className="space-y-4">
                    {/* Category Title & Description */}
                    <div className="border-b border-line-soft pb-2.5 flex items-baseline justify-between">
                      <div className={cn(isAr ? "text-right" : "text-left")}>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                          <h4 className="font-heading text-lg sm:text-xl font-medium text-fg tracking-normal">
                            {category.title}
                          </h4>
                        </div>
                        <p className={cn("text-xs text-fg-faint mt-0.5", isAr ? "pr-3.5" : "pl-3.5")}>
                          {category.subtitle}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-fg-soft shrink-0 ml-4">
                        {isAr ? `${category.items.length} مزايا` : `${category.items.length} items`}
                      </span>
                    </div>

                    {/* Generous 2-Column Item Grid with Semantic Icons & Details (Uncrowded) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-1">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3.5 py-1 text-fg group"
                          >
                            <div className="w-7 h-7 rounded-md bg-raised/80 border border-line flex items-center justify-center text-gold shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className={cn("min-w-0 flex-1", isAr ? "text-right" : "text-left")}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-fg group-hover:text-gold transition-colors leading-tight">
                                  {item.name}
                                </span>
                              </div>
                              <p className="text-xs text-fg-muted leading-relaxed mt-0.5">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-20 px-6 sm:px-8 py-4 bg-surface/98 backdrop-blur-md border-t border-line-soft flex items-center justify-between text-xs sm:text-sm text-fg-soft">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span className="hidden sm:inline">
                  {isAr ? "جميع المزايا الـ ٢٩ مشمولة ومؤكدة مجاناً مع كل حجز" : "100% verified complimentary inclusions with every booking"}
                </span>
                <span className="sm:hidden">
                  {isAr ? "٢٩ ميزة مؤكدة" : "All 29 inclusions verified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs sm:text-sm hover:brightness-105 transition-all cursor-pointer min-h-[38px]"
              >
                {isAr ? "تم" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
