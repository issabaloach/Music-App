import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import jwt from "jsonwebtoken"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/auth/google/callback"

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)

function generateRandomPassword(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    password += chars[randomIndex]
  }
  return password
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")

    if (!code) {
      console.error("No code provided in callback")
      return NextResponse.redirect(new URL("/?error=NoCodeProvided", request.url))
    }

    console.log("Received auth code, exchanging for tokens...")

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    if (!tokens.access_token) {
      console.error("No access token received")
      return NextResponse.redirect(new URL("/?error=NoAccessToken", request.url))
    }

    console.log("Fetching user info...")

    // Get user info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch user info:", await userInfoResponse.text())
      throw new Error("Failed to fetch user info")
    }

    const userData = await userInfoResponse.json()
    console.log("User data received:", userData.email)

    const { email, name, sub: googleId } = userData

    await connectDB()
    console.log("Connected to database")

    // Find or create user
    let user = await User.findOne({ email })
    console.log("User found in DB:", !!user)

    if (!user) {
      // Create new user
      const password = generateRandomPassword()
      user = await User.create({
        name,
        email,
        googleId,
        password,
      })
      console.log("New user created:", user.email)
    } else if (!user.googleId) {
      user.googleId = googleId
      await user.save()
      console.log("Updated existing user with Google ID")
    }

    // Create JWT token - make sure the structure matches what middleware expects
    const token = jwt.sign(
      {
        userId: user._id.toString(), // Ensure this is a string
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    console.log("JWT token created, redirecting to dashboard")

    // Set the token as an HTTP-only cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Set the token as a secure HTTP-only cookie
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Also set a non-httpOnly cookie for client-side access if needed
    response.cookies.set({
      name: "user_info",
      value: JSON.stringify({ name, email }),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.redirect(new URL("/?error=AuthFailed", request.url))
  }
}
