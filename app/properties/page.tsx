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
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {/* Hero Banner */}
        <section className="relative w-full py-14 sm:py-20 overflow-hidden">
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[450px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_12%,transparent)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative container-page text-center z-10">
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase mb-3">
              SERVICED APARTMENTS IN HYDERABAD
            </p>
            <h1 className="font-heading text-fg heading-page">
              Our Residences &amp; Suites
            </h1>
            <p className="mt-4 text-base sm:text-lg text-fg-soft font-sans max-w-2xl mx-auto leading-relaxed">
              Fully furnished 1 to 4 BHK serviced apartments in Barkas Salala and Moghal Pura. Every residence includes a private modular kitchen, alternate-day housekeeping, and 24/7 on-site front desk support.
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
