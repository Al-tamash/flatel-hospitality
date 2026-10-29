import assert from "node:assert/strict";
import { MAX_CART_FLATS, buildCartItems, encodeCart, isGroupCart, parseCart, splitGuests } from "../../lib/booking/cart";
import { buildFlatDefinitions } from "../../lib/booking/flat-definitions";
import { MOCK_ROOMS } from "../../lib/mock-rooms";

console.log("Running Multi-flat Cart Tests...");

// 1. Round trip
const items = [
  { slug: "1bhk", adults: 2, kids: 0 },
  { slug: "3bhk", adults: 4, kids: 1 },
];
assert.equal(encodeCart(items), "1bhk.2.0,3bhk.4.1");
assert.deepEqual(parseCart("1bhk.2.0,3bhk.4.1"), items);

// 2. Strict parsing: anything odd is rejected, never guessed at
assert.equal(parseCart(null), null);
assert.equal(parseCart(""), null);
assert.equal(parseCart("1bhk.0.0"), null, "a flat needs at least one adult");
assert.equal(parseCart("1BHK.2.0"), null, "slugs are lower case");
assert.equal(parseCart("1bhk.2"), null);
assert.equal(parseCart("1bhk.2.0;drop"), null);
assert.equal(parseCart("../x.2.0"), null);
assert.equal(parseCart("1bhk.2.0,2bhk.2.0,3bhk.2.0,4bhk.2.0,1bhk.2.0"), null, `more than ${MAX_CART_FLATS} flats`);
assert.equal(parseCart("1bhk.2.0,2bhk.2.0,3bhk.2.0,4bhk.2.0")?.length, MAX_CART_FLATS);

// 3. Guests are split evenly and every flat keeps at least one adult
assert.deepEqual(splitGuests(7, 2), [4, 3]);
assert.deepEqual(splitGuests(6, 3), [2, 2, 2]);
assert.deepEqual(splitGuests(0, 2), [0, 0]);
assert.deepEqual(buildCartItems("3bhk", 2, 7, 1), [
  { slug: "3bhk", adults: 4, kids: 1 },
  { slug: "3bhk", adults: 3, kids: 0 },
]);
assert.ok(buildCartItems("3bhk", 2, 1, 0).every((item) => item.adults >= 1));

// 4. Only more than one flat needs the combined checkout
assert.equal(isGroupCart(items), true);
assert.equal(isGroupCart([items[0]]), false);
assert.equal(isGroupCart(null), false);

// 5. Selector rows come from inventory, not hard-coded values
const flats = buildFlatDefinitions(MOCK_ROOMS);
assert.equal(flats.length, MOCK_ROOMS.length);
assert.deepEqual(flats.map((f) => f.id), ["1bhk", "2bhk", "3bhk", "4bhk"]);
const threeBhk = flats.find((f) => f.id === "3bhk")!;
const room3 = MOCK_ROOMS.find((r) => r.slug === "3bhk")!;
assert.equal(threeBhk.availableUnits, room3.totalUnits);
assert.equal(threeBhk.pricePerNight, room3.basePricePerNight);
assert.equal(threeBhk.maxExtraAdults, room3.maxAdults - room3.baseAdults);

const edited = buildFlatDefinitions([{ ...room3, basePricePerNight: 3500, totalUnits: 5 }]);
assert.equal(edited[0].pricePerNight, 3500, "an admin price change reaches the selector");
assert.equal(edited[0].availableUnits, 5, "an admin unit change reaches the selector");
assert.equal(buildFlatDefinitions([{ ...room3, isAvailable: false }]).length, 0, "inactive flats are not offered");

console.log("Cart tests passed.");
