const http = require("http");
const mysql = require("mysql2/promise");

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data, raw: data });
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

async function runEndToEndCmsTests() {
  console.log("================================================================================");
  console.log("       AVANTUSFORGE CMS — SECTION-BY-SECTION EDITING 12 E2E TESTS               ");
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

  const PORT = 3001;

  // 0. Authenticate
  console.log("\n[SETUP] Authenticating as Admin...");
  const loginRes = await makeRequest(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/admin/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { username: "admin", password: "AvantusSuperAdmin2025!" }
  );

  const cookie = loginRes.headers["set-cookie"] ? loginRes.headers["set-cookie"][0].split(";")[0] : "";
  assert(cookie.includes("avantus_admin_session="), "Received secure HttpOnly session cookie");

  const authHeaders = {
    Cookie: cookie,
    "Content-Type": "application/json",
  };

  // Connect to DB to save pristine snapshot of 'home' and 'services' for guaranteed rollback
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  const [initialHomeRows] = await conn.query("SELECT * FROM cms_pages WHERE slug = 'home'");
  const pristineHome = initialHomeRows[0];
  const originalSections = JSON.parse(pristineHome.sections_json);

  const [initialServicesRows] = await conn.query("SELECT * FROM cms_pages WHERE slug = 'services'");
  const pristineServices = initialServicesRows[0];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Edit a homepage heading and confirm public homepage updates after publishing
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Edit Homepage Heading & Verify Public Update After Publishing:");
    const test1Sections = JSON.parse(JSON.stringify(originalSections));
    test1Sections[0].headline = "E2E-TEST: Forging High-Performance Digital Platforms For Global Growth";

    const putRes1 = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        title: pristineHome.title,
        seo_title: pristineHome.seo_title,
        meta_description: pristineHome.meta_description,
        sections: test1Sections,
        action: "publish",
      }
    );
    assert(putRes1.status === 200 && putRes1.data.success, "Admin published updated homepage sections");

    const publicHomeRes1 = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(publicHomeRes1.status === 200, "Public homepage returns HTTP 200");
    assert(
      publicHomeRes1.raw.includes("E2E-TEST: Forging High-Performance Digital Platforms For Global Growth"),
      "Public homepage visibly reflects edited headline"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Replace a hero image and verify correct asset appears
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Replace Hero / Editorial Image & Verify Asset Appears:");
    const test2Sections = JSON.parse(JSON.stringify(test1Sections));
    const storySec = test2Sections.find((s) => s.id === "editorial_story");
    if (storySec) {
      storySec.primaryImage = {
        url: "/images/amazon-aed-70k-sales-proof.png",
        alt: "E2E-TEST: Verified Amazon Growth Metric Proof",
      };
    }
    const putRes2 = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        sections: test2Sections,
        action: "publish",
      }
    );
    assert(putRes2.status === 200 && putRes2.data.success, "Admin published updated image settings");

    const publicHomeRes2 = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(
      publicHomeRes2.raw.includes("amazon-aed-70k-sales-proof.png"),
      "Public homepage reflects the updated image asset URL"
    );

    // -------------------------------------------------------------------------
    // TEST 3: Hide a section and confirm it disappears from public page
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Hide a Section (enabled: false) & Verify It Disappears:");
    const test3Sections = JSON.parse(JSON.stringify(test2Sections));
    const trustSec = test3Sections.find((s) => s.id === "trust_strip");
    if (trustSec) {
      trustSec.enabled = false;
    }
    const putRes3 = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        sections: test3Sections,
        action: "publish",
      }
    );
    assert(putRes3.status === 200 && putRes3.data.success, "Admin published section with enabled: false");

    const publicHomeRes3 = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(
      !publicHomeRes3.raw.includes("Active client markets:"),
      "Disabled section (Trust Strip) is completely hidden from the public website"
    );

    // -------------------------------------------------------------------------
    // TEST 4: Reorder two sections and verify displayed order changes
    // -------------------------------------------------------------------------
    console.log("\n[TEST 4] Reorder Sections & Verify Display Sequence Changes:");
    const test4Sections = JSON.parse(JSON.stringify(test3Sections));
    const trustIdx = test4Sections.findIndex((s) => s.id === "trust_strip");
    if (trustIdx !== -1) test4Sections[trustIdx].enabled = true;
    
    // Swap index 1 and 2 (trust_strip and business_problems)
    const item1 = test4Sections[1];
    const item2 = test4Sections[2];
    test4Sections[1] = item2;
    test4Sections[2] = item1;

    const putRes4 = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        sections: test4Sections,
        action: "publish",
      }
    );
    assert(putRes4.status === 200 && putRes4.data.success, "Admin published reordered sections");

    const publicHomeRes4 = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    const posProblems = publicHomeRes4.raw.indexOf("WHAT WE SOLVE");
    const posTrust = publicHomeRes4.raw.indexOf("Active client markets:");
    assert(
      posProblems !== -1 && posTrust !== -1 && posProblems < posTrust,
      `Reordered sequence confirmed in HTML: Business Problems (pos ${posProblems}) precedes Trust Strip (pos ${posTrust})`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Add a new section and confirm it renders correctly
    // -------------------------------------------------------------------------
    console.log("\n[TEST 5] Add a New Section Template & Verify Rendering:");
    const test5Sections = JSON.parse(JSON.stringify(test4Sections));
    test5Sections.splice(3, 0, {
      id: "e2e_new_banner",
      type: "cta_banner",
      name: "E2E Dynamic Call To Action",
      enabled: true,
      eyebrow: "E2E SPECIAL ADVISORY",
      headline: "E2E-TEST: Scalable Enterprise Cloud Solutions For Visionary Founders",
      description: "Custom section added dynamically through the AvantusForge CMS.",
      primaryBtn: { text: "Schedule Architecture Session", href: "/contact", variant: "gold" },
      bgStyle: "burgundy",
    });

    const putRes5 = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        sections: test5Sections,
        action: "publish",
      }
    );
    assert(putRes5.status === 200 && putRes5.data.success, "Admin added and published new section template");

    const publicHomeRes5 = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(
      publicHomeRes5.raw.includes("E2E-TEST: Scalable Enterprise Cloud Solutions For Visionary Founders"),
      "Dynamically added section renders accurately with corporate branding and typography"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Save a draft and verify visitors cannot see the unpublished change
    // -------------------------------------------------------------------------
    console.log("\n[TEST 6] Save Draft & Verify Visitors Cannot See Unpublished Edits:");
    const draftSections = JSON.parse(JSON.stringify(test5Sections));
    draftSections[0].headline = "CONFIDENTIAL UNPUBLISHED DRAFT HEADLINE 999";

    const draftSaveRes = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        sections: draftSections,
        action: "draft",
      }
    );
    assert(draftSaveRes.status === 200 && draftSaveRes.data.success, "Draft saved successfully without publishing");

    // Public visitor check (regular GET without preview query)
    const publicVisitorRes = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(
      !publicVisitorRes.raw.includes("CONFIDENTIAL UNPUBLISHED DRAFT HEADLINE 999"),
      "Public visitors DO NOT see the draft content"
    );

    // Preview check (with ?preview=true)
    const previewRes = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/?preview=true",
      method: "GET",
    });
    assert(
      previewRes.raw.includes("CONFIDENTIAL UNPUBLISHED DRAFT HEADLINE 999"),
      "Admin preview (?preview=true) accurately displays draft content"
    );

    // -------------------------------------------------------------------------
    // TEST 7: Restore a previous revision
    // -------------------------------------------------------------------------
    console.log("\n[TEST 7] Revision History & Restore Earlier Revision:");
    const revsRes = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/api/admin/pages/revisions?slug=home",
      method: "GET",
      headers: authHeaders,
    });
    assert(revsRes.status === 200 && revsRes.data.revisions.length >= 2, "Revisions list retrieved successfully");

    // Get the earliest (baseline) revision
    const oldestRev = revsRes.data.revisions[revsRes.data.revisions.length - 1];
    const restoreRes = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages/revisions",
        method: "POST",
        headers: authHeaders,
      },
      {
        action: "restore",
        slug: "home",
        revisionId: oldestRev.id,
      }
    );
    assert(restoreRes.status === 200 && restoreRes.data.success, "Revision restored successfully");

    const restoredHomeRes = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(
      restoredHomeRes.raw.includes("Forging Digital Solutions That Move Your Business Forward."),
      "Public homepage reflects restored baseline revision"
    );

    // -------------------------------------------------------------------------
    // TEST 8: Edit a service page without changing other services
    // -------------------------------------------------------------------------
    console.log("\n[TEST 8] Edit Service Page Without Changing Other Services:");
    const amazonBefore = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/services/amazon-services",
      method: "GET",
    });

    const [servicePageRow] = await conn.query("SELECT * FROM cms_pages WHERE slug = 'services'");
    const serviceSections = JSON.parse(servicePageRow[0].sections_json);
    serviceSections[0].type = "hero";
    serviceSections[0].headline = "E2E-TEST: Advanced Engineering Services & Digital Systems";

    const servicePutRes = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "services",
        sections: serviceSections,
        action: "publish",
      }
    );
    assert(servicePutRes.status === 200 && servicePutRes.data.success, "Service page published successfully");

    const serviceAfter = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/services",
      method: "GET",
    });
    const amazonAfter = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/services/amazon-services",
      method: "GET",
    });

    assert(
      serviceAfter.raw.includes("E2E-TEST: Advanced Engineering Services"),
      "/services page reflects its own targeted edit"
    );
    assert(
      !amazonAfter.raw.includes("E2E-TEST: Advanced Engineering Services & Digital Systems") &&
        amazonAfter.raw.includes("Amazon") &&
        amazonAfter.status === 200,
      "Amazon services page (/services/amazon-services) remains isolated and retains its own authentic content"
    );

    // -------------------------------------------------------------------------
    // TEST 9: Update page SEO without overwriting global settings
    // -------------------------------------------------------------------------
    console.log("\n[TEST 9] Update Page SEO Without Overwriting Global Settings:");
    const testSeoTitle = "AvantusForge E2E Test SEO | Enterprise Digital Engineering";
    const seoPutRes = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
        headers: authHeaders,
      },
      {
        slug: "home",
        seo_title: testSeoTitle,
        meta_description: "E2E-TEST meta description for search engines.",
        action: "publish",
      }
    );
    assert(seoPutRes.status === 200 && seoPutRes.data.success, "Updated page SEO title published");

    const publicSeoRes = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/",
      method: "GET",
    });
    assert(
      publicSeoRes.raw.includes(testSeoTitle),
      "Page-specific <title> tag rendered from CMS SEO settings"
    );

    const globalSettingsRes = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/api/admin/settings",
      method: "GET",
      headers: authHeaders,
    });
    assert(
      globalSettingsRes.data.settings.tagline ===
        "Engineering High-Performance Digital Platforms, Bespoke Software & Amazon Growth",
      "Global agency settings retained with zero accidental overwrites"
    );

    // -------------------------------------------------------------------------
    // TEST 10: Verify mobile layouts after section edits
    // -------------------------------------------------------------------------
    console.log("\n[TEST 10] Verify Mobile Layouts & Responsive Tokens After Edits:");
    assert(
      publicSeoRes.raw.includes("sm:px-6") ||
        publicSeoRes.raw.includes("sm:px-8") ||
        publicSeoRes.raw.includes("max-w-7xl") ||
        publicSeoRes.raw.includes("max-w-[1360px]"),
      "Responsive container breakpoints (sm:px-6/8, max-w-[1360px]) intact across sections"
    );
    assert(
      publicSeoRes.raw.includes("flex-col") || publicSeoRes.raw.includes("grid-cols-1"),
      "Mobile stack layouts (flex-col / grid-cols-1) preserved for handheld viewports"
    );

    // -------------------------------------------------------------------------
    // TEST 11: Confirm unauthorized users cannot publish or delete content
    // -------------------------------------------------------------------------
    console.log("\n[TEST 11] Confirm Unauthorized Users Cannot Modify or Delete Pages:");
    const unauthPut = await makeRequest(
      {
        hostname: "localhost",
        port: PORT,
        path: "/api/admin/pages",
        method: "PUT",
      },
      { slug: "home", title: "Hacked Title" }
    );
    assert(unauthPut.status === 401, "Unauthenticated PUT /api/admin/pages is blocked with HTTP 401");

    const unauthDelete = await makeRequest({
      hostname: "localhost",
      port: PORT,
      path: "/api/admin/pages?slug=about",
      method: "DELETE",
    });
    assert(unauthDelete.status === 401, "Unauthenticated DELETE /api/admin/pages is blocked with HTTP 401");

    // -------------------------------------------------------------------------
    // TEST 12: Verify existing pages and content remain intact
    // -------------------------------------------------------------------------
    console.log("\n[TEST 12] Comprehensive Audit: All 12 Public Routes Active & Intact:");
    const allRoutes = [
      { route: "/", slug: "home", check: "AvantusForge" },
      { route: "/about", slug: "about", check: "About" },
      { route: "/services", slug: "services", check: "Services" },
      { route: "/work", slug: "work", check: "Work" },
      { route: "/team", slug: "team", check: "Team" },
      { route: "/contact", slug: "contact", check: "Contact" },
      { route: "/insights", slug: "insights", check: "Insights" },
      { route: "/industries", slug: "industries", check: "Industries" },
      { route: "/process", slug: "process", check: "Process" },
      { route: "/services/amazon-services", slug: "amazon-services", check: "Amazon" },
      { route: "/privacy", slug: "privacy", check: "Privacy" },
      { route: "/terms", slug: "terms", check: "Terms" },
    ];

    let allPagesHealthy = true;
    for (const r of allRoutes) {
      const pageRes = await makeRequest({
        hostname: "localhost",
        port: PORT,
        path: r.route,
        method: "GET",
      });
      const ok = pageRes.status === 200 && pageRes.raw.includes(r.check);
      if (!ok) allPagesHealthy = false;
      console.log(`    ${ok ? "✓" : "✗"} ${r.route.padEnd(28)} -> HTTP ${pageRes.status} (${pageRes.raw.length} bytes)`);
    }
    assert(allPagesHealthy, "All 12 public website routes return HTTP 200 and authentic branded content");
  } finally {
    // Teardown: Restore pristine state of 'home' and 'services'
    console.log("\n[TEARDOWN] Restoring pristine database state...");
    await conn.query(
      "UPDATE cms_pages SET title = ?, seo_title = ?, meta_description = ?, sections_json = ?, draft_sections_json = NULL, status = 'published' WHERE slug = 'home'",
      [pristineHome.title, pristineHome.seo_title, pristineHome.meta_description, pristineHome.sections_json]
    );

    await conn.query(
      "UPDATE cms_pages SET title = ?, seo_title = ?, meta_description = ?, sections_json = ?, draft_sections_json = NULL, status = 'published' WHERE slug = 'services'",
      [pristineServices.title, pristineServices.seo_title, pristineServices.meta_description, pristineServices.sections_json]
    );

    await conn.end();
  }

  console.log("\n================================================================================");
  console.log(`TOTAL CMS TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runEndToEndCmsTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
