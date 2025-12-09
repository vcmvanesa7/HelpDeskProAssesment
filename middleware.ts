import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// To protect server routes for agent/admin roles.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public paths (login, register, home)
  const publicPaths = ["/auth/login", "/auth/register", "/"];

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Require authentication for everything else
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Protect agent routes
  if (pathname.startsWith("/agent") && token.role !== "support") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect client support area
  if (pathname.startsWith("/support") && token.role !== "client") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|public).*)",
  ],
};
