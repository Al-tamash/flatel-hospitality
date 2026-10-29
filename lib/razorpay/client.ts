import Razorpay from "razorpay";

/**
 * Razorpay Server SDK Initialization
 * Server-side helper for order generation and HMAC SHA256 payment signature verification.
 */

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

/**
 * Returns why payments cannot run in this environment, or null when they can.
 * Preview and local environments only ever accept Razorpay test keys.
 */
export function getPaymentConfigError(): string | null {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const hasCredentials = keyId.startsWith("rzp_") && keySecret.length > 0;
  const isNonProduction = process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

  if (!hasCredentials || (isNonProduction && !keyId.startsWith("rzp_test_"))) {
    return "Secure test payment is not configured for this environment.";
  }
  return null;
}
