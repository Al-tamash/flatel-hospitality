/** Stay purposes and the free / paid services that come with each one. */
import { PURPOSE_PACKAGES, type ComplimentaryService, type FacilityAddon } from "@/lib/mock-rooms";

export const PURPOSE_IDS = ["medical", "wedding", "family", "tourism", "corporate"] as const;
export type PurposeId = (typeof PURPOSE_IDS)[number];

export function isPurposeId(v: string | null | undefined): v is PurposeId {
  return typeof v === "string" && (PURPOSE_IDS as readonly string[]).includes(v);
}

export function getPurposeServices(id: PurposeId): { free: ComplimentaryService[]; paid: FacilityAddon[] } {
  const pkg = PURPOSE_PACKAGES.find((p) => p.id === id);
  return { free: pkg?.complimentaryServices ?? [], paid: pkg?.paidAddons ?? [] };
}

const PURPOSE_LABELS: Record<PurposeId | "accommodation_only", { en: string; ar: string }> = {
  medical: { en: "Medistay — Hospital & Medical", ar: "ميدستاي — رعاية صحية ومستشفيات" },
  wedding: { en: "Wedding Stay — Guests & Events", ar: "إقامة حفلات الزفاف والفعاليات" },
  family: { en: "Family Vacation — Vacation & Long Stay", ar: "إجازات عائلية وإقامة طويلة" },
  tourism: { en: "Wanderer — Heritage & Tourism", ar: "سياحة واستكشاف المعالم" },
  corporate: { en: "Corporate — Business & Executive", ar: "رحلات عمل وتنفيذيون" },
  accommodation_only: { en: "Accommodation only", ar: "إقامة سكنية فقط" },
};

export function getPurposeLabel(id: PurposeId | "accommodation_only", locale: "en" | "ar"): string {
  return PURPOSE_LABELS[id][locale];
}

/** Short chip labels for the purpose picker. */
const PURPOSE_CHIP_LABELS: Record<PurposeId | "accommodation_only", { en: string; ar: string }> = {
  medical: { en: "Medical", ar: "علاج طبي" },
  wedding: { en: "Wedding", ar: "زفاف" },
  family: { en: "Family", ar: "عائلة" },
  tourism: { en: "Tourism", ar: "سياحة" },
  corporate: { en: "Corporate", ar: "عمل" },
  accommodation_only: { en: "Just the stay", ar: "الإقامة فقط" },
};

export function getPurposeChipLabel(id: PurposeId | "accommodation_only", locale: "en" | "ar"): string {
  return PURPOSE_CHIP_LABELS[id][locale];
}

/** Arabic names for complimentary services, keyed by their English name. */
export const ARABIC_COMPLIMENTARY_NAMES: Record<string, string> = {
  "Hospital & Doctor Appointments Assistance": "المساعدة في حجز مواعيد المستشفيات والأطباء",
  "Hospital Travel Distance & Timing Guide": "دليل المسافات وأوقات التنقل إلى المستشفيات",
  "24/7 Ambulance Coordination": "تنسيق خدمة الإسعاف على مدار الساعة",
  "24/7 Guest Assistance Desk": "مكتب مساعدة الضيوف على مدار الساعة",
  "Pharmacy Flatel Delivery": "توصيل الأدوية من الصيدلية",
  "Wheelchair Assistance": "المساعدة بكرسي متحرك",
  "Hospital Bed Setup": "تجهيز سرير طبي",
  "Glucose Stand (IV Stand)": "حامل المحاليل الوريدية",
  "Blood Sugar Machine (Glucometer)": "جهاز قياس السكر",
  "Blood Pressure (BP) Machine": "جهاز قياس ضغط الدم",
  "Pulse Oximeter": "جهاز قياس نسبة الأكسجين",
  "First-Aid Kit": "حقيبة إسعافات أولية",
  "Relaxation Massagers (Leg & Hand Massagers)": "أجهزة تدليك للساقين واليدين",
  "Sanitized Deep Housekeeping": "تنظيف وتعقيم عميق",
  "Detailed Monument Guides & Information (Free)": "أدلة ومعلومات تفصيلية عن المعالم",
  "Customized Itinerary Planning & Route Advice (Free)": "تخطيط برنامج الزيارة ونصائح المسارات",
  "Old City & Charminar Heritage Walking Blueprint": "خريطة جولة سيراً في البلدة القديمة وتشارمينار",
  "24/7 Local Front Desk & Guidance": "مكتب استقبال وإرشاد محلي على مدار الساعة",
  "Luggage Storage Assistance on Arrival / Departure": "حفظ الأمتعة عند الوصول والمغادرة",
  "High-Speed Dedicated Enterprise Wi-Fi": "إنترنت مخصص عالي السرعة",
  "Ergonomic Work Desk & Laptop Table": "مكتب عمل مريح وطاولة للحاسوب",
  "Universal Fast Charger & Multi-Plug Extension": "شاحن سريع ووصلة كهرباء متعددة",
  "Automated GST Invoice / Corporate Tax Receipt": "فاتورة ضريبية رسمية للشركات",
  "Silent Workspace Guarantee": "مساحة عمل هادئة",
  "Wedding Guest Group Check-In & Luggage Coordination": "تسجيل وصول جماعي لضيوف الزفاف وتنسيق الأمتعة",
  "Heavy Garment Steamer & Full Vanity Mirror Setup": "مكواة بخار للملابس ومرآة تجميل كاملة",
  "Equipped Kitchen for Large Family Reheating & Chai": "مطبخ مجهز لتسخين الطعام وإعداد الشاي للعائلات الكبيرة",
  "Housekeeping on Alternate Days": "تنظيف يوماً بعد يوم",
  "24/7 Wedding Logistics & Front Desk Support": "دعم لوجستي للزفاف ومكتب استقبال على مدار الساعة",
  "Infant Baby Cot & High Chair": "سرير رضيع وكرسي أطفال مرتفع",
  "Fully Equipped Modular Kitchen with Gas Stove & Staples": "مطبخ متكامل بموقد غاز ومستلزمات أساسية",
  "Family Indoor Board Games (Carrom, Chess, Snakes & Ladders)": "ألعاب عائلية داخلية (كيرم، شطرنج، السلم والثعبان)",
  "Kids Outdoor Sports Equipment (Badminton, Football)": "أدوات رياضية خارجية للأطفال (ريشة، كرة قدم)",
  "Smart TV with Streaming Apps": "تلفزيون ذكي مع تطبيقات البث",
};
