/**
 * Flatel Membership (₹777) — benefits and copy.
 *
 * The benefit numbers below are PROPOSED defaults (market-standard for serviced
 * apartments) while the client confirms the real discount %, free-night rule and
 * validity. Change them here only; every page, card and the savings calculator reads
 * from this file. Flip `CONFIRMED_BY_CLIENT` once the client signs off.
 */

export const MEMBERSHIP = {
  /** One-time fee in rupees. */
  price: 777,
  validityMonths: 12,
  /** Discount on the nightly room rate for every direct booking. */
  stayDiscountPercent: 10,
  /** Discount on paid add-on services (meals, transfers, extras). */
  addonDiscountPercent: 10,
  /** After this many paid member nights, the next night is free. */
  freeNightAfter: 10,
  /** Credit for each friend who completes a stay. */
  referralCredit: 500,
  CONFIRMED_BY_CLIENT: false,
} as const;

/** Nightly rates used only to illustrate savings in the calculator. */
export const CALCULATOR_RATES = [
  { id: "1bhk", label: "1 BHK", perNight: 2000 },
  { id: "2bhk", label: "2 BHK", perNight: 2500 },
  { id: "3bhk", label: "3 BHK", perNight: 3000 },
  { id: "4bhk", label: "4 BHK", perNight: 4000 },
] as const;

export type BenefitIcon =
  | "percent"
  | "moon"
  | "clock"
  | "headset"
  | "calendar"
  | "gift"
  | "tag";

export interface MembershipBenefit {
  icon: BenefitIcon;
  title: string;
  body: string;
}

