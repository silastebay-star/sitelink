import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, User, Clock } from "lucide-react"

export default async function AuditPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select(`
      *,
      user:profiles(full_name, company, role)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      case "delete":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
        <p className="mt-1 text-slate-600">Complete activity log for compliance and accountability</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {auditLogs?.map((log) => (
              <div key={log.id} className="flex items-start gap-4 rounded-lg border border-slate-200 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action)}>{log.action.toUpperCase()}</Badge>
                    <span className="font-medium text-slate-900 capitalize">{log.entity_type.replace("_", " ")}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {log.user?.full_name || "System"}
                      {log.user?.role && <span className="text-xs text-slate-500">({log.user.role})</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.entity_id && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        ID: {log.entity_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>

                  {log.new_values && (
                    <div className="mt-2 rounded bg-slate-50 p-2 text-xs font-mono text-slate-700">
                      {JSON.stringify(log.new_values, null, 2).slice(0, 200)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
