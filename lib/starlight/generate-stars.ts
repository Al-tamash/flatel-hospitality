/** Deterministic star field for the starlight effect (positions are 0–1 fractions). */

export interface Star {
  x: number;
  y: number;
  r: number;
  color: string;
  baseAlpha: number;
  /** Radians per millisecond. */
  twinkleSpeed: number;
  phase: number;
  flare: boolean;
}

// Warm white to soft gold — never pure white, to sit inside the Flatel palette
export const STAR_COLORS = ["#FFF8EC", "#FAF4EB", "#F3E2BD", "#E5C178"];

/** mulberry32: small seeded PRNG so server and client agree on the sky. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateStars({ seed, count }: { seed: number; count: number }): Star[] {
  const rand = mulberry32(seed);
  // Roughly one flare per 25 stars, at least 3
  const flareCount = Math.max(3, Math.min(10, Math.round(count / 25)));
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const flare = i < flareCount;
    // Twinkle period between 4 s and 9 s
    const periodMs = 4000 + rand() * 5000;
    stars.push({
      x: rand(),
      y: rand(),
      r: flare ? 1.4 + rand() * 0.8 : 0.6 + rand() * 0.9,
      color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
      baseAlpha: flare ? 0.7 + rand() * 0.15 : 0.35 + rand() * 0.45,
      twinkleSpeed: (2 * Math.PI) / periodMs,
      phase: rand() * 2 * Math.PI,
      flare,
    });
  }
  return stars;
}
