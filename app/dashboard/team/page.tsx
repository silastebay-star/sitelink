import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, Phone } from "lucide-react"

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch all team members from the same tenant
  const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("*")
    .eq("tenant_id", profile?.tenant_id)
    .order("full_name")

  // Group by role
  const groupedMembers = teamMembers?.reduce(
    (acc, member) => {
      const role = member.role || "worker"
      if (!acc[role]) acc[role] = []
      acc[role].push(member)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-600 text-white"
      case "main_contractor":
        return "bg-blue-600 text-white"
      case "safety_officer":
        return "bg-red-600 text-white"
      case "supervisor":
        return "bg-orange-600 text-white"
      case "subcontractor":
        return "bg-green-600 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const TeamMemberCard = ({ member }: { member: any }) => {
    const initials =
      member.full_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{member.full_name}</h3>
              {member.company && <p className="text-sm text-slate-600">{member.company}</p>}

              <div className="mt-2">
                <Badge className={getRoleBadgeColor(member.role)}>{member.role.replace("_", " ")}</Badge>
              </div>

              <div className="mt-3 space-y-1">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.emergency_contact && (
                  <div className="text-xs text-slate-500">
                    Emergency: {member.emergency_contact}
                    {member.emergency_phone && ` - ${member.emergency_phone}`}
                  </div>
                )}
              </div>

              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Directory</h1>
          <p className="mt-1 text-slate-600">View and contact site personnel</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-5 w-5" />
          <span className="font-semibold">{teamMembers?.length || 0}</span> members
        </div>
      </div>

      {groupedMembers && Object.keys(groupedMembers).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedMembers)
            .sort(([roleA], [roleB]) => {
              const order = ["admin", "main_contractor", "safety_officer", "supervisor", "subcontractor", "worker"]
              return order.indexOf(roleA) - order.indexOf(roleB)
            })
            .map(([role, members]) => (
              <div key={role}>
                <h2 className="mb-4 text-lg font-semibold capitalize text-slate-900">
                  {role.replace("_", " ")} ({members.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No team members</h3>
            <p className="text-sm text-slate-600">Team members will appear here once they join</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
