/**
 * Content for the /stays/[purpose] pages. FAQ answers only restate facts already
 * in BOOKING_POLICY and the purpose packages — no new promises.
 */
import { BOOKING_POLICY } from "@/lib/constants";
import type { FacilityAddon } from "@/lib/mock-rooms";
import type { WeddingServiceItem } from "@/lib/services-catalog";
import type { PurposeId } from "./purpose-services";

export type PurposeExtraBlock = "hospitals" | "heritage" | "wedding" | "family" | "corporate";

export interface PurposePage {
  title: string;
  tagline: string;
  description: string;
  points: string[];
  heroImage: string;
  seo: { title: string; description: string };
  faq: Array<{ q: string; a: string }>;
  extraBlock: PurposeExtraBlock;
}

type Locale = "en" | "ar";

const HERO_IMAGES: Record<PurposeId, string> = {
  medical: "/images/purposes/purpose-medistay.jpg",
  wedding: "/images/purposes/purpose-wedding.jpg",
  family: "/images/purposes/purpose-family.jpg",
  tourism: "/images/purposes/purpose-wanderer.jpg",
  corporate: "/images/purposes/purpose-corporate.jpg",
};

const EXTRA_BLOCKS: Record<PurposeId, PurposeExtraBlock> = {
  medical: "hospitals",
  wedding: "wedding",
  family: "family",
  tourism: "heritage",
  corporate: "corporate",
};

const { DURATION_DISCOUNTS: D } = BOOKING_POLICY;

function commonFaq(locale: Locale): Array<{ q: string; a: string }> {
  if (locale === "ar") {
    return [
      {
        q: "كم أدفع لتأكيد الحجز؟",
        a: `تدفع ${BOOKING_POLICY.ADVANCE_PAYMENT_PERCENTAGE}٪ عبر الإنترنت لتأكيد الحجز، والمبلغ المتبقي ${BOOKING_POLICY.REMAINING_BALANCE_PERCENTAGE}٪ عند تسجيل الوصول نقداً أو عبر UPI.`,
      },
      {
        q: "ما مواعيد تسجيل الوصول والمغادرة؟",
        a: `تسجيل الوصول من ${BOOKING_POLICY.CHECK_IN_WINDOW}، والمغادرة حتى ${BOOKING_POLICY.CHECK_OUT_TIME}.`,
      },
      {
        q: "هل يمكنني إلغاء الحجز؟",
        a: `الإلغاء مجاني حتى ${BOOKING_POLICY.FREE_CANCELLATION_HOURS} ساعة قبل الوصول، وبعدها يصبح العربون غير مسترد.`,
      },
    ];
  }
  return [
    {
      q: "How much do I pay to confirm?",
      a: `You pay ${BOOKING_POLICY.ADVANCE_PAYMENT_PERCENTAGE}% online to confirm the booking and the remaining ${BOOKING_POLICY.REMAINING_BALANCE_PERCENTAGE}% at check-in, by cash or UPI.`,
    },
    {
      q: "What are the check-in and check-out times?",
      a: `Check-in is ${BOOKING_POLICY.CHECK_IN_WINDOW} and check-out is by ${BOOKING_POLICY.CHECK_OUT_TIME}.`,
    },
    {
      q: "Can I cancel?",
      a: `Cancellation is free up to ${BOOKING_POLICY.FREE_CANCELLATION_HOURS} hours before check-in. Within ${BOOKING_POLICY.FREE_CANCELLATION_HOURS} hours the advance is non-refundable. Additional services are non-refundable.`,
    },
  ];
}

