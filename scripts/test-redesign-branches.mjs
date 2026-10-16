import http from 'http';

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log("=== Testing Redesigned Branch Pages ===");

  // 1. Barkas Salala
  const barkas = await fetchPage('/branches/barkas-salala');
  console.log(`Barkas Salala status: ${barkas.status}`);
  // Strip React SSR comments for robust text matching
  const cleanBody = barkas.body.replace(/<!--.*?-->/g, '');
  const barkasChecks = [
    ['Has Barkas Salala Serviced Residences title', cleanBody.includes('Barkas Salala Serviced Residences')],
    ['Has verified address', barkas.body.includes('Barkas Salala, Near Chandrayangutta')],
    ['Has 3 BHK flat listing', barkas.body.includes('3 BHK')],
    ['Has Reserve At This Branch panel', barkas.body.includes('Reserve At This Branch')],
    ['Has Master Amenities section', barkas.body.includes('Facilities &amp; Inclusions') || barkas.body.includes('Facilities & Inclusions')],
    ['Has Location & Connectivity', cleanBody.includes('Owaisi Hospital')],
    ['Has Guest Reviews section', cleanBody.includes('Be Among the First to Review Barkas Salala')],
    ['Has Guest Policies', cleanBody.includes('Check-In &amp; Check-Out') || cleanBody.includes('Check-In & Check-Out')],
    ['Has warm ivory container background', barkas.body.includes('bg-[#FBF9F5]')],
  ];
  for (const [desc, passed] of barkasChecks) {
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${desc}`);
  }

  // 2. Moghal Pura
  const moghal = await fetchPage('/branches/moghal-pura');
  console.log(`\nMoghal Pura status: ${moghal.status}`);
  const cleanMoghal = moghal.body.replace(/<!--.*?-->/g, '');
  const moghalChecks = [
    ['Has Moghal Pura Serviced Residences title', cleanMoghal.includes('Moghal Pura Serviced Residences')],
    ['Has verified address', cleanMoghal.includes('Moghal Pura, Near Charminar')],
    ['Has 1 BHK, 2 BHK, 4 BHK flat listings', cleanMoghal.includes('1 BHK') && cleanMoghal.includes('2 BHK') && cleanMoghal.includes('4 BHK')],
    ['Has Reserve At This Branch panel', cleanMoghal.includes('Reserve At This Branch')],
    ['Has Charminar landmark distance', cleanMoghal.includes('Charminar &amp; Laad Bazaar') || cleanMoghal.includes('Charminar & Laad Bazaar')],
    ['Has Guest Reviews section', cleanMoghal.includes('Be Among the First to Review Moghal Pura')],
    ['Has warm ivory container background', cleanMoghal.includes('bg-[#FBF9F5]')],
  ];
  for (const [desc, passed] of moghalChecks) {
    console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${desc}`);
  }

  // 3. 404 on Invalid Branch
  const invalid = await fetchPage('/branches/invalid-slug');
  console.log(`\nInvalid branch slug status: ${invalid.status} (Expected 404)`);
  console.log(`  [${invalid.status === 404 ? 'PASS' : 'FAIL'}] Invalid branch returns 404`);

  console.log("\nAll branch page checks executed.");
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
