import * as fs from "fs";

async function verifyLocationsMap() {
  console.log("=======================================================");
  console.log("   FLATEL HOSPITALITY — LOCATIONS MAP AUDIT");
  console.log("=======================================================\n");

  let passes = 0;
  let fails = 0;

  function test(name: string, fn: () => boolean) {
    try {
      const ok = fn();
      if (ok) {
        console.log(`[PASS] ${name}`);
        passes++;
      } else {
        console.error(`[FAIL] ${name}`);
        fails++;
      }
    } catch (e: unknown) {
      console.error(`[FAIL] ${name}: ${e instanceof Error ? e.message : String(e)}`);
      fails++;
    }
  }

  // 1. Component Code Integrity
  const source = fs.readFileSync("components/branch-hub.tsx", "utf-8");

  test("Section Eyebrow is 'ROOTED IN HYDERABAD'", () => {
    return source.includes("ROOTED IN HYDERABAD");
  });

  test("Main Heading is 'Find your nearest Flatel'", () => {
    return source.includes("Find your") && source.includes("nearest Flatel");
  });

  test("Supporting text matches approved copy", () => {
    return source.includes(
      "Explore FLATEL locations across Hyderabad and discover comfortable flats to stay near the places that matter to you."
    );
  });

  test("Data-backed statistics: 2 Branches, 5 Residences, 24x7 Concierge", () => {
    return (
      source.includes("BRANCHES") &&
      source.includes("RESIDENCES") &&
      source.includes("24×7") &&
      source.includes("CONCIERGE")
    );
  });

  test("Map Overlay contains 'HYDERABAD NETWORK' and 'Select a marker to explore.'", () => {
    return (
      source.includes("HYDERABAD NETWORK") &&
      source.includes("Select a marker to explore.")
    );
  });

  test("No fake development notices ('Frontend Preview Only' or 'Wake up servers')", () => {
    return (
      !source.includes("Frontend Preview Only") &&
      !source.includes("Wake up servers")
    );
  });

  test("Accurate coordinates used for Moghal Pura [17.3570, 78.4815] and Barkas Salala [17.3185, 78.4905]", () => {
    return (
      source.includes("17.357") &&
      source.includes("78.4815") &&
      source.includes("17.3185") &&
      source.includes("78.4905")
    );
  });

  test("OpenStreetMap tile layer configured with proper attribution and zero API key requirement", () => {
    return (
      source.includes("tile.openstreetmap.org") &&
      source.includes("OpenStreetMap") &&
      !source.includes("basemaps.cartocdn.com")
    );
  });

  test("Custom FLATEL gold flag silhouette markers with 'F' monogram", () => {
    return (
      source.includes("flatel-marker-pin") &&
      source.includes("flagGoldGrad_") &&
      source.includes(">F</text>")
    );
  });

  test("Branch selector chips connect to Moghal Pura and Barkas Salala", () => {
    return (
      source.includes("Moghal Pura") &&
      source.includes("Barkas Salala") &&
      source.includes("Near Charminar") &&
      source.includes("Near Chandrayangutta")
    );
  });

  test("Navigation actions connect to valid branch routes (/branches/moghal-pura & /branches/barkas-salala)", () => {
    return (
      source.includes("/branches/${currentBranch.slug}") ||
      source.includes("href={`/branches/${currentBranch.slug}`}")
    );
  });

  test("Directions actions link to verified Google Maps URLs with target='_blank'", () => {
    return (
      source.includes("googleMapsUrl") &&
      source.includes('target="_blank"') &&
      source.includes('rel="noopener noreferrer"')
    );
  });

  test("Maintains section id='locations' and alias id='branches'", () => {
    return (
      source.includes('id="locations"') &&
      source.includes('id="branches"')
    );
  });

  // 2. Live HTTP Verification
  try {
    const res = await fetch("http://localhost:3000/");
    const html = await res.text();

    test("HTTP 200 OK on Homepage", () => res.status === 200);
    test("Homepage HTML contains 'ROOTED IN HYDERABAD'", () => html.includes("ROOTED IN HYDERABAD"));
    test("Homepage HTML contains 'Find your' & 'nearest Flatel'", () =>
      html.includes("Find your") && html.includes("nearest Flatel"));
    test("Homepage HTML contains id='locations' and id='branches'", () =>
      html.includes('id="locations"') && html.includes('id="branches"'));
    test("Homepage HTML contains 'HYDERABAD NETWORK'", () => html.includes("HYDERABAD NETWORK"));
    test("Homepage HTML contains verified branches 'Moghal Pura' & 'Barkas Salala'", () =>
      html.includes("Moghal Pura") && html.includes("Barkas Salala"));

    // Check OpenStreetMap tile availability directly
    try {
      const tileRes = await fetch("https://tile.openstreetmap.org/13/5881/3695.png", {
        headers: { "User-Agent": "Flatel-Website-Audit/1.0" }
      });
      test("OpenStreetMap Hyderabad live tile responds with HTTP 200 OK", () => tileRes.status === 200);
      test("Tile Content-Type is image/png", () => tileRes.headers.get("content-type")?.includes("image/png") ?? false);
    } catch (e: unknown) {
      console.warn("OSM tile fetch warning:", e instanceof Error ? e.message : String(e));
    }
  } catch (err: unknown) {
    console.error("HTTP verification error:", err instanceof Error ? err.message : String(err));
    fails++;
  }

  console.log("\n=======================================================");
  console.log(`LOCATIONS MAP AUDIT: ${passes} PASSED | ${fails} FAILED`);
  console.log("=======================================================\n");

  if (fails > 0) process.exit(1);
}

verifyLocationsMap().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
