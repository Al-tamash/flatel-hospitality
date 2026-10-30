import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HospitalDirectoryView } from "@/components/hospital-directory-view";

export const metadata: Metadata = {
  title: "Hospitals & Medical Guide | FLATEL Hospitality Hyderabad",
  description:
    "Explore premier hospitals in Hyderabad near FLATEL serviced residences. Proximity guide, drive times, and healthcare assistance for medical travelers and patient attendants.",
};

export default function HospitalsPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <HospitalDirectoryView />
      </main>
      <SiteFooter />
    </div>
  );
}
