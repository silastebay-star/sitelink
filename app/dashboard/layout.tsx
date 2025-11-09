import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { MobileNav } from "@/components/mobile-nav"
import { OfflineIndicator } from "@/components/offline-indicator"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, company")
    .eq("id", user.id)
    .single()

  const userData = {
    email: user.email || "",
    full_name: profile?.full_name,
    role: profile?.role,
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader user={userData} />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <DashboardNav />
        </aside>

        {/* Mobile Nav */}
        <div className="fixed bottom-4 left-4 z-50 md:hidden">
          <MobileNav />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      <OfflineIndicator />
    </div>
  )
}
