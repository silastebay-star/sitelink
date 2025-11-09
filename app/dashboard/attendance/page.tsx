"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, UserCheck, Clock, Download, Search, AlertCircle } from "lucide-react"

export default function AttendancePage() {
  const onSiteNow = [
    { name: "John Smith", company: "ABC Contractors", role: "Electrician", checkIn: "07:30", zone: "Zone A" },
    { name: "Sarah Johnson", company: "XYZ Services", role: "Supervisor", checkIn: "07:00", zone: "Zone B" },
    { name: "Mike Brown", company: "ABC Contractors", role: "Plumber", checkIn: "08:15", zone: "Zone A" },
    { name: "Lisa Chen", company: "DEF Ltd", role: "Safety Officer", checkIn: "07:45", zone: "Site Office" },
    { name: "Tom Wilson", company: "GHI Construction", role: "Carpenter", checkIn: "08:00", zone: "Zone C" },
  ]

  const visitors = [
    {
      name: "David Lee",
      company: "Materials Supplier",
      checkIn: "09:30",
      escort: "Sarah Johnson",
      purpose: "Delivery",
    },
    { name: "Emma Davis", company: "HSE Inspector", checkIn: "10:00", escort: "Lisa Chen", purpose: "Inspection" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Site Attendance</h1>
          <p className="text-slate-600 mt-2">Real-time roll call and attendance tracking</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Site Now</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onSiteNow.length}</div>
            <p className="text-xs text-slate-600 mt-1">+{visitors.length} visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In Today</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2</div>
            <p className="text-xs text-slate-600 mt-1">Per worker</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-green-600 mt-1">Inductions complete</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="on-site" className="space-y-6">
        <TabsList>
          <TabsTrigger value="on-site">On Site Now</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="on-site" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workers On Site</CardTitle>
                  <CardDescription>Current attendance for emergency roll call</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search workers..." className="pl-9 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onSiteNow.map((worker, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-700">
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-slate-600">{worker.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{worker.role}</Badge>
                      <div className="text-right text-sm">
                        <p className="text-slate-600">Check-in: {worker.checkIn}</p>
                        <p className="text-slate-500">{worker.zone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Visitors</CardTitle>
              <CardDescription>Visitors currently on site with escort information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visitors.map((visitor, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {visitor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{visitor.name}</p>
                        <p className="text-sm text-slate-600">{visitor.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{visitor.purpose}</Badge>
                      <div className="text-right text-sm">
                        <p className="text-slate-600">Check-in: {visitor.checkIn}</p>
                        <p className="text-slate-500">Escort: {visitor.escort}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Past 7 days attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2025-01-15", workers: 45, visitors: 3, totalHours: 324 },
                  { date: "2025-01-14", workers: 42, visitors: 5, totalHours: 302 },
                  { date: "2025-01-13", workers: 48, visitors: 2, totalHours: 346 },
                  { date: "2025-01-12", workers: 41, visitors: 4, totalHours: 295 },
                  { date: "2025-01-11", workers: 44, visitors: 1, totalHours: 316 },
                ].map((day, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{day.date}</p>
                      <p className="text-sm text-slate-600">
                        {day.workers} workers • {day.visitors} visitors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.totalHours} hours</p>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
