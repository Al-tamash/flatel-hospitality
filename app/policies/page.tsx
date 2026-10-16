"use client";

import * as React from "react";
import {
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  Users,
  FileCheck2,
  Volume2,
  Ban,
  Phone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONTACT_PHONE, WHATSAPP_CONFIG } from "@/lib/constants";

interface PolicyCard {
  id: string;
  icon: React.ElementType;
  title: string;
  badge: string;
  summary: string;
  details: string[];
}

const GUEST_POLICIES: PolicyCard[] = [
  {
    id: "advance-deposit",
    icon: CreditCard,
    title: "20% Advance Online Policy",
    badge: "Official Payment Term",
    summary:
      "Lock your flat dates with just a flat 20% online advance deposit. The remaining 80% balance is settled upon check-in.",
    details: [
      "Pay 20% deposit online via UPI, Credit/Debit cards, or Net Banking",
      "Instant automated digital booking voucher & confirmation receipt generated",
      "Remaining 80% balance settled directly at check-in via Cash or UPI QR Code",
      "Zero hidden reservation fees or platform surcharges",
    ],
  },
  {
    id: "free-cancellation",
    icon: ShieldCheck,
    title: "48-Hour Free Cancellation & 100% Refund",
    badge: "Flexible Terms",
    summary:
      "Full 100% refund of your advance deposit if cancelled 48 hours or more prior to your scheduled check-in window.",
    details: [
      "Cancel at least 48 hours before check-in (11:00 AM) for a 100% full refund",
      "Refund processed directly to original payment method within 3–5 banking days",
      "Cancellations within 48 hours forfeit the 20% deposit as reservation hold fee",
      "Date modifications allowed based on calendar availability with no penalty",
    ],
  },
  {
    id: "checkin-checkout",
    icon: Clock,
    title: "Check-In & Check-Out Timings",
    badge: "Daily Schedule",
    summary:
      "Standard check-in is between 11:00 AM and 1:00 PM. Check-out is at 11:00 AM.",
    details: [
      "Check-in window: 11:00 AM – 1:00 PM for key handover and welcome briefing",
      "Check-out time: 11:00 AM",
      "Early check-in or late check-out subject to availability upon advance notice",
      "Luggage holding facility available upon prior coordination with desk",
    ],
  },
  {
    id: "housekeeping",
    icon: Sparkles,
    title: "Complimentary Alternate-Day Housekeeping",
    badge: "In-Stay Service",
    summary:
      "Complimentary professional housekeeping is provided on alternate days across all short-term and extended stays.",
    details: [
      "Includes floor sweeping, mopping, wet sanitation, and trash evacuation",
      "Fresh sanitized hotel-grade bed linens and bath towels replenished on schedule",
      "Daily waste removal and kitchen maintenance support available upon request",
      "Optional daily deep housekeeping service available as an on-demand add-on",
    ],
  },
  {
    id: "extra-guests",
    icon: Users,
    title: "Children & Extra Guest Policy",
    badge: "Occupancy Guidelines",
    summary:
      "Children aged 0–12 stay completely free. Extra adult guests beyond base flat capacity are ₹500 per person per night.",
    details: [
      "Children (0–12 years): 100% FREE stay with complimentary baby cot on request",
      "Base occupancy: 1 BHK (2 Adults), 2 BHK (4 Adults), 3 BHK (6 Adults), 4 BHK (8 Adults)",
      "Extra person fee: ₹500 per adult per night beyond base capacity",
      "Extra plush floor mattress, sanitized pillow, and blanket provided for extra guests",
    ],
  },
  {
    id: "id-verification",
    icon: FileCheck2,
    title: "Mandatory Government Identification",
    badge: "Legal Compliance",
    summary:
      "By law, every adult guest must submit valid original government photo identification before access is granted.",
    details: [
      "Indian Nationals: Original Aadhaar Card, Driving License, Voter ID, or Passport",
      "International Travelers: Original valid Passport and valid Indian Visa are mandatory",
      "Digital verification / contactless pre-check-in available on request",
      "PAN card is not accepted as address proof per regulatory hotel guidelines",
    ],
  },
  {
    id: "quiet-hours",
    icon: Volume2,
    title: "Quiet Hours & Respectful Stays",
    badge: "Resident Comfort",
    summary:
      "Quiet hours are observed from 10:00 PM to 7:00 AM to ensure medical recovery and peaceful sleep for all families.",
    details: [
      "Keep volume on televisions and audio devices subdued during quiet hours",
      "Non-registered outside visitors permitted only between 9:00 AM and 8:00 PM",
      "Commercial parties, disruptive gatherings, and illicit activities strictly prohibited",
      "Building security guards and CCTV active 24/7 across public corridors",
    ],
  },
  {
    id: "non-smoking",
    icon: Ban,
    title: "100% Smoke-Free Living Spaces",
    badge: "Health & Safety",
    summary:
      "All apartment interiors are strictly non-smoking for patient health, allergen defense, and fire safety.",
    details: [
      "Smoking of cigarettes, vapes, and hookah is strictly prohibited inside the flats",
      "Designated outdoor balconies and building ground areas permitted for smoking",
      "Deep-cleaning and ozone sanitization fee of ₹2,500 applies for interior violations",
      "Kitchen gas stoves must be operated responsibly and switched off after cooking",
    ],
  },
];

