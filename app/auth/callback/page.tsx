"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // This page should only be hit if we're using the URL parameter approach
    // If we're using cookies (the updated approach), this page won't be needed
    const token = searchParams.get("token")

    if (token) {
      // Store the token in localStorage
      localStorage.setItem("auth_token", token)

      // Redirect to dashboard
      router.push("/dashboard")
    } else {
      // No token found, redirect to login
      router.push("/login?error=NoToken")
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Completing login...</h1>
        <p className="mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
