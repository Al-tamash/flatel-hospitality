import fs from "fs";
import path from "path";

async function run() {
  console.log("=== Testing FLATEL Property Details 3D Illustrated Icons ===");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Verify existence of Stay Purpose 3D image assets
  console.log("\n1. Verifying Stay Purpose 3D image assets...");
  const purposeFiles = [
    "purpose-medistay.jpg",
    "purpose-wedding.jpg",
    "purpose-family.jpg",
    "purpose-wanderer.jpg",
    "purpose-corporate.jpg",
  ];
  for (const f of purposeFiles) {
    const fullPath = path.join(process.cwd(), "public", "images", "purposes", f);
    assert(fs.existsSync(fullPath), `public/images/purposes/${f} exists`);
  }

  // 2. Verify existence of Amenity 3D icon assets
  console.log("\n2. Verifying Key Amenity 3D icon assets...");
  const amenityFiles = [
    "icon-air-conditioning.png",
    "icon-high-speed-wifi.png",
    "icon-kitchen-dining.png",
    "icon-laundry-washing.png",
    "icon-parking.png",
    "icon-housekeeping.png",
    "icon-power-backup.png",
    "icon-elevator.png",
    "icon-refrigerator.png",
    "icon-microwave.png",
    "icon-hot-water.png",
    "icon-smart-tv.png",
    "icon-bedroom-comfort.png",
    "icon-bathroom-care.png",
    "icon-living-room.png",
    "icon-dining-space.png",
    "icon-work-desk.png",
    "icon-security-24-7.png",
  ];
  for (const f of amenityFiles) {
    const fullPath = path.join(process.cwd(), "public", "images", "amenities", f);
    assert(fs.existsSync(fullPath), `public/images/amenities/${f} exists`);
  }

  // 3. Test HTTP 200 and HTML rendering on /properties/1bhk
  console.log("\n3. Testing property details page rendering on /properties/1bhk...");
  try {
    const res = await fetch("http://localhost:3000/properties/1bhk");
    assert(res.status === 200, "GET /properties/1bhk returns 200 OK");
    const html = await res.text();

    assert(html.includes("Included with your flat"), "Contains 'Included with your flat' section");
    assert(html.includes("Make your stay work for you"), "Contains 'Make your stay work for you' section");

    // Check amenity 3D images rendered in HTML (encoded or raw URL)
    assert(html.includes("icon-air-conditioning.png"), "Renders 3D AC illustration");
    assert(html.includes("icon-high-speed-wifi.png"), "Renders 3D Wi-Fi illustration");
    assert(html.includes("icon-kitchen-dining.png"), "Renders 3D Kitchen illustration");
    assert(html.includes("icon-laundry-washing.png"), "Renders 3D Washing machine illustration");
    assert(html.includes("icon-parking.png"), "Renders 3D Parking illustration");
    assert(html.includes("icon-housekeeping.png"), "Renders 3D Housekeeping illustration");
    assert(html.includes("icon-power-backup.png"), "Renders 3D Power backup illustration");
    assert(html.includes("icon-elevator.png"), "Renders 3D Elevator illustration");

    // Check stay purpose 3D images rendered in HTML
    assert(html.includes("purpose-medistay.jpg"), "Renders 3D Medistay illustration");
    assert(html.includes("purpose-wedding.jpg"), "Renders 3D Wedding stay illustration");
    assert(html.includes("purpose-family.jpg"), "Renders 3D Family vacation illustration");
    assert(html.includes("purpose-wanderer.jpg"), "Renders 3D Wanderer illustration");
    assert(html.includes("purpose-corporate.jpg"), "Renders 3D Corporate illustration");

    // Verify key titles still present
    assert(html.includes("Private Modular Kitchen"), "Contains 'Private Modular Kitchen'");
    assert(html.includes("Split Air Conditioning"), "Contains 'Split Air Conditioning'");
    assert(html.includes("Medistay"), "Contains 'Medistay'");
    assert(html.includes("Wedding Stay"), "Contains 'Wedding Stay'");
    assert(html.includes("Family Vacation"), "Contains 'Family Vacation'");
    assert(html.includes("Wanderer"), "Contains 'Wanderer'");
    assert(html.includes("Corporate"), "Contains 'Corporate'");
  } catch (err) {
    console.error("HTTP Fetch Error:", err);
    failed++;
  }

  // 4. Test HTTP 200 on /rooms/3bhk
  console.log("\n4. Testing /rooms/3bhk alias route...");
  try {
    const resRoom = await fetch("http://localhost:3000/rooms/3bhk");
    assert(resRoom.status === 200, "GET /rooms/3bhk returns 200 OK");
  } catch (err) {
    console.error("HTTP Fetch Error:", err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
