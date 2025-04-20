import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies()
    const token =  cookieStore.get("auth_token")?.value

    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Not authenticated" }), { status: 401 })
    }

    // Verify the token using jose instead of jsonwebtoken
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)

    // Return user info
    return NextResponse.json({
      userId: payload.userId,
      email: payload.email,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return new NextResponse(JSON.stringify({ error: "Authentication failed" }), { status: 401 })
  }
}
