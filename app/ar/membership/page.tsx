import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MembershipPageView } from "@/components/membership/membership-page-view";

export const metadata: Metadata = {
  title: "عضوية فلاتيل — ₹777 لمدة عام | ضيافة فلاتيل",
  description:
    "انضم إلى عضوية فلاتيل بـ ₹777: خصم ١٠٪ على كل إقامة مباشرة، وليلة مجانية، وخدمة كونسيرج ذات أولوية ومرونة في المواعيد.",
};

export default function ArabicMembershipPage() {
  return (
    <div
      className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic"
      dir="rtl"
    >
      <SiteHeader />
      <main className="flex-1 w-full">
        <MembershipPageView locale="ar" />
      </main>
      <SiteFooter />
    </div>
  );
}
