import assert from "node:assert/strict";
import { buildGalleryItems, padGalleryWithPlaceholders, GALLERY_FALLBACK_IMAGE, GALLERY_MIN_PHOTOS } from "../../lib/carousel/gallery";

console.log("Running Gallery Items Tests...");

// 1. Real photos pass through untouched — never padded with generic photos
const one = buildGalleryItems([{ url: "/a.jpg", alt: "", category: "Bedroom" }], "2 BHK");
assert.deepEqual(one, [{ url: "/a.jpg", alt: "2 BHK", category: "Bedroom" }]);
assert.equal(buildGalleryItems([{ url: "/a.jpg" }, { url: "/b.jpg" }, { url: "/c.jpg" }], "X").length, 3);

// 2. Photos without a URL are dropped
assert.equal(buildGalleryItems([{ url: "" }, { url: "/b.jpg" }], "X").length, 1);

// 3. No photos at all → one neutral fallback image
assert.deepEqual(buildGalleryItems([], "2 BHK"), [{ url: GALLERY_FALLBACK_IMAGE, alt: "2 BHK" }]);
assert.deepEqual(buildGalleryItems(undefined, "2 BHK"), [{ url: GALLERY_FALLBACK_IMAGE, alt: "2 BHK" }]);

// 4. Flat page: the flat's own photos come first and are never reordered or relabelled
const padded = padGalleryWithPlaceholders([{ url: "/real-1.jpg" }], "1 BHK Deluxe Suite", { category: "1BHK", branchSlug: "moghal-pura" });
assert.equal(padded.length, GALLERY_MIN_PHOTOS);
assert.equal(padded[0].url, "/real-1.jpg");
assert.equal(padded[0].placeholder, undefined);
assert.equal(padded[0].alt, "1 BHK Deluxe Suite — photo 1 of 5");
assert.ok(padded.slice(1).every((p) => p.placeholder === true));

// 5. Stand-ins are flagged, unique, local interiors (no exteriors, no other cities)
assert.equal(new Set(padded.map((p) => p.url)).size, padded.length);
assert.ok(padded.slice(1).every((p) => p.url.startsWith("/images/")));
assert.ok(padded.slice(1).every((p) => p.alt.startsWith("1 BHK Deluxe Suite — ") && !/representative/i.test(p.alt)));

// 6. A photo the flat already has is not repeated as a stand-in
const own = padGalleryWithPlaceholders([{ url: "/images/flats/flat-2bhk-luxury.jpg" }], "2 BHK", { category: "2BHK" });
assert.equal(own.filter((p) => p.url === "/images/flats/flat-2bhk-luxury.jpg").length, 1);

// 7. Enough real photos: nothing is added, and every photo is kept (none dropped past the grid size)
const six = padGalleryWithPlaceholders(Array.from({ length: 6 }, (_, i) => ({ url: `/p${i}.jpg` })), "X");
assert.equal(six.length, 6);
assert.ok(six.every((p) => !p.placeholder));

// 8. No photos at all: a full set of stand-ins, Arabic alt text on the Arabic page
const none = padGalleryWithPlaceholders(undefined, "3 BHK", { category: "3BHK", branchSlug: "barkas-salala", isAr: true });
assert.equal(none.length, GALLERY_MIN_PHOTOS);
assert.ok(none.every((p) => p.placeholder && p.alt.startsWith("3 BHK — ") && !/تعبيرية/.test(p.alt)));

console.log("Gallery items tests passed");
