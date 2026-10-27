"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  ExternalLink,
  LogOut,
  CalendarCheck,
  ShieldCheck,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  HEADER_NAVIGATION,
} from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { getLocaleFromPath, getDictionary } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

// Branch navigation metadata with descriptions and specs
const BRANCH_ITEMS = [
  {
    name: "Barkas Salala",
    slug: "barkas-salala",
    href: "/branches/barkas-salala",
    location: "Near Chandrayangutta",
    description: "Two 3 BHK Residences · 6–9 Guests",
  },
  {
    name: "Moghal Pura",
    slug: "moghal-pura",
    href: "/branches/moghal-pura",
    location: "Near Charminar",
    description: "1, 2 & 4 BHK Residences · 2–12 Guests",
  },
] as const;

function SiteHeaderContent() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const dict = getDictionary(currentLocale);
  const isAr = currentLocale === "ar";
  const localePrefix = isAr ? "/ar" : "";
  const { user, isAdmin, openAuthModal, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileBranchesOpen, setIsMobileBranchesOpen] = React.useState(true);
  const [isBranchesDropdownOpen, setIsBranchesDropdownOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const branchesButtonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const userDropdownRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Track scroll position to update subtle border state
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle click outside to dismiss desktop dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        branchesButtonRef.current &&
        !branchesButtonRef.current.contains(event.target as Node)
      ) {
        setIsBranchesDropdownOpen(false);
      }

      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isBranchesDropdownOpen || isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBranchesDropdownOpen, isUserDropdownOpen]);

  // Handle escape key to close menus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isBranchesDropdownOpen) {
          setIsBranchesDropdownOpen(false);
          branchesButtonRef.current?.focus();
        }
        if (isUserDropdownOpen) {
          setIsUserDropdownOpen(false);
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBranchesDropdownOpen, isUserDropdownOpen, isMobileMenuOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsBranchesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsBranchesDropdownOpen(false);
    }, 150);
  };

  const isBranchesActive = pathname.startsWith("/branches");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-colors duration-200 select-none",
          "bg-[#0E0A07]/92 backdrop-blur-md",
          isScrolled
            ? "border-b border-[rgba(212,163,89,0.22)] shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
            : "border-b border-[rgba(212,163,89,0.15)]"
        )}
      >
        <div className="mx-auto flex h-[66px] sm:h-[74px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* ========================================================= */}
          {/* LEFT: BRAND LOCKUP                                        */}
          {/* FLATEL HOSPITALITY                                        */}
          {/* The comfort of a flat. The service of a hotel.            */}
          {/* ========================================================= */}
          <div className="flex items-center shrink-0">
            <Link
              href={localePrefix || "/"}
              className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-xs py-1"
              aria-label="FLATEL Hospitality — The comfort of a flat. The service of a hotel."
            >
              {/* Official Gold Monogram Emblem (NO border, NO background box) */}
              <Image
                src="/images/flatel-monogram-clean.png"
                alt="FLATEL Monogram"
                width={48}
                height={48}
                priority
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              />

              {/* Official FLATEL HOSPITALITY Logo Lockup */}
              <Image
                src="/images/flatel-logo-clean.png"
                alt="FLATEL Hospitality"
                width={170}
                height={52}
                priority
                className="h-7 sm:h-8.5 w-auto object-contain shrink-0"
              />
            </Link>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP NAVIGATION (RIGHT / CENTER)                       */}
          {/* Strictly aligned with final-prd.md Section 7.1            */}
          {/* Branches (Dropdown), Stays, Amenities, Reviews, About, FAQs */}
          {/* Actions: Hotline, WhatsApp, Admin Login                   */}
          {/* ========================================================= */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {/* Core Navigation Links */}
            <nav
              className="flex items-center gap-2 xl:gap-3"
              aria-label="Primary Navigation"
            >
              {/* 1. Properties */}
              <Link
                href={`${localePrefix}/properties`}
                className={cn(
                  "relative px-3 py-2 min-h-[40px] inline-flex items-center text-sm xl:text-[15px] font-sans font-semibold tracking-normal transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-md",
                  pathname.startsWith(`${localePrefix}/properties`)
                    ? "text-[#E5C178]"
                    : "text-[#D4C4B3] hover:text-[#E5C178]"
                )}
              >
                <span>{dict.nav.properties}</span>
              </Link>

              {/* 2. Hospitals */}
              <Link
                href={`${localePrefix}/hospitals`}
                className={cn(
                  "relative px-3 py-2 min-h-[40px] inline-flex items-center text-sm xl:text-[15px] font-sans font-semibold tracking-normal transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-md",
                  pathname === `${localePrefix}/hospitals`
                    ? "text-[#E5C178]"
                    : "text-[#D4C4B3] hover:text-[#E5C178]"
                )}
              >
                <span>{dict.nav.hospitals}</span>
              </Link>

              {/* 3. About */}
              <Link
                href={`${localePrefix}/about`}
                className={cn(
                  "relative px-3 py-2 min-h-[40px] inline-flex items-center text-sm xl:text-[15px] font-sans font-semibold tracking-normal transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-md",
                  pathname === `${localePrefix}/about`
                    ? "text-[#E5C178]"
                    : "text-[#D4C4B3] hover:text-[#E5C178]"
                )}
              >
                <span>{dict.nav.about}</span>
              </Link>

              {/* 4. Branches (Dropdown) */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  ref={branchesButtonRef}
                  id="branches-menu-trigger"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isBranchesDropdownOpen}
                  aria-controls="branches-dropdown-menu"
                  onClick={() => setIsBranchesDropdownOpen((prev) => !prev)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-sm xl:text-[15px] font-sans font-semibold tracking-normal transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-md cursor-pointer",
                    isBranchesActive || isBranchesDropdownOpen
                      ? "text-[#E5C178]"
                      : "text-[#D4C4B3] hover:text-[#E5C178]"
                  )}
                >
                  <span>{dict.nav.branches}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isBranchesDropdownOpen ? "rotate-180 text-[#E5C178]" : "text-[#D4C4B3]"
                    )}
                  />
                  {isBranchesActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#E5C178]" />
                  )}
                </button>

                {/* Dropdown Menu Flyout */}
                {isBranchesDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    id="branches-dropdown-menu"
                    role="menu"
                    aria-labelledby="branches-menu-trigger"
                    className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#16100B]/98 backdrop-blur-xl border border-[rgba(212,163,89,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-3 py-1.5 text-xs uppercase font-sans font-semibold tracking-[0.14em] text-[#E5C178]">
                      {dict.nav.officialBranches}
                    </div>

                    <div className="space-y-1">
                      {BRANCH_ITEMS.map((branch) => {
                        const targetHref = `${localePrefix}${branch.href}`;
                        const isCurrent = pathname === targetHref;
                        return (
                          <Link
                            key={branch.slug}
                            href={targetHref}
                            role="menuitem"
                            onClick={() => setIsBranchesDropdownOpen(false)}
                            className={cn(
                              "flex flex-col gap-0.5 px-3 py-2.5 rounded-xl transition-colors group",
                              isCurrent
                                ? "bg-[rgba(34,24,16,0.9)] text-[#E5C178] border border-[rgba(212,163,89,0.35)]"
                                : "text-[#FAF4EB] hover:bg-[rgba(45,32,22,0.7)] hover:text-[#E5C178]"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-heading text-base font-semibold tracking-normal text-[#FAF4EB] group-hover:text-[#E5C178]">
                                {branch.name}
                              </span>
                              <ChevronRight className="h-4 w-4 text-[#D4C4B3]/50 group-hover:text-[#E5C178] group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <span className="text-xs font-sans text-[#E5C178] font-medium">
                              {branch.location}
                            </span>
                            <span className="text-xs font-sans text-[#D4C4B3] line-clamp-1">
                              {branch.description}
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="my-1.5 border-t border-[rgba(212,163,89,0.18)]" />

                    <Link
                      href={`${localePrefix}/#locations`}
                      role="menuitem"
                      onClick={() => setIsBranchesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-sans font-medium text-[#D4C4B3] hover:text-[#FAF4EB] hover:bg-[rgba(34,24,16,0.6)] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#E5C178]" />
                        <span>{dict.nav.allLocations}</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#D4C4B3]/70" />
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. Policies */}
              <Link
                href={`${localePrefix}/policies`}
                className={cn(
                  "relative px-3 py-2 min-h-[40px] inline-flex items-center text-sm xl:text-[15px] font-sans font-semibold tracking-normal transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-md",
                  pathname === `${localePrefix}/policies`
                    ? "text-[#E5C178]"
                    : "text-[#D4C4B3] hover:text-[#E5C178]"
                )}
              >
                <span>{dict.nav.policies}</span>
              </Link>

              {/* 6. List Property */}
              <Link
                href={`${localePrefix}/list-property`}
                className={cn(
                  "relative px-3 py-2 min-h-[40px] inline-flex items-center text-sm xl:text-[15px] font-sans font-semibold tracking-normal transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] rounded-md",
                  pathname === `${localePrefix}/list-property`
                    ? "text-[#E5C178]"
                    : "text-[#D4C4B3] hover:text-[#E5C178]"
                )}
              >
                <span>{dict.nav.listProperty}</span>
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              {/* Emaar-Style Language Switcher */}
              <LanguageSwitcher />

              {/* Sign In Pill Button */}
              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuthModal("Log in or create an account to view your bookings and access member rates.", undefined, "login")}
                  className="inline-flex items-center gap-2 px-3.5 xl:px-4 py-2 min-h-[40px] rounded-xl border border-[rgba(212,163,89,0.5)] hover:border-[#E5C178] bg-transparent hover:bg-[rgba(212,163,89,0.12)] text-[#E5C178] text-xs sm:text-sm font-semibold tracking-wide transition-all focus:outline-none cursor-pointer shadow-xs active:scale-[0.98]"
                  aria-label="Account: Sign In"
                >
                  <User className="h-4 w-4 text-[#E5C178]" />
                  <span>{dict.common.signIn}</span>
                </button>
              ) : (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                    className="group inline-flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-[#16100B] hover:bg-[rgba(34,24,16,0.9)] border border-[rgba(212,163,89,0.4)] text-[#FAF4EB] text-xs font-medium transition-all duration-150 focus:outline-none cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate font-medium">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 text-[#E5C178] transition-transform duration-200",
                        isUserDropdownOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* User Profile Dropdown Flyout */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#16100B]/98 backdrop-blur-xl border border-[rgba(212,163,89,0.28)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                      <div className="px-3 py-2 border-b border-[rgba(212,163,89,0.18)] mb-1">
                        <span className="font-semibold text-[#FAF4EB] block truncate">
                          {user.fullName}
                        </span>
                        <span className="text-[11px] text-[#B8A692] block truncate">
                          {user.email || user.phone}
                        </span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider text-[#E5C178] bg-[#E5C178]/15 px-2 py-0.5 rounded border border-[#E5C178]/30">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Administrator</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`${localePrefix}/my-bookings`}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#FAF4EB] hover:bg-[rgba(34,24,16,0.7)] hover:text-[#E5C178] transition-colors"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-[#E5C178]" />
                          <span>{dict.nav.myBookings}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#E5C178] hover:bg-[rgba(34,24,16,0.7)] transition-colors font-semibold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#E5C178]" />
                            <span>{dict.nav.adminPortal}</span>
                          </Link>
                        )}
                      </div>

                      <div className="my-1 border-t border-[rgba(212,163,89,0.18)]" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{dict.common.signOut}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* MOBILE HEADER: QUICK ACTIONS & HAMBURGER TRIGGER          */}
          {/* Touch target >= 44px                                      */}
          {/* ========================================================= */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-2.5">
            {/* Quick Language Switcher Trigger */}
            <LanguageSwitcher variant="header" />

            {/* Quick User Account Action Button (Icon-Only) */}
            {!user ? (
              <button
                type="button"
                onClick={() => openAuthModal("Log in or create an account to view your bookings and access member rates.", undefined, "login")}
                className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[rgba(212,163,89,0.4)] bg-[#16100B] text-[#E5C178] hover:border-[#E5C178] active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]"
                aria-label="Account: Log In or Sign Up"
                title="Account: Log In or Sign Up"
              >
                <User className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[rgba(212,163,89,0.4)] bg-[#16100B] text-[#E5C178] active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]"
                aria-label={`Logged in as ${user.fullName}`}
                title={user.fullName}
              >
                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] flex items-center justify-center font-bold text-[11px]">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              </button>
            )}

            {/* Hamburger Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[rgba(212,163,89,0.35)] bg-[rgba(34,24,16,0.85)] text-[#FAF4EB] hover:text-[#E5C178] hover:border-[#E5C178] active:scale-95 transition-all shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178] cursor-pointer"
              aria-label="Open Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5 text-[#E5C178]" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE NAVIGATION PANEL (Intentional, Luxurious Drawer)   */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-0 z-50 flex flex-col bg-[#0E0A07]/98 backdrop-blur-xl text-[#FAF4EB] animate-in fade-in duration-200"
        >
          {/* Mobile Panel Header: Brand + 44px Close Button */}
          <div className="flex items-center justify-between h-[68px] sm:h-[74px] px-4 sm:px-6 border-b border-[rgba(212,163,89,0.22)] bg-[#0E0A07] shrink-0">
            <Link
              href={HEADER_NAVIGATION.brand.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 focus:outline-none"
              aria-label="FLATEL Hospitality — The comfort of a flat. The service of a hotel."
            >
              {/* Official Gold Monogram Emblem (NO border, NO background box) */}
              <Image
                src="/images/flatel-monogram-clean.png"
                alt="FLATEL Monogram"
                width={36}
                height={36}
                className="w-8 h-8 object-contain shrink-0"
              />

              {/* Official FLATEL HOSPITALITY Logo Lockup */}
              <Image
                src="/images/flatel-logo-clean.png"
                alt="FLATEL Hospitality"
                width={140}
                height={42}
                className="h-6.5 w-auto object-contain shrink-0"
              />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-[rgba(212,163,89,0.3)] bg-[rgba(34,24,16,0.7)] text-[#FAF4EB] hover:text-[#E5C178] hover:border-[#E5C178] active:scale-95 transition-all focus:outline-none"
              aria-label="Close Navigation Menu"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Mobile Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Emaar-Style Mobile Language Switcher */}
              <LanguageSwitcher variant="mobile" />

              {/* Main Links matching desktop navbar exact order */}
              <div className="space-y-1">
                {/* 1. Properties */}
                <Link
                  href={`${localePrefix}/properties`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl text-[#FAF4EB] hover:text-[#E5C178] hover:bg-[rgba(34,24,16,0.6)] active:bg-[#16100B] transition-colors group"
                >
                  <span className="font-sans text-[15px] font-medium tracking-wide">
                    {dict.nav.properties}
                  </span>
                  <ChevronRight className={cn("h-4 w-4 text-[#B8A692]/50 group-hover:text-[#E5C178] group-hover:translate-x-0.5 transition-all", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
                </Link>

                {/* 2. Hospitals */}
                <Link
                  href={`${localePrefix}/hospitals`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl text-[#FAF4EB] hover:text-[#E5C178] hover:bg-[rgba(34,24,16,0.6)] active:bg-[#16100B] transition-colors group"
                >
                  <span className="font-sans text-[15px] font-medium tracking-wide">
                    {dict.nav.hospitals}
                  </span>
                  <ChevronRight className={cn("h-4 w-4 text-[#B8A692]/50 group-hover:text-[#E5C178] group-hover:translate-x-0.5 transition-all", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
                </Link>

                {/* 3. About */}
                <Link
                  href={`${localePrefix}/about`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl text-[#FAF4EB] hover:text-[#E5C178] hover:bg-[rgba(34,24,16,0.6)] active:bg-[#16100B] transition-colors group"
                >
                  <span className="font-sans text-[15px] font-medium tracking-wide">
                    {dict.nav.about}
                  </span>
                  <ChevronRight className={cn("h-4 w-4 text-[#B8A692]/50 group-hover:text-[#E5C178] group-hover:translate-x-0.5 transition-all", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
                </Link>

                {/* 4. Branches Accordion Group */}
                <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] overflow-hidden my-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileBranchesOpen((prev) => !prev)}
                    className="flex items-center justify-between w-full min-h-[48px] px-4 py-3 text-left focus:outline-none cursor-pointer"
                    aria-expanded={isMobileBranchesOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-[#E5C178]" />
                      <span className="font-heading text-[15px] font-semibold text-[#FAF4EB]">
                        {dict.nav.branches}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-[#B8A692] transition-transform duration-200",
                        isMobileBranchesOpen && "rotate-180 text-[#E5C178]"
                      )}
                    />
                  </button>

                  {isMobileBranchesOpen && (
                    <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[rgba(212,163,89,0.18)]">
                      {BRANCH_ITEMS.map((branch) => (
                        <Link
                          key={branch.slug}
                          href={`${localePrefix}${branch.href}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex flex-col p-2.5 rounded-xl bg-[#16100B] border border-[rgba(212,163,89,0.22)] hover:border-[#E5C178]/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-sm font-semibold text-[#FAF4EB]">
                              {branch.name}
                            </span>
                            <ChevronRight className={cn("h-3.5 w-3.5 text-[#E5C178]", isAr && "rotate-180")} />
                          </div>
                          <span className="text-[11px] font-sans text-[#E5C178] mt-0.5">
                            {branch.location}
                          </span>
                          <span className="text-[11px] font-sans text-[#D4C4B3]">
                            {branch.description}
                          </span>
                        </Link>
                      ))}

                      <Link
                        href={`${localePrefix}/#locations`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg text-xs font-sans text-[#D4C4B3] hover:text-[#FAF4EB]"
                      >
                        <span>{dict.nav.allLocations}</span>
                        <ChevronRight className={cn("h-3.5 w-3.5 text-[#E5C178]", isAr && "rotate-180")} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. Policies */}
                <Link
                  href={`${localePrefix}/policies`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl text-[#FAF4EB] hover:text-[#E5C178] hover:bg-[rgba(34,24,16,0.6)] active:bg-[#16100B] transition-colors group"
                >
                  <span className="font-sans text-[15px] font-medium tracking-wide">
                    {dict.nav.policies}
                  </span>
                  <ChevronRight className={cn("h-4 w-4 text-[#B8A692]/50 group-hover:text-[#E5C178] group-hover:translate-x-0.5 transition-all", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
                </Link>

                {/* 6. List Property */}
                <Link
                  href={`${localePrefix}/list-property`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl text-[#FAF4EB] hover:text-[#E5C178] hover:bg-[rgba(34,24,16,0.6)] active:bg-[#16100B] transition-colors group"
                >
                  <span className="font-sans text-[15px] font-medium tracking-wide">
                    {dict.nav.listProperty}
                  </span>
                  <ChevronRight className={cn("h-4 w-4 text-[#B8A692]/50 group-hover:text-[#E5C178] group-hover:translate-x-0.5 transition-all", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
                </Link>
              </div>

              {/* Refined Divider */}
              <div className="pt-1 pb-1">
                <div className="h-px w-full bg-[rgba(212,163,89,0.18)]" />
              </div>

              {/* User Authentication Mobile Block (Log In / Create Account) */}
              {!user ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal("Log in to access your guest reservations.", undefined, "login");
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[rgba(212,163,89,0.5)] text-[#E5C178] hover:bg-[rgba(212,163,89,0.1)] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Log In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal("Create an account for instant reservations.", undefined, "signup");
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs shadow-md shadow-[#E5C178]/20 transition-all cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.7)] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#FAF4EB] text-xs block">
                        {user.fullName}
                      </span>
                      <span className="text-[11px] text-[#B8A692] block">
                        {user.phone || user.email}
                      </span>
                    </div>
                    {isAdmin && (
                      <span className="text-[10px] font-bold text-[#E5C178] bg-[#E5C178]/15 px-2 py-0.5 rounded border border-[#E5C178]/30">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[rgba(212,163,89,0.18)] flex flex-col gap-1 text-xs">
                    <Link
                      href={`${localePrefix}/my-bookings`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-1.5 text-[#FAF4EB] hover:text-[#E5C178]"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#E5C178]" />
                      <span>{dict.nav.myBookings}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-1.5 text-[#E5C178] font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E5C178]" />
                        <span>{dict.nav.adminPortal}</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 py-1.5 text-red-400 hover:text-red-300 text-left mt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{dict.common.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 pb-6 sm:pb-8 border-t border-[rgba(212,163,89,0.22)] space-y-3">
              <Link
                href={`${localePrefix}/properties`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98]"
              >
                <span>{dict.home.exploreResidences}</span>
              </Link>

              <p className="text-center font-sans text-[10px] tracking-[0.14em] uppercase text-[#B8A692]/70 pt-1">
                FLATEL Hospitality Private Limited • Hyderabad
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SiteHeader() {
  return (
    <React.Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full h-16 bg-[#0E0A07] border-b border-[rgba(212,163,89,0.22)]" />
      }
    >
      <SiteHeaderContent />
    </React.Suspense>
  );
}
