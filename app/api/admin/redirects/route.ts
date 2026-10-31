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
      "SELECT * FROM url_redirects ORDER BY id DESC"
    );
    return NextResponse.json({ success: true, redirects: rows });
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
    const { id, source_path, target_url, status_code = 301, is_active = 1 } = body;

    if (!source_path || !target_url) {
      return NextResponse.json({ success: false, message: "Source path and target URL are required." }, { status: 400 });
    }

    const p = getDbPool();

    if (id) {
      await p.query(
        "UPDATE url_redirects SET source_path = ?, target_url = ?, status_code = ?, is_active = ? WHERE id = ?",
        [source_path, target_url, status_code, is_active ? 1 : 0, id]
      );
    } else {
      await p.query(
        "INSERT INTO url_redirects (source_path, target_url, status_code, is_active) VALUES (?, ?, ?, ?)",
        [source_path, target_url, status_code, is_active ? 1 : 0]
      );
    }

    await p.query(
      "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, ?, 'Redirect', ?, ?)",
      [session.user.username, id ? "REDIRECT_UPDATED" : "REDIRECT_CREATED", source_path, `Redirect ${source_path} -> ${target_url} (${status_code})`]
    );

    return NextResponse.json({ success: true, message: "Redirect rule saved successfully." });
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
    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const p = getDbPool();
    await p.query("DELETE FROM url_redirects WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Redirect rule deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
