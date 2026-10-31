const mysql = require("mysql2/promise");
const { DEFAULT_PAGE_CONFIGS } = require("../lib/cms-page-defaults.cjs");

async function resetServices() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  const servicesConfig = DEFAULT_PAGE_CONFIGS.services;
  await conn.query(
    `UPDATE cms_pages SET 
       title = ?,
       seo_title = ?,
       meta_description = ?,
       og_title = ?,
       og_description = ?,
       canonical_url = ?,
       sections_json = ?,
       draft_sections_json = NULL,
       status = 'published'
     WHERE slug = 'services'`,
    [
      servicesConfig.title,
      servicesConfig.seo_title,
      servicesConfig.meta_description,
      servicesConfig.og_title,
      servicesConfig.og_description,
      servicesConfig.canonical_url,
      JSON.stringify(servicesConfig.sections),
    ]
  );

  console.log("Canonical services sections successfully restored in MySQL.");
  await conn.end();
}

resetServices().catch((err) => {
  console.error("Failed to reset services:", err);
  process.exit(1);
});
