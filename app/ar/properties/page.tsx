import * as React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertiesCatalogView } from "@/components/properties-catalog-view";

export const metadata: Metadata = {
  title: "كافة الشقق والإقامات الفندقية | ضيافة فلاتيل حيدر أباد",
  description:
    "استكشف تشكيلتنا الكاملة من الشقق الفندقية المفروشة (غرفة، غرفتان، ٣ غرف، و٤ غرف وصالة) في باركاس ومغل بورا بحيدر أباد مع تأكيد حجز مباشر بعربون ٢٠٪ فقط.",
};

export default function ArabicPropertiesPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold font-arabic" dir="rtl">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {/* Arabic Hero Banner */}
        <section className="relative w-full py-14 sm:py-20 overflow-hidden text-center">
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[450px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_12%,transparent)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative container-page z-10">
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase mb-3">
              شقق فندقية مفروشة ومجهزة بالكامل • حيدر أباد
            </p>
            <h1 className="font-heading text-fg heading-page">
              شققنا وإقامتنا الفندقية
            </h1>
            <p className="mt-4 text-base sm:text-lg text-fg-soft font-sans max-w-2xl mx-auto leading-relaxed">
              شقق فاخرة مفروشة بالكامل من غرفة إلى ٤ غرف وصالة في باركاس سلالة ومغل بورا. تشمل كل إقامة مطبخاً مستقلاً متكاملاً، تنظيفاً دورياً، وخدمة عملاء على مدار الساعة.
            </p>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="w-full py-10 sm:py-14">
          <div className="container-page">
            <PropertiesCatalogView />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
