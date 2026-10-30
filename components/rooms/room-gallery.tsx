"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight, Wifi, Wind, Tv, UtensilsCrossed, Car, ShieldCheck } from "lucide-react";
import { RoomGalleryImage } from "@/lib/mock-rooms";
import { padGalleryWithPlaceholders } from "@/lib/carousel/gallery";
import { PhotoLightbox } from "@/components/media/photo-lightbox";
import { SafeImage } from "@/components/media/safe-image";
import { cn } from "@/lib/utils";

interface RoomGalleryProps {
  images: RoomGalleryImage[];
  roomTitle: string;
  category?: string;
  branchSlug?: string;
}

const KEY_AMENITIES = [
  { icon: Wifi, en: "High-Speed Wi-Fi", ar: "واي فاي سريع" },
  { icon: Wind, en: "Air Conditioning", ar: "تكييف" },
  { icon: Tv, en: "Smart TV", ar: "تلفاز ذكي" },
  { icon: UtensilsCrossed, en: "Private Kitchen", ar: "مطبخ خاص" },
  { icon: Car, en: "Free Parking", ar: "مواقف مجانية" },
  { icon: ShieldCheck, en: "24/7 Security", ar: "أمن على مدار الساعة" },
] as const;

const GAP_PX = 8;

const slideSize = "h-full w-[86%] shrink-0 snap-start sm:w-[58%] lg:w-[42%]";

const arrowButton =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface/95 text-fg shadow-lg transition-opacity duration-200 hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:flex";

/**
 * Flat page gallery: a swipeable strip of photos with the next one peeking in, circular arrows
 * on larger screens, a "Key Amenities" first slide and a button that opens the full-screen viewer.
 * Uses the flat's own photos from Admin → Inventory; stand-in interiors fill in while it has fewer than five.
 */
export function RoomGallery({ images, roomTitle, category, branchSlug }: RoomGalleryProps) {
  const isAr = usePathname()?.startsWith("/ar") ?? false;
  const photos = React.useMemo(
    () => padGalleryWithPlaceholders(images, roomTitle, { category, branchSlug, isAr }),
    [images, roomTitle, category, branchSlug, isAr]
  );
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [edge, setEdge] = React.useState({ prev: false, next: true });
  const trackRef = React.useRef<HTMLDivElement>(null);

  const total = photos.length;
  const backdrop = photos[1] ?? photos[0];

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const syncEdges = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // scrollLeft is negative in right-to-left layouts, so compare its magnitude
    const pos = Math.abs(el.scrollLeft);
    const prev = pos > 4;
    const next = pos + el.clientWidth < el.scrollWidth - 4;
    setEdge((e) => (e.prev === prev && e.next === next ? e : { prev, next }));
  }, []);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncEdges();
    const observer = new ResizeObserver(syncEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncEdges, total]);

  /** `step` 1 = the next slide in reading order, -1 = the previous one, in either text direction. */
  const scrollBySlide = (step: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const width = (slide?.getBoundingClientRect().width ?? el.clientWidth * 0.8) + GAP_PX;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: step * (isAr ? -1 : 1) * width, behavior: reduce ? "auto" : "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") scrollBySlide(isAr ? -1 : 1);
    else if (e.key === "ArrowLeft") scrollBySlide(isAr ? 1 : -1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={isAr ? `صور ${roomTitle}` : `Photos of ${roomTitle}`}
      className="w-full"
    >
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={syncEdges}
          onKeyDown={onKeyDown}
          tabIndex={0}
          className="no-scrollbar flex h-[280px] snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:h-[380px] lg:h-[460px]"
        >
          {/* Slide 1: key amenities over a darkened photo */}
          <div
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={isAr ? "أبرز المرافق" : "Key amenities"}
            className={cn(slideSize, "relative overflow-hidden rounded-2xl border border-line bg-surface")}
          >
            {backdrop && (
              <SafeImage
                src={backdrop.url}
                alt=""
                fill
                priority
                quality={70}
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 58vw, 86vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-canvas/80" aria-hidden="true" />
            <div className="relative flex h-full flex-col items-center justify-center gap-5 px-5 py-6 text-center max-sm:pb-16 sm:gap-7">
              <h2 className="font-heading text-2xl font-medium text-fg sm:text-3xl">
                {isAr ? "أبرز المرافق" : "Key Amenities"}
              </h2>
              <ul className="grid w-full max-w-md grid-cols-3 gap-x-3 gap-y-5">
                {KEY_AMENITIES.map(({ icon: Icon, en, ar }) => (
                  <li key={en} className="flex flex-col items-center gap-2">
                    <Icon className="h-6 w-6 text-gold sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-xs font-medium leading-snug text-fg sm:text-sm">{isAr ? ar : en}</span>
                  </li>
                ))}
              </ul>
              <p className="hidden text-xs text-fg-soft sm:block sm:text-sm">
                {isAr ? "كل ما تحتاجه لإقامة مريحة" : "Everything you need for a comfortable stay"}
              </p>
            </div>
          </div>

          {photos.map((photo, i) => (
            <button
              key={`${photo.url}-${i}`}
              data-slide
              type="button"
              role="group"
              aria-roledescription="slide"
              aria-label={isAr ? `تكبير الصورة ${i + 1} من ${total}` : `Enlarge photo ${i + 1} of ${total}`}
              onClick={() => openAt(i)}
              className={cn(
                slideSize,
                "group relative cursor-zoom-in overflow-hidden rounded-2xl border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-gold"
              )}
            >
              <SafeImage
                src={photo.url}
                alt={photo.alt}
                fill
                priority={i < 2}
                quality={85}
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 58vw, 86vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
          aria-hidden={!edge.prev}
          tabIndex={edge.prev ? 0 : -1}
          className={cn(arrowButton, "start-3", edge.prev ? "opacity-100" : "pointer-events-none opacity-0")}
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          aria-label={isAr ? "الصورة التالية" : "Next photo"}
          aria-hidden={!edge.next}
          tabIndex={edge.next ? 0 : -1}
          className={cn(arrowButton, "end-3", edge.next ? "opacity-100" : "pointer-events-none opacity-0")}
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 end-3 z-10 flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <Camera className="h-4 w-4 text-gold" aria-hidden="true" />
          <span>{isAr ? `عرض كل الصور (${total})` : `View all ${total} photos`}</span>
        </button>
      </div>

      <PhotoLightbox
        photos={photos}
        index={index}
        open={open}
        onOpenChange={setOpen}
        onIndexChange={setIndex}
        title={roomTitle}
        isAr={isAr}
      />
    </section>
  );
}
