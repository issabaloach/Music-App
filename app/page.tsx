"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function Home() {
  const [showRegister, setShowRegister] = useState(false)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="space-y-4 w-full max-w-md">
        {showRegister ? (
          <>
            <RegisterForm />
            <button
              onClick={() => setShowRegister(false)}
              className="w-full text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Already have an account? Login
            </button>
          </>
        ) : (
          <>
            <LoginForm />
            <button
              onClick={() => setShowRegister(true)}
              className="w-full text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Don't have an account? Register
            </button>
          </>
        )}
      </div>
    </main>
  )
}