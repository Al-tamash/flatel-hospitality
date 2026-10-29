import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2PublicUrl, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL } from "./client";

/** Vercel rejects request bodies above ~4.5MB, so stay safely under it. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 12;

export type UploadImageType = "image/jpeg" | "image/png" | "image/webp";

const EXTENSION_BY_TYPE: Record<UploadImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** True once the R2 credentials and account id have been added to the environment. */
export function isR2Configured(): boolean {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  return Boolean(
    accountId &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET_NAME
  );
}

/** Identify the real image format from the first bytes; the browser-supplied MIME type is not trusted. */
export function sniffImageType(bytes: Uint8Array): UploadImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

/** Folder names become part of the object key, so keep them to a safe slug. */
export function sanitizeFolder(raw: unknown): string {
  const value = typeof raw === "string" ? raw.toLowerCase().trim() : "";
  const cleaned = value.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return cleaned || "flats";
}

export function buildImageKey(folder: string, type: UploadImageType): string {
  return `${sanitizeFolder(folder)}/${Date.now()}-${randomUUID().slice(0, 8)}.${EXTENSION_BY_TYPE[type]}`;
}

/** Store one validated image in R2 and return its public URL. */
export async function putImage(key: string, body: Uint8Array, type: UploadImageType): Promise<string> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return getR2PublicUrl(key);
}

/**
 * Photo sources the catalogue accepts: site-relative paths, or https URLs on the
 * configured R2 public host (or any r2.dev host).
 */
export function isSupportedImageSource(source: string): boolean {
  if (source.startsWith("/") && !source.startsWith("//") && !source.startsWith("/\\")) return true;
  try {
    const url = new URL(source);
    if (url.protocol !== "https:") return false;
    return url.hostname === new URL(R2_PUBLIC_BASE_URL).hostname || url.hostname.endsWith(".r2.dev");
  } catch {
    return false;
  }
}
