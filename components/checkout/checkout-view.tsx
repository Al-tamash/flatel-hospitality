"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getRoomById, ALL_MASTER_ADDONS, type RoomDetail } from "@/lib/mock-rooms";
import { getBranchBySlug, BRAND_NAME } from "@/lib/constants";
import { calculateFlatelPrice, type FareCalculationResult } from "@/lib/pricing";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import { ARABIC_ADDONS_TRANSLATION } from "@/components/rooms/booking-sidebar";
import { ARABIC_BRANCH_OVERLAYS } from "@/components/branch-hub";
import {
  loadRazorpayScript,
  type RazorpayCheckoutOptions,
  type RazorpaySuccessResponse,
  type RazorpayFailureResponse,
} from "@/lib/razorpay/load-script";
import { MEMBER_ID_STORAGE_KEY } from "@/components/membership/join-form";
import { GroupCheckoutView } from "@/components/checkout/group-checkout-view";
import { isGroupCart, parseCart } from "@/lib/booking/cart";
import { BRAND_HEX } from "@/lib/design-tokens";

const EMPTY_FARE: FareCalculationResult = {
  nights: 0,
  standardBaseRent: 0,
  discountRate: 0,
  discountSource: null,
  baseRentDiscount: 0,
  baseRent: 0,
  extraAdults: 0,
  extraGuestsTotal: 0,
  addonsTotal: 0,
  grossTotal: 0,
  flatAdvance: 0,
  servicesPrepaid: 0,
  advancePayable: 0,
  balanceDueOnArrival: 0,
};

type CheckoutDraft = {
  fullName?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  isInternational?: boolean;
  agreeTerms?: boolean;
};

const formatMoney = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatStayDate = (date: string, loc: Locale = "en") => {
  if (!date) return loc === "ar" ? "اختر التاريخ" : "Select date";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return loc === "ar" ? "اختر التاريخ" : "Select date";
  return new Intl.DateTimeFormat(loc === "ar" ? "ar-EG" : "en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
};

function getNights(checkIn: string, checkOut: string) {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 86_400_000);
}

interface CheckoutViewProps {
  locale?: Locale;
}

