import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingDown, BookOpen, CheckCircle } from "lucide-react"

export default async function NearMissesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch near misses
  const { data: nearMisses } = await supabase
    .from("near_misses")
    .select(`
      *,
      reporter:profiles!near_misses_reported_by_fkey(full_name, company),
      zone:zones(name)
    `)
    .order("occurred_at", { ascending: false })

  const openNearMisses = nearMisses?.filter((n) => n.status !== "closed").length || 0
  const sharedWithTeam = nearMisses?.filter((n) => n.shared_with_team).length || 0
  const toolboxTalks = nearMisses?.filter((n) => n.toolbox_talk_given).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Near Miss Reports</h1>
          <p className="mt-1 text-slate-600">Learn from close calls to prevent incidents</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2 h-4 w-4" />
          Report Near Miss
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Near Misses</CardTitle>
            <TrendingDown className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openNearMisses}</div>
            <p className="text-xs text-slate-600">Under investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared with Team</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedWithTeam}</div>
            <p className="text-xs text-slate-600">Lessons communicated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toolbox Talks</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolboxTalks}</div>
            <p className="text-xs text-slate-600">Training completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {nearMisses && nearMisses.length > 0 ? (
          nearMisses.map((nearMiss) => (
            <Card key={nearMiss.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {nearMiss.status.replace("_", " ")}
                      </Badge>
                      {nearMiss.shared_with_team && (
                        <Badge className="bg-blue-600 text-white">
                          <BookOpen className="mr-1 h-3 w-3" />
                          Shared
                        </Badge>
                      )}
                      {nearMiss.toolbox_talk_given && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Toolbox Talk
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">Description</h3>
                      <p className="mt-1 text-sm text-slate-600">{nearMiss.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">What Could Have Happened</h3>
                      <p className="mt-1 text-sm text-slate-600">{nearMiss.what_could_have_happened}</p>
                    </div>

                    {nearMiss.lessons_learned && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <h3 className="font-semibold text-blue-900">Lessons Learned</h3>
                        <p className="mt-1 text-sm text-blue-700">{nearMiss.lessons_learned}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <div>
                        <span className="font-medium">Reported by:</span> {nearMiss.reporter.full_name}
                      </div>
                      {nearMiss.zone && (
                        <div>
                          <span className="font-medium">Location:</span> {nearMiss.zone.name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Date:</span> {new Date(nearMiss.occurred_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="mb-4 h-12 w-12 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">No near misses reported</h3>
              <p className="mb-4 text-sm text-slate-600">Encourage reporting to learn from close calls</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
