import { BRANCH_PROFILES } from "@/lib/branch-data";

export type LatLng = [number, number];

const EARTH_RADIUS_KM = 6371;

/** Great-circle (haversine) distance between two [lat, lng] points in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** The Flatel branch closest to a point. */
export function nearestBranch(p: LatLng): { slug: string; km: number } {
  let best = { slug: "", km: Infinity };
  for (const branch of Object.values(BRANCH_PROFILES)) {
    const km = distanceKm(p, branch.coordinates);
    if (km < best.km) best = { slug: branch.slug, km };
  }
  return best;
}
