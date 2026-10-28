import assert from "node:assert/strict";
import { AUTOPLAY_INTERVAL_MS, nextIndex, shouldAutoplay, swipeStep } from "../../lib/carousel/autoplay";

console.log("Running Carousel Autoplay Tests...");

const base = {
  count: 5,
  hovered: false,
  focused: false,
  userInteracted: false,
  inView: true,
  pageVisible: true,
  reducedMotion: false,
};

// 1. Autoplays only when nothing stops it
assert.equal(shouldAutoplay(base), true);
for (const k of ["hovered", "focused", "userInteracted", "reducedMotion"] as const) {
  assert.equal(shouldAutoplay({ ...base, [k]: true }), false, k);
}
assert.equal(shouldAutoplay({ ...base, inView: false }), false);
assert.equal(shouldAutoplay({ ...base, pageVisible: false }), false);

// 2. One or zero photos never autoplay (Review Focus 3)
assert.equal(shouldAutoplay({ ...base, count: 1 }), false);
assert.equal(shouldAutoplay({ ...base, count: 0 }), false);

// 3. Index wraps both ways
assert.equal(nextIndex(4, 5, 1), 0);
assert.equal(nextIndex(0, 5, -1), 4);

// 4. Swipe direction mirrors in RTL (Review Focus 1)
assert.equal(swipeStep(-60, "ltr"), 1);
assert.equal(swipeStep(-60, "rtl"), -1);
assert.equal(swipeStep(60, "ltr"), -1);
assert.equal(swipeStep(10, "ltr"), 0);

assert.equal(AUTOPLAY_INTERVAL_MS, 5000);

console.log("Carousel autoplay tests passed");
