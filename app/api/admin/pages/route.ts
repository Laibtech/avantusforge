import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { DEFAULT_PAGE_CONFIGS } from "@/lib/cms-page-defaults";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const PROTECTED_CORE_SLUGS = [
  "home",
  "about",
  "services",
  "work",
  "team",
  "contact",
  "insights",
  "industries",
  "process",
  "amazon-services",
  "privacy",
  "terms",
];

function canManagePages(role: string): boolean {
  return ["super_admin", "admin", "content_editor"].includes(role);
}

export async function GET(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    const p = getDbPool();
    if (slug) {
      const [rows] = await p.query<RowDataPacket[]>(
        "SELECT * FROM cms_pages WHERE slug = ? LIMIT 1",
        [slug]
      );
      if (rows && rows.length > 0) {
        const page = rows[0];
        // Parse sections
        let sections = [];
        let draftSections = [];
        try {
          if (page.sections_json) sections = JSON.parse(page.sections_json);
        } catch {}
        try {
          if (page.draft_sections_json) draftSections = JSON.parse(page.draft_sections_json);
        } catch {}

        if (sections.length === 0 && DEFAULT_PAGE_CONFIGS[slug]) {
          sections = DEFAULT_PAGE_CONFIGS[slug].sections;
        }

        return NextResponse.json({
          success: true,
          page: {
            ...page,
            sections,
            draft_sections: draftSections.length > 0 ? draftSections : null,
          },
        });
      }
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }

    // List all pages
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT id, slug, title, seo_title, meta_description, status, 
              sections_json, draft_sections_json, updated_at, updated_by
       FROM cms_pages ORDER BY id ASC`
    );

    const pagesWithStats = rows.map((r) => {
      let count = 0;
      try {
        if (r.sections_json) {
          const parsed = JSON.parse(r.sections_json);
          count = Array.isArray(parsed) ? parsed.length : 0;
        }
      } catch {}
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        seo_title: r.seo_title,
        meta_description: r.meta_description,
        status: r.status,
        has_draft: Boolean(r.draft_sections_json && r.draft_sections_json !== r.sections_json),
        section_count: count,
        updated_at: r.updated_at,
        updated_by: r.updated_by,
      };
    });

    return NextResponse.json({ success: true, pages: pagesWithStats });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!canManagePages(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Permission Denied: Editing pages requires Editor or Administrator role." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    let {
      slug,
      title,
      seo_title,
      meta_description,
      og_title,
      og_description,
      og_image,
      canonical_url,
      robots_indexing = "index, follow",
      schema_json,
      sections,
      isDraft = false,
      publish = false,
      action,
    } = body;

    if (action === "publish") {
      publish = true;
      isDraft = false;
    } else if (action === "draft") {
      isDraft = true;
      publish = false;
    }

    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required." }, { status: 400 });
    }

    const p = getDbPool();

    // If title or sections missing, load existing page fields
    if (!title || sections === undefined) {
      const [existing] = await p.query<RowDataPacket[]>(
        "SELECT * FROM cms_pages WHERE slug = ? LIMIT 1",
        [slug]
      );
      if (existing && existing.length > 0) {
        const row = existing[0];
        if (!title) title = row.title;
        if (seo_title === undefined) seo_title = row.seo_title;
        if (meta_description === undefined) meta_description = row.meta_description;
        if (og_title === undefined) og_title = row.og_title;
        if (og_description === undefined) og_description = row.og_description;
        if (og_image === undefined) og_image = row.og_image;
        if (canonical_url === undefined) canonical_url = row.canonical_url;
        if (robots_indexing === undefined) robots_indexing = row.robots_indexing;
        if (schema_json === undefined) schema_json = row.schema_json;
        if (sections === undefined) {
          try {
            sections = JSON.parse(row.sections_json || "[]");
          } catch {
            sections = [];
          }
        }
      } else {
        if (!title) {
          return NextResponse.json({ success: false, message: "Title is required for new page creation." }, { status: 400 });
        }
      }
    }

    const sectionsStr = typeof sections === "string" ? sections : JSON.stringify(sections || []);
    const newStatus = publish ? "published" : isDraft ? "draft" : "published";

    if (publish) {
      // Publishing makes sections live and clears draft disparity
      await p.query(
        `INSERT INTO cms_pages (
           slug, title, seo_title, meta_description, og_title, og_description,
           og_image, canonical_url, robots_indexing, schema_json, status,
           sections_json, draft_sections_json, updated_by
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, NULL, ?)
         ON DUPLICATE KEY UPDATE 
           title = VALUES(title),
           seo_title = VALUES(seo_title),
           meta_description = VALUES(meta_description),
           og_title = VALUES(og_title),
           og_description = VALUES(og_description),
           og_image = VALUES(og_image),
           canonical_url = VALUES(canonical_url),
           robots_indexing = VALUES(robots_indexing),
           schema_json = VALUES(schema_json),
           status = 'published',
           sections_json = VALUES(sections_json),
           draft_sections_json = NULL,
           updated_at = NOW(),
           updated_by = VALUES(updated_by)`,
        [
          slug,
          title,
          seo_title || title,
          meta_description || "",
          og_title || seo_title || title,
          og_description || meta_description || "",
          og_image || "/images/amazon-aed-70k-sales-proof.png",
          canonical_url || `https://avantusforge.com/${slug === "home" ? "" : slug}`,
          robots_indexing,
          schema_json || null,
          sectionsStr,
          session.user.username,
        ]
      );

      // Record published revision snapshot
      await p.query(
        `INSERT INTO cms_page_revisions (slug, title, seo_title, meta_description, sections_json, status, created_by)
         VALUES (?, ?, ?, ?, ?, 'published', ?)`,
        [slug, title, seo_title || title, meta_description || "", sectionsStr, session.user.username]
      );

      // Activity log
      await p.query(
        `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
         VALUES (?, 'PAGE_PUBLISHED', 'Page', ?, ?)`,
        [session.user.username, slug, `Published live version with ${Array.isArray(sections) ? sections.length : 0} section(s)`]
      );

      return NextResponse.json({
        success: true,
        message: `Page '${title}' published live successfully! All public visitors will now see the updated layout.`,
      });
    } else {
      // Save Draft
      await p.query(
        `INSERT INTO cms_pages (
           slug, title, seo_title, meta_description, og_title, og_description,
           og_image, canonical_url, robots_indexing, schema_json, status,
           sections_json, draft_sections_json, updated_by
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           title = VALUES(title),
           seo_title = VALUES(seo_title),
           meta_description = VALUES(meta_description),
           og_title = VALUES(og_title),
           og_description = VALUES(og_description),
           og_image = VALUES(og_image),
           canonical_url = VALUES(canonical_url),
           robots_indexing = VALUES(robots_indexing),
           schema_json = VALUES(schema_json),
           draft_sections_json = VALUES(draft_sections_json),
           updated_at = NOW(),
           updated_by = VALUES(updated_by)`,
        [
          slug,
          title,
          seo_title || title,
          meta_description || "",
          og_title || seo_title || title,
          og_description || meta_description || "",
          og_image || "/images/amazon-aed-70k-sales-proof.png",
          canonical_url || `https://avantusforge.com/${slug === "home" ? "" : slug}`,
          robots_indexing,
          schema_json || null,
          sectionsStr, // fallback if new
          sectionsStr, // draft content
          session.user.username,
        ]
      );

      // Record draft revision snapshot
      await p.query(
        `INSERT INTO cms_page_revisions (slug, title, seo_title, meta_description, sections_json, status, created_by)
         VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
        [slug, title, seo_title || title, meta_description || "", sectionsStr, session.user.username]
      );

      // Activity log
      await p.query(
        `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
         VALUES (?, 'PAGE_DRAFT_SAVED', 'Page', ?, ?)`,
        [session.user.username, slug, `Saved unpublished draft revision for page '${title}'`]
      );

      return NextResponse.json({
        success: true,
        message: `Draft revision saved securely. Public visitors will not see changes until published.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "Only Super Administrators can delete pages." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required." }, { status: 400 });
    }

    if (PROTECTED_CORE_SLUGS.includes(slug)) {
      return NextResponse.json(
        { success: false, message: `Core website route '${slug}' is protected and cannot be deleted.` },
        { status: 400 }
      );
    }

    const p = getDbPool();
    await p.query("DELETE FROM cms_pages WHERE slug = ?", [slug]);
    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, 'PAGE_DELETED', 'Page', ?, ?)`,
      [session.user.username, slug, `Deleted custom page '${slug}'`]
    );

    return NextResponse.json({ success: true, message: `Page '${slug}' deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export const PUT = POST;

