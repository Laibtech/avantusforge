import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import {
  getLiveTrackingMetrics,
  getSessionTimeline,
  cleanupOldVisitorRecords,
  generateVisitorsCsv,
} from "@/lib/tracking-db";
import { getDbPool } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const exportFormat = searchParams.get("export");
  const countryFilter = searchParams.get("country") || undefined;
  const sourceFilter = searchParams.get("source") || undefined;

  // Strict role check for raw IP access
  const isSuperAdmin = session.user.role === "super_admin";
  const includeRawIp = isSuperAdmin && searchParams.get("include_raw_ip") === "1";

  // 1. Single Session Activity Timeline
  if (sessionId) {
    try {
      const data = await getSessionTimeline(sessionId);
      if (!data.session) {
        return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
      }

      // Strip raw IP if not authorized
      if (!includeRawIp && data.session) {
        delete (data.session as { ip_address?: string }).ip_address;
      }

      return NextResponse.json({
        success: true,
        session: data.session,
        timeline: data.timeline,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ success: false, message: msg }, { status: 500 });
    }
  }

  // 2. CSV Export
  if (exportFormat === "csv") {
    try {
      const metrics = await getLiveTrackingMetrics({
        countryFilter,
        sourceFilter,
        includeRawIp,
      });

      const csvContent = generateVisitorsCsv(metrics.activeSessions, includeRawIp);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="avantusforge-visitors-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ success: false, message: msg }, { status: 500 });
    }
  }

  // 3. Full Real-Time Telemetry Dashboard Payload
  try {
    const data = await getLiveTrackingMetrics({
      countryFilter,
      sourceFilter,
      includeRawIp,
    });

    return NextResponse.json({
      success: true,
      currentUserRole: session.user.role,
      canViewRawIp: isSuperAdmin,
      ...data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Visitors API] Error loading telemetry:", msg);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/**
 * Retention Cleanup & Policy execution
 */
export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const retentionDays = Math.max(1, Math.min(Number(body.retentionDays) || 30, 365));

    const result = await cleanupOldVisitorRecords(retentionDays);

    // Audit log
    try {
      const p = getDbPool();
      await p.query(
        `INSERT INTO cms_audit_logs (action, details, actor) VALUES (?, ?, ?)`,
        [
          "VISITOR_RETENTION_CLEANUP",
          `Purged records older than ${retentionDays} days. Sessions removed: ${result.deletedSessions}, Pageviews removed: ${result.deletedPageviews}`,
          session.user.full_name || session.user.username,
        ]
      );
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up records older than ${retentionDays} days.`,
      ...result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