const PAGES: Record<PurposeId, Record<Locale, Omit<PurposePage, "heroImage" | "extraBlock" | "faq"> & { faq: { q: string; a: string } }>> = {
  medical: {
    en: {
      title: "Medistay — Hospital & Medical Stays",
      tagline: "Tailored for patient attendants & healthcare visits",
      description:
        "Quiet, hygienic furnished flats for patients and their families, near Hyderabad's major hospitals, with a private kitchen for home-cooked meals.",
      points: [
        "Help booking hospital and doctor appointments",
        "Wheelchair, hospital bed setup, BP and sugar monitors at no extra cost",
        "24/7 ambulance coordination and guest assistance desk",
      ],
      seo: {
        title: "Medical Stay Near Hospitals in Hyderabad | Flatel Medistay",
        description:
          "Furnished flats for patients and attendants near Hyderabad hospitals, with appointment help, medical equipment and 24/7 support.",
      },
      faq: {
        q: "Can you help with hospital appointments and ambulances?",
        a: "Yes. Appointment assistance and 24/7 ambulance coordination are free. If an ambulance is booked, the third-party transport charge is paid by the guest.",
      },
    },
    ar: {
      title: "ميدستاي — إقامة طبية وعلاجية",
      tagline: "مصممة لمرافقي المرضى والزيارات العلاجية",
      description:
        "شقق مفروشة هادئة ونظيفة للمرضى وعائلاتهم بالقرب من كبرى مستشفيات حيدر أباد، مع مطبخ خاص لإعداد الطعام المنزلي.",
      points: [
        "المساعدة في حجز مواعيد المستشفيات والأطباء",
        "كرسي متحرك وسرير طبي وأجهزة قياس الضغط والسكر دون تكلفة إضافية",
        "تنسيق الإسعاف ومكتب مساعدة الضيوف على مدار الساعة",
      ],
      seo: {
        title: "إقامة علاجية قرب المستشفيات في حيدر أباد | فلاتيل ميدستاي",
        description: "شقق مفروشة للمرضى ومرافقيهم قرب مستشفيات حيدر أباد، مع المساعدة في المواعيد والأجهزة الطبية ودعم على مدار الساعة.",
      },
      faq: {
        q: "هل تساعدون في مواعيد المستشفى والإسعاف؟",
        a: "نعم. المساعدة في المواعيد وتنسيق الإسعاف على مدار الساعة مجانيان، أما أجرة نقل الإسعاف من الجهة الخارجية فيدفعها الضيف عند طلبه.",
      },
    },
  },
  wedding: {
    en: {
      title: "Wedding Stays — Guests & Celebrations",
      tagline: "Wedding guest housing, group accommodations & celebrations",
      description:
        "Spacious multi-bedroom flats that keep extended families together, with dressing setups and help arranging the wedding itself.",
      points: [
        "Group check-in and luggage coordination for wedding guests",
        "Garment steamer and full-length vanity mirror in the flat",
        "Optional venue, décor, makeup, photography and car arrangements",
      ],
      seo: {
        title: "Wedding Guest Stays in Hyderabad | Flatel Wedding Stay",
        description:
          "Multi-bedroom furnished flats for wedding families in Hyderabad, with group check-in and optional venue, décor and photography arrangements.",
      },
      faq: {
        q: "Can you help arrange the wedding venue and décor?",
        a: "Yes, as paid add-ons: event venue booking liaison, stage and suite decoration, makeup, photography and wedding cars. You choose them while booking your flat.",
      },
    },
    ar: {
      title: "إقامة حفلات الزفاف — الضيوف والمناسبات",
      tagline: "سكن لضيوف الزفاف وإقامة جماعية للمناسبات",
      description: "شقق واسعة متعددة الغرف تجمع العائلة الممتدة معاً، مع تجهيزات للتزيين ومساعدة في ترتيب حفل الزفاف نفسه.",
      points: [
        "تسجيل وصول جماعي وتنسيق أمتعة ضيوف الزفاف",
        "مكواة بخار للملابس ومرآة كاملة في الشقة",
        "ترتيبات اختيارية للقاعة والديكور والمكياج والتصوير والسيارات",
      ],
      seo: {
        title: "إقامة ضيوف الأعراس في حيدر أباد | فلاتيل",
        description: "شقق مفروشة متعددة الغرف لعائلات الأعراس في حيدر أباد، مع تسجيل وصول جماعي وترتيبات اختيارية للقاعة والديكور والتصوير.",
      },
      faq: {
        q: "هل تساعدون في ترتيب قاعة الزفاف والديكور؟",
        a: "نعم، كخدمات إضافية مدفوعة: التنسيق لحجز القاعة، وتزيين المنصة والجناح، والمكياج، والتصوير، وسيارات الزفاف. تختارها أثناء حجز شقتك.",
      },
    },
  },
  family: {
    en: {
      title: "Family & Long Stays",
      tagline: "Spacious multi-bedroom flats, full kitchens & kids' comforts",
      description:
        "Room for the whole family under one roof, with a full kitchen, housekeeping on alternate days and lower nightly rates the longer you stay.",
      points: [
        "Infant cot, high chair, board games and outdoor sports kit",
        "Fully equipped kitchen with gas stove and staples",
        `Long-stay discounts up to ${D.MONTHLY.discountPercent}%`,
      ],
      seo: {
        title: "Family & Long-Stay Furnished Flats in Hyderabad | Flatel",
        description:
          "Spacious 1–4 BHK furnished flats for families in Hyderabad, with full kitchens, kids' comforts and long-stay discounts.",
      },
      faq: {
        q: "Are there discounts for longer stays?",
        a: `Yes: ${D.WEEKLY.discountPercent}% off for ${D.WEEKLY.minNights}–${D.WEEKLY.maxNights} nights, ${D.BIWEEKLY.discountPercent}% for ${D.BIWEEKLY.minNights}–${D.BIWEEKLY.maxNights} nights and ${D.MONTHLY.discountPercent}% for ${D.MONTHLY.minNights} nights or more.`,
      },
    },
    ar: {
      title: "إقامة عائلية وطويلة",
      tagline: "شقق واسعة متعددة الغرف بمطابخ كاملة ووسائل راحة للأطفال",
      description: "مساحة للعائلة كلها تحت سقف واحد، مع مطبخ متكامل وتنظيف يوماً بعد يوم وأسعار ليلية أقل كلما طالت إقامتك.",
      points: [
        "سرير رضيع وكرسي أطفال وألعاب داخلية وأدوات رياضية",
        "مطبخ متكامل بموقد غاز ومستلزمات أساسية",
        `خصومات للإقامة الطويلة تصل إلى ${D.MONTHLY.discountPercent}٪`,
      ],
      seo: {
        title: "شقق مفروشة للعائلات والإقامة الطويلة في حيدر أباد | فلاتيل",
        description: "شقق مفروشة واسعة من غرفة إلى أربع غرف للعائلات في حيدر أباد، بمطابخ كاملة ووسائل راحة للأطفال وخصومات للإقامة الطويلة.",
      },
      faq: {
        q: "هل توجد خصومات للإقامات الطويلة؟",
        a: `نعم: خصم ${D.WEEKLY.discountPercent}٪ لإقامة ${D.WEEKLY.minNights}–${D.WEEKLY.maxNights} ليلة، و${D.BIWEEKLY.discountPercent}٪ لإقامة ${D.BIWEEKLY.minNights}–${D.BIWEEKLY.maxNights} ليلة، و${D.MONTHLY.discountPercent}٪ لإقامة ${D.MONTHLY.minNights} ليلة أو أكثر.`,
      },
    },
  },
  tourism: {
    en: {
      title: "Heritage & Tourism Stays",
      tagline: "A central base for Old City heritage, shopping & food",
      description:
        "Stay minutes from Charminar, Laad Bazaar and the Old City's palaces, with free itinerary planning and help getting around.",
      points: [
        "Free monument guides and itinerary planning",
        "Old City & Charminar walking route",
        "Luggage storage on arrival and departure",
      ],
      seo: {
        title: "Stays Near Charminar & Old City Hyderabad | Flatel Heritage",
        description:
          "Furnished flats near Charminar and the Old City, with free itinerary planning, walking routes and optional sightseeing cabs.",
      },
      faq: {
        q: "Can you arrange sightseeing?",
        a: "Itinerary planning and monument guides are free. A full-day sightseeing car, airport transfer or expert local guide can be added as paid services.",
      },
    },
    ar: {
      title: "إقامة سياحية وتراثية",
      tagline: "قاعدة مركزية لتراث البلدة القديمة والتسوق والمأكولات",
      description: "أقم على بُعد دقائق من تشارمينار وسوق لاد بازار وقصور البلدة القديمة، مع تخطيط مجاني لبرنامج زيارتك ومساعدة في التنقل.",
      points: ["أدلة مجانية للمعالم وتخطيط برنامج الزيارة", "مسار جولة سيراً في البلدة القديمة وتشارمينار", "حفظ الأمتعة عند الوصول والمغادرة"],
      seo: {
        title: "إقامة قرب تشارمينار والبلدة القديمة في حيدر أباد | فلاتيل",
        description: "شقق مفروشة قرب تشارمينار والبلدة القديمة، مع تخطيط مجاني للزيارة ومسارات للمشي وسيارات اختيارية للجولات.",
      },
      faq: {
        q: "هل تنظمون جولات سياحية؟",
        a: "تخطيط البرنامج وأدلة المعالم مجانية. ويمكن إضافة سيارة لجولة يوم كامل أو توصيل من المطار أو مرشد محلي خبير كخدمات مدفوعة.",
      },
    },
  },
  corporate: {
    en: {
      title: "Corporate & Executive Stays",
      tagline: "Fast Wi-Fi, a proper desk & GST invoices",
      description:
        "A quiet, private flat to work from, with dedicated high-speed Wi-Fi, an ergonomic desk and an automated GST invoice for your company.",
      points: [
        "Dedicated high-speed Wi-Fi and ergonomic work desk",
        "Automated GST invoice / corporate tax receipt",
        "Optional airport chauffeur and same-day laundry",
      ],
      seo: {
        title: "Corporate Furnished Flats in Hyderabad with GST Invoice | Flatel",
        description:
          "Furnished flats for business travellers in Hyderabad, with fast Wi-Fi, a work desk, GST invoices and optional airport transfers.",
      },
      faq: {
        q: "Do you provide a GST invoice?",
        a: "Yes. An automated GST invoice / corporate tax receipt is included free with corporate stays.",
      },
    },
    ar: {
      title: "إقامة رجال الأعمال والشركات",
      tagline: "إنترنت سريع ومكتب عمل مريح وفواتير ضريبية",
      description: "شقة خاصة وهادئة للعمل منها، مع إنترنت مخصص عالي السرعة ومكتب مريح وفاتورة ضريبية رسمية لشركتك.",
      points: ["إنترنت مخصص عالي السرعة ومكتب عمل مريح", "فاتورة ضريبية رسمية للشركات", "توصيل اختياري من المطار وغسيل ملابس في اليوم نفسه"],
      seo: {
        title: "شقق مفروشة لرجال الأعمال في حيدر أباد مع فاتورة ضريبية | فلاتيل",
        description: "شقق مفروشة لمسافري الأعمال في حيدر أباد، مع إنترنت سريع ومكتب عمل وفواتير ضريبية وتوصيل اختياري من المطار.",
      },
      faq: {
        q: "هل تقدمون فاتورة ضريبية (GST)؟",
        a: "نعم. الفاتورة الضريبية الرسمية للشركات مشمولة مجاناً مع إقامات رجال الأعمال.",
      },
    },
  },
};

