import * as React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Secure Checkout | Flatel Hospitality",
  description:
    "Complete your reservation for Flatel Hospitality furnished flats in Hyderabad. 20% advance booking deposit with instant confirmation.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
              <p>Loading secure checkout...</p>
            </div>
          }
        >
          <CheckoutView />
        </React.Suspense>
      </main>
    </div>
  );
}
