"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Navigation,
  Search,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocaleFromPath } from "@/lib/i18n";

export interface HospitalItem {
  id: string;
  name: string;
  shortName: string;
  specialty: string;
  specialtyCode: "multi-speciality" | "oncology" | "gastroenterology" | "government";
  locality: string;
  address: string;
  googleMapsUrl: string;
  imageUrl: string;
}

export const MEDICAL_SERVICES = [
  { id: "ambulance", title: "Ambulance Assistance" },
  { id: "guide", title: "Hospital Guide" },
  { id: "pharmacy", title: "Medicine Delivery" },
  { id: "appointment", title: "Doctor Appointment" },
];

export const HOSPITALS_DATA: HospitalItem[] = [
  {
    id: "owaisi",
    name: "Owaisi Hospital & Research Centre",
    shortName: "Owaisi Hospital",
    specialty: "Multi-Speciality",
    specialtyCode: "multi-speciality",
    locality: "Kanchanbagh / Santosh Nagar",
    address: "Near DMRL 'X' Road, Kanchanbagh, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=Owaisi+Hospital+Kanchanbagh+Hyderabad",
    imageUrl: "/images/hospital-owaisi.jpg",
  },
  {
    id: "apollo",
    name: "Apollo Hospitals",
    shortName: "Apollo Hospitals",
    specialty: "Multi-Speciality",
    specialtyCode: "multi-speciality",
    locality: "Jubilee Hills",
    address: "Road No 72, Jubilee Hills, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=Apollo+Hospitals+Jubilee+Hills+Hyderabad",
    imageUrl: "/images/hospital-apollo.jpg",
  },
  {
    id: "yashoda",
    name: "Yashoda Hospitals",
    shortName: "Yashoda Hospitals",
    specialty: "Oncology",
    specialtyCode: "oncology",
    locality: "Somajiguda",
    address: "Raj Bhavan Road, Somajiguda, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=Yashoda+Hospital+Somajiguda+Hyderabad",
    imageUrl: "/images/hospital-yashoda.jpg",
  },
  {
    id: "kims",
    name: "KIMS Hospitals",
    shortName: "KIMS Hospitals",
    specialty: "Multi-Speciality",
    specialtyCode: "multi-speciality",
    locality: "Secunderabad",
    address: "Minister Road, Secunderabad, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=KIMS+Hospital+Secunderabad",
    imageUrl: "/images/hospital-kims.jpg",
  },
  {
    id: "virinchi",
    name: "Virinchi Hospitals",
    shortName: "Virinchi Hospitals",
    specialty: "Multi-Speciality",
    specialtyCode: "multi-speciality",
    locality: "Banjara Hills",
    address: "Road No 1, Banjara Hills, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=Virinchi+Hospitals+Banjara+Hills",
    imageUrl: "/images/hospital-virinchi.jpg",
  },
  {
    id: "aig",
    name: "AIG Hospitals",
    shortName: "AIG Hospitals",
    specialty: "Gastroenterology",
    specialtyCode: "gastroenterology",
    locality: "Gachibowli",
    address: "Mindspace Road, Gachibowli, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=AIG+Hospitals+Gachibowli",
    imageUrl: "/images/hospital-aig.jpg",
  },
  {
    id: "aware-global",
    name: "Aware Global Hospital",
    shortName: "Aware Global Hospital",
    specialty: "Multi-Speciality",
    specialtyCode: "multi-speciality",
    locality: "LB Nagar",
    address: "Sagar Road, LB Nagar, Hyderabad",
    googleMapsUrl: "https://maps.google.com/?q=Aware+Global+Hospital+LB+Nagar",
    imageUrl: "/images/hospital-aware-global.jpg",
  },
  {
    id: "gandhi",
    name: "Gandhi Hospital",
    shortName: "Gandhi Hospital",
    specialty: "Government",
    specialtyCode: "government",
    locality: "Secunderabad",
    address: "Musheerabad, Padmarao Nagar, Secunderabad",
    googleMapsUrl: "https://maps.google.com/?q=Gandhi+Hospital+Secunderabad",
    imageUrl: "/images/hospital-gandhi.jpg",
  },
];

export const HOSPITAL_RECORDS = HOSPITALS_DATA;

export const ARABIC_HOSPITAL_TRANSLATIONS: Record<
  string,
  {
    name: string;
    specialty: string;
    locality: string;
    address: string;
  }
