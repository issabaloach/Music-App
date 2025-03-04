"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/src/components/ui/button"
import { MusicIcon, HomeIcon, UploadIcon, LibraryIcon } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: HomeIcon,
      label: "Home",
    },
    {
      href: "/dashboard/library",
      icon: LibraryIcon,
      label: "My Library",
    },
    {
      href: "/dashboard/upload",
      icon: UploadIcon,
      label: "Upload",
    },
  ]

  return (
    <div className="h-screen w-64 border-r bg-card hidden md:block">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <MusicIcon className="h-5 w-5 text-primary" />
          <span>Music Player</span>
        </Link>
      </div>
      <div className="space-y-1 p-2">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={cn("w-full justify-start", pathname === route.href && "bg-secondary")}
            asChild
          >
            <Link href={route.href}>
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}