export default function PoliciesPage() {
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(
    "Hello Flatel Hospitality, I have a question regarding your stay policies."
  );

  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col font-sans selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />

      <main className="flex-1 w-full">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <section className="relative pt-16 pb-14 sm:pt-20 sm:pb-16 border-b border-[rgba(212,163,89,0.18)] bg-[#120D08]/90 overflow-hidden">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(229,193,120,0.08),transparent_70%)] -z-10"
            aria-hidden="true"
          />

          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16100B] border border-[rgba(212,163,89,0.3)] text-[#E5C178] text-[11px] font-sans font-medium uppercase tracking-[0.18em] mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5C178]" />
              <span>Flatel Hospitality Guidelines</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#FAF4EB]">
              Guest Policies &amp; <span className="text-[#E5C178]">Stay Rules</span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#B8A692] max-w-2xl mx-auto leading-relaxed">
              Transparent, professional hospitality standards crafted to ensure peace of mind, pristine hygiene, and maximum comfort for medical attendants, tourists, and families.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* QUICK ANCHOR NAVIGATION BAR                               */}
        {/* ========================================================= */}
        <div className="sticky top-16 sm:top-20 z-20 w-full border-b border-[rgba(212,163,89,0.18)] bg-[#0E0A07]/95 backdrop-blur-md">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#A89887] shrink-0 mr-1 font-semibold">
                Jump to:
              </span>
              {GUEST_POLICIES.map((p) => (
                <a
                  key={p.id}
                  href={`#${p.id}`}
                  className="shrink-0 inline-flex items-center px-3.5 min-h-[44px] rounded-full text-xs font-medium text-[#B8A692] hover:text-[#FAF4EB] bg-[#16100B] hover:bg-[#221810] border border-[rgba(212,163,89,0.22)] hover:border-[#E5C178]/60 transition-colors"
                >
                  {p.badge}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* POLICIES GRID                                             */}
        {/* ========================================================= */}
        <section className="py-14 sm:py-18 lg:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {GUEST_POLICIES.map((policy) => {
                const IconComponent = policy.icon;
                return (
                  <div
                    key={policy.id}
                    id={policy.id}
                    className="scroll-mt-28 p-5 sm:p-7 rounded-2xl bg-[rgba(34,24,16,0.75)] border border-[rgba(212,163,89,0.25)] hover:border-[rgba(212,163,89,0.5)] backdrop-blur-md transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.25)] text-[#E5C178] flex items-center justify-center shrink-0 group-hover:border-[#E5C178]/60 transition-colors">
                          <IconComponent className="w-5 h-5 text-[#E5C178]" />
                        </div>
                        <span className="text-[11px] uppercase font-semibold tracking-[0.16em] px-2.5 py-1 rounded-full bg-[#16100B] text-[#E5C178] border border-[rgba(212,163,89,0.3)]">
                          {policy.badge}
                        </span>
                      </div>

                      <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#FAF4EB] group-hover:text-[#E5C178] transition-colors">
                        {policy.title}
                      </h2>

                      <p className="mt-2 text-xs sm:text-[13px] text-[#B8A692] leading-relaxed">
                        {policy.summary}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[rgba(212,163,89,0.18)] space-y-2">
                        {policy.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#FAF4EB]/90">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C178] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Contact Box */}
            <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl bg-[rgba(34,24,16,0.85)] border border-[rgba(212,163,89,0.3)] text-center max-w-3xl mx-auto shadow-2xl backdrop-blur-md">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF4EB]">
                Have a specific question or policy inquiry?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#B8A692] max-w-lg mx-auto">
                Our 24/7 on-site front desk team is available to assist with custom medical check-in windows, long-stay agreements, and group bookings.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-110 text-[#140E08] font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#E5C178]/15 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {CONTACT_PHONE}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgba(212,163,89,0.35)] hover:border-[#E5C178] text-[#E5C178] bg-[#16100B] hover:bg-[#221810] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
