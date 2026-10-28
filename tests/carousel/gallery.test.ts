import assert from "node:assert/strict";
import { buildGalleryItems, GALLERY_FALLBACK_IMAGE } from "../../lib/carousel/gallery";

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

console.log("Gallery items tests passed");
