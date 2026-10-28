"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const dict = getDictionary(currentLocale);
  const isAr = currentLocale === "ar";
  const localePrefix = isAr ? "/ar" : "";
  const [currentYear, setCurrentYear] = React.useState(2026);

  React.useEffect(() => {
    queueMicrotask(() => setCurrentYear(new Date().getFullYear()));
  }, []);

  const whatsappInquiryUrl = WHATSAPP_CONFIG.getUrl(
    "Hello Flatel Support, I would like to inquire about booking a serviced flat."
  );

  return (
    <footer
      id="site-footer"
      dir={isAr ? "rtl" : "ltr"}
      className={cn(
        "relative w-full bg-[#0E0A07] text-[#FAF4EB] select-none",
        isAr && "font-arabic"
      )}
      aria-label="Site Footer"
    >
      {/* ── Luxury Moroccan Inward Arch Border (Mamounia Marrakech Inspired) ── */}
      {/* Deep inward curve in the center ("jada center inward") */}
      <div className="relative w-full overflow-hidden leading-none select-none -mb-px">
        <svg
          viewBox="0 0 1933.1 45"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-11 md:h-14 block"
          aria-hidden="true"
        >
          {/* Subtle ambient drop glow behind the contour line */}
          <path
            d="M 0,16.8 H 758 C 758,16.8 950.5,16.8 966.55,44.7 C 982.55,16.8 1210.5,16 1210.5,16 H 1933.1"
            fill="none"
            stroke="rgba(229, 193, 120, 0.22)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Main Footer Obsidian Fill below the inward curve */}
          <path
            d="M 0,16.8 H 758 C 758,16.8 950.5,16.8 966.55,44.7 C 982.55,16.8 1210.5,16 1210.5,16 H 1933.1 V 45 H 0 Z"
            fill="#0E0A07"
          />
          {/* Crisp Champagne Gold Contour Line */}
          <path
            d="M 0,16.8 H 758 C 758,16.8 950.5,16.8 966.55,44.7 C 982.55,16.8 1210.5,16 1210.5,16 H 1933.1"
            fill="none"
            stroke="rgba(212, 163, 89, 0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Main Footer Area ── */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-12 lg:py-16 relative">
        {/* Subtle Moroccan Gold Lattice Watermark Backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10] [mask-image:radial-gradient(ellipse_at_bottom_left,black_40%,transparent_85%)]"
          style={{
            backgroundImage: `url('/images/patterns/flatel-gold-lattice.svg')`,
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
            backgroundSize: "600px auto",
          }}
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* ── A. Brand Introduction (5 Columns) ── */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href={localePrefix || "/"}
              className="inline-flex items-center gap-3.5 sm:gap-4.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs group"
              aria-label="FLATEL Hospitality Homepage"
            >
              {/* Official Gold Monogram Emblem (NO border, NO background box) */}
              <Image
                src="/images/flatel-monogram-clean.png"
                alt="FLATEL Monogram"
                width={64}
                height={64}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              />

              {/* Official FLATEL HOSPITALITY Logo beside the monogram */}
              <Image
                src="/images/flatel-logo-clean.png"
                alt="FLATEL Hospitality"
                width={210}
                height={65}
                className="h-9 sm:h-11 w-auto object-contain shrink-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </Link>

            <p className="font-heading italic text-sm text-[#E5C178] leading-snug">
              &ldquo;{isAr ? dict.common.brandTagline : BRAND_TAGLINE}&rdquo;
            </p>

            <p className="text-sm text-[#D4C4B3] leading-relaxed max-w-md font-sans">
              {isAr
                ? "شقق فندقية مفروشة بالكامل من غرفة إلى ٤ غرف وصالة في حيدر أباد بمطابخ خاصة مجهزة، خدمة تنظيف دورية مجانية، ومكتب استقبال داعم في باركاس سلالة ومغل بورا."
                : "Fully furnished 1 to 4 BHK serviced apartments in Hyderabad with private modular kitchens, alternate-day housekeeping, and on-call front desk support across Barkas Salala and Moghal Pura."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-mono text-[#D4C4B3]">
              <span>{isAr ? "باركاس سلالة" : "Barkas Salala"}</span>
              <span>·</span>
              <span>{isAr ? "مغل بورا" : "Moghal Pura"}</span>
              <span>·</span>
              <span>{isAr ? "حيدر أباد، تيلانجانا" : "Hyderabad, Telangana"}</span>
            </div>
          </div>

          {/* ── B. Useful Navigation Columns (7 Columns) ── */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Explore */}
            <div className="space-y-3.5">
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] uppercase text-[#FAF4EB]">
                {isAr ? "استكشف" : "Explore"}
              </h4>
              <ul className="space-y-2.5 text-sm text-[#D4C4B3] font-sans">
                <li>
                  <Link
                    href={`${localePrefix}/properties`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {dict.nav.properties}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/#amenities`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {isAr ? "المرافق والخدمات" : "Amenities"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/#locations`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {dict.nav.branches}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/branches/barkas-salala`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 text-xs sm:text-sm text-[#D4C4B3] hover:text-[#E5C178] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {isAr ? "فرع باركاس سلالة" : "Barkas Salala"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/branches/moghal-pura`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 text-xs sm:text-sm text-[#D4C4B3] hover:text-[#E5C178] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {isAr ? "فرع مغل بورا" : "Moghal Pura"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Guest Information */}
            <div className="space-y-3.5">
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] uppercase text-[#FAF4EB]">
                {isAr ? "معلومات الضيوف" : "Guest Information"}
              </h4>
              <ul className="space-y-2.5 text-sm text-[#D4C4B3] font-sans">
                <li>
                  <Link
                    href={`${localePrefix}/properties`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {dict.home.exploreResidences}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/#how-it-works`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {isAr ? "خطوات الحجز" : "Booking Process"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/policies#checkin-checkout`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {isAr ? "قواعد وإرشادات الإقامة" : "House Rules"}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/policies#free-cancellation`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
                  >
                    {dict.policies.cancellationTitle}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${localePrefix}/list-property`}
                    className="hover:text-[#FAF4EB] transition-colors block py-1 text-xs sm:text-sm text-[#E5C178] hover:text-[#FAF4EB] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs font-semibold"
                  >
                    {dict.nav.listProperty}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-3.5">
              <h4 className="text-xs sm:text-sm font-sans font-bold tracking-[0.14em] uppercase text-[#FAF4EB]">
                {isAr ? "اتصل بنا" : "Contact"}
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
                    <span>{isAr ? "خدمة العملاء عبر واتساب" : "WhatsApp Support"}</span>
                    <ArrowUpRight className={cn("w-3.5 h-3.5 text-[#D4C4B3]/70 group-hover:text-[#34D399] transition-colors", isAr && "rotate-[-90deg]")} />
                  </a>
                </li>
                <li className="flex items-center gap-2 text-[#D4C4B3] text-xs sm:text-sm py-1">
                  <Clock className="w-4 h-4 text-[#E5C178] shrink-0" />
                  <span>{isAr ? "خدمة استقبال ودعم نزلاء ٢٤/٧" : "24/7 Front Desk & Guest Support"}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ── D. Bottom Legal Bar ── */}
        <div className="mt-12 pt-6 border-t border-[rgba(212,163,89,0.18)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#D4C4B3]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span>© {currentYear} {COMPANY_NAME}. {dict.common.allRightsReserved}</span>
            <span className="hidden sm:inline">·</span>
            <Link
              href={`${localePrefix}/policies`}
              className="hover:text-[#FAF4EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
            >
              {isAr ? "سياسات وقواعد الإقامة" : "Guest Policies & Stay Rules"}
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link
              href={`${localePrefix}/policies#free-cancellation`}
              className="hover:text-[#FAF4EB] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs"
            >
              {dict.policies.cancellationTitle}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="header" />
          </div>
        </div>
      </div>
    </footer>
  );
}
