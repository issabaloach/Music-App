"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { LogOut, User } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "Successfully logged out of your account",
    })
    router.push("/")
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}