"use client";

import * as React from "react";
import { MEMBER_ID_STORAGE_KEY } from "@/components/membership/join-form";
import { cn } from "@/lib/utils";

/** A member rate verified for one exact email and mobile number. */
export interface AppliedMember {
  code: string;
  name: string;
  percent: number;
  email: string;
  phone: string;
}

/** The member rate only holds for the contact details it was verified against. */
export function activeMemberFor(applied: AppliedMember | null, email: string, phone: string): AppliedMember | null {
  return applied && applied.email === email.trim().toLowerCase() && applied.phone === phone.trim() ? applied : null;
}

interface MemberIdFieldProps {
  locale: "en" | "ar";
  email: string;
  phone: string;
  stayStart: string;
  applied: AppliedMember | null;
  onApply: (member: AppliedMember | null) => void;
  disabled?: boolean;
}

/** Optional Flatel Member ID box: checks the ID with the server and reports the verified member. */
export function MemberIdField({ locale, email, phone, stayStart, applied, onApply, disabled }: MemberIdFieldProps) {
  const isAr = locale === "ar";
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState<{ state: "idle" | "checking" | "error"; message?: string }>({ state: "idle" });
  const active = activeMemberFor(applied, email, phone);

  // A member who just joined has their ID saved on this device: offer it here.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(MEMBER_ID_STORAGE_KEY);
        if (saved) setCode(saved);
      } catch {
        // Storage unavailable; the guest can type the ID.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed || status.state === "checking") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || phone.replace(/\D/g, "").length < 8) {
      setStatus({
        state: "error",
        message: isAr
          ? "أدخل بريدك الإلكتروني ورقم جوالك أولاً للتحقق من العضوية."
          : "Enter your email and mobile number first so we can match your membership.",
      });
      return;
    }
    setStatus({ state: "checking" });
    try {
      const response = await fetch("/api/membership/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, email, phone, stayStart }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        onApply(null);
        setStatus({
          state: "error",
          message: isAr ? "رقم العضوية غير صالح لهذا البريد أو الجوال." : "That Member ID is not valid for this email or mobile number.",
        });
        return;
      }
      onApply({
        code: trimmed.toUpperCase().replace(/\s+/g, ""),
        name: data.memberName,
        percent: data.discountPercent,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });
      setStatus({ state: "idle" });
    } catch {
      setStatus({
        state: "error",
        message: isAr ? "تعذر التحقق الآن. حاول مرة أخرى." : "We could not check the Member ID right now. Please try again.",
      });
    }
  };

  return (
    <div className="rounded-lg border border-[rgba(212,163,89,0.18)] p-3">
      <label htmlFor="memberCode" className="text-sm font-medium text-foreground">
        {isAr ? "رقم عضوية فلاتيل (اختياري)" : "Flatel Member ID (optional)"}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="memberCode"
          name="memberCode"
          dir="ltr"
          autoComplete="off"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setStatus({ state: "idle" });
          }}
          placeholder="FL-AB12CD"
          className="min-h-12 w-full rounded-lg border border-border bg-secondary px-4 text-base text-foreground font-mono uppercase tracking-wider placeholder:text-[#B8A692] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <button
          type="button"
          onClick={apply}
          disabled={!code.trim() || status.state === "checking" || disabled}
          className={cn(
            "min-h-12 shrink-0 rounded-lg border border-[rgba(212,163,89,0.4)] px-4 text-sm font-semibold text-primary hover:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          {status.state === "checking" ? (isAr ? "جارٍ التحقق…" : "Checking…") : isAr ? "تطبيق" : "Apply"}
        </button>
      </div>
      {active && (
        <p role="status" className="mt-2 text-sm text-primary">
          {isAr
            ? `مرحباً ${active.name} — تم تطبيق سعر العضو (${active.percent}%).`
            : `Welcome back, ${active.name} — member rate (${active.percent}%) applied.`}
        </p>
      )}
      {status.state === "error" && (
        <p role="alert" className="mt-2 text-sm text-rose-300">
          {status.message}
        </p>
      )}
    </div>
  );
}
