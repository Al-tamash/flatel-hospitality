/** Turn a flat's gallery into carousel images without inventing photos. */
import type { CarouselImage } from "@/components/media/photo-carousel";

export const GALLERY_FALLBACK_IMAGE = "/images/flats/flat-1bhk-luxury.jpg";

export function buildGalleryItems(
  images: Array<{ url?: string; alt?: string; category?: string }> | undefined,
  title: string
): CarouselImage[] {
  const real = (images ?? [])
    .filter((img) => Boolean(img.url))
    .map((img) => ({ url: img.url as string, alt: img.alt || title, ...(img.category ? { category: img.category } : {}) }));
  return real.length > 0 ? real : [{ url: GALLERY_FALLBACK_IMAGE, alt: title }];
}
