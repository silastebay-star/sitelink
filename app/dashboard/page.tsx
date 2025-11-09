import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ClipboardList,
  AlertTriangle,
  FileText,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch statistics
  const [
    { count: totalTasks },
    { count: activeTasks },
    { count: completeTasks },
    { count: openIncidents },
    { count: activePermits },
    { count: maintenanceDue },
  ] = await Promise.all([
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["new", "in_progress"]),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "complete"),
    supabase.from("incidents").select("*", { count: "exact", head: true }).neq("status", "closed"),
    supabase.from("permits").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "maintenance_due"),
  ])

  // Fetch recent tasks
  const { data: recentTasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name),
      created_by_profile:profiles!tasks_created_by_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">Welcome back, {profile?.full_name || user.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ClipboardList className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks || 0}</div>
            <p className="text-xs text-slate-600">
              {completeTasks || 0} completed of {totalTasks || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openIncidents || 0}</div>
            <p className="text-xs text-slate-600">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Permits</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePermits || 0}</div>
            <p className="text-xs text-slate-600">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Wrench className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceDue || 0}</div>
            <p className="text-xs text-slate-600">Assets requiring service</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest task activity on your site</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/tasks">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTasks && recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {task.status === "complete" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : task.status === "blocked" ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <ClipboardList className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{task.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        {task.assigned_to_profile && <span>Assigned to: {task.assigned_to_profile.full_name}</span>}
                        <span>•</span>
                        <span className="capitalize">{task.priority} priority</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === "complete" ? "default" : task.status === "blocked" ? "destructive" : "secondary"
                    }
                    className="capitalize"
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-600">
              <ClipboardList className="mx-auto mb-3 h-12 w-12 text-slate-400" />
              <p>No tasks yet</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/tasks">Create your first task</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
          <Link href="/dashboard/tasks?action=new">
            <ClipboardList className="h-8 w-8 text-orange-600" />
            <span className="font-semibold">New Task</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
          <Link href="/dashboard/safety?action=report">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <span className="font-semibold">Report Incident</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
          <Link href="/dashboard/permits?action=new">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="font-semibold">Issue Permit</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
          <Link href="/dashboard/ppm?action=log">
            <Wrench className="h-8 w-8 text-amber-600" />
            <span className="font-semibold">Log Maintenance</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
