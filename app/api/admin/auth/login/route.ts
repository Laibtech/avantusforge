import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. IP-level rate limiting on login endpoint: max 10 attempts per minute
    const rateCheck = checkRateLimit(`login_ip_${clientIp}`, 10, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts from this network. Please wait ${rateCheck.retryAfter || 60} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    const result = await authenticateAdmin(String(username), String(password), clientIp);

    if (!result.success || !result.token || !result.user) {
      return NextResponse.json(
        { success: false, message: result.error || "Invalid credentials provided." },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("avantus_admin_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 3600, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        full_name: result.user.full_name,
        role: result.user.role,
      },
      message: "Authentication successful.",
    });
  } catch (error: any) {
    console.error("[Admin Login Error]", error);
    return NextResponse.json(
      { success: false, message: "An unexpected authentication error occurred." },
      { status: 500 }
    );
  }
}
