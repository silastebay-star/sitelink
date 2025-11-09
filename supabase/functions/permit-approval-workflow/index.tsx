// Supabase Edge Function for permit approval workflow
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/imports.ts"

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  try {
    const { permitId, action, userId, comments } = await req.json()

    // Get permit details
    const { data: permit, error: permitError } = await supabaseClient
      .from("permits")
      .select("*, tenants(*), profiles!issued_by(*)")
      .eq("id", permitId)
      .single()

    if (permitError) throw permitError

    // Update permit status based on action
    let newStatus = permit.status
    if (action === "approve") {
      newStatus = "active"
    } else if (action === "reject") {
      newStatus = "rejected"
    } else if (action === "close") {
      newStatus = "closed"
    }

    const { error: updateError } = await supabaseClient
      .from("permits")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", permitId)

    if (updateError) throw updateError

    // Create audit log entry
    await supabaseClient.from("audit_log").insert({
      tenant_id: permit.tenant_id,
      user_id: userId,
      action: `permit_${action}`,
      entity_type: "permit",
      entity_id: permitId,
      details: { comments, previous_status: permit.status, new_status: newStatus },
    })

    // Create notification
    await supabaseClient.from("notifications").insert({
      tenant_id: permit.tenant_id,
      user_id: permit.issued_by,
      type: "permit_update",
      title: `Permit ${action}d`,
      message: `Your ${permit.permit_type} permit has been ${action}d`,
      related_entity: "permit",
      related_id: permitId,
    })

    // Send email notification
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: permit.profiles.email,
        subject: `Permit ${action}d: ${permit.permit_type}`,
        html: `<h2>Your permit has been ${action}d</h2><p>Comments: ${comments}</p>`,
        text: `Your permit has been ${action}d. Comments: ${comments}`,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
