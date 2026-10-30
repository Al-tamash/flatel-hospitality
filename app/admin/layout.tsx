"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Sparkles,
  CalendarX,
  BadgeCheck,
  ExternalLink,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Lock,
  ArrowRight,
  AlertCircle,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Overview & Metrics",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Flat Inventory (1-5 BHK)",
    href: "/admin/inventory",
    icon: Building2,
  },
  {
    label: "Reservations & Collections",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Stay Add-On Services",
    href: "/admin/services",
    icon: Sparkles,
  },
  {
    label: "Calendar Blackouts",
    href: "/admin/calendar",
    icon: CalendarX,
  },
  {
    label: "Flatel Members",
    href: "/admin/members",
    icon: BadgeCheck,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading, signInWithEmail, signOut } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // Admin Login Gate Form State
  const [adminEmail, setAdminEmail] = React.useState("reservation@flatel.in");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    const res = await signInWithEmail(adminEmail, adminPassword);
    setIsAuthenticating(false);

    if (res.error) {
      setAuthError(res.error);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center text-gold gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <span className="text-xs font-sans tracking-wider text-fg-muted">Verifying Executive Access...</span>
      </div>
    );
  }

  // 2. Access Denied / Admin Authentication Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-canvas text-fg flex items-center justify-center p-4 selection:bg-gold/20 selection:text-gold">
        <div className="w-full max-w-md rounded-2xl bg-raised/85 border border-line shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-gold-deep via-gold to-gold-deep" />

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface border border-line text-gold mb-3">
                <Lock className="w-6 h-6 text-gold" />
              </div>
              <p className="text-xs font-medium tracking-[0.18em] uppercase text-gold mb-1.5">
                Executive Portal
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-fg">
                Owner Administration
              </h1>
              <p className="text-xs text-fg-muted mt-2 leading-relaxed">
                This portal is strictly restricted to authorized Flatel Hospitality leadership (<code className="text-gold font-mono">reservation@flatel.in</code>).
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-sans">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-medium tracking-[0.18em] uppercase text-fg-muted mb-1.5">
                  Administrator Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-surface/90 border border-control rounded-xl px-3.5 py-2.5 text-fg font-mono text-xs focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-medium tracking-[0.18em] uppercase text-fg-muted mb-1.5">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-surface/90 border border-control rounded-xl px-3.5 py-2.5 text-fg text-xs focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs transition-all shadow-md shadow-gold/15 disabled:opacity-50 cursor-pointer"
              >
                <span>{isAuthenticating ? "Verifying Credentials..." : "Authenticate as Administrator"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-line-soft">
              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors pt-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Flatel Public Website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Canvas
  return (
    <div className="min-h-screen bg-canvas text-fg flex flex-col md:flex-row font-sans selection:bg-gold/20 selection:text-gold">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface/95 border-b border-line-soft backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-serif font-medium text-base tracking-wider text-fg">
            FLATEL <span className="text-gold">ADMIN</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-1.5 rounded-lg bg-raised text-gold border border-line"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "w-full md:w-64 bg-surface/95 border-r border-line-soft backdrop-blur-md flex flex-col justify-between shrink-0 z-30 transition-all duration-300",
          "md:min-h-screen md:sticky md:top-0 md:h-screen",
          isMobileNavOpen ? "block" : "hidden md:flex"
        )}
      >
        <div className="p-5 flex flex-col gap-6">
          {/* Logo & Portal Crest */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-serif text-lg font-medium tracking-wider text-fg">
                FLATEL <span className="text-gold">ADMIN</span>
              </span>
            </Link>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate">Owner: {user?.email}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-[0.18em] px-2 mb-1">
              Management
            </span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-gold to-gold-deep text-ink shadow-md shadow-gold/20 font-bold"
                      : "text-fg-muted hover:bg-raised hover:text-fg"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-ink" : "text-gold")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-line-soft flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-fg-muted hover:text-fg hover:bg-raised transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
              <span>View Live Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-fg-faint" />
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Admin</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 w-full min-h-screen bg-canvas p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
