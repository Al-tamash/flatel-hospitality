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
    const search = typeof window !== "undefined" ? window.location.search : "";
    setIsOpen(false);
    router.push(`${newPath}${search}`);
  };

  const isRtl = currentLocale === "ar";

  if (variant === "mobile") {
    return (
      <div className={cn("rounded-2xl border border-line bg-raised/65 p-2.5", className)}>
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
          <Globe className="h-3.5 w-3.5 text-gold" />
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
                ? "bg-gold/18 border-gold text-gold font-semibold"
                : "bg-surface border-line-soft text-fg-soft hover:text-fg"
            )}
          >
            <span>EN • English</span>
            {currentLocale === "en" && <Check className="h-3.5 w-3.5 text-gold" />}
          </button>

          {/* Arabic Option */}
          <button
            type="button"
            onClick={() => handleSelectLanguage("ar")}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer font-arabic",
              currentLocale === "ar"
                ? "bg-gold/18 border-gold text-gold font-semibold"
                : "bg-surface border-line-soft text-fg-soft hover:text-fg"
            )}
          >
            <span>العربية • Arabic</span>
            {currentLocale === "ar" && <Check className="h-3.5 w-3.5 text-gold" />}
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
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold tracking-wider transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gold",
          isOpen
            ? "border-gold bg-gold/15 text-gold"
            : "border-line bg-surface/60 text-fg-soft hover:text-gold hover:border-line-strong"
        )}
      >
        <span className="uppercase">{currentLocale === "ar" ? "العربية" : "EN"}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-fg-soft transition-transform duration-200",
            isOpen && "rotate-180 text-gold"
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
            "absolute top-full mt-2 w-56 rounded-2xl bg-surface/98 backdrop-blur-xl border border-line shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150",
            isRtl ? "left-0" : "right-0"
          )}
        >
          {/* Header Title */}
          <div className="px-3 py-1.5 text-xs uppercase font-sans font-bold tracking-[0.14em] text-gold/80 border-b border-line-soft mb-1">
            {dict.common.switchLanguage}
          </div>

          <div className="space-y-1">
            {/* English Option */}
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelectLanguage("en")}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors text-start group cursor-pointer",
                currentLocale === "en"
                  ? "bg-raised/90 text-gold border border-line"
                  : "text-fg hover:bg-raised-hover/70 hover:text-gold"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs tracking-wider text-gold/80 w-6">EN</span>
                <span className="font-sans text-sm">English</span>
              </div>
              {currentLocale === "en" && <Check className="h-4 w-4 text-gold" />}
            </button>

            {/* Arabic Option */}
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelectLanguage("ar")}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors text-start group cursor-pointer",
                currentLocale === "ar"
                  ? "bg-raised/90 text-gold border border-line"
                  : "text-fg hover:bg-raised-hover/70 hover:text-gold"
              )}
            >
              <div className="flex items-center gap-2 font-arabic">
                <span className="font-semibold text-xs tracking-wider text-gold/80 w-6">AR</span>
                <span className="text-sm font-arabic font-medium">العربية (Arabic)</span>
              </div>
              {currentLocale === "ar" && <Check className="h-4 w-4 text-gold" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
