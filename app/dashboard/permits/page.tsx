import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react"

export default async function PermitsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch permits with related data
  const { data: permits } = await supabase
    .from("permits")
    .select(`
      *,
      issued_to_profile:profiles!permits_issued_to_fkey(full_name, company),
      issued_by_profile:profiles!permits_issued_by_fkey(full_name),
      zone:zones(name)
    `)
    .order("created_at", { ascending: false })

  const activePermits = permits?.filter((p) => p.status === "active") || []
  const pendingPermits = permits?.filter((p) => p.status === "pending_approval") || []
  const expiredPermits = permits?.filter((p) => p.status === "expired") || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600 text-white"
      case "pending_approval":
        return "bg-amber-600 text-white"
      case "approved":
        return "bg-blue-600 text-white"
      case "expired":
        return "bg-slate-600 text-white"
      case "revoked":
        return "bg-red-600 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const PermitCard = ({ permit }: { permit: any }) => {
    const isExpiringSoon =
      permit.status === "active" && new Date(permit.valid_to).getTime() - Date.now() < 24 * 60 * 60 * 1000

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold capitalize text-slate-900">{permit.permit_type.replace("_", " ")}</h3>
            </div>

            {permit.permit_number && <p className="mt-1 text-xs font-mono text-slate-500">#{permit.permit_number}</p>}

            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{permit.work_description}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <div>
                <span className="font-medium">Issued to:</span> {permit.issued_to_profile.full_name}
                {permit.issued_to_profile.company && ` (${permit.issued_to_profile.company})`}
              </div>
              {permit.zone && (
                <div>
                  <span className="font-medium">Zone:</span> {permit.zone.name}
                </div>
              )}
            </div>

            <div className="mt-2 flex gap-3 text-xs text-slate-600">
              <div>
                <span className="font-medium">Valid from:</span> {new Date(permit.valid_from).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Until:</span> {new Date(permit.valid_to).toLocaleDateString()}
              </div>
            </div>

            {isExpiringSoon && (
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Expiring Soon
                </Badge>
              </div>
            )}
          </div>

          <Badge className={getStatusColor(permit.status)}>{permit.status.replace("_", " ")}</Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Permits</h1>
          <p className="mt-1 text-slate-600">Permit-to-Work management and tracking</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Issue Permit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Permits</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePermits.length}</div>
            <p className="text-xs text-slate-600">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPermits.length}</div>
            <p className="text-xs text-slate-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permits</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permits?.length || 0}</div>
            <p className="text-xs text-slate-600">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activePermits.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingPermits.length})</TabsTrigger>
          <TabsTrigger value="all">All Permits ({permits?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePermits.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePermits.map((permit) => (
                <PermitCard key={permit.id} permit={permit} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No active permits</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingPermits.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingPermits.map((permit) => (
                <PermitCard key={permit.id} permit={permit} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No pending permits</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {permits && permits.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {permits.map((permit) => (
                <PermitCard key={permit.id} permit={permit} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No permits issued</h3>
                <p className="mb-4 text-sm text-slate-600">Issue your first permit to get started</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Issue Permit
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
