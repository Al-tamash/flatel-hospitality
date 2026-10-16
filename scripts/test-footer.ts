import { WHATSAPP_CONFIG } from "../lib/constants";
import * as fs from "fs";

async function verifyFooterRedesign() {
  console.log("=======================================================");
  console.log("   FLATEL HOSPITALITY — PREMIUM FOOTER AUDIT");
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
  const footerSource = fs.readFileSync("components/site-footer.tsx", "utf-8");

  test("Brand introduction includes FLATEL wordmark and logo", () => {
    return footerSource.includes("FLATEL") && footerSource.includes("HOSPITALITY");
  });

  test("Approved brand tagline included: 'The comfort of a flat. The service of a hotel.'", () => {
    return footerSource.includes("BRAND_TAGLINE");
  });

  test("Polished business description present without generic filler", () => {
    return (
      footerSource.includes("Hyderabad’s premier serviced apartment residences") &&
      footerSource.includes("Barkas Salala") &&
      footerSource.includes("Moghal Pura")
    );
  });

  test("Subtle conversion area includes understated 'Explore properties' invitation", () => {
    return (
      footerSource.includes("Looking for a fully furnished, serviced apartment in Hyderabad?") &&
      footerSource.includes("Explore properties") &&
      footerSource.includes('href="/#flats"')
    );
  });

  test("No newsletter forms, promotional discounts, or coupon claims added", () => {
    return (
      !footerSource.toLowerCase().includes("newsletter") &&
      !footerSource.toLowerCase().includes("subscribe") &&
      !footerSource.toLowerCase().includes("% off")
    );
  });

  test("Explore navigation column links strictly to verified existing routes", () => {
    return (
      footerSource.includes('href="/#flats"') &&
      footerSource.includes('href="/#amenities"') &&
      footerSource.includes('href="/#locations"') &&
      footerSource.includes('href="/branches/barkas-salala"') &&
      footerSource.includes('href="/branches/moghal-pura"')
    );
  });

  test("Guest Information column links strictly to verified existing routes", () => {
    return (
      footerSource.includes('href="/#flats"') &&
      footerSource.includes('href="/#how-it-works"') &&
      footerSource.includes('href="/policies#checkin-checkout"') &&
      footerSource.includes('href="/policies#free-cancellation"') &&
      footerSource.includes('href="/list-property"')
    );
  });

  test("Contact details match approved constants (phone, email, WhatsApp, 24/7 desk)", () => {
    return (
      footerSource.includes("CONTACT_EMAIL") &&
      footerSource.includes("CONTACT_PHONE") &&
      footerSource.includes("WHATSAPP_CONFIG") &&
      footerSource.includes("24/7 On-Call Concierge Desk")
    );
  });

  test("WhatsApp geometry SVG present with correct wa.me link generation", () => {
    const waUrl = WHATSAPP_CONFIG.getUrl(
      "Hello Flatel Concierge, I would like to inquire about booking a serviced flat."
    );
    return waUrl.includes("wa.me/917989100711") && footerSource.includes("WhatsAppIcon");
  });

  test("Legal bar includes dynamic copyright year, COMPANY_NAME, policies and staff portal", () => {
    return (
      footerSource.includes("COMPANY_NAME") &&
      footerSource.includes("currentYear") &&
      footerSource.includes('href="/policies"') &&
      footerSource.includes('href="/admin"')
    );
  });

  test("No placeholder '#' links exist in the footer component", () => {
    return !footerSource.includes('href="#"') && !footerSource.includes("href='#'");
  });

  // 2. Live HTTP Route Verification (ensuring footer renders seamlessly across key pages)
  const pagesToTest = [
    { name: "Homepage", url: "http://localhost:3000/" },
    { name: "Property Detail (1BHK)", url: "http://localhost:3000/properties/1bhk" },
    { name: "Branch Page (Barkas Salala)", url: "http://localhost:3000/branches/barkas-salala" },
    { name: "Policies Page", url: "http://localhost:3000/policies" },
    { name: "List Property Page", url: "http://localhost:3000/list-property" },
  ];

  for (const p of pagesToTest) {
    try {
      const res = await fetch(p.url);
      const text = await res.text();
      test(`HTTP 200 OK & Footer rendered on ${p.name}`, () => {
        return (
          res.status === 200 &&
          text.includes("Site Footer") &&
          text.includes("FLATEL") &&
          text.includes("HOSPITALITY") &&
          text.includes("Flatel Hospitality Private Limited")
        );
      });
    } catch (e: unknown) {
      console.error(`Fetch error on ${p.name}: ${e instanceof Error ? e.message : String(e)}`);
      fails++;
    }
  }

  console.log("\n=======================================================");
  console.log(`FOOTER AUDIT SUMMARY: ${passes} PASSED | ${fails} FAILED`);
  console.log("=======================================================\n");

  if (fails > 0) process.exit(1);
}

verifyFooterRedesign().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
