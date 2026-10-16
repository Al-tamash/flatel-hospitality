import * as fs from "fs";
import http from "http";
import { HOSPITAL_RECORDS, MEDICAL_SERVICES } from "../components/hospital-directory-view";

function fetchPage(url: string): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, data }));
    }).on("error", reject);
  });
}

async function verifySimplifiedHospitals() {
  console.log("=======================================================");
  console.log("   FLATEL HOSPITALITY — SIMPLIFIED HOSPITALS AUDIT");
  console.log("=======================================================");

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

  // 1. Static Source Code Checks
  const source = fs.readFileSync("components/hospital-directory-view.tsx", "utf-8");
  const homeSource = fs.readFileSync("app/page.tsx", "utf-8");

  test("Source file exists and is populated", () => {
    return source.length > 500;
  });

  test("Heading matches: 'Hyderabad Hospital Proximity Guide'", () => {
    return source.includes("Hyderabad Hospital Proximity Guide");
  });

  test("All 4 approved services exist: Ambulance Assistance, Hospital Guide, Medicine Delivery, Doctor Appointment", () => {
    const titles = MEDICAL_SERVICES.map((s: { title: string }) => s.title);
    return (
      titles.includes("Ambulance Assistance") &&
      titles.includes("Hospital Guide") &&
      titles.includes("Medicine Delivery") &&
      titles.includes("Doctor Appointment") &&
      MEDICAL_SERVICES.length === 4
    );
  });

  test("Directory grid is present", () => {
    return source.includes("grid-cols-1");
  });

  test("All 8 verified hospital records are present", () => {
    const ids = HOSPITAL_RECORDS.map((h: { id: string }) => h.id);
    const required = [
      "apollo",
      "yashoda",
      "kims",
      "virinchi",
      "aig",
      "aware-global",
      "gandhi",
      "owaisi",
    ];
    return required.every((id: string) => ids.includes(id)) && HOSPITAL_RECORDS.length === 8;
  });

  test("All 8 hospitals have a usable address and locality", () => {
    return HOSPITAL_RECORDS.every(
      (h) =>
        h.address.length > 5 &&
        h.locality.length > 2
    );
  });

  test("All 8 hospitals have functional Google Maps URLs", () => {
    return HOSPITAL_RECORDS.every(
      (h) => h.googleMapsUrl.startsWith("https://maps.google.com/?q=")
    );
  });

  test("All 8 hospital image files exist in public/images/", () => {
    return HOSPITAL_RECORDS.every((h) => {
      const filePath = "public" + h.imageUrl;
      return fs.existsSync(filePath);
    });
  });

  test("Includes search input and specialty filters", () => {
    return (
      source.includes('placeholder="Search hospital by name, area, or specialty..."') &&
      source.includes('"All Hospitals"') &&
      source.includes('"Multi-Speciality"') &&
      source.includes('"Oncology"') &&
      source.includes('"Gastroenterology"') &&
      source.includes('"Government"')
    );
  });

  test("Maintains section id='healthcare' and anchor id='hospitals'", () => {
    return source.includes('id="healthcare"') && source.includes('id="hospitals"');
  });

  test("Mounted in app/page.tsx", () => {
    return (
      homeSource.includes('import { NearbyHospitals } from "@/components/nearby-hospitals"') &&
      homeSource.includes("<NearbyHospitals />")
    );
  });

  test("Includes concise non-clinical healthcare disclaimer", () => {
    return source.includes("Non-Clinical Healthcare Notice:");
  });

  // 2. Live SSR / HTTP Verification against dev server
  console.log("\nTesting live SSR on http://localhost:3000 ...");
  try {
    const res = await fetchPage("http://localhost:3000");
    test("Live homepage returns HTTP 200", () => res.status === 200);

    const html = res.data;

    test("Live page renders 'Hospitals &amp; Medical Support'", () =>
      html.includes("Hospitals &amp; Medical Support") || html.includes("Hospitals & Medical Support")
    );
    test("Live page renders 'Hospitals in Hyderabad'", () => html.includes("Hospitals in Hyderabad"));
    test("Live page renders 'Apollo Hospitals'", () => html.includes("Apollo Hospitals"));
    test("Live page renders 'Yashoda Hospitals'", () => html.includes("Yashoda Hospitals"));
    test("Live page renders 'KIMS Hospitals'", () => html.includes("KIMS Hospitals"));
    test("Live page renders 'Virinchi Hospitals'", () => html.includes("Virinchi Hospitals"));
    test("Live page renders 'AIG Hospitals'", () => html.includes("AIG Hospitals"));
    test("Live page renders 'Aware Global Hospital'", () => html.includes("Aware Global Hospital"));
    test("Live page renders 'Gandhi Hospital'", () => html.includes("Gandhi Hospital"));
    test("Live page renders 'Owaisi Hospital'", () => html.includes("Owaisi Hospital"));
    test("Live page contains anchor id='healthcare'", () => html.includes('id="healthcare"'));
    test("Live page contains functional tel links", () => html.includes('tel:+914023607777'));
    test("Live page contains Call Hospital button", () => html.includes("Call Hospital"));
  } catch (err: unknown) {
    console.error("Live fetch error:", err instanceof Error ? err.message : String(err));
    fails++;
  }

  console.log("\n=======================================================");
  console.log(`SIMPLIFIED HOSPITALS AUDIT: ${passes} PASSED | ${fails} FAILED`);
  console.log("=======================================================\n");

  if (fails > 0) {
    process.exit(1);
  }
}

verifySimplifiedHospitals().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
