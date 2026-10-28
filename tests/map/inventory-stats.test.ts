import assert from "node:assert/strict";
import { getTotalResidenceUnits, getUnitCapsByFlatType } from "../../lib/inventory-stats";
import { MOCK_ROOMS } from "../../lib/mock-rooms";

console.log("Running Inventory Stats Tests...");

// 1. Total physical units across all flat types
assert.equal(getTotalResidenceUnits(MOCK_ROOMS), 5);

// 2. Unit caps per flat type come from inventory
assert.deepEqual(getUnitCapsByFlatType(MOCK_ROOMS), { "1bhk": 1, "2bhk": 1, "3bhk": 2, "4bhk": 1 });

// 3. Missing totalUnits counts as one unit
assert.equal(getTotalResidenceUnits([{}, { totalUnits: 2 }]), 3);

console.log("Inventory stats tests passed");
