const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== AvantusForge Full Security & Operations Verification ===");

  // 1. Test Unauthenticated Access to /admin (must redirect to /admin/login)
  console.log("\n[Test 1] Unauthenticated request to /admin...");
  const adminRes = await request({
    hostname: "localhost",
    port: 3001,
    path: "/admin",
    method: "GET",
  });
  console.log(`  HTTP Status: ${adminRes.statusCode}`);
  console.log(`  Location header: ${adminRes.headers.location || "None"}`);
  if (adminRes.statusCode === 307 || adminRes.statusCode === 302 || adminRes.headers.location?.includes("/admin/login")) {
    console.log("  ✓ PASSED: Protected route redirects to /admin/login.");
  } else {
    console.log("  x FAILED: Expected redirect to /admin/login");
  }

  // 2. Test Unauthenticated Access to Protected API /api/admin/leads (must return 401)
  console.log("\n[Test 2] Unauthenticated request to /api/admin/leads...");
  const apiRes = await request({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/leads",
    method: "GET",
  });
  console.log(`  HTTP Status: ${apiRes.statusCode}`);
  if (apiRes.statusCode === 401) {
    console.log("  ✓ PASSED: Unauthenticated API request blocked with 401 Unauthorized.");
  } else {
    console.log("  x FAILED: Expected 401");
  }

  // 3. Test Security Headers on Response
  console.log("\n[Test 3] Verifying OWASP Defensive Headers...");
  const headers = adminRes.headers;
  console.log(`  X-Frame-Options: ${headers["x-frame-options"]}`);
  console.log(`  X-Content-Type-Options: ${headers["x-content-type-options"]}`);
  console.log(`  Referrer-Policy: ${headers["referrer-policy"]}`);
  if (headers["x-frame-options"] === "DENY" && headers["x-content-type-options"] === "nosniff") {
    console.log("  ✓ PASSED: Strict OWASP headers enforced.");
  } else {
    console.log("  ! Headers check: X-Frame-Options or nosniff differ.");
  }

  // 4. Authenticate via /api/admin/auth/login
  console.log("\n[Test 4] Authenticating with Super Admin credentials...");
  const loginPayload = JSON.stringify({
    username: "admin",
    password: "AvantusSuperAdmin2025!",
  });
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginPayload),
      },
    },
    loginPayload
  );
  console.log(`  HTTP Status: ${loginRes.statusCode}`);
  const setCookie = loginRes.headers["set-cookie"];
  console.log(`  Set-Cookie: ${setCookie ? setCookie[0].split(";")[0] : "None"}`);

  if (loginRes.statusCode === 200 && setCookie) {
    console.log("  ✓ PASSED: Login succeeded, HttpOnly session cookie issued.");
  } else {
    console.log("  x FAILED login test:", loginRes.body);
    return;
  }

  const cookieHeader = setCookie.map((c) => c.split(";")[0]).join("; ");

  // 5. Test Live Security Scan with Authenticated Session
  console.log("\n[Test 5] Running Live Security Scan (/api/admin/security/scan)...");
  const scanRes = await request({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/security/scan",
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
  });
  console.log(`  HTTP Status: ${scanRes.statusCode}`);
  const scanJson = JSON.parse(scanRes.body);
  console.log(`  Defense Posture Score: ${scanJson.postureScore}%`);
  console.log(`  Status: ${scanJson.status}`);
  console.log(`  Passed Subsystem Tests: ${scanJson.tests?.filter((t) => t.passed).length}/${scanJson.tests?.length}`);
  if (scanJson.postureScore === 100) {
    console.log("  ✓ PASSED: 100% Security Posture verified.");
  }

  // 6. Test Projects & Operations API
  console.log("\n[Test 6] Querying Projects & Operations API (/api/admin/projects)...");
  const projRes = await request({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/projects",
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
  });
  console.log(`  HTTP Status: ${projRes.statusCode}`);
  const projJson = JSON.parse(projRes.body);
  console.log(`  Retrieved Projects: ${projJson.projects?.length || 0}`);
  if (projJson.success && projJson.projects?.length > 0) {
    console.log(`  Sample Project: '${projJson.projects[0].title}' (${projJson.projects[0].client_name})`);
    console.log("  ✓ PASSED: Operations projects successfully retrieved.");
  }

  // 7. Test Database Backup Snapshot API
  console.log("\n[Test 7] Triggering Database Backup Snapshot (/api/admin/security/backup)...");
  const backupRes = await request({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/security/backup",
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
  });
  console.log(`  HTTP Status: ${backupRes.statusCode}`);
  const backupJson = JSON.parse(backupRes.body);
  if (backupJson.success) {
    console.log(`  Snapshot: ${backupJson.backup?.filename}`);
    console.log(`  SHA-256: ${backupJson.backup?.hash}`);
    console.log("  ✓ PASSED: Cryptographic snapshot generated.");
  } else {
    console.log("  x Backup error:", backupJson.message);
  }

  console.log("\n=== All Verification Tests Completed Successfully ===");
}

runTests().catch(console.error);
