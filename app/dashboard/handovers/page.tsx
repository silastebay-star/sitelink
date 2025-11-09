import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, CheckCircle2, Users, FileText } from "lucide-react"

export default async function HandoversPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch shift handovers
  const { data: shiftHandovers } = await supabase
    .from("shift_handovers")
    .select(`
      *,
      outgoing:profiles!shift_handovers_outgoing_supervisor_fkey(full_name),
      incoming:profiles!shift_handovers_incoming_supervisor_fkey(full_name)
    `)
    .order("handover_time", { ascending: false })
    .limit(20)

  // Fetch permit handovers
  const { data: permitHandovers } = await supabase
    .from("permit_handovers")
    .select(`
      *,
      permit:permits(permit_number, permit_type, work_description),
      handed_by:profiles!permit_handovers_handed_over_by_fkey(full_name),
      handed_to:profiles!permit_handovers_handed_over_to_fkey(full_name)
    `)
    .order("handover_time", { ascending: false })
    .limit(20)

  const completedHandovers = shiftHandovers?.filter((h) => h.handover_complete).length || 0
  const pendingHandovers = shiftHandovers?.filter((h) => !h.handover_complete).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shift Handovers</h1>
          <p className="mt-1 text-slate-600">Formal handover procedures for safety continuity</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Start Handover
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Handovers</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shiftHandovers?.length || 0}</div>
            <p className="text-xs text-slate-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedHandovers}</div>
            <p className="text-xs text-slate-600">Signed off</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHandovers}</div>
            <p className="text-xs text-slate-600">Awaiting signature</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shift Handovers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Shift Handovers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shiftHandovers && shiftHandovers.length > 0 ? (
              shiftHandovers.map((handover) => (
                <div key={handover.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {handover.shift_type.replace(/_/g, " ")}
                        </Badge>
                        {handover.handover_complete ? (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-600 text-white">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 text-sm text-slate-700">
                        <div>
                          <span className="font-medium">From:</span> {handover.outgoing.full_name}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {handover.incoming.full_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {new Date(handover.handover_time).toLocaleString()}
                        </div>
                      </div>

                      {handover.active_permits && handover.active_permits.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          <FileText className="mr-1 inline h-3 w-3" />
                          {handover.active_permits.length} active permit{handover.active_permits.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-600">No shift handovers recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Permit Handovers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Permit Handovers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {permitHandovers && permitHandovers.length > 0 ? (
              permitHandovers.map((handover) => (
                <div key={handover.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {handover.handover_type.replace(/_/g, " ")}
                        </Badge>
                        <Badge className="capitalize">{handover.work_status.replace(/_/g, " ")}</Badge>
                      </div>

                      {handover.permit && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium capitalize text-slate-900">
                            {handover.permit.permit_type.replace("_", " ")}
                          </div>
                          <div className="text-xs font-mono text-slate-500">#{handover.permit.permit_number}</div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-slate-600">
                        <div>
                          <span className="font-medium">From:</span> {handover.handed_by.full_name}
                        </div>
                        {handover.handed_to && (
                          <div>
                            <span className="font-medium">To:</span> {handover.handed_to.full_name}
                          </div>
                        )}
                        <div className="mt-1">{new Date(handover.handover_time).toLocaleString()}</div>
                      </div>

                      {handover.handover_notes && (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">{handover.handover_notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-600">No permit handovers recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
