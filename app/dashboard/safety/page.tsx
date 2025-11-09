import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"

export default async function SafetyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch incidents with related data
  const { data: incidents } = await supabase
    .from("incidents")
    .select(`
      *,
      reported_by_profile:profiles!incidents_reported_by_fkey(full_name, company),
      zone:zones(name)
    `)
    .order("created_at", { ascending: false })

  const openIncidents = incidents?.filter((i) => i.status !== "closed") || []
  const riddorIncidents = incidents?.filter((i) => i.is_riddor) || []

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-orange-600 text-white"
      case "medium":
        return "bg-amber-600 text-white"
      case "low":
        return "bg-blue-600 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const IncidentCard = ({ incident }: { incident: any }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`h-5 w-5 ${
                incident.severity === "critical"
                  ? "text-red-600"
                  : incident.severity === "high"
                    ? "text-orange-600"
                    : incident.severity === "medium"
                      ? "text-amber-600"
                      : "text-blue-600"
              }`}
            />
            <h3 className="font-semibold capitalize text-slate-900">{incident.incident_type.replace("_", " ")}</h3>
          </div>

          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{incident.description}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <div>
              <span className="font-medium">Reported by:</span> {incident.reported_by_profile.full_name}
            </div>
            {incident.zone && (
              <div>
                <span className="font-medium">Location:</span> {incident.zone.name}
              </div>
            )}
            <div>
              <span className="font-medium">Date:</span> {new Date(incident.created_at).toLocaleDateString()}
            </div>
          </div>

          {incident.is_riddor && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                RIDDOR Reportable
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
          <Badge variant="outline" className="capitalize">
            {incident.status}
          </Badge>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Safety & Compliance</h1>
          <p className="mt-1 text-slate-600">Incident reporting and safety management</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openIncidents.length}</div>
            <p className="text-xs text-slate-600">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RIDDOR Reports</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riddorIncidents.length}</div>
            <p className="text-xs text-slate-600">Reportable incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents?.length || 0}</div>
            <p className="text-xs text-slate-600">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Incidents ({incidents?.length || 0})</TabsTrigger>
          <TabsTrigger value="open">Open ({openIncidents.length})</TabsTrigger>
          <TabsTrigger value="riddor">RIDDOR ({riddorIncidents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {incidents && incidents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="mb-4 h-12 w-12 text-green-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No incidents reported</h3>
                <p className="text-sm text-slate-600">Keep up the good safety record!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          {openIncidents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No open incidents</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="riddor" className="space-y-4">
          {riddorIncidents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {riddorIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No RIDDOR reportable incidents</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
