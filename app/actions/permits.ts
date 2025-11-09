"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPermit(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

  const permit = {
    tenant_id: profile?.tenant_id,
    permit_type: formData.get("permit_type") as string,
    permit_number: `PTW-${Date.now().toString().slice(-6)}`,
    issued_to: formData.get("issued_to") as string,
    issued_by: user.id,
    zone_id: (formData.get("zone_id") as string) || null,
    work_description: formData.get("work_description") as string,
    risk_assessment: (formData.get("risk_assessment") as string) || null,
    control_measures: (formData.get("control_measures") as string) || null,
    valid_from: formData.get("valid_from") as string,
    valid_to: formData.get("valid_to") as string,
    status: "pending_approval",
  }

  const { data, error } = await supabase.from("permits").insert(permit).select().single()

  if (error) throw error

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: profile?.tenant_id,
    user_id: user.id,
    action: "create",
    entity_type: "permit",
    entity_id: data.id,
    new_values: permit,
  })

  // Notify issued_to user
  await supabase.from("notifications").insert({
    tenant_id: profile?.tenant_id,
    user_id: permit.issued_to,
    notification_type: "permit_issued",
    title: "New Permit Issued",
    message: `Permit ${permit.permit_number} for ${permit.work_description}`,
    entity_type: "permit",
    entity_id: data.id,
  })

  revalidatePath("/dashboard/permits")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function approvePermit(permitId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("permits")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", permitId)
    .select()
    .single()

  if (error) throw error

  // Notify permit holder
  await supabase.from("notifications").insert({
    tenant_id: data.tenant_id,
    user_id: data.issued_to,
    notification_type: "permit_approved",
    title: "Permit Approved",
    message: `Permit ${data.permit_number} has been approved`,
    entity_type: "permit",
    entity_id: permitId,
  })

  revalidatePath("/dashboard/permits")
  return { success: true, data }
}
