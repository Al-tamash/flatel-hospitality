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

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Luxury Navigation Header (Clean, Multipage-Focused) */}
      <SiteHeader />

      {/* Main Content Sections - Structured for Conversion Psychology */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {/* 2. Hero Section with Search Engine & 4 Stay Purpose Cards */}
        <HeroSection />

        {/* 3. Featured Flats Section (1 to 4 BHK with Purpose & Branch Filters) */}
        <Reveal><FeaturedFlats /></Reveal>

        {/* 4. Two Prime Branches Showcase (Barkas Salala & Moghal Pura with Maps & Landmarks) */}
        <Reveal><BranchHub /></Reveal>

        {/* 5. Signature Inclusions & Master Amenities (Living Experience + 29 Inclusions) */}
        <Reveal><AmenitiesSection /></Reveal>

        {/* 6. Nearby hospitals and healthcare information */}
        <Reveal><NearbyHospitals /></Reveal>

        {/* 7. Reservation steps and practical stay information */}
        <Reveal><BookingSteps /></Reveal>

        {/* 8. Frequently asked questions and guest support */}
        <Reveal><MembershipStrip locale="en" /></Reveal>

        <Reveal><FounderStrip locale="en" /></Reveal>

        <Reveal><FaqSection /></Reveal>
      </main>

      {/* 11. Homepage Footer */}
      <SiteFooter />
    </div>
  );
}
