import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  extractClientIp,
  maskIp,
  resolveLocation,
  categorizeReferrer,
  parseUserAgent,
} from "@/lib/geolocation";
import { recordPageView, recordHeartbeat } from "@/lib/tracking-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      type = "pageview",
      path = "/",
      previous_path = "",
      referrer = "Direct",
      session_id = "",
      is_returning = false,
      duration = 25,
    } = body;

    // Do not track internal admin panel or API calls
    if (
      typeof path === "string" &&
      (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next"))
    ) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const rawIp = extractClientIp(req.headers);
    const maskedIp = maskIp(rawIp);
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);
    const sessionId = session_id || `sess_${ipHash}_${Date.now()}`;

    // Handle periodic heartbeat / dwell time tracking
    if (type === "heartbeat") {
      await recordHeartbeat({
        sessionId,
        path: String(path).slice(0, 255),
        durationSeconds: Math.min(Math.max(Number(duration) || 25, 1), 300),
      });

      return NextResponse.json({ success: true, type: "heartbeat" });
    }

    // Handle full pageview event
    const ua = req.headers.get("user-agent") || "";
    const { device, browser, os } = parseUserAgent(ua);
    const geo = await resolveLocation(rawIp, req.headers);
    const { source: referrerSource } = categorizeReferrer(referrer, path);

    await recordPageView({
      sessionId,
      rawIp,
      maskedIp,
      path: String(path).slice(0, 255),
      previousPath: previous_path ? String(previous_path).slice(0, 255) : undefined,
      referrer: String(referrer).slice(0, 500) || "Direct",
      referrerSource,
      device,
      browser,
      os,
      geo,
      isReturning: Boolean(is_returning),
    });

    return NextResponse.json({
      success: true,
      sessionId,
      maskedIp,
      country: geo.country,
      flag: geo.flag,
      city: geo.city,
    });
  } catch (err: any) {
    console.error("[Track API] Ingestion error:", err.message);
    return NextResponse.json({ success: false, error: "Internal processing error" }, { status: 500 });
  }
}
