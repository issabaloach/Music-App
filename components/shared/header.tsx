"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { LogOut, Menu } from "lucide-react"
// import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Sidebar } from "./sidebar"

export function Header() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Clear local storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      toast({
        title: "Success",
        description: "Logged out successfully",
      })

      // Redirect to login
      router.push("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      })
    }
  }

  return (
    <header className="border-b">
      <div className="flex h-14 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

