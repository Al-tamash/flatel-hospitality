import { Locale, Dictionary } from "./types";
import { enDictionary } from "./dictionaries/en";
import { arDictionary } from "./dictionaries/ar";

export * from "./types";
export * from "./room-localizer";
export { enDictionary, arDictionary };

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return locale === "ar" ? arDictionary : enDictionary;
}

export function getLocaleFromPath(pathname: string): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "ar") {
    return "ar";
  }
  return "en";
}

export function getAlternatePath(currentPathname: string, targetLocale: Locale): string {
  if (!currentPathname || currentPathname === "/") {
    return targetLocale === "ar" ? "/ar" : "/";
  }

  const isCurrentArabic = currentPathname.startsWith("/ar");

  if (targetLocale === "ar") {
    if (isCurrentArabic) return currentPathname;
    return `/ar${currentPathname.startsWith("/") ? "" : "/"}${currentPathname}`;
  } else {
    // Target is English (remove /ar prefix)
    if (!isCurrentArabic) return currentPathname;
    const stripped = currentPathname.replace(/^\/ar(\/|$)/, "/");
    return stripped === "" ? "/" : stripped;
  }
}
