"use client";

import * as React from "react";
import { RoomGalleryImage } from "@/lib/mock-rooms";
import { PhotoCarousel } from "@/components/media/photo-carousel";

interface RoomGalleryProps {
  images: RoomGalleryImage[];
  roomTitle: string;
}

/** Flat page photo carousel; pads short galleries with curated fallback photos. */
export function RoomGallery({ images, roomTitle }: RoomGalleryProps) {
  const galleryItems = React.useMemo(() => {
    if (images && images.length >= 4) {
      return images.map((img) => ({ url: img.url || "", alt: img.alt || roomTitle, category: img.category }));
    }
    return [
      { category: "Living Area", alt: `${roomTitle} - Living Lounge`, url: images?.[0]?.url || "/images/flats/flat-1bhk-luxury.jpg" },
      { category: "Bedroom", alt: `${roomTitle} - Master Bedroom`, url: "/images/flats/flat-1bhk-luxury.jpg" },
      { category: "Kitchen", alt: `${roomTitle} - Modular Kitchen`, url: "/images/amenity-kitchen-luxury.jpg" },
      { category: "Living Area", alt: `${roomTitle} - Dining Lounge`, url: "/images/flats/dining-kitchen-highres.jpg" },
      { category: "Exterior", alt: `${roomTitle} - Scenic Balcony`, url: "/images/flats/balcony-outdoor-highres.jpg" },
    ];
  }, [images, roomTitle]);

  return <PhotoCarousel images={galleryItems} title={roomTitle} />;
}
