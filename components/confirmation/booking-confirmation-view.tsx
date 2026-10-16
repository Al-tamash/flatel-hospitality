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
import { cn } from "@/lib/utils";

interface BookingConfirmationViewProps {
  bookingId: string;
}

export function BookingConfirmationView({ bookingId }: BookingConfirmationViewProps) {
  const [booking, setBooking] = React.useState<BookingRecord | null>(null);
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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load booking details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  const handleDownloadPdf = async () => {
    if (!booking) return;
    setIsDownloadingPdf(true);
    try {
      const response = await fetch(`/api/bookings/${booking.bookingCode}/voucher`);
      if (!response.ok) {
        throw new Error("Failed to download PDF voucher.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FLATEL-VOUCHER-${booking.bookingCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error generating PDF voucher. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center text-[#FAF4EB]">
        <div className="w-10 h-10 border-2 border-[#E5C178] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-normal text-[#FAF4EB]">Retrieving Booking Confirmation...</h2>
        <p className="mt-2 text-xs text-[#B8A692]">Validating digital reservation credentials.</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-[#FAF4EB]">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-normal">Booking Record Not Found</h1>
        <p className="mt-2 text-xs sm:text-sm text-[#B8A692] max-w-md mx-auto">
          We could not locate a booking matching code &ldquo;{bookingId}&rdquo;. Please verify your booking reference or contact our front desk hotline.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-[rgba(212,163,89,0.25)] bg-[#16100B] hover:bg-[#221810] text-[#FAF4EB] text-xs h-10 px-4 rounded-xl"
            )}
          >
            <Home className="w-4 h-4 mr-2 text-[#E5C178]" />
            <span>Return to Homepage</span>
          </Link>
          <a
            href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs h-10 px-4 rounded-xl border-none shadow-md"
            )}
          >
            <Phone className="w-4 h-4 mr-2" />
            <span>Front Desk Hotline</span>
          </a>
        </div>
      </div>
    );
  }

  const room = getRoomById(booking.unitId);
  const branch = room?.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
  const branchName = branch ? branch.name : "Hyderabad";
  const branchAddress = branch
    ? branch.address
    : "Barkas Salala / Moghal Pura, Hyderabad, Telangana";
  const googleMapsUrl = branch?.googleMapsUrl;

  // WhatsApp Concierge message string
  const cleanPhone = booking.guest.phone.replace(/[^0-9]/g, "");
  const whatsappSummaryMessage = `Hello ${booking.guest.fullName}, here is your FLATEL Hospitality booking confirmation for ${room ? room.title : booking.unitId} (Booking ID: ${booking.bookingCode}) from ${booking.checkInDate} to ${booking.checkOutDate} (${booking.totalNights} nights). 20% advance of ₹${booking.pricing.advancePayable.toLocaleString("en-IN")} is paid. Remaining balance ₹${booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")} is due on arrival. View voucher: ${typeof window !== "undefined" ? window.location.href : ""}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappSummaryMessage)}`;

  return (
    <div className="w-full min-h-screen bg-background text-[#FAF4EB] pb-24 selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 sm:pt-12">
        {/* Top Success Banner */}
        <div className="rounded-3xl border border-[rgba(212,163,89,0.3)] bg-[rgba(34,24,16,0.85)] backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-[#E5C178]/10 rounded-full blur-3xl" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[rgba(212,163,89,0.18)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(229,193,120,0.15)] border border-[rgba(212,163,89,0.4)] text-[#E5C178] flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[rgba(229,193,120,0.1)] border border-[rgba(212,163,89,0.3)] text-[11px] font-sans font-medium text-[#E5C178] uppercase tracking-[0.18em] mb-1.5">
                  RESERVATION CONFIRMED
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-normal text-[#FAF4EB] leading-[1.08]">
                  Thank You, {booking.guest.fullName}!
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#B8A692]">
                  Your booking at Flatel Hospitality is secured. A <span className="font-serif oldstyle-nums text-[#E5C178]">20%</span> advance has been verified.
                </p>
              </div>
            </div>

            {/* Booking Code Card */}
            <div className="sm:text-right shrink-0 p-3 sm:p-0 rounded-xl bg-[#16100B]/80 sm:bg-transparent border sm:border-0 border-[rgba(212,163,89,0.2)]">
              <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#B8A692] block font-mono">
                Booking Reference
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#E5C178] tracking-tight">
                {booking.bookingCode}
              </span>
              <span className="block text-[11px] text-[#B8A692] mt-0.5">
                Status: <strong className="text-emerald-400 uppercase">{booking.bookingStatus}</strong>
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
              className="bg-gradient-to-r from-[#E5C178] via-[#D8AE5E] to-[#C69344] text-[#140E08] font-bold text-xs sm:text-sm h-11 px-5 rounded-xl gap-2 shadow-xl shadow-[rgba(212,163,89,0.18)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer border-none"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingPdf ? "Generating PDF..." : "Download PDF Voucher"}</span>
            </Button>

            {/* Open Google Maps */}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-[rgba(212,163,89,0.25)] bg-[#16100B] hover:bg-[#221810] text-[#FAF4EB] hover:border-[#E5C178]/60 text-xs sm:text-sm h-11 px-4 rounded-xl gap-2 transition-all"
                )}
              >
                <MapPin className="w-4 h-4 text-[#E5C178]" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#B8A692]" />
              </a>
            )}

            {/* WhatsApp Confirmation Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-[rgba(212,163,89,0.25)] bg-[#16100B] hover:bg-[#221810] text-[#FAF4EB] hover:border-[#E5C178]/60 text-xs sm:text-sm h-11 px-4 rounded-xl gap-2 transition-all"
              )}
            >
              <MessageSquare className="w-4 h-4 text-[#E5C178]" />
              <span>Send to WhatsApp</span>
            </a>
          </div>

          {/* WhatsApp Delivery Status Notice */}
          <div className="mt-4 pt-4 border-t border-[rgba(212,163,89,0.18)] text-sm leading-relaxed text-[#B8A692] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
            <div>
              {booking.notificationStatus === "sent" ? (
                <span className="text-emerald-400 font-medium">
                  Automated WhatsApp confirmation voucher was delivered to {booking.guest.phone}.
                </span>
              ) : (
                <span>
                  <strong className="text-[#FAF4EB]">Digital Voucher:</strong> Your reservation is confirmed in our system. Tap the <strong className="text-[#E5C178]">&ldquo;Send to WhatsApp&rdquo;</strong> button above to save your booking voucher and front desk details directly to your mobile chat.
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
            <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(34,24,16,0.75)] backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xl">
              <h2 className="font-heading text-lg font-normal text-[#FAF4EB] border-b border-[rgba(212,163,89,0.18)] pb-3">
                Reserved Residence Details
              </h2>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-sans font-medium tracking-[0.18em] uppercase text-[#E5C178] px-2.5 py-0.5 rounded-full bg-[rgba(229,193,120,0.1)] border border-[rgba(212,163,89,0.3)]">
                    {room ? room.type : "Residence"}
                  </span>
                  <span className="text-sm text-[#E5C178]/90 font-medium">
                    {branchName} Branch
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-normal text-[#FAF4EB] mt-1.5 leading-snug">
                  {room ? room.title : booking.unitId.toUpperCase()}
                </h3>
                <p className="text-sm text-[#B8A692] flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E5C178] shrink-0 mt-0.5" />
                  <span>{branchAddress}</span>
                </p>
              </div>

              {/* Housekeeping Badge */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[rgba(229,193,120,0.08)] border border-[rgba(212,163,89,0.3)] text-[#E5C178] text-sm font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Complimentary Housekeeping Provided on Alternate Days</span>
              </div>

              {/* Stay Schedule Box */}
              <div className="rounded-xl bg-[#16100B]/80 border border-[rgba(212,163,89,0.2)] p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#E5C178] block">
                    Check-In (<span className="font-serif oldstyle-nums">11 AM–1 PM</span>)
                  </span>
                  <span className="font-serif oldstyle-nums text-base font-normal text-[#FAF4EB] mt-1 block">
                    {booking.checkInDate}
                  </span>
                  <span className="text-xs text-[#B8A692]">Window: <strong className="font-serif oldstyle-nums text-[#FAF4EB]">11:00 AM – 1:00 PM</strong></span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#E5C178] block">
                    Check-Out (<span className="font-serif oldstyle-nums">11 AM</span>)
                  </span>
                  <span className="font-serif oldstyle-nums text-base font-normal text-[#FAF4EB] mt-1 block">
                    {booking.checkOutDate}
                  </span>
                  <span className="text-xs text-[#B8A692]">Standard time: <strong className="font-serif oldstyle-nums text-[#FAF4EB]">11:00 AM</strong></span>
                </div>
              </div>

              {/* Occupancy, Duration & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1 border-t border-[rgba(212,163,89,0.18)] mt-2">
                <div className="flex items-center gap-2 text-[#B8A692]">
                  <Users className="w-4 h-4 text-[#E5C178]" />
                  <span>
                    <span className="font-serif oldstyle-nums font-semibold text-[#FAF4EB]">{booking.adultsCount}</span> Adults {booking.kidsCount > 0 ? `· ${booking.kidsCount} Kids` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#B8A692]">
                  <Clock className="w-4 h-4 text-[#E5C178]" />
                  <span><span className="font-serif oldstyle-nums font-semibold text-[#FAF4EB]">{booking.totalNights}</span> Nights Duration</span>
                </div>
                <div className="flex min-w-0 items-start gap-2 text-[#B8A692]">
                  <Sparkles className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                  <span className="min-w-0 whitespace-normal leading-snug">
                    {booking.stayPurpose === "accommodation_only"
                      ? "Standard Accommodation"
                      : booking.stayPurpose === "medical"
                      ? "Medistay (Medical)"
                      : booking.stayPurpose === "wedding"
                      ? "Wedding Stay"
                      : booking.stayPurpose === "family"
                      ? "Family Vacation"
                      : booking.stayPurpose === "tourism"
                      ? "Wanderer (Tourism)"
                      : "Corporate Stay"}
                  </span>
                </div>
              </div>

              {/* Selected Services Pill List if any */}
              {booking.selectedAddons && booking.selectedAddons.length > 0 && (
                <div className="pt-2 border-t border-[rgba(212,163,89,0.18)]">
                  <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#B8A692] block mb-1.5">
                    Included Selected Services ({booking.selectedAddons.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.selectedAddons.map((addon) => (
                      <span
                        key={addon.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16100B] border border-[rgba(212,163,89,0.2)] text-[11px] text-[#FAF4EB]"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#E5C178]" />
                        <span>{addon.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Guidelines & ID Requirements */}
            <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(34,24,16,0.75)] backdrop-blur-md p-5 sm:p-6 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2 text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#E5C178]">
                <ShieldCheck className="w-4 h-4" />
                <span>Guest Guidelines & Arrival Policy</span>
              </div>
              <ul className="space-y-2 text-sm text-[#B8A692] leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-[#FAF4EB]">Mandatory Photo ID:</strong> Domestic guests must present an original government-issued photo ID for each adult (Aadhaar / Driving License / Voter ID). International guests must present an original physical passport and valid official visa.
                </li>
                <li>
                  <strong className="text-[#FAF4EB]">Check-in Timing:</strong> Standard check-in is from <span className="font-serif oldstyle-nums">11:00 AM</span> to <span className="font-serif oldstyle-nums">1:00 PM</span>. Check-out is at <span className="font-serif oldstyle-nums">11:00 AM</span>.
                </li>
                <li>
                  <strong className="text-[#FAF4EB]">Children:</strong> Children aged <span className="font-serif oldstyle-nums">0–12</span> stay free of accommodation charge and count toward safety capacity.
                </li>
                <li>
                  <strong className="text-[#FAF4EB]">Cancellation Policy:</strong> The <span className="font-serif oldstyle-nums">20%</span> advance booking deposit is fully refundable if cancellation occurs at least <span className="font-serif oldstyle-nums">48</span> hours prior to check-in. Non-refundable within <span className="font-serif oldstyle-nums">48</span> hours.
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Breakdown & Balance Due */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.8)] backdrop-blur-md p-5 sm:p-6 space-y-5 shadow-2xl">
              <h2 className="font-heading text-lg font-normal text-[#FAF4EB] border-b border-[rgba(212,163,89,0.18)] pb-3">
                Payment Breakdown
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4 text-[#B8A692]">
                  <span>
                    Base Rent ({booking.totalNights}N @ ₹{room?.basePricePerNight.toLocaleString("en-IN")})
                  </span>
                  <span className="text-[#FAF4EB] font-serif oldstyle-nums">
                    ₹{booking.pricing.standardBaseRent.toLocaleString("en-IN")}
                  </span>
                </div>

                {booking.pricing.baseRentDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-[#E5C178]">
                    <span>Duration Discount ({Math.round(booking.pricing.discountRate * 100)}%)</span>
                    <span className="font-serif oldstyle-nums">
                      -₹{booking.pricing.baseRentDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {booking.pricing.extraGuestsTotal > 0 && (
                  <div className="flex justify-between gap-4 text-[#B8A692]">
                    <span>
                      Extra Adult Fee ({booking.extraGuestsCount} adults @ ₹500/night)
                    </span>
                    <span className="text-[#FAF4EB] font-serif oldstyle-nums">
                      ₹{booking.pricing.extraGuestsTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {booking.pricing.addonsTotal > 0 && (
                  <div className="flex justify-between gap-4 text-[#B8A692]">
                    <span>Selected Paid Add-ons</span>
                    <span className="text-[#FAF4EB] font-serif oldstyle-nums">
                      ₹{booking.pricing.addonsTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[rgba(212,163,89,0.18)] flex justify-between items-baseline font-semibold text-sm text-[#FAF4EB]">
                  <span>Gross Total</span>
                  <span className="font-serif oldstyle-nums text-2xl font-bold text-[#E5C178]">
                    ₹{booking.pricing.grossTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* 20% Advance Online Deposit: Verified & Paid */}
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                    <span><span className="font-serif oldstyle-nums font-bold">20%</span> Advance Paid Online</span>
                  </div>
                  <span className="font-serif oldstyle-nums text-lg font-bold text-[#FAF4EB]">
                    ₹{booking.pricing.advancePayable.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-xs text-emerald-300/80 flex items-center justify-between gap-3 pt-1 border-t border-emerald-500/20">
                  <span>Receipt Ref:</span>
                  <span className="font-mono text-emerald-300">{booking.gatewayPaymentId || "DIRECT-GATEWAY-TXN"}</span>
                </div>
              </div>

              {/* 80% Remaining Balance Due at Property */}
              <div className="rounded-xl border border-[rgba(212,163,89,0.35)] bg-gradient-to-br from-[rgba(229,193,120,0.12)] to-[rgba(34,24,16,0.6)] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-[#E5C178]">
                    <Building className="w-3.5 h-3.5" />
                    <span><span className="font-serif oldstyle-nums font-bold">80%</span> Balance Due on Arrival</span>
                  </div>
                  <span className="font-serif oldstyle-nums text-lg font-bold text-[#FAF4EB]">
                    ₹{booking.pricing.balanceDueOnArrival.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-sm text-[#B8A692] leading-relaxed pt-1 border-t border-[rgba(212,163,89,0.2)]">
                  Payable upon check-in at front desk by Cash or UPI.
                </p>
              </div>

              {/* Front Desk Hotline */}
              <div className="pt-2 text-center text-sm text-[#B8A692]">
                <p>Need assistance or early arrival request?</p>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
                  className="font-medium text-[#E5C178] hover:text-[#FAF4EB] transition-colors mt-1 inline-block"
                >
                  Call {CONTACT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
