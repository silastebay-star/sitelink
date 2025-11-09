import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react"

export default async function ContractorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch contractors with qualifications
  const { data: contractors } = await supabase
    .from("profiles")
    .select(`
      *,
      contractor_qualifications(*),
      site_inductions(*),
      contractor_insurance(*)
    `)
    .in("role", ["subcontractor", "worker"])
    .order("full_name")

  // Calculate stats
  const totalContractors = contractors?.length || 0
  const expiredQuals =
    contractors?.filter((c) =>
      c.contractor_qualifications.some((q: any) => new Date(q.expiry_date) < new Date() && q.status === "active"),
    ).length || 0
  const noInduction = contractors?.filter((c) => c.site_inductions.length === 0).length || 0
  const activeContractors =
    contractors?.filter((c) => c.site_inductions.some((i: any) => i.status === "valid")).length || 0

  const ContractorCard = ({ contractor }: { contractor: any }) => {
    const hasValidInduction = contractor.site_inductions.some((i: any) => i.status === "valid")
    const expiredQualifications = contractor.contractor_qualifications.filter(
      (q: any) => new Date(q.expiry_date) < new Date() && q.status === "active",
    )
    const expiringQualifications = contractor.contractor_qualifications.filter(
      (q: any) =>
        new Date(q.expiry_date) > new Date() &&
        new Date(q.expiry_date).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000,
    )

    const hasValidInsurance = contractor.contractor_insurance.some(
      (i: any) => new Date(i.valid_to) > new Date() && i.status === "active",
    )

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">{contractor.full_name}</h3>
            </div>

            {contractor.company && <p className="mt-1 text-sm text-slate-600">{contractor.company}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              {hasValidInduction ? (
                <Badge variant="outline" className="border-green-600 text-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Inducted
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-600 text-red-700">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  No Induction
                </Badge>
              )}

              {hasValidInsurance ? (
                <Badge variant="outline" className="border-green-600 text-green-700">
                  <Shield className="mr-1 h-3 w-3" />
                  Insured
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-600 text-red-700">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  No Insurance
                </Badge>
              )}

              <Badge variant="outline">{contractor.contractor_qualifications.length} Certifications</Badge>
            </div>

            {expiredQualifications.length > 0 && (
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  {expiredQualifications.length} Expired Qualification{expiredQualifications.length > 1 ? "s" : ""}
                </Badge>
              </div>
            )}

            {expiringQualifications.length > 0 && (
              <div className="mt-2">
                <Badge className="bg-amber-600 text-xs text-white">
                  <Clock className="mr-1 h-3 w-3" />
                  {expiringQualifications.length} Expiring Soon
                </Badge>
              </div>
            )}

            {contractor.phone && (
              <p className="mt-2 text-xs text-slate-600">
                <span className="font-medium">Phone:</span> {contractor.phone}
              </p>
            )}
          </div>

          <Badge className="capitalize">{contractor.role.replace("_", " ")}</Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contractor Management</h1>
          <p className="mt-1 text-slate-600">Track qualifications, inductions, and compliance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Contractor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContractors}</div>
            <p className="text-xs text-slate-600">Registered on site</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Inducted</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContractors}</div>
            <p className="text-xs text-slate-600">Valid inductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Qualifications</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredQuals}</div>
            <p className="text-xs text-slate-600">Require renewal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Induction</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noInduction}</div>
            <p className="text-xs text-slate-600">Not yet inducted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Contractors ({totalContractors})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeContractors})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({expiredQuals + noInduction})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {contractors && contractors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contractors.map((contractor) => (
                <ContractorCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No contractors registered</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {contractors && activeContractors > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contractors
                .filter((c) => c.site_inductions.some((i: any) => i.status === "valid"))
                .map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No active contractors</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {contractors && expiredQuals + noInduction > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contractors
                .filter(
                  (c) =>
                    c.site_inductions.length === 0 ||
                    c.contractor_qualifications.some((q: any) => new Date(q.expiry_date) < new Date()),
                )
                .map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">No compliance issues</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
