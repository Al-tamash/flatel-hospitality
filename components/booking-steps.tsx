"use client";

import * as React from "react";
import Link from "next/link";
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
    sub: "Pay balance at check-in",
    icon: CreditCard,
  },
  {
    label: "FREE 48H CANCEL",
    sub: "100% refund guarantee",
    icon: ShieldCheck,
  },
  {
    label: "WHATSAPP CHECK-IN",
    sub: "Check-in details by WhatsApp",
    icon: Smartphone,
  },
  {
    label: "HOUSEKEEPING INCLUDED",
    sub: "Fresh linens & tidy spaces",
    icon: Sparkles,
  },
];

export function BookingSteps({ className }: { className?: string }) {
  return (
    <section
      id="how-it-works"
      className={cn(
        "relative w-full bg-[#0E0A07] text-[#FAF4EB] py-16 sm:py-20 lg:py-24 select-none overflow-hidden",
        className
      )}
      aria-labelledby="how-it-works-heading"
    >
      {/* Luxury Radial Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,89,0.12),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
        {/* ========================================================== */}
        {/* 1. TOP HEADER                                              */}
        {/* ========================================================== */}
        <div className="text-center mb-10 sm:mb-12">
          <h2
            id="how-it-works-heading"
            className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-[#E5C178] uppercase"
          >
            HOW IT WORKS &amp; STAY GUARANTEES
          </h2>
        </div>

        {/* ========================================================== */}
        {/* 2. FOUR DISTINCT GUARANTEE BADGES (STREAMLINED TRUST ROW)   */}
        {/* ========================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-start justify-items-center mb-12 sm:mb-14 max-w-4xl mx-auto">
          {FLATEL_GUARANTEES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center group cursor-default"
              >
                {/* Circular Gold Badge */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-[rgba(212,163,89,0.35)] bg-[rgba(34,24,16,0.65)] flex items-center justify-center text-[#E5C178] shadow-lg shadow-[#E5C178]/10 transition-all duration-300 group-hover:scale-105 group-hover:border-[#E5C178] group-hover:shadow-[#E5C178]/25 group-hover:bg-[rgba(45,32,22,0.8)]">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
                </div>

                {/* Step Label */}
                <span className="text-xs sm:text-[13px] font-sans font-bold text-[#FAF4EB] tracking-[0.12em] uppercase mt-3 leading-snug group-hover:text-[#E5C178] transition-colors">
                  {item.label}
                </span>
                <span className="text-xs sm:text-[13px] text-[#D4C4B3] mt-1 font-medium leading-relaxed">
                  {item.sub}
                </span>
              </div>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* 3. GOLD BORDER CARD: SELECT. RESERVE. RELAX. (REFERENCE)   */}
        {/* ========================================================== */}
        <div className="rounded-3xl border border-[rgba(212,163,89,0.35)] bg-[#16100B] p-7 sm:p-9 lg:p-11 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Shimmer */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,163,89,0.12),transparent_60%)]"
            aria-hidden="true"
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-10 relative z-10">
            {/* -------------------------------------------------------- */}
            {/* LEFT: SELECT. RESERVE. RELAX. (CORMORANT GARAMOND)       */}
            {/* -------------------------------------------------------- */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <span className="font-heading font-medium text-4xl sm:text-5xl lg:text-[52px] text-[#E5C178] tracking-normal leading-[1.05]">
                SELECT.
              </span>
              <span className="font-heading font-medium text-4xl sm:text-5xl lg:text-[52px] text-[#E5C178] tracking-normal leading-[1.05]">
                RESERVE.
              </span>
              <span className="font-heading font-medium text-4xl sm:text-5xl lg:text-[52px] text-[#E5C178] tracking-normal leading-[1.05]">
                RELAX.
              </span>
            </div>

            {/* VERTICAL DIVIDER LINE (DESKTOP) */}
            <div
              className="hidden md:block w-[1px] h-32 bg-[rgba(212,163,89,0.25)] self-center shrink-0"
              aria-hidden="true"
            />

            {/* -------------------------------------------------------- */}
            {/* MIDDLE: 3 SIMPLE STEPS TO BOOK                           */}
            {/* -------------------------------------------------------- */}
            <div className="flex-1 w-full max-w-lg">
              <div className="text-xs sm:text-sm font-sans font-bold text-[#E5C178] tracking-[0.14em] uppercase mb-4">
                BOOK IN 3 SIMPLE STEPS
              </div>

              {/* 3 Steps List with Circular Gold Checkmarks */}
              <div className="space-y-4 text-sm sm:text-base text-[#FAF4EB] font-medium leading-relaxed">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#E5C178] shrink-0" />
                  <span>
                    <strong className="text-[#E5C178] font-bold">1. Select Your Residence:</strong> Browse residence details and photos
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#E5C178] shrink-0" />
                  <span>
                    <strong className="text-[#E5C178] font-bold">2. Reserve with 20% Deposit:</strong> Pay only 20% advance via UPI QR or Card
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#E5C178] shrink-0" />
                  <span>
                    <strong className="text-[#E5C178] font-bold">3. Arrive &amp; Settle Balance:</strong> Check in with the property team and pay the remaining balance at the desk
                  </span>
                </div>
              </div>

              {/* Bottom Quick Booking Reassurance & Action */}
              <div className="mt-5 pt-4 border-t border-[rgba(212,163,89,0.18)] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-[#D4C4B3] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E5C178]" />
                  <span>Free Cancellation up to 48 hours prior · 100% Refund</span>
                </span>

                <Link
                  href="/policies"
                  className="text-xs sm:text-sm font-semibold text-[#E5C178] hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View Cancellation Terms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* RIGHT: ELEGANT GOLD BOTANICAL LEAF BRANCH (EXACT MATCH)   */}
            {/* -------------------------------------------------------- */}
            <div className="hidden lg:flex items-center justify-center shrink-0 pr-2">
              <svg
                viewBox="0 0 160 210"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-32 h-44 xl:w-36 xl:h-48 text-[#E5C178] opacity-85 select-none pointer-events-none drop-shadow-[0_2px_12px_rgba(212,163,89,0.2)]"
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
                    <stop offset="0%" stopColor="#FAF4EB" />
                    <stop offset="60%" stopColor="#E5C178" />
                    <stop offset="100%" stopColor="#C69344" />
                  </linearGradient>
                  <linearGradient id="leafGoldFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E5C178" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#E5C178" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Subtle Brand Authority Trust Note (Integrated smoothly, no divider) */}
        <div className="mt-10 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-[#D4C4B3] font-sans">
            Rooted in authentic Hyderabadi warmth and transparent residential hospitality.{" "}
            <Link
              href="/about"
              className="text-[#E5C178] font-semibold hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Read our story &amp; founder&apos;s pledge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
