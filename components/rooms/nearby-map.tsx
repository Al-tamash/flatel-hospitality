"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { BRANCH_PINS } from "@/lib/map/places";
import { buildFlagPinHtml, FLAG_PIN_ANCHOR, FLAG_PIN_SIZE } from "@/components/map/map-style";
import { useLeafletMap } from "@/components/map/use-leaflet-map";

interface NearbyMapProps {
  branchSlug: string;
  googleMapsUrl?: string;
}

const HYDERABAD_CENTER: [number, number] = [17.3378, 78.486];

/** Gold-on-black map centred on a flat's branch, loaded only when scrolled near. */
export function NearbyMap({ branchSlug, googleMapsUrl }: NearbyMapProps) {
  const isAr = usePathname()?.startsWith("/ar");
  const pin = BRANCH_PINS.find((b) => b.slug === branchSlug);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { map, L, tileError, tilesLoading } = useLeafletMap(containerRef, {
    center: pin?.coordinates ?? HYDERABAD_CENTER,
    zoom: 15,
    lazy: true,
    scrollWheelZoomOnClick: true,
  });

  React.useEffect(() => {
    if (!map || !L || !pin) return;
    const marker = L.marker(pin.coordinates, {
      icon: L.divIcon({
        className: "",
        html: buildFlagPinHtml({ active: true, id: pin.slug }),
        iconSize: FLAG_PIN_SIZE,
        iconAnchor: FLAG_PIN_ANCHOR,
      }),
      title: `Flatel ${pin.name}`,
    }).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, L, pin]);

  return (
    <div className="relative h-[240px] lg:h-[320px] rounded-2xl overflow-hidden border border-line bg-canvas">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        role="region"
        aria-label={isAr ? `خريطة موقع ${pin?.nameAr ?? ""}` : `Map of ${pin?.name ?? "the branch"}`}
      />

      {map && tilesLoading && !tileError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
        </div>
      )}

      {tileError && (
        <p className="absolute inset-x-3 top-3 z-20 p-2.5 rounded-lg bg-surface/95 border border-line-strong text-xs text-fg-soft">
          {isAr
            ? "تعذّر تحميل الخريطة حالياً. استخدم رابط خرائط Google للتوجيه."
            : "The map couldn’t load right now. Use the Google Maps link for directions."}
        </p>
      )}

      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 start-3 z-20 inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-full bg-canvas/90 border border-line-strong hover:border-gold text-xs font-semibold text-fg transition-colors"
        >
          <span>{isAr ? "افتح في خرائط Google" : "Open in Google Maps"}</span>
          <ExternalLink className="w-3.5 h-3.5 text-gold" />
        </a>
      )}
    </div>
  );
}
