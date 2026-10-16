import http from "http";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

async function verify() {
  console.log("Fetching http://localhost:3000 ...");
  const res = await fetchPage("http://localhost:3000");
  console.log(`HTTP Status: ${res.status}`);

  if (res.status !== 200) {
    throw new Error(`Failed with status ${res.status}`);
  }

  const html = res.data;

  const checks = [
    { name: "Section anchor #healthcare", pattern: /id="healthcare"/ },
    { name: "Hospital Care Tab", pattern: /Hospital Care \(19\)/ },
    { name: "Wedding Services Tab", pattern: /Wedding Services \(17\)/ },
    { name: "Leisure & Tourism Tab", pattern: /Leisure &amp; Tourism \(18\)|Leisure & Tourism \(18\)/ },
    { name: "Doctor Appointments item", pattern: /Doctor Appointments/ },
    { name: "Inquire on WhatsApp CTA", pattern: /Inquire on WhatsApp/ },
    { name: "Direct Phone Link", pattern: /tel:\+917989100711/ },
    { name: "Navbar link to #healthcare", pattern: /href="\/#healthcare"/ },
  ];

  let passed = 0;
  for (const check of checks) {
    if (check.pattern.test(html)) {
      console.log(`✓ PASS: ${check.name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${check.name}`);
    }
  }

  console.log(`\nVerified ${passed}/${checks.length} assertions successfully!`);
}

verify().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
