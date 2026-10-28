"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Check, ChevronDown, Landmark, MapPin, Plus, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHATSAPP_CONFIG } from "@/lib/constants";
import type { RoomDetail } from "@/lib/mock-rooms";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";
import { WEDDING_SERVICES } from "@/lib/services-catalog";
import { MAP_PLACES, BRANCH_PINS, type PlaceCategory } from "@/lib/map/places";
import { nearestBranch } from "@/lib/map/geo";
import {
  ARABIC_COMPLIMENTARY_NAMES,
  getPurposeServices,
  type PurposeId,
} from "@/lib/purpose/purpose-services";
import {
  WEDDING_SERVICE_NAMES_AR,
  getPurposePage,
  recommendFlats,
  weddingServicesExcludingPaid,
} from "@/lib/purpose/purpose-pages";
import { ARABIC_ADDONS_TRANSLATION } from "@/components/rooms/booking-sidebar";
import { WhatsAppIcon } from "@/components/site-footer";

interface PurposePageViewProps {
  purpose: PurposeId;
  locale: "en" | "ar";
  rooms: RoomDetail[];
}

const sectionTitle = "font-heading text-2xl sm:text-3xl text-[#FAF4EB] font-normal";
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5C178]";

function flatImage(room: RoomDetail): string {
  return room.gallery?.find((g) => g.url)?.url || `/images/flats/flat-${room.slug}-luxury.jpg`;
}

