/**
 * Mission, vision and founder copy, transcribed from the client's screenshots
 * (docs/superpowers/specs/assets/2026-10-28/ref-mission-vision.jpg, ref-founder.jpg).
 */

export interface AboutContent {
  pill: string;
  headlineLead: string;
  headlineAccent: string;
  mission: string;
  visionLabel: string;
  vision: string;
  values: Array<{ title: string; body: string }>;
  founder: { eyebrow: string; name: string; role: string; bio: string; email: string };
  companyLine: string;
  companySub: string;
  strip: { mission: string; cta: string };
}

/** Set to the photo path once the client sends the founder's portrait. */
export const FOUNDER_PHOTO: string | null = null;

const FOUNDER_EMAIL = "hello@flatel.in"; // pending client confirmation

const EN: AboutContent = {
  pill: "Our mission & vision",
  headlineLead: "A stay experience",
  headlineAccent: "redefined.",
  mission:
    "Our mission at Flatel is to build Hyderabad's most trusted network of 1,000 premium furnished flats, where the comfort of a flat meets the service of a hotel. We are committed to delivering exceptional hospitality, modern amenities, and thoughtful guest support for leisure travellers, business travellers, families, and medical guests.",
  visionLabel: "Vision",
  vision:
    "Our vision is to redefine the stay experience by combining comfort, convenience, care, and trusted service under one premium brand.",
  values: [
    {
      title: "Guest-first hospitality",
      body: "Warm, thoughtful service for every traveller — leisure, business, family or medical.",
    },
    {
      title: "Curated comfort",
      body: "Premium furnishings, modern appliances and design details that feel like home.",
    },
    {
      title: "Trusted service",
      body: "Verified properties, transparent pricing and 24×7 support you can rely on.",
    },
  ],
  founder: {
    eyebrow: "Meet our founder",
    name: "Osama",
    role: "Founder & Managing Director",
    bio: "Founder of Flatel Hospitality Private Limited — building Hyderabad's most trusted network of premium furnished flats that combine the comfort of a home with the service of a hotel.",
    email: FOUNDER_EMAIL,
  },
  companyLine: "Flatel Hospitality Private Limited",
  companySub: "A company registered under the Government of India",
  strip: {
    mission: "Building Hyderabad's most trusted network of premium furnished flats — the comfort of a flat, the service of a hotel.",
    cta: "Read our story",
  },
};

const AR: AboutContent = {
  pill: "رسالتنا ورؤيتنا",
  headlineLead: "تجربة إقامة",
  headlineAccent: "بمفهوم جديد.",
  mission:
    "رسالتنا في فلاتيل هي بناء أكثر شبكات الشقق المفروشة الفاخرة ثقةً في حيدر أباد، تضم ١٬٠٠٠ شقة تجمع بين راحة الشقة وخدمة الفندق. نلتزم بتقديم ضيافة استثنائية ومرافق حديثة ودعم مدروس لضيوفنا من المسافرين للترفيه ورجال الأعمال والعائلات وضيوف العلاج.",
  visionLabel: "الرؤية",
  vision: "رؤيتنا أن نعيد تعريف تجربة الإقامة بالجمع بين الراحة والسهولة والعناية والخدمة الموثوقة تحت علامة فاخرة واحدة.",
  values: [
    {
      title: "الضيف أولاً",
      body: "خدمة دافئة ومدروسة لكل مسافر — للترفيه أو العمل أو العائلة أو العلاج.",
    },
    {
      title: "راحة منتقاة بعناية",
      body: "أثاث فاخر وأجهزة حديثة وتفاصيل تصميم تشعرك وكأنك في بيتك.",
    },
    {
      title: "خدمة موثوقة",
      body: "عقارات موثّقة وأسعار واضحة ودعم على مدار الساعة يمكنك الاعتماد عليه.",
    },
  ],
  founder: {
    eyebrow: "تعرّف على المؤسس",
    name: "أسامة",
    role: "المؤسس والعضو المنتدب",
    bio: "مؤسس شركة فلاتيل للضيافة الخاصة المحدودة — يبني أكثر شبكات الشقق المفروشة الفاخرة ثقةً في حيدر أباد، حيث تلتقي راحة المنزل بخدمة الفندق.",
    email: FOUNDER_EMAIL,
  },
  companyLine: "فلاتيل للضيافة الخاصة المحدودة",
  companySub: "شركة مسجلة لدى حكومة الهند",
  strip: {
    mission: "نبني أكثر شبكات الشقق المفروشة الفاخرة ثقةً في حيدر أباد — راحة الشقة وخدمة الفندق.",
    cta: "اقرأ قصتنا",
  },
};

export function getAboutContent(locale: "en" | "ar"): AboutContent {
  return locale === "ar" ? AR : EN;
}
