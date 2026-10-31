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

    // 1. Active sessions in the last 30 minutes
    const [activeSessions] = await p.query<RowDataPacket[]>(
      `SELECT id, landing_page, referrer, device_type, country, total_pageviews, duration_seconds, started_at, last_seen_at,
              TIMESTAMPDIFF(SECOND, last_seen_at, NOW()) AS seconds_ago
       FROM visitor_sessions
       WHERE last_seen_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       ORDER BY last_seen_at DESC
       LIMIT 50`
    );

    // 2. Real-time stream of latest pageviews
    const [recentPageviews] = await p.query<RowDataPacket[]>(
      `SELECT id, session_id, path, referrer, device_type, browser, os, country, city, duration_seconds, created_at,
              TIMESTAMPDIFF(SECOND, created_at, NOW()) AS seconds_ago
       FROM visitor_pageviews
       ORDER BY id DESC
       LIMIT 40`
    );

    // 3. Current active count (last 5 minutes)
    const [liveCount] = await p.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT id) AS active_now 
       FROM visitor_sessions 
       WHERE last_seen_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
    );

    return NextResponse.json({
      success: true,
      activeNow: liveCount[0]?.active_now || 0,
      sessions: activeSessions,
      recentPageviews,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
