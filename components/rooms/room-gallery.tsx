"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
} from "lucide-react";
import { RoomGalleryImage } from "@/lib/mock-rooms";

interface RoomGalleryProps {
  images: RoomGalleryImage[];
  roomTitle: string;
}

export function RoomGallery({ images, roomTitle }: RoomGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  // Fallback to 5 curated luxury images if array is short
  const galleryItems = React.useMemo(() => {
    if (images && images.length >= 4) return images;
    return [
      { id: "img-1", category: "Living Area" as const, alt: `${roomTitle} - Living Lounge`, url: images?.[0]?.url || "/images/flats/flat-1bhk-luxury.jpg" },
      { id: "img-2", category: "Bedroom" as const, alt: `${roomTitle} - Master Bedroom`, url: "/images/flats/flat-1bhk-luxury.jpg" },
      { id: "img-3", category: "Kitchen" as const, alt: `${roomTitle} - Modular Kitchen`, url: "/images/amenity-kitchen-luxury.jpg" },
      { id: "img-4", category: "Living Area" as const, alt: `${roomTitle} - Dining Lounge`, url: "/images/flats/dining-kitchen-highres.jpg" },
      { id: "img-5", category: "Exterior" as const, alt: `${roomTitle} - Scenic Balcony`, url: "/images/flats/balcony-outdoor-highres.jpg" },
    ];
  }, [images, roomTitle]);

  const total = galleryItems.length;

  const prevImage = React.useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const nextImage = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, prevImage, nextImage]);

  const heroItem = galleryItems[0];
  const gridItems = galleryItems.slice(1, 5);

  return (
    <section className="w-full select-none" aria-label={`Photo gallery for ${roomTitle}`}>
      {/* ======================================================== */}
      {/* 1. AGODA / OTA-STYLE DESKTOP PHOTO COLLAGE (Hero + 2x2)  */}
      {/* ======================================================== */}
      <div className="hidden sm:grid grid-cols-12 gap-2 h-[380px] md:h-[440px] rounded-2xl overflow-hidden border border-[rgba(212,163,89,0.28)] bg-[rgba(34,24,16,0.65)] shadow-2xl backdrop-blur-md">
        {/* Main Hero Photo (Left 7 Cols) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveIndex(0);
            setIsLightboxOpen(true);
          }}
          className="group relative col-span-7 h-full overflow-hidden cursor-pointer bg-[#0E0A07]"
        >
          <Image
            src={heroItem.url || "/images/flats/flat-1bhk-luxury.jpg"}
            alt={heroItem.alt || roomTitle}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 1024px) 60vw, 750px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/70 via-transparent to-[#0E0A07]/20 pointer-events-none" />

          {/* "See all photos" Pill Button (Matching Agoda reference) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(0);
              setIsLightboxOpen(true);
            }}
            className="absolute bottom-3.5 left-3.5 z-10 px-3.5 py-1.5 rounded-xl bg-[rgba(22,16,11,0.9)] hover:bg-[#16100B] text-[#FAF4EB] text-xs font-sans font-medium backdrop-blur-md border border-[rgba(212,163,89,0.35)] hover:border-[#E5C178] flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#E5C178]" />
            <span>View all photos</span>
          </button>
        </div>

        {/* 2x2 Thumbnail Grid (Right 5 Cols) */}
        <div className="col-span-5 grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {gridItems.map((item, idx) => (
            <div
              key={item.id || idx}
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveIndex(idx + 1);
                setIsLightboxOpen(true);
              }}
              className="group relative w-full h-full overflow-hidden cursor-pointer bg-[#0E0A07]"
            >
              <Image
                src={item.url || "/images/flats/flat-1bhk-luxury.jpg"}
                alt={item.alt || `${roomTitle} photo ${idx + 2}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 25vw, 300px"
              />
              <div className="absolute inset-0 bg-[#0E0A07]/20 group-hover:bg-transparent transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE PHOTO CAROUSEL VIEW                            */}
      {/* ======================================================== */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsLightboxOpen(true)}
        className="sm:hidden relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[rgba(212,163,89,0.28)] bg-[#0E0A07] cursor-pointer"
        aria-label="Tap to view fullscreen gallery"
      >
        <Image
          src={galleryItems[activeIndex]?.url || "/images/flats/flat-1bhk-luxury.jpg"}
          alt={galleryItems[activeIndex]?.alt || roomTitle}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A07]/70 via-transparent to-[#0E0A07]/20 pointer-events-none" />

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[rgba(22,16,11,0.85)] text-[#FAF4EB] flex items-center justify-center border border-[rgba(212,163,89,0.3)] cursor-pointer shadow-md z-10 hover:bg-[#25221B] transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[rgba(22,16,11,0.85)] text-[#FAF4EB] flex items-center justify-center border border-[rgba(212,163,89,0.3)] cursor-pointer shadow-md z-10 hover:bg-[#25221B] transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Fullscreen Pill */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[rgba(22,16,11,0.9)] text-[#FAF4EB] text-[10px] font-sans font-medium border border-[rgba(212,163,89,0.3)] flex items-center gap-1 backdrop-blur-xs">
          <Camera className="w-3 h-3 text-[#E5C178]" />
          <span>Photos</span>
        </div>

        {/* Index Pill */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-[rgba(22,16,11,0.9)] text-[#FAF4EB] text-[11px] font-sans font-medium border border-[rgba(212,163,89,0.3)] backdrop-blur-xs">
          {activeIndex + 1} / {total}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FULLSCREEN LIGHTBOX MODAL                             */}
      {/* ======================================================== */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0D09]/95 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-[#16100B]/90 hover:bg-[#221810] text-[#FAF4EB] border border-[rgba(212,163,89,0.3)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close fullscreen gallery"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev/Next buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-[#16100B]/90 hover:bg-[#221810] text-[#FAF4EB] border border-[rgba(212,163,89,0.3)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-[#16100B]/90 hover:bg-[#221810] text-[#FAF4EB] border border-[rgba(212,163,89,0.3)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image */}
          <div
            className="relative w-full max-w-5xl h-[80vh] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryItems[activeIndex]?.url || "/images/flats/flat-1bhk-luxury.jpg"}
              alt={galleryItems[activeIndex]?.alt || roomTitle}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#16100B]/90 text-[#FAF4EB] text-xs font-semibold border border-[rgba(212,163,89,0.3)] shadow-lg backdrop-blur-sm">
              {galleryItems[activeIndex]?.alt || `${roomTitle} - Photo ${activeIndex + 1}`} ({activeIndex + 1} of {total})
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
