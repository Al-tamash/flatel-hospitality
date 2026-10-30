import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MissionVision } from "@/components/about/mission-vision";
import { WHATSAPP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "عن ضيافة فلاتيل | شقق فندقية مفروشة في حيدر أباد",
  description:
    "تعرف على ضيافة فلاتيل، قصة تأسيسنا، فرعينا الرئيسيين في باركاس سلالة ومغل بورا، والتزامنا الراسخ بتقديم أقصى درجات الراحة المنزلية مع الخدمة الفندقية الفاخرة.",
};

const ARABIC_PLEDGE_ITEMS = [
  {
    number: "٠١",
    title: "استقلالية كاملة في الطبخ الخاص ١٠٠٪",
    description:
      "تضم كل شقة مطبخاً مستقلاً متكاملاً مجهزاً بموقد غاز، أواني طهي كاملة، ثلاجة، وفلتر مياه. لا حاجة للوجبات الفندقية المكلفة أو التقيد بمواعيد المطاعم.",
  },
  {
    number: "٠٢",
    title: "تعقيم وتنظيف فندقي احترافي دوري",
    description:
      "خدمة تنظيف وتطهير مجانية مجدولة تقدم يوماً بعد يوم، تشمل تغيير الشراشف، تنظيف الأرضيات، وجمع النفايات سواء للإقامات القصيرة أو الشهرية.",
  },
  {
    number: "٠٣",
    title: "أسعار شفافة وعربون ٢٠٪ فقط لتأكيد الحجز",
    description:
      "احجز إقامتك وضمن تواريخك بدفع ٢٠٪ كعربون أونلاين فقط. النسبة المتبقية ٨٠٪ تُسدد بسهولة عند الوصول واستلام الشقة بدون أي رسوم خفية.",
  },
  {
    number: "٠٤",
    title: "العائلة بأكملها تحت سقف واحد مستقل",
    description:
      "شقق فسيحة من غرفة إلى ٤ غرف وصالة تستوعب من ٢ إلى ١٢ ضيفاً مع صالات جلوس وطعام مشتركة، بدلاً من تشتيت العائلة في غرف فندقية ضيقة ومنفصلة.",
  },
  {
    number: "٠٥",
    title: "مكتب استقبال ومساعد ضيوف مخصص على مدار الساعة",
    description:
      "فريق دعم متخصص لمساعدة الضيوف، ترتيبات التنقل إلى المستشفيات، وتقديم أفضل الإرشادات المحلية لجعل إقامتكم هانئة ومريحة.",
  },
];

export default function ArabicAboutPage() {
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(
    "مرحباً، أود الاستفسار عن الشقق المفروشة لدى فلاتيل حيدر أباد."
  );

  return (
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold font-arabic" dir="rtl">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {/* 1. Hero Banner */}
        <section className="relative w-full py-16 sm:py-24 overflow-hidden border-b border-line-soft">
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[450px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_14%,transparent)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative container-page text-center z-10">
            <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase mb-3 block">
              ضيافة فلاتيل الفندقية • حيدر أباد
            </span>
            <h1 className="font-heading text-fg heading-hero">
              راحة الشقة الخاصة.. <br />
              <span className="text-gold">بخدمة وفخامة الفندق.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-fg-soft font-sans max-w-2xl mx-auto leading-relaxed">
              تأسست فلاتيل بهدف بسيط وواضح: تقديم بديل راقٍ وعائلي للفنادق التقليدية من خلال شقق مجهزة بالكامل ومطابخ خاصة وخدمة فندقية متميزة.
            </p>
          </div>
        </section>

        {/* 2. Brand Story Split Section */}
        <section className="w-full py-16 sm:py-20">
          <div className="container-page">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Photo Collage Left (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-line shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <Image
                    src="/images/branch-barkas-salala.jpg"
                    alt="مقر ضيافة فلاتيل في حيدر أباد"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Text Right (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase">
                  قصتنا ورؤيتنا
                </span>
                <h2 className="font-heading text-fg heading-section">
                  صُممت خصيصاً للعائلات، الزوار، والقادمين للعلاج
                </h2>
                <p className="text-sm sm:text-base text-fg-soft font-sans leading-relaxed">
                  عند السفر مع العائلة أو للإقامة العلاجية الممتدة في حيدر أباد، تكون الغرف الفندقية التقليدية مكلفة وضيقة وتفتقر للمطابخ الخاصة. صممنا شقق فلاتيل لتمنحكم شعور المنزل الحقيقي مع خصوصية كاملة، صالات طعام واسعة، ومطابخ لتحضير الأطعمة الصحية التي تفضلونها.
                </p>

                {/* 3 Pillars Metric Grid */}
                <div className="pt-4 grid grid-cols-3 gap-4 border-t border-line-soft text-center sm:text-right">
                  <div>
                    <span className="font-heading text-3xl sm:text-4xl text-fg font-medium">١٠٠٪</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-gold block mt-1">
                      مطابخ خاصة مجهزة
                    </span>
                  </div>
                  <div>
                    <span className="font-heading text-3xl sm:text-4xl text-fg font-medium">٢</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-gold block mt-1">
                      فروع رئيسية مرموقة
                    </span>
                  </div>
                  <div>
                    <span className="font-heading text-3xl sm:text-4xl text-fg font-medium">٢٤/٧</span>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-gold block mt-1">
                      فريق دعم الضيوف
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 5-Pillar Standard */}
        <MissionVision locale="ar" />

        <section className="w-full py-16 sm:py-20 bg-surface">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-sans font-semibold tracking-[0.14em] text-gold uppercase">
                وعدنا الثابت لكل ضيف
              </span>
              <h2 className="font-heading text-fg mt-2 heading-section">
                معايير فلاتيل الخمسة للضيافة
              </h2>
              <p className="text-sm sm:text-base text-fg-soft mt-2">
                تخضع كافة الحجوزات في شققنا لهذه الضمانات الأساسية لراحتكم وسعادتكم.
              </p>
            </div>

            <div className="divide-y divide-line-soft border-y border-line">
              {ARABIC_PLEDGE_ITEMS.map((pledge) => (
                <div
                  key={pledge.number}
                  className="py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-gold/3 transition-colors px-3 sm:px-4 rounded-lg"
                >
                  <div className="md:col-span-2 flex items-center gap-3">
                    <span className="font-mono text-xs sm:text-sm text-gold font-bold tracking-widest">
                      {pledge.number}
                    </span>
                    <span className="md:hidden text-xs uppercase tracking-wider text-fg-soft">المعيار</span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-fg">
                      {pledge.title}
                    </h3>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-sm sm:text-base text-fg-soft font-sans leading-relaxed">
                      {pledge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <section className="w-full py-14 sm:py-16 text-center border-t border-line-soft">
          <div className="mx-auto max-w-xl px-4 space-y-4">
            <h2 className="font-heading text-fg heading-section">
              هل أنت جاهز لتجربة إقامة استثنائية في حيدر أباد؟
            </h2>
            <p className="text-sm text-fg-soft">
              استكشف شققنا المفروشة أو تواصل مع فريق الحجوزات المباشر عبر واتساب.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/ar/properties"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-ink font-bold text-sm shadow-md inline-flex items-center gap-2"
              >
                <span>استكشف الشقق المتاحة</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-line bg-surface text-fg font-bold text-sm shadow-md inline-flex items-center gap-2 hover:border-gold"
              >
                <MessageSquare className="w-4 h-4 text-gold" />
                <span>تواصل عبر واتساب</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
