import * as React from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookingConfirmationView } from "@/components/confirmation/booking-confirmation-view";

interface ArabicBookingConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: ArabicBookingConfirmationPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `تأكيد الحجز ${id} | ضيافة فلاتيل حيدر أباد`,
    description: `قسيمة وسند تأكيد الحجز الفندقي الرقمي لمرجع الحجز ${id} في ضيافة فلاتيل حيدر أباد.`,
  };
}

async function ConfirmationLoader({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  return <BookingConfirmationView bookingId={id} locale="ar" />;
}

export default function ArabicBookingConfirmationPage({
  params,
}: ArabicBookingConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic" dir="rtl">
      <SiteHeader />
      <main className="flex-1 w-full">
        <React.Suspense
          fallback={
            <div className="mx-auto max-w-4xl px-4 py-20 text-center text-[#B8A692]">
              <div className="w-8 h-8 border-2 border-[#E5C178] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>جاري استرجاع تفاصيل الحجز الفندقي...</p>
            </div>
          }
        >
          <ConfirmationLoader paramsPromise={params} />
        </React.Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
