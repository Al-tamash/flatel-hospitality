/**
 * Flatel map data: branch pins and nearby places (hospitals, heritage & shopping).
 *
 * Place coordinates were looked up from OpenStreetMap Nominatim on 2026-10-28.
 * Every entry is `verified: false` until the Flatel team confirms it on the ground.
 */
import { BRANCH_PROFILES } from "@/lib/branch-data";
import type { LatLng } from "./geo";

export type PlaceCategory = "hospital" | "heritage";

export interface MapPlace {
  id: string;
  name: string;
  nameAr: string;
  category: PlaceCategory;
  coordinates: LatLng;
  verified: boolean;
  source: string;
}

const BRANCH_NAMES_AR: Record<string, string> = {
  "moghal-pura": "مغل بورا",
  "barkas-salala": "باركاس صلالة",
};

export const BRANCH_PINS: Array<{ slug: string; name: string; nameAr: string; coordinates: LatLng }> =
  Object.values(BRANCH_PROFILES).map((b) => ({
    slug: b.slug,
    name: b.name,
    nameAr: BRANCH_NAMES_AR[b.slug] ?? b.name,
    coordinates: b.coordinates,
  }));

export const MAP_PLACES: MapPlace[] = [
  // Hospitals
  {
    id: "princess-esra",
    name: "Princess Esra Hospital",
    nameAr: "مستشفى برنسيس إسراء",
    category: "hospital",
    coordinates: [17.3564481, 78.4741711],
    verified: false,
    source: "Nominatim: Princess Esra Hospital, Charminar Road, Panjeshah, Moghalpura",
  },
  {
    id: "princess-durru-shehvar",
    name: "Princess Durru Shehvar Children's & General Hospital",
    nameAr: "مستشفى برنسيس در الشهوار",
    category: "hospital",
    coordinates: [17.367312, 78.4826575],
    verified: false,
    source: "Nominatim: Princess Durru Shehvar Children's And General Hospital, Purani Haveli Road",
  },
  {
    id: "owaisi",
    name: "Owaisi Hospital & Research Centre",
    nameAr: "مستشفى ومركز أبحاث أويسي",
    category: "hospital",
    coordinates: [17.340848, 78.5067444],
    verified: false,
    source: "Nominatim: Owaisi Hospital and Research Centre, Kanchanbagh",
  },
  {
    id: "apollo-drdo",
    name: "Apollo DRDO Hospital",
    nameAr: "مستشفى أبولو DRDO",
    category: "hospital",
    coordinates: [17.3421825, 78.5073095],
    verified: false,
    source: "Nominatim: Apollo DRDO Hospital, Inner Ring Road, Kanchanbagh",
  },
  {
    id: "aware-global",
    name: "Aware Global Hospital",
    nameAr: "مستشفى أوير غلوبال",
    category: "hospital",
    coordinates: [17.345958, 78.5399126],
    verified: false,
    source: "Nominatim: Aware Gleneagles Global Hospital, Road No 4, LB Nagar",
  },
  {
    id: "yashoda",
    name: "Yashoda Hospitals",
    nameAr: "مستشفيات ياشودا",
    category: "hospital",
    coordinates: [17.4245627, 78.4569401],
    verified: false,
    source: "Nominatim: Yashoda Hospital, Raj Bhavan Road, Khairatabad",
  },
  {
    id: "virinchi",
    name: "Virinchi Hospitals",
    nameAr: "مستشفيات فيرينتشي",
    category: "hospital",
    coordinates: [17.4080948, 78.4514943],
    verified: false,
    source: "Nominatim: Virinchi Hospitals, Road Number 1, Masab Tank",
  },
  {
    id: "gandhi",
    name: "Gandhi Hospital",
    nameAr: "مستشفى غاندي",
    category: "hospital",
    coordinates: [17.4231228, 78.5034539],
    verified: false,
    source: "Nominatim: Gandhi Hospital, Boyiguda Road, Musheerabad",
  },
  {
    id: "kims",
    name: "KIMS Hospitals",
    nameAr: "مستشفيات كيمز (KIMS)",
    category: "hospital",
    coordinates: [17.4372705, 78.4826822],
    verified: false,
    source: "Nominatim: KIMS Hospital, Minister's Road, Secunderabad",
  },
  {
    id: "apollo-jubilee-hills",
    name: "Apollo Hospitals, Jubilee Hills",
    nameAr: "مستشفيات أبولو، جوبيلي هيلز",
    category: "hospital",
    coordinates: [17.4149358, 78.4131784],
    verified: false,
    source: "Nominatim: Apollo Hospitals, Road Number 3, Film Nagar, Jubilee Hills",
  },
  // Heritage & shopping
  {
    id: "charminar",
    name: "Charminar",
    nameAr: "تشارمينار",
    category: "heritage",
    coordinates: [17.3616024, 78.4746421],
    verified: false,
    source: "Nominatim: Charminar, Charminar Circle, Khilwat",
  },
  {
    id: "mecca-masjid",
    name: "Mecca Masjid",
    nameAr: "مسجد مكة",
    category: "heritage",
    coordinates: [17.36066, 78.4736063],
    verified: false,
    source: "Nominatim: Mecca Masjid, Charminar Road, Khilwat",
  },
  {
    id: "laad-bazaar",
    name: "Laad Bazaar",
    nameAr: "سوق لاد بازار",
    category: "heritage",
    coordinates: [17.3625085, 78.4729754],
    verified: false,
    source: "Nominatim: Laad Bazaar, Khilwat",
  },
  {
    id: "chowmahalla",
    name: "Chowmahalla Palace",
    nameAr: "قصر تشوماهالا",
    category: "heritage",
    coordinates: [17.3575817, 78.4717055],
    verified: false,
    source: "Nominatim: Chowmahalla Palace, Khilwat Road",
  },
  {
    id: "salar-jung",
    name: "Salar Jung Museum",
    nameAr: "متحف سالار جونغ",
    category: "heritage",
    coordinates: [17.371392, 78.4801498],
    verified: false,
    source: "Nominatim: Salar Jung Museum, Darul Shifa Road",
  },
  {
    id: "falaknuma",
    name: "Falaknuma Palace",
    nameAr: "قصر فلكنما",
    category: "heritage",
    coordinates: [17.3318413, 78.4658488],
    verified: false,
    source: "Nominatim: Falaknuma Palace, Falaknuma Road",
  },
];
