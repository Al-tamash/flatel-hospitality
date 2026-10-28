"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTACT_PHONE, WHATSAPP_CONFIG } from "@/lib/constants";
import { getLocaleFromPath } from "@/lib/i18n";
import { buildWhatsAppGreeting, floatingSide, shouldShowFloatingContact } from "@/lib/floating-contact";
import { WhatsAppIcon } from "@/components/site-footer";

const OFFSET_VAR = "--floating-offset";

/**
 * Lets a mobile sticky bar push the floating buttons up by its own height,
 * so they never cover the "Book" button. Inactive or desktop → no offset.
 */
export function useFloatingOffset(ref: React.RefObject<HTMLElement | null>, active = true) {
  React.useEffect(() => {
    const node = ref.current;
    const root = document.documentElement;
    if (!node || !active) {
      root.style.removeProperty(OFFSET_VAR);
      return;
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      if (desktop.matches) root.style.removeProperty(OFFSET_VAR);
      else root.style.setProperty(OFFSET_VAR, `${node.offsetHeight}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    desktop.addEventListener("change", update);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", update);
      root.style.removeProperty(OFFSET_VAR);
    };
  }, [ref, active]);
}

/** Floating WhatsApp + Call buttons on guest-facing pages. */
export function FloatingContact() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPath(pathname) === "ar" ? "ar" : "en";
  const isAr = locale === "ar";
  const [scrollLocked, setScrollLocked] = React.useState(false);
  const [flatTitle, setFlatTitle] = React.useState<string | undefined>(undefined);

  // Hide while a modal or lightbox locks page scroll
  React.useEffect(() => {
    const sync = () => setScrollLocked(document.body.style.overflow === "hidden");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  // Flat pages expose their title via [data-flat-title] for a more specific greeting
  React.useEffect(() => {
    const read = () => setFlatTitle(document.querySelector("[data-flat-title]")?.textContent?.trim() || undefined);
    read();
    const timer = window.setTimeout(read, 500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!shouldShowFloatingContact(pathname) || scrollLocked) return null;

  const side = floatingSide(locale);
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(buildWhatsAppGreeting({ locale, flatTitle }));
  const button =
    "h-12 w-12 rounded-full bg-[#16100B] border border-[#E5C178]/70 text-[#E5C178] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:bg-[#221810] hover:border-[#E5C178] hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C178] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A07]";

  return (
    <div
      className={cn("fixed z-30 flex flex-col gap-3", side === "right" ? "right-4" : "left-4")}
      style={{ bottom: `calc(1rem + var(${OFFSET_VAR}, 0px))` }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={button}
        aria-label={isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
        title={isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
      >
        <WhatsAppIcon className="w-5 h-5" />
      </a>
      <a
        href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
        className={button}
        aria-label={isAr ? "اتصل بفلاتيل" : "Call Flatel"}
        title={isAr ? "اتصل بفلاتيل" : "Call Flatel"}
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}
