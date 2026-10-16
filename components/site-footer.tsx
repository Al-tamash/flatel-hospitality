"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  COMPANY_NAME,
  BRAND_TAGLINE,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  WHATSAPP_CONFIG,
} from "@/lib/constants";

/**
 * Official WhatsApp Vector Geometry
 */
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function SiteFooter() {
  const [currentYear, setCurrentYear] = React.useState(2026);

  React.useEffect(() => {
    queueMicrotask(() => setCurrentYear(new Date().getFullYear()));
  }, []);

  const whatsappInquiryUrl = WHATSAPP_CONFIG.getUrl(
    "Hello Flatel Support, I would like to inquire about booking a serviced flat."
  );

  return (
    <footer
      className="w-full bg-[#0E0A07] border-t border-[rgba(212,163,89,0.22)] text-[#FAF4EB] select-none"
      aria-label="Site Footer"
    >


      {/* ── Main Footer Area ── */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* ── A. Brand Introduction (5 Columns) ── */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs group"
              aria-label="FLATEL Hospitality Homepage"
            >
              <div className="w-8 h-8 rounded-lg border border-[rgba(212,163,89,0.5)] bg-[#16100B] text-[#E5C178] flex items-center justify-center shrink-0 group-hover:border-[#E5C178] transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[#E5C178]"
                >
                  <path d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9z" />
                  <path d="M9 21V12h6v9" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-heading text-xl font-bold tracking-[0.06em] text-[#FAF4EB] group-hover:text-[#E5C178] transition-colors">
                  FLATEL
                </span>
                <span className="font-sans text-[8.5px] font-bold tracking-[0.2em] text-[#E5C178] uppercase">
                  HOSPITALITY
                </span>
              </div>
            </Link>

            <p className="font-heading italic text-sm text-[#E5C178] leading-snug">
              &ldquo;{BRAND_TAGLINE}&rdquo;
            </p>

            <p className="text-sm text-[#D4C4B3] leading-relaxed max-w-md font-sans">
              Fully furnished 1 to 4 BHK serviced apartments in Hyderabad with private modular kitchens, alternate-day housekeeping, and on-call front desk support across Barkas Salala and Moghal Pura.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-mono text-[#D4C4B3]">
              <span>Barkas Salala</span>
              <span>·</span>
              <span>Moghal Pura</span>
              <span>·</span>
              <span>Hyderabad, Telangana</span>
            </div>
          </div>

          {/* ── B. Useful Navigation Columns (7 Columns) ── */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Explore */}
            <div className="space-y-3.5">
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] uppercase text-[#FAF4EB]">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm text-[#D4C4B3] font-sans">
                <li>
                  <Link
                    href="/#flats"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#amenities"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#locations"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Branches
                  </Link>
                </li>
                <li>
                  <Link
                    href="/branches/barkas-salala"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 text-xs sm:text-sm text-[#D4C4B3] hover:text-[#E5C178] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Barkas Salala
                  </Link>
                </li>
                <li>
                  <Link
                    href="/branches/moghal-pura"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 text-xs sm:text-sm text-[#D4C4B3] hover:text-[#E5C178] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Moghal Pura
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Guest Information */}
            <div className="space-y-3.5">
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] uppercase text-[#FAF4EB]">
                Guest Information
              </h4>
              <ul className="space-y-2.5 text-sm text-[#D4C4B3] font-sans">
                <li>
                  <Link
                    href="/#flats"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Stay Experiences
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Booking Process
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policies#checkin-checkout"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    House Rules
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policies#free-cancellation"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/list-property"
                    className="hover:text-[#FAF4EB] transition-colors block py-1 text-xs sm:text-sm text-[#E5C178] hover:text-[#FAF4EB] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs font-semibold"
                  >
                    List Your Property
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-3.5">
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] uppercase text-[#FAF4EB]">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-[#D4C4B3] font-sans">
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="flex items-center gap-2.5 hover:text-[#FAF4EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs py-1"
                  >
                    <Mail className="w-4 h-4 text-[#E5C178] shrink-0" />
                    <span className="truncate">{CONTACT_EMAIL}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-2.5 hover:text-[#FAF4EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs py-1"
                  >
                    <Phone className="w-4 h-4 text-[#E5C178] shrink-0" />
                    <span className="font-mono">{CONTACT_PHONE}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#34D399] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs group py-1"
                  >
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                    <span>WhatsApp Support</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D4C4B3]/70 group-hover:text-[#34D399] transition-colors" />
                  </a>
                </li>
                <li className="flex items-center gap-2 text-[#D4C4B3] text-xs sm:text-sm py-1">
                  <Clock className="w-4 h-4 text-[#E5C178] shrink-0" />
                  <span>24/7 Front Desk &amp; Guest Support</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ── D. Bottom Legal Bar ── */}
        <div className="mt-12 pt-6 border-t border-[rgba(212,163,89,0.18)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#D4C4B3]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span>© {currentYear} {COMPANY_NAME}. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <Link
              href="/policies"
              className="hover:text-[#FAF4EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
            >
              Guest Policies &amp; Stay Rules
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link
              href="/policies#free-cancellation"
              className="hover:text-[#FAF4EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
            >
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
