/**
 * Sends one test email through the app's own email code to Resend's test inbox.
 *   npx tsx --env-file=.env.local scripts/check-email.ts
 */
import { isEmailConfigured, sendEmail } from "../lib/notifications/email";

async function main() {
  console.log("Email configured:", isEmailConfigured());
  console.log("Sender:", process.env.EMAIL_FROM);
  const result = await sendEmail({
    to: "delivered@resend.dev",
    subject: "Flatel email check",
    html: "<p>If Resend accepted this, booking and membership emails will work.</p>",
    text: "If Resend accepted this, booking and membership emails will work.",
  });
  console.log("Result:", JSON.stringify(result));
  process.exitCode = result.sent ? 0 : 1;
}

void main();
