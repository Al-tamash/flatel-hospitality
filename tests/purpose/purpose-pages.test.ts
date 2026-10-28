import assert from "node:assert/strict";
import {
  getPurposePage,
  purposeHref,
  recommendFlats,
  weddingServicesExcludingPaid,
} from "../../lib/purpose/purpose-pages";
import { PURPOSE_IDS, getPurposeServices } from "../../lib/purpose/purpose-services";
import { WEDDING_SERVICES } from "../../lib/services-catalog";

console.log("Running Purpose Pages Tests...");

// 1. Every purpose has a complete page in both languages
for (const id of PURPOSE_IDS) {
  for (const l of ["en", "ar"] as const) {
    const p = getPurposePage(id, l);
    assert.ok(p.title && p.seo.title && p.seo.description && p.faq.length >= 3 && p.faq.length <= 5, `${id}/${l}`);
  }
}

// 2. URLs per locale
assert.equal(purposeHref("medical", "en"), "/stays/medical");
assert.equal(purposeHref("wedding", "ar"), "/ar/stays/wedding");

// 3. Larger flats first for wedding and family; default order otherwise
const rooms = [
  { slug: "1bhk", maxAdults: 2 },
  { slug: "4bhk", maxAdults: 8 },
  { slug: "2bhk", maxAdults: 4 },
];
assert.deepEqual(recommendFlats("wedding", rooms).map((r) => r.slug), ["4bhk", "2bhk", "1bhk"]);
assert.deepEqual(recommendFlats("family", rooms).map((r) => r.slug), ["4bhk", "2bhk", "1bhk"]);
assert.deepEqual(recommendFlats("medical", rooms).map((r) => r.slug), ["1bhk", "4bhk", "2bhk"]);

// 4. Wedding services never repeat a paid add-on
const paid = getPurposeServices("wedding").paid;
const kept = weddingServicesExcludingPaid(WEDDING_SERVICES, paid);
assert.ok(kept.length < WEDDING_SERVICES.length);
assert.ok(kept.every((s) => !paid.some((p) => p.name.toLowerCase() === s.title.toLowerCase())));

// 5. Purpose-specific block
assert.equal(getPurposePage("medical", "en").extraBlock, "hospitals");

console.log("Purpose pages tests passed");
