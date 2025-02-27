import { Header } from "@/components/shared/header"
import { Sidebar } from "@/components/shared/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}