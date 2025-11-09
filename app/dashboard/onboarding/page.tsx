"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Upload, QrCode, Mail, CheckCircle2, Clock } from "lucide-react"

export default function OnboardingPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Worker Onboarding</h1>
        <p className="text-slate-600 mt-2">Bulk provision workers, generate QR codes, and manage inductions</p>
      </div>

      <Tabs defaultValue="bulk-import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
          <TabsTrigger value="individual">Individual Worker</TabsTrigger>
          <TabsTrigger value="pending">Pending Claims</TabsTrigger>
          <TabsTrigger value="templates">Site Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                Bulk Import Workers
              </CardTitle>
              <CardDescription>
                Upload CSV to provision multiple workers at once. Each worker will receive a unique QR code via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 mb-2">Drop your CSV file here or click to browse</p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="max-w-xs mx-auto"
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-2">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {csvFile.name} selected
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Columns: full_name, email, phone, company, role, emergency_contact, emergency_phone</li>
                  <li>• Roles: worker, supervisor, subcontractor, main_contractor, safety_officer</li>
                  <li>• All workers will be assigned to the current site/tenant</li>
                  <li>• QR codes will be automatically generated and emailed</li>
                </ul>
                <Button variant="link" className="text-blue-700 p-0 mt-2">
                  Download Sample CSV Template
                </Button>
              </div>

              <Button className="w-full" disabled={!csvFile}>
                <Upload className="h-4 w-4 mr-2" />
                Import {csvFile ? `${csvFile.name}` : "Workers"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Imports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2025-01-15", count: 45, status: "completed", by: "John Smith" },
                  { date: "2025-01-12", count: 23, status: "completed", by: "Sarah Johnson" },
                  { date: "2025-01-10", count: 12, status: "partial", by: "Mike Brown" },
                ].map((import_record, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${import_record.status === "completed" ? "bg-green-500" : "bg-yellow-500"}`}
                      />
                      <div>
                        <p className="font-medium text-sm">{import_record.count} workers imported</p>
                        <p className="text-xs text-slate-600">
                          {import_record.date} by {import_record.by}
                        </p>
                      </div>
                    </div>
                    <Badge variant={import_record.status === "completed" ? "default" : "secondary"}>
                      {import_record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-orange-600" />
                Add Individual Worker
              </CardTitle>
              <CardDescription>Create a single worker account and send their QR code onboarding link</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="john.smith@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="+44 7700 900000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input placeholder="ABC Contractors Ltd" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="main_contractor">Main Contractor</SelectItem>
                      <SelectItem value="safety_officer">Safety Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Phone</Label>
                    <Input type="tel" placeholder="+44 7700 900001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Additional information..." rows={3} />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Create & Send QR Code
                  </Button>
                  <Button variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    Create & Print QR
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Account Claims</CardTitle>
              <CardDescription>
                Workers who have been provisioned but haven't claimed their accounts yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Tom Wilson",
                    email: "tom.wilson@abc.com",
                    company: "ABC Contractors",
                    sent: "2 days ago",
                    expires: "5 days",
                  },
                  {
                    name: "Lisa Chen",
                    email: "lisa.chen@xyz.com",
                    company: "XYZ Services",
                    sent: "1 day ago",
                    expires: "6 days",
                  },
                  {
                    name: "David Brown",
                    email: "david.brown@def.com",
                    company: "DEF Ltd",
                    sent: "3 hours ago",
                    expires: "6 days",
                  },
                ].map((worker, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{worker.name}</p>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {worker.expires} left
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{worker.email}</p>
                      <p className="text-xs text-slate-500">
                        {worker.company} • Sent {worker.sent}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Resend
                      </Button>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration Templates</CardTitle>
              <CardDescription>
                Pre-configured templates for rapid site deployment with default zones, roles, and forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {[
                  { name: "Master Site Template", zones: 8, permits: 6, forms: 12, isMaster: true },
                  { name: "Residential Construction", zones: 5, permits: 4, forms: 8, isMaster: false },
                  { name: "Infrastructure Project", zones: 12, permits: 8, forms: 15, isMaster: false },
                ].map((template, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {template.name}
                          {template.isMaster && <Badge className="bg-orange-600">Master</Badge>}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {template.zones} zones • {template.permits} permit types • {template.forms} forms
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button size="sm">Apply to Site</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
