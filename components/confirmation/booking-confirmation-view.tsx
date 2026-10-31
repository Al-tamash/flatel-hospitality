"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  MapPin,
  ExternalLink,
  MessageSquare,
  Users,
  CreditCard,
  Building,
  Clock,
  ShieldCheck,
  Phone,
  Home,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { BookingRecord } from "@/types/booking";
import { getRoomById } from "@/lib/mock-rooms";
import { getBranchBySlug, CONTACT_PHONE } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { SuccessMark } from "@/components/motion/success-mark";
import { cn } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import { ARABIC_ADDONS_TRANSLATION } from "@/components/rooms/booking-sidebar";

interface BookingConfirmationViewProps {
  bookingId: string;
  locale?: Locale;
}

export function BookingConfirmationView({ bookingId, locale = "en" }: BookingConfirmationViewProps) {
  const dict = getDictionary(locale);
  const [loadedBooking, setBooking] = React.useState<BookingRecord | null>(null);
  const [group, setGroup] = React.useState<BookingRecord[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);

  React.useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Booking record not found.");
        }
        setBooking(data.booking);
        setGroup(Array.isArray(data.group) && data.group.length > 1 ? data.group : null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load booking details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  // A multi-flat booking is shown as one: money and guests are summed across its flats
  const booking = React.useMemo(() => {
    if (!loadedBooking || !group) return loadedBooking;
    const sum = (pick: (b: BookingRecord) => number) => group.reduce((total, b) => total + pick(b), 0);
    return {
      ...loadedBooking,
      adultsCount: sum((b) => b.adultsCount),
      kidsCount: sum((b) => b.kidsCount),
      extraGuestsCount: sum((b) => b.extraGuestsCount),
      pricing: {
        ...loadedBooking.pricing,
        standardBaseRent: sum((b) => b.pricing.standardBaseRent),
        baseRentDiscount: sum((b) => b.pricing.baseRentDiscount),
        baseRent: sum((b) => b.pricing.baseRent),
        extraGuestsTotal: sum((b) => b.pricing.extraGuestsTotal),
        addonsTotal: sum((b) => b.pricing.addonsTotal),
        grossTotal: sum((b) => b.pricing.grossTotal),
        flatAdvance: sum((b) => b.pricing.flatAdvance),
        servicesPrepaid: sum((b) => b.pricing.servicesPrepaid),
        advancePayable: sum((b) => b.pricing.advancePayable),
        balanceDueOnArrival: sum((b) => b.pricing.balanceDueOnArrival),
      },
    };
  }, [loadedBooking, group]);

  const handleDownloadPdf = async () => {
    if (!booking) return;
    setIsDownloadingPdf(true);
    try {
      const response = await fetch(`/api/bookings/${booking.bookingCode}/voucher?lang=${locale}`);
      if (!response.ok) {
        throw new Error("Failed to download PDF voucher.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FLATEL-VOUCHER-${booking.bookingCode}${locale === "ar" ? "-AR" : ""}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert(locale === "ar" ? "حدث خطأ أثناء تحميل قسيمة PDF. يرجى المحاولة مرة أخرى." : "Error generating PDF voucher. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("mx-auto max-w-4xl px-4 py-24 text-center text-fg", locale === "ar" && "font-arabic")} dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="font-heading text-fg heading-sub">
          {locale === "ar" ? "جاري استرجاع تأكيد الحجز..." : "Retrieving Booking Confirmation..."}
        </h2>
        <p className="mt-2 text-xs text-fg-muted">
          {locale === "ar" ? "التحقق من بيانات الاعتماد الرقمية للحجز." : "Validating digital reservation credentials."}
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={cn("mx-auto max-w-2xl px-4 py-20 text-center text-fg", locale === "ar" && "font-arabic")} dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="font-heading heading-page">
          {locale === "ar" ? "لم يتم العثور على سجل الحجز" : "Booking Record Not Found"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-fg-muted max-w-md mx-auto">
          {locale === "ar"
            ? `تعذر العثور على حجز يطابق الرمز "${bookingId}". يرجى التأكد من رقم المرجع أو الاتصال بخدمة العملاء.`
            : `We could not locate a booking matching code “${bookingId}”. Please verify your booking reference or contact our front desk hotline.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={locale === "ar" ? "/ar" : "/"}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-line bg-surface hover:bg-raised text-fg text-xs h-10 px-4 rounded-xl"
            )}
          >
            <Home className="w-4 h-4 mr-2 text-gold" />
            <span>{locale === "ar" ? "العودة للرئيسية" : "Return to Homepage"}</span>
          </Link>
          <a
            href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-xs h-10 px-4 rounded-xl border-none shadow-md"
            )}
          >
            <Phone className="w-4 h-4 mr-2" />
            <span>{locale === "ar" ? "هاتف الاستقبال المباشر" : "Front Desk Hotline"}</span>
          </a>
        </div>
      </div>
    );
  }

  const rawRoom = getRoomById(booking.unitId);
  const room = rawRoom ? getLocalizedRoom(rawRoom, locale) : undefined;
  const branch = rawRoom?.branchSlug ? getBranchBySlug(rawRoom.branchSlug) : undefined;
  const branchName = branch
    ? (locale === "ar" ? (branch.name === "Barkas Salala" ? "باركاس سلالة" : "مغل بورا") : branch.name)
    : (locale === "ar" ? "حيدر أباد" : "Hyderabad");
  const branchAddress = branch
    ? (locale === "ar" ? (branch.slug === "barkas-salala" ? "باركاس سلالة، قرب مطار راجيف غاندي الدولي، حيدر أباد" : "مغل بورا، قرب مستشفى برنس ومستشفيات البلدة القديمة، حيدر أباد") : branch.address)
    : "Barkas Salala / Moghal Pura, Hyderabad, Telangana";
  const googleMapsUrl = branch?.googleMapsUrl;

  // WhatsApp Concierge message string
  const cleanPhone = booking.guest.phone.replace(/[^0-9]/g, "");
  const whatsappSummaryMessage = locale === "ar"
    ? `مرحباً ${booking.guest.fullName}، إليك تأكيد حجز إقامتك في ضيافة فلاتيل ${room ? room.title : booking.unitId} (مرجع الحجز: ${booking.bookingCode}) من ${booking.checkInDate} إلى ${booking.checkOutDate} (${booking.totalNights} ليال). العربون ٢٠٪ تم سداده بقيمة ₹${booking.pricing.advancePayable.toLocaleString("en-IN")}. المتبقي ₹${booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")} عند الوصول. رابط القسيمة: ${typeof window !== "undefined" ? window.location.href : ""}`
    : `Hello ${booking.guest.fullName}, here is your FLATEL Hospitality booking confirmation for ${room ? room.title : booking.unitId} (Booking ID: ${booking.bookingCode}) from ${booking.checkInDate} to ${booking.checkOutDate} (${booking.totalNights} nights). 20% advance of ₹${booking.pricing.advancePayable.toLocaleString("en-IN")} is paid. Remaining balance ₹${booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")} is due on arrival. View voucher: ${typeof window !== "undefined" ? window.location.href : ""}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappSummaryMessage)}`;

  return (
    <div className={cn("w-full min-h-screen bg-background text-fg pb-24 selection:bg-gold/20 selection:text-gold", locale === "ar" && "font-arabic")} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container-page pt-8 sm:pt-12">
        {/* Top Success Banner */}
        <div className="rounded-3xl border border-line bg-raised/85 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-line-soft">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-line-strong text-gold flex items-center justify-center shrink-0 shadow-lg">
                <SuccessMark className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gold/10 border border-line text-xs font-sans font-medium text-gold uppercase tracking-[0.18em] mb-1.5">
                  {locale === "ar" ? "تم تأكيد الحجز الفندقي" : "RESERVATION CONFIRMED"}
                </div>
                <h1 className="font-heading text-fg heading-page">
                  {locale === "ar" ? `شكراً لك، ${booking.guest.fullName}!` : `Thank You, ${booking.guest.fullName}!`}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-fg-muted">
                  {locale === "ar"
                    ? <>تم تأمين حجزك في ضيافة فلاتيل. تم التحقق من سداد عربون <span className="font-serif oldstyle-nums text-gold">٢٠٪</span> بنجاح.</>
                    : <>Your booking at Flatel Hospitality is secured. A <span className="font-serif oldstyle-nums text-gold">20%</span> advance has been verified.</>}
                </p>
              </div>
            </div>

            {/* Booking Code Card */}
            <div className="sm:text-right shrink-0 p-3 sm:p-0 rounded-xl bg-surface/80 sm:bg-transparent border sm:border-0 border-line-soft">
              <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-fg-muted block font-mono">
                {dict.confirmation.bookingReference}
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-gold">
                {booking.bookingCode}
              </span>
              <span className="block text-xs text-fg-muted mt-0.5">
                {locale === "ar" ? "الحالة: " : "Status: "}
                <strong className="text-emerald-400 uppercase">
                  {locale === "ar" && booking.bookingStatus === "confirmed" ? "مؤكد" : booking.bookingStatus}
                </strong>
              </span>
            </div>
          </div>

          {/* Action Buttons: PDF Download, Google Maps, WhatsApp */}
          <div className="pt-6 flex flex-wrap items-center gap-3">
            {/* Download PDF Voucher */}
            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-gradient-to-r from-gold via-gold to-gold-deep text-ink font-bold text-xs sm:text-sm h-11 px-5 rounded-xl gap-2 shadow-xl shadow-gold/18 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer border-none"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingPdf ? (locale === "ar" ? "جاري إنشاء القسيمة..." : "Generating PDF...") : dict.confirmation.downloadVoucher}</span>
            </Button>

            {/* Open Google Maps */}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-line bg-surface hover:bg-raised text-fg hover:border-gold/60 text-xs sm:text-sm h-11 px-4 rounded-xl gap-2 transition-all"
                )}
              >
                <MapPin className="w-4 h-4 text-gold" />
                <span>{dict.confirmation.openGoogleMaps}</span>
                <ExternalLink className="w-3.5 h-3.5 text-fg-muted" />
              </a>
            )}

            {/* WhatsApp Confirmation Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-line bg-surface hover:bg-raised text-fg hover:border-gold/60 text-xs sm:text-sm h-11 px-4 rounded-xl gap-2 transition-all"
              )}
            >
              <MessageSquare className="w-4 h-4 text-gold" />
              <span>{dict.confirmation.sendToWhatsapp}</span>
            </a>
          </div>

          {/* WhatsApp Delivery Status Notice */}
          <div className="mt-4 pt-4 border-t border-line-soft text-sm leading-relaxed text-fg-muted flex items-start gap-2.5">
            <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              {booking.notificationStatus === "sent" ? (
                <span className="text-emerald-400 font-medium">
                  {locale === "ar"
                    ? `تم تسليم قسيمة الحجز الفوري تلقائياً عبر واتساب إلى ${booking.guest.phone}.`
                    : `Automated WhatsApp confirmation voucher was delivered to ${booking.guest.phone}.`}
                </span>
              ) : (
                <span>
                  <strong className="text-fg">{locale === "ar" ? "سند الحجز الرقمي:" : "Digital Voucher:"}</strong>{" "}
                  {locale === "ar"
                    ? `تم تأكيد حجزك في نظامنا. اضغط على زر "${dict.confirmation.sendToWhatsapp}" أعلاه لحفظ قسيمة الحجز وبيانات الفرع مباشرة في تطبيق واتساب.`
                    : <>Your reservation is confirmed in our system. Tap the <strong className="text-gold">&ldquo;Send to WhatsApp&rdquo;</strong> button above to save your booking voucher and front desk details directly to your mobile chat.</>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Details Breakdown */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Property, Stay Schedule, House Rules */}
          <div className="lg:col-span-7 space-y-6">
            {/* Reserved Property Summary */}
            <div className="rounded-2xl border border-line bg-raised/75 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl">
              <h2 className="font-heading text-fg border-b border-line-soft pb-3 heading-sub">
                {dict.confirmation.reservedResidence}
              </h2>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-gold px-2.5 py-0.5 rounded-full bg-gold/10 border border-line">
                    {group ? (locale === "ar" ? "حجز مشترك" : "Combined booking") : room ? room.type : (locale === "ar" ? "شقة فندقية" : "Residence")}
                  </span>
                  <span className="text-sm text-gold/90 font-medium">
                    {locale === "ar" ? `فرع ${branchName}` : `${branchName} Branch`}
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-normal text-fg mt-1.5 leading-snug">
                  {group
                    ? (locale === "ar" ? `${group.length} شقق في حجز واحد` : `${group.length} flats booked together`)
                    : room ? room.title : booking.unitId.toUpperCase()}
                </h3>
                <p className="text-sm text-fg-muted flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span>{branchAddress}</span>
                </p>
                {group && (
                  <ul className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
                    {group.map((flat) => {
                      const flatRoom = getRoomById(flat.unitId);
                      return (
                        <li key={flat.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                          <span>
                            <span className="font-medium text-fg">{flatRoom ? flatRoom.type : flat.unitId.toUpperCase()}</span>
                            <span className="block text-xs text-fg-muted">
                              {locale === "ar"
                                ? `${flat.adultsCount} بالغين${flat.kidsCount > 0 ? ` · ${flat.kidsCount} أطفال` : ""}`
                                : `${flat.adultsCount} adults${flat.kidsCount > 0 ? ` · ${flat.kidsCount} kids` : ""}`}
                              {" · "}
                              <span className="font-mono">{flat.bookingCode}</span>
                            </span>
                          </span>
                          <span className="font-serif oldstyle-nums text-fg">₹{flat.pricing.grossTotal.toLocaleString("en-IN")}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Housekeeping Badge */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gold/8 border border-line text-gold text-sm font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {locale === "ar"
                    ? "خدمة تنظيف دورية مجانية مقدمة يوماً بعد يوم"
                    : "Complimentary Housekeeping Provided on Alternate Days"}
                </span>
              </div>

              {/* Stay Schedule Box */}
              <div className="rounded-xl bg-surface/80 border border-line-soft p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-[0.14em] font-medium text-gold block">
                    {locale === "ar" ? "تسجيل الوصول (١١ ص - ١ ظ)" : "Check-In (11 AM–1 PM)"}
                  </span>
                  <span className="font-serif oldstyle-nums text-base font-normal text-fg mt-1 block">
                    {booking.checkInDate}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {locale === "ar" ? "الفترة: ١١:٠٠ صباحاً – ١:٠٠ ظهراً" : "Window: 11:00 AM – 1:00 PM"}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.14em] font-medium text-gold block">
                    {locale === "ar" ? "تسجيل المغادرة (١١ صباحاً)" : "Check-Out (11 AM)"}
                  </span>
                  <span className="font-serif oldstyle-nums text-base font-normal text-fg mt-1 block">
                    {booking.checkOutDate}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {locale === "ar" ? "الموعد القياسي: ١١:٠٠ صباحاً" : "Standard time: 11:00 AM"}
                  </span>
                </div>
              </div>

              {/* Occupancy, Duration & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1 border-t border-line-soft mt-2">
                <div className="flex items-center gap-2 text-fg-muted">
                  <Users className="w-4 h-4 text-gold" />
                  <span>
                    <span className="font-serif oldstyle-nums font-semibold text-fg">{booking.adultsCount}</span> {locale === "ar" ? "بالغين" : "Adults"} {booking.kidsCount > 0 ? (locale === "ar" ? `· ${booking.kidsCount} أطفال` : `· ${booking.kidsCount} Kids`) : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-fg-muted">
                  <Clock className="w-4 h-4 text-gold" />
                  <span>
                    <span className="font-serif oldstyle-nums font-semibold text-fg">{booking.totalNights}</span> {locale === "ar" ? "ليال إقامة" : "Nights Duration"}
                  </span>
                </div>
                <div className="flex min-w-0 items-start gap-2 text-fg-muted">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span className="min-w-0 whitespace-normal leading-snug">
                    {locale === "ar"
                      ? (booking.stayPurpose === "medical"
                        ? "إقامة علاجية (قرب المستشفيات)"
                        : booking.stayPurpose === "wedding"
                        ? "إقامة مناسبات وأعراس"
                        : booking.stayPurpose === "family"
                        ? "إجازة عائلية"
                        : booking.stayPurpose === "tourism"
                        ? "سياحة واستكشاف"
                        : booking.stayPurpose === "corporate"
                        ? "إقامة عمل وشركات"
                        : "إقامة عادية")
                      : (booking.stayPurpose === "accommodation_only"
                        ? "Standard Accommodation"
                        : booking.stayPurpose === "medical"
                        ? "Medistay (Medical)"
                        : booking.stayPurpose === "wedding"
                        ? "Wedding Stay"
                        : booking.stayPurpose === "family"
                        ? "Family Vacation"
                        : booking.stayPurpose === "tourism"
                        ? "Wanderer (Tourism)"
                        : "Corporate Stay")}
                  </span>
                </div>
              </div>

              {/* Selected Services Pill List if any */}
              {booking.selectedAddons && booking.selectedAddons.length > 0 && (
                <div className="pt-2 border-t border-line-soft">
                  <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-fg-muted block mb-1.5">
                    {locale === "ar" ? `الخدمات المختارة المشمولة (${booking.selectedAddons.length})` : `Included Selected Services (${booking.selectedAddons.length})`}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.selectedAddons.map((addon) => {
                      const displayName = (locale === "ar" && addon.id && ARABIC_ADDONS_TRANSLATION[addon.id]) || addon.name;
                      return (
                        <span
                          key={addon.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-line-soft text-xs text-fg"
                        >
                          <CheckCircle2 className="w-3 h-3 text-gold" />
                          <span>{displayName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Guidelines & ID Requirements */}
            <div className="rounded-2xl border border-line bg-raised/75 backdrop-blur-md p-5 sm:p-6 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-sans font-medium uppercase tracking-[0.18em] text-gold">
                <ShieldCheck className="w-4 h-4" />
                <span>{locale === "ar" ? "إرشادات النزلاء وسياسة الوصول" : "Guest Guidelines & Arrival Policy"}</span>
              </div>
              <ul className="space-y-2 text-sm text-fg-muted leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-fg">{locale === "ar" ? "إثبات الهوية الإلزامي:" : "Mandatory Photo ID:"}</strong>{" "}
                  {locale === "ar"
                    ? "يجب على النزلاء المحليين تقديم إثبات هوية رسمي أصلي صادر عن الحكومة لكل بالغ (Aadhaar / رخصة قيادة / بطاقة ناخب). النزلاء القادمون من خارج الهند مطالبون بتقديم جواز سفر أصلي ساري المفعول وتأشيرة دخول صالحة."
                    : "Domestic guests must present an original government-issued photo ID for each adult (Aadhaar / Driving License / Voter ID). International guests must present an original physical passport and valid official visa."}
                </li>
                <li>
                  <strong className="text-fg">{locale === "ar" ? "مواعيد الدخول والخروج:" : "Check-in Timing:"}</strong>{" "}
                  {locale === "ar"
                    ? "تسجيل الوصول القياسي من الساعة ١١:٠٠ صباحاً حتى ١:٠٠ ظهراً. تسجيل المغادرة الساعة ١١:٠٠ صباحاً."
                    : "Standard check-in is from 11:00 AM to 1:00 PM. Check-out is at 11:00 AM."}
                </li>
                <li>
                  <strong className="text-fg">{locale === "ar" ? "إقامة الأطفال:" : "Children:"}</strong>{" "}
                  {locale === "ar"
                    ? "تشمل كل شقة عدداً من الأطفال ضمن السعر الأساسي، ويُحتسب على كل طفل إضافي ٣٠٠ روبية في الليلة."
                    : "Each flat includes children up to its base allowance; additional children are ₹300 per child per night. All guests count toward safety capacity."}
                </li>
                <li>
                  <strong className="text-fg">{locale === "ar" ? "سياسة الإلغاء:" : "Cancellation Policy:"}</strong>{" "}
                  {locale === "ar"
                    ? "العربون المالي (٢٠٪) مسترد بالكامل في حال الإلغاء قبل ٤٨ ساعة على الأقل من موعد تسجيل الوصول. بعد ذلك يعتبر غير مسترد. الخدمات الإضافية غير قابلة للاسترداد."
                    : "The 20% advance booking deposit is fully refundable if cancellation occurs at least 48 hours prior to check-in. Non-refundable within 48 hours. Additional services are non-refundable."}
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Breakdown & Balance Due */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-line bg-raised/80 backdrop-blur-md p-5 sm:p-6 space-y-5 shadow-2xl">
              <h2 className="font-heading text-fg border-b border-line-soft pb-3 heading-sub">
                {dict.confirmation.paymentBreakdown}
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4 text-fg-muted">
                  <span>
                    {locale === "ar"
                      ? `قيمة الإقامة (${booking.totalNights} ليال)`
                      : group
                      ? `Base Rent (${booking.totalNights}N · ${group.length} flats)`
                      : `Base Rent (${booking.totalNights}N @ ₹${rawRoom?.basePricePerNight.toLocaleString("en-IN")})`}
                  </span>
                  <span className="text-fg font-serif oldstyle-nums">
                    ₹{booking.pricing.standardBaseRent.toLocaleString("en-IN")}
                  </span>
                </div>

                {booking.pricing.baseRentDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-gold">
                    <span>{locale === "ar" ? `خصم المدة (${Math.round(booking.pricing.discountRate * 100)}%)` : `Duration Discount (${Math.round(booking.pricing.discountRate * 100)}%)`}</span>
                    <span className="font-serif oldstyle-nums">
                      -₹{booking.pricing.baseRentDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {booking.pricing.extraGuestsTotal > 0 && (
                  <div className="flex justify-between gap-4 text-fg-muted">
                    <span>
                      {locale === "ar"
                        ? "رسوم النزلاء الإضافيين (بالغون وأطفال)"
                        : "Extra Guest Charges (adults & children)"}
                    </span>
                    <span className="text-fg font-serif oldstyle-nums">
                      ₹{booking.pricing.extraGuestsTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {booking.pricing.addonsTotal > 0 && (
                  <div className="flex justify-between gap-4 text-fg-muted">
                    <span>{locale === "ar" ? "الخدمات الإضافية المختارة" : "Selected Paid Add-ons"}</span>
                    <span className="text-fg font-serif oldstyle-nums">
                      ₹{booking.pricing.addonsTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-line-soft flex justify-between items-baseline font-semibold text-sm text-fg">
                  <span>{locale === "ar" ? "الإجمالي الكلي" : "Gross Total"}</span>
                  <span className="font-serif oldstyle-nums text-2xl font-bold text-gold">
                    ₹{booking.pricing.grossTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* 20% Advance Online Deposit: Verified & Paid */}
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                    <span>{dict.confirmation.advancePaid}</span>
                  </div>
                  <span className="font-serif oldstyle-nums text-lg font-bold text-fg">
                    ₹{booking.pricing.advancePayable.toLocaleString("en-IN")}
                  </span>
                </div>
                {booking.pricing.servicesPrepaid > 0 && (
                  <div className="text-xs text-emerald-300/80 flex items-center justify-between gap-3 pt-1 border-t border-emerald-500/20">
                    <span>
                      {locale === "ar"
                        ? `عربون الإقامة ₹${booking.pricing.flatAdvance.toLocaleString("en-IN")} + الخدمات ₹${booking.pricing.servicesPrepaid.toLocaleString("en-IN")} (مدفوعة بالكامل)`
                        : `Stay advance ₹${booking.pricing.flatAdvance.toLocaleString("en-IN")} + services ₹${booking.pricing.servicesPrepaid.toLocaleString("en-IN")} (paid in full)`}
                    </span>
                  </div>
                )}
                <div className="text-xs text-emerald-300/80 flex items-center justify-between gap-3 pt-1 border-t border-emerald-500/20">
                  <span>{locale === "ar" ? "مرجع إيصال الدفع:" : "Receipt Ref:"}</span>
                  <span className="font-mono text-emerald-300">{booking.gatewayPaymentId || "DIRECT-GATEWAY-TXN"}</span>
                </div>
              </div>

              {/* 80% Remaining Balance Due at Property */}
              <div className="rounded-xl border border-line bg-gradient-to-br from-gold/12 to-raised/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-gold">
                    <Building className="w-3.5 h-3.5" />
                    <span>{dict.confirmation.balanceDue}</span>
                  </div>
                  <span className="font-serif oldstyle-nums text-lg font-bold text-fg">
                    ₹{booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-sm text-fg-muted leading-relaxed pt-1 border-t border-line-soft">
                  {locale === "ar" ? "يسدد عند تسجيل الوصول لدى مكتب الاستقبال نقداً أو عبر UPI." : "Payable upon check-in at front desk by Cash or UPI."}
                </p>
              </div>

              {/* Front Desk Hotline */}
              <div className="pt-2 text-center text-sm text-fg-muted">
                <p>{locale === "ar" ? "هل تحتاج لمساعدة أو طلب تسجيل وصول مبكر؟" : "Need assistance or early arrival request?"}</p>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
                  className="font-medium text-gold hover:text-fg transition-colors mt-1 inline-block"
                >
                  {locale === "ar" ? `اتصل بنا: ${CONTACT_PHONE}` : `Call ${CONTACT_PHONE}`}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
