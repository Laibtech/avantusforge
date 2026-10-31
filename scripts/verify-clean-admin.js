const http = require("http");

async function run() {
  // 1. Authenticate to get session cookie
  const authPayload = JSON.stringify({
    username: "admin",
    password: "AvantusSuperAdmin2025!",
  });

  const authCookie = await new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/admin/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(authPayload),
        },
      },
      (res) => {
        const cookie = res.headers["set-cookie"];
        resolve(Array.isArray(cookie) ? cookie.join("; ") : (cookie || ""));
      }
    );
    req.write(authPayload);
    req.end();
  });

  // 2. Fetch authenticated /admin
  const adminHtml = await new Promise((resolve) => {
    http.get(
      {
        hostname: "localhost",
        port: 3001,
        path: "/admin",
        headers: { Cookie: authCookie },
      },
      (res) => {
        let b = "";
        res.on("data", (c) => (b += c));
        res.on("end", () => resolve(b));
      }
    );
  });

  // 3. Fetch public /
  const publicHtml = await new Promise((resolve) => {
    http.get("http://localhost:3001/", (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => resolve(b));
    });
  });

  console.log("=== VERIFICATION RESULTS ===");
  console.log("1. Authenticated /admin:");
  console.log("   - Has public Header elements ('Strategic Advisory'):", adminHtml.includes("Strategic Advisory"));
  console.log("   - Has public Footer elements ('Connect With Us'):", adminHtml.includes("Connect With Us"));
  console.log("   - Has AdminSidebar / AdminHeader ('Enterprise CMS Console'):", adminHtml.includes("Enterprise CMS Console"));
  console.log("   - Has Admin Navigation ('Central Command'):", adminHtml.includes("Central Command"));

  console.log("\n2. Public Homepage /:");
  console.log("   - Has public Header:", publicHtml.includes("Strategic Advisory") || publicHtml.includes("Services"));
  console.log("   - Has public Footer ('Connect With Us'):", publicHtml.includes("Connect With Us"));
  console.log("   - Has LinkedIn URL:", publicHtml.includes("https://www.linkedin.com/company/avantusforge"));
  console.log("   - Has Facebook URL:", publicHtml.includes("https://www.facebook.com/Avantusforgeofficial"));
  console.log("   - Has Instagram URL:", publicHtml.includes("https://www.instagram.com/avantusforgeofficial/"));
  console.log("   - Duplicate Facebook links in footer:", (publicHtml.match(/https:\/\/www\.facebook\.com\/Avantusforgeofficial/g) || []).length);
}

run().catch(console.error);
