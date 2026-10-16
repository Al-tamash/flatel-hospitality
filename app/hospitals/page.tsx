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
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />
      <main className="flex-1 w-full">
        <HospitalDirectoryView />
      </main>
      <SiteFooter />
    </div>
  );
}
