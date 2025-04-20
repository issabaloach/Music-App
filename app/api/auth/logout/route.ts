import { NextResponse } from "next/server"

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL!))

  // Clear the auth cookie
  response.cookies.set({
    name: "auth_token",
    value: "",
    expires: new Date(0),
    path: "/",
  })

  // Clear the user info cookie
  response.cookies.set({
    name: "user_info",
    value: "",
    expires: new Date(0),
    path: "/",
  })

  return response
}
