import assert from "node:assert/strict";
import { getLocalizedRoom, getLocalizedRooms } from "../../lib/i18n/room-localizer";
import { MOCK_ROOMS } from "../../lib/mock-rooms";

console.log("Running Room & Inventory Localizer Tests...");

const room1bhk = MOCK_ROOMS.find((r) => r.slug === "1bhk")!;
assert.ok(room1bhk, "1 BHK room exists in mock data");

// 1. English returns original room unchanged
const enRoom = getLocalizedRoom(room1bhk, "en");
assert.equal(enRoom.title, "1 BHK Deluxe Suite");
assert.equal(enRoom.specs.bedrooms, "1 Master Bedroom");

// 2. Arabic returns natural Arabic translated room
const arRoom = getLocalizedRoom(room1bhk, "ar");
assert.ok(arRoom.title.length > 0, "Arabic title must exist");
assert.notEqual(arRoom.title, enRoom.title, "Arabic title should be translated");
assert.ok(arRoom.shortDescription.length > 0, "Arabic short description must exist");
assert.ok(arRoom.specs.bedrooms.includes("غرف") || arRoom.specs.bedrooms.includes("غرفة"), "Bedrooms in Arabic");
assert.ok(arRoom.specs.bathroom.includes("حمام") || arRoom.specs.bathroom.includes("دورة مياه"), "Bathroom in Arabic");
assert.ok(arRoom.specs.kitchen.includes("مطبخ"), "Kitchen in Arabic");

// 3. Amenities localized
const arAmenity = arRoom.amenities.find((a) => a.iconName === "Wifi");
assert.ok(arAmenity, "Wifi amenity exists");
assert.ok(arAmenity.name.includes("واي فاي") || arAmenity.name.includes("إنترنت"), "Wifi translated to Arabic");

// 4. Batch localization
const allArRooms = getLocalizedRooms(MOCK_ROOMS, "ar");
assert.equal(allArRooms.length, MOCK_ROOMS.length, "All rooms localized");
assert.ok(allArRooms.every((r) => r.title && r.specs), "All localized rooms have title and specs");

console.log("✓ All Room & Inventory Localizer tests passed successfully!");
