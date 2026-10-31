const mysql = require("mysql2/promise");

async function update() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  console.log("[AvantusForge Team Sync] Updating Technical and Operations Directors in MySQL...");

  await conn.query(
    "UPDATE cms_team_members SET name = ?, title = ?, role = ? WHERE id = ?",
    ["Bilal", "Bilal", "Technical Director", 3]
  );

  await conn.query(
    "UPDATE cms_team_members SET name = ?, title = ?, role = ? WHERE id = ?",
    ["Muzamil", "Muzamil", "Operations Director", 4]
  );

  await conn.query(
    "UPDATE business_projects SET team_assigned = ? WHERE id = ?",
    ["Bilal (Technical Director)", 1]
  );
  await conn.query(
    "UPDATE business_projects SET team_assigned = ? WHERE id = ?",
    ["Maira (Design) & Muzamil (Operations Director)", 2]
  );
  await conn.query(
    "UPDATE business_projects SET team_assigned = ? WHERE id = ?",
    ["Bilal & CEO Office", 3]
  );

  const [rows] = await conn.query("SELECT id, name, title, role, image_url FROM cms_team_members ORDER BY id ASC");
  console.log("Current team records in database:");
  console.table(rows);

  const [proj] = await conn.query("SELECT id, title, team_assigned FROM business_projects");
  console.log("Current business projects in database:");
  console.table(proj);

  await conn.end();
  console.log("[AvantusForge Team Sync] Successfully updated team records in MySQL.");
}

update().catch(console.error);
