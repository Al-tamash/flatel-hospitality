"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { nextIndex, swipeStep } from "@/lib/carousel/autoplay";
import { PhotoLightbox } from "@/components/media/photo-lightbox";
import { SafeImage } from "@/components/media/safe-image";

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

const roundButton =
  "flex items-center justify-center rounded-full border border-line-strong bg-surface text-fg transition-colors hover:border-gold hover:text-gold cursor-pointer";

/**
 * Photo carousel with previous/next, thumbnails, swipe and a full-screen viewer.
 * It never advances by itself: moving photos is always the visitor's choice.
 */
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
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);

  const go = (step: 1 | -1) => setIndex((i) => nextIndex(i, total, step));

  if (total === 0) return null;

  const hasMany = total > 1;
  const counter = isAr ? `${index + 1} من ${total}` : `${index + 1} of ${total}`;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const step = swipeStep((e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current, dir);
    touchStartX.current = null;
    if (step !== 0) go(step);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(dir === "ltr" ? 1 : -1);
    else if (e.key === "ArrowLeft") go(dir === "ltr" ? -1 : 1);
  };

  return (
    <section
      className={cn("w-full space-y-2.5", className)}
      aria-roledescription="carousel"
      aria-label={isAr ? `صور ${title}` : `Photos of ${title}`}
      onKeyDown={onKeyDown}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-line bg-canvas",
          frameClassName
        )}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((image, i) => {
          // Mount the current slide and its neighbours so the next photo is already loaded
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
                "absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none",
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <SafeImage
                src={image.url}
                alt={image.alt}
                fill
                priority={i === 0}
                quality={85}
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-offset-[-3px]"
          aria-label={isAr ? "عرض الصورة بملء الشاشة" : "Open photo fullscreen"}
        />

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className={cn(roundButton, "absolute start-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2")}
              aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className={cn(roundButton, "absolute end-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2")}
              aria-label={isAr ? "الصورة التالية" : "Next photo"}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </>
        )}

        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:border-gold hover:text-gold"
          >
            <Camera className="h-4 w-4 text-gold" aria-hidden="true" />
            <span>{isAr ? "عرض كل الصور" : "View all photos"}</span>
          </button>

          <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium tabular-nums text-fg">
            {counter}
          </span>
        </div>
      </div>

      {hasMany && (
        <ul className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label={isAr ? "الصور المصغرة" : "Thumbnails"}>
          {images.map((image, i) => (
            <li key={`thumb-${image.url}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={isAr ? `عرض الصورة ${i + 1}` : `Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block h-14 w-20 cursor-pointer overflow-hidden rounded-lg border bg-surface transition-opacity sm:h-16 sm:w-24",
                  i === index
                    ? "border-gold ring-1 ring-gold/60"
                    : "border-line opacity-70 hover:opacity-100"
                )}
              >
                <SafeImage src={image.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <PhotoLightbox
        photos={images}
        index={index}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setIndex}
        title={title}
        isAr={isAr}
      />
    </section>
  );
}
