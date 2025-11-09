import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle, Shield, CheckCircle } from "lucide-react"

export default async function SimopsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch SIMOPS analyses
  const { data: simopsAnalyses } = await supabase
    .from("simops_analysis")
    .select(`
      *,
      analyzer:profiles!simops_analysis_analyzed_by_fkey(full_name),
      approver:profiles!simops_analysis_approved_by_fkey(full_name)
    `)
    .order("analysis_date", { ascending: false })

  const pendingApproval = simopsAnalyses?.filter((s) => s.status === "pending").length || 0
  const highRisk = simopsAnalyses?.filter((s) => s.risk_level === "high" || s.risk_level === "critical").length || 0
  const approved = simopsAnalyses?.filter((s) => s.status === "approved").length || 0

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-orange-600 text-white"
      case "medium":
        return "bg-amber-600 text-white"
      case "low":
        return "bg-green-600 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SIMOPS Analysis</h1>
          <p className="mt-1 text-slate-600">Simultaneous operations risk management</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Shield className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApproval}</div>
            <p className="text-xs text-slate-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRisk}</div>
            <p className="text-xs text-slate-600">Critical attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approved}</div>
            <p className="text-xs text-slate-600">Cleared to proceed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {simopsAnalyses && simopsAnalyses.length > 0 ? (
          simopsAnalyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(analysis.risk_level)}>{analysis.risk_level} Risk</Badge>
                      <Badge
                        variant={
                          analysis.status === "approved"
                            ? "default"
                            : analysis.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {analysis.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">Potential Conflicts</h3>
                      <p className="mt-1 text-sm text-slate-600">{analysis.potential_conflicts}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">Control Measures</h3>
                      <p className="mt-1 text-sm text-slate-600">{analysis.control_measures}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <div>
                        <span className="font-medium">Analyzed by:</span> {analysis.analyzer.full_name}
                      </div>
                      {analysis.approver && (
                        <div>
                          <span className="font-medium">Approved by:</span> {analysis.approver.full_name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(analysis.analysis_date).toLocaleDateString()}
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
              <Shield className="mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">No SIMOPS analyses</h3>
              <p className="mb-4 text-sm text-slate-600">Start analyzing simultaneous operations for conflicts</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
