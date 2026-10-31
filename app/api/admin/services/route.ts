import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_services ORDER BY order_index ASC, id ASC"
    );
    return NextResponse.json({ success: true, services: rows });
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
    const { id, slug, title, category, short_desc, deliverables_json, pricing_tier, is_featured, order_index, status = "published" } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required." }, { status: 400 });
    }

    const p = getDbPool();
    const deliverablesStr = typeof deliverables_json === "string" ? deliverables_json : JSON.stringify(deliverables_json || []);

    if (id) {
      await p.query(
        `UPDATE cms_services 
         SET slug = ?, title = ?, category = ?, short_desc = ?, deliverables_json = ?, pricing_tier = ?, is_featured = ?, order_index = ?, status = ?
         WHERE id = ?`,
        [slug, title, category || "Software Engineering", short_desc || "", deliverablesStr, pricing_tier || "Enterprise", Boolean(is_featured), order_index || 0, status, id]
      );
    } else {
      await p.query(
        `INSERT INTO cms_services (slug, title, category, short_desc, deliverables_json, pricing_tier, is_featured, order_index, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, category || "Software Engineering", short_desc || "", deliverablesStr, pricing_tier || "Enterprise", Boolean(is_featured), order_index || 0, status]
      );
    }

    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, ?, 'Service', ?, ?)`,
      [session.user.username, id ? "SERVICE_UPDATED" : "SERVICE_CREATED", slug, `Saved service: '${title}' (${category})`]
    );

    return NextResponse.json({ success: true, message: "Service successfully saved." });
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
    await p.query("DELETE FROM cms_services WHERE id = ?", [id]);

    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, 'SERVICE_DELETED', 'Service', ?, 'Service record permanently removed.')`,
      [session.user.username, id]
    );

    return NextResponse.json({ success: true, message: "Service successfully deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
