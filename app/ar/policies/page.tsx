"use client";

import * as React from "react";
import {
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface PolicyCard {
  id: string;
  icon: React.ElementType;
  title: string;
  badge: string;
  summary: string;
  details: string[];
}

const ARABIC_POLICIES: PolicyCard[] = [
  {
    id: "advance-deposit",
    icon: CreditCard,
    title: "سياسة تأكيد الحجز بعربون ٢٠٪ فقط",
    badge: "شرط السداد الرسمي",
    summary:
      "احجز شقتك المفروشة بدفع عربون ٢٠٪ فقط عبر الإنترنت. ويسدد المبلغ المتبقي ٨٠٪ عند تسجيل الدخول.",
    details: [
      "دفع ٢٠٪ كعربون مبدئي عبر وسائل الدفع الإلكتروني المعتمدة أو البطاقات الائتمانية",
      "إصدار سند حجز إلكتروني فوري ومؤكد مع رقم الحجز المرجعي",
      "سداد المتبقي ٨٠٪ عند استلام مفتاح الشقة نقداً أو عبر الدفع الإلكتروني المباشر",
      "صفر رسوم حجز خفية أو رسوم منصة إضافية",
    ],
  },
  {
    id: "free-cancellation",
    icon: ShieldCheck,
    title: "إلغاء مجاني مرن حتى ٤٨ ساعة واسترداد كامل",
    badge: "شروط مرنة",
    summary:
      "إلغاء مجاني بالكامل مع استرداد ١٠٠٪ لمبلغ العربون حتى ٤٨ ساعة قبل موعد تسجيل الدخول الرسمي.",
    details: [
      "استرداد كامل للعربون في حال الإلغاء قبل ٤٨ ساعة من موعد الوصول",
      "الإلغاء قبل أقل من ٤٨ ساعة يخضع لخصم ليلة واحدة لتغطية الحجز المخصص",
      "تعديل التواريخ متاح مجاناً حسب توفر الشقق دون أي رسوم إضافية",
    ],
  },
  {
    id: "checkin-checkout",
    icon: Clock,
    title: "مواعيد تسجيل الدخول والخروج الرسمية",
    badge: "المواعيد الزمنية",
    summary:
      "فترة تسجيل الدخول من ١١:٠٠ صباحاً إلى ١:٠٠ ظهراً. وقت تسجيل الخروج حتى ١١:٠٠ صباحاً.",
    details: [
      "وقت تسجيل الدخول: ١١:٠٠ صباحاً – ١:٠٠ ظهراً لضمان إتمام تنظيف وتعقيم الشقة بالكامل",
      "وقت تسجيل الخروج: ١١:٠٠ صباحاً كحد أقصى لإتاحة التجهيز للضيوف القادمين",
      "الدخول المبكر أو الخروج المتأخر متاح بالتنسيق المسبق حسب توفر الشقق",
    ],
  },
  {
    id: "housekeeping",
    icon: Sparkles,
    title: "خدمة تنظيف وتطهير فندقية مجانية",
    badge: "نظافة فندقية",
    summary:
      "خدمة تنظيف فندقية دورية مجانية تقدم يوماً بعد يوم لضمان راحتكم وصحتكم طوال فترة الإقامة.",
    details: [
      "تنظيف وتطهير كامل للأرضيات والأسطح والمطبخ يوماً بعد يوم",
      "تبديل الشراشف وأغطية الأسرة والمناشف بانتظام",
      "جمع النفايات والتخلص منها يومياً عند الطلب",
    ],
  },
];

export default function ArabicPoliciesPage() {
  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic" dir="rtl">
      <SiteHeader />

      <main className="flex-1 w-full">
        {/* Banner */}
        <section className="relative w-full py-14 sm:py-20 text-center border-b border-[rgba(212,163,89,0.18)]">
          <div className="relative mx-auto max-w-4xl px-4 z-10 space-y-3">
            <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.16em] text-[#E5C178] uppercase">
              الشفافية والثقة المتبادلة
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#FAF4EB] font-medium leading-tight">
              سياسات الحجز والإقامة الفندقية
            </h1>
            <p className="text-sm sm:text-base text-[#D4C4B3] max-w-xl mx-auto leading-relaxed">
              شروط واضحة وموثوقة تضمن راحة ضيوفنا الكرام وتوفر أفضل تجربة إقامة فندقية مفروشة في حيدر أباد.
            </p>
          </div>
        </section>

        {/* Policies Grid */}
        <section className="w-full py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {ARABIC_POLICIES.map((policy) => {
                const IconComponent = policy.icon;
                return (
                  <div
                    key={policy.id}
                    id={policy.id}
                    className="rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] p-6 sm:p-8 space-y-4 hover:border-[#E5C178] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E5C178]/15 border border-[#E5C178]/30 flex items-center justify-center text-[#E5C178]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[rgba(34,24,16,0.8)] border border-[rgba(212,163,89,0.22)] text-[#E5C178]">
                        {policy.badge}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#FAF4EB]">
                      {policy.title}
                    </h3>

                    <p className="text-sm text-[#D4C4B3] leading-relaxed">
                      {policy.summary}
                    </p>

                    <div className="pt-3 border-t border-[rgba(212,163,89,0.18)] space-y-2">
                      {policy.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#FAF4EB]/90">
                          <CheckCircle2 className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
