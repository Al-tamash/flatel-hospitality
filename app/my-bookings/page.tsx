"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { BookingRecord } from "@/types/booking";
import { getRoomById } from "@/lib/mock-rooms";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  CalendarCheck,
  Calendar,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Search,
  ExternalLink,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, openAuthModal } = useAuth();

  const [bookingState, setBookingState] = React.useState<{
    userId: string | null;
    bookings: BookingRecord[];
  }>({ userId: null, bookings: [] });
  const bookings = user && bookingState.userId === user.id ? bookingState.bookings : [];
  const [loadingBookings, setLoadingBookings] = React.useState(false);
  const [lookupCode, setLookupCode] = React.useState("");
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Fetch guest's bookings whenever user is logged in
  React.useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchBookings = async () => {
      if (isMounted) setLoadingBookings(true);
      try {
        const query = new URLSearchParams();
        if (user.email) query.set("email", user.email);
        if (user.phone) query.set("phone", user.phone);

        const res = await fetch(`/api/bookings/my-bookings?${query.toString()}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.bookings)) {
          setBookingState({ userId: user.id, bookings: data.bookings });
        }
      } catch (err) {
        console.error("Error fetching guest reservations:", err);
      } finally {
        if (isMounted) setLoadingBookings(false);
      }
    };

    void fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const cleaned = lookupCode.trim().toUpperCase();
    if (!cleaned) {
      setLookupError("Please enter the booking reference shown in your confirmation message.");
      return;
    }
    router.push(`/booking-confirmation/${cleaned}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-fg flex flex-col selection:bg-gold/20 selection:text-gold">
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-fg-muted font-mono tracking-wider">Loading guest account...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Unauthenticated Guest View
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-fg flex flex-col selection:bg-gold/20 selection:text-gold">
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-raised/70 border border-line text-gold text-xs font-sans font-medium uppercase tracking-[0.18em] mb-4">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Guest Reservation Portal</span>
              </div>
              <h1 className="font-heading text-fg mb-3 heading-page">
                My Reservations
              </h1>
              <p className="text-sm text-fg-muted max-w-lg mx-auto leading-relaxed">
                Sign in to manage your upcoming stays, view digital check-in vouchers, and access exclusive member privileges.
              </p>
            </div>

            {/* Authentication Prompt Card */}
            <div className="rounded-2xl border border-line bg-raised/75 backdrop-blur-md p-6 sm:p-8 shadow-2xl mb-8 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/15 border border-line-strong text-gold flex items-center justify-center mx-auto mb-5">
                <User className="w-7 h-7" />
              </div>

              <h2 className="font-heading text-fg mb-2 heading-sub">
                Log In or Create an Account
              </h2>
              <p className="text-xs text-fg-muted mb-6 max-w-sm mx-auto leading-relaxed">
                Access your reservations with your registered Indian phone number (+91) or email, or create a new account in seconds.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuthModal("Log in to access your reservation history and digital vouchers.", undefined, "login")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold to-gold-deep text-ink font-bold text-xs transition-all shadow-lg hover:brightness-105 cursor-pointer active:scale-[0.98] border-none"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("Create an account to manage your stays and member rates.", undefined, "signup")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-line-strong text-gold hover:bg-gold/8 font-medium text-xs transition-all cursor-pointer active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>

            {/* Alternative: Lookup with Booking Reference Code */}
            <div className="rounded-2xl border border-line-soft bg-surface/80 backdrop-blur-md p-6 text-center shadow-xl">
              <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold block mb-1">
                Have a reservation code?
              </span>
              <p className="text-xs text-fg-muted mb-4">
                Look up any voucher directly using your Flatel reference code.
              </p>

              <form onSubmit={handleLookupSubmit} className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="Enter booking reference"
                    aria-label="Enter booking reference"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface/90 border border-control text-sm text-fg placeholder-fg-muted/40 focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs cursor-pointer transition-all hover:brightness-105 border-none shadow-md"
                >
                  Find Stay
                </button>
              </form>

              {lookupError && (
                <p className="text-xs text-rose-400 mt-2">{lookupError}</p>
              )}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Authenticated Guest View
  return (
    <div className="min-h-screen bg-background text-fg flex flex-col selection:bg-gold/20 selection:text-gold">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Guest Profile Banner */}
          <div className="rounded-2xl border border-line bg-raised/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-deep text-ink flex items-center justify-center text-xl font-bold font-heading shadow-md shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-fg heading-page">
                    {user.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-line">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Guest
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-fg-muted flex-wrap">
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gold" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                  {user.email && !user.email.includes("@guest.flatel.in") && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gold" />
                      <span>{user.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/#flats"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold to-gold-deep text-ink text-xs font-bold transition-all shadow-md hover:brightness-105 border-none"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Book New Stay</span>
              </Link>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-fg heading-sub">
                Reservation History
              </h2>
              <p className="text-xs text-fg-muted mt-0.5">
                Access your digital vouchers, check-in instructions, and balance receipts.
              </p>
            </div>

            {/* Quick Lookup Input */}
            <form onSubmit={handleLookupSubmit} className="hidden sm:flex items-center gap-2">
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                placeholder="Search booking reference"
                className="px-3 py-1.5 rounded-lg bg-surface/90 border border-control text-xs text-fg placeholder-fg-muted/40 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-raised/80 hover:bg-raised text-gold border border-line transition-colors cursor-pointer"
                title="Lookup reservation code"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Loading State */}
          {loadingBookings && (
            <div className="rounded-2xl border border-line-soft bg-raised/70 p-12 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-fg-muted font-mono">Fetching your reservation records...</p>
            </div>
          )}

          {/* Empty State */}
          {!loadingBookings && bookings.length === 0 && (
            <div className="rounded-2xl border border-line bg-raised/75 backdrop-blur-md p-10 text-center shadow-xl">
              <div className="w-14 h-14 rounded-full bg-surface border border-line text-gold flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-normal text-fg mb-1">
                No Active Reservations Found
              </h3>
              <p className="text-xs text-fg-muted max-w-md mx-auto mb-6 leading-relaxed">
                You do not have any bookings linked directly to your current session. Once you complete a booking on FLATEL, it will automatically appear here.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/#flats"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs transition-all hover:brightness-105 border-none shadow-md"
                >
                  <span>Browse Apartments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Bookings List */}
          {!loadingBookings && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((b) => {
                const room = getRoomById(b.unitId);
                const isConfirmed = b.paymentStatus === "advance_paid" || b.bookingStatus === "confirmed";

                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-line bg-raised/80 backdrop-blur-md p-5 sm:p-6 shadow-xl hover:border-line-strong transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line-soft pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-gold">
                            {b.bookingCode || "FLT-PENDING"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(b.bookingCode || b.id)}
                            className="text-fg-muted hover:text-fg p-1 transition-colors cursor-pointer"
                            title="Copy Booking Reference"
                          >
                            {copiedId === (b.bookingCode || b.id) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <span
                            className={`inline-flex items-center gap-1 text-xs font-sans font-medium uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full border ${
                              isConfirmed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            <span>{isConfirmed ? "Confirmed Stay" : "Pending Confirmation"}</span>
                          </span>
                        </div>
                        <h3 className="font-heading text-xl font-normal text-fg mt-1.5 leading-snug">
                          {room ? room.title : `Flatel Unit (${b.unitId})`}
                        </h3>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-fg-muted block">
                          Advance Paid (<span className="font-serif oldstyle-nums">20%</span>)
                        </span>
                        <span className="font-serif oldstyle-nums text-lg font-bold text-fg">
                          ₹{b.pricing.advancePayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-5">
                      <div className="p-3 rounded-xl bg-surface/80 border border-line-soft">
                        <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold block mb-1">
                          Check-In
                        </span>
                        <div className="flex items-center gap-1.5 font-normal text-fg">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          <span className="font-serif oldstyle-nums">{b.checkInDate}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface/80 border border-line-soft">
                        <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold block mb-1">
                          Check-Out
                        </span>
                        <div className="flex items-center gap-1.5 font-normal text-fg">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          <span className="font-serif oldstyle-nums">{b.checkOutDate}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface/80 border border-line-soft">
                        <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold block mb-1">
                          Duration & Guests
                        </span>
                        <span className="font-normal text-fg">
                          <span className="font-serif oldstyle-nums font-semibold">{b.totalNights}</span> Nights • <span className="font-serif oldstyle-nums font-semibold">{b.adultsCount}</span> Adults
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface/80 border border-line-soft">
                        <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold block mb-1">
                          Balance Due (<span className="font-serif oldstyle-nums">80%</span>)
                        </span>
                        <span className="font-serif oldstyle-nums font-semibold text-fg">
                          ₹{b.pricing.balanceDueOnArrival.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line-soft">
                      <div className="text-xs text-fg-muted">
                        <span>Reserved under: </span>
                        <span className="text-fg font-medium">{b.guest.fullName}</span>
                        {b.guest.phone && <span> ({b.guest.phone})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/booking-confirmation/${b.bookingCode || b.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold via-gold to-gold-deep text-ink font-bold text-xs transition-all shadow-md hover:brightness-105 border-none"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Digital Voucher</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
