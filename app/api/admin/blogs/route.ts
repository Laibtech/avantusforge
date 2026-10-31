import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_blogs ORDER BY id DESC"
    );
    return NextResponse.json({ success: true, blogs: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, slug, title, category, author, author_role, excerpt, content, read_time, tags_json, status = "published" } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required." }, { status: 400 });
    }

    const p = getDbPool();
    const tagsStr = typeof tags_json === "string" ? tags_json : JSON.stringify(tags_json || []);

    if (id) {
      await p.query(
        `UPDATE cms_blogs 
         SET slug = ?, title = ?, category = ?, author = ?, author_role = ?, excerpt = ?, content = ?, read_time = ?, tags_json = ?, status = ?
         WHERE id = ?`,
        [slug, title, category || "Engineering", author || "AvantusForge", author_role || "Studio Lead", excerpt || "", content || "", read_time || "5 min read", tagsStr, status, id]
      );
    } else {
      await p.query(
        `INSERT INTO cms_blogs (slug, title, category, author, author_role, excerpt, content, read_time, tags_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, category || "Engineering", author || "AvantusForge", author_role || "Studio Lead", excerpt || "", content || "", read_time || "5 min read", tagsStr, status]
      );
    }

    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, ?, 'Blog', ?, ?)`,
      [session.user.username, id ? "ARTICLE_UPDATED" : "ARTICLE_CREATED", slug, `Saved article: '${title}'`]
    );

    return NextResponse.json({ success: true, message: "Article saved." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const p = getDbPool();
    await p.query("DELETE FROM cms_blogs WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Article deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
