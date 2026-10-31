const mysql = require("mysql2/promise");
const { DEFAULT_PAGE_CONFIGS } = require("../lib/cms-page-defaults.cjs");

async function resetHome() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  await conn.query(
    "UPDATE cms_pages SET sections_json = ?, draft_sections_json = NULL, status = 'published' WHERE slug = 'home'",
    [JSON.stringify(DEFAULT_PAGE_CONFIGS.home.sections)]
  );

  console.log("Canonical home sections restored.");
  await conn.end();
}

resetHome().catch(console.error);
