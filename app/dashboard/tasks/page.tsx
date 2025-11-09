import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch all tasks with related data
  const [{ data: tasks }, { data: zones }, { data: users }] = await Promise.all([
    supabase
      .from("tasks")
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name, company),
        created_by_profile:profiles!tasks_created_by_fkey(full_name),
        zone:zones(name)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("zones").select("*"),
    supabase.from("profiles").select("id, full_name, company"),
  ])

  const newTasks = tasks?.filter((t) => t.status === "new") || []
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress") || []
  const blockedTasks = tasks?.filter((t) => t.status === "blocked") || []
  const completeTasks = tasks?.filter((t) => t.status === "complete") || []

  const TaskCard = ({ task }: { task: any }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{task.title}</h3>
            <Badge variant={task.priority === "urgent" ? "destructive" : "secondary"} className="text-xs">
              {task.priority}
            </Badge>
          </div>

          {task.description && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{task.description}</p>}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {task.assigned_to_profile && (
              <div>
                <span className="font-medium">Assigned:</span> {task.assigned_to_profile.full_name}
                {task.assigned_to_profile.company && ` (${task.assigned_to_profile.company})`}
              </div>
            )}
            {task.zone && (
              <div>
                <span className="font-medium">Zone:</span> {task.zone.name}
              </div>
            )}
            {task.due_date && (
              <div>
                <span className="font-medium">Due:</span> {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {task.status === "complete" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : task.status === "in_progress" ? (
            <Clock className="h-5 w-5 text-blue-600" />
          ) : task.status === "blocked" ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <XCircle className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-slate-600">Manage and track all site tasks</p>
        </div>
        <CreateTaskDialog zones={zones || []} users={users || []} />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks ({tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="new">New ({newTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="blocked">Blocked ({blockedTasks.length})</TabsTrigger>
          <TabsTrigger value="complete">Complete ({completeTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {tasks && tasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No tasks yet</h3>
                <p className="mb-4 text-sm text-slate-600">Create your first task to get started</p>
                <CreateTaskDialog zones={zones || []} users={users || []} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {newTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {newTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No new tasks</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No tasks in progress</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          {blockedTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blockedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No blocked tasks</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          {completeTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completeTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No completed tasks</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
