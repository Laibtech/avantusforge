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
      "SELECT * FROM cms_solutions ORDER BY id ASC"
    );
    return NextResponse.json({ success: true, solutions: rows });
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
    const { id, slug, title, industry, summary, challenges_json, solutions_json, impact_metrics, status = "published" } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required." }, { status: 400 });
    }

    const p = getDbPool();
    const challengesStr = typeof challenges_json === "string" ? challenges_json : JSON.stringify(challenges_json || []);
    const solutionsStr = typeof solutions_json === "string" ? solutions_json : JSON.stringify(solutions_json || []);

    if (id) {
      await p.query(
        `UPDATE cms_solutions 
         SET slug = ?, title = ?, industry = ?, summary = ?, challenges_json = ?, solutions_json = ?, impact_metrics = ?, status = ?
         WHERE id = ?`,
        [slug, title, industry || "Enterprise", summary || "", challengesStr, solutionsStr, impact_metrics || "", status, id]
      );
    } else {
      await p.query(
        `INSERT INTO cms_solutions (slug, title, industry, summary, challenges_json, solutions_json, impact_metrics, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, industry || "Enterprise", summary || "", challengesStr, solutionsStr, impact_metrics || "", status]
      );
    }

    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, ?, 'Solution', ?, ?)`,
      [session.user.username, id ? "SOLUTION_UPDATED" : "SOLUTION_CREATED", slug, `Saved solution: '${title}' (${industry})`]
    );

    return NextResponse.json({ success: true, message: "Solution successfully saved." });
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
    await p.query("DELETE FROM cms_solutions WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Solution removed." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
