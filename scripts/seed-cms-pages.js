const mysql = require("mysql2/promise");
const { DEFAULT_PAGE_CONFIGS } = require("../lib/cms-page-defaults.cjs");

async function seed() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  console.log("Seeding / updating cms_pages with full section configurations...");

  for (const [slug, page] of Object.entries(DEFAULT_PAGE_CONFIGS)) {
    const [existing] = await conn.query("SELECT id, sections_json FROM cms_pages WHERE slug = ? LIMIT 1", [slug]);

    const sectionsJson = JSON.stringify(page.sections);

    if (existing.length === 0) {
      console.log(`Inserting new page: ${page.title} (${slug})`);
      await conn.query(
        `INSERT INTO cms_pages (slug, title, seo_title, meta_description, og_title, og_description, og_image, canonical_url, robots_indexing, status, sections_json, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'system')`,
        [
          slug,
          page.title,
          page.seo_title,
          page.meta_description,
          page.og_title || page.seo_title,
          page.og_description || page.meta_description,
          page.og_image || "/images/amazon-aed-70k-sales-proof.png",
          page.canonical_url || `https://avantusforge.com/${slug === "home" ? "" : slug}`,
          page.robots_indexing || "index, follow",
          page.status || "published",
          sectionsJson,
        ]
      );
    } else {
      const curr = existing[0];
      const hasSections = curr.sections_json && curr.sections_json.includes('"type":');
      if (!hasSections) {
        console.log(`Updating sections for existing page: ${page.title} (${slug})`);
        await conn.query(
          `UPDATE cms_pages SET 
             title = ?,
             seo_title = COALESCE(seo_title, ?),
             meta_description = COALESCE(meta_description, ?),
             og_title = COALESCE(og_title, ?),
             og_description = COALESCE(og_description, ?),
             og_image = COALESCE(og_image, ?),
             canonical_url = COALESCE(canonical_url, ?),
             sections_json = ?
           WHERE slug = ?`,
          [
            page.title,
            page.seo_title,
            page.meta_description,
            page.og_title || page.seo_title,
            page.og_description || page.meta_description,
            page.og_image || "/images/amazon-aed-70k-sales-proof.png",
            page.canonical_url || `https://avantusforge.com/${slug === "home" ? "" : slug}`,
            sectionsJson,
            slug,
          ]
        );
      } else {
        console.log(`Page '${slug}' already has configured sections.`);
      }
    }
  }

  // Also verify initial revision exists for each page
  console.log("Checking initial revisions in cms_page_revisions...");
  const [allPages] = await conn.query("SELECT id, slug, title, seo_title, meta_description, sections_json, status FROM cms_pages");
  for (const p of allPages) {
    const [revs] = await conn.query("SELECT id FROM cms_page_revisions WHERE slug = ? LIMIT 1", [p.slug]);
    if (revs.length === 0) {
      await conn.query(
        `INSERT INTO cms_page_revisions (page_id, slug, title, seo_title, meta_description, sections_json, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'system')`,
        [p.id, p.slug, p.title, p.seo_title, p.meta_description, p.sections_json, p.status]
      );
      console.log(`Created baseline revision snapshot for '${p.slug}'`);
    }
  }

  console.log("All pages seeded and baseline revisions created.");
  await conn.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
