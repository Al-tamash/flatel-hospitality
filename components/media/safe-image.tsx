"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { GALLERY_FALLBACK_IMAGE } from "@/lib/carousel/gallery";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** Local image shown when `src` fails to load (e.g. a deleted or blocked upload). */
  fallbackSrc?: string;
};

/**
 * next/image that never leaves a broken picture behind: a failed photo is swapped for the fallback,
 * and if that fails too a neutral block is drawn instead.
 */
export function SafeImage({ src, fallbackSrc = GALLERY_FALLBACK_IMAGE, alt, className, ...props }: SafeImageProps) {
  const [erroredSrc, setErroredSrc] = React.useState<string | null>(null);
  const current = src || fallbackSrc;
  const eager = Boolean(props.priority) || props.loading === "eager";

  // Fade a photo in once it finishes loading instead of letting it pop in. Done on the
  // element after hydration, and only for images still in flight, so server-rendered
  // and cached photos stay visible (no LCP penalty) and reduced-motion visitors skip it.
  const fadeIn = React.useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || img.complete || eager) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      img.style.opacity = "0";
      img.style.transition = "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1)";
      const reveal = () => {
        img.style.opacity = "";
        // Drop the inline transition so the card's own hover transitions (e.g. zoom) apply again.
        window.setTimeout(() => (img.style.transition = ""), 450);
      };
      img.addEventListener("load", reveal, { once: true });
      img.addEventListener("error", reveal, { once: true });
    },
    [eager]
  );

  if (erroredSrc === current && current === fallbackSrc) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className="absolute inset-0 flex items-center justify-center bg-surface text-fg-muted"
      >
        <ImageOff className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }

  const effective = erroredSrc === current ? fallbackSrc : current;

  return (
    <Image
      {...props}
      ref={fadeIn}
      src={effective}
      alt={alt}
      className={cn(className)}
      onError={() => setErroredSrc(current)}
    />
  );
}
