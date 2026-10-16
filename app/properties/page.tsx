import * as React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertiesCatalogView } from "@/components/properties-catalog-view";

export const metadata: Metadata = {
  title: "All Serviced Residences | Flatel Hospitality Hyderabad",
  description:
    "Explore our complete collection of 1 BHK, 2 BHK, 3 BHK, and 4 BHK serviced apartments in Barkas Salala and Moghal Pura, Hyderabad with transparent 20% advance booking.",
};

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />

      <main className="flex-1 w-full">
        {/* Hero Banner */}
        <section className="relative w-full py-14 sm:py-20 overflow-hidden">
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(212,163,89,0.12)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 text-center z-10">
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.16em] text-[#E5C178] uppercase mb-3">
              SERVICED APARTMENTS IN HYDERABAD
            </p>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#FAF4EB] font-medium leading-tight">
              Our Residences &amp; Suites
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#D4C4B3] font-sans max-w-2xl mx-auto leading-relaxed">
              Fully furnished 1 to 4 BHK serviced apartments in Barkas Salala and Moghal Pura. Every residence includes a private modular kitchen, alternate-day housekeeping, and 24/7 on-site front desk support.
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
