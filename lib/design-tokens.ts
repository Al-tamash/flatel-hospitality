/**
 * Hex mirrors of the colour tokens in app/globals.css, for the few places that cannot read a CSS variable
 * (the Razorpay checkout theme, the browser theme-color meta tag, HTML emails).
 * globals.css is the source of truth: tests/design/tokens.test.ts fails if these drift from it.
 */
export const BRAND_HEX = {
  canvas: "#0E0A07",
  surface: "#16100B",
  raised: "#221810",
  gold: "#E5C178",
  goldDeep: "#C69344",
  ink: "#140E08",
  fg: "#FAF4EB",
} as const;
