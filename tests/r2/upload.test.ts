import assert from "node:assert/strict";
import { buildImageKey, isSupportedImageSource, sanitizeFolder, sniffImageType } from "../../lib/r2/upload";

console.log("Running R2 Upload Helper Tests...");

// 1. File type is read from the bytes, not the name or declared type
assert.equal(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0])), "image/jpeg");
assert.equal(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), "image/png");
const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
assert.equal(sniffImageType(webp), "image/webp");
assert.equal(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>")), null);
assert.equal(sniffImageType(new TextEncoder().encode("GIF89a")), null);
assert.equal(sniffImageType(new Uint8Array([])), null);

// 2. Folder names cannot escape the bucket path
assert.equal(sanitizeFolder("2bhk"), "2bhk");
assert.equal(sanitizeFolder("../../etc/passwd"), "etc-passwd");
assert.equal(sanitizeFolder("  Barkas Salala "), "barkas-salala");
assert.equal(sanitizeFolder(undefined), "flats");
assert.equal(sanitizeFolder(""), "flats");

// 3. Keys are unique and carry the right extension
const a = buildImageKey("1bhk", "image/webp");
const b = buildImageKey("1bhk", "image/webp");
assert.match(a, /^1bhk\/\d+-[0-9a-f]{8}\.webp$/);
assert.notEqual(a, b);

// 4. Only site paths and R2 hosts are accepted as photo sources
assert.equal(isSupportedImageSource("/images/flats/flat-1bhk.jpg"), true);
assert.equal(isSupportedImageSource("https://pub-abc123.r2.dev/flats/x.jpg"), true);
assert.equal(isSupportedImageSource("http://pub-abc123.r2.dev/flats/x.jpg"), false);
assert.equal(isSupportedImageSource("https://evil.example.com/x.jpg"), false);
assert.equal(isSupportedImageSource("//evil.example.com/x.jpg"), false);
assert.equal(isSupportedImageSource("javascript:alert(1)"), false);

console.log("R2 upload tests passed.");
