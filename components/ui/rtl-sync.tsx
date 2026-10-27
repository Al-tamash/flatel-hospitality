"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function RtlSync() {
  const pathname = usePathname();

  React.useEffect(() => {
    const isArabic = pathname.startsWith("/ar");
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar" : "en";
  }, [pathname]);

  return null;
}
