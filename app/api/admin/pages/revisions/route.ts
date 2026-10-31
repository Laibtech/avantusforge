import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

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

  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug is required." }, { status: 400 });
  }

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT id, slug, title, seo_title, meta_description, status, created_by, created_at,
              JSON_LENGTH(sections_json) as section_count
       FROM cms_page_revisions 
       WHERE slug = ? 
       ORDER BY id DESC 
       LIMIT 50`,
      [slug]
    );

    return NextResponse.json({ success: true, revisions: rows });
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
      { success: false, message: "Permission Denied: Restoring revisions requires Editor or Administrator role." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    let { slug, revisionId } = body;

    if (!revisionId) {
      return NextResponse.json({ success: false, message: "revisionId is required." }, { status: 400 });
    }

    const p = getDbPool();
    let rows: RowDataPacket[];
    if (slug) {
      [rows] = await p.query<RowDataPacket[]>(
        "SELECT * FROM cms_page_revisions WHERE id = ? AND slug = ? LIMIT 1",
        [revisionId, slug]
      );
    } else {
      [rows] = await p.query<RowDataPacket[]>(
        "SELECT * FROM cms_page_revisions WHERE id = ? LIMIT 1",
        [revisionId]
      );
      if (rows.length > 0) {
        slug = rows[0].slug;
      }
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "Revision snapshot not found." }, { status: 404 });
    }

    const rev = rows[0];

    // Restore into cms_pages
    await p.query(
      `UPDATE cms_pages SET
         title = ?,
         seo_title = ?,
         meta_description = ?,
         sections_json = ?,
         draft_sections_json = NULL,
         status = 'published',
         updated_at = NOW(),
         updated_by = ?
       WHERE slug = ?`,
      [rev.title, rev.seo_title, rev.meta_description, rev.sections_json, session.user.username, slug]
    );

    // Create a new revision entry recording the restoration
    await p.query(
      `INSERT INTO cms_page_revisions (slug, title, seo_title, meta_description, sections_json, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'restored', ?)`,
      [slug, rev.title, rev.seo_title, rev.meta_description, rev.sections_json, session.user.username]
    );

    // Activity log
    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, 'PAGE_REVISION_RESTORED', 'Page', ?, ?)`,
      [session.user.username, slug, `Restored page '${slug}' to revision #${revisionId} from ${rev.created_at}`]
    );

    let parsedSections = [];
    try {
      parsedSections = JSON.parse(rev.sections_json);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully restored revision #${revisionId}. The restored version is now published live.`,
      sections: parsedSections,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export const PUT = POST;