export interface MembershipContent {
  eyebrow: string;
  headlineLead: string;
  headlineAccent: string;
  intro: string;
  priceLabel: string;
  priceNote: string;
  cta: string;
  ctaSecondary: string;
  cardTitle: string;
  cardTier: string;
  cardHolder: string;
  cardValid: string;
  cardId: string;
  benefitsHeading: string;
  benefitsSub: string;
  benefits: MembershipBenefit[];
  calculator: {
    heading: string;
    sub: string;
    flatLabel: string;
    nightsLabel: string;
    nightsUnit: string;
    youSave: string;
    membershipCost: string;
    netBenefit: string;
    /** Contains `{n}`, replaced with the break-even night count (always 2 or more). */
    paysForItself: string;
    notYet: string;
    footnote: string;
  };
  join: {
    heading: string;
    sub: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    consent: string;
    pay: string;
    paying: string;
    secure: string;
    successTitle: string;
    successBody: string;
    memberIdLabel: string;
    copy: string;
    copied: string;
    validUntil: string;
    browse: string;
    cancelled: string;
    gatewayFailed: string;
    generic: string;
    unavailable: string;
    whatsappFallback: string;
  };
  howHeading: string;
  steps: Array<{ title: string; body: string }>;
  faqHeading: string;
  faqs: Array<{ q: string; a: string }>;
  terms: string;
  strip: { title: string; body: string; cta: string };
  whatsappMessage: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const EN: MembershipContent = {
  eyebrow: "Flatel Membership",
  headlineLead: "Stay more.",
  headlineAccent: "Pay less.",
  intro: `One ${inr(MEMBERSHIP.price)} membership for ${MEMBERSHIP.validityMonths} months — ${MEMBERSHIP.stayDiscountPercent}% off every direct booking, a free night on your loyalty run, and priority care from our team. It pays for itself in about ${Math.ceil(MEMBERSHIP.price / (2000 * (MEMBERSHIP.stayDiscountPercent / 100)))} nights.`,
  priceLabel: `${inr(MEMBERSHIP.price)}`,
  priceNote: `one-time · ${MEMBERSHIP.validityMonths} months`,
  cta: "Get my membership",
  ctaSecondary: "See what you save",
  cardTitle: "FLATEL",
  cardTier: "MEMBER",
  cardHolder: "YOUR NAME",
  cardValid: `VALID ${MEMBERSHIP.validityMonths} MONTHS`,
  cardId: "FL · 0777",
  benefitsHeading: "What every member enjoys",
  benefitsSub: "Built for families, medical guests and repeat visitors who stay with us again and again.",
  benefits: [
    {
      icon: "percent",
      title: `${MEMBERSHIP.stayDiscountPercent}% off every stay`,
      body: "Member rate on the nightly price of any flat, on every direct booking for a full year.",
    },
    {
      icon: "moon",
      title: "A free night on us",
      body: `Stay ${MEMBERSHIP.freeNightAfter} paid nights and your next night is complimentary.`,
    },
    {
      icon: "clock",
      title: "Early check-in, late check-out",
      body: "Up to 2 hours of flexibility on arrival and departure, subject to availability.",
    },
    {
      icon: "headset",
      title: "Priority concierge",
      body: "A member-only WhatsApp line for bookings, hospital transfers and last-minute changes.",
    },
    {
      icon: "calendar",
      title: "One free date change",
      body: "Treatment dates shift? Move a confirmed booking once at no charge.",
    },
    {
      icon: "tag",
      title: `${MEMBERSHIP.addonDiscountPercent}% off add-ons`,
      body: "Savings on paid services such as meals, transfers and extras added to your stay.",
    },
    {
      icon: "gift",
      title: "Refer & earn",
      body: `Earn ${inr(MEMBERSHIP.referralCredit)} stay credit for every friend or family who completes a stay.`,
    },
  ],
  calculator: {
    heading: "See how fast it pays back",
    sub: "Pick a flat and the nights you stay in a year.",
    flatLabel: "Flat type",
    nightsLabel: "Nights per year",
    nightsUnit: "nights",
    youSave: "You save on stays",
    membershipCost: "Membership",
    netBenefit: "Net benefit",
    paysForItself: "Membership pays for itself in just {n} nights.",
    notYet: "Stay {n} or more nights a year and the membership pays for itself.",
    footnote: "Illustration at standard nightly rates for stays under 7 nights; excludes extra-guest fees and add-ons. Long-stay discounts are not stacked.",
  },
  join: {
    heading: "Join Flatel Membership",
    sub: "Pay once, get your Member ID instantly, and use it on every direct booking for a year.",
    nameLabel: "Full name",
    emailLabel: "Email",
    phoneLabel: "Mobile number",
    consent: `I understand the ${inr(MEMBERSHIP.price)} fee is non-refundable once my Member ID is issued.`,
    pay: `Pay ${inr(MEMBERSHIP.price)} & get my Member ID`,
    paying: "Opening secure payment…",
    secure: "Secure payment by Razorpay",
    successTitle: "Welcome to Flatel Membership",
    successBody: "Save your Member ID. Enter it at checkout, with the same email or mobile number, to get your member rate.",
    memberIdLabel: "Your Member ID",
    copy: "Copy ID",
    copied: "Copied",
    validUntil: "Valid until",
    browse: "Browse the flats",
    cancelled: "Payment was cancelled. You have not been charged.",
    gatewayFailed: "The secure payment window could not load. You have not been charged. Please try again.",
    generic: "Something went wrong. You have not been charged unless you see a confirmation.",
    unavailable: "Online joining is not open yet. Message us on WhatsApp and we will set you up.",
    whatsappFallback: "Join on WhatsApp",
  },
  howHeading: "How it works",
  steps: [
    { title: "Pay once", body: "Join online in a minute with the one-time fee." },
    { title: "Get your Member ID", body: "Your ID appears instantly and is linked to your email and mobile number." },
    { title: "Book direct, save", body: "Enter your ID at checkout and your member rate is applied." },
  ],
  faqHeading: "Membership questions",
  faqs: [
    {
      q: "Is it a one-time payment?",
      a: `Yes. ${inr(MEMBERSHIP.price)} once, valid for ${MEMBERSHIP.validityMonths} months from the day you join. There is nothing to renew automatically.`,
    },
    {
      q: "Can the whole family use it?",
      a: "The membership is in one guest's name. That member can book for their family and travelling party.",
    },
    {
      q: "Does the discount apply to add-ons and extra guests?",
      a: `The ${MEMBERSHIP.stayDiscountPercent}% member rate applies to the flat's nightly price. Long-stay discounts (7+ nights) are not stacked: you always get whichever is higher. Extra-guest fees are charged at the standard rate.`,
    },
    {
      q: "Is the membership refundable?",
      a: "Membership fees are non-refundable once a member ID is issued. Message us before paying if you have any doubt.",
    },
  ],
  terms: "Benefits apply to direct bookings with Flatel Hospitality and cannot be combined with other offers. Subject to availability.",
  strip: {
    title: `Flatel Membership — ${inr(MEMBERSHIP.price)} for a year`,
    body: `${MEMBERSHIP.stayDiscountPercent}% off every stay, a free night after ${MEMBERSHIP.freeNightAfter}, and priority care.`,
    cta: "Explore membership",
  },
  whatsappMessage: `Hello Flatel Hospitality, I would like to join the Flatel Membership (${inr(MEMBERSHIP.price)}). Please share the next steps.`,
};

const AR: MembershipContent = {
  eyebrow: "عضوية فلاتيل",
  headlineLead: "أقيموا أكثر.",
  headlineAccent: "وادفعوا أقل.",
  intro: `عضوية واحدة بـ ${inr(MEMBERSHIP.price)} لمدة ${MEMBERSHIP.validityMonths} شهراً — خصم ${MEMBERSHIP.stayDiscountPercent}٪ على كل حجز مباشر، وليلة مجانية ضمن برنامج الولاء، وأولوية في الرعاية من فريقنا.`,
  priceLabel: `${inr(MEMBERSHIP.price)}`,
  priceNote: `مرة واحدة · ${MEMBERSHIP.validityMonths} شهراً`,
  cta: "احصل على عضويتي",
  ctaSecondary: "اكتشف كم توفر",
  cardTitle: "FLATEL",
  cardTier: "MEMBER",
  cardHolder: "YOUR NAME",
  cardValid: `VALID ${MEMBERSHIP.validityMonths} MONTHS`,
  cardId: "FL · 0777",
  benefitsHeading: "ما يتمتع به كل عضو",
  benefitsSub: "صُممت للعائلات والضيوف القادمين للعلاج وللزوار المتكررين الذين يعودون إلينا دائماً.",
  benefits: [
    {
      icon: "percent",
      title: `خصم ${MEMBERSHIP.stayDiscountPercent}٪ على كل إقامة`,
      body: "سعر العضو على السعر الليلي لأي شقة، في كل حجز مباشر طوال عام كامل.",
    },
    {
      icon: "moon",
      title: "ليلة مجانية علينا",
      body: `أقم ${MEMBERSHIP.freeNightAfter} ليالٍ مدفوعة وتكون ليلتك التالية مجانية.`,
    },
    {
      icon: "clock",
      title: "تسجيل دخول مبكر ومغادرة متأخرة",
      body: "مرونة تصل إلى ساعتين عند الوصول والمغادرة، حسب التوفر.",
    },
    {
      icon: "headset",
      title: "خدمة كونسيرج ذات أولوية",
      body: "خط واتساب خاص بالأعضاء للحجوزات والتنقل إلى المستشفيات والتغييرات المفاجئة.",
    },
    {
      icon: "calendar",
      title: "تغيير موعد مجاني مرة واحدة",
      body: "تغيّرت مواعيد العلاج؟ انقل حجزك المؤكد مرة واحدة دون رسوم.",
    },
    {
      icon: "tag",
      title: `خصم ${MEMBERSHIP.addonDiscountPercent}٪ على الخدمات الإضافية`,
      body: "وفّر على الخدمات المدفوعة مثل الوجبات والتنقلات والإضافات لإقامتك.",
    },
    {
      icon: "gift",
      title: "ادعُ واكسب",
      body: `احصل على رصيد إقامة بقيمة ${inr(MEMBERSHIP.referralCredit)} عن كل صديق أو قريب يكمل إقامته.`,
    },
  ],
  calculator: {
    heading: "اكتشف مدى سرعة استرداد الرسوم",
    sub: "اختر نوع الشقة وعدد الليالي التي تقيمها في السنة.",
    flatLabel: "نوع الشقة",
    nightsLabel: "عدد الليالي في السنة",
    nightsUnit: "ليالٍ",
    youSave: "توفيرك على الإقامة",
    membershipCost: "العضوية",
    netBenefit: "صافي الفائدة",
    paysForItself: "تسترد العضوية قيمتها خلال {n} ليالٍ فقط.",
    notYet: "أقم {n} ليالٍ أو أكثر في السنة لتسترد العضوية قيمتها.",
    footnote: "توضيح بالأسعار الليلية القياسية للإقامات الأقل من ٧ ليالٍ؛ لا يشمل رسوم الضيوف الإضافيين والخدمات الإضافية. لا تُجمع خصومات الإقامة الطويلة.",
  },
  join: {
    heading: "انضم إلى عضوية فلاتيل",
    sub: "ادفع مرة واحدة واحصل فوراً على رقم عضويتك لتستخدمه في كل حجز مباشر طوال عام.",
    nameLabel: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "رقم الجوال",
    consent: `أدرك أن رسوم ${inr(MEMBERSHIP.price)} غير قابلة للاسترداد بعد إصدار رقم العضوية.`,
    pay: `ادفع ${inr(MEMBERSHIP.price)} واحصل على رقم عضويتي`,
    paying: "جارٍ فتح نافذة الدفع الآمن…",
    secure: "دفع آمن عبر Razorpay",
    successTitle: "أهلاً بك في عضوية فلاتيل",
    successBody: "احتفظ برقم عضويتك. أدخله عند إتمام الحجز مع نفس البريد الإلكتروني أو رقم الجوال لتحصل على سعر العضو.",
    memberIdLabel: "رقم عضويتك",
    copy: "نسخ الرقم",
    copied: "تم النسخ",
    validUntil: "صالحة حتى",
    browse: "تصفح الشقق",
    cancelled: "تم إلغاء الدفع. لم يتم خصم أي مبلغ.",
    gatewayFailed: "تعذر تحميل نافذة الدفع الآمن. لم يتم خصم أي مبلغ. يرجى المحاولة مرة أخرى.",
    generic: "حدث خطأ ما. لم يتم خصم أي مبلغ ما لم تظهر لك رسالة تأكيد.",
    unavailable: "الانضمام عبر الإنترنت غير متاح بعد. راسلنا عبر واتساب وسنقوم بتسجيلك.",
    whatsappFallback: "انضم عبر واتساب",
  },
  howHeading: "كيف تعمل",
  steps: [
    { title: "ادفع مرة واحدة", body: "انضم عبر الإنترنت في دقيقة بدفع الرسوم لمرة واحدة." },
    { title: "احصل على رقم العضوية", body: "يظهر رقمك فوراً ويرتبط ببريدك الإلكتروني ورقم جوالك." },
    { title: "احجز مباشرة ووفّر", body: "أدخل رقم عضويتك عند إتمام الحجز ليُطبَّق سعر العضو." },
  ],
  faqHeading: "أسئلة عن العضوية",
  faqs: [
    {
      q: "هل الدفع لمرة واحدة؟",
      a: `نعم. ${inr(MEMBERSHIP.price)} مرة واحدة، وصالحة لمدة ${MEMBERSHIP.validityMonths} شهراً من يوم الانضمام. لا يوجد تجديد تلقائي.`,
    },
    {
      q: "هل تستفيد العائلة كلها؟",
      a: "العضوية باسم ضيف واحد، ويمكنه الحجز لعائلته ومرافقيه.",
    },
    {
      q: "هل ينطبق الخصم على الإضافات والضيوف الإضافيين؟",
      a: `يُطبَّق خصم ${MEMBERSHIP.stayDiscountPercent}٪ على السعر الليلي للشقة. لا تُجمع خصومات الإقامة الطويلة (٧ ليالٍ فأكثر) مع خصم العضو، فتحصل دائماً على الأعلى منهما. أما رسوم الضيوف الإضافيين فبالسعر القياسي.`,
    },
    {
      q: "هل رسوم العضوية قابلة للاسترداد؟",
      a: "رسوم العضوية غير قابلة للاسترداد بعد إصدار رقم العضوية. راسلنا قبل الدفع إن كان لديك أي استفسار.",
    },
  ],
  terms: "تسري المزايا على الحجوزات المباشرة مع ضيافة فلاتيل ولا تُجمع مع العروض الأخرى، وحسب التوفر.",
  strip: {
    title: `عضوية فلاتيل — ${inr(MEMBERSHIP.price)} لمدة عام`,
    body: `خصم ${MEMBERSHIP.stayDiscountPercent}٪ على كل إقامة، وليلة مجانية بعد ${MEMBERSHIP.freeNightAfter} ليالٍ، وأولوية في الرعاية.`,
    cta: "اكتشف العضوية",
  },
  whatsappMessage: `مرحباً ضيافة فلاتيل، أود الانضمام إلى عضوية فلاتيل (${inr(MEMBERSHIP.price)}). يرجى مشاركة الخطوات التالية.`,
};

export function getMembershipContent(locale: "en" | "ar"): MembershipContent {
  return locale === "ar" ? AR : EN;
}

/** Savings maths shared by the calculator and its tests. */
export function calculateMembershipSavings(perNight: number, nights: number) {
  const stayDiscount = Math.round(perNight * nights * (MEMBERSHIP.stayDiscountPercent / 100));
  const freeNights = Math.floor(nights / (MEMBERSHIP.freeNightAfter + 1));
  const freeNightValue = freeNights * perNight;
  const totalSavings = stayDiscount + freeNightValue;
  const netBenefit = totalSavings - MEMBERSHIP.price;
  const breakEvenNights = Math.ceil(MEMBERSHIP.price / (perNight * (MEMBERSHIP.stayDiscountPercent / 100)));
  return { stayDiscount, freeNights, freeNightValue, totalSavings, netBenefit, breakEvenNights };
}
