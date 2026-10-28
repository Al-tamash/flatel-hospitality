import assert from "node:assert/strict";
import { distanceKm, nearestBranch } from "../../lib/map/geo";
import { BRANCH_PINS, MAP_PLACES } from "../../lib/map/places";
import { GOLD_TILE_LAYER, buildFlagPinHtml } from "../../components/map/map-style";

console.log("Running Map Kit Tests...");

// 1. Haversine distance
assert.ok(Math.abs(distanceKm([17.3616, 78.4747], [17.3616, 78.4747])) < 1e-9);
assert.ok(Math.abs(distanceKm([17.3185, 78.4905], [17.357, 78.4815]) - 4.38) < 0.2); // Barkas ↔ Moghal Pura

// 2. Branch pins come from the single branch source
assert.equal(BRANCH_PINS.length, 2);
assert.deepEqual(BRANCH_PINS.find((b) => b.slug === "moghal-pura")!.coordinates, [17.357, 78.4815]);

// 3. Places are inside Hyderabad, unverified and sourced
for (const p of MAP_PLACES) {
  assert.ok(
    p.coordinates[0] > 17.2 && p.coordinates[0] < 17.6 && p.coordinates[1] > 78.3 && p.coordinates[1] < 78.7,
    p.name
  );
  assert.equal(p.verified, false);
  assert.ok(p.nameAr.length > 0 && p.source.length > 0);
}
assert.ok(MAP_PLACES.some((p) => p.category === "hospital") && MAP_PLACES.some((p) => p.category === "heritage"));

// 4. Nearest branch to Charminar
assert.equal(nearestBranch([17.3616, 78.4747]).slug, "moghal-pura");

// 5. Flag pin: black body, gold accents, no monospace label, glow when active
const flag = buildFlagPinHtml({ active: false, id: "x" });
assert.match(flag, /#E5C178/i);
assert.match(flag, /#0E0A07|#000|#16100B/i);
assert.doesNotMatch(flag, /monospace/i);
assert.match(buildFlagPinHtml({ active: true, id: "x" }), /drop-shadow|glow/i);

// 6. Carto dark tiles
assert.match(GOLD_TILE_LAYER.url, /basemaps\.cartocdn\.com\/dark_/);

console.log("Map places tests passed");
