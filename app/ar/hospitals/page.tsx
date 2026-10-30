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
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold font-arabic" dir="rtl">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <HospitalDirectoryView />
      </main>
      <SiteFooter />
    </div>
  );
}
