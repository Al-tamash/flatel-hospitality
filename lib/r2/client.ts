import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 Storage Architecture
 *
 * NOTE: As per architecture requirements, Cloudflare R2 is the designated object
 * storage for all website images, property images, room photos, and galleries.
 * Supabase Storage is NOT used.
 * Database tables store R2 object keys and CDN URLs.
 */

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || "";
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "flatel-hospitality";
export const R2_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.CLOUDFLARE_R2_PUBLIC_URL ||
  "https://pub-f471c3e24db144a6a94c290eececee02.r2.dev";

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    r2ClientInstance = new S3Client({
      region: "auto",
      endpoint: accountId
        ? `https://${accountId}.r2.cloudflarestorage.com`
        : "https://placeholder-account.r2.cloudflarestorage.com",
      credentials: {
        accessKeyId: accessKeyId || "placeholder-access-key",
        secretAccessKey: secretAccessKey || "placeholder-secret-key",
      },
    });
  }
  return r2ClientInstance;
}

/**
 * Resolves a storage key or path to a public CDN URL.
 */
export function getR2PublicUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${cleanKey}`;
}
