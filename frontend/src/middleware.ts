import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files, image optimizations, Next internals, favicon, and /api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check auth cookie/token
  const authToken =
    request.cookies.get("optibuild_token")?.value ||
    request.cookies.get("auth_token")?.value

  // If on /login page
  if (pathname === "/login") {
    // If already authenticated, redirect to / (role redirection handled by client)
    if (authToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // If unauthenticated, redirect to /login
  if (!authToken) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
