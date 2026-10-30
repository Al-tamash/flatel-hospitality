/**
 * Flatel O Signature Membership — two cards (Golden, Platinum): prices, benefits and copy.
 *
 * Prices, discount percentages and perks were supplied by the client. Change them here
 * only; every page, card, email and the booking price read from this file.
 */

export const MEMBERSHIP_NAME = "Flatel O Signature Membership";

export const MEMBERSHIP = {
  validityMonths: 12,
  /** The client supplied the tiers below; flip back to false if they change anything. */
  CONFIRMED_BY_CLIENT: true,
} as const;

export const MEMBERSHIP_TIER_IDS = ["golden", "platinum"] as const;
export type MembershipTierId = (typeof MEMBERSHIP_TIER_IDS)[number];

export interface MembershipTier {
  id: MembershipTierId;
  /** What the guest pays, in rupees. */
  price: number;
  /** The crossed-out "regular" price shown beside it. */
  listPrice: number;
  /** Discount on the nightly room rate for every direct booking. */
  discountPercent: number;
}

export const MEMBERSHIP_TIERS: Record<MembershipTierId, MembershipTier> = {
  golden: { id: "golden", price: 4999, listPrice: 11999, discountPercent: 10 },
  platinum: { id: "platinum", price: 7777, listPrice: 54999, discountPercent: 15 },
};

export function isMembershipTier(value: unknown): value is MembershipTierId {
  return typeof value === "string" && (MEMBERSHIP_TIER_IDS as readonly string[]).includes(value);
}

export function getMembershipTier(id: MembershipTierId): MembershipTier {
  return MEMBERSHIP_TIERS[id];
}

export type BenefitIcon = "percent" | "plane" | "clock" | "gift" | "headset";

export interface MembershipBenefit {
  icon: BenefitIcon;
  title: string;
  body: string;
}

export interface MembershipTierContent {
  /** "Golden Card" */
  name: string;
  tagline: string;
  /** Shown on the physical-style card, e.g. "GOLDEN". */
  cardTier: string;
  cardId: string;
  price: string;
  listPrice: string;
  priceNote: string;
  choose: string;
  benefits: MembershipBenefit[];
}

/** What the card artwork needs. */
export interface MembershipCardContent {
  tier: MembershipTierId;
  cardTitle: string;
  cardTier: string;
  cardHolder: string;
  cardValid: string;
  cardId: string;
  price: string;
}

