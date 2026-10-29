import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MembershipPageView } from "@/components/membership/membership-page-view";

export const metadata: Metadata = {
  title: "Flatel Membership — ₹777 for a year | Flatel Hospitality",
  description:
    "Join Flatel Membership for ₹777: 10% off every direct stay, a free night on your loyalty run, priority concierge and flexible dates.",
};

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />
      <main className="flex-1 w-full">
        <MembershipPageView locale="en" />
      </main>
      <SiteFooter />
    </div>
  );
}
