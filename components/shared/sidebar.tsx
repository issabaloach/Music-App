"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/src/components/ui/button"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Home, Library, Plus, Search } from 'lucide-react'
import { usePathname } from "next/navigation"
import Link from "next/link"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const routes = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
    },
    {
      icon: Search,
      label: "Search",
      href: "/dashboard/search",
    },
    {
      icon: Library,
      label: "Library",
      href: "/dashboard/library",
    },
  ]

  return (
    <div className={cn("pb-12 w-64 border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Music Player</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start"
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
        <div className="px-3 py-2">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold">Your Library</h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[300px] px-2">
            <div className="space-y-1 p-2">
              {/* Library items will go here */}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}