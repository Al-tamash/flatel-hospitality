"use client";

import { usePathname } from "next/navigation";

/** First Tab stop on every page: jumps keyboard and screen-reader users past the header to the page content. */
export function SkipLink() {
  const isAr = usePathname()?.startsWith("/ar") ?? false;
  return (
    <a href="#main-content" className="skip-link">
      {isAr ? "تخطي إلى المحتوى الرئيسي" : "Skip to main content"}
    </a>
  );
}
