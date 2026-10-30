import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "فروعنا الفندقية | ضيافة فلاتيل حيدر أباد",
  description:
    "استكشف فروع ضيافة فلاتيل للشقق الفندقية المفروشة في باركاس سلالة ومغل بورا في حيدر أباد. شقق فاخرة من ١ إلى ٤ غرف وصالة مع مطابخ متكاملة.",
};

const ARABIC_BRANCH_CARDS = [
  {
    name: "فرع باركاس سلالة للشقق الفندقية",
    slug: "barkas-salala",
    location: "قرب تشاندريانغوتا وطريق المطار السريع",
    address: "باركاس سلالة، قرب تشاندريانغوتا، حيدر أباد، تيلانجانا",
    tagline: "شقق فسيحة ٣ غرف وصالة للعائلات الكبيرة مع خصوصية هادئة وسهولة الوصول المباشر إلى المطار والمستشفيات.",
    unitsSummary: "شقتان ٣ غرف وصالة · تتسع حتى ٩ ضيوف",
    startingRate: "₹3,000",
    image: "/images/branch-barkas-salala.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Barkas+Salala+Hyderabad",
  },
  {
    name: "فرع مغل بورا للشقق الفندقية",
    slug: "moghal-pura",
    location: "على بعد خطوات من شارمينار والبلدة القديمة",
    address: "مغل بورا، قرب شارمينار، حيدر أباد، تيلانجانا",
    tagline: "موقع سياحي وتاريخي متميز يضم شقق غرفة وصالة، غرفتان وصالة، وشقق عائلية كبرى ٤ غرف وصالة.",
    unitsSummary: "شقق ١، ٢ و٤ غرف وصالة · تتسع من ٢ إلى ١٢ ضيفاً",
    startingRate: "₹2,000",
    image: "/images/branch-moghal-pura.jpg",
    googleMapsUrl: "https://maps.google.com/?q=Moghalpura+Charminar+Hyderabad",
  },
];

export default function ArabicBranchesIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary font-arabic" dir="rtl">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full py-12 sm:py-16">
        <div className="container-page">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold tracking-wider uppercase text-primary block mb-2">
              مواقعنا الفندقية
            </span>
            <h1 className="font-heading text-foreground heading-page">
              فروع ضيافة فلاتيل
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              استكشف شققنا الفندقية في مغل بورا وباركاس سلالة، حيث تجتمع خصوصية واستقلالية الشقة الكاملة مع خدمات الضيافة الفندقية المتكاملة.
            </p>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ARABIC_BRANCH_CARDS.map((b) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-canvas/60 backdrop-blur-md text-xs font-medium text-foreground border border-white/10">
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

                    <h2 className="font-heading text-foreground heading-sub">
                      {b.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                      {b.tagline}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase block">ابتداءً من</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-xl font-bold text-foreground">
                          {b.startingRate}
                        </span>
                        <span className="text-xs text-muted-foreground">/ ليلة</span>
                      </div>
                    </div>

                    <Link
                      href={`/ar/branches/${b.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-semibold text-xs hover:brightness-105 transition-all shadow-sm"
                    >
                      <span>استكشف الفرع</span>
                      <ArrowLeft className="w-3.5 h-3.5 text-ink" />
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
