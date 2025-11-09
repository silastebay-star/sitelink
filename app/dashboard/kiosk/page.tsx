"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { QrCode, Camera, CheckCircle2, AlertTriangle, FileText, Shield } from "lucide-react"

export default function KioskPage() {
  const [step, setStep] = useState<"scan" | "verify" | "induction" | "rams" | "complete">("scan")
  const [qrCode, setQrCode] = useState("")
  const [workerData, setWorkerData] = useState<any>(null)

  const handleQrScan = () => {
    // Simulate QR code scan
    setWorkerData({
      name: "John Smith",
      email: "john.smith@abc.com",
      company: "ABC Contractors Ltd",
      role: "Electrician",
      hasDocuments: true,
      inductionRequired: true,
      ramsRequired: ["Electrical Works RAMS", "Hot Works RAMS"],
    })
    setStep("verify")
  }

  const progressValue =
    step === "scan" ? 0 : step === "verify" ? 25 : step === "induction" ? 50 : step === "rams" ? 75 : 100

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Site Induction Kiosk</CardTitle>
          <CardDescription>Complete your site induction and sign required documents</CardDescription>
          <Progress value={progressValue} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "scan" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-48 w-48 border-4 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-slate-400" />
                </div>
                <p className="text-lg font-medium">Scan your QR code to begin</p>
                <p className="text-sm text-slate-600">
                  Your QR code was sent to your email. If you don't have it, contact site reception.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or enter code manually</span>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Enter your onboarding code"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="text-center text-lg"
                />
                <Button onClick={handleQrScan} className="w-full" size="lg">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "verify" && workerData && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Welcome, {workerData.name}!</h3>
                <p className="text-slate-600">Please verify your information</p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium">{workerData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Company:</span>
                  <span className="font-medium">{workerData.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Role:</span>
                  <Badge>{workerData.role}</Badge>
                </div>
              </div>

              {!workerData.hasDocuments && (
                <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-900">Documents Required</p>
                    <p className="text-yellow-800">You need to upload right-to-work documents before proceeding.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("scan")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep("induction")}>
                  Continue to Induction
                </Button>
              </div>
            </div>
          )}

          {step === "induction" && (
            <div className="space-y-6">
              <div className="text-center">
                <FileText className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Site Safety Induction</h3>
                <p className="text-slate-600">Please review and acknowledge all safety information</p>
              </div>

              <div className="space-y-4">
                {[
                  "CDM 2015 Regulations Overview",
                  "Site-Specific Hazards & Controls",
                  "Emergency Procedures & Muster Points",
                  "PPE Requirements",
                  "Work at Height Procedures",
                  "Confined Space Entry",
                ].map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Checkbox id={`topic-${i}`} />
                    <label htmlFor={`topic-${i}`} className="text-sm font-medium flex-1 cursor-pointer">
                      {topic}
                    </label>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <Shield className="h-4 w-4 inline mr-1" />
                  By checking these boxes, you confirm that you have read, understood, and will comply with all site
                  safety requirements.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("verify")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep("rams")}>
                  Next: Sign RAMS
                </Button>
              </div>
            </div>
          )}

          {step === "rams" && workerData && (
            <div className="space-y-6">
              <div className="text-center">
                <FileText className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign RAMS Documents</h3>
                <p className="text-slate-600">Review and digitally sign required method statements</p>
              </div>

              <div className="space-y-3">
                {workerData.ramsRequired.map((rams: string, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{rams}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Review hazards, control measures, and required PPE
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View PDF
                      </Button>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Camera className="h-4 w-4 mr-2" />
                        Sign Document
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("induction")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep("complete")}>
                  Complete Onboarding
                </Button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-6 text-center py-6">
              <CheckCircle2 className="h-24 w-24 text-green-600 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
                <p className="text-slate-600">Your induction is complete and you can now access the site.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="font-semibold text-green-900 mb-2">Your Digital Badge</p>
                <div className="mx-auto h-32 w-32 bg-white border-2 border-green-600 rounded-lg flex items-center justify-center mb-3">
                  <QrCode className="h-20 w-20 text-green-600" />
                </div>
                <p className="text-sm text-green-800">
                  Show this QR code for site entry. It's also available in your email and mobile app.
                </p>
              </div>

              <Button className="w-full" size="lg" onClick={() => setStep("scan")}>
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
