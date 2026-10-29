import { RoomDetail, Amenity, RoomSpec } from "../mock-rooms";
import { Locale } from "./types";

interface ArabicRoomContent {
  title: string;
  shortDescription: string;
  fullDescription?: string;
  capacityLabel: string;
  specs: RoomSpec;
}

const ARABIC_ROOM_DATA: Record<string, ArabicRoomContent> = {
  "1bhk": {
    title: "جناح ديلوكس غرفة وصالة (1 BHK)",
    shortDescription:
      "شقة فندقية هادئة وأنيقة في مغل بورا بالقرب من تشارمينار، تشمل سرير ملكي كينج، صالة جلوس مع شاشة ذكية، مطبخ مجهز، وسخان مياه ساخن على مدار الساعة.",
    capacityLabel: "شخصان بالغان (+٢ مسموح بهما إضافياً) · طفل واحد مشمول، والإضافي ₹٣٠٠ لليلة",
    specs: {
      guests: "شخصان بالغان (+٢ مسموح بهما إضافياً)",
      bedrooms: "غرفة نوم رئيسية بسرير كينج",
      kitchen: "مطبخ تحضيري متكامل",
      bathroom: "دورة مياه خاصة فاخرة",
    },
  },
  "2bhk": {
    title: "شقة عائلية فاخرة غرفتان وصالة (2 BHK)",
    shortDescription:
      "إقامة عائلية حديثة وفسيحة في مغل بورا مع غرفتي نوم مستقلتين، صالة جلوس مخملية واسعة، مطبخ مجهز متكامل، وإطلالات بانورامية على مدينة حيدر أباد.",
    capacityLabel: "٤ أشخاص بالغين (+٢ مسموح بهما إضافياً) · طفلان مشمولان، والإضافي ₹٣٠٠ لليلة",
    specs: {
      guests: "٤ أشخاص بالغين (+٢ مسموح بهما إضافياً)",
      bedrooms: "غرفتان نوم مستقلتان",
      kitchen: "مطبخ متكامل مجهز بالكامل",
      bathroom: "دورتان مياه مجهزتان",
    },
  },
  "3bhk": {
    title: "إقامة عائلية راقية ٣ غرف وصالة (3 BHK)",
    shortDescription:
      "شقة عائلية فسيحة جداً في باركاس سلالة مع صالة جلوس وطعام رحبة، شرفة ذات إطلالة رائعة، مطبخ متكامل، وموقع استراتيجي بالقرب من طريق المطار والمستشفيات الرئيسية.",
    capacityLabel: "٦ أشخاص بالغين (+٣ مسموح بهم إضافياً) · ٣ أطفال مشمولون، والإضافي ₹٣٠٠ لليلة",
    specs: {
      guests: "٦ أشخاص بالغين (+٣ مسموح بهم إضافياً)",
      bedrooms: "٣ غرف نوم فسيحة",
      kitchen: "مطبخ عائلي كبير ومجهز بالكامل",
      bathroom: "٣ دورات مياه مجهزة",
    },
  },
  "4bhk": {
    title: "بنتهاوس ملكي فسيح ٤ غرف وصالة (4 BHK)",
    shortDescription:
      "شقة فاخرة للغاية للمجموعات والعائلات الكبيرة في مغل بورا، توفر ٤ غرف نوم مستقلة، صالون استقبال فخم، ومطبخاً عائلياً كاملاً مع كافة التجهيزات الفندقية.",
    capacityLabel: "٨ أشخاص بالغين (+٤ مسموح بهم إضافياً) · ٤ أطفال مشمولون، والإضافي ₹٣٠٠ لليلة",
    specs: {
      guests: "٨ أشخاص بالغين (+٤ مسموح بهم إضافياً)",
      bedrooms: "٤ غرف نوم مستقلة",
      kitchen: "مطبخ رئيسي متكامل للمناسبات والعائلات",
      bathroom: "٤ دورات مياه فاخرة",
    },
  },
};

const ARABIC_AMENITIES: Record<string, { name: string; description?: string }> = {
  "High-Speed Wi-Fi": {
    name: "إنترنت واي فاي فائق السرعة",
    description: "ألياف بصرية مخصصة 50+ ميغابت",
  },
  "Modular Kitchen": {
    name: "مطبخ مجهز بالكامل",
    description: "موقد غاز، ثلاجة، أواني طهي، وفلتر مياه نقي",
  },
  "Hot Water Geyser": {
    name: "سخان مياه ساخن فوري",
    description: "مياه دافئة متواصلة على مدار الساعة",
  },
  "Smart Android TV": {
    name: "شاشة تلفزيون ذكية",
    description: "دقة عالية مع تطبيقات المشاهدة الرقمية",
  },
  Refrigerator: {
    name: "ثلاجة ومجمد واسع",
    description: "ثلاجة ببابين مع فريزر لحفظ الأطعمة",
  },
  "Passenger Elevator": {
    name: "مصعد كهربائي مريح",
    description: "وصول مباشر وسهل للطابق بدون عوائق",
  },
  "24/7 Water Supply": {
    name: "إمداد مياه نقي ومستمر",
    description: "مياه نقية صالحة للشرب ومياه للاستخدام المستمر",
  },
  "Power Backup": {
    name: "مولد كهرباء احتياطي",
    description: "إنارة ومراوح تعمل دون انقطاع عبر الانفرتر",
  },
};

export function getLocalizedRoom(room: RoomDetail, locale: Locale): RoomDetail {
  if (locale !== "ar") {
    return room;
  }

  const arContent = ARABIC_ROOM_DATA[room.slug] || ARABIC_ROOM_DATA[room.id];

  const localizedAmenities: Amenity[] = room.amenities.map((amenity) => {
    const arAmenity = ARABIC_AMENITIES[amenity.name];
    if (arAmenity) {
      return {
        ...amenity,
        name: arAmenity.name,
        description: arAmenity.description || amenity.description,
      };
    }
    return amenity;
  });

  return {
    ...room,
    title: arContent?.title || room.title,
    shortDescription: arContent?.shortDescription || room.shortDescription,
    fullDescription: arContent?.fullDescription || room.fullDescription,
    capacityLabel: arContent?.capacityLabel || room.capacityLabel,
    specs: arContent?.specs || room.specs,
    amenities: localizedAmenities,
  };
}

export function getLocalizedRooms(rooms: RoomDetail[], locale: Locale): RoomDetail[] {
  return rooms.map((room) => getLocalizedRoom(room, locale));
}
