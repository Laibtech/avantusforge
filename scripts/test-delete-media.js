const http = require("http");
const fs = require("fs");
const path = require("path");

function makeRequest(options, postData = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    let payload = postData;
    if (postData && !isMultipart && typeof postData === "object" && !Buffer.isBuffer(postData)) {
      payload = JSON.stringify(postData);
    }
    const reqHeaders = options.headers ? { ...options.headers } : {};
    if (payload && !isMultipart) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    } else if (!isMultipart && (options.method === "POST" || options.method === "PUT" || options.method === "DELETE" || options.method === "PATCH")) {
      reqHeaders["Content-Length"] = 0;
    }
    const finalOptions = { ...options, headers: reqHeaders };

    const req = http.request(finalOptions, (res) => {
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
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function buildMultipartFormData(filename, buffer) {
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
  const prefix = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`
  );
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([prefix, buffer, suffix]);
  return {
    boundary,
    body,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length,
    },
  };
}

// 1x1 valid PNG image buffer
const VALID_1X1_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

async function runTests() {
  console.log("================================================================================");
  console.log("             AVANTUSFORGE MEDIA DELETE ACCEPTANCE TEST SUITE                    ");
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

  // TEST 1: Unauthorized Access Prevention
  console.log("\n[TEST 1] Unauthorized Deletion Access Prevention:");
  const unauthDelete = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media?filename=test.png",
    method: "DELETE",
  });
  assert(unauthDelete.status === 401, "Unauthenticated DELETE /api/admin/media is blocked with HTTP 401");

  const unauthReplace = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media/replace",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { oldPath: "a.png", newPath: "b.png" }
  );
  assert(unauthReplace.status === 401, "Unauthenticated POST /api/admin/media/replace is blocked with HTTP 401");

  // TEST 2: Admin Authentication
  console.log("\n[TEST 2] Administrator Authentication:");
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
  assert(loginRes.status === 200 && loginRes.data.success, "Super Admin authenticated successfully");
  const cookie = loginRes.headers["set-cookie"] ? loginRes.headers["set-cookie"][0].split(";")[0] : "";
  const authHeaders = {
    Cookie: cookie,
    "Content-Type": "application/json",
  };

  // TEST 3: Upload Unused Test Image
  console.log("\n[TEST 3] Uploading Test Image Asset:");
  const uploadPayload = buildMultipartFormData("test-upload-delete-probe.png", VALID_1X1_PNG);
  const uploadRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media",
      method: "POST",
      headers: {
        Cookie: cookie,
        ...uploadPayload.headers,
      },
    },
    uploadPayload.body,
    true
  );

  assert(uploadRes.status === 200 && uploadRes.data.success, `File upload succeeded: ${uploadRes.data.filename}`);
  const uploadedFilename = uploadRes.data.filename;
  const uploadedPath = path.join(process.cwd(), "public", "uploads", uploadedFilename);
  assert(fs.existsSync(uploadedPath), `File confirmed present on disk: public/uploads/${uploadedFilename}`);

  // Confirm it shows in GET /api/admin/media
  const listAfterUpload = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media",
    method: "GET",
    headers: authHeaders,
  });
  const foundInList = listAfterUpload.data.media.some((m) => m.name === uploadedFilename);
  assert(foundInList, "Uploaded asset appears in media library catalog");

  // TEST 4: Delete Unused Media File (Single Delete)
  console.log("\n[TEST 4] Deleting Unused Media File:");
  const deleteRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: `/api/admin/media?filename=${uploadedFilename}`,
    method: "DELETE",
    headers: authHeaders,
  });
  assert(deleteRes.status === 200 && deleteRes.data.success, `Delete API returns success: "${deleteRes.data.message}"`);
  assert(!fs.existsSync(uploadedPath), `File is permanently unlinked from storage: public/uploads/${uploadedFilename}`);

  // Confirm it disappears from GET /api/admin/media
  const listAfterDelete = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media",
    method: "GET",
    headers: authHeaders,
  });
  const stillInList = listAfterDelete.data.media.some((m) => m.name === uploadedFilename);
  assert(!stillInList, "Deleted asset has disappeared from media library catalog");

  // TEST 5: Reference Detection & Protection on In-Use Image
  console.log("\n[TEST 5] Reference Detection on In-Use Image (amazon-aed-70k-sales-proof.png):");
  const deleteInUseRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media?filename=amazon-aed-70k-sales-proof.png&force=false",
    method: "DELETE",
    headers: authHeaders,
  });
  assert(
    deleteInUseRes.status === 409 && deleteInUseRes.data.blocked,
    "Attempt to delete referenced image is blocked with HTTP 409 Conflict"
  );
  assert(
    Array.isArray(deleteInUseRes.data.references) && deleteInUseRes.data.references.length > 0,
    `Exact references returned by API (${deleteInUseRes.data.references.length} reference(s) found: ${deleteInUseRes.data.references.map((r) => r.name).join(", ")})`
  );

  const proofImagePath = path.join(process.cwd(), "public", "images", "amazon-aed-70k-sales-proof.png");
  assert(fs.existsSync(proofImagePath), "Protected image remains safe on disk in public/images/");

  // TEST 6: Reassign & Replace References Workflow
  console.log("\n[TEST 6] Reassign / Replace References Workflow:");
  // Upload temporary replacement
  const repUpload = buildMultipartFormData("temp-replacement-target.png", VALID_1X1_PNG);
  const repRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media",
      method: "POST",
      headers: {
        Cookie: cookie,
        ...repUpload.headers,
      },
    },
    repUpload.body,
    true
  );
  assert(repRes.status === 200, "Uploaded replacement target image");
  const repFilename = repRes.data.filename;

  // Call replace API
  const replaceCall = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media/replace",
      method: "POST",
      headers: authHeaders,
    },
    {
      oldPath: "/images/amazon-aed-70k-sales-proof.png",
      newPath: `/uploads/${repFilename}`,
    }
  );
  assert(replaceCall.status === 200 && replaceCall.data.success, `Reassign API succeeded: "${replaceCall.data.message}"`);
  assert(replaceCall.data.updatedCount > 0, `Updated ${replaceCall.data.updatedCount} database references`);

  // Restore the original reference back
  const restoreCall = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media/replace",
      method: "POST",
      headers: authHeaders,
    },
    {
      oldPath: `/uploads/${repFilename}`,
      newPath: "/images/amazon-aed-70k-sales-proof.png",
    }
  );
  assert(restoreCall.status === 200, "Restored original Amazon proof setting reference");

  // Clean up the temporary replacement image
  await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: `/api/admin/media?filename=${repFilename}&force=true`,
    method: "DELETE",
    headers: authHeaders,
  });

  // TEST 7: Bulk Deletion (Both Unused & Referenced Files)
  console.log("\n[TEST 7] Bulk Deletion with Unused and Referenced Files:");
  // Upload 2 unused test files for bulk test
  const b1 = buildMultipartFormData("bulk-probe-1.png", VALID_1X1_PNG);
  const b2 = buildMultipartFormData("bulk-probe-2.png", VALID_1X1_PNG);

  const b1Res = await makeRequest(
    { hostname: "localhost", port: 3001, path: "/api/admin/media", method: "POST", headers: { Cookie: cookie, ...b1.headers } },
    b1.body,
    true
  );
  const b2Res = await makeRequest(
    { hostname: "localhost", port: 3001, path: "/api/admin/media", method: "POST", headers: { Cookie: cookie, ...b2.headers } },
    b2.body,
    true
  );
  assert(b1Res.status === 200 && b2Res.status === 200, "Uploaded 2 test images for bulk delete test");

  const b1Name = b1Res.data.filename;
  const b2Name = b2Res.data.filename;

  // Try bulk delete including one referenced file without force -> should report 409 with breakdown
  const bulkBlockedRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media",
      method: "DELETE",
      headers: authHeaders,
    },
    {
      filenames: [b1Name, "amazon-aed-70k-sales-proof.png"],
      force: false,
    }
  );
  assert(
    bulkBlockedRes.status === 409 && bulkBlockedRes.data.blocked,
    "Bulk delete containing referenced file is blocked with HTTP 409 and detailed breakdown"
  );
  assert(
    Array.isArray(bulkBlockedRes.data.blockedFiles) && bulkBlockedRes.data.blockedFiles.length === 1,
    "API identified exactly which file was blocked"
  );

  // Now bulk delete only the unused files
  const bulkSuccessRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3001,
      path: "/api/admin/media",
      method: "DELETE",
      headers: authHeaders,
    },
    {
      filenames: [b1Name, b2Name],
      force: false,
    }
  );
  assert(
    bulkSuccessRes.status === 200 && bulkSuccessRes.data.success,
    `Bulk delete succeeded: "${bulkSuccessRes.data.message}"`
  );
  assert(
    !fs.existsSync(path.join(process.cwd(), "public", "uploads", b1Name)) &&
      !fs.existsSync(path.join(process.cwd(), "public", "uploads", b2Name)),
    "Both bulk-deleted files removed from filesystem storage"
  );

  // TEST 8: Path Traversal Prevention
  console.log("\n[TEST 8] Path Traversal Attack Prevention:");
  const traversalRes = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/api/admin/media?filename=../../package.json",
    method: "DELETE",
    headers: authHeaders,
  });
  assert(
    traversalRes.status >= 400,
    `Path traversal attempt rejected with status ${traversalRes.status}`
  );
  assert(fs.existsSync(path.join(process.cwd(), "package.json")), "Root package.json remains intact and untouched");

  // TEST 9: Frontend UI Elements Verification
  console.log("\n[TEST 9] Media Library UI Page Verification:");
  const mediaPageHtml = await makeRequest({
    hostname: "localhost",
    port: 3001,
    path: "/admin/media",
    method: "GET",
    headers: authHeaders,
  });
  assert(mediaPageHtml.status === 200, "Media Library page returns HTTP 200");
  assert(mediaPageHtml.data.includes("Media Library"), "Page contains Media Library title");
  assert(
    mediaPageHtml.data.includes("Bulk Delete") || mediaPageHtml.data.includes("bulk"),
    "Page includes Bulk Delete controls"
  );

  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
