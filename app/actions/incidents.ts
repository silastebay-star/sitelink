"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createIncident(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

  const incident = {
    tenant_id: profile?.tenant_id,
    incident_type: formData.get("incident_type") as string,
    severity: formData.get("severity") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    zone_id: (formData.get("zone_id") as string) || null,
    immediate_action: (formData.get("immediate_action") as string) || null,
    witnesses: (formData.get("witnesses") as string) || null,
    is_riddor: formData.get("is_riddor") === "true",
    reported_by: user.id,
    status: "reported",
  }

  const { data, error } = await supabase.from("incidents").insert(incident).select().single()

  if (error) throw error

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: profile?.tenant_id,
    user_id: user.id,
    action: "create",
    entity_type: "incident",
    entity_id: data.id,
    new_values: incident,
  })

  // Notify safety officers and admin
  const { data: safetyOfficers } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", profile?.tenant_id)
    .in("role", ["admin", "safety_officer"])

  if (safetyOfficers) {
    const notifications = safetyOfficers.map((officer) => ({
      tenant_id: profile?.tenant_id,
      user_id: officer.id,
      notification_type: incident.is_riddor ? "riddor_incident" : "incident_reported",
      title: incident.is_riddor ? "RIDDOR Incident Reported" : "New Incident Reported",
      message: `${incident.incident_type}: ${incident.description.substring(0, 100)}...`,
      entity_type: "incident",
      entity_id: data.id,
    }))

    await supabase.from("notifications").insert(notifications)
  }

  revalidatePath("/dashboard/safety")
  revalidatePath("/dashboard")
  return { success: true, data }
}
