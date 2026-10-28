"use client";

import * as React from "react";
import { RoomGalleryImage } from "@/lib/mock-rooms";
import { PhotoCarousel } from "@/components/media/photo-carousel";
import { buildGalleryItems } from "@/lib/carousel/gallery";

interface RoomGalleryProps {
  images: RoomGalleryImage[];
  roomTitle: string;
}

/** Flat page photo carousel: only this flat's real photos (one neutral fallback when there are none). */
export function RoomGallery({ images, roomTitle }: RoomGalleryProps) {
  const galleryItems = React.useMemo(() => buildGalleryItems(images, roomTitle), [images, roomTitle]);
  return <PhotoCarousel images={galleryItems} title={roomTitle} />;
}
