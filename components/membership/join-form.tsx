"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { MembershipCard } from "@/components/membership/membership-card";
import type { MembershipContent } from "@/lib/membership/membership-content";
import {
  loadRazorpayScript,
  type RazorpayCheckoutOptions,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay/load-script";

/** Checkout reads this to prefill the Member ID field. */
export const MEMBER_ID_STORAGE_KEY = "flatel_member_id";

interface JoinFormProps {
  content: MembershipContent;
  locale: "en" | "ar";
  whatsappUrl: string;
  propertiesHref: string;
}

interface JoinedMember {
  memberCode: string;
  fullName: string;
  validUntil: string;
}

const fieldClass =
  "w-full min-h-[48px] rounded-xl border border-[rgba(212,163,89,0.3)] bg-[#140E08] px-4 text-[#FAF4EB] placeholder:text-[#B8A692]/60 focus:border-[#E5C178] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E5C178]";

/** Buy the membership: details, Razorpay payment, then the member's own card with their ID. */
export function JoinForm({ content, locale, whatsappUrl, propertiesHref }: JoinFormProps) {
  const copy = content.join;
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showWhatsApp, setShowWhatsApp] = React.useState(false);
  const [member, setMember] = React.useState<JoinedMember | null>(null);
  const [copied, setCopied] = React.useState(false);

  const canSubmit = fullName.trim().length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && phone.replace(/\D/g, "").length >= 10 && agree;

  const finish = (joined: JoinedMember) => {
    setMember(joined);
    try {
      window.localStorage.setItem(MEMBER_ID_STORAGE_KEY, joined.memberCode);
    } catch {
      // Private mode: the ID is still on screen.
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || !canSubmit) return;
    setError(null);
    setShowWhatsApp(false);
    setIsBusy(true);

    try {
      const response = await fetch("/api/membership/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        setShowWhatsApp(Boolean(data?.unavailable) || response.status >= 500);
        setError(data?.unavailable ? copy.unavailable : data?.error || copy.generic);
        setIsBusy(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        await fetch("/api/membership/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ membershipId: data.membershipId, paymentFailed: true }),
        }).catch(() => undefined);
        setError(copy.gatewayFailed);
        setIsBusy(false);
        return;
      }

      const options: RazorpayCheckoutOptions = {
        key: data.keyId,
        amount: data.amount * 100,
        currency: "INR",
        name: "Flatel Hospitality",
        description: "Flatel Membership — 12 months",
        order_id: data.orderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: "#E5C178" },
        modal: {
          ondismiss: () => {
            setError(copy.cancelled);
            setIsBusy(false);
          },
        },
        handler: async (payment: RazorpaySuccessResponse) => {
          try {
            const verify = await fetch("/api/membership/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                membershipId: data.membershipId,
                orderId: payment.razorpay_order_id,
                paymentId: payment.razorpay_payment_id,
                signature: payment.razorpay_signature,
              }),
            });
            const result = await verify.json().catch(() => null);
            if (!verify.ok || !result?.success) throw new Error(result?.error || copy.generic);
            finish({ memberCode: result.memberCode, fullName: result.fullName, validUntil: result.validUntil });
          } catch (verifyError: unknown) {
            setError(verifyError instanceof Error ? verifyError.message : copy.generic);
            setShowWhatsApp(true);
          } finally {
            setIsBusy(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (failure) => {
        setError(failure.error?.description || copy.generic);
        setIsBusy(false);
      });
      checkout.open();
    } catch {
      setError(copy.generic);
      setShowWhatsApp(true);
      setIsBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!member) return;
    try {
      await navigator.clipboard.writeText(member.memberCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the ID is selectable on screen.
    }
  };

  if (member) {
    const validUntil = new Date(member.validUntil).toLocaleDateString(locale === "ar" ? "ar-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return (
      <div className="grid gap-8 md:grid-cols-2 md:items-center" role="status">
        <MembershipCard
          content={{ ...content, cardHolder: member.fullName.toUpperCase().slice(0, 22), cardId: member.memberCode }}
        />
        <div className="space-y-4 text-center md:text-start">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E5C178]/15 border border-[#E5C178]/50 text-[#E5C178]">
            <Check className="h-5 w-5" />
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl text-[#FAF4EB]">{copy.successTitle}</h3>
          <p className="text-sm text-[#D4C4B3] leading-relaxed">{copy.successBody}</p>
          <div className="rounded-xl border border-[rgba(212,163,89,0.3)] bg-[#140E08] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8A692]">{copy.memberIdLabel}</p>
            <div className="mt-1 flex items-center justify-center md:justify-between gap-3">
              <span dir="ltr" className="font-mono text-2xl font-bold tracking-[0.12em] text-[#E5C178] select-all">
                {member.memberCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-[rgba(212,163,89,0.35)] text-xs font-semibold text-[#E5C178] hover:border-[#E5C178] cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? copy.copied : copy.copy}
              </button>
            </div>
            <p className="mt-2 text-xs text-[#B8A692]">
              {copy.validUntil}: {validUntil}
            </p>
          </div>
          <Link
            href={propertiesHref}
            className="inline-flex items-center min-h-[48px] px-6 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm"
          >
            {copy.browse}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="member-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8A692]">
          {copy.nameLabel}
        </label>
        <input id="member-name" name="name" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="member-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8A692]">
            {copy.emailLabel}
          </label>
          <input id="member-email" name="email" type="email" inputMode="email" autoComplete="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="member-phone" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8A692]">
            {copy.phoneLabel}
          </label>
          <input id="member-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={fieldClass} />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-[rgba(212,163,89,0.2)] p-3 text-sm text-[#D4C4B3]">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#E5C178]" />
        <span>{copy.consent}</span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || isBusy}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm shadow-md shadow-[#E5C178]/25 transition",
          "hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        )}
      >
        {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
        {isBusy ? copy.paying : copy.pay}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-[#B8A692]">
        <ShieldCheck className="h-3.5 w-3.5" />
        {copy.secure}
      </p>

      {showWhatsApp && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-[rgba(212,163,89,0.4)] text-sm font-semibold text-[#E5C178] hover:border-[#E5C178]"
        >
          <MessageSquare className="h-4 w-4" />
          {copy.whatsappFallback}
        </a>
      )}
    </form>
  );
}
