import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth-guard";
import {
  MAX_FILES_PER_UPLOAD,
  MAX_UPLOAD_BYTES,
  buildImageKey,
  isR2Configured,
  putImage,
  sniffImageType,
} from "@/lib/r2/upload";

/** Admin-only photo upload: validates each image and stores it in Cloudflare R2. */
export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return NextResponse.json(
      { success: false, error: authCheck.error || "Unauthorized access." },
      { status: authCheck.status || 401 }
    );
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Photo storage is not configured. Set CLOUDFLARE_R2_ACCOUNT_ID (or CLOUDFLARE_ACCOUNT_ID), CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY and CLOUDFLARE_R2_BUCKET_NAME, then restart the server.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Upload could not be read." }, { status: 400 });
  }

  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0 || files.length > MAX_FILES_PER_UPLOAD) {
    return NextResponse.json(
      { success: false, error: `Choose between 1 and ${MAX_FILES_PER_UPLOAD} photos.` },
      { status: 400 }
    );
  }

  const folder = form.get("folder");
  const urls: string[] = [];
  const failed: Array<{ name: string; error: string }> = [];

  for (const file of files) {
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      failed.push({ name: file.name, error: "Photo must be under 4 MB." });
      continue;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = sniffImageType(bytes);
    if (!type) {
      failed.push({ name: file.name, error: "Only JPG, PNG or WebP photos are allowed." });
      continue;
    }
    try {
      urls.push(await putImage(buildImageKey(typeof folder === "string" ? folder : "", type), bytes, type));
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : "Storage rejected the photo.";
      failed.push({ name: file.name, error: `Upload to storage failed: ${reason}` });
    }
  }

  const success = urls.length > 0;
  return NextResponse.json({ success, urls, failed, error: success ? undefined : failed[0]?.error }, { status: success ? 200 : 400 });
}
