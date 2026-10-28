import assert from "node:assert/strict";
import { STAR_COLORS, generateStars } from "../../lib/starlight/generate-stars";

console.log("Running Starlight Generator Tests...");

// 1. Deterministic for a seed
const s1 = generateStars({ seed: 7, count: 130 });
const s2 = generateStars({ seed: 7, count: 130 });
assert.deepEqual(s1, s2);
assert.equal(s1.length, 130);

// 2. Positions are fractions; colours come from the warm palette
assert.ok(s1.every((s) => s.x >= 0 && s.x <= 1 && s.y >= 0 && s.y <= 1 && STAR_COLORS.includes(s.color)));

// 3. A handful of flare stars
const flares = s1.filter((s) => s.flare).length;
assert.ok(flares >= 3 && flares <= 10, `flares=${flares}`);

// 4. Subtle: never fully opaque, never big
assert.ok(s1.every((s) => s.baseAlpha <= 0.85 && s.r <= 2.2));

// 5. Different seed, different sky
assert.notDeepEqual(generateStars({ seed: 8, count: 130 }), s1);

console.log("Starlight generator tests passed");
