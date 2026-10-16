import fs from "fs";
import path from "path";

const target = path.resolve("components/medical-wellness-showcase.tsx");
let code = fs.readFileSync(target, "utf-8");

const weddingBlockRegex = /(export const WEDDING_CARE_ITEMS: ShowcaseItem\[\] = \[[\s\S]*?\];)/;
const match = code.match(weddingBlockRegex);
if (!match) {
  console.error("WEDDING_CARE_ITEMS block not found!");
  process.exit(1);
}

const updatedBlock = match[1].replace(
  /imageUrl:\s*"\/images\/wedding\/[^"]+"/g,
  'imageUrl: "/images/wedding/flatel-royal-wedding.jpg"'
);

code = code.replace(match[1], updatedBlock);
fs.writeFileSync(target, code, "utf-8");

console.log("Successfully updated all 17 wedding items to use /images/wedding/flatel-royal-wedding.jpg!");
