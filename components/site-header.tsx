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
import { Dialog } from "@base-ui/react/dialog";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ARABIC_BRANCH_OVERLAYS } from "@/components/branch-hub";
import { StaggerIn } from "@/components/motion/stagger-in";

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

const desktopLinkClass =
  "nav-underline relative px-2 xl:px-3 py-2 min-h-[40px] inline-flex items-center whitespace-nowrap text-sm xl:text-base font-sans font-semibold tracking-normal transition-colors duration-150 rounded-md";

function DesktopNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(desktopLinkClass, active ? "text-gold" : "text-fg-soft hover:text-gold")}
    >
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  isAr,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  isAr: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between min-h-[46px] px-3.5 py-2.5 rounded-xl hover:text-gold hover:bg-raised/60 active:bg-surface transition-colors group",
        active ? "text-gold" : "text-fg"
      )}
    >
      <span className="font-sans text-base font-medium tracking-wide">{children}</span>
      <ChevronRight
        className={cn(
          "h-4 w-4 text-fg-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all",
          isAr && "rotate-180 group-hover:-translate-x-0.5"
        )}
        aria-hidden="true"
      />
    </Link>
  );
}

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
  // True once the menu was opened by click/keyboard: hover-out then no longer closes it, and a click toggles it
  const branchesPinnedRef = React.useRef(false);

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
        branchesPinnedRef.current = false;
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
          branchesPinnedRef.current = false;
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
    if (branchesPinnedRef.current) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsBranchesDropdownOpen(false);
    }, 150);
  };

  // Hovering already opens the menu, so a click must not toggle it shut again
  const handleBranchesClick = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (isBranchesDropdownOpen && branchesPinnedRef.current) {
      branchesPinnedRef.current = false;
      setIsBranchesDropdownOpen(false);
    } else {
      branchesPinnedRef.current = true;
      setIsBranchesDropdownOpen(true);
    }
  };

  const isBranchesActive = pathname.startsWith(`${localePrefix}/branches`);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-colors duration-200 select-none",
          "bg-canvas/92 backdrop-blur-md",
          isScrolled
            ? "border-b border-line shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
            : "border-b border-line-soft"
        )}
      >
        <div className="scroll-progress" aria-hidden="true" />
        <div className="mx-auto flex h-[66px] sm:h-[74px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* ========================================================= */}
          {/* LEFT: BRAND LOCKUP                                        */}
          {/* FLATEL HOSPITALITY                                        */}
          {/* The comfort of a flat. The service of a hotel.            */}
          {/* ========================================================= */}
          <div className="flex items-center shrink-0">
            <Link
              href={localePrefix || "/"}
              className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-xs py-1"
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
          {/* Properties, Hospitals, Branches, Membership, About, Policies, List Property */}
          {/* Actions: Hotline, WhatsApp, Admin Login                   */}
          {/* ========================================================= */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-7">
            {/* Core Navigation Links */}
            <nav
              className="flex items-center gap-2 xl:gap-3"
              aria-label="Primary Navigation"
            >
              <DesktopNavLink href={`${localePrefix}/properties`} active={pathname.startsWith(`${localePrefix}/properties`)}>
                {dict.nav.properties}
              </DesktopNavLink>
              <DesktopNavLink href={`${localePrefix}/hospitals`} active={pathname === `${localePrefix}/hospitals`}>
                {dict.nav.hospitals}
              </DesktopNavLink>
              {/* 3. Branches (Dropdown) */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    branchesPinnedRef.current = false;
                    setIsBranchesDropdownOpen(false);
                  }
                }}
              >
                <button
                  ref={branchesButtonRef}
                  id="branches-menu-trigger"
                  type="button"
                  aria-expanded={isBranchesDropdownOpen}
                  aria-controls="branches-dropdown-menu"
                  data-active={isBranchesActive}
                  onClick={handleBranchesClick}
                  className={cn(
                    "nav-underline relative inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-sm xl:text-base font-sans font-semibold tracking-normal transition-colors duration-150 rounded-md cursor-pointer",
                    isBranchesActive || isBranchesDropdownOpen
                      ? "text-gold"
                      : "text-fg-soft hover:text-gold"
                  )}
                >
                  <span>{dict.nav.branches}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isBranchesDropdownOpen ? "rotate-180 text-gold" : "text-fg-soft"
                    )}
                  />
                </button>

                {/* Dropdown Menu Flyout */}
                {isBranchesDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    id="branches-dropdown-menu"
                    className="absolute top-full start-0 mt-2 w-72 rounded-2xl bg-surface/98 backdrop-blur-xl border border-line shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-3 py-1.5 text-xs uppercase font-sans font-semibold tracking-[0.14em] text-gold">
                      {dict.nav.officialBranches}
                    </div>

                    <div className="space-y-1">
                      {BRANCH_ITEMS.map((branch) => {
                        const targetHref = `${localePrefix}${branch.href}`;
                        const isCurrent = pathname === targetHref;
                        const bName = (isAr && ARABIC_BRANCH_OVERLAYS[branch.slug]?.name) || branch.name;
                        const bLoc = (isAr && (branch.slug === "barkas-salala" ? "قرب تشاندريانغوتا وطريق المطار" : "قرب شارمينار والبلدة القديمة")) || branch.location;
                        const bDesc = (isAr && (branch.slug === "barkas-salala" ? "شقتان ٣ غرف وصالة · ٦–٩ ضيوف" : "شقق ١، ٢ و٤ غرف وصالة · ٢–١٢ ضيفاً")) || branch.description;
                        return (
                          <Link
                            key={branch.slug}
                            href={targetHref}
                            aria-current={isCurrent ? "page" : undefined}
                            onClick={() => setIsBranchesDropdownOpen(false)}
                            className={cn(
                              "flex flex-col gap-0.5 px-3 py-2.5 rounded-xl transition-colors group",
                              isCurrent
                                ? "bg-raised/90 text-gold border border-line"
                                : "text-fg hover:bg-raised-hover/70 hover:text-gold"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-heading text-base font-semibold tracking-normal text-fg group-hover:text-gold">
                                {bName}
                              </span>
                              <ChevronRight className={cn("h-4 w-4 text-fg-soft/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all", isAr && "rotate-180 group-hover:-translate-x-0.5")} />
                            </div>
                            <span className="text-xs font-sans text-gold font-medium">
                              {bLoc}
                            </span>
                            <span className="text-xs font-sans text-fg-soft line-clamp-1">
                              {bDesc}
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="my-1.5 border-t border-line-soft" />

                    <Link
                      href={`${localePrefix}/#locations`}
                      onClick={() => setIsBranchesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-sans font-medium text-fg-soft hover:text-fg hover:bg-raised/60 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gold" />
                        <span>{dict.nav.allLocations}</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-fg-soft/70" />
                    </Link>
                  </div>
                )}
              </div>
              <DesktopNavLink href={`${localePrefix}/membership`} active={pathname === `${localePrefix}/membership`}>
                {dict.nav.membership}
              </DesktopNavLink>
              <DesktopNavLink href={`${localePrefix}/about`} active={pathname === `${localePrefix}/about`}>
                {dict.nav.about}
              </DesktopNavLink>

              <DesktopNavLink href={`${localePrefix}/policies`} active={pathname === `${localePrefix}/policies`}>
                {dict.nav.policies}
              </DesktopNavLink>
              <DesktopNavLink href={`${localePrefix}/list-property`} active={pathname === `${localePrefix}/list-property`}>
                {dict.nav.listProperty}
              </DesktopNavLink>
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
                  className="inline-flex items-center gap-2 px-3.5 xl:px-4 py-2 min-h-[40px] rounded-xl border border-line-strong hover:border-gold bg-transparent hover:bg-gold/12 text-gold text-xs sm:text-sm font-semibold tracking-wide transition-all focus:outline-none cursor-pointer shadow-xs active:scale-[0.98]"
                  aria-label={isAr ? "الحساب: تسجيل الدخول" : "Account: Sign In"}
                >
                  <User className="h-4 w-4 text-gold" />
                  <span>{dict.common.signIn}</span>
                </button>
              ) : (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                    className="group inline-flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-surface hover:bg-raised/90 border border-line-strong text-fg text-xs font-medium transition-all duration-150 focus:outline-none cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gold to-gold-deep text-ink flex items-center justify-center font-bold text-xs shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate font-medium">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 text-gold transition-transform duration-200",
                        isUserDropdownOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* User Profile Dropdown Flyout */}
                  {isUserDropdownOpen && (
                    <div className="absolute end-0 top-full mt-2 w-60 rounded-2xl bg-surface/98 backdrop-blur-xl border border-line shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                      <div className="px-3 py-2 border-b border-line-soft mb-1">
                        <span className="font-semibold text-fg block truncate">
                          {user.fullName}
                        </span>
                        <span className="text-xs text-fg-muted block truncate">
                          {user.email || user.phone}
                        </span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded border border-gold/30">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Administrator</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`${localePrefix}/my-bookings`}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-fg hover:bg-raised/70 hover:text-gold transition-colors"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-gold" />
                          <span>{dict.nav.myBookings}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gold hover:bg-raised/70 transition-colors font-semibold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                            <span>{dict.nav.adminPortal}</span>
                          </Link>
                        )}
                      </div>

                      <div className="my-1 border-t border-line-soft" />

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
                className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-line-strong bg-surface text-gold hover:border-gold active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                aria-label="Account: Log In or Sign Up"
                title="Account: Log In or Sign Up"
              >
                <User className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-line-strong bg-surface text-gold active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                aria-label={`Logged in as ${user.fullName}`}
                title={user.fullName}
              >
                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-r from-gold to-gold-deep text-ink flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              </button>
            )}

            {/* Hamburger Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-line bg-raised/85 text-fg hover:text-gold hover:border-gold active:scale-95 transition-all shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer"
              aria-label={isAr ? "فتح قائمة التنقل" : "Open Navigation Menu"}
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5 text-gold" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE NAVIGATION PANEL (Intentional, Luxurious Drawer)   */}
      {/* ========================================================= */}
      <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <Dialog.Portal>
        <Dialog.Popup
          aria-label={isAr ? "قائمة التنقل" : "Navigation Menu"}
          dir={isAr ? "rtl" : "ltr"}
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-canvas text-fg outline-none animate-in fade-in duration-200",
            isAr && "font-arabic"
          )}
        >
          {/* Mobile Panel Header: Brand + 44px Close Button */}
          <div className="flex items-center justify-between h-[66px] sm:h-[74px] px-4 sm:px-6 border-b border-line bg-canvas shrink-0">
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

            <Dialog.Close
              className="h-11 w-11 flex items-center justify-center rounded-xl border border-line bg-raised/70 text-fg hover:text-gold hover:border-gold active:scale-95 transition-all cursor-pointer"
              aria-label={isAr ? "إغلاق قائمة التنقل" : "Close Navigation Menu"}
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Mobile Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col justify-between">
            <StaggerIn className="space-y-4">
              {/* Emaar-Style Mobile Language Switcher */}
              <LanguageSwitcher variant="mobile" />

              {/* Main Links matching desktop navbar exact order */}
              <div className="space-y-1">
                <MobileNavLink href={`${localePrefix}/properties`} active={pathname.startsWith(`${localePrefix}/properties`)} isAr={isAr} onNavigate={closeMobileMenu}>
                  {dict.nav.properties}
                </MobileNavLink>
                <MobileNavLink href={`${localePrefix}/hospitals`} active={pathname === `${localePrefix}/hospitals`} isAr={isAr} onNavigate={closeMobileMenu}>
                  {dict.nav.hospitals}
                </MobileNavLink>
                {/* 3. Branches Accordion Group */}
                <div className="rounded-2xl border border-line bg-raised/65 overflow-hidden my-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileBranchesOpen((prev) => !prev)}
                    className="flex items-center justify-between w-full min-h-[48px] px-4 py-3 text-left focus:outline-none cursor-pointer"
                    aria-expanded={isMobileBranchesOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-gold" />
                      <span className="font-heading text-base font-semibold text-fg">
                        {dict.nav.branches}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-fg-muted transition-transform duration-200",
                        isMobileBranchesOpen && "rotate-180 text-gold"
                      )}
                    />
                  </button>

                  {isMobileBranchesOpen && (
                    <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-line-soft">
                      {BRANCH_ITEMS.map((branch) => {
                        const bName = (isAr && ARABIC_BRANCH_OVERLAYS[branch.slug]?.name) || branch.name;
                        const bLoc = (isAr && (branch.slug === "barkas-salala" ? "قرب تشاندريانغوتا وطريق المطار" : "قرب شارمينار والبلدة القديمة")) || branch.location;
                        const bDesc = (isAr && (branch.slug === "barkas-salala" ? "شقتان ٣ غرف وصالة · ٦–٩ ضيوف" : "شقق ١، ٢ و٤ غرف وصالة · ٢–١٢ ضيفاً")) || branch.description;
                        return (
                          <Link
                            key={branch.slug}
                            href={`${localePrefix}${branch.href}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex flex-col p-2.5 rounded-xl bg-surface border border-line hover:border-gold/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-heading text-sm font-semibold text-fg">
                                {bName}
                              </span>
                              <ChevronRight className={cn("h-3.5 w-3.5 text-gold", isAr && "rotate-180")} />
                            </div>
                            <span className="text-xs font-sans text-gold mt-0.5">
                              {bLoc}
                            </span>
                            <span className="text-xs font-sans text-fg-soft">
                              {bDesc}
                            </span>
                          </Link>
                        );
                      })}

                      <Link
                        href={`${localePrefix}/#locations`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg text-xs font-sans text-fg-soft hover:text-fg"
                      >
                        <span>{dict.nav.allLocations}</span>
                        <ChevronRight className={cn("h-3.5 w-3.5 text-gold", isAr && "rotate-180")} />
                      </Link>
                    </div>
                  )}
                </div>
                <MobileNavLink href={`${localePrefix}/membership`} active={pathname === `${localePrefix}/membership`} isAr={isAr} onNavigate={closeMobileMenu}>
                  {dict.nav.membership}
                </MobileNavLink>
                <MobileNavLink href={`${localePrefix}/about`} active={pathname === `${localePrefix}/about`} isAr={isAr} onNavigate={closeMobileMenu}>
                  {dict.nav.about}
                </MobileNavLink>

                <MobileNavLink href={`${localePrefix}/policies`} active={pathname === `${localePrefix}/policies`} isAr={isAr} onNavigate={closeMobileMenu}>
                  {dict.nav.policies}
                </MobileNavLink>
                <MobileNavLink href={`${localePrefix}/list-property`} active={pathname === `${localePrefix}/list-property`} isAr={isAr} onNavigate={closeMobileMenu}>
                  {dict.nav.listProperty}
                </MobileNavLink>
              </div>

              {/* Refined Divider */}
              <div className="pt-1 pb-1">
                <div className="h-px w-full bg-gold/18" />
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
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-line-strong text-gold hover:bg-gold/10 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>{dict.common.signIn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal("Create an account for instant reservations.", undefined, "signup");
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs shadow-md shadow-gold/20 transition-all cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{isAr ? "إنشاء حساب" : "Create Account"}</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-raised/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-fg text-xs block">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-fg-muted block">
                        {user.phone || user.email}
                      </span>
                    </div>
                    {isAdmin && (
                      <span className="text-xs font-bold text-gold bg-gold/15 px-2 py-0.5 rounded border border-gold/30">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-line-soft flex flex-col gap-1 text-xs">
                    <Link
                      href={`${localePrefix}/my-bookings`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-1.5 text-fg hover:text-gold"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-gold" />
                      <span>{dict.nav.myBookings}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-1.5 text-gold font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-gold" />
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
            </StaggerIn>

            {/* Bottom Actions */}
            <div className="pt-4 pb-6 sm:pb-8 border-t border-line space-y-3">
              <Link
                href={`${localePrefix}/properties`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98]"
              >
                <span>{dict.home.exploreResidences}</span>
              </Link>

              <p className="text-center font-sans text-xs tracking-[0.14em] uppercase text-fg-muted pt-1">
                FLATEL Hospitality Private Limited • Hyderabad
              </p>
            </div>
          </div>
        </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export function SiteHeader() {
  return (
    <React.Suspense
      fallback={
        <header className="sticky top-0 z-40 w-full h-[66px] sm:h-[74px] bg-canvas border-b border-line" />
      }
    >
      <SiteHeaderContent />
    </React.Suspense>
  );
}
