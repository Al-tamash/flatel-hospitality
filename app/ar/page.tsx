import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { FeaturedFlats } from "@/components/featured-flats";
import { BranchHub } from "@/components/branch-hub";
import { AmenitiesSection } from "@/components/amenities-section";
import { NearbyHospitals } from "@/components/nearby-hospitals";
import { BookingSteps } from "@/components/booking-steps";
import { FaqSection } from "@/components/faq-section";
import { FounderStrip } from "@/components/home/founder-strip";
import { MembershipStrip } from "@/components/home/membership-strip";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/motion/reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ضيافة فلاتيل — الشقق الفندقية المفروشة في حيدر أباد",
  description:
    "راحة الشقة مع خدمة وفخامة الفندق. شقق فاخرة مفروشة بالكامل في باركاس سلالة ومغل بورا، حيدر أباد. حجز فوري بتأكيد ٢٠٪ فقط.",
};

export default function ArabicHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary font-arabic" dir="rtl">
      {/* 1. Header with Language Switcher */}
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {/* 2. Hero Section with Arabic Editorial & RTL Layout */}
        <HeroSection />

        {/* 3. Featured Flats */}
        <Reveal><FeaturedFlats /></Reveal>

        {/* 4. Prime Branches */}
        <Reveal><BranchHub /></Reveal>

        {/* 5. Inclusions & Amenities */}
        <Reveal><AmenitiesSection /></Reveal>

        {/* 6. Healthcare & Hospitals Guide */}
        <Reveal><NearbyHospitals /></Reveal>

        {/* 7. Booking Steps */}
        <Reveal><BookingSteps /></Reveal>

        {/* 8. Frequently Asked Questions */}
        <Reveal><MembershipStrip locale="ar" /></Reveal>

        <Reveal><FounderStrip locale="ar" /></Reveal>

        <Reveal><FaqSection /></Reveal>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
