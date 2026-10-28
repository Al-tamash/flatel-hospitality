import assert from "node:assert/strict";
import { PURPOSE_IDS, getPurposeLabel, getPurposeServices, isPurposeId } from "../../lib/purpose/purpose-services";
import { PURPOSE_PACKAGES } from "../../lib/mock-rooms";

console.log("Running Purpose Services Tests...");

// 1. The five purposes, in order
assert.deepEqual([...PURPOSE_IDS], ["medical", "wedding", "family", "tourism", "corporate"]);

// 2. Type guard
assert.ok(isPurposeId("wedding"));
assert.ok(!isPurposeId("accommodation_only"));
assert.ok(!isPurposeId(null));

// 3. Free + paid services come straight from the packages
for (const id of PURPOSE_IDS) {
  const { free, paid } = getPurposeServices(id);
  const pkg = PURPOSE_PACKAGES.find((p) => p.id === id)!;
  assert.deepEqual(free, pkg.complimentaryServices);
  assert.deepEqual(paid, pkg.paidAddons);
}

// 4. Labels exist in both languages, including "just the stay"
for (const id of [...PURPOSE_IDS, "accommodation_only"] as const) {
  assert.ok(getPurposeLabel(id, "en").length > 0, id);
  assert.match(getPurposeLabel(id, "ar"), /[\u0600-\u06FF]/, id);
}

console.log("Purpose services tests passed");