export function PurposePageView({ purpose, locale, rooms }: PurposePageViewProps) {
  const isAr = locale === "ar";
  const prefix = isAr ? "/ar" : "";
  const page = getPurposePage(purpose, locale);
  const { free, paid } = getPurposeServices(purpose);
  const flats = recommendFlats(purpose, rooms).map((room) => getLocalizedRoom(room, locale));
  const firstFlat = flats[0];
  const bookHref = firstFlat ? `${prefix}/properties/${firstFlat.slug}?purpose=${purpose}` : `${prefix}/properties?purpose=${purpose}`;
  const whatsappUrl = WHATSAPP_CONFIG.getUrl(
    isAr ? `مرحباً فلاتيل، أود الاستفسار عن ${page.title}.` : `Hello Flatel, I'd like to ask about a ${page.title} booking.`
  );

  const priceLabel = (price: number | null, perNight: boolean) => {
    if (price === null) return isAr ? "حسب الطلب" : "On quote";
    return `₹${price.toLocaleString("en-IN")}${perNight ? (isAr ? " / ليلة" : " / night") : ""}`;
  };

  const placesBlock = (category: PlaceCategory, title: string, Icon: typeof Landmark) => {
    const places = MAP_PLACES.filter((p) => p.category === category)
      .map((p) => ({ ...p, nearest: nearestBranch(p.coordinates) }))
      .sort((a, b) => a.nearest.km - b.nearest.km);
    return (
      <div className="space-y-5">
        <h2 className={sectionTitle}>{title}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {places.map((place) => {
            const branch = BRANCH_PINS.find((b) => b.slug === place.nearest.slug);
            return (
              <li
                key={place.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-[rgba(212,163,89,0.22)] bg-[rgba(22,16,11,0.8)]"
              >
                <Icon className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#FAF4EB]">{isAr ? place.nameAr : place.name}</p>
                  <p className="text-xs text-[#B8A692] mt-0.5">
                    {isAr
                      ? `≈${place.nearest.km.toFixed(1)} كم من فرع ${branch?.nameAr ?? ""}`
                      : `≈${place.nearest.km.toFixed(1)} km from our ${branch?.name ?? ""} branch`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const extraBlock = (() => {
    switch (page.extraBlock) {
      case "hospitals":
        return placesBlock("hospital", isAr ? "مستشفيات قريبة" : "Hospitals near our flats", Stethoscope);
      case "heritage":
        return placesBlock("heritage", isAr ? "معالم تراثية قريبة" : "Heritage & shopping nearby", Landmark);
      case "wedding": {
        const services = weddingServicesExcludingPaid(WEDDING_SERVICES, paid);
        return (
          <div className="space-y-5">
            <h2 className={sectionTitle}>{isAr ? "خدمات أخرى للزفاف عند الطلب" : "More wedding help on request"}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => (
                <li key={service.id} className="p-4 rounded-xl border border-[rgba(212,163,89,0.22)] bg-[rgba(22,16,11,0.8)]">
                  <p className="text-sm font-medium text-[#FAF4EB]">
                    {(isAr && WEDDING_SERVICE_NAMES_AR[service.id]) || service.title}
                  </p>
                  {!isAr && <p className="text-xs text-[#B8A692] mt-1 line-clamp-2">{service.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      default:
        return (
          <div className="space-y-5">
            <h2 className={sectionTitle}>
              {page.extraBlock === "family"
                ? isAr
                  ? "مساحة تتسع للعائلة كلها"
                  : "Room for the whole family"
                : isAr
                  ? "مجهزة للعمل"
                  : "Set up for work"}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {page.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 p-4 rounded-xl border border-[rgba(212,163,89,0.22)] bg-[rgba(22,16,11,0.8)] text-sm text-[#FAF4EB]"
                >
                  <Check className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        );
    }
  })();

  return (
    <div className="w-full bg-[#0E0A07] text-[#FAF4EB]">
      {/* 1. Hero */}
      <section className="relative w-full min-h-[420px] sm:min-h-[480px] flex items-end overflow-hidden">
        <Image src={page.heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07] via-[#0E0A07]/70 to-[#0E0A07]/30" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pb-12 sm:pb-16 space-y-4">
          <nav aria-label="Breadcrumb" className="text-xs text-[#B8A692] flex items-center gap-2">
            <Link href={prefix || "/"} className="hover:text-[#FAF4EB]">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#FAF4EB]">{page.title}</span>
          </nav>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] max-w-3xl">{page.title}</h1>
          <p className="text-base sm:text-lg text-[#E5C178] max-w-2xl">{page.tagline}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={bookHref}
              className="inline-flex items-center gap-2 px-6 min-h-[48px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] text-sm font-bold shadow-lg transition-all"
            >
              <span>{isAr ? "احجز مع هذه الباقة" : `Book with ${page.title.split(" — ")[0]} package`}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 min-h-[48px] rounded-xl border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] bg-[rgba(14,10,7,0.7)] text-sm font-semibold text-[#FAF4EB] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#E5C178]" />
              <span>{isAr ? "تحدث معنا" : "Ask on WhatsApp"}</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-14 sm:py-20 space-y-16 sm:space-y-20">
        {/* 2. Who it's for */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-3">
            <span className={eyebrow}>{isAr ? "لمن هذه الإقامة" : "Who it's for"}</span>
            <p className="font-heading text-2xl sm:text-3xl leading-snug">{page.description}</p>
          </div>
          <ul className="space-y-3">
            {page.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-[#D4C4B3]">
                <Check className="w-5 h-5 text-[#E5C178] shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3 + 4. Free services and paid add-ons */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.8)] p-6 space-y-4">
            <h2 className="font-heading text-2xl">{isAr ? "مشمول مجاناً" : "Included free"}</h2>
            <ul className="space-y-2.5">
              {free.map((service) => (
                <li key={service.name} className="flex items-start gap-2.5 text-sm text-[#FAF4EB]">
                  <Check className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                  <span>
                    {(isAr && ARABIC_COMPLIMENTARY_NAMES[service.name]) || service.name}
                    {service.disclaimer && !isAr && (
                      <span className="block text-xs text-[#B8A692] mt-0.5">{service.disclaimer}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[rgba(212,163,89,0.25)] bg-[rgba(22,16,11,0.8)] p-6 space-y-4">
            <h2 className="font-heading text-2xl">{isAr ? "خدمات إضافية مدفوعة" : "Paid add-ons"}</h2>
            <ul className="divide-y divide-[rgba(212,163,89,0.14)]">
              {paid.map((addon) => (
                <li key={addon.id} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                  <span className="flex items-start gap-2.5 text-[#FAF4EB]">
                    <Plus className="w-4 h-4 text-[#E5C178] shrink-0 mt-0.5" />
                    <span>{(isAr && ARABIC_ADDONS_TRANSLATION[addon.id]) || addon.name}</span>
                  </span>
                  <span className="font-semibold text-[#E5C178] tabular-nums shrink-0">
                    {priceLabel(addon.price, addon.type === "per_night" || addon.pricingType === "per_night")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#B8A692]">
              {isAr ? "تختار الخدمات الإضافية أثناء حجز شقتك." : "Choose add-ons while booking your flat."}
            </p>
          </div>
        </section>

        {/* 5. Recommended flats */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className={sectionTitle}>{isAr ? "شقق مناسبة لك" : "Flats that suit this stay"}</h2>
            <Link
              href={`${prefix}/properties?purpose=${purpose}`}
              className="text-sm font-semibold text-[#E5C178] hover:text-[#FAF4EB] inline-flex items-center gap-1.5"
            >
              <span>{isAr ? "عرض كل الشقق" : "See all flats"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 no-scrollbar">
            {flats.map((room) => (
              <Link
                key={room.id}
                href={`${prefix}/properties/${room.slug}?purpose=${purpose}`}
                className="group snap-start shrink-0 w-[78%] sm:w-auto rounded-2xl overflow-hidden border border-[rgba(212,163,89,0.25)] hover:border-[#E5C178] bg-[rgba(22,16,11,0.85)] transition-colors"
              >
                <div className="relative aspect-[16/11]">
                  <Image
                    src={flatImage(room)}
                    alt={room.title}
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-heading text-lg leading-tight">{room.title}</p>
                  <p className="flex items-center gap-3 text-xs text-[#B8A692]">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#E5C178]" />
                      {isAr ? `حتى ${room.maxAdults} ضيوف` : `Up to ${room.maxAdults} guests`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-[#E5C178]" />
                      {room.specs.bedrooms}
                    </span>
                  </p>
                  {room.branchSlug && (
                    <p className="flex items-center gap-1 text-xs text-[#B8A692]">
                      <MapPin className="w-3.5 h-3.5 text-[#E5C178]" />
                      {(() => {
                        const pin = BRANCH_PINS.find((b) => b.slug === room.branchSlug);
                        return isAr ? pin?.nameAr : pin?.name;
                      })()}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-[#E5C178] tabular-nums">
                    {isAr
                      ? `من ₹${room.basePricePerNight.toLocaleString("en-IN")} / ليلة`
                      : `from ₹${room.basePricePerNight.toLocaleString("en-IN")} / night`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Purpose-specific block */}
        <section>{extraBlock}</section>

        {/* 7. FAQ + closing CTA */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-4">
            <h2 className={sectionTitle}>{isAr ? "أسئلة شائعة" : "Questions guests ask"}</h2>
            <div className="divide-y divide-[rgba(212,163,89,0.16)] border-y border-[rgba(212,163,89,0.16)]">
              {page.faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm sm:text-base font-medium text-[#FAF4EB]">
                    <span>{item.q}</span>
                    <ChevronDown className="w-4 h-4 text-[#E5C178] shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pt-2 text-sm text-[#B8A692] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[rgba(212,163,89,0.3)] bg-[rgba(22,16,11,0.9)] p-6 space-y-4 lg:sticky lg:top-28">
            <p className="font-heading text-2xl leading-snug">
              {isAr ? "جاهز لحجز إقامتك؟" : "Ready to book your stay?"}
            </p>
            <Link
              href={bookHref}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 px-5 min-h-[48px] rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-105 text-[#140E08] text-sm font-bold transition-all"
              )}
            >
              <span>{isAr ? "احجز الآن" : "Choose your flat"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 min-h-[48px] rounded-xl border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] text-sm font-semibold text-[#FAF4EB] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#E5C178]" />
              <span>{isAr ? "تحدث معنا عبر واتساب" : "Ask on WhatsApp"}</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
