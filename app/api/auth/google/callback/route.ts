import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import jwt from "jsonwebtoken"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/auth/google/callback"

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)

// Simple function to generate a random password without crypto
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
      return NextResponse.redirect(new URL("/?error=NoCodeProvided", request.url))
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info")
    }

    const userData = await userInfoResponse.json()
    const { email, name, sub: googleId } = userData

    await connectDB()

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      // Use the standalone function instead of the undefined method
      const password = generateRandomPassword()
      user = await User.create({
        name,
        email,
        googleId,
        password,
      })
    } else if (!user.googleId) {
      user.googleId = googleId
      await user.save()
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" })

    // Redirect with token
    const redirectUrl = new URL("/auth/callback", request.url)
    redirectUrl.searchParams.set("token", token)

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.redirect(new URL("/?error=AuthFailed", request.url))
  }
}
