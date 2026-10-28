/** Rules for the floating WhatsApp + Call buttons. */

const HIDDEN_PREFIXES = ["/admin", "/checkout", "/ar/checkout"];

/** Guest-facing pages only; admin and checkout keep their own contact flows. */
export function shouldShowFloatingContact(pathname: string): boolean {
  return !HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Bottom-right in English, bottom-left in Arabic (RTL). */
export function floatingSide(locale: "en" | "ar"): "right" | "left" {
  return locale === "ar" ? "left" : "right";
}

export function buildWhatsAppGreeting({ locale, flatTitle }: { locale: "en" | "ar"; flatTitle?: string }): string {
  if (locale === "ar") {
    return flatTitle
      ? `مرحباً فلاتيل، أود الاستفسار عن ${flatTitle}.`
      : "مرحباً فلاتيل، أود الاستفسار عن الإقامة لديكم.";
  }
  return flatTitle ? `Hello Flatel, I'd like to ask about the ${flatTitle}.` : "Hello Flatel, I'd like to ask about a stay.";
}
