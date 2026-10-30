"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, Layers, ShieldCheck } from "lucide-react";
import type { RoomDetail } from "@/lib/mock-rooms";
import { BRAND_NAME } from "@/lib/constants";
import { calculateFlatelPrice, type FareCalculationResult } from "@/lib/pricing";
import { parseCart, MAX_CART_FLATS } from "@/lib/booking/cart";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import {
  loadRazorpayScript,
  type RazorpayCheckoutOptions,
  type RazorpayFailureResponse,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay/load-script";
import { MemberIdField, activeMemberFor, type AppliedMember } from "@/components/checkout/member-id-field";
import { BRAND_HEX } from "@/lib/design-tokens";

const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function getNights(checkIn: string, checkOut: string) {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 86_400_000);
}

const PURPOSES = ["medical", "wedding", "tourism", "corporate", "family"] as const;

/** Checkout for several flats booked together: one payment, one voucher. */
export function GroupCheckoutView({ locale = "en" }: { locale?: Locale }) {
  const isAr = locale === "ar";
  const basePath = isAr ? "/ar" : "";
  const router = useRouter();
  const searchParams = useSearchParams();

  const cart = React.useMemo(() => parseCart(searchParams.get("cart")) ?? [], [searchParams]);
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const rawPurpose = searchParams.get("purpose");
  const purpose = PURPOSES.find((value) => value === rawPurpose) ?? "accommodation_only";
  const nights = getNights(checkIn, checkOut);

  const [rooms, setRooms] = React.useState<Record<string, RoomDetail> | null>(null);
  const [loadError, setLoadError] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [specialRequests, setSpecialRequests] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [appliedMember, setAppliedMember] = React.useState<AppliedMember | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data: { success?: boolean; units?: RoomDetail[] }) => {
        if (!mounted) return;
        if (!data.success || !Array.isArray(data.units)) {
          setLoadError(true);
          return;
        }
        setRooms(Object.fromEntries(data.units.map((unit) => [unit.slug, unit])));
      })
      .catch(() => mounted && setLoadError(true));
    return () => {
      mounted = false;
    };
  }, []);

  const activeMember = activeMemberFor(appliedMember, email, phone);

  /** Same pricing rules as the server, flat by flat. Null until every flat is known. */
  const lines = React.useMemo(() => {
    if (!rooms || nights < 1) return null;
    const result: Array<{ room: RoomDetail; adults: number; kids: number; fare: FareCalculationResult }> = [];
    for (const item of cart) {
      const room = rooms[item.slug];
      if (!room) return null;
      try {
        const fare = calculateFlatelPrice({
          nights,
          basePricePerNight: room.basePricePerNight,
          baseAdults: room.baseAdults,
          selectedAdults: item.adults,
          selectedKids: item.kids,
          extraPersonFee: room.extraPersonFeePerNight,
          memberDiscountRate: activeMember ? activeMember.percent / 100 : undefined,
        });
        result.push({ room, adults: item.adults, kids: item.kids, fare });
      } catch {
        return null;
      }
    }
    return result;
  }, [rooms, cart, nights, activeMember]);

  const totals = React.useMemo(
    () =>
      (lines ?? []).reduce(
        (sum, line) => ({
          gross: sum.gross + line.fare.grossTotal,
          advance: sum.advance + line.fare.advancePayable,
          balance: sum.balance + line.fare.balanceDueOnArrival,
        }),
        { gross: 0, advance: 0, balance: 0 }
      ),
    [lines]
  );

  const branchSlugs = new Set((lines ?? []).map((line) => line.room.branchSlug || "moghal-pura"));
  const branchConflict = branchSlugs.size > 1;
  const missingFlat = Boolean(rooms) && cart.some((item) => !rooms?.[item.slug]);
  const cartValid = cart.length >= 2 && cart.length <= MAX_CART_FLATS;
  const canPay = cartValid && Boolean(lines) && !branchConflict && nights > 0 && totals.advance > 0;

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 3) next.fullName = isAr ? "يرجى إدخال الاسم الكامل (٣ أحرف على الأقل)." : "Enter your full name (at least 3 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = isAr ? "يرجى إدخال بريد إلكتروني صحيح." : "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = isAr ? "يرجى كتابة رمز الدولة ورقم جوال صالح." : "Include your country code and a valid mobile number.";
    if (!agreeTerms) next.terms = isAr ? "يرجى الموافقة على شروط الإلغاء والدفع للمتابعة." : "Please acknowledge the cancellation and payment terms.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const postVerify = (payload: Record<string, unknown>) =>
    fetch("/api/bookings/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    if (isBusy || !canPay || !validate()) return;
    setIsBusy(true);

    try {
      const response = await fetch("/api/bookings/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: searchParams.get("cart"),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          stayPurpose: purpose,
          memberCode: activeMember?.code,
          guest: { fullName, email, phone, specialRequests },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not start your reservation.");

      const groupCode: string = data.groupCode;
      const releaseHold = (reason: string) => void postVerify({ groupCode, paymentFailed: true, reason }).catch(() => undefined);

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        releaseHold("Payment gateway failed to load; no payment was attempted.");
        throw new Error("The secure payment window could not load. No payment was taken and your stay is not confirmed. Please try again.");
      }

      const options: RazorpayCheckoutOptions = {
        key: data.keyId,
        amount: data.advancePayable * 100,
        currency: "INR",
        name: BRAND_NAME,
        description: `20% advance for ${cart.length} flats`,
        order_id: data.orderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: BRAND_HEX.gold },
        modal: {
          ondismiss: () => {
            releaseHold("Payment was cancelled before completion.");
            setIsBusy(false);
            setServerError("Payment was cancelled. Your flats are not held; your details are still here if you want to try again.");
          },
        },
        handler: async (payment: RazorpaySuccessResponse) => {
          try {
            const verify = await postVerify({
              groupCode,
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            });
            const result = await verify.json();
            if (!verify.ok || !result.success) throw new Error(result.error || "Payment verification failed.");
            router.push(`${basePath}/booking-confirmation/${result.bookingCode}`);
          } catch (verifyError: unknown) {
            setServerError(verifyError instanceof Error ? verifyError.message : "Payment could not be verified. Please contact support.");
            setIsBusy(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (failure: RazorpayFailureResponse) => {
        releaseHold(failure.error?.description || "Payment was declined or failed.");
        setIsBusy(false);
        setServerError(failure.error?.description || "Payment failed. No reservation is confirmed. Please try another payment method.");
      });
      checkout.open();
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
      setIsBusy(false);
    }
  };

  const fieldClass = (field: string) =>
    cn(
      "mt-2 min-h-12 w-full rounded-lg border bg-secondary px-4 text-base text-foreground placeholder:text-fg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      errors[field] ? "border-rose-400" : "border-border"
    );

  if (!cartValid) {
    return (
      <div className={cn("mx-auto max-w-2xl px-5 py-20 text-center text-foreground", isAr && "font-arabic")} dir={isAr ? "rtl" : "ltr"}>
        <h1 className="font-heading heading-page">{isAr ? "اختيار الشقق غير صالح" : "We couldn't read your flat selection"}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isAr ? "اختر من 2 إلى 4 شقق ثم أعد المحاولة." : `Choose between 2 and ${MAX_CART_FLATS} flats and try again.`}
        </p>
        <Link href={`${basePath}/#flats`} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className={cn("h-4 w-4", isAr && "rotate-180")} /> {isAr ? "العودة للبحث" : "Back to search"}
        </Link>
      </div>
    );
  }

  const nightsLabel = isAr ? `${nights} ${nights === 1 ? "ليلة" : "ليال"}` : `${nights} ${nights === 1 ? "night" : "nights"}`;

  return (
    <div className={cn("min-h-screen bg-background text-foreground", isAr && "font-arabic")} dir={isAr ? "rtl" : "ltr"}>
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href={basePath || "/"} aria-label="Flatel Hospitality home" className="flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Image src="/images/flatel-monogram-clean.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
            <Image src="/images/flatel-logo-clean.png" alt="FLATEL Hospitality" width={140} height={42} className="h-7 w-auto shrink-0 object-contain" />
          </Link>
          <Link href={`${basePath}/#flats`} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary hover:text-foreground">
            <ArrowLeft className={cn("h-4 w-4", isAr && "rotate-180")} />
            {isAr ? "تعديل الاختيار" : "Change selection"}
          </Link>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {isAr ? "دفع آمن" : "Secure checkout"}
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="group-checkout-title">
          <h1 id="group-checkout-title" className="font-heading text-foreground heading-page">
            {isAr ? `حجز ${cart.length} شقق معاً` : `Booking ${cart.length} flats together`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAr ? "دفعة واحدة وقسيمة واحدة لجميع الشقق." : "One payment and one voucher for all your flats."}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">{isAr ? "الاسم الكامل" : "Full name"}</label>
              <input id="fullName" name="fullName" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass("fullName")} />
              {errors.fullName && <p className="mt-2 text-sm text-rose-300">{errors.fullName}</p>}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-foreground">{isAr ? "رقم الجوال" : "Mobile number"}</label>
                <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={fieldClass("phone")} />
                {errors.phone && <p className="mt-2 text-sm text-rose-300">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">{isAr ? "البريد الإلكتروني" : "Email"}</label>
                <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={fieldClass("email")} />
                {errors.email && <p className="mt-2 text-sm text-rose-300">{errors.email}</p>}
              </div>
            </div>

            <MemberIdField locale={isAr ? "ar" : "en"} email={email} phone={phone} stayStart={checkIn} applied={appliedMember} onApply={setAppliedMember} disabled={isBusy} />

            <div>
              <label htmlFor="specialRequests" className="text-sm font-medium text-foreground">{isAr ? "طلبات خاصة" : "Special requests"}</label>
              <textarea id="specialRequests" name="specialRequests" rows={3} maxLength={300} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className={cn(fieldClass("specialRequests"), "resize-y py-3 leading-6")} />
            </div>

            <div className="border-t border-line-soft pt-5">
              <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
                <span>
                  {isAr
                    ? "أوافق على دفع عربون ٢٠٪ الآن عن جميع الشقق والمتبقي ٨٠٪ عند الوصول، وأدرك سياسة الإلغاء (استرداد كامل حتى ٤٨ ساعة قبل الوصول)."
                    : "I understand the 20% advance covers all my flats and is refundable when cancelled at least 48 hours before check-in. The remaining 80% is due at the property on arrival."}
                </span>
              </label>
              {errors.terms && <p className="mt-2 text-sm text-rose-300">{errors.terms}</p>}
            </div>

            {branchConflict && (
              <p role="alert" className="text-sm text-rose-300">
                {isAr ? "يجب أن تكون الشقق في فرع واحد. اختر فرعاً واحداً أو احجزها على حدة." : "Flats in one combined booking must be at the same branch. Choose one branch or book them separately."}
              </p>
            )}
            {missingFlat && (
              <p role="alert" className="text-sm text-rose-300">
                {isAr ? "إحدى الشقق المختارة لم تعد متاحة." : "One of the selected flats is no longer available."}
              </p>
            )}
            {loadError && (
              <p role="alert" className="text-sm text-rose-300">
                {isAr ? "تعذر تحميل بيانات الشقق. أعد تحميل الصفحة." : "We couldn't load the flat details. Please reload the page."}
              </p>
            )}
            {nights < 1 && (
              <p role="alert" className="text-sm text-rose-300">
                {isAr ? "يرجى اختيار تواريخ صحيحة قبل المتابعة." : "Choose valid dates before continuing."}
              </p>
            )}
            {serverError && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{serverError}</p>}

            <button
              type="submit"
              disabled={isBusy || !canPay}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-fg-faint disabled:text-fg"
            >
              <CreditCard className="h-5 w-5" />
              {isBusy
                ? isAr ? "جاري فتح بوابة الدفع الآمنة..." : "Opening secure payment…"
                : canPay
                ? isAr ? `سداد عربون ${formatMoney(totals.advance)} وتأكيد الحجز` : `Pay ${formatMoney(totals.advance)} advance & confirm ${cart.length} flats`
                : isAr ? "أكمل التفاصيل للمتابعة" : "Complete the details to continue"}
            </button>
            <p className="text-center text-xs text-fg-muted">
              {isAr ? "لا يتم تأكيد الحجز إلا بعد نجاح التحقق من سداد العربون." : "No reservation is confirmed until payment is verified."}
            </p>
          </form>
        </section>

        <aside aria-label="Booking summary" className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-heading text-foreground heading-sub">
              <Layers className="h-5 w-5 text-primary" />
              {isAr ? "ملخص الحجز" : "Booking summary"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {checkIn} → {checkOut} · {nights > 0 ? nightsLabel : isAr ? "تواريخ غير صالحة" : "Dates needed"}
            </p>

            {!lines ? (
              <p className="mt-4 text-sm text-muted-foreground" role="status">
                {loadError || missingFlat ? "" : isAr ? "جارٍ تحميل الأسعار…" : "Loading prices…"}
              </p>
            ) : (
              <>
                <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                  {lines.map((line, index) => (
                    <li key={`${line.room.slug}-${index}`} className="py-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-medium text-foreground">{line.room.type}</span>
                        <span className="tabular-nums text-foreground">{formatMoney(line.fare.grossTotal)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {isAr
                          ? `${line.adults} بالغين${line.kids > 0 ? ` · ${line.kids} أطفال` : ""}`
                          : `${line.adults} ${line.adults === 1 ? "adult" : "adults"}${line.kids > 0 ? ` · ${line.kids} children` : ""}`}
                        {line.fare.discountSource === "member" && ` · ${isAr ? "سعر العضو" : "member rate"}`}
                        {line.fare.discountSource === "duration" && ` · ${isAr ? "خصم المدة" : "stay discount"}`}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{isAr ? "إجمالي الإقامة" : "Total stay"}</span>
                    <span className="tabular-nums text-foreground">{formatMoney(totals.gross)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-foreground">{isAr ? "العربون الآن (٢٠٪)" : "Advance now (20%)"}</span>
                    <span className="font-semibold tabular-nums text-primary">{formatMoney(totals.advance)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    <span>{isAr ? "المتبقي عند الوصول" : "Balance on arrival"}</span>
                    <span className="tabular-nums">{formatMoney(totals.balance)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
