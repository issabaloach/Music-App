import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

// This function determines if a route should be protected
function isProtectedRoute(path: string): boolean {
  // Explicitly list protected routes - make sure this matches your sidebar routes
  const protectedPaths = ["/dashboard", "/dashboard/library", "/dashboard/upload", "/profile", "/settings"]

  // Check if the path exactly matches or starts with any protected path
  return protectedPaths.some((protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // If this is not a protected route, allow access without checking auth
  if (!isProtectedRoute(path)) {
    return NextResponse.next()
  }

  // For protected routes, check for the auth token
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    // No token found, redirect to login
    console.log(`No auth token found for protected route: ${path}`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)

    // Token is valid, continue to the protected route
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.userId as string)
    requestHeaders.set("x-user-email", payload.email as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error(`Token verification failed for path ${path}:`, error)
    // Token is invalid, redirect to login
    return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url))
  }
}

// Configure the middleware to run on ALL routes
// We'll handle the protection logic inside the middleware function
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
