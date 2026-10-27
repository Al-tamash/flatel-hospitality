import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HospitalDirectoryView } from "@/components/hospital-directory-view";

export const metadata: Metadata = {
  title: "دليل المستشفيات والإقامات الطبية | ضيافة فلاتيل حيدر أباد",
  description:
    "استكشف كبرى المستشفيات المرموقة في حيدر أباد بالقرب من شقق فلاتيل الفندقية المفروشة. مسافات القيادة، وخدمات الدعم المخصصة للمرضى والمرافقين.",
};

export default function ArabicHospitalsPage() {
  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic">
      <SiteHeader />
      <main className="flex-1 w-full">
        <HospitalDirectoryView />
      </main>
      <SiteFooter />
    </div>
  );
}
