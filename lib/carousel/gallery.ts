/** Turn a flat's gallery into carousel images without inventing photos. */
import type { CarouselImage } from "@/components/media/photo-carousel";

export const GALLERY_FALLBACK_IMAGE = "/images/flats/flat-1bhk-luxury.jpg";

/** Photos the flat page grid is designed around: one large photo plus four tiles. */
export const GALLERY_MIN_PHOTOS = 5;

export function buildGalleryItems(
  images: Array<{ url?: string; alt?: string; category?: string }> | undefined,
  title: string
): CarouselImage[] {
  const real = (images ?? [])
    .filter((img) => Boolean(img.url))
    .map((img) => ({ url: img.url as string, alt: img.alt || title, ...(img.category ? { category: img.category } : {}) }));
  return real.length > 0 ? real : [{ url: GALLERY_FALLBACK_IMAGE, alt: title }];
}

export interface GalleryPhoto {
  url: string;
  alt: string;
  /** True for stand-in photos shown until the flat has enough of its own (internal flag, never shown to guests). */
  placeholder?: boolean;
}

type PlaceholderKind = "living" | "bedroom" | "kitchen" | "bathroom" | "view";

interface PlaceholderSource {
  url: string;
  kind: PlaceholderKind;
}

const KIND_LABEL: Record<PlaceholderKind, { en: string; ar: string }> = {
  living: { en: "living area", ar: "منطقة المعيشة" },
  bedroom: { en: "bedroom", ar: "غرفة النوم" },
  kitchen: { en: "kitchen", ar: "المطبخ" },
  bathroom: { en: "bathroom", ar: "الحمام" },
  view: { en: "interior", ar: "التصميم الداخلي" },
};

/** Replaceable stand-ins, all interiors in the same warm style as the site. Never exteriors of other buildings. */
function placeholderPool(category: string | undefined, branchSlug: string | undefined): PlaceholderSource[] {
  const type = /^[1-5]/.exec(category ?? "")?.[0];
  const living: PlaceholderSource[] = type ? [{ url: `/images/flats/flat-${type}bhk-luxury.jpg`, kind: "living" }] : [];
  return [
    ...living,
    { url: "/images/amenities-bedroom-bg.jpg", kind: "bedroom" },
    { url: "/images/amenity-kitchen-luxury.jpg", kind: "kitchen" },
    { url: "/images/amenity-bathroom-luxury.jpg", kind: "bathroom" },
    branchSlug === "barkas-salala"
      ? { url: "/images/branch-barkas-salala.jpg", kind: "view" }
      : { url: "/images/branch-moghal-pura.jpg", kind: "view" },
  ];
}

/**
 * Photos for the flat page: the flat's own photos first and untouched, then (only while it has fewer than
 * `minimum`) stand-in interiors, each flagged `placeholder`. Once the client uploads
 * enough real photos in Admin → Inventory the stand-ins disappear on their own.
 */
export function padGalleryWithPlaceholders(
  images: Array<{ url?: string; alt?: string }> | undefined,
  title: string,
  options: { category?: string; branchSlug?: string; isAr?: boolean; minimum?: number } = {}
): GalleryPhoto[] {
  const { category, branchSlug, isAr = false, minimum = GALLERY_MIN_PHOTOS } = options;
  const real = (images ?? []).filter((img) => Boolean(img.url));
  const total = Math.max(real.length, minimum);
  const photos: GalleryPhoto[] = real.map((img, i) => ({
    url: img.url as string,
    // Admin-uploaded photos carry no description, so never invent one such as "Bedroom".
    alt: isAr ? `${title} — صورة ${i + 1} من ${total}` : `${title} — photo ${i + 1} of ${total}`,
  }));

  if (photos.length >= minimum) return photos;

  const used = new Set(photos.map((p) => p.url));
  for (const source of placeholderPool(category, branchSlug)) {
    if (photos.length >= minimum) break;
    if (used.has(source.url)) continue;
    used.add(source.url);
    const label = KIND_LABEL[source.kind];
    photos.push({
      url: source.url,
      alt: isAr
        ? `${title} — ${label.ar}`
        : `${title} — ${label.en}`,
      placeholder: true,
    });
  }
  return photos;
}