export interface MembershipContent {
  name: string;
  eyebrow: string;
  headlineLead: string;
  headlineAccent: string;
  intro: string;
  cta: string;
  ctaSecondary: string;
  cardTitle: string;
  cardHolder: string;
  cardValid: string;
  plansHeading: string;
  plansSub: string;
  selected: string;
  tiers: Record<MembershipTierId, MembershipTierContent>;
  join: {
    heading: string;
    sub: string;
    tierLabel: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    /** Contains `{price}`. */
    consent: string;
    /** Contains `{price}`. */
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

const GOLDEN = MEMBERSHIP_TIERS.golden;
const PLATINUM = MEMBERSHIP_TIERS.platinum;

const EN: MembershipContent = {
  name: MEMBERSHIP_NAME,
  eyebrow: MEMBERSHIP_NAME,
  headlineLead: "Stay more.",
  headlineAccent: "Pay less.",
  intro: `Two cards, ${MEMBERSHIP.validityMonths} months. Golden takes ${GOLDEN.discountPercent}% off every Flatel booking and Platinum takes ${PLATINUM.discountPercent}% — both with airport pickup, priority check-in, a welcome kit and dedicated support.`,
  cta: "Choose my card",
  ctaSecondary: "Compare the cards",
  cardTitle: "FLATEL",
  cardHolder: "YOUR NAME",
  cardValid: `VALID ${MEMBERSHIP.validityMonths} MONTHS`,
  plansHeading: "Choose your card",
  plansSub: "Pay once. Every direct Flatel stay for the next year is covered.",
  selected: "Selected",
  tiers: {
    golden: {
      name: "Golden Card",
      tagline: "Everyday savings and a smooth arrival.",
      cardTier: "GOLDEN",
      cardId: "FL · GOLD",
      price: inr(GOLDEN.price),
      listPrice: inr(GOLDEN.listPrice),
      priceNote: `one-time · ${MEMBERSHIP.validityMonths} months`,
      choose: "Choose Golden",
      benefits: [
        {
          icon: "percent",
          title: `${GOLDEN.discountPercent}% off all Flatel bookings`,
          body: "Valid for all accommodation stays.",
        },
        {
          icon: "plane",
          title: "Complimentary airport pickup",
          body: "A stress-free arrival in a five-seater standard car, available up to four times a year, once per quarter. Pickup only.",
        },
        {
          icon: "clock",
          title: "Priority check-in experience",
          body: "Complimentary priority and early check-in, subject to availability.",
        },
        {
          icon: "gift",
          title: "Complimentary welcome kit",
          body: "A special arrival experience featuring premium local treats, including authentic Hyderabadi Osmania biscuits.",
        },
        {
          icon: "headset",
          title: "Dedicated priority customer support",
          body: "Direct and immediate assistance for any service coordination or request.",
        },
      ],
    },
    platinum: {
      name: "Platinum Card",
      tagline: "Our top tier: a bigger discount and door-to-door transfers.",
      cardTier: "PLATINUM",
      cardId: "FL · PLAT",
      price: inr(PLATINUM.price),
      listPrice: inr(PLATINUM.listPrice),
      priceNote: `one-time · ${MEMBERSHIP.validityMonths} months`,
      choose: "Choose Platinum",
      benefits: [
        {
          icon: "percent",
          title: `${PLATINUM.discountPercent}% off all Flatel bookings`,
          body: "Valid for all accommodation stays.",
        },
        {
          icon: "plane",
          title: "Complimentary airport pickup and drop",
          body: "Stress-free arrival and departure in a comfortable seven-seater standard car, available up to four times a year, once per quarter.",
        },
        {
          icon: "clock",
          title: "Priority check-in experience",
          body: "Guaranteed check-in, available up to four times a year, once per quarter.",
        },
        {
          icon: "gift",
          title: "Complimentary welcome kit",
          body: "A special arrival experience featuring premium local treats, including authentic Hyderabadi Osmania biscuits.",
        },
        {
          icon: "headset",
          title: "Dedicated priority customer support",
          body: "Direct and immediate assistance for any service coordination or request.",
        },
      ],
    },
  },
  join: {
    heading: `Join ${MEMBERSHIP_NAME}`,
    sub: "Pay once, get your Member ID instantly, and use it on every direct booking for a year.",
    tierLabel: "Your card",
    nameLabel: "Full name",
    emailLabel: "Email",
    phoneLabel: "Mobile number",
    consent: "I understand the {price} fee is non-refundable once my Member ID is issued.",
    pay: "Pay {price} & get my Member ID",
    paying: "Opening secure payment…",
    secure: "Secure payment by Razorpay",
    successTitle: `Welcome to ${MEMBERSHIP_NAME}`,
    successBody: "Save your Member ID. Enter it at checkout, with the same email or mobile number, to get your member rate. To use your airport transfer, priority check-in or welcome kit, message us on WhatsApp with your Member ID.",
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
    { title: "Pick a card and pay once", body: "Choose Golden or Platinum and join online in a minute." },
    { title: "Get your Member ID", body: "Your ID appears instantly and is linked to your email and mobile number." },
    { title: "Book direct, enjoy the perks", body: "Enter your ID at checkout for your member rate, and message us to arrange pickup or your welcome kit." },
  ],
  faqHeading: "Membership questions",
  faqs: [
    {
      q: "Is it a one-time payment?",
      a: `Yes. The Golden Card is ${inr(GOLDEN.price)} and the Platinum Card is ${inr(PLATINUM.price)}, paid once and valid for ${MEMBERSHIP.validityMonths} months from the day you join. There is nothing to renew automatically.`,
    },
    {
      q: "Can the whole family use it?",
      a: "The membership is in one guest's name. That member can book for their family and travelling party.",
    },
    {
      q: "How does the discount work?",
      a: `Golden takes ${GOLDEN.discountPercent}% and Platinum takes ${PLATINUM.discountPercent}% off the flat's nightly price. Long-stay discounts (7+ nights) are not stacked: you always get whichever is higher. Extra-guest fees are charged at the standard rate.`,
    },
    {
      q: "How do I use the airport transfer, check-in and welcome kit?",
      a: "Message our team on WhatsApp with your Member ID and booking details and we will arrange it. Airport transfers and priority check-in are available up to four times a year, once per quarter.",
    },
    {
      q: "Is the membership refundable?",
      a: "Membership fees are non-refundable once a member ID is issued. Message us before paying if you have any doubt.",
    },
  ],
  terms: "Benefits apply to direct bookings with Flatel Hospitality and cannot be combined with other offers. Subject to availability.",
  strip: {
    title: `${MEMBERSHIP_NAME} — from ${inr(GOLDEN.price)}`,
    body: `Golden ${GOLDEN.discountPercent}% off, Platinum ${PLATINUM.discountPercent}% off every stay, plus airport pickup, priority check-in and a welcome kit.`,
    cta: "Explore membership",
  },
  whatsappMessage: `Hello Flatel Hospitality, I would like to join the ${MEMBERSHIP_NAME}. Please share the next steps.`,
};

const AR: MembershipContent = {
  name: "عضوية فلاتيل أو سيغنتشر",
  eyebrow: "عضوية فلاتيل أو سيغنتشر",
  headlineLead: "أقيموا أكثر.",
  headlineAccent: "وادفعوا أقل.",
  intro: `بطاقتان لمدة ${MEMBERSHIP.validityMonths} شهراً. تمنحك الذهبية خصم ${GOLDEN.discountPercent}٪ والبلاتينية خصم ${PLATINUM.discountPercent}٪ على كل حجز في فلاتيل — مع استقبال من المطار وأولوية في تسجيل الدخول وحقيبة ترحيب ودعم مخصص.`,
  cta: "اختر بطاقتي",
  ctaSecondary: "قارن بين البطاقتين",
  cardTitle: "FLATEL",
  cardHolder: "YOUR NAME",
  cardValid: `VALID ${MEMBERSHIP.validityMonths} MONTHS`,
  plansHeading: "اختر بطاقتك",
  plansSub: "ادفع مرة واحدة وتشمل المزايا كل إقامة مباشرة في فلاتيل طوال العام.",
  selected: "مختارة",
  tiers: {
    golden: {
      name: "البطاقة الذهبية",
      tagline: "توفير يومي ووصول مريح.",
      cardTier: "GOLDEN",
      cardId: "FL · GOLD",
      price: inr(GOLDEN.price),
      listPrice: inr(GOLDEN.listPrice),
      priceNote: `مرة واحدة · ${MEMBERSHIP.validityMonths} شهراً`,
      choose: "اختر الذهبية",
      benefits: [
        {
          icon: "percent",
          title: `خصم ${GOLDEN.discountPercent}٪ على جميع حجوزات فلاتيل`,
          body: "ينطبق على جميع الإقامات.",
        },
        {
          icon: "plane",
          title: "استقبال مجاني من المطار",
          body: "وصول مريح في سيارة قياسية بخمسة مقاعد، حتى أربع مرات في السنة، مرة واحدة كل ربع سنة. الاستقبال فقط.",
        },
        {
          icon: "clock",
          title: "تجربة تسجيل دخول ذات أولوية",
          body: "تسجيل دخول مبكر وذو أولوية مجاناً، حسب التوفر.",
        },
        {
          icon: "gift",
          title: "حقيبة ترحيب مجانية",
          body: "تجربة وصول مميزة تضم حلويات محلية فاخرة، منها بسكويت عثمانية الحيدرآبادي الأصيل.",
        },
        {
          icon: "headset",
          title: "دعم عملاء مخصص وذو أولوية",
          body: "مساعدة مباشرة وفورية لأي تنسيق للخدمات أو أي طلب.",
        },
      ],
    },
    platinum: {
      name: "البطاقة البلاتينية",
      tagline: "أعلى فئاتنا: خصم أكبر ونقل من الباب إلى الباب.",
      cardTier: "PLATINUM",
      cardId: "FL · PLAT",
      price: inr(PLATINUM.price),
      listPrice: inr(PLATINUM.listPrice),
      priceNote: `مرة واحدة · ${MEMBERSHIP.validityMonths} شهراً`,
      choose: "اختر البلاتينية",
      benefits: [
        {
          icon: "percent",
          title: `خصم ${PLATINUM.discountPercent}٪ على جميع حجوزات فلاتيل`,
          body: "ينطبق على جميع الإقامات.",
        },
        {
          icon: "plane",
          title: "استقبال وتوصيل مجاني من وإلى المطار",
          body: "وصول ومغادرة مريحان في سيارة قياسية بسبعة مقاعد، حتى أربع مرات في السنة، مرة واحدة كل ربع سنة.",
        },
        {
          icon: "clock",
          title: "تجربة تسجيل دخول ذات أولوية",
          body: "تسجيل دخول مضمون، حتى أربع مرات في السنة، مرة واحدة كل ربع سنة.",
        },
        {
          icon: "gift",
          title: "حقيبة ترحيب مجانية",
          body: "تجربة وصول مميزة تضم حلويات محلية فاخرة، منها بسكويت عثمانية الحيدرآبادي الأصيل.",
        },
        {
          icon: "headset",
          title: "دعم عملاء مخصص وذو أولوية",
          body: "مساعدة مباشرة وفورية لأي تنسيق للخدمات أو أي طلب.",
        },
      ],
    },
  },
  join: {
    heading: "انضم إلى عضوية فلاتيل أو سيغنتشر",
    sub: "ادفع مرة واحدة واحصل فوراً على رقم عضويتك لتستخدمه في كل حجز مباشر طوال عام.",
    tierLabel: "بطاقتك",
    nameLabel: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "رقم الجوال",
    consent: "أدرك أن رسوم {price} غير قابلة للاسترداد بعد إصدار رقم العضوية.",
    pay: "ادفع {price} واحصل على رقم عضويتي",
    paying: "جارٍ فتح نافذة الدفع الآمن…",
    secure: "دفع آمن عبر Razorpay",
    successTitle: "أهلاً بك في عضوية فلاتيل أو سيغنتشر",
    successBody: "احتفظ برقم عضويتك. أدخله عند إتمام الحجز مع نفس البريد الإلكتروني أو رقم الجوال لتحصل على سعر العضو. ولاستخدام الاستقبال من المطار أو تسجيل الدخول ذي الأولوية أو حقيبة الترحيب، راسلنا عبر واتساب مع رقم عضويتك.",
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
    { title: "اختر بطاقة وادفع مرة واحدة", body: "اختر الذهبية أو البلاتينية وانضم عبر الإنترنت في دقيقة." },
    { title: "احصل على رقم العضوية", body: "يظهر رقمك فوراً ويرتبط ببريدك الإلكتروني ورقم جوالك." },
    { title: "احجز مباشرة واستمتع بالمزايا", body: "أدخل رقم عضويتك عند إتمام الحجز لسعر العضو، وراسلنا لترتيب الاستقبال أو حقيبة الترحيب." },
  ],
  faqHeading: "أسئلة عن العضوية",
  faqs: [
    {
      q: "هل الدفع لمرة واحدة؟",
      a: `نعم. البطاقة الذهبية بـ ${inr(GOLDEN.price)} والبلاتينية بـ ${inr(PLATINUM.price)}، تُدفع مرة واحدة وتصلح لمدة ${MEMBERSHIP.validityMonths} شهراً من يوم الانضمام. لا يوجد تجديد تلقائي.`,
    },
    {
      q: "هل تستفيد العائلة كلها؟",
      a: "العضوية باسم ضيف واحد، ويمكنه الحجز لعائلته ومرافقيه.",
    },
    {
      q: "كيف يعمل الخصم؟",
      a: `تمنح الذهبية خصم ${GOLDEN.discountPercent}٪ والبلاتينية خصم ${PLATINUM.discountPercent}٪ على السعر الليلي للشقة. لا تُجمع خصومات الإقامة الطويلة (٧ ليالٍ فأكثر) مع خصم العضو، فتحصل دائماً على الأعلى منهما. أما رسوم الضيوف الإضافيين فبالسعر القياسي.`,
    },
    {
      q: "كيف أستخدم الاستقبال من المطار وتسجيل الدخول وحقيبة الترحيب؟",
      a: "راسل فريقنا عبر واتساب مع رقم عضويتك وتفاصيل حجزك وسنقوم بالترتيب. الاستقبال من المطار وتسجيل الدخول ذو الأولوية متاحان حتى أربع مرات في السنة، مرة واحدة كل ربع سنة.",
    },
    {
      q: "هل رسوم العضوية قابلة للاسترداد؟",
      a: "رسوم العضوية غير قابلة للاسترداد بعد إصدار رقم العضوية. راسلنا قبل الدفع إن كان لديك أي استفسار.",
    },
  ],
  terms: "تسري المزايا على الحجوزات المباشرة مع ضيافة فلاتيل ولا تُجمع مع العروض الأخرى، وحسب التوفر.",
  strip: {
    title: `عضوية فلاتيل أو سيغنتشر — تبدأ من ${inr(GOLDEN.price)}`,
    body: `خصم ${GOLDEN.discountPercent}٪ للذهبية و${PLATINUM.discountPercent}٪ للبلاتينية على كل إقامة، مع استقبال من المطار وتسجيل دخول ذي أولوية وحقيبة ترحيب.`,
    cta: "اكتشف العضوية",
  },
  whatsappMessage: "مرحباً ضيافة فلاتيل، أود الانضمام إلى عضوية فلاتيل أو سيغنتشر. يرجى مشاركة الخطوات التالية.",
};

export function getMembershipContent(locale: "en" | "ar"): MembershipContent {
  return locale === "ar" ? AR : EN;
}

/** The card artwork for one tier; `holder` and `id` default to the sample values. */
export function getCardContent(
  content: MembershipContent,
  tier: MembershipTierId,
  overrides?: { holder?: string; id?: string }
): MembershipCardContent {
  const tierContent = content.tiers[tier];
  return {
    tier,
    cardTitle: content.cardTitle,
    cardTier: tierContent.cardTier,
    cardHolder: overrides?.holder ?? content.cardHolder,
    cardValid: content.cardValid,
    cardId: overrides?.id ?? tierContent.cardId,
    price: tierContent.price,
  };
}
