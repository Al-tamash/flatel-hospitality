import assert from "node:assert/strict";
import { nearbyPlaces } from "../../lib/map/places";

console.log("Running Nearby Places Tests...");

// 1. Closest places first, limited, with km to that branch
const moghal = nearbyPlaces("moghal-pura", 5);
assert.equal(moghal.length, 5);
assert.ok(moghal.every((p, i) => i === 0 || moghal[i - 1].km <= p.km), "sorted by distance");
assert.equal(moghal[0].id, "princess-esra"); // ~0.75 km from Moghal Pura
assert.ok(moghal[0].km > 0.3 && moghal[0].km < 1.5);

// 2. Unknown branch → empty list
assert.deepEqual(nearbyPlaces("nowhere", 5), []);

console.log("Nearby places tests passed");