> = {
  "owaisi": {
    name: "مستشفى ومركز أبحاث أويسي",
    specialty: "متعدد التخصصات",
    locality: "كانشانباغ / سانتوش ناغار",
    address: "بالقرب من طريق دي إم آر إل، كانشانباغ، حيدر أباد",
  },
  "apollo": {
    name: "مستشفيات أبولو",
    specialty: "متعدد التخصصات",
    locality: "جوبيلي هيلز",
    address: "طريق رقم ٧٢، جوبيلي هيلز، حيدر أباد",
  },
  "yashoda": {
    name: "مستشفيات ياشودا",
    specialty: "علاج الأورام",
    locality: "سوماجيغودا",
    address: "طريق راج بهافان، سوماجيغودا، حيدر أباد",
  },
  "kims": {
    name: "مستشفيات كيمز (KIMS)",
    specialty: "متعدد التخصصات",
    locality: "سيكندر أباد",
    address: "طريق مينيستر، سيكندر أباد، حيدر أباد",
  },
  "virinchi": {
    name: "مستشفيات فيرينتشي",
    specialty: "متعدد التخصصات",
    locality: "بانجارا هيلز",
    address: "طريق رقم ١، بانجارا هيلز، حيدر أباد",
  },
  "aig": {
    name: "مستشفيات إيه آي جي (AIG)",
    specialty: "أمراض وجراحة الجهاز الهضمي",
    locality: "غاتشيباولي",
    address: "طريق مايند سبيس، غاتشيباولي، حيدر أباد",
  },
  "aware-global": {
    name: "مستشفى أوير غلوبال",
    specialty: "متعدد التخصصات",
    locality: "إل بي ناغار",
    address: "طريق ساغار، إل بي ناغار، حيدر أباد",
  },
  "gandhi": {
    name: "مستشفى غاندي",
    specialty: "مستشفى حكومي",
    locality: "سيكندر أباد",
    address: "مشير أباد، بادماراو ناغار، سيكندر أباد",
  },
};

const SPECIALTY_TABS = [
  { id: "all", labelEn: "All Hospitals", labelAr: "كافة المستشفيات" },
  { id: "multi-speciality", labelEn: "Multi-Speciality", labelAr: "متعدد التخصصات" },
  { id: "oncology", labelEn: "Oncology", labelAr: "علاج الأورام" },
  { id: "gastroenterology", labelEn: "Gastroenterology", labelAr: "أمراض الجهاز الهضمي" },
  { id: "government", labelEn: "Government", labelAr: "مستشفيات حكومية" },
] as const;

