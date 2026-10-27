"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check, Globe } from "lucide-react";
import { Locale, getAlternatePath, getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "header" | "mobile" | "footer";
}

export function LanguageSwitcher({ className, variant = "header" }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocaleFromPath(pathname);
  const dict = getDictionary(currentLocale);

  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close dropdown on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelectLanguage = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) {
      setIsOpen(false);
      return;
    }
    const newPath = getAlternatePath(pathname, targetLocale);
    setIsOpen(false);
    router.push(newPath);
  };

  const isRtl = currentLocale === "ar";

  if (variant === "mobile") {
    return (
      <div className={cn("rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] p-2.5", className)}>
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E5C178]">
          <Globe className="h-3.5 w-3.5 text-[#E5C178]" />
          <span>{dict.common.switchLanguage}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* English Option */}
          <button
            type="button"
            onClick={() => handleSelectLanguage("en")}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer",
              currentLocale === "en"
                ? "bg-[rgba(212,163,89,0.18)] border-[#E5C178] text-[#E5C178] font-semibold"
                : "bg-[#16100B] border-[rgba(212,163,89,0.2)] text-[#D4C4B3] hover:text-[#FAF4EB]"
            )}
          >
            <span>EN • English</span>
            {currentLocale === "en" && <Check className="h-3.5 w-3.5 text-[#E5C178]" />}
          </button>

          {/* Arabic Option */}
          <button
            type="button"
            onClick={() => handleSelectLanguage("ar")}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer font-arabic",
              currentLocale === "ar"
                ? "bg-[rgba(212,163,89,0.18)] border-[#E5C178] text-[#E5C178] font-semibold"
                : "bg-[#16100B] border-[rgba(212,163,89,0.2)] text-[#D4C4B3] hover:text-[#FAF4EB]"
            )}
          >
            <span>العربية • Arabic</span>
            {currentLocale === "ar" && <Check className="h-3.5 w-3.5 text-[#E5C178]" />}
          </button>
        </div>
      </div>
    );
  }

  // Desktop Header Switcher (Emaar Reference Style)
  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      <button
        type="button"
        id="language-switcher-button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLocale === "ar" ? "Arabic" : "English"}. Switch language`}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold tracking-wider transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]",
          isOpen
            ? "border-[#E5C178] bg-[rgba(212,163,89,0.15)] text-[#E5C178]"
            : "border-[rgba(212,163,89,0.3)] bg-[rgba(22,16,11,0.6)] text-[#D4C4B3] hover:text-[#E5C178] hover:border-[rgba(212,163,89,0.5)]"
        )}
      >
        <span className="uppercase">{currentLocale === "ar" ? "العربية" : "EN"}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-[#D4C4B3] transition-transform duration-200",
            isOpen && "rotate-180 text-[#E5C178]"
          )}
        />
      </button>

      {/* Dropdown Menu (Matches Emaar reference screenshot layout) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-switcher-button"
          className={cn(
            "absolute top-full mt-2 w-56 rounded-2xl bg-[#16100B]/98 backdrop-blur-xl border border-[rgba(212,163,89,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150",
            isRtl ? "left-0" : "right-0"
          )}
        >
          {/* Header Title */}
          <div className="px-3 py-1.5 text-[11px] uppercase font-sans font-bold tracking-[0.14em] text-[#E5C178]/80 border-b border-[rgba(212,163,89,0.15)] mb-1">
            {dict.common.switchLanguage}
          </div>

          <div className="space-y-1">
            {/* English Option */}
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelectLanguage("en")}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left group cursor-pointer",
                currentLocale === "en"
                  ? "bg-[rgba(34,24,16,0.9)] text-[#E5C178] border border-[rgba(212,163,89,0.35)]"
                  : "text-[#FAF4EB] hover:bg-[rgba(45,32,22,0.7)] hover:text-[#E5C178]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[11px] tracking-wider text-[#E5C178]/80 w-6">EN</span>
                <span className="font-sans text-sm">English</span>
              </div>
              {currentLocale === "en" && <Check className="h-4 w-4 text-[#E5C178]" />}
            </button>

            {/* Arabic Option */}
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelectLanguage("ar")}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left group cursor-pointer",
                currentLocale === "ar"
                  ? "bg-[rgba(34,24,16,0.9)] text-[#E5C178] border border-[rgba(212,163,89,0.35)]"
                  : "text-[#FAF4EB] hover:bg-[rgba(45,32,22,0.7)] hover:text-[#E5C178]"
              )}
            >
              <div className="flex items-center gap-2 font-arabic">
                <span className="font-semibold text-[11px] tracking-wider text-[#E5C178]/80 w-6">AR</span>
                <span className="text-sm font-arabic font-medium">العربية (Arabic)</span>
              </div>
              {currentLocale === "ar" && <Check className="h-4 w-4 text-[#E5C178]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
