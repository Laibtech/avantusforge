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
    const [testimonials] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_testimonials ORDER BY order_index ASC, id ASC"
    );
    const [faqs] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_faqs ORDER BY order_index ASC, id ASC"
    );
    return NextResponse.json({ success: true, testimonials, faqs });
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
    const { type, item } = body;
    const p = getDbPool();

    if (type === "testimonial") {
      const { id, client_name, client_role, company, content, rating = 5, order_index = 0, is_featured = 1 } = item;
      if (id) {
        await p.query(
          "UPDATE cms_testimonials SET client_name=?, client_role=?, company=?, content=?, rating=?, order_index=?, is_featured=? WHERE id=?",
          [client_name, client_role, company, content, rating, order_index, is_featured ? 1 : 0, id]
        );
      } else {
        await p.query(
          "INSERT INTO cms_testimonials (client_name, client_role, company, content, rating, order_index, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [client_name, client_role, company, content, rating, order_index, is_featured ? 1 : 0]
        );
      }
    } else if (type === "faq") {
      const { id, question, answer, category = "General", order_index = 0, is_active = 1 } = item;
      if (id) {
        await p.query(
          "UPDATE cms_faqs SET question=?, answer=?, category=?, order_index=?, is_active=? WHERE id=?",
          [question, answer, category, order_index, is_active ? 1 : 0, id]
        );
      } else {
        await p.query(
          "INSERT INTO cms_faqs (question, answer, category, order_index, is_active) VALUES (?, ?, ?, ?, ?)",
          [question, answer, category, order_index, is_active ? 1 : 0]
        );
      }
    }

    await p.query(
      "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'CONTENT_UPDATED', ?, ?, ?)",
      [session.user.username, type === "faq" ? "FAQ" : "Testimonial", item?.id || "NEW", `Saved ${type}: ${item?.client_name || item?.question || ""}`]
    );

    return NextResponse.json({ success: true, message: "Saved successfully." });
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
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (!id || !type) return NextResponse.json({ success: false, message: "Missing id or type" }, { status: 400 });

    const p = getDbPool();
    if (type === "testimonial") {
      await p.query("DELETE FROM cms_testimonials WHERE id = ?", [id]);
    } else if (type === "faq") {
      await p.query("DELETE FROM cms_faqs WHERE id = ?", [id]);
    }

    return NextResponse.json({ success: true, message: "Deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
