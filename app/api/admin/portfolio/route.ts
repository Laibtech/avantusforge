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
      "SELECT * FROM cms_portfolio ORDER BY order_index ASC, id ASC"
    );
    return NextResponse.json({ success: true, projects: rows });
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
    const { id, slug, title, client_name, category, tagline, summary, image_url, deliverables_json, results_metric, order_index, is_featured, status = "published" } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required." }, { status: 400 });
    }

    const p = getDbPool();
    const deliverablesStr = typeof deliverables_json === "string" ? deliverables_json : JSON.stringify(deliverables_json || []);

    if (id) {
      await p.query(
        `UPDATE cms_portfolio 
         SET slug = ?, title = ?, client_name = ?, category = ?, tagline = ?, summary = ?, image_url = ?, deliverables_json = ?, results_metric = ?, order_index = ?, is_featured = ?, status = ?
         WHERE id = ?`,
        [slug, title, client_name || "", category || "All Work", tagline || "", summary || "", image_url || "/projects/vendor-management.jpg", deliverablesStr, results_metric || "", order_index || 0, Boolean(is_featured), status, id]
      );
    } else {
      await p.query(
        `INSERT INTO cms_portfolio (slug, title, client_name, category, tagline, summary, image_url, deliverables_json, results_metric, order_index, is_featured, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, client_name || "", category || "All Work", tagline || "", summary || "", image_url || "/projects/vendor-management.jpg", deliverablesStr, results_metric || "", order_index || 0, Boolean(is_featured), status]
      );
    }

    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, ?, 'Portfolio', ?, ?)`,
      [session.user.username, id ? "PORTFOLIO_UPDATED" : "PORTFOLIO_CREATED", slug, `Saved project: '${title}' (${client_name})`]
    );

    return NextResponse.json({ success: true, message: "Portfolio project successfully saved." });
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
    await p.query("DELETE FROM cms_portfolio WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Project deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
