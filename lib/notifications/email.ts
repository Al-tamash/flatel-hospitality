/**
 * Transactional email through Resend's HTTP API. When RESEND_API_KEY and EMAIL_FROM are not set
 * (local development, previews) nothing is sent and callers carry on: the booking or membership
 * is never held up by an email problem.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type EmailResult = { sent: true } | { sent: false; reason: "not_configured" | "failed" };

const SEND_TIMEOUT_MS = 6000;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error("Email provider rejected a message", response.status);
      return { sent: false, reason: "failed" };
    }
    return { sent: true };
  } catch {
    console.error("Email could not be sent");
    return { sent: false, reason: "failed" };
  }
}

/** Public site address used in email links. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
}
