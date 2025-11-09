"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  MapPin,
  AlertTriangle,
  FileText,
  Wrench,
  Users,
  Shield,
  UserPlus,
  Building2,
  BarChart3,
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Site Map",
    href: "/dashboard/map",
    icon: MapPin,
  },
  {
    title: "Safety",
    href: "/dashboard/safety",
    icon: AlertTriangle,
  },
  {
    title: "Permits",
    href: "/dashboard/permits",
    icon: FileText,
  },
  {
    title: "Compliance",
    href: "/dashboard/compliance",
    icon: Shield,
  },
  {
    title: "PPM",
    href: "/dashboard/ppm",
    icon: Wrench,
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    title: "Onboarding",
    href: "/dashboard/onboarding",
    icon: UserPlus,
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: BarChart3,
  },
  {
    title: "Contractors",
    href: "/dashboard/contractors",
    icon: Building2,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-orange-100 text-orange-900" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
