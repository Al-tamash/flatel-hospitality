import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MembershipPageView } from "@/components/membership/membership-page-view";

export const metadata: Metadata = {
  title: "عضوية فلاتيل أو سيغنتشر — الذهبية والبلاتينية | ضيافة فلاتيل",
  description:
    "البطاقة الذهبية ₹4,999 والبلاتينية ₹7,777: خصم ١٠٪ أو ١٥٪ على كل حجز في فلاتيل، واستقبال مجاني من المطار، وتسجيل دخول ذو أولوية، وحقيبة ترحيب، ودعم ذو أولوية.",
};

export default function ArabicMembershipPage() {
  return (
    <div
      className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold font-arabic"
      dir="rtl"
    >
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <MembershipPageView locale="ar" />
      </main>
      <SiteFooter />
    </div>
  );
}
