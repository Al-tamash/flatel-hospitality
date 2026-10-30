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
        "relative w-full bg-canvas text-fg py-12 sm:py-16 lg:py-20 overflow-hidden",
        className
      )}
      aria-labelledby="healthcare-heading"
    >
      <div id="hospitals" className="absolute -top-20 pointer-events-none" />

      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold)_6%,transparent)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative container-page z-10">
        {/* Editorial Split Header & Reassurance Strip (Card-Free) */}
        <div className="border-y border-line py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 6 cols: Purpose & Narrative */}
            <div className={cn("lg:col-span-6 space-y-4", isAr ? "text-right" : "text-left")}>
              <span className="text-xs font-sans font-semibold tracking-[0.14em] text-gold uppercase">
                {isAr ? "الرعاية الصحية ومرافقة المرضى" : "HEALTHCARE & MEDISTAY CORRIDOR"}
              </span>
              <h2
                id="healthcare-heading"
                className="font-heading text-fg heading-section"
              >
                {isAr
                  ? "إقامة صحية مهيأة بالكامل للمسافرين للعلاج وعائلاتهم"
                  : "Hygienic Residential Care for Medical Travelers & Families"}
              </h2>
              <p className="text-sm sm:text-base text-fg-soft font-sans leading-relaxed">
                {isAr
                  ? "توفر فلاتيل شققاً فندقية مفروشة في باركاس سلالة ومغل بورا لضيوف حيدر أباد القادمين للعلاج. استمتع بمطبخ خاص لإعداد وجبات المريض واطلب المساعدة من فريقنا في معلومات المستشفيات والتنقلات."
                  : "Flatel offers furnished residences in Barkas Salala and Moghal Pura for guests visiting Hyderabad for medical care. Guests have a private kitchen and can ask the team for help with local hospital travel information."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={`${localePrefix}/hospitals`}
                  className="px-6 py-3 min-h-[46px] rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-105 text-ink font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>{isAr ? "دليل مستشفيات حيدر أباد والخدمات" : "Explore Hospital Travel Guide & Services"}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Right 6 cols: 3 Highlights separated by Hairline Dividers */}
            <div className={cn(
              "lg:col-span-6 divide-y divide-line-soft border-y border-line-soft lg:border-y-0",
              isAr
                ? "lg:border-r lg:border-line-soft lg:pr-8 text-right"
                : "lg:border-l lg:border-line-soft lg:pl-8 text-left"
            )}>
              {CORRIDOR_HIGHLIGHTS.map((item) => (
                <div key={item.number} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-gold font-bold tracking-wider">
                      {isAr ? item.numberAr : item.number}
                    </span>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-fg">
                      {isAr ? item.titleAr : item.title}
                    </h3>
                  </div>
                  <p className={cn("text-xs sm:text-sm text-fg-soft mt-1 leading-relaxed", isAr ? "pr-6" : "pl-6")}>
                    {isAr ? item.descAr : item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 border-t border-line-soft pt-5 text-xs leading-relaxed text-fg-soft">
            {isAr
              ? "تتوفر الكراسي المتحركة وحوامل المحاليل الوريدية (IV) عند الطلب. تقدم فلاتيل خدمات الضيافة ومساعدة الضيوف، ولا تقدم رعاية سريرية أو طبية."
              : "Wheelchair assistance and IV stands are available on request. Flatel provides accommodation and guest support, not clinical care."}
          </p>
        </div>
      </div>
    </section>
  );
}
