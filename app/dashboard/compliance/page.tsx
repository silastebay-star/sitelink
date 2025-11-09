import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileCheck, Shield, AlertTriangle, ClipboardCheck } from "lucide-react"

export default async function CompliancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CDM 2015 Compliance</h1>
          <p className="mt-1 text-slate-600">Construction Design & Management compliance workflows</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessments</CardTitle>
            <Shield className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-600">Active assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Method Statements</CardTitle>
            <FileCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-600">RAMS approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COSHH</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-slate-600">Substance assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LOLER/PUWER</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-slate-600">Equipment checks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risk">Risk Assessments</TabsTrigger>
          <TabsTrigger value="method">Method Statements</TabsTrigger>
          <TabsTrigger value="coshh">COSHH</TabsTrigger>
          <TabsTrigger value="equipment">LOLER/PUWER</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Working at Height - Zone A</h3>
                    <p className="text-sm text-slate-600">Last reviewed: 15 days ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Approved</Badge>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Excavation Works - Zone B</h3>
                    <p className="text-sm text-slate-600">Last reviewed: 3 days ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Approved</Badge>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Confined Space Entry - Tank 3</h3>
                    <p className="text-sm text-amber-700">Review due in 2 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-600">Review Due</Badge>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="method">
          <Card>
            <CardContent className="p-6 text-center text-slate-600">
              Method Statements and RAMS documentation
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coshh">
          <Card>
            <CardContent className="p-6 text-center text-slate-600">
              COSHH substance assessments and safety data sheets
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardContent className="p-6 text-center text-slate-600">LOLER and PUWER equipment inspections</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
