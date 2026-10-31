const http = require("http");

async function checkUrl(url, cookie = "") {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: {
          Cookie: cookie,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, length: body.length, headers: res.headers });
        });
      }
    );
    req.on("error", (e) => resolve({ error: e.message }));
    req.end();
  });
}

async function runTests() {
  const ports = [3001, 3000];
  let activePort = null;

  for (const p of ports) {
    const res = await checkUrl(`http://localhost:${p}/`);
    if (!res.error && res.status === 200) {
      activePort = p;
      break;
    }
  }

  if (!activePort) {
    console.error("No active dev server detected on port 3001 or 3000!");
    process.exit(1);
  }

  console.log(`[CMS Verification Test] Next.js dev server responding on port ${activePort}`);

  // Test admin login endpoint to get session token
  const authPayload = JSON.stringify({
    username: "admin",
    password: "AvantusSuperAdmin2025!",
  });

  const authRes = await new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: activePort,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(authPayload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const cookieHeader = res.headers["set-cookie"];
          const cookieStr = Array.isArray(cookieHeader) ? cookieHeader.join("; ") : (cookieHeader || "");
          resolve({ status: res.statusCode, body, cookieStr });
        });
      }
    );
    req.write(authPayload);
    req.end();
  });

  console.log(`[Auth Test] Status: ${authRes.status}`);
  let adminCookie = authRes.cookieStr;

  // Test core admin routes
  const adminRoutes = [
    "/admin",
    "/admin/analytics",
    "/admin/visitors",
    "/admin/pages",
    "/admin/pages/home",
    "/admin/services",
    "/admin/solutions",
    "/admin/portfolio",
    "/admin/blogs",
    "/admin/testimonials",
    "/admin/team",
    "/admin/media",
    "/admin/leads",
    "/admin/seo",
    "/admin/redirects",
    "/admin/users",
    "/admin/activity-logs",
    "/admin/settings",
  ];

  console.log("\n--- Testing Admin Dashboard Routes ---");
  for (const route of adminRoutes) {
    const res = await checkUrl(`http://localhost:${activePort}${route}`, adminCookie);
    const mark = res.status === 200 ? "✓" : `✗ (Status ${res.status}, error: ${res.error})`;
    console.log(`  ${mark} ${route} -> ${res.status} [${res.length} bytes]`);
  }

  // Test public routes
  const publicRoutes = [
    "/",
    "/about",
    "/services",
    "/work",
    "/insights",
    "/team",
    "/contact",
    "/sitemap.xml",
    "/robots.txt",
  ];

  console.log("\n--- Testing Public Website Routes ---");
  for (const route of publicRoutes) {
    const res = await checkUrl(`http://localhost:${activePort}${route}`);
    const mark = res.status === 200 ? "✓" : `✗ (Status ${res.status})`;
    console.log(`  ${mark} ${route} -> ${res.status} [${res.length} bytes]`);
  }

  // Test API endpoints
  const apiEndpoints = [
    "/api/admin/analytics",
    "/api/admin/visitors",
    "/api/admin/pages",
    "/api/admin/services",
    "/api/admin/solutions",
    "/api/admin/portfolio",
    "/api/admin/blogs",
    "/api/admin/testimonials",
    "/api/admin/team",
    "/api/admin/media",
    "/api/admin/leads",
    "/api/admin/redirects",
    "/api/admin/users",
    "/api/admin/activity-logs",
    "/api/admin/settings",
  ];

  console.log("\n--- Testing Admin API Endpoints ---");
  for (const ep of apiEndpoints) {
    const res = await checkUrl(`http://localhost:${activePort}${ep}`, adminCookie);
    const mark = res.status === 200 ? "✓" : `✗ (Status ${res.status})`;
    console.log(`  ${mark} ${ep} -> ${res.status} [${res.length} bytes]`);
  }

  console.log("\n[CMS Verification] All test suites completed.");
}

runTests().catch(console.error);
