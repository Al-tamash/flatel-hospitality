"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
}

const FAQS: FAQItem[] = [
  {
    id: "deposit-split",
    question: "How does the 20% advance deposit and payment split work?",
    questionAr: "كيف يتم سداد عربون الـ ٢٠٪ وتقسيم الدفع؟",
    answer:
      "A 20% advance on the stay, paid through Razorpay, confirms your reservation. Any additional services you select are paid in full at the time of booking. The remaining 80% of the stay is paid at the property desk on arrival. After payment is confirmed, you can view your booking confirmation and voucher.",
    answerAr:
      "يتم سداد عربون ٢٠٪ من قيمة الإقامة عبر وسائل الدفع الإلكتروني لتأكيد وحجز تواريخ إقامتك رسمياً، وتُسدد الخدمات الإضافية المختارة كاملة وقت الحجز. ويُسدد المتبقي ٨٠٪ من الإقامة عند وصولك واستلام الشقة في مكتب الاستقبال. بعد تأكيد الدفع، يمكنك فوراً استعراض سند الحجز المعتمد وقسيمة الإقامة.",
  },
  {
    id: "cancellation-policy",
    question: "What is your cancellation and refund policy?",
    questionAr: "ما هي سياسة الإلغاء واسترداد الأموال المتبعة؟",
    answer:
      "We offer 100% Free Cancellation with a full refund of your 20% advance deposit if cancelled 48 hours or more prior to your scheduled check-in time. Cancellations made within 48 hours of check-in forfeit the 20% deposit, which acts as a reservation hold fee. Additional services are paid in full at booking and are non-refundable.",
    answerAr:
      "نوفر ميزة الإلغاء المجاني ١٠٠٪ مع استرداد كامل لمبلغ العربون المدفوع (٢٠٪) في حال الإلغاء قبل ٤٨ ساعة أو أكثر من موعد تسجيل الدخول المحدد. أما الإلغاء خلال أقل من ٤٨ ساعة فيتم فيه احتساب العربون كرسوم حجز لضمان عدم حجز الشقة لغيركم. وتُدفع الخدمات الإضافية كاملة وقت الحجز وهي غير قابلة للاسترداد.",
  },
  {
    id: "kitchen-utilities",
    question: "Are cooking gas, utilities, and kitchen staples included?",
    questionAr: "هل الغاز الطبيعي، الفواتير، ومستلزمات الطبخ مشمولة مجاناً؟",
    answer:
      "Yes, completely included with zero surcharges! Every flat includes a private modular kitchen with a multi-burner gas stove (piped gas included), double-door refrigerator, RO drinking water purifier, microwave oven, electric kettle, cookware, and starter kitchen staples (tea leaves, sugar, salt, chili powder, and turmeric).",
    answerAr:
      "نعم، مشمولة بالكامل دون أي رسوم إضافية! تحتوي كل شقة على مطبخ مستقل مجهز بموقد غاز متصل بالشبكة، ثلاجة كبيرة ببابين، فلتر تنقية مياه شرب (RO)، فرن ميكروويف، غلاية كهربائية، أواني طهي كاملة، ومستلزمات ضيافة أولية مجانية تشمل الشاي والسكر والملح والتوابل الأساسية.",
  },
  {
    id: "housekeeping-schedule",
    question: "How does the housekeeping schedule work?",
    questionAr: "كيف تعمل خدمة النظافة والتطهير الدورية؟",
    answer:
      "Complimentary professional housekeeping is provided on alternate days across all reservations (daily stays, 15-day stays, and monthly stays). This includes floor sanitation, dusting, trash clearance, and linen refreshes.",
    answerAr:
      "تُقدم خدمة تنظيف وتطهير فندقية مجانية مجدولة يوماً بعد يوم لكافة الحجوزات (اليومية، ١٥ يوماً، والشهرية). تشمل تعقيم الأرضيات، إزالة الغبار، التخلص من النفايات، وتغيير أغطية الأسرة والشراشف بانتظام.",
  },
  {
    id: "duration-discounts",
    question: "Do you offer automatic discounts for weekly or monthly stays?",
    questionAr: "هل توجد خصومات تلقائية للإقامات الأسبوعية والشهرية؟",
    answer:
      "Yes! Our booking engine automatically applies discounts to your base room rent: 10% discount for weekly stays (7 to 14 nights), 15% discount for 15 to 27 nights, and 25% discount for monthly stays (28+ nights). The discount is calculated in real time during checkout.",
    answerAr:
      "نعم! يحتسب نظام الحجز لدينا خصماً تلقائياً على السعر الأساسي: خصم ١٠٪ للإقامات الأسبوعية (من ٧ إلى ١٤ ليلة)، خصم ١٥٪ للإقامات من ١٥ إلى ٢٧ ليلة، وخصم ٢٥٪ للإقامات الشهرية (٢٨ ليلة فأكثر)، وتظهر الخصومات فوراً أثناء الحجز والدفع.",
  },
  {
    id: "checkin-timings",
    question: "What are the standard check-in and check-out timings?",
    questionAr: "ما هي المواعيد الرسمية لتسجيل الوصول والمغادرة؟",
    answer:
      "Standard check-in is between 11:00 AM and 1:00 PM, and check-out is at 11:00 AM. Ask the front desk about priority check-in, which is subject to availability.",
    answerAr:
      "تسجيل الوصول القياسي بين الساعة ١١:٠٠ صباحاً و١:٠٠ ظهراً، وتسجيل المغادرة عند الساعة ١١:٠٠ صباحاً. يمكنكم التنسيق المسبق مع مكتب الاستقبال بخصوص الدخول المبكر أو المغادرة المتأخرة حسب التوفر وإمكانية الشقق.",
  },
  {
    id: "id-requirements",
    question: "What guest identification documents are required at check-in?",
    questionAr: "ما هي وثائق إثبات الهوية المطلوبة عند تسجيل الدخول؟",
    answer:
      "By law, valid identification is mandatory for all adult guests: Domestic Indian guests must present one original government photo ID per adult (Driver's License, Voter ID, Passport, or Aadhaar). International travelers must present their original valid physical Passport at check-in.",
    answerAr:
      "وفقاً للأنظمة الرسمية، يشترط تقديم إثبات هوية سارٍ لجميع الضيوف البالغين: يطلب من الضيوف القادمين من داخل الهند تقديم بطاقة هوية حكومية أصلية لكل بالغ. وللضيوف والمسافرين الدوليين، يجب تقديم أصل جواز السفر الفعلي ساري المفعول عند الاستقبال.",
  },
  {
    id: "kids-policy",
    question: "Are children allowed, and what is the policy for kids?",
    questionAr: "هل يُسمح باصطحاب الأطفال، وما هي سياستهم؟",
    answer:
      "Each flat includes children up to its base allowance (1 BHK 1, 2 BHK 2, 3 BHK 3, 4 BHK 4). Every additional child (aged 0–12) is ₹300 per child per night, and extra adults beyond the base bedroom capacity are ₹500 per person per night. All guests count toward the unit's safety capacity. Complimentary infant baby cots are available upon request.",
    answerAr:
      "تشمل كل شقة عدداً من الأطفال ضمن السعر الأساسي (غرفة وصالة: طفل، غرفتان: طفلان، ٣ غرف: ٣ أطفال، ٤ غرف: ٤ أطفال). ويُحتسب على كل طفل إضافي (٠–١٢ سنة) ٣٠٠ روبية في الليلة، وعلى كل بالغ إضافي بعد السعة الأساسية ٥٠٠ روبية في الليلة. ويُحتسب جميع النزلاء ضمن الطاقة الاستيعابية لأمان الشقة. كما تتوفر أسرّة مخصصة للأطفال الرضع مجاناً عند الطلب.",
  },
  {
    id: "medistay-support",
    question: "What medical support is provided under Medistay?",
    questionAr: "ما هي خدمات الدعم والرعاية المقدمة لضيوف السياحة العلاجية؟",
    answer:
      "For medical guests visiting Apollo, Yashoda, KIMS, Owaisi, or nearby hospitals, Flatel provides: complimentary 24/7 ambulance coordination, hospital timing guides, wheelchair support, and in-flat setup of hospital beds, IV stands, glucometers, BP monitors, and pulse oximeters at no extra cost.",
    answerAr:
      "لضيوفنا القادمين للعلاج في مستشفيات أبولو، ياشودا، كيمز، أويسي، أو المستشفيات المحيطة، توفر فلاتيل: تنسيق مجاني للإسعاف على مدار الساعة، إرشادات مواعيد المستشفيات، كراسي متحركة، وتجهيز أسرة طبية وحوامل محاليل وأجهزة قياس الضغط والسكر والأكسجين داخل الشقة مجاناً.",
  },
  {
    id: "locations",
    question: "Where are the Flatel properties located in Hyderabad?",
    questionAr: "أين تقع فروع وشقق فلاتيل في حيدر أباد؟",
    answer:
      "We operate two prime flagship branches: Barkas Salala (near Rajiv Gandhi International Airport, Chandrayangutta, and Owaisi Hospital) and Moghal Pura (in the historic heart of Hyderabad, near Charminar and Princess Esra Hospital). Both feature dedicated on-site reception desks.",
    answerAr:
      "ندير فرعين رئيسيين استراتيجيين: فرع باركاس سلالة (بالقرب من مطار راجيف غاندي الدولي، شاندريانجونا، ومستشفى أويسي) وفرع مغل بورا (في قلب حيدر أباد التراثي بالقرب من تشارمينار ومستشفى برنسيس إسراء). ويحتوي كلا الفرعين على مكاتب استقبال مخصصة لخدمتكم.",
  },
];