export function getPurposePage(id: PurposeId, locale: Locale): PurposePage {
  const { faq, ...rest } = PAGES[id][locale];
  return {
    ...rest,
    heroImage: HERO_IMAGES[id],
    extraBlock: EXTRA_BLOCKS[id],
    faq: [faq, ...commonFaq(locale)],
  };
}

export function purposeHref(id: PurposeId, locale: Locale): string {
  return `${locale === "ar" ? "/ar" : ""}/stays/${id}`;
}

/** Wedding and family guests see the largest flats first; other purposes keep the default order. */
export function recommendFlats<T extends { slug: string; maxAdults: number }>(id: PurposeId, rooms: T[]): T[] {
  if (id !== "wedding" && id !== "family") return [...rooms];
  return [...rooms].sort((a, b) => b.maxAdults - a.maxAdults);
}

// Generic words that don't identify a service on their own
const STOP_WORDS = new Set([
  "and", "the", "for", "of", "services", "service", "coordination", "arrangement", "arrangements",
  "assistance", "liaison", "wedding", "delivery",
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")
      .replace(/'s\b/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
  );
}

/** Wedding services minus anything already sold as a paid add-on (two or more shared keywords). */
export function weddingServicesExcludingPaid(
  services: WeddingServiceItem[],
  paid: FacilityAddon[]
): WeddingServiceItem[] {
  const paidKeywords = paid.map((addon) => keywords(addon.name));
  return services.filter((service) => {
    const words = keywords(service.title);
    return !paidKeywords.some((addonWords) => [...words].filter((w) => addonWords.has(w)).length >= 2);
  });
}

/** Arabic names for wedding services that are not sold as paid add-ons. */
export const WEDDING_SERVICE_NAMES_AR: Record<string, string> = {
  "wed-05": "تنسيق أحذية العروس والعريس",
  "wed-06": "ترتيب مأذون شرعي معتمد لعقد النكاح",
  "wed-07": "خدمات الطهي وإدارة المطبخ للحفل",
  "wed-08": "إدارة العمليات والإشراف على الضيافة في موقع الحفل",
  "wed-12": "تزيين سيارة الزفاف",
  "wed-14": "تجهيز العريس وخدمات العناية",
  "wed-16": "فريق استقبال مخصص في موقع الحفل",
  "wed-17": "تغليف جهاز العروس وهدايا الضيوف",
};
