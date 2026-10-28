import assert from "node:assert/strict";
import { FOUNDER_PHOTO, getAboutContent } from "../../lib/about-content";

console.log("Running About Content Tests...");

// 1. English copy matches the client's screenshots exactly
const en = getAboutContent("en");
assert.equal(en.headlineLead, "A stay experience");
assert.equal(en.headlineAccent, "redefined.");
assert.ok(
  en.mission.startsWith(
    "Our mission at Flatel is to build Hyderabad's most trusted network of 1,000 premium furnished flats"
  )
);
assert.equal(
  en.vision,
  "Our vision is to redefine the stay experience by combining comfort, convenience, care, and trusted service under one premium brand."
);
assert.deepEqual(
  en.values.map((v) => v.title),
  ["Guest-first hospitality", "Curated comfort", "Trusted service"]
);
assert.equal(en.founder.name, "Osama");
assert.equal(en.founder.role, "Founder & Managing Director");
assert.equal(en.companyLine, "Flatel Hospitality Private Limited");

// 2. Arabic has the same shape, in Arabic
const ar = getAboutContent("ar");
assert.equal(ar.values.length, 3);
assert.ok(ar.mission.length > 0 && /[\u0600-\u06FF]/.test(ar.mission));

// 3. No founder photo yet → monogram placeholder
assert.equal(FOUNDER_PHOTO, null);

console.log("About content tests passed");
