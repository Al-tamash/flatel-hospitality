"use client";

import * as React from "react";
import type { Map as LeafletMap } from "leaflet";
import { GOLD_TILE_LAYER } from "./map-style";

type LeafletModule = typeof import("leaflet");

interface UseLeafletMapOptions {
  center: [number, number];
  zoom: number;
  /** Wait until the container is near the viewport before loading Leaflet and tiles. */
  lazy?: boolean;
  /** Keep scroll-wheel zoom off until the user clicks the map, so page scroll isn't hijacked. */
  scrollWheelZoomOnClick?: boolean;
}

/**
 * Client-only Leaflet loader. Creates a map with the gold tile layer and
 * reports tile loading/error state. The map is removed on unmount.
 */
export function useLeafletMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  { center, zoom, lazy = false, scrollWheelZoomOnClick = false }: UseLeafletMapOptions
): { map: LeafletMap | null; L: LeafletModule | null; tileError: boolean; tilesLoading: boolean } {
  const [map, setMap] = React.useState<LeafletMap | null>(null);
  const [L, setL] = React.useState<LeafletModule | null>(null);
  const [tileError, setTileError] = React.useState(false);
  const [tilesLoading, setTilesLoading] = React.useState(true);
  const [shouldLoad, setShouldLoad] = React.useState(
    () => !lazy || typeof IntersectionObserver === "undefined"
  );

  // Initial view only; later changes are applied by the caller via map APIs.
  const initialView = React.useRef({ center, zoom });

  React.useEffect(() => {
    if (shouldLoad || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoad, containerRef]);

  React.useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    let instance: LeafletMap | null = null;

    import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current) return;

      instance = leaflet.map(containerRef.current, {
        center: initialView.current.center,
        zoom: initialView.current.zoom,
        minZoom: 11,
        maxZoom: 18,
        scrollWheelZoom: false,
        zoomControl: false,
      });
      leaflet.control.zoom({ position: "topright" }).addTo(instance);

      const tiles = leaflet.tileLayer(GOLD_TILE_LAYER.url, GOLD_TILE_LAYER.options).addTo(instance);
      tiles.on("loading", () => setTilesLoading(true));
      tiles.on("load", () => {
        setTilesLoading(false);
        setTileError(false);
      });
      tiles.on("tileerror", () => {
        setTilesLoading(false);
        setTileError(true);
      });

      if (scrollWheelZoomOnClick) {
        const enable = () => instance?.scrollWheelZoom.enable();
        instance.once("click", enable);
        instance.once("focus", enable);
      }

      setL(leaflet);
      setMap(instance);
    });

    return () => {
      cancelled = true;
      if (instance) instance.remove();
      setMap(null);
    };
  }, [shouldLoad, containerRef, scrollWheelZoomOnClick]);

  return { map, L, tileError, tilesLoading };
}
