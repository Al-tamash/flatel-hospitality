"use client";

import * as React from "react";
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
import {
  loadRazorpayScript,
  type RazorpayCheckoutOptions,
  type RazorpaySuccessResponse,
  type RazorpayFailureResponse,
} from "@/lib/razorpay/load-script";

const EMPTY_FARE: FareCalculationResult = {
  nights: 0,
  standardBaseRent: 0,
  discountRate: 0,
  baseRentDiscount: 0,
  baseRent: 0,
  extraAdults: 0,
  extraGuestsTotal: 0,
  addonsTotal: 0,
  grossTotal: 0,
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

const formatStayDate = (date: string) => {
  if (!date) return "Select date";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "Select date";
  return new Intl.DateTimeFormat("en-IN", {
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

export function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

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
    return `/properties/${room?.slug || propertySlug}?${params.toString()}`;
  }, [checkInParam, checkOutParam, adultsParam, kidsParam, purposeParam, activeAddonIds, room?.slug, propertySlug]);

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
      });
    } catch {
      return EMPTY_FARE;
    }
  }, [room, areDatesValid, nights, adultsParam, kidsParam, selectedAddonList]);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      nextErrors.fullName = "Enter your full name (at least 3 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 8) {
      nextErrors.phone = "Include your country code and a valid mobile number.";
    }
    if (!agreeTerms) nextErrors.terms = "Please acknowledge the cancellation and payment terms.";
    if (!areDatesValid) nextErrors.dates = "Choose valid check-in and check-out dates before continuing.";
    if (!room || adultsParam < 1 || kidsParam < 0) nextErrors.booking = "Review your property and guest selection.";
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
      router.push(data.redirectUrl);
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "Payment could not be verified. No booking is confirmed.");
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
        description: `20% Advance Booking Deposit for ${room.title}`,
        order_id: data.orderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: "#E5C178" },
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
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-foreground">
        <h1 className="font-heading text-3xl font-normal">Property not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">Choose a residence before continuing to checkout.</p>
        <Link href="/properties" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <ArrowLeft className="h-4 w-4" /> Browse residences
        </Link>
      </div>
    );
  }

  const propertyImage = room.gallery.find((image) => image.url)?.url;
  const propertyImageAlt = room.gallery.find((image) => image.url)?.alt || `${room.title} at Flatel Hospitality`;
  const isBusy = isSubmitting || paymentOpen;
  const selectedPurpose = {
    accommodation_only: "Standard accommodation",
    medical: "Medistay",
    wedding: "Wedding stay",
    tourism: "Wanderer",
    corporate: "Corporate stay",
    family: "Family stay",
  }[purposeParam];

  const summaryContent = (
    <>
      <div className="relative h-44 overflow-hidden rounded-xl bg-secondary sm:h-52">
        {propertyImage ? (
          // Inventory images are already part of the property's trusted record.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={propertyImage} alt={propertyImageAlt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Residence image unavailable</div>
        )}
      </div>
      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">{room.type}</p>
        <h2 className="mt-1 font-heading text-2xl leading-tight text-foreground">{room.title}</h2>
        {branch && (
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <span>{branch.address}</span>
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[rgba(212,163,89,0.2)] py-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Check-in · 11 AM–1 PM</p>
          <p className="mt-1 flex items-center gap-2 text-foreground"><CalendarDays className="h-4 w-4 text-primary" />{formatStayDate(checkInParam)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Check-out · 11 AM</p>
          <p className="mt-1 flex items-center gap-2 text-foreground"><CalendarDays className="h-4 w-4 text-primary" />{formatStayDate(checkOutParam)}</p>
        </div>
        <div className="flex items-center gap-2 text-foreground"><Clock3 className="h-4 w-4 text-primary" />{areDatesValid ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Dates needed"}</div>
        <div className="flex items-center gap-2 text-foreground"><Users className="h-4 w-4 text-primary" />{adultsParam} {adultsParam === 1 ? "adult" : "adults"}{kidsParam > 0 ? ` · ${kidsParam} children` : ""}</div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{selectedPurpose}</span>
        <Link href={editUrl} className="min-h-10 inline-flex items-center text-sm font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Change</Link>
      </div>

      <div className="mt-4 border-t border-[rgba(212,163,89,0.2)] pt-4">
        <h3 className="text-sm font-semibold text-foreground">Price breakdown</h3>
        {!areDatesValid ? (
          <p className="mt-3 text-sm text-muted-foreground">Choose valid dates to see your total and advance payment.</p>
        ) : (
          <div className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3 text-muted-foreground"><span>Stay ({nights} {nights === 1 ? "night" : "nights"})</span><span className="tabular-nums text-foreground">{formatMoney(fareResult.standardBaseRent)}</span></div>
            {fareResult.baseRentDiscount > 0 && <div className="flex justify-between gap-3 text-primary"><span>Stay discount ({Math.round(fareResult.discountRate * 100)}%)</span><span className="tabular-nums">−{formatMoney(fareResult.baseRentDiscount)}</span></div>}
            {fareResult.extraGuestsTotal > 0 && <div className="flex justify-between gap-3 text-muted-foreground"><span>Additional adult charge</span><span className="tabular-nums text-foreground">{formatMoney(fareResult.extraGuestsTotal)}</span></div>}
            {fareResult.addonsTotal > 0 && <div className="flex justify-between gap-3 text-muted-foreground"><span>Selected services</span><span className="tabular-nums text-foreground">{formatMoney(fareResult.addonsTotal)}</span></div>}
            <div className="flex justify-between gap-3 border-t border-[rgba(212,163,89,0.2)] pt-3 font-semibold text-foreground"><span>Total stay</span><span className="tabular-nums">{formatMoney(fareResult.grossTotal)}</span></div>
            <div className="flex justify-between gap-3 text-foreground"><span>Advance due now (20%)</span><span className="font-semibold tabular-nums text-primary">{formatMoney(fareResult.advancePayable)}</span></div>
            <div className="flex justify-between gap-3 text-muted-foreground"><span>Remaining balance at property (80%)</span><span className="tabular-nums">{formatMoney(fareResult.balanceDueOnArrival)}</span></div>
          </div>
        )}
      </div>

      {selectedAddonList.length > 0 && (
        <div className="mt-4 border-t border-[rgba(212,163,89,0.2)] pt-3">
          <p className="text-xs font-medium text-muted-foreground">Selected services</p>
          <ul className="mt-2 space-y-2">
            {selectedAddonList.map((addon) => (
              <li key={addon.id} className="flex items-center justify-between gap-3 text-sm text-foreground">
                <span className="min-w-0 truncate">{addon.name}</span>
                <span className="shrink-0 tabular-nums">{formatMoney(addon.pricingType === "per_night" ? addon.price * nights : addon.price)}
                  <button type="button" onClick={() => setActiveAddonIds((current) => current.filter((id) => id !== addon.id))} className="ml-3 min-h-10 px-1 text-xs text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Remove ${addon.name}`}>Remove</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 border-t border-[rgba(212,163,89,0.2)] pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarDays className="h-4 w-4 text-primary" />Cancellation policy</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The 20% advance is refundable when you cancel at least 48 hours before check-in. Within 48 hours, the advance is non-refundable.</p>
      </div>
    </>
  );

  const fieldClass = (field: string) => cn(
    "mt-2 min-h-12 w-full rounded-lg border bg-secondary px-4 text-base text-foreground placeholder:text-[#B8A692] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    errors[field] ? "border-rose-400" : "border-border"
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground">
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" aria-label="Flatel Hospitality home" className="group flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary text-primary" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9z" />
                <path d="M9 21V12h6v9" />
              </svg>
            </span>
            <span>
              <span className="block font-heading text-lg leading-none tracking-[0.12em] text-foreground">FLATEL HOSPITALITY</span>
              <span className="mt-1 block text-[10px] tracking-[0.18em] text-primary">SERVICED RESIDENCES · HYDERABAD</span>
            </span>
          </Link>
        </div>
        <nav aria-label="Booking progress" className="border-t border-border/50">
          <ol className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-5 py-3 text-xs sm:px-8 sm:text-sm">
            <li><Link href={editUrl} className="inline-flex min-h-10 items-center gap-2 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" /></span><span className="hidden sm:inline">Stay details</span><span className="sm:hidden">Stay</span></Link></li>
            <li aria-hidden="true" className="h-px flex-1 bg-[#C69344]/70" />
            <li aria-current="step" className="inline-flex min-h-10 items-center gap-2 font-medium text-primary"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">2</span><span className="hidden sm:inline">Guest details</span><span className="sm:hidden">Guest</span></li>
            <li aria-hidden="true" className="h-px flex-1 bg-[#5B4A36]" />
            <li className="inline-flex min-h-10 items-center gap-2 text-[#A89887]"><span className="grid h-6 w-6 place-items-center rounded-full border border-[#5B4A36]">3</span><span className="hidden sm:inline">Confirmation & payment</span><span className="sm:hidden">Confirm</span></li>
          </ol>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-7 max-w-2xl">
          <h1 className="font-heading text-3xl leading-tight text-foreground sm:text-4xl">Confirm your reservation</h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">Add your contact details and review the amount due before paying your advance.</p>
        </div>

        <details className="mb-6 rounded-xl border border-border bg-card lg:hidden">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground"><span>Booking summary</span><ChevronDown className="h-4 w-4 text-primary" /></span>
            <span className="text-right"><span className="block text-xs text-muted-foreground">Advance due now</span><span className="tabular-nums text-lg font-semibold text-primary">{areDatesValid ? formatMoney(fareResult.advancePayable) : "—"}</span></span>
          </summary>
          <div className="border-t border-[rgba(212,163,89,0.2)] p-4">{summaryContent}</div>
        </details>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:gap-10">
          <section aria-labelledby="guest-heading">
            {serverError && (
              <div role="alert" className="mb-5 flex gap-3 rounded-lg border border-rose-400/50 bg-rose-950/30 p-4 text-sm text-rose-100">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <div><p className="font-semibold">Payment not completed</p><p className="mt-1 leading-6">{serverError}</p></div>
              </div>
            )}
            <form onSubmit={handleProceedToPayment} noValidate className="rounded-xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(212,163,89,0.2)] pb-4">
                <h2 id="guest-heading" className="font-heading text-2xl text-foreground">Guest details</h2>
                <p className="text-xs text-muted-foreground">Required fields are marked *</p>
              </div>

              {!user && (
                <button type="button" onClick={() => openAuthModal("Sign in to auto-fill your contact details.")} className="mb-5 min-h-10 text-sm font-medium text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Sign in to auto-fill</button>
              )}
              {user && <p className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" />Details can be reviewed and edited below.</p>}

              <div className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full name <span className="text-primary">*</span></label>
                  <input id="fullName" name="name" autoComplete="name" required value={fullName} onChange={(event) => { setFullName(event.target.value); persistDraft({ fullName: event.target.value }); setErrors((current) => ({ ...current, fullName: "" })); }} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} placeholder="Name as shown on your ID" className={fieldClass("fullName")} />
                  {errors.fullName && <p id="fullName-error" className="mt-2 text-sm text-rose-300">{errors.fullName}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">Mobile number <span className="text-primary">*</span></label>
                    <input id="phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(event) => { setPhone(event.target.value); persistDraft({ phone: event.target.value }); setErrors((current) => ({ ...current, phone: "" })); }} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-help"} placeholder="Include country code, e.g. +91" className={fieldClass("phone")} />
                    {errors.phone ? <p id="phone-error" className="mt-2 text-sm text-rose-300">{errors.phone}</p> : <p id="phone-help" className="mt-2 text-sm leading-5 text-muted-foreground">We’ll use this number for your reservation.</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Email address <span className="text-primary">*</span></label>
                    <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); persistDraft({ email: event.target.value }); setErrors((current) => ({ ...current, email: "" })); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} placeholder="you@example.com" className={fieldClass("email")} />
                    {errors.email && <p id="email-error" className="mt-2 text-sm text-rose-300">{errors.email}</p>}
                  </div>
                </div>

                <label className="flex min-h-12 items-start gap-3 rounded-lg border border-[rgba(212,163,89,0.18)] p-3 text-sm text-foreground">
                  <input type="checkbox" checked={isInternational} onChange={(event) => { setIsInternational(event.target.checked); persistDraft({ isInternational: event.target.checked }); }} className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
                  <span>I’m an international guest <span className="mt-1 block text-sm leading-5 text-muted-foreground">A physical passport or valid international travel document is required at check-in.</span></span>
                </label>

                <div>
                  <label htmlFor="specialRequests" className="text-sm font-medium text-foreground">Special requests or arrival notes <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <textarea id="specialRequests" name="specialRequests" rows={3} maxLength={300} value={specialRequests} onChange={(event) => { setSpecialRequests(event.target.value); persistDraft({ specialRequests: event.target.value }); }} placeholder="Share an expected arrival time or other request" className={cn(fieldClass("specialRequests"), "resize-y py-3 leading-6")} />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{specialRequests.length}/300</p>
                </div>

                <div className="flex items-start gap-3 border-t border-[rgba(212,163,89,0.2)] pt-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Photo ID required at check-in</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Every adult guest must present an original government photo ID. International guests must present a physical passport or valid travel document.</p>
                  </div>
                </div>

                <div className="border-t border-[rgba(212,163,89,0.2)] pt-5">
                  <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                    <input type="checkbox" checked={agreeTerms} onChange={(event) => { setAgreeTerms(event.target.checked); persistDraft({ agreeTerms: event.target.checked }); setErrors((current) => ({ ...current, terms: "" })); }} aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? "terms-error" : undefined} className="mt-1 h-5 w-5 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
                    <span>I understand that the 20% advance is refundable when cancelled at least 48 hours before check-in and non-refundable within 48 hours. The remaining 80% is due at the property on arrival.</span>
                  </label>
                  {errors.terms && <p id="terms-error" className="mt-2 text-sm text-rose-300">{errors.terms}</p>}
                </div>

                {(errors.dates || errors.booking) && <p role="alert" className="text-sm text-rose-300">{errors.dates || errors.booking}</p>}

                <div className="border-t border-[rgba(212,163,89,0.2)] pt-5">
                  <button type="submit" disabled={isBusy || !areDatesValid || fareResult.advancePayable <= 0} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-[#77664A] disabled:text-[#E8DFD1]">
                    <CreditCard className="h-5 w-5" />
                    {isSubmitting ? "Opening secure payment…" : paymentOpen ? "Payment in progress…" : areDatesValid ? `Pay ${formatMoney(fareResult.advancePayable)} advance & confirm booking` : "Select dates to continue"}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />You’ll review and pay exactly {areDatesValid ? formatMoney(fareResult.advancePayable) : "the advance shown in your summary"} in the secure payment window.</p>
                  <p className="mt-2 text-center text-xs text-[#B8A692]">No reservation is confirmed until payment is verified.</p>
                </div>
              </div>
            </form>
          </section>

          <aside aria-label="Booking summary" className="hidden lg:block lg:sticky lg:top-6">
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 font-heading text-2xl text-foreground">Booking summary</h2>
              {summaryContent}
            </div>
          </aside>
        </div>

        <div className="mt-8 border-t border-border/50 pt-5 text-center text-xs text-muted-foreground sm:text-left">
          <span>Secure reservation · Flatel Hospitality</span>
        </div>
      </main>
    </div>
  );
}
