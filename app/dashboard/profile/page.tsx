import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, Phone, Mail } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*, tenant:tenants(*)").eq("id", user.id).single()

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user.email.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-slate-600">View and manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-orange-100 text-orange-700 text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{profile?.full_name}</h3>
                <Badge className="mt-1 capitalize">{profile?.role?.replace("_", " ")}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{user.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{profile.phone}</span>
                </div>
              )}
              {profile?.company && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{profile.company}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Your assigned site details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.tenant ? (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Site Name</label>
                  <p className="mt-1 text-slate-900">{profile.tenant.name}</p>
                </div>
                {profile.tenant.location && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Location</label>
                    <p className="mt-1 text-slate-900">{profile.tenant.location}</p>
                  </div>
                )}
                {profile.tenant.contact_email && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Site Contact</label>
                    <p className="mt-1 text-slate-900">{profile.tenant.contact_email}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">No site assigned</p>
            )}
          </CardContent>
        </Card>

        {(profile?.emergency_contact || profile?.emergency_phone) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>In case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.emergency_contact && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Contact Name</label>
                  <p className="mt-1 text-slate-900">{profile.emergency_contact}</p>
                </div>
              )}
              {profile.emergency_phone && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <p className="mt-1 text-slate-900">{profile.emergency_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
