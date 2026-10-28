"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { BookingRecord } from "@/types/booking";
import { getRoomById } from "@/lib/mock-rooms";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPrice } from "@/lib/constants";
import {
  CalendarCheck,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Mail,
  Search,
  ExternalLink,
  Copy,
  Check,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function ArabicMyBookingsPage() {
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
        const res = await fetch(`/api/bookings/user?userId=${user.id}`);
        if (!res.ok) throw new Error("Could not load your reservations");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.bookings)) {
          setBookingState({ userId: user.id, bookings: data.bookings });
        }
      } catch (err) {
        console.error("Failed to load user bookings:", err);
      } finally {
        if (isMounted) setLoadingBookings(false);
      }
    };

    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) {
      setLookupError("يرجى إدخال رقم الحجز المرجعي أو رقم الجوال");
      return;
    }
    setLookupError(null);
    router.push(`/ar/booking-confirmation/${encodeURIComponent(lookupCode.trim().toUpperCase())}`);
  };

  const copyBookingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Unauthenticated View
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-background text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic" dir="rtl">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full space-y-6">
            <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.8)] backdrop-blur-md p-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#E5C178]/15 border border-[#E5C178]/30 flex items-center justify-center mx-auto text-[#E5C178] mb-4">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-normal text-[#FAF4EB] mb-2">
                إدارة الحجوزات والإقامات
              </h1>
              <p className="text-xs sm:text-sm text-[#B8A692] mb-6 leading-relaxed">
                سجل الدخول بحسابك لعرض كافة تفاصيل حجوزاتك، الوصول إلى سندات الحجز، والاستفادة من أفضل الأسعار الحصرية.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => openAuthModal("سجل الدخول للوصول إلى حجوزاتك.", undefined, "login")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs transition-all shadow-md cursor-pointer hover:brightness-105 active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("أنشئ حساباً لإدارة إقاماتك.", undefined, "signup")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(212,163,89,0.4)] text-[#E5C178] hover:bg-[rgba(229,193,120,0.08)] font-medium text-xs transition-all cursor-pointer active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إنشاء حساب ضيف جديد</span>
                </button>
              </div>
            </div>

            {/* Alternative: Lookup with Booking Reference Code */}
            <div className="rounded-2xl border border-[rgba(212,163,89,0.2)] bg-[rgba(22,16,11,0.8)] backdrop-blur-md p-6 text-center shadow-xl">
              <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] block mb-1">
                هل لديك رقم حجز مرجعي؟
              </span>
              <p className="text-xs text-[#B8A692] mb-4">
                استعرض سند حجزك مباشرة بإدخال رقم الحجز الخاص بك.
              </p>

              <form onSubmit={handleLookupSubmit} className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#E5C178] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="أدخل رقم الحجز المرجعي"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-[#16100B]/90 border border-[rgba(212,163,89,0.25)] text-sm text-[#FAF4EB] placeholder-[#B8A692]/40 focus:outline-none focus:border-[#E5C178]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs cursor-pointer transition-all hover:brightness-105 border-none shadow-md shrink-0"
                >
                  البحث عن الحجز
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
    <div className="min-h-screen bg-background text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic" dir="rtl">
      <SiteHeader />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Guest Profile Banner */}
          <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.8)] backdrop-blur-md p-6 sm:p-8 shadow-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E5C178] to-[#C69344] text-[#140E08] flex items-center justify-center text-xl font-bold font-heading shadow-md shrink-0">
                {user?.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-2xl font-normal text-[#FAF4EB]">
                    {user?.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178] bg-[rgba(229,193,120,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(212,163,89,0.3)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ضيف معتمد لدى فلاتيل
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#B8A692] flex-wrap">
                  {user?.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-[#E5C178]" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                  {user?.email && !user.email.includes("@guest.flatel.in") && (
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
                href="/ar/properties"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs shadow-md inline-flex items-center gap-1.5 hover:brightness-105 transition-all"
              >
                <span>حجز إقامة جديدة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl text-[#FAF4EB] font-medium">
              سجل الحجوزات الخاصة بك
            </h2>

            {loadingBookings ? (
              <p className="text-sm text-[#B8A692] py-8 text-center">جاري تحميل الحجوزات...</p>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-[rgba(212,163,89,0.2)] bg-[#16100B] p-8 text-center space-y-3">
                <Calendar className="w-10 h-10 text-[#E5C178]/50 mx-auto" />
                <h3 className="font-heading text-lg font-medium text-[#FAF4EB]">لا توجد حجوزات نشطة حالياً</h3>
                <p className="text-xs text-[#B8A692]">
                  لم يتم العثور على أي حجز مسجل تحت رقم حسابك. يمكنك استعراض شققنا المتاحة وحجز إقامتك الآن.
                </p>
                <div className="pt-2">
                  <Link
                    href="/ar/properties"
                    className="inline-flex items-center gap-1.5 text-xs text-[#E5C178] font-bold hover:underline"
                  >
                    <span>استكشف الشقق المتاحة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const rawRoom = getRoomById(booking.unitId);
                  const room = rawRoom ? getLocalizedRoom(rawRoom, "ar") : null;
                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[#16100B] p-5 sm:p-6 space-y-4 shadow-lg hover:border-[#E5C178]/60 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(212,163,89,0.18)] pb-3">
                        <div>
                          <span className="text-xs text-[#E5C178] font-bold uppercase tracking-wider block">
                            رقم الحجز المرجعي: #{booking.bookingCode || booking.id.slice(0, 8)}
                          </span>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FAF4EB] mt-0.5">
                            {room?.title || booking.unitId}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            حجز مؤكد بالعربون
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#FAF4EB]">
                        <div>
                          <span className="text-[#B8A692] block mb-0.5">تاريخ الدخول</span>
                          <span className="font-semibold">{booking.checkInDate}</span>
                        </div>
                        <div>
                          <span className="text-[#B8A692] block mb-0.5">تاريخ الخروج</span>
                          <span className="font-semibold">{booking.checkOutDate}</span>
                        </div>
                        <div>
                          <span className="text-[#B8A692] block mb-0.5">العربون المدفوع (٢٠٪)</span>
                          <span className="font-semibold text-[#E5C178]">{formatPrice(booking.pricing?.advancePayable || 0)}</span>
                        </div>
                        <div>
                          <span className="text-[#B8A692] block mb-0.5">المتبقي عند الدخول (٨٠٪)</span>
                          <span className="font-semibold">{formatPrice(booking.pricing?.balanceDueOnArrival || 0)}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(212,163,89,0.12)]">
                        <button
                          type="button"
                          onClick={() => copyBookingId(booking.id)}
                          className="text-xs text-[#B8A692] hover:text-[#FAF4EB] flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === booking.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === booking.id ? "تم النسخ بنجاح" : "نسخ رقم الحجز"}</span>
                        </button>

                        <a
                          href={`/api/bookings/${booking.id}/voucher?lang=ar`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl border border-[rgba(212,163,89,0.4)] text-[#E5C178] hover:bg-[rgba(229,193,120,0.1)] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>تحميل سند الحجز (PDF)</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
