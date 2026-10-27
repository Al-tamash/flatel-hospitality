import * as React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const instant = false;

export const metadata: Metadata = {
  title: "إتمام الحجز الآمن | ضيافة فلاتيل حيدر أباد",
  description:
    "أكمل حجز إقامتك الفندقية المفروشة في حيدر أباد. سداد عربون مقدم بنسبة ٢٠٪ فقط مع تأكيد فوري للحجز وسند إقامة رقمي رسمي.",
};

export default function ArabicCheckoutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-arabic" dir="rtl">
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <main className="flex-1 w-full">
        <React.Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-20 text-center text-[#B8A692]">
              <div className="w-8 h-8 border-2 border-[#E5C178] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>جاري تحميل صفحة الدفع الآمنة...</p>
            </div>
          }
        >
          <CheckoutView locale="ar" />
        </React.Suspense>
      </main>
    </div>
  );
}
