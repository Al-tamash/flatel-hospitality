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
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic" dir="rtl">
      <SiteHeader />

      <main className="flex-1 w-full">
        {/* Arabic Hero Banner */}
        <section className="relative w-full py-14 sm:py-20 overflow-hidden text-center">
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(212,163,89,0.12)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 z-10">
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.16em] text-[#E5C178] uppercase mb-3">
              شقق فندقية مفروشة ومجهزة بالكامل • حيدر أباد
            </p>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#FAF4EB] font-medium leading-tight">
              شققنا وإقامتنا الفندقية
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#D4C4B3] font-sans max-w-2xl mx-auto leading-relaxed">
              شقق فاخرة مفروشة بالكامل من غرفة إلى ٤ غرف وصالة في باركاس سلالة ومغل بورا. تشمل كل إقامة مطبخاً مستقلاً متكاملاً، تنظيفاً دورياً، وخدمة عملاء على مدار الساعة.
            </p>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="w-full py-10 sm:py-14">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
            <PropertiesCatalogView />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
