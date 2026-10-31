import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDbPool } from "@/lib/db";

function parseDevice(ua: string): { device: string; browser: string; os: string } {
  const uaLower = ua.toLowerCase();

  // Device
  let device = "desktop";
  if (/mobile|android|iphone|ipod/i.test(uaLower)) {
    device = "mobile";
  } else if (/ipad|tablet/i.test(uaLower)) {
    device = "tablet";
  }

  // Browser
  let browser = "Other";
  if (uaLower.includes("chrome") && !uaLower.includes("edg")) browser = "Chrome";
  else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";
  else if (uaLower.includes("firefox")) browser = "Firefox";
  else if (uaLower.includes("edg")) browser = "Edge";

  // OS
  let os = "Other";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("macintosh") || uaLower.includes("mac os")) os = "macOS";
  else if (uaLower.includes("linux")) os = "Linux";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad")) os = "iOS";

  return { device, browser, os };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path = "/", referrer = "", session_id = "" } = body;

    // Do not track admin routes to avoid skewing public analytics
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const ua = req.headers.get("user-agent") || "";
    const { device, browser, os } = parseDevice(ua);

    // Approximate IP hash for privacy
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

    const sessionId = session_id || `sess_${ipHash}_${new Date().toISOString().slice(0, 10)}`;

    try {
      const p = getDbPool();

      // Upsert visitor_sessions
      await p.query(
        `INSERT INTO visitor_sessions (id, landing_page, referrer, device_type, country, total_pageviews, last_seen_at)
         VALUES (?, ?, ?, ?, 'United Kingdom', 1, NOW())
         ON DUPLICATE KEY UPDATE 
            total_pageviews = total_pageviews + 1,
            last_seen_at = NOW()`,
        [sessionId, path, referrer || "Direct", device]
      );

      // Insert visitor_pageview event
      await p.query(
        `INSERT INTO visitor_pageviews (session_id, path, referrer, user_agent, device_type, browser, os, country, ip_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'United Kingdom', ?)`,
        [sessionId, path, referrer || "Direct", ua.slice(0, 255), device, browser, os, ipHash]
      );
    } catch (dbErr: any) {
      // Graceful fallback if database is busy
      console.warn("[Analytics Tracker] DB write skipped:", dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
