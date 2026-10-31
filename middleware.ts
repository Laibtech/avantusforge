import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("avantus_admin_session")?.value;

  // 1. Protect Admin API Endpoints (Except /api/admin/auth/*)
  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/auth")) {
      return addSecurityHeaders(NextResponse.next());
    }
    if (!token) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Authorization required. Please log in with valid administrator credentials.",
          },
          { status: 401 }
        )
      );
    }
  }

  // 2. Protect Admin UI Routes (Except /admin/login)
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (!token && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (token && isLoginPage) {
      const adminUrl = new URL("/admin", request.url);
      return addSecurityHeaders(NextResponse.redirect(adminUrl));
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // OWASP Recommended Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
