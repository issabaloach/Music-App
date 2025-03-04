"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/src/components/ui/button"
import { MusicIcon } from "lucide-react"

export default function Home() {
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <MusicIcon className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Music App</h1>
        <p className="text-muted-foreground mt-2">Your personal music library</p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border p-6">
          {showRegister ? (
            <>
              <RegisterForm />
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setShowRegister(false)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Already have an account? Login
                </Button>
              </div>
            </>
          ) : (
            <>
              <LoginForm />
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setShowRegister(true)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Don't have an account? Register
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Listen to your favorite music anytime, anywhere.</p>
          <p className="mt-1">Upload, organize, and share your music collection.</p>
        </div>
      </div>
    </main>
  )
}

