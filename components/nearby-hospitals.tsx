"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export { HOSPITALS_DATA as HOSPITAL_RECORDS, MEDICAL_SERVICES } from "./hospital-directory-view";

const CORRIDOR_HIGHLIGHTS = [
  {
    number: "01",
    numberAr: "٠١",
    title: "Private Modular Kitchens",
    titleAr: "مطابخ خاصة مجهزة بالكامل",
    desc: "Prepare doctor-prescribed, salt-free, or diabetic patient meals without relying on hotel food.",
    descAr: "إعداد وجبات المريض الصحية، الخالية من الملح أو المخصصة لمرضى السكري باستقلالية تامة دون الاعتماد على طعام الفنادق.",
  },
  {
    number: "02",
    numberAr: "٠٢",
    title: "Mobility assistance",
    titleAr: "مساعدة في الحركة والتنقل",
    desc: "Ask our team about wheelchair assistance and setup options for your stay.",
    descAr: "توفير كراسي متحركة وتجهيزات سرير طبي عند الطلب لتيسير راحة المريض ومرافقيه.",
  },
  {
    number: "03",
    numberAr: "٠٣",
    title: "Hospital travel information",
    titleAr: "إرشادات المستشفيات والمواعيد",
    desc: "Our team can help with information about nearby hospitals and travel options.",
    descAr: "يقدم فريقنا معلومات تفصيلية عن المسافات وأوقات التنقل إلى أكبر مستشفيات حيدر أباد ومواعيد الأطباء.",
  },
];

export function NearbyHospitals({ className }: { className?: string }) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const localePrefix = isAr ? "/ar" : "";

  return (
    <section
      id="healthcare"
      className={cn(
        "relative w-full bg-[#0E0A07] text-[#FAF4EB] py-12 sm:py-16 lg:py-20 overflow-hidden",
        className
      )}
      aria-labelledby="healthcare-heading"
    >
      <div id="hospitals" className="absolute -top-20 pointer-events-none" />

      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(212,163,89,0.06)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 z-10">
        {/* Editorial Split Header & Reassurance Strip (Card-Free) */}
        <div className="rounded-3xl border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.85)] backdrop-blur-md p-6 sm:p-9 lg:p-11 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 6 cols: Purpose & Narrative */}
            <div className={cn("lg:col-span-6 space-y-4", isAr ? "text-right" : "text-left")}>
              <span className="text-xs font-sans font-semibold tracking-[0.16em] text-[#E5C178] uppercase">
                {isAr ? "الرعاية الصحية ومرافقة المرضى" : "HEALTHCARE & MEDISTAY CORRIDOR"}
              </span>
              <h2
                id="healthcare-heading"
                className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#FAF4EB] font-medium leading-[1.15]"
              >
                {isAr
                  ? "إقامة صحية مهيأة بالكامل للمسافرين للعلاج وعائلاتهم"
                  : "Hygienic Residential Care for Medical Travelers & Families"}
              </h2>
              <p className="text-sm sm:text-base text-[#D4C4B3] font-sans leading-relaxed">
                {isAr
                  ? "توفر فلاتيل شققاً فندقية مفروشة في باركاس سلالة ومغل بورا لضيوف حيدر أباد القادمين للعلاج. استمتع بمطبخ خاص لإعداد وجبات المريض واطلب المساعدة من فريقنا في معلومات المستشفيات والتنقلات."
                  : "Flatel offers furnished residences in Barkas Salala and Moghal Pura for guests visiting Hyderabad for medical care. Guests have a private kitchen and can ask the team for help with local hospital travel information."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={`${localePrefix}/hospitals`}
                  className="px-6 py-3 min-h-[46px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>{isAr ? "دليل مستشفيات حيدر أباد والخدمات" : "Explore Hospital Travel Guide & Services"}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Right 6 cols: 3 Highlights separated by Hairline Dividers */}
            <div className={cn(
              "lg:col-span-6 divide-y divide-[rgba(212,163,89,0.18)] border-y border-[rgba(212,163,89,0.18)] lg:border-y-0",
              isAr
                ? "lg:border-r lg:border-[rgba(212,163,89,0.2)] lg:pr-8 text-right"
                : "lg:border-l lg:border-[rgba(212,163,89,0.2)] lg:pl-8 text-left"
            )}>
              {CORRIDOR_HIGHLIGHTS.map((item) => (
                <div key={item.number} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-[#E5C178] font-bold tracking-wider">
                      {isAr ? item.numberAr : item.number}
                    </span>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#FAF4EB]">
                      {isAr ? item.titleAr : item.title}
                    </h3>
                  </div>
                  <p className={cn("text-xs sm:text-sm text-[#D4C4B3] mt-1 leading-relaxed", isAr ? "pr-6" : "pl-6")}>
                    {isAr ? item.descAr : item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 border-t border-[rgba(212,163,89,0.18)] pt-5 text-xs leading-relaxed text-[#D4C4B3]">
            {isAr
              ? "تتوفر الكراسي المتحركة وحوامل المحاليل الوريدية (IV) عند الطلب. تقدم فلاتيل خدمات الضيافة ومساعدة الضيوف، ولا تقدم رعاية سريرية أو طبية."
              : "Wheelchair assistance and IV stands are available on request. Flatel provides accommodation and guest support, not clinical care."}
          </p>
        </div>
      </div>
    </section>
  );
}
