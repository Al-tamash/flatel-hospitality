"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTOPLAY_INTERVAL_MS, nextIndex, shouldAutoplay, swipeStep } from "@/lib/carousel/autoplay";

export interface CarouselImage {
  url: string;
  alt: string;
  category?: string;
}

interface PhotoCarouselProps {
  images: CarouselImage[];
  title: string;
  className?: string;
  /** Size of the slide frame; defaults to the flat page hero height. */
  frameClassName?: string;
}

const FALLBACK_IMAGE = "/images/flats/flat-1bhk-luxury.jpg";

const roundButton =
  "rounded-full bg-[rgba(22,16,11,0.88)] hover:bg-[#16100B] text-[#FAF4EB] border border-[rgba(212,163,89,0.35)] hover:border-[#E5C178] flex items-center justify-center shadow-lg transition-colors cursor-pointer";

/** Auto-playing photo carousel with dots, thumbnails, swipe and a fullscreen lightbox. */
export function PhotoCarousel({
  images,
  title,
  className,
  frameClassName = "aspect-[16/10] sm:aspect-auto sm:h-[380px] md:h-[440px]",
}: PhotoCarouselProps) {
  const isAr = usePathname()?.startsWith("/ar") ?? false;
  const dir = isAr ? "rtl" : "ltr";
  const total = images.length;

  const [index, setIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [userInteracted, setUserInteracted] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [pageVisible, setPageVisible] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const rootRef = React.useRef<HTMLElement>(null);
  const touchStartX = React.useRef<number | null>(null);

  // Environment signals: visibility on screen, tab visibility, reduced motion
  React.useEffect(() => {
    const node = rootRef.current;
    let observer: IntersectionObserver | undefined;
    if (node && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)));
      observer.observe(node);
    }
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(media.matches);
    onMotion();
    media.addEventListener("change", onMotion);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMotion);
    };
  }, []);

  const autoplay = shouldAutoplay({
    count: total,
    hovered,
    focused,
    userInteracted,
    inView,
    pageVisible,
    reducedMotion: reducedMotion || lightboxOpen,
  });

  React.useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => setIndex((i) => nextIndex(i, total, 1)), AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, total]);

  const go = React.useCallback(
    (step: 1 | -1) => {
      setUserInteracted(true);
      setIndex((i) => nextIndex(i, total, step));
    },
    [total]
  );

  const goTo = (i: number) => {
    setUserInteracted(true);
    setIndex(i);
  };

  // Lightbox keyboard + scroll lock
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") go(dir === "ltr" ? 1 : -1);
      else if (e.key === "ArrowLeft") go(dir === "ltr" ? -1 : 1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, go, dir]);

  if (total === 0) return null;

  const current = images[index] ?? images[0];
  const hasMany = total > 1;
  const counter = `${index + 1} / ${total}`;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const step = swipeStep((e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current, dir);
    touchStartX.current = null;
    setUserInteracted(true);
    if (step !== 0) go(step);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(dir === "ltr" ? 1 : -1);
    else if (e.key === "ArrowLeft") go(dir === "ltr" ? -1 : 1);
    else if (e.key === "Enter") setLightboxOpen(true);
  };

  return (
    <section
      ref={rootRef}
      className={cn("w-full select-none space-y-2.5", className)}
      aria-roledescription="carousel"
      aria-label={isAr ? `صور ${title}` : `Photos of ${title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[#0E0A07] shadow-2xl",
          frameClassName
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((image, i) => {
          // Mount the current slide and its neighbours so cross-fades have a loaded image
          const near = i === index || i === nextIndex(index, total, 1) || i === nextIndex(index, total, -1);
          if (!near) return null;
          return (
            <div
              key={`${image.url}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={isAr ? `${i + 1} من ${total}` : `${i + 1} of ${total}`}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                i === index ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <Image
                src={image.url || FALLBACK_IMAGE}
                alt={image.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          );
        })}

        <button
          type="button"
          tabIndex={0}
          onClick={() => setLightboxOpen(true)}
          onKeyDown={onKeyDown}
          className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E5C178]"
          aria-label={isAr ? "عرض الصورة بملء الشاشة" : "Open photo fullscreen"}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#0E0A07]/70 via-transparent to-[#0E0A07]/15" />

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className={cn(roundButton, "absolute start-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10")}
              aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className={cn(roundButton, "absolute end-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10")}
              aria-label={isAr ? "الصورة التالية" : "Next photo"}
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </>
        )}

        <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[rgba(22,16,11,0.9)] hover:bg-[#16100B] text-[#FAF4EB] text-xs font-medium border border-[rgba(212,163,89,0.35)] hover:border-[#E5C178] flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#E5C178]" />
            <span>{isAr ? "عرض كل الصور" : "View all photos"}</span>
          </button>

          {hasMany && (
            <div className="flex items-center gap-1.5" role="tablist" aria-label={isAr ? "اختيار الصورة" : "Choose photo"}>
              {images.map((image, i) => (
                <button
                  key={`dot-${image.url}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={isAr ? `الصورة ${i + 1}` : `Photo ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all cursor-pointer",
                    i === index ? "w-5 bg-[#E5C178]" : "w-1.5 bg-[#FAF4EB]/50 hover:bg-[#FAF4EB]/80"
                  )}
                />
              ))}
            </div>
          )}

          <span className="px-2.5 py-0.5 rounded-md bg-[rgba(22,16,11,0.9)] text-[#FAF4EB] text-[11px] font-medium border border-[rgba(212,163,89,0.3)] tabular-nums">
            {counter}
          </span>
        </div>
      </div>

      {hasMany && (
        <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((image, i) => (
            <button
              key={`thumb-${image.url}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={isAr ? `عرض الصورة ${i + 1}` : `Show photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer bg-[#16100B]",
                i === index
                  ? "border-[#E5C178] ring-1 ring-[#E5C178]/60"
                  : "border-[rgba(212,163,89,0.22)] opacity-70 hover:opacity-100"
              )}
            >
              <Image src={image.url || FALLBACK_IMAGE} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? `معرض صور ${title}` : `${title} photo gallery`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0D09]/95 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className={cn(roundButton, "absolute top-4 end-4 z-50 h-10 w-10")}
            aria-label={isAr ? "إغلاق المعرض" : "Close gallery"}
          >
            <X className="w-5 h-5" />
          </button>
          {hasMany && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className={cn(roundButton, "absolute start-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12")}
                aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
              >
                <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className={cn(roundButton, "absolute end-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12")}
                aria-label={isAr ? "الصورة التالية" : "Next photo"}
              >
                <ChevronRight className="w-6 h-6 rtl:rotate-180" />
              </button>
            </>
          )}
          <div
            className="relative w-full max-w-5xl h-[80vh] px-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={current.url || FALLBACK_IMAGE}
              alt={current.alt}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#16100B]/90 text-[#FAF4EB] text-xs font-semibold border border-[rgba(212,163,89,0.3)] shadow-lg whitespace-nowrap">
              {current.category ? `${current.category} · ` : ""}
              {counter}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
