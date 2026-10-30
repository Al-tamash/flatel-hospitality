import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BRAND_HEX } from "../../lib/design-tokens";

console.log("Running Design Token Tests...");

const css = readFileSync("app/globals.css", "utf8");
const token = (name: string) => new RegExp(`--${name}:[ 	]*(#[0-9A-Fa-f]{6})`).exec(css)?.[1]?.toUpperCase();

// 1. The hex mirrors match the CSS tokens
assert.equal(token("canvas"), BRAND_HEX.canvas);
assert.equal(token("surface"), BRAND_HEX.surface);
assert.equal(token("raised"), BRAND_HEX.raised);
assert.equal(token("gold"), BRAND_HEX.gold);
assert.equal(token("gold-deep"), BRAND_HEX.goldDeep);
assert.equal(token("ink"), BRAND_HEX.ink);
assert.equal(token("fg"), BRAND_HEX.fg);

// 2. Text tokens keep WCAG AA (4.5:1) on every surface
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
for (const text of ["fg", "fg-soft", "fg-muted", "fg-faint", "gold"]) {
  for (const surface of ["canvas", "surface", "raised"]) {
    const ratioValue = ratio(token(text)!, token(surface)!);
    assert.ok(ratioValue >= 4.5, `${text} on ${surface} is ${ratioValue.toFixed(2)}:1`);
  }
}
assert.ok(ratio(token("ink")!, token("gold")!) >= 4.5, "ink on gold");
assert.ok(ratio(token("ink")!, token("gold-deep")!) >= 4.5, "ink on gold-deep");

console.log("Design token tests passed");