interface FaqSectionProps {
  className?: string;
}

export function FaqSection({ className }: FaqSectionProps) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const localePrefix = isAr ? "/ar" : "";

  const [expandedId, setExpandedId] = React.useState<string | null>("deposit-split");
  const [showAll, setShowAll] = React.useState<boolean>(false);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const visibleFaqs = showAll ? FAQS : FAQS.slice(0, 4);

  return (
    <section
      id="faq"
      className={cn(
        "scroll-mt-20 relative w-full bg-canvas text-fg py-14 sm:py-18 lg:py-20 select-none overflow-hidden",
        className
      )}
      aria-labelledby="faq-heading"
    >
      <div id="policies" className="sr-only" aria-hidden="true" />

      {/* Luxury Subtle Radial Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold)_10%,transparent)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container-page relative z-10">
        <div>
          {/* ========================================================== */}
          {/* 1. SECTION HEADER                                          */}
          {/* ========================================================== */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm font-sans font-semibold tracking-[0.14em] text-gold uppercase mb-2 sm:mb-3">
              {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </p>

            <h2
              id="faq-heading"
              className="font-heading text-fg heading-section"
            >
              {isAr ? (
                <>
                  الأسئلة <span className="text-gold">الأكثر تكراراً</span>
                </>
              ) : (
                <>
                  Commonly Asked <span className="text-gold">Questions</span>
                </>
              )}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-fg-soft font-sans font-normal max-w-lg mx-auto leading-relaxed">
              {isAr
                ? "كل ما تود معرفته عن عربون الـ ٢٠٪، مواعيد الوصول، المطابخ الخاصة، والسياسات."
                : "Everything you need to know about our 20% deposit, check-in, private kitchens, and policies."}
            </p>
          </div>

          {/* ========================================================== */}
          {/* 2. MINIMAL LINED FAQ LIST                                  */}
          {/* ========================================================== */}
          <div className="border-t border-line-soft divide-y divide-line-soft">
            {visibleFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              const question = isAr ? faq.questionAr : faq.question;
              const answer = isAr ? faq.answerAr : faq.answer;

              return (
                <div key={faq.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isExpanded}
                    className={cn(
                      "w-full py-4 sm:py-4.5 flex items-center gap-3.5 sm:gap-4 cursor-pointer group focus:outline-none min-h-[48px]",
                      isAr ? "justify-start text-right" : "justify-start text-left"
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gold transition-transform duration-300 shrink-0",
                        isExpanded ? "rotate-180 text-fg" : "rotate-0 text-gold/70 group-hover:text-gold"
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "font-sans font-semibold text-base sm:text-lg transition-colors leading-snug flex-1",
                        isExpanded
                          ? "text-gold"
                          : "text-fg group-hover:text-gold"
                      )}
                    >
                      {question}
                    </span>
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300",
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                    aria-hidden={!isExpanded}
                    inert={!isExpanded}
                  >
                    <div className="overflow-hidden">
                      <div className={cn(
                        "pb-4 sm:pb-5 text-sm sm:text-base text-fg-soft font-sans leading-relaxed",
                        isAr ? "pr-8 sm:pr-9 pl-2 text-right" : "pl-8 sm:pl-9 pr-2 text-left"
                      )}>
                        <p className="max-w-3xl">{answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progressive Disclosure Toggle Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="px-5 py-2.5 rounded-xl bg-raised/85 border border-line hover:border-gold text-gold text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>
                {showAll
                  ? (isAr ? "عرض أهم ٤ أسئلة" : "Show Top 4 Questions")
                  : (isAr ? "عرض كافة الأسئلة الـ ١٠ (+٦ إضافية)" : "Show All 10 Questions (+6 More)")}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAll ? "rotate-180" : "rotate-0")} />
            </button>
          </div>

          {/* In-Line Policy Internal Link */}
          <div className="mt-8 pt-5 border-t border-line-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-fg-soft">
            <span>
              {isAr
                ? "هل تحتاج لمعرفة المزيد عن شروط إثبات الهوية، مواعيد الخروج، أو قواعد الإقامة؟"
                : "Need full details on mandatory ID verification, checkout times, or house rules?"}
            </span>
            <Link
              href={`${localePrefix}/policies`}
              className="text-gold font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>{isAr ? "اقرأ سياسات النزلاء الكاملة" : "Read Complete Guest Policies"}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