function SingleCheckoutView({ locale = "en" }: CheckoutViewProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();
  const basePath = locale === "ar" ? "/ar" : "";

  const propertySlug = searchParams.get("property") || searchParams.get("roomId") || "";
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const adultsParam = Number.parseInt(searchParams.get("adults") || "2", 10);
  const kidsParam = Number.parseInt(searchParams.get("kids") || searchParams.get("children") || "0", 10);
  const rawPurpose = searchParams.get("purpose");
  const purposeParam:
    | "medical"
    | "wedding"
    | "tourism"
    | "corporate"
    | "family"
    | "accommodation_only" =
    rawPurpose && ["medical", "wedding", "tourism", "corporate", "family"].includes(rawPurpose)
      ? (rawPurpose as "medical" | "wedding" | "tourism" | "corporate" | "family")
      : "accommodation_only";
  const addonsParam = searchParams.get("addons") || "";
  const nights = getNights(checkInParam, checkOutParam);
  const areDatesValid = nights > 0;

  const [room, setRoom] = React.useState<RoomDetail | null>(() =>
    propertySlug ? getRoomById(propertySlug) || null : null
  );

  React.useEffect(() => {
    let isMounted = true;
    if (!propertySlug) return;
    fetch("/api/inventory")
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !data.success || !Array.isArray(data.units)) return;
        const clean = propertySlug.trim().toLowerCase();
        const found = data.units.find(
          (unit: RoomDetail) =>
            unit.slug.toLowerCase() === clean ||
            unit.id.toLowerCase() === clean ||
            unit.aliases?.some((alias: string) => alias.toLowerCase() === clean)
        );
        if (found) setRoom(found);
      })
      .catch((error) => console.warn("Failed to refresh live unit inventory:", error));
    return () => {
      isMounted = false;
    };
  }, [propertySlug]);

  const branch = room?.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
  const [activeAddonIds, setActiveAddonIds] = React.useState<string[]>(() =>
    addonsParam ? addonsParam.split(",").filter(Boolean) : []
  );

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [specialRequests, setSpecialRequests] = React.useState("");
  const [isInternational, setIsInternational] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [formRestored, setFormRestored] = React.useState(false);
  const [memberCode, setMemberCode] = React.useState("");
  const [memberCheck, setMemberCheck] = React.useState<{ status: "idle" | "checking" | "error"; message?: string }>({ status: "idle" });
  const [appliedMember, setAppliedMember] = React.useState<{ code: string; name: string; percent: number; email: string; phone: string } | null>(null);
  const draftRef = React.useRef<CheckoutDraft>({});
  const formStorageKey = `flatel-checkout:guest-details:${propertySlug || "missing-property"}`;

  const persistDraft = React.useCallback((patch: Partial<CheckoutDraft>) => {
    draftRef.current = { ...draftRef.current, ...patch };
    try {
      sessionStorage.setItem(formStorageKey, JSON.stringify(draftRef.current));
    } catch {
      // Checkout remains usable if session storage is unavailable.
    }
  }, [formStorageKey]);

  React.useEffect(() => {
    const restoredForm: CheckoutDraft | null = (() => {
      try {
        const saved = sessionStorage.getItem(formStorageKey);
        return saved ? (JSON.parse(saved) as CheckoutDraft) : null;
      } catch {
        // Ignore unavailable or malformed tab-local form state.
        return null;
      }
    })();
    const timer = window.setTimeout(() => {
      if (restoredForm) {
        draftRef.current = restoredForm;
        setFullName(restoredForm.fullName || "");
        setEmail(restoredForm.email || "");
        setPhone(restoredForm.phone || "");
        setSpecialRequests(restoredForm.specialRequests || "");
        setIsInternational(Boolean(restoredForm.isInternational));
        setAgreeTerms(Boolean(restoredForm.agreeTerms));
      }
      setFormRestored(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [formStorageKey]);

  // A member who just joined has their ID saved on this device: offer it here.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(MEMBER_ID_STORAGE_KEY);
        if (saved) setMemberCode(saved);
      } catch {
        // Storage unavailable; the guest can type the ID.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!formRestored || !user) return;
    const timer = window.setTimeout(() => {
      if (!fullName && user.fullName) {
        setFullName(user.fullName);
        persistDraft({ fullName: user.fullName });
      }
      if (!email && user.email && !user.email.includes("@guest.flatel.in")) {
        setEmail(user.email);
        persistDraft({ email: user.email });
      }
      if (!phone && user.phone) {
        setPhone(user.phone);
        persistDraft({ phone: user.phone });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [formRestored, user, fullName, email, phone, persistDraft]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const editUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (checkInParam) params.set("checkIn", checkInParam);
    if (checkOutParam) params.set("checkOut", checkOutParam);
    params.set("adults", String(adultsParam));
    if (kidsParam > 0) params.set("kids", String(kidsParam));
    if (purposeParam !== "accommodation_only") params.set("purpose", purposeParam);
    if (activeAddonIds.length) params.set("addons", activeAddonIds.join(","));
    return `${basePath}/properties/${room?.slug || propertySlug}?${params.toString()}`;
  }, [basePath, checkInParam, checkOutParam, adultsParam, kidsParam, purposeParam, activeAddonIds, room?.slug, propertySlug]);

  const selectedAddonList = React.useMemo(
    () =>
      activeAddonIds.flatMap((id) => {
        const addon = ALL_MASTER_ADDONS.find((item) => item.id === id);
        return addon && typeof addon.price === "number"
          ? [{
              id: addon.id,
              name: addon.name,
              price: addon.price,
              pricingType: addon.pricingType === "per_night" ? ("per_night" as const) : ("per_booking" as const),
            }]
          : [];
      }),
    [activeAddonIds]
  );

  // The member rate only holds for the exact contact details it was verified against.
  const activeMember =
    appliedMember && appliedMember.email === email.trim().toLowerCase() && appliedMember.phone === phone.trim() ? appliedMember : null;

  const fareResult = React.useMemo(() => {
    if (!room || !areDatesValid || adultsParam < 1 || kidsParam < 0) return EMPTY_FARE;
    try {
      return calculateFlatelPrice({
        nights,
        basePricePerNight: room.basePricePerNight,
        baseAdults: room.baseAdults,
        selectedAdults: adultsParam,
        selectedKids: kidsParam,
        extraPersonFee: room.extraPersonFeePerNight,
        selectedPaidAddons: selectedAddonList.filter((addon) => addon.price > 0),
        memberDiscountRate: activeMember ? activeMember.percent / 100 : undefined,
      });
    } catch {
      return EMPTY_FARE;
    }
  }, [room, areDatesValid, nights, adultsParam, kidsParam, selectedAddonList, activeMember]);

  const handleApplyMember = async () => {
    const code = memberCode.trim();
    if (!code || memberCheck.status === "checking") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || phone.replace(/\D/g, "").length < 8) {
      setMemberCheck({
        status: "error",
        message: locale === "ar" ? "أدخل بريدك الإلكتروني ورقم جوالك أولاً للتحقق من العضوية." : "Enter your email and mobile number first so we can match your membership.",
      });
      return;
    }
    setMemberCheck({ status: "checking" });
    try {
      const response = await fetch("/api/membership/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email, phone, stayStart: checkInParam }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        setAppliedMember(null);
        setMemberCheck({
          status: "error",
          message: locale === "ar" ? "رقم العضوية غير صالح لهذا البريد أو الجوال." : "That Member ID is not valid for this email or mobile number.",
        });
        return;
      }
      setAppliedMember({ code: code.toUpperCase().replace(/\s+/g, ""), name: data.memberName, percent: data.discountPercent, email: email.trim().toLowerCase(), phone: phone.trim() });
      setMemberCheck({ status: "idle" });
    } catch {
      setMemberCheck({ status: "error", message: locale === "ar" ? "تعذر التحقق الآن. حاول مرة أخرى." : "We could not check the Member ID right now. Please try again." });
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      nextErrors.fullName = locale === "ar" ? "يرجى إدخال الاسم الكامل (٣ أحرف على الأقل)." : "Enter your full name (at least 3 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = locale === "ar" ? "يرجى إدخال بريد إلكتروني صحيح." : "Enter a valid email address.";
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 8) {
      nextErrors.phone = locale === "ar" ? "يرجى كتابة رمز الدولة ورقم جوال صالح." : "Include your country code and a valid mobile number.";
    }
    if (!agreeTerms) nextErrors.terms = locale === "ar" ? "يرجى الموافقة على شروط الإلغاء والدفع للمتابعة." : "Please acknowledge the cancellation and payment terms.";
    if (!areDatesValid) nextErrors.dates = locale === "ar" ? "يرجى اختيار تواريخ وصول ومغادرة صحيحة." : "Choose valid check-in and check-out dates before continuing.";
    if (!room || adultsParam < 1 || kidsParam < 0) nextErrors.booking = locale === "ar" ? "يرجى التحقق من الشقة وعدد الضيوف المختار." : "Review your property and guest selection.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const markPendingPaymentFailed = async (bookingId: string, reason: string) => {
    try {
      await fetch("/api/bookings/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentFailed: true, reason }),
      });
    } catch {
      // The user still sees that the booking is unconfirmed if this cleanup request fails.
    }
  };

  const handleVerifyPayment = async (
    bookingId: string,
    orderId: string,
    paymentId: string,
    signature?: string
  ) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const response = await fetch("/api/bookings/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, orderId, paymentId, signature }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Payment verification failed.");
      try {
        sessionStorage.removeItem(formStorageKey);
      } catch {
        // Confirmation does not depend on clearing the tab-local draft.
      }
      const targetUrl = locale === "ar"
        ? (data.bookingCode ? `/ar/booking-confirmation/${data.bookingCode}` : `/ar${data.redirectUrl}`)
        : data.redirectUrl;
      router.push(targetUrl);
    } catch (error: unknown) {
      setServerError(
        error instanceof Error
          ? error.message
          : locale === "ar"
          ? "تعذر التحقق من الدفع. لم يتم تأكيد الحجز."
          : "Payment could not be verified. No booking is confirmed."
      );
      setPaymentOpen(false);
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    if (isSubmitting || paymentOpen || !validateForm() || !room) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: room.slug,
          checkInDate: checkInParam,
          checkOutDate: checkOutParam,
          adultsCount: adultsParam,
          kidsCount: kidsParam,
          stayPurpose: purposeParam,
          selectedAddons: selectedAddonList,
          memberCode: activeMember?.code,
          guest: { fullName, email, phone, specialRequests, isInternational },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not start your reservation.");

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        await markPendingPaymentFailed(data.bookingId, "Payment gateway failed to load; no payment was attempted.");
        throw new Error("The secure payment window could not load. No payment was taken and your stay is not confirmed. Please try again.");
      }

      const options: RazorpayCheckoutOptions = {
        key: data.keyId,
        amount: data.advancePayable * 100,
        currency: "INR",
        name: BRAND_NAME,
        description: fareResult.servicesPrepaid > 0
          ? `20% stay advance + services for ${room.title}`
          : `20% Advance Booking Deposit for ${room.title}`,
        order_id: data.orderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: BRAND_HEX.gold },
        modal: {
          ondismiss: () => {
            void markPendingPaymentFailed(data.bookingId, "Payment was cancelled before completion.");
            setPaymentOpen(false);
            setIsSubmitting(false);
            setServerError("Payment was cancelled. Your stay is not confirmed; your details are still here if you want to try again.");
          },
        },
        handler: async (payment: RazorpaySuccessResponse) => {
          await handleVerifyPayment(
            data.bookingId,
            payment.razorpay_order_id,
            payment.razorpay_payment_id,
            payment.razorpay_signature
          );
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (failure: RazorpayFailureResponse) => {
        void markPendingPaymentFailed(data.bookingId, failure.error?.description || "Payment was declined or failed.");
        setPaymentOpen(false);
        setIsSubmitting(false);
        setServerError(failure.error?.description || "Payment failed. No reservation is confirmed. Please try another payment method.");
      });
      setPaymentOpen(true);
      checkout.open();
      setIsSubmitting(false);
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
      setPaymentOpen(false);
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return (
      <div className={cn("mx-auto max-w-2xl px-5 py-20 text-center text-foreground", locale === "ar" && "font-arabic")} dir={locale === "ar" ? "rtl" : "ltr"}>
        <h1 className="font-heading heading-page">{locale === "ar" ? "العقار غير موجود" : "Property not found"}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{locale === "ar" ? "يرجى اختيار شقة قبل المتابعة إلى الدفع." : "Choose a residence before continuing to checkout."}</p>
        <Link href={`${basePath}/properties`} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ArrowLeft className={cn("h-4 w-4", locale === "ar" && "rotate-180")} /> {locale === "ar" ? "استعراض الشقق والإقامات" : "Browse residences"}
        </Link>
      </div>
    );
  }

  const localizedRoom = getLocalizedRoom(room, locale);
  const propertyImage = room.gallery.find((image) => image.url)?.url;
  const propertyImageAlt = room.gallery.find((image) => image.url)?.alt || `${localizedRoom.title} at Flatel Hospitality`;
  const isBusy = isSubmitting || paymentOpen;
  const selectedPurpose = {
    accommodation_only: locale === "ar" ? "إقامة عادية" : "Standard accommodation",
    medical: locale === "ar" ? "إقامة علاجية (قرب المستشفيات)" : "Medistay",
    wedding: locale === "ar" ? "إقامة مناسبات وأعراس" : "Wedding stay",
    tourism: locale === "ar" ? "إقامة سياحية واستكشاف" : "Wanderer",
    corporate: locale === "ar" ? "إقامة عمل وشركات" : "Corporate stay",
    family: locale === "ar" ? "إجازة عائلية" : "Family stay",
  }[purposeParam];

  const summaryContent = (
    <>
      <div className="relative h-44 overflow-hidden rounded-xl bg-secondary sm:h-52">
        {propertyImage ? (
          // Inventory images are already part of the property's trusted record.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={propertyImage} alt={propertyImageAlt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {locale === "ar" ? "صورة الشقة غير متوفرة" : "Residence image unavailable"}
          </div>
        )}
      </div>
      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{localizedRoom.type}</p>
        <h2 className="mt-1 font-heading text-foreground heading-sub">{localizedRoom.title}</h2>
        {branch && (
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <span>{(locale === "ar" && room.branchSlug && ARABIC_BRANCH_OVERLAYS[room.branchSlug]?.address) || branch.address}</span>
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line-soft py-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{locale === "ar" ? "تسجيل الوصول · ١١ ص - ١ ظ" : "Check-in · 11 AM–1 PM"}</p>
          <p className="mt-1 flex items-center gap-2 text-foreground"><CalendarDays className="h-4 w-4 text-primary" />{formatStayDate(checkInParam, locale)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{locale === "ar" ? "تسجيل المغادرة · ١١ صباحاً" : "Check-out · 11 AM"}</p>
          <p className="mt-1 flex items-center gap-2 text-foreground"><CalendarDays className="h-4 w-4 text-primary" />{formatStayDate(checkOutParam, locale)}</p>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Clock3 className="h-4 w-4 text-primary" />
          {areDatesValid
            ? (locale === "ar" ? `${nights} ${nights === 1 ? "ليلة" : "ليال"}` : `${nights} ${nights === 1 ? "night" : "nights"}`)
            : (locale === "ar" ? "يرجى تحديد التواريخ" : "Dates needed")}
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Users className="h-4 w-4 text-primary" />
          {locale === "ar"
            ? `${adultsParam} بالغين${kidsParam > 0 ? ` · ${kidsParam} أطفال` : ""}`
            : `${adultsParam} ${adultsParam === 1 ? "adult" : "adults"}${kidsParam > 0 ? ` · ${kidsParam} children` : ""}`}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{selectedPurpose}</span>
        <Link href={editUrl} className="min-h-10 inline-flex items-center text-sm font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {locale === "ar" ? "تعديل" : "Change"}
        </Link>
      </div>

      <div className="mt-4 border-t border-line-soft pt-4">
        <h3 className="text-sm font-semibold text-foreground">{locale === "ar" ? "تفاصيل الأسعار" : "Price breakdown"}</h3>
        {!areDatesValid ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {locale === "ar" ? "حدد تواريخ صالحة لعرض الإجمالي وقيمة العربون." : "Choose valid dates to see your total and advance payment."}
          </p>
        ) : (
          <div className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>{locale === "ar" ? `قيمة الإقامة (${nights} ${nights === 1 ? "ليلة" : "ليال"})` : `Stay (${nights} ${nights === 1 ? "night" : "nights"})`}</span>
              <span className="tabular-nums text-foreground">{formatMoney(fareResult.standardBaseRent)}</span>
            </div>
            {fareResult.baseRentDiscount > 0 && (
              <div className="flex justify-between gap-3 text-primary">
                <span>
                  {fareResult.discountSource === "member"
                    ? (locale === "ar" ? `سعر العضو (${Math.round(fareResult.discountRate * 100)}%)` : `Member rate (${Math.round(fareResult.discountRate * 100)}%)`)
                    : (locale === "ar" ? `خصم المدة (${Math.round(fareResult.discountRate * 100)}%)` : `Stay discount (${Math.round(fareResult.discountRate * 100)}%)`)}
                </span>
                <span className="tabular-nums">−{formatMoney(fareResult.baseRentDiscount)}</span>
              </div>
            )}
            {fareResult.extraGuestsTotal > 0 && (
              <div className="flex justify-between gap-3 text-muted-foreground">
                <span>{locale === "ar" ? "رسوم النزلاء الإضافيين (بالغون وأطفال)" : "Extra guest charges (adults & children)"}</span>
                <span className="tabular-nums text-foreground">{formatMoney(fareResult.extraGuestsTotal)}</span>
              </div>
            )}
            {fareResult.addonsTotal > 0 && (
              <div className="flex justify-between gap-3 text-muted-foreground">
                <span>{locale === "ar" ? "الخدمات المختارة" : "Selected services"}</span>
                <span className="tabular-nums text-foreground">{formatMoney(fareResult.addonsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-line-soft pt-3 font-semibold text-foreground">
              <span>{dict.checkout.totalStay}</span>
              <span className="tabular-nums">{formatMoney(fareResult.grossTotal)}</span>
            </div>
            {fareResult.servicesPrepaid > 0 ? (
              <>
                <div className="flex justify-between gap-3 text-foreground">
                  <span>{locale === "ar" ? "عربون الإقامة (20%)" : "Stay advance (20%)"}</span>
                  <span className="tabular-nums">{formatMoney(fareResult.flatAdvance)}</span>
                </div>
                <div className="flex justify-between gap-3 text-foreground">
                  <span>{locale === "ar" ? "الخدمات (تُدفع بالكامل الآن)" : "Services (paid in full now)"}</span>
                  <span className="tabular-nums">{formatMoney(fareResult.servicesPrepaid)}</span>
                </div>
                <div className="flex justify-between gap-3 text-foreground">
                  <span>{locale === "ar" ? "المستحق الآن" : "Due now"}</span>
                  <span className="font-semibold tabular-nums text-primary">{formatMoney(fareResult.advancePayable)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-3 text-foreground">
                <span>{dict.checkout.advanceDueNow}</span>
                <span className="font-semibold tabular-nums text-primary">{formatMoney(fareResult.advancePayable)}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>{dict.checkout.balanceDueArrival}</span>
              <span className="tabular-nums">{formatMoney(fareResult.balanceDueOnArrival)}</span>
            </div>
          </div>
        )}
      </div>

      {selectedAddonList.length > 0 && (
        <div className="mt-4 border-t border-line-soft pt-3">
          <p className="text-xs font-medium text-muted-foreground">{locale === "ar" ? "الخدمات المختارة" : "Selected services"}</p>
          <ul className="mt-2 space-y-2">
            {selectedAddonList.map((addon) => {
              const displayName = (locale === "ar" && ARABIC_ADDONS_TRANSLATION[addon.id]) || addon.name;
              return (
                <li key={addon.id} className="flex items-center justify-between gap-3 text-sm text-foreground">
                  <span className="min-w-0 truncate">{displayName}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatMoney(addon.pricingType === "per_night" ? addon.price * nights : addon.price)}
                    <button type="button" onClick={() => setActiveAddonIds((current) => current.filter((id) => id !== addon.id))} className="ml-3 min-h-10 px-1 text-xs text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Remove ${displayName}`}>
                      {locale === "ar" ? "إلغاء" : "Remove"}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-5 border-t border-line-soft pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />{dict.checkout.cancellationPolicy}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.checkout.cancellationNotice}</p>
      </div>
    </>
  );

  const fieldClass = (field: string) => cn(
    "mt-2 min-h-12 w-full rounded-lg border bg-secondary px-4 text-base text-foreground placeholder:text-fg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    errors[field] ? "border-rose-400" : "border-border"
  );

  return (
    <div className={cn("min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground", locale === "ar" && "font-arabic")} dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href={basePath || "/"} aria-label="Flatel Hospitality home" className="group flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Image src="/images/flatel-monogram-clean.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
            <Image src="/images/flatel-logo-clean.png" alt="FLATEL Hospitality" width={140} height={42} className="h-7 w-auto shrink-0 object-contain" />
          </Link>
        </div>
        <nav aria-label="Booking progress" className="border-t border-border/50">
          <ol className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-5 py-3 text-xs sm:px-8 sm:text-sm">
            <li>
              <Link href={editUrl} className="inline-flex min-h-10 items-center gap-2 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>
                <span className="hidden sm:inline">{locale === "ar" ? "تفاصيل الإقامة" : "Stay details"}</span>
                <span className="sm:hidden">{locale === "ar" ? "الإقامة" : "Stay"}</span>
              </Link>
            </li>
            <li aria-hidden="true" className="h-px flex-1 bg-gold-deep/70" />
            <li aria-current="step" className="inline-flex min-h-10 items-center gap-2 font-medium text-primary">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">2</span>
              <span className="hidden sm:inline">{locale === "ar" ? "بيانات النزيل" : "Guest details"}</span>
              <span className="sm:hidden">{locale === "ar" ? "النزيل" : "Guest"}</span>
            </li>
            <li aria-hidden="true" className="h-px flex-1 bg-line-strong" />
            <li className="inline-flex min-h-10 items-center gap-2 text-fg-faint">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-line-strong">3</span>
              <span className="hidden sm:inline">{locale === "ar" ? "التأكيد والدفع" : "Confirmation & payment"}</span>
              <span className="sm:hidden">{locale === "ar" ? "التأكيد" : "Confirm"}</span>
            </li>
          </ol>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-7 max-w-2xl">
          <h1 className="font-heading text-foreground heading-page">{dict.checkout.title}</h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">{dict.checkout.subtitle}</p>
        </div>

        <details className="mb-6 rounded-xl border border-border bg-card lg:hidden">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span>{dict.checkout.bookingSummary}</span>
              <ChevronDown className="h-4 w-4 text-primary" />
            </span>
            <span className="text-right">
              <span className="block text-xs text-muted-foreground">{fareResult.servicesPrepaid > 0 ? (locale === "ar" ? "المستحق الآن" : "Due now") : (locale === "ar" ? "العربون الآن" : "Advance due now")}</span>
              <span className="tabular-nums text-lg font-semibold text-primary">{areDatesValid ? formatMoney(fareResult.advancePayable) : "—"}</span>
            </span>
          </summary>
          <div className="border-t border-line-soft p-4">{summaryContent}</div>
        </details>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:gap-10">
          <section aria-labelledby="guest-heading">
            {serverError && (
              <div role="alert" className="mb-5 flex gap-3 rounded-lg border border-rose-400/50 bg-rose-950/30 p-4 text-sm text-rose-100">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <div>
                  <p className="font-semibold">{locale === "ar" ? "لم يكتمل الدفع" : "Payment not completed"}</p>
                  <p className="mt-1 leading-6">{serverError}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleProceedToPayment} noValidate className="rounded-xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line-soft pb-4">
                <h2 id="guest-heading" className="font-heading text-foreground heading-sub">{dict.checkout.guestDetails}</h2>
                <p className="text-xs text-muted-foreground">{locale === "ar" ? "الحقول الإلزامية مميزة بـ *" : "Required fields are marked *"}</p>
              </div>

              {!user && (
                <button type="button" onClick={() => openAuthModal("Sign in to auto-fill your contact details.")} className="mb-5 min-h-10 text-sm font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {locale === "ar" ? "تسجيل الدخول للملء التلقائي" : "Sign in to auto-fill"}
                </button>
              )}
              {user && (
                <p className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {locale === "ar" ? "يمكنك مراجعة وتعديل بياناتك أدناه." : "Details can be reviewed and edited below."}
                </p>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    {dict.checkout.fullName} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="name"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(event) => { setFullName(event.target.value); persistDraft({ fullName: event.target.value }); setErrors((current) => ({ ...current, fullName: "" })); }}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    placeholder={locale === "ar" ? "الاسم كما هو مدون في إثبات الهوية أو الجواز" : "Name as shown on your ID"}
                    className={fieldClass("fullName")}
                  />
                  {errors.fullName && <p id="fullName-error" className="mt-2 text-sm text-rose-300">{errors.fullName}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      {dict.checkout.phone} <span className="text-primary">*</span>
                    </label>
                    <input
                      id="phone"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(event) => { setPhone(event.target.value); persistDraft({ phone: event.target.value }); setErrors((current) => ({ ...current, phone: "" })); }}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : "phone-help"}
                      placeholder="+966 / +971 / +91 ..."
                      className={fieldClass("phone")}
                    />
                    {errors.phone ? <p id="phone-error" className="mt-2 text-sm text-rose-300">{errors.phone}</p> : <p id="phone-help" className="mt-2 text-sm leading-5 text-muted-foreground">{locale === "ar" ? "سنستخدم هذا الرقم لتأكيد الحجز وإرسال القسيمة." : "We’ll use this number for your reservation."}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {dict.checkout.email} <span className="text-primary">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => { setEmail(event.target.value); persistDraft({ email: event.target.value }); setErrors((current) => ({ ...current, email: "" })); }}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      placeholder="you@example.com"
                      className={fieldClass("email")}
                    />
                    {errors.email && <p id="email-error" className="mt-2 text-sm text-rose-300">{errors.email}</p>}
                  </div>
                </div>

                <label className="flex min-h-12 items-start gap-3 rounded-lg border border-line-soft p-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={isInternational}
                    onChange={(event) => { setIsInternational(event.target.checked); persistDraft({ isInternational: event.target.checked }); }}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />
                  <span>
                    {dict.checkout.internationalGuest}
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                      {locale === "ar" ? "يُشترط إبراز جواز سفر ساري المفعول لجميع النزلاء القادمين من خارج الهند عند تسجيل الوصول." : "A physical passport or valid international travel document is required at check-in."}
                    </span>
                  </span>
                </label>

                <div className="rounded-lg border border-line-soft p-3">
                  <label htmlFor="memberCode" className="text-sm font-medium text-foreground">
                    {locale === "ar" ? "رقم عضوية فلاتيل (اختياري)" : "Flatel Member ID (optional)"}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="memberCode"
                      name="memberCode"
                      dir="ltr"
                      autoComplete="off"
                      value={memberCode}
                      onChange={(event) => { setMemberCode(event.target.value.toUpperCase()); setMemberCheck({ status: "idle" }); }}
                      placeholder="FL-AB12CD"
                      className={cn(fieldClass("memberCode"), "font-mono uppercase tracking-wider")}
                    />
                    <button
                      type="button"
                      onClick={handleApplyMember}
                      disabled={!memberCode.trim() || memberCheck.status === "checking" || isBusy}
                      className="min-h-12 shrink-0 rounded-lg border border-line-strong px-4 text-sm font-semibold text-primary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {memberCheck.status === "checking" ? (locale === "ar" ? "جارٍ التحقق…" : "Checking…") : (locale === "ar" ? "تطبيق" : "Apply")}
                    </button>
                  </div>
                  {activeMember && (
                    <p role="status" className="mt-2 text-sm text-primary">
                      {locale === "ar"
                        ? `مرحباً ${activeMember.name} — تم تطبيق سعر العضو (${activeMember.percent}%).`
                        : `Welcome back, ${activeMember.name} — member rate (${activeMember.percent}%) applied.`}
                    </p>
                  )}
                  {memberCheck.status === "error" && <p role="alert" className="mt-2 text-sm text-rose-300">{memberCheck.message}</p>}
                </div>

                <div>
                  <label htmlFor="specialRequests" className="text-sm font-medium text-foreground">
                    {dict.checkout.specialRequests}
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={3}
                    maxLength={300}
                    value={specialRequests}
                    onChange={(event) => { setSpecialRequests(event.target.value); persistDraft({ specialRequests: event.target.value }); }}
                    placeholder={locale === "ar" ? "أخبرنا بالموعد المتوقع للوصول أو أي طلبات خاصة بالإقامة" : "Share an expected arrival time or other request"}
                    className={cn(fieldClass("specialRequests"), "resize-y py-3 leading-6")}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{specialRequests.length}/300</p>
                </div>

                <div className="flex items-start gap-3 border-t border-line-soft pt-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{locale === "ar" ? "إثبات الهوية مطلوب عند الوصول" : "Photo ID required at check-in"}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{dict.checkout.photoIdNotice}</p>
                  </div>
                </div>

                <div className="border-t border-line-soft pt-5">
                  <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(event) => { setAgreeTerms(event.target.checked); persistDraft({ agreeTerms: event.target.checked }); setErrors((current) => ({ ...current, terms: "" })); }}
                      aria-invalid={Boolean(errors.terms)}
                      aria-describedby={errors.terms ? "terms-error" : undefined}
                      className="mt-1 h-5 w-5 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    />
                    <span>{dict.checkout.termsAgreement}</span>
                  </label>
                  {errors.terms && <p id="terms-error" className="mt-2 text-sm text-rose-300">{errors.terms}</p>}
                </div>

                {(errors.dates || errors.booking) && <p role="alert" className="text-sm text-rose-300">{errors.dates || errors.booking}</p>}

                <div className="border-t border-line-soft pt-5">
                  <button
                    type="submit"
                    disabled={isBusy || !areDatesValid || fareResult.advancePayable <= 0}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-fg-faint disabled:text-fg"
                  >
                    <CreditCard className="h-5 w-5" />
                    {isSubmitting
                      ? (locale === "ar" ? "جاري فتح بوابة الدفع الآمنة..." : "Opening secure payment…")
                      : paymentOpen
                      ? (locale === "ar" ? "الدفع قيد المعالجة..." : "Payment in progress…")
                      : areDatesValid
                      ? (fareResult.servicesPrepaid > 0
                        ? (locale === "ar" ? `سداد ${formatMoney(fareResult.advancePayable)} وتأكيد الحجز` : `Pay ${formatMoney(fareResult.advancePayable)} & confirm booking`)
                        : (locale === "ar" ? `سداد عربون ${formatMoney(fareResult.advancePayable)} وتأكيد الحجز` : `Pay ${formatMoney(fareResult.advancePayable)} advance & confirm booking`))
                      : (locale === "ar" ? "حدد التواريخ للمتابعة" : "Select dates to continue")}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    {locale === "ar"
                      ? `ستراجع وتدفع بالضبط مبلغ العربون المعروض في نافذة الدفع الآمنة.`
                      : `You’ll review and pay exactly ${areDatesValid ? formatMoney(fareResult.advancePayable) : "the advance shown in your summary"} in the secure payment window.`}
                  </p>
                  <p className="mt-2 text-center text-xs text-fg-muted">
                    {locale === "ar" ? "لا يتم تأكيد الحجز إلا بعد نجاح التحقق من سداد العربون." : "No reservation is confirmed until payment is verified."}
                  </p>
                </div>
              </div>
            </form>
          </section>

          <aside aria-label="Booking summary" className="hidden lg:block lg:sticky lg:top-6">
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 font-heading text-foreground heading-sub">{dict.checkout.bookingSummary}</h2>
              {summaryContent}
            </div>
          </aside>
        </div>

        <div className="mt-8 border-t border-border/50 pt-5 text-center text-xs text-muted-foreground sm:text-left">
          <span>{locale === "ar" ? "حجز فندقي آمن ومؤكد · ضيافة فلاتيل حيدر أباد" : "Secure reservation · Flatel Hospitality"}</span>
        </div>
      </div>
    </div>
  );
}

/** Several flats in the cart go to the combined checkout; everything else is the single-flat checkout. */
export function CheckoutView({ locale = "en" }: CheckoutViewProps) {
  const searchParams = useSearchParams();
  if (isGroupCart(parseCart(searchParams.get("cart")))) {
    return <GroupCheckoutView locale={locale} />;
  }
  return <SingleCheckoutView locale={locale} />;
}
