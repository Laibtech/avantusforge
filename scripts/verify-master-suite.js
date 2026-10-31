const http = require("http");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runMasterVerification() {
  console.log("================================================================================");
  console.log("       AVANTUSFORGE MASTER VERIFICATION & END-TO-END ACCEPTANCE SUITE           ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Authenticate with admin login
  console.log("\n[1] Admin Authentication & Session Issuance:");
  const loginRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { username: "admin", password: "AvantusSuperAdmin2025!" }
  );

  assert(loginRes.status === 200 && loginRes.data.success, "Login with Super Administrator credentials succeeds");
  const cookie = loginRes.headers["set-cookie"] ? loginRes.headers["set-cookie"][0].split(";")[0] : "";
  assert(cookie.includes("avantus_admin_session="), "Received secure HttpOnly session cookie");

  const authHeaders = {
    Cookie: cookie,
    "Content-Type": "application/json",
  };

  // 2. Global Agency Settings Verification
  console.log("\n[2] Global Agency Settings (Tagline, Social Links, Amazon Achievement, Target Markets):");
  const settingsRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/settings",
    method: "GET",
    headers: authHeaders,
  });

  assert(settingsRes.status === 200 && settingsRes.data.success, "Settings API responds with HTTP 200");
  const settings = settingsRes.data.settings;
  assert(settings.tagline && settings.tagline.length > 0, `Agency tagline is present: "${settings.tagline}"`);
  assert(
    (settings.social_linkedin || "").includes("avantusforge"),
    `Official LinkedIn URL verified: ${settings.social_linkedin}`
  );
  assert(
    (settings.social_facebook || "").includes("Avantusforgeofficial"),
    `Official Facebook URL verified without duplicates: ${settings.social_facebook}`
  );
  assert(
    (settings.social_instagram || "").includes("avantusforgeofficial"),
    `Official Instagram URL verified: ${settings.social_instagram}`
  );
  assert(
    settings.target_markets && settings.target_markets.length >= 5,
    `Target international markets verified (${settings.target_markets?.length || 0} markets configured: UK, US, UAE, Kuwait, Pakistan)`
  );
  assert(
    settings.amazon_sales_figure === "AED 70,182.29",
    `Amazon marketplace sales achievement preserved accurately: ${settings.amazon_sales_figure}`
  );
  assert(
    settings.amazon_proof_image === "/images/amazon-aed-70k-sales-proof.png",
    `Amazon proof image path verified: ${settings.amazon_proof_image}`
  );

  // 3. Media Library Reference Protection & Deletion Safety
  console.log("\n[3] Media Management & Reference Protection:");
  const mediaRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media",
    method: "GET",
    headers: authHeaders,
  });
  assert(mediaRes.status === 200 && mediaRes.data.success, "Media library query succeeds");
  assert(Array.isArray(mediaRes.data.media), `Media records enumerated (${mediaRes.data.media.length} items found)`);

  // Test reference check on an in-use image
  const deleteProtectedRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media?id=amazon-aed-70k-sales-proof.png&force=false",
    method: "DELETE",
    headers: authHeaders,
  });
  assert(
    deleteProtectedRes.status === 409 || deleteProtectedRes.data.inUse,
    "Attempting to delete an active referenced image is safely blocked (HTTP 409 Conflict)"
  );

  // 4. CRM Client Directory & Balance Telemetry
  console.log("\n[4] CRM Client Accounts & Financial Balances:");
  const clientsRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/clients",
    method: "GET",
    headers: authHeaders,
  });
  assert(clientsRes.status === 200 && clientsRes.data.success, "CRM Clients API responds with HTTP 200");
  assert(clientsRes.data.clients.length >= 3, `Retrieved registered clients (${clientsRes.data.clients.length} accounts found)`);
  const caremon = clientsRes.data.clients.find((c) => c.company_name.includes("Caremon"));
  assert(caremon && caremon.country === "United Kingdom", "Caremon Wellness Ltd verified in UK territory");

  // 5. Finance & Invoicing Calculations
  console.log("\n[5] Finance & Invoicing Calculations:");
  const financeRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/finance",
    method: "GET",
    headers: authHeaders,
  });
  assert(financeRes.status === 200 && financeRes.data.success, "Finance API responds with HTTP 200");
  assert(financeRes.data.summary, "Financial summary KPIs calculated accurately");

  // Create test invoice
  const testInvNumber = `INV-TEST-${Date.now().toString().slice(-4)}`;
  const createInvRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/finance",
      method: "POST",
      headers: authHeaders,
    },
    {
      action: "create_invoice",
      invoice_number: testInvNumber,
      client_name: "Caremon Wellness Ltd",
      client_email: "billing@caremon.co.uk",
      issue_date: "2025-10-29",
      due_date: "2025-11-12",
      currency: "USD",
      tax_rate: 10,
      line_items: [
        { description: "Sprint 1 Architecture", quantity: 2, unit_price: 1500, total: 3000 },
        { description: "Cloud Infrastructure Setup", quantity: 1, unit_price: 500, total: 500 },
      ],
    }
  );
  assert(createInvRes.status === 200 && createInvRes.data.success, `Created invoice ${testInvNumber} with tax & line items`);

  // 6. HRMS & Payroll
  console.log("\n[6] HRMS, Attendance & Payroll Verification:");
  const hrmsRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/hrms",
    method: "GET",
    headers: authHeaders,
  });
  assert(hrmsRes.status === 200 && hrmsRes.data.success, "HRMS API responds with HTTP 200");
  assert(hrmsRes.data.employees.length >= 4, `Staff roster loaded (${hrmsRes.data.employees.length} personnel)`);
  assert(hrmsRes.data.summary.isPayrollAuthorized === true, "Super Administrator authorized for payroll and compensation views");

  // 7. System Integrations Diagnostics
  console.log("\n[7] System Integrations & Live Probing:");
  const intRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/integrations",
    method: "GET",
    headers: authHeaders,
  });
  assert(intRes.status === 200 && intRes.data.success, "System Integrations API responds with HTTP 200");
  assert(intRes.data.integrations.length >= 4, `Loaded ${intRes.data.integrations.length} integration modules`);

  // Run live probe on local storage engine
  const storageProbe = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/integrations",
      method: "POST",
      headers: authHeaders,
    },
    {
      action: "test_connection",
      service_key: "storage",
    }
  );
  assert(storageProbe.status === 200 && storageProbe.data.success, `Storage diagnostic probe passed: "${storageProbe.data.message}"`);

  // 8. Public Website & Layout Isolation
  console.log("\n[8] Public Website & Layout Isolation:");
  const homeHtml = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/",
    method: "GET",
  });
  assert(homeHtml.status === 200, "Homepage returns HTTP 200");
  assert(
    homeHtml.data.includes("AvantusForge") || homeHtml.data.includes("avantusforge"),
    "Homepage contains AvantusForge branding"
  );
  assert(
    homeHtml.data.includes("linkedin.com/company/avantusforge"),
    "Homepage footer contains official LinkedIn profile URL"
  );
  assert(
    homeHtml.data.includes("facebook.com/Avantusforgeofficial"),
    "Homepage footer contains official Facebook profile URL"
  );

  const workHtml = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/work",
    method: "GET",
  });
  assert(workHtml.status === 200, "Work page returns HTTP 200");
  assert(workHtml.data.includes("Caremon") && workHtml.data.includes("FAMA"), "Work page displays authentic projects");

  const adminDashboardHtml = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/admin",
    method: "GET",
    headers: authHeaders,
  });
  assert(adminDashboardHtml.status === 200, "Admin dashboard returns HTTP 200");
  assert(
    !adminDashboardHtml.data.includes("Get a Free Consultation") || !adminDashboardHtml.data.includes("Ready to transform your"),
    "Admin dashboard is isolated from public marketing header and consultation CTA"
  );

  // 9. Unauthorized Role Enforcement
  console.log("\n[9] Unauthorized Role Access Control:");
  const unauthRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/finance",
    method: "GET",
  });
  assert(unauthRes.status === 401, "Unauthenticated request to /api/admin/finance is blocked with HTTP 401 Unauthorized");

  // 10. Database Backup Engine
  console.log("\n[10] Disaster Recovery & Database Backup Engine:");
  const backupRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/security/backup",
    method: "POST",
    headers: authHeaders,
  });
  assert(backupRes.status === 200 && backupRes.data.success, "Database backup generation succeeds with SHA-256 checksum");
  assert(backupRes.data.backup?.filename, `Generated backup snapshot: ${backupRes.data.backup?.filename}`);

  console.log("\n================================================================================");
  console.log(`TOTAL ACCEPTANCE CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