export function HospitalDirectoryView() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const isAr = currentLocale === "ar";
  const basePath = isAr ? "/ar" : "";

  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredHospitals = React.useMemo(() => {
    return HOSPITALS_DATA.filter((item) => {
      const matchesSpecialty =
        selectedSpecialty === "all" || item.specialtyCode === selectedSpecialty;
      const q = searchQuery.toLowerCase().trim();
      const arData = ARABIC_HOSPITAL_TRANSLATIONS[item.id];
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.specialty.toLowerCase().includes(q) ||
        Boolean(arData?.name.toLowerCase().includes(q)) ||
        Boolean(arData?.locality.toLowerCase().includes(q)) ||
        Boolean(arData?.address.toLowerCase().includes(q)) ||
        Boolean(arData?.specialty.toLowerCase().includes(q));
      return matchesSpecialty && matchesSearch;
    });
  }, [selectedSpecialty, searchQuery]);

  return (
    <div className="w-full py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Page Heading */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <Link
            href={basePath || "/"}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#E5C178] hover:underline mb-3"
          >
            {isAr ? "← العودة إلى الصفحة الرئيسية" : "← Back to Homepage"}
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-[#FAF4EB] tracking-normal leading-[1.1]">
            {isAr ? "دليل مستشفيات حيدر أباد والسياحة العلاجية" : "Hyderabad Hospital & Medical Travel Guide"}
          </h1>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-[#D4C4B3] leading-relaxed">
            {isAr
              ? "هل تخطط لإقامة علاجية في حيدر أباد؟ تصفح معلومات المستشفيات المحلية واستكشف شقق فلاتيل الفندقية المجهزة بمطابخ خاصة."
              : "Planning a medical stay in Hyderabad? Browse local hospital information and explore furnished Flatel residences with private kitchens."}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.28)] mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-0 md:max-w-md">
            <Search className="w-4 h-4 text-[#D4C4B3] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label={isAr ? "البحث عن المستشفيات بالاسم أو المنطقة أو التخصص" : "Search hospitals by name, area, or specialty"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث عن المستشفى بالاسم، المنطقة، أو التخصص..." : "Search hospital by name, area, or specialty..."}
              className="w-full bg-[rgba(22,16,11,0.7)] border border-[rgba(212,163,89,0.25)] focus:border-[#E5C178] rounded-xl pl-9 rtl:pl-4 rtl:pr-9 pr-8 py-2.5 text-sm sm:text-base text-[#FAF4EB] placeholder-[#FAF4EB]/50 focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-[#D4C4B3] hover:text-[#FAF4EB] p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {SPECIALTY_TABS.map((tab) => {
              const isActive = selectedSpecialty === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSpecialty(tab.id)}
                  className={cn(
                    "px-4 py-2 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer inline-flex items-center justify-center",
                    isActive
                      ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold"
                      : "bg-[rgba(22,16,11,0.6)] text-[#D4C4B3] hover:text-[#FAF4EB] border border-[rgba(212,163,89,0.2)]"
                  )}
                >
                  {isAr ? tab.labelAr : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory Grid */}
        {filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredHospitals.map((hospital) => {
              const arData = isAr ? ARABIC_HOSPITAL_TRANSLATIONS[hospital.id] : null;
              const hospitalName = arData?.name || hospital.name;
              const hospitalSpecialty = arData?.specialty || hospital.specialty;
              const hospitalLocality = arData?.locality || hospital.locality;
              const hospitalAddress = arData?.address || hospital.address;

              return (
                <div
                  key={hospital.id}
                  className="rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] transition-colors flex flex-col justify-between overflow-hidden shadow-lg group"
                >
                  {/* Image & Badges */}
                  <div className="relative h-36 w-full overflow-hidden bg-[#0E0A07]">
                    <Image
                      src={hospital.imageUrl}
                      alt={hospitalName}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16100B] via-black/40 to-black/10" />
                    <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-[rgba(22,16,11,0.9)] backdrop-blur-xs text-[#E5C178] border border-[rgba(212,163,89,0.25)]">
                        {hospitalSpecialty}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2.5 text-xs text-[#E5C178] font-medium flex items-center gap-1.5 drop-shadow-sm">
                      <span className="sr-only">Hospital information</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-[#FAF4EB] group-hover:text-[#E5C178] transition-colors leading-snug tracking-normal">
                        {hospitalName}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#E5C178] font-medium mt-1">
                        {hospitalLocality}
                      </p>
                      <p className="text-xs sm:text-sm text-[#D4C4B3] line-clamp-2 mt-2 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                        <span>{hospitalAddress}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3.5 border-t border-[rgba(212,163,89,0.18)] flex items-center gap-2">
                      <Link
                        href={`${basePath}/#flats`}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all text-center min-h-[44px]"
                      >
                        <span>{isAr ? "شقق قريبة" : "Nearby Flats"}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Link>
                      <a
                        href={hospital.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[rgba(22,16,11,0.85)] hover:bg-[rgba(45,32,22,0.9)] text-[#FAF4EB] border border-[rgba(212,163,89,0.25)] hover:border-[#E5C178] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 transition-colors min-h-[44px]"
                        aria-label={isAr ? `الاتجاهات إلى ${hospitalName}` : `Get directions to ${hospital.name}`}
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#E5C178]" />
                        <span>{isAr ? "الخريطة" : "Map"}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#16100B] border border-[rgba(212,163,89,0.28)]">
            <p className="text-base font-semibold text-[#FAF4EB]">
              {isAr ? "لا توجد مستشفيات مطابقة لبحثك" : "No hospitals match your search"}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("all");
              }}
              className="mt-3.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-sm min-h-[44px] cursor-pointer"
            >
              {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
            </button>
          </div>
        )}

        {/* Disclaimer Notice */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-[rgba(34,24,16,0.65)] backdrop-blur-md border border-[rgba(212,163,89,0.25)] flex items-start gap-3 text-xs sm:text-sm text-[#D4C4B3]">
          <AlertCircle className="w-5 h-5 text-[#E5C178] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#FAF4EB] font-semibold">
              {isAr ? "إشعار الرعاية الصحية غير السريرية:" : "Non-Clinical Healthcare Notice:"}
            </strong>{" "}
            {isAr
              ? "تقدم فلاتيل للضيافة إقامات فندقية ومساعدة لوجستية غير سريرية. نحن لا نقدم استشارات طبية أو علاجية أو خدمات طوارئ سريرية. يتم تقديم الرعاية الطبية حصراً بواسطة المراكز والمستشفيات المرخصة."
              : "Flatel Hospitality provides serviced accommodations and non-clinical guest assistance. We do not provide clinical treatment, diagnoses, or emergency dispatch services. All medical care is delivered exclusively by licensed healthcare facilities."}
          </p>
        </div>
      </div>
    </div>
  );
}
