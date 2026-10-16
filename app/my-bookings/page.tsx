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
      <div className="min-h-screen bg-background text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E5C178] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#B8A692] font-mono tracking-wider">Loading guest account...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Unauthenticated Guest View
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
        <SiteHeader />
        <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(34,24,16,0.7)] border border-[rgba(212,163,89,0.3)] text-[#E5C178] text-[11px] font-sans font-medium uppercase tracking-[0.18em] mb-4">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Guest Reservation Portal</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#FAF4EB] mb-3 leading-[1.08]">
                My Reservations
              </h1>
              <p className="text-sm text-[#B8A692] max-w-lg mx-auto leading-relaxed">
                Sign in to manage your upcoming stays, view digital check-in vouchers, and access exclusive member privileges.
              </p>
            </div>

            {/* Authentication Prompt Card */}
            <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.75)] backdrop-blur-md p-6 sm:p-8 shadow-2xl mb-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[rgba(229,193,120,0.15)] border border-[rgba(212,163,89,0.4)] text-[#E5C178] flex items-center justify-center mx-auto mb-5">
                <User className="w-7 h-7" />
              </div>

              <h2 className="text-xl font-heading text-[#FAF4EB] font-normal mb-2">
                Log In or Create an Account
              </h2>
              <p className="text-xs text-[#B8A692] mb-6 max-w-sm mx-auto leading-relaxed">
                Access your reservations with your registered Indian phone number (+91) or email, or create a new account in seconds.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuthModal("Log in to access your reservation history and digital vouchers.", undefined, "login")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] via-[#D8AE5E] to-[#C69344] text-[#140E08] font-bold text-xs transition-all shadow-lg hover:brightness-105 cursor-pointer active:scale-[0.98] border-none"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("Create an account to manage your stays and member rates.", undefined, "signup")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(212,163,89,0.4)] text-[#E5C178] hover:bg-[rgba(229,193,120,0.08)] font-medium text-xs transition-all cursor-pointer active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>

            {/* Alternative: Lookup with Booking Reference Code */}
            <div className="rounded-2xl border border-[rgba(212,163,89,0.2)] bg-[rgba(22,16,11,0.8)] backdrop-blur-md p-6 text-center shadow-xl">
              <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] block mb-1">
                Have a reservation code?
              </span>
              <p className="text-xs text-[#B8A692] mb-4">
                Look up any voucher directly using your Flatel reference code.
              </p>

              <form onSubmit={handleLookupSubmit} className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#E5C178] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="Enter booking reference"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#16100B]/90 border border-[rgba(212,163,89,0.25)] text-sm text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs cursor-pointer transition-all hover:brightness-105 border-none shadow-md"
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
    <div className="min-h-screen bg-background text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Guest Profile Banner */}
          <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.8)] backdrop-blur-md p-6 sm:p-8 shadow-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E5C178] to-[#C69344] text-[#140E08] flex items-center justify-center text-xl font-bold font-heading shadow-md shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-2xl font-normal text-[#FAF4EB]">
                    {user.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] bg-[rgba(229,193,120,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(212,163,89,0.3)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Guest
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#B8A692] flex-wrap">
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#E5C178]" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                  {user.email && !user.email.includes("@guest.flatel.in") && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#E5C178]" />
                      <span>{user.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/#flats"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] via-[#D8AE5E] to-[#C69344] text-[#140E08] text-xs font-bold transition-all shadow-md hover:brightness-105 border-none"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Book New Stay</span>
              </Link>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl text-[#FAF4EB] font-normal">
                Reservation History
              </h2>
              <p className="text-xs text-[#B8A692] mt-0.5">
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
                className="px-3 py-1.5 rounded-lg bg-[#16100B]/90 border border-[rgba(212,163,89,0.25)] text-xs text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178]"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-[rgba(34,24,16,0.8)] hover:bg-[rgba(34,24,16,1)] text-[#E5C178] border border-[rgba(212,163,89,0.3)] transition-colors cursor-pointer"
                title="Lookup reservation code"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Loading State */}
          {loadingBookings && (
            <div className="rounded-2xl border border-[rgba(212,163,89,0.2)] bg-[rgba(34,24,16,0.7)] p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#E5C178] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#B8A692] font-mono">Fetching your reservation records...</p>
            </div>
          )}

          {/* Empty State */}
          {!loadingBookings && bookings.length === 0 && (
            <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(34,24,16,0.75)] backdrop-blur-md p-10 text-center shadow-xl">
              <div className="w-14 h-14 rounded-full bg-[#16100B] border border-[rgba(212,163,89,0.25)] text-[#E5C178] flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-normal text-[#FAF4EB] mb-1">
                No Active Reservations Found
              </h3>
              <p className="text-xs text-[#B8A692] max-w-md mx-auto mb-6 leading-relaxed">
                You do not have any bookings linked directly to your current session. Once you complete a booking on FLATEL, it will automatically appear here.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/#flats"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs transition-all hover:brightness-105 border-none shadow-md"
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
                    className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.8)] backdrop-blur-md p-5 sm:p-6 shadow-xl hover:border-[rgba(212,163,89,0.45)] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(212,163,89,0.18)] pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-[#E5C178]">
                            {b.bookingCode || "FLT-PENDING"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(b.bookingCode || b.id)}
                            className="text-[#B8A692] hover:text-[#FAF4EB] p-1 transition-colors cursor-pointer"
                            title="Copy Booking Reference"
                          >
                            {copiedId === (b.bookingCode || b.id) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-sans font-medium uppercase tracking-[0.12em] px-2.5 py-0.5 rounded-full border ${
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
                        <h3 className="font-heading text-xl font-normal text-[#FAF4EB] mt-1.5 leading-snug">
                          {room ? room.title : `Flatel Unit (${b.unitId})`}
                        </h3>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#B8A692] block">
                          Advance Paid (<span className="font-serif oldstyle-nums">20%</span>)
                        </span>
                        <span className="font-serif oldstyle-nums text-lg font-bold text-[#FAF4EB]">
                          ₹{b.pricing.advancePayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-5">
                      <div className="p-3 rounded-xl bg-[#16100B]/80 border border-[rgba(212,163,89,0.2)]">
                        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] block mb-1">
                          Check-In
                        </span>
                        <div className="flex items-center gap-1.5 font-normal text-[#FAF4EB]">
                          <Calendar className="w-3.5 h-3.5 text-[#E5C178]" />
                          <span className="font-serif oldstyle-nums">{b.checkInDate}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#16100B]/80 border border-[rgba(212,163,89,0.2)]">
                        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] block mb-1">
                          Check-Out
                        </span>
                        <div className="flex items-center gap-1.5 font-normal text-[#FAF4EB]">
                          <Calendar className="w-3.5 h-3.5 text-[#E5C178]" />
                          <span className="font-serif oldstyle-nums">{b.checkOutDate}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#16100B]/80 border border-[rgba(212,163,89,0.2)]">
                        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] block mb-1">
                          Duration & Guests
                        </span>
                        <span className="font-normal text-[#FAF4EB]">
                          <span className="font-serif oldstyle-nums font-semibold">{b.totalNights}</span> Nights • <span className="font-serif oldstyle-nums font-semibold">{b.adultsCount}</span> Adults
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#16100B]/80 border border-[rgba(212,163,89,0.2)]">
                        <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] block mb-1">
                          Balance Due (<span className="font-serif oldstyle-nums">80%</span>)
                        </span>
                        <span className="font-serif oldstyle-nums font-semibold text-[#FAF4EB]">
                          ₹{b.pricing.balanceDueOnArrival.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(212,163,89,0.18)]">
                      <div className="text-[11px] text-[#B8A692]">
                        <span>Reserved under: </span>
                        <span className="text-[#FAF4EB] font-medium">{b.guest.fullName}</span>
                        {b.guest.phone && <span> ({b.guest.phone})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/booking-confirmation/${b.bookingCode || b.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5C178] via-[#D8AE5E] to-[#C69344] text-[#140E08] font-bold text-xs transition-all shadow-md hover:brightness-105 border-none"
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
