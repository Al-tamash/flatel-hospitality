"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nextIndex, swipeStep } from "@/lib/carousel/autoplay";
import { SafeImage } from "@/components/media/safe-image";

export interface LightboxPhoto {
  url: string;
  alt: string;
  placeholder?: boolean;
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  title: string;
  isAr: boolean;
}

const roundButton =
  "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-fg transition-colors hover:border-gold hover:text-gold";

/**
 * Full-screen photo viewer. Built on a modal dialog, so focus is trapped inside, Esc closes it and focus returns to
 * the control that opened it. Left/Right (mirrored in Arabic), Home and End move between photos; swipe works on touch.
 */
export function PhotoLightbox({ photos, index, open, onOpenChange, onIndexChange, title, isAr }: PhotoLightboxProps) {
  const total = photos.length;
  const current = photos[index] ?? photos[0];
  const touchStartX = React.useRef<number | null>(null);
  const activeThumb = React.useRef<HTMLButtonElement>(null);

  const step = React.useCallback(
    (delta: 1 | -1) => onIndexChange(nextIndex(index, total, delta)),
    [index, total, onIndexChange]
  );

  // Keep the active thumbnail visible in the strip
  React.useEffect(() => {
    if (open) activeThumb.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, index]);

  if (!current) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const forwardKey = isAr ? "ArrowLeft" : "ArrowRight";
    const backKey = isAr ? "ArrowRight" : "ArrowLeft";
    if (event.key === forwardKey) {
      event.preventDefault();
      step(1);
    } else if (event.key === backKey) {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      onIndexChange(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onIndexChange(total - 1);
    }
  };

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    const move = swipeStep(delta, isAr ? "rtl" : "ltr");
    if (move !== 0) step(move);
  };

  const counter = isAr ? `${index + 1} من ${total}` : `${index + 1} of ${total}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-canvas" />
        <Dialog.Popup
          dir={isAr ? "rtl" : "ltr"}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[61] flex flex-col text-fg outline-none animate-in fade-in duration-200"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <Dialog.Title className="truncate font-heading text-lg font-medium text-fg">
                {isAr ? `معرض صور ${title}` : `${title} — photo gallery`}
              </Dialog.Title>
              <p className="text-sm text-fg-soft tabular-nums" aria-live="polite">
                {counter}
              </p>
            </div>
            <Dialog.Close className={roundButton} aria-label={isAr ? "إغلاق المعرض" : "Close gallery"}>
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <div
              className="relative h-full w-full max-w-6xl"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <SafeImage
                key={current.url}
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain animate-in fade-in duration-300"
              />
            </div>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className={cn(roundButton, "absolute start-3 top-1/2 -translate-y-1/2 sm:start-5")}
                  aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
                >
                  <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className={cn(roundButton, "absolute end-3 top-1/2 -translate-y-1/2 sm:end-5")}
                  aria-label={isAr ? "الصورة التالية" : "Next photo"}
                >
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="shrink-0 space-y-3 px-4 py-3 sm:px-6">
            {total > 1 && (
              <ul className="flex gap-2 overflow-x-auto pb-1 sm:justify-center" aria-label={isAr ? "الصور المصغرة" : "Thumbnails"}>
                {photos.map((photo, i) => (
                  <li key={`${photo.url}-${i}`} className="shrink-0">
                    <button
                      ref={i === index ? activeThumb : undefined}
                      type="button"
                      onClick={() => onIndexChange(i)}
                      aria-label={isAr ? `عرض الصورة ${i + 1}` : `Show photo ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "relative block h-14 w-20 cursor-pointer overflow-hidden rounded-lg border-2 bg-surface transition-opacity sm:h-16 sm:w-24",
                        i === index
                          ? "border-gold"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <SafeImage src={photo.url} alt="" fill sizes="96px" className="object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
