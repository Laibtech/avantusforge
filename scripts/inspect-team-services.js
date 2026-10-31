const mysql = require("mysql2/promise");

async function check() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  const [team] = await conn.query("SELECT * FROM cms_team_members");
  console.log("=== cms_team_members ===");
  console.log(JSON.stringify(team, null, 2));

  const [pages] = await conn.query("SELECT slug, title, sections_json FROM cms_pages WHERE slug IN ('services', 'team')");
  console.log("=== cms_pages (services, team) ===");
  for (const p of pages) {
    console.log(p.slug, "=>", p.sections_json);
  }

  await conn.end();
}

check().catch(console.error);
