import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MembershipPageView } from "@/components/membership/membership-page-view";

export const metadata: Metadata = {
  title: "Flatel O Signature Membership — Golden & Platinum | Flatel Hospitality",
  description:
    "Golden Card ₹4,999 and Platinum Card ₹7,777: 10% or 15% off every Flatel booking, complimentary airport pickup, priority check-in, a welcome kit and priority support.",
};

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <MembershipPageView locale="en" />
      </main>
      <SiteFooter />
    </div>
  );
}
