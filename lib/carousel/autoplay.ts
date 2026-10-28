/** Pure rules for the auto-playing photo carousel. */

export const AUTOPLAY_INTERVAL_MS = 5000;

export interface AutoplayState {
  count: number;
  hovered: boolean;
  focused: boolean;
  userInteracted: boolean;
  inView: boolean;
  pageVisible: boolean;
  reducedMotion: boolean;
}

/** Auto-advance only when there is something to advance to and nothing asks it to wait. */
export function shouldAutoplay(s: AutoplayState): boolean {
  return (
    s.count > 1 &&
    !s.hovered &&
    !s.focused &&
    !s.userInteracted &&
    s.inView &&
    s.pageVisible &&
    !s.reducedMotion
  );
}

/** Next slide index, wrapping at both ends. */
export function nextIndex(current: number, count: number, step: 1 | -1): number {
  if (count <= 0) return 0;
  return (current + step + count) % count;
}

/**
 * Slide step for a horizontal swipe. Swiping toward the reading direction's start
 * (left in LTR, right in RTL) moves forward.
 */
export function swipeStep(deltaX: number, dir: "ltr" | "rtl", threshold = 40): 0 | 1 | -1 {
  if (Math.abs(deltaX) < threshold) return 0;
  const forward = dir === "ltr" ? deltaX < 0 : deltaX > 0;
  return forward ? 1 : -1;
}
