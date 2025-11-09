"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, Layers, Activity, Info } from "lucide-react"

export default function MapPage() {
  const [zones, setZones] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState<any>(null)

  useEffect(() => {
    loadZones()
    loadActiveTasks()
  }, [])

  const loadZones = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("zones").select("*")
    if (data) {
      setZones(data)
    }
  }

  const loadActiveTasks = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("tasks").select("*, zone:zones(*)").in("status", ["new", "in_progress"])
    if (data) {
      setTasks(data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Live Site Map</h1>
          <p className="mt-1 text-slate-600">Real-time zone visualization and work tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Layers className="mr-2 h-4 w-4" />
            Layers
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Zone
          </Button>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Mapping Integration:</strong> To enable interactive site mapping with Mapbox, see the setup guide in
          README.md for configuration instructions.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex h-[600px] w-full flex-col items-center justify-center bg-slate-100">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Interactive Site Map</h3>
                <p className="max-w-md text-center text-sm text-slate-600">
                  Live zone visualization, geofencing, and real-time work tracking
                </p>
                <div className="mt-4 flex gap-3 text-xs text-slate-500">
                  <span>• Zone Management</span>
                  <span>• Real-time Updates</span>
                  <span>• Asset Tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <Activity className="h-4 w-4 text-green-600" />
                Active Works: {tasks.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold text-slate-900">Site Zones ({zones.length})</h3>
              <div className="space-y-2">
                {zones.length > 0 ? (
                  zones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color || "#3b82f6" }} />
                        <span className="text-sm font-medium text-slate-900">{zone.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {zone.zone_type}
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-slate-500">No zones defined yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedZone && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold text-slate-900">{selectedZone.name}</h3>
                <p className="text-sm text-slate-600">{selectedZone.description || "No description"}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    View Details
                  </Button>
                  <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
