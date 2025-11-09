import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, AlertTriangle, CheckCircle2, Plus, QrCode } from "lucide-react"

export default async function PPMPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch assets
  const { data: assets } = await supabase
    .from("assets")
    .select(`
      *,
      zone:zones(name)
    `)
    .order("next_maintenance_due", { ascending: true, nullsFirst: false })

  const maintenanceDue = assets?.filter((a) => a.status === "maintenance_due") || []
  const operational = assets?.filter((a) => a.status === "operational") || []

  const AssetCard = ({ asset }: { asset: any }) => {
    const isDue =
      asset.status === "maintenance_due" ||
      (asset.next_maintenance_due && new Date(asset.next_maintenance_due) < new Date())

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Wrench className={`h-5 w-5 ${isDue ? "text-amber-600" : "text-green-600"}`} />
              <h3 className="font-semibold text-slate-900">{asset.name}</h3>
            </div>

            <p className="mt-1 text-xs font-mono text-slate-500">#{asset.asset_number}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <div>
                <span className="font-medium">Type:</span> {asset.asset_type}
              </div>
              {asset.manufacturer && (
                <div>
                  <span className="font-medium">Make:</span> {asset.manufacturer}
                </div>
              )}
              {asset.zone && (
                <div>
                  <span className="font-medium">Location:</span> {asset.zone.name}
                </div>
              )}
            </div>

            {asset.next_maintenance_due && (
              <div className="mt-2 text-xs">
                <span className="font-medium text-slate-700">Next maintenance:</span>{" "}
                <span className={isDue ? "text-red-600 font-medium" : "text-slate-600"}>
                  {new Date(asset.next_maintenance_due).toLocaleDateString()}
                </span>
              </div>
            )}

            {asset.maintenance_frequency && (
              <div className="mt-1 text-xs text-slate-600">
                <span className="font-medium">Frequency:</span> {asset.maintenance_frequency}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={isDue ? "destructive" : "secondary"} className="capitalize">
              {asset.status.replace("_", " ")}
            </Badge>
            {asset.qr_code && <QrCode className="h-4 w-4 text-slate-400" />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">PPM Management</h1>
          <p className="mt-1 text-slate-600">Planned Preventive Maintenance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            Scan Asset
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceDue.length}</div>
            <p className="text-xs text-slate-600">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operational.length}</div>
            <p className="text-xs text-slate-600">Up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Wrench className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets?.length || 0}</div>
            <p className="text-xs text-slate-600">Under management</p>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <div className="space-y-4">
        {maintenanceDue.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Maintenance Due</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {maintenanceDue.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}

        {operational.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Operational Assets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {operational.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}

        {assets && assets.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">No assets registered</h3>
              <p className="mb-4 text-sm text-slate-600">Add your first asset to start tracking maintenance</p>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
