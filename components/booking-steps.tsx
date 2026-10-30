"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 4 Core FLATEL Stay Guarantees & Booking Journey
 */
const FLATEL_GUARANTEES = [
  {
    label: "20% TO RESERVE",
    labelAr: "٢٠٪ لتأكيد الحجز",
    sub: "Pay balance at check-in",
    subAr: "ادفع الباقي عند تسجيل الوصول",
    icon: CreditCard,
  },
  {
    label: "FREE 48H CANCEL",
    labelAr: "إلغاء مجاني حتى ٤٨ ساعة",
    sub: "100% refund guarantee",
    subAr: "استرداد كامل ١٠٠٪ للعربون",
    icon: ShieldCheck,
  },
  {
    label: "WHATSAPP CHECK-IN",
    labelAr: "تسجيل وصول عبر واتساب",
    sub: "Check-in details by WhatsApp",
    subAr: "تفاصيل الوصول مباشرة على جوالك",
    icon: Smartphone,
  },
  {
    label: "HOUSEKEEPING INCLUDED",
    labelAr: "خدمة تنظيف مشمولة",
    sub: "Fresh linens & tidy spaces",
    subAr: "مفارش نظيفة وعناية دورية",
    icon: Sparkles,
  },
];

export function BookingSteps({ className }: { className?: string }) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const localePrefix = isAr ? "/ar" : "";

  return (
    <section
      id="how-it-works"
      className={cn(
        "relative w-full bg-canvas text-fg py-16 sm:py-20 lg:py-24 select-none overflow-hidden",
        className
      )}
      aria-labelledby="how-it-works-heading"
    >
      {/* Luxury Radial Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold)_12%,transparent),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container-page relative z-10">
        {/* ========================================================== */}
        {/* 1. TOP HEADER                                              */}
        {/* ========================================================== */}
        <div className="text-center mb-10 sm:mb-12">
          <h2
            id="how-it-works-heading"
            className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase"
          >
            {isAr ? "كيفية الحجز وضمانات الإقامة" : "HOW IT WORKS & STAY GUARANTEES"}
          </h2>
        </div>

        {/* ========================================================== */}
        {/* 2. FOUR DISTINCT GUARANTEE BADGES (STREAMLINED TRUST ROW)   */}
        {/* ========================================================== */}
        <div data-stagger className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-start justify-items-center mb-12 sm:mb-14 max-w-4xl mx-auto">
          {FLATEL_GUARANTEES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center group cursor-default"
              >
                {/* Circular Gold Badge */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-line bg-raised/65 flex items-center justify-center text-gold shadow-lg shadow-gold/10 transition-all duration-300 group-hover:scale-105 group-hover:border-gold group-hover:shadow-gold/25 group-hover:bg-raised-hover/80">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
                </div>

                {/* Step Label */}
                <span className="text-xs sm:text-sm font-sans font-bold text-fg tracking-[0.14em] uppercase mt-3 leading-snug group-hover:text-gold transition-colors">
                  {isAr ? item.labelAr : item.label}
                </span>
                <span className="text-xs sm:text-sm text-fg-soft mt-1 font-medium leading-relaxed">
                  {isAr ? item.subAr : item.sub}
                </span>
              </div>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* 3. GOLD BORDER CARD: SELECT. RESERVE. RELAX. (REFERENCE)   */}
        {/* ========================================================== */}
        <div className="border-y border-line py-9 sm:py-11 relative overflow-hidden">
          {/* Subtle Ambient Shimmer */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_12%,transparent),transparent_60%)]"
            aria-hidden="true"
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-10 relative z-10">
            {/* -------------------------------------------------------- */}
            {/* LEFT: SELECT. RESERVE. RELAX.                            */}
            {/* -------------------------------------------------------- */}
            <div data-stagger className={cn("flex flex-col items-center shrink-0", isAr ? "md:items-end text-center md:text-right" : "md:items-start text-center md:text-left")}>
              <span className="font-heading font-medium text-4xl sm:text-5xl lg:text-5xl text-gold tracking-normal leading-[1.05]">
                {isAr ? "اختر." : "SELECT."}
              </span>
              <span className="font-heading font-medium text-4xl sm:text-5xl lg:text-5xl text-gold tracking-normal leading-[1.05]">
                {isAr ? "احجز." : "RESERVE."}
              </span>
              <span className="font-heading font-medium text-4xl sm:text-5xl lg:text-5xl text-gold tracking-normal leading-[1.05]">
                {isAr ? "استرخِ." : "RELAX."}
              </span>
            </div>

            {/* VERTICAL DIVIDER LINE (DESKTOP) */}
            <div
              className="hidden md:block w-[1px] h-32 bg-gold/25 self-center shrink-0"
              aria-hidden="true"
            />

            {/* -------------------------------------------------------- */}
            {/* MIDDLE: 3 SIMPLE STEPS TO BOOK                           */}
            {/* -------------------------------------------------------- */}
            <div className={cn("flex-1 w-full max-w-lg", isAr ? "text-right" : "text-left")}>
              <div className="text-xs sm:text-sm font-sans font-bold text-gold tracking-[0.14em] uppercase mb-4">
                {isAr ? "احجز في ٣ خطوات بسيطة" : "BOOK IN 3 SIMPLE STEPS"}
              </div>

              {/* 3 Steps List with Circular Gold Checkmarks */}
              <div className="space-y-4 text-sm sm:text-base text-fg font-medium leading-relaxed">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                  <span>
                    {isAr ? (
                      <>
                        <strong className="text-gold font-bold">١. اختر شقتك:</strong> تصفح تفاصيل الشقق الفندقية وصورها
                      </>
                    ) : (
                      <>
                        <strong className="text-gold font-bold">1. Select Your Residence:</strong> Browse residence details and photos
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                  <span>
                    {isAr ? (
                      <>
                        <strong className="text-gold font-bold">٢. ثبّت حجزك بعربون ٢٠٪:</strong> ادفع ٢٠٪ فقط عبر البطاقة البنكية أو رمز الاستجابة السريعة
                      </>
                    ) : (
                      <>
                        <strong className="text-gold font-bold">2. Reserve with 20% Deposit:</strong> Pay only 20% advance via UPI QR or Card
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                  <span>
                    {isAr ? (
                      <>
                        <strong className="text-gold font-bold">٣. الوصول وسداد الباقي:</strong> استلم شقتك وسدد المبلغ المتبقي عند مكتب الاستقبال
                      </>
                    ) : (
                      <>
                        <strong className="text-gold font-bold">3. Arrive &amp; Settle Balance:</strong> Check in with the property team and pay the remaining balance at the desk
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Booking Reassurance & Action */}
              <div className="mt-5 pt-4 border-t border-line-soft flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-fg-soft flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span>
                    {isAr
                      ? "إلغاء مجاني حتى ٤٨ ساعة قبل الموعد · استرداد ١٠٠٪ للعربون"
                      : "Free Cancellation up to 48 hours prior · 100% Refund"}
                  </span>
                </span>

                <Link
                  href={`${localePrefix}/policies`}
                  className="text-xs sm:text-sm font-semibold text-gold hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isAr ? "عرض شروط وسياسات الحجز" : "View Cancellation Terms"}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* RIGHT: ELEGANT GOLD BOTANICAL LEAF BRANCH (EXACT MATCH)   */}
            {/* -------------------------------------------------------- */}
            <div className="hidden lg:flex items-center justify-center shrink-0 pr-2 rtl:pr-0 rtl:pl-2">
              <svg
                viewBox="0 0 160 210"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-32 h-44 xl:w-36 xl:h-48 text-gold opacity-85 select-none pointer-events-none drop-shadow-[0_2px_12px_color-mix(in_srgb,var(--gold)_20%,transparent)]"
                aria-hidden="true"
              >
                {/* Main Curved Botanical Stem */}
                <path
                  d="M 80 205 Q 82 115 118 12"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Bottom Left Leaf */}
                <path
                  d="M 83 175 C 50 160 48 135 78 140 C 85 150 86 165 83 175 Z"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="1.5"
                  fill="url(#leafGoldFill)"
                />
                <path d="M 78 144 Q 65 155 83 170" stroke="url(#leafGoldStroke)" strokeWidth="1" />

                {/* Lower Right Leaf */}
                <path
                  d="M 86 145 C 122 130 120 105 92 112 C 86 122 85 136 86 145 Z"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="1.5"
                  fill="url(#leafGoldFill)"
                />
                <path d="M 92 114 Q 107 125 86 140" stroke="url(#leafGoldStroke)" strokeWidth="1" />

                {/* Mid Left Leaf */}
                <path
                  d="M 92 112 C 58 98 60 72 88 80 C 94 90 93 103 92 112 Z"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="1.5"
                  fill="url(#leafGoldFill)"
                />
                <path d="M 88 82 Q 74 93 92 107" stroke="url(#leafGoldStroke)" strokeWidth="1" />

                {/* Upper Right Leaf */}
                <path
                  d="M 100 80 C 134 68 132 44 106 52 C 100 62 99 72 100 80 Z"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="1.5"
                  fill="url(#leafGoldFill)"
                />
                <path d="M 106 54 Q 120 63 100 75" stroke="url(#leafGoldStroke)" strokeWidth="1" />

                {/* Upper Left Leaf */}
                <path
                  d="M 106 50 C 80 38 82 18 102 24 C 107 32 107 42 106 50 Z"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="1.5"
                  fill="url(#leafGoldFill)"
                />

                {/* Apex Top Bud Leaf */}
                <path
                  d="M 118 15 C 114 2 128 0 124 16 Z"
                  stroke="url(#leafGoldStroke)"
                  strokeWidth="1.5"
                  fill="url(#leafGoldFill)"
                />

                <defs>
                  <linearGradient id="leafGoldStroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--fg)" />
                    <stop offset="60%" stopColor="var(--gold)" />
                    <stop offset="100%" stopColor="var(--gold-deep)" />
                  </linearGradient>
                  <linearGradient id="leafGoldFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
