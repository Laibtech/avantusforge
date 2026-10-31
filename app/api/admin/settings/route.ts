import { NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings, getDbPool } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    let dbStatus = "Connected (MySQL Port 3307)";
    try {
      const p = getDbPool();
      await p.query("SELECT 1");
    } catch {
      dbStatus = "Operating in Fallback Mode (JSON Snapshot)";
    }

    return NextResponse.json({
      success: true,
      settings,
      database: {
        status: dbStatus,
        activeMarkets: settings.target_markets.length,
      },
    });
  } catch (error) {
    console.error("[API Admin Settings GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateSiteSettings(body);
    return NextResponse.json({
      success: true,
      message: "Global settings successfully updated and saved.",
      settings: updated,
    });
  } catch (error) {
    console.error("[API Admin Settings POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
