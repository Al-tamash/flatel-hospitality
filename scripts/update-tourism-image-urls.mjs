import fs from "fs";
import path from "path";

const target = path.resolve("components/medical-wellness-showcase.tsx");
let code = fs.readFileSync(target, "utf-8");

const tourismBlockRegex = /(export const TOURISM_CARE_ITEMS: ShowcaseItem\[\] = \[[\s\S]*?\];)/;
const match = code.match(tourismBlockRegex);
if (!match) {
  console.error("TOURISM_CARE_ITEMS block not found!");
  process.exit(1);
}

const updatedBlock = match[1].replace(
  /imageUrl:\s*"\/images\/tourism\/([^"]+)"/g,
  'imageUrl: "/images/tourism/destinations/$1"'
);

code = code.replace(match[1], updatedBlock);
fs.writeFileSync(target, code, "utf-8");

console.log("Successfully updated all 18 tourism items to /images/tourism/destinations/!");
