import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filterEntity = searchParams.get("entity");
    const search = searchParams.get("q")?.toLowerCase();

    const p = getDbPool();

    let query = "SELECT * FROM admin_activity_logs";
    const params: any[] = [];
    const conditions: string[] = [];

    if (filterEntity && filterEntity !== "All") {
      conditions.push("entity_type = ?");
      params.push(filterEntity);
    }

    if (search) {
      conditions.push("(actor LIKE ? OR action LIKE ? OR details LIKE ? OR entity_id LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY id DESC LIMIT 100";

    const [rows] = await p.query<RowDataPacket[]>(query, params);

    // Entity types for filtering
    const [entityRows] = await p.query<RowDataPacket[]>(
      "SELECT DISTINCT entity_type FROM admin_activity_logs ORDER BY entity_type ASC"
    );

    return NextResponse.json({
      success: true,
      logs: rows,
      entities: entityRows.map((r) => r.entity_type),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
