"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

  const task = {
    tenant_id: profile?.tenant_id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    priority: formData.get("priority") as string,
    status: "new",
    assigned_to: (formData.get("assigned_to") as string) || null,
    zone_id: (formData.get("zone_id") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    created_by: user.id,
  }

  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) throw error

  // Create audit log
  await supabase.from("audit_log").insert({
    tenant_id: profile?.tenant_id,
    user_id: user.id,
    action: "create",
    entity_type: "task",
    entity_id: data.id,
    new_values: task,
  })

  // Create notification for assigned user
  if (task.assigned_to) {
    await supabase.from("notifications").insert({
      tenant_id: profile?.tenant_id,
      user_id: task.assigned_to,
      notification_type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned: ${task.title}`,
      entity_type: "task",
      entity_id: data.id,
    })
  }

  revalidatePath("/dashboard/tasks")
  return { success: true, data }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: oldTask } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  const updates = {
    status,
    ...(status === "in_progress" && !oldTask?.started_at ? { started_at: new Date().toISOString() } : {}),
    ...(status === "complete" ? { completed_at: new Date().toISOString() } : {}),
  }

  const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select().single()

  if (error) throw error

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: oldTask?.tenant_id,
    user_id: user.id,
    action: "update",
    entity_type: "task",
    entity_id: taskId,
    old_values: { status: oldTask?.status },
    new_values: { status },
  })

  revalidatePath("/dashboard/tasks")
  revalidatePath("/dashboard")
  return { success: true, data }
}
