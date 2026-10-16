import fs from "fs";
import path from "path";

const showcaseFile = path.resolve("components/medical-wellness-showcase.tsx");
const content = fs.readFileSync(showcaseFile, "utf-8");

const imageRegex = /imageUrl:\s*"([^"]+)"/g;
const matches = [];
let match;
while ((match = imageRegex.exec(content)) !== null) {
  matches.push(match[1]);
}

console.log(`Found ${matches.length} image references in showcase:`);

let missingCount = 0;
for (const relUrl of matches) {
  const diskPath = path.resolve("public", relUrl.replace(/^\//, ""));
  if (!fs.existsSync(diskPath)) {
    console.error(`❌ MISSING: ${relUrl} -> ${diskPath}`);
    missingCount++;
  } else {
    console.log(`✓ OK: ${relUrl}`);
  }
}

if (missingCount === 0) {
  console.log(`\n🎉 PERFECT: All ${matches.length} images exist and are ready!`);
  process.exit(0);
} else {
  console.error(`\n❌ Found ${missingCount} missing images.`);
  process.exit(1);
}
