const mysql = require("mysql2/promise");

async function migrate() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  console.log("Checking columns on cms_pages...");
  const [cols] = await conn.query("DESCRIBE cms_pages");
  const colNames = cols.map((c) => c.Field);

  const addCol = async (name, def) => {
    if (!colNames.includes(name)) {
      console.log(`Adding column: ${name}`);
      await conn.query(`ALTER TABLE cms_pages ADD COLUMN ${name} ${def}`);
    }
  };

  await addCol("draft_sections_json", "LONGTEXT NULL");
  await addCol("og_title", "VARCHAR(255) NULL");
  await addCol("og_description", "TEXT NULL");
  await addCol("canonical_url", "VARCHAR(255) NULL");
  await addCol("robots_indexing", "VARCHAR(50) DEFAULT 'index, follow'");
  await addCol("schema_json", "TEXT NULL");
  await addCol("updated_by", "VARCHAR(100) DEFAULT 'admin'");

  console.log("Ensuring cms_page_revisions table exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_page_revisions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_id INT NULL,
      slug VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      seo_title VARCHAR(255) NULL,
      meta_description TEXT NULL,
      sections_json LONGTEXT NULL,
      status VARCHAR(50) DEFAULT 'published',
      created_by VARCHAR(100) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_page_id (page_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log("Database schema successfully migrated.");
  await conn.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
