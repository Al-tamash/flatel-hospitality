import assert from "node:assert/strict";
import { getDictionary, getLocaleFromPath, isValidLocale } from "../../lib/i18n";
import { enDictionary } from "../../lib/i18n/dictionaries/en";
import { arDictionary } from "../../lib/i18n/dictionaries/ar";

console.log("Running Dictionary & i18n Core Tests...");

// 1. Verify getDictionary returns valid dictionaries
const en = getDictionary("en");
const ar = getDictionary("ar");

assert.equal(en.common.brandName, "Flatel Hospitality", "English brand name must match");
assert.ok(ar.common.brandName.length > 0, "Arabic brand name must exist");
assert.equal(en.common.switchLanguage, "Language", "English language switcher label");
assert.equal(ar.common.switchLanguage, "اللغة", "Arabic language switcher label");

// 2. Helper validation tests
assert.equal(getLocaleFromPath("/"), "en");
assert.equal(getLocaleFromPath("/properties"), "en");
assert.equal(getLocaleFromPath("/ar"), "ar");
assert.equal(getLocaleFromPath("/ar/properties"), "ar");
assert.equal(getLocaleFromPath("/ar/rooms/barkas-3bhk"), "ar");

assert.equal(isValidLocale("en"), true);
assert.equal(isValidLocale("ar"), true);
assert.equal(isValidLocale("fr"), false);

// 3. Deep key comparison between English and Arabic dictionaries
function getKeys(obj: object, prefix = ""): string[] {
  const record = obj as Record<string, unknown>;
  return Object.keys(record).flatMap((key) => {
    const val = record[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return getKeys(val, fullKey);
    }
    return [fullKey];
  });
}

const enKeys = getKeys(enDictionary).sort();
const arKeys = getKeys(arDictionary).sort();

const missingInAr = enKeys.filter((k) => !arKeys.includes(k));
const missingInEn = arKeys.filter((k) => !enKeys.includes(k));

assert.deepEqual(missingInAr, [], `Keys missing in Arabic dictionary: ${missingInAr.join(", ")}`);
assert.deepEqual(missingInEn, [], `Keys missing in English dictionary: ${missingInEn.join(", ")}`);

console.log("✓ All i18n core dictionary tests passed successfully!");
