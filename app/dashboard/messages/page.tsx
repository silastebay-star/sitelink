import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, AlertTriangle, Users, Mail } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch messages
  const { data: sentMessages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, company),
      recipient:profiles!messages_recipient_id_fkey(full_name, company)
    `)
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, company),
      recipient:profiles!messages_recipient_id_fkey(full_name, company)
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })

  const { data: announcements } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, company, role)
    `)
    .eq("message_type", "announcement")
    .order("created_at", { ascending: false })
    .limit(10)

  const unreadCount = receivedMessages?.filter((m) => !m.is_read).length || 0

  const MessageCard = ({
    message,
    showSender = true,
    showRecipient = false,
  }: {
    message: any
    showSender?: boolean
    showRecipient?: boolean
  }) => (
    <div
      className={`rounded-lg border p-4 ${
        message.is_read === false ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {message.message_type === "safety_alert" && <AlertTriangle className="h-4 w-4 text-red-600" />}
            {message.subject && <h3 className="font-semibold text-slate-900">{message.subject}</h3>}
            {!message.is_read && <div className="h-2 w-2 rounded-full bg-orange-600"></div>}
          </div>

          <p className="mt-2 text-sm text-slate-700">{message.content}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {showSender && message.sender && (
              <div>
                <span className="font-medium">From:</span> {message.sender.full_name}
                {message.sender.company && ` (${message.sender.company})`}
              </div>
            )}
            {showRecipient && message.recipient && (
              <div>
                <span className="font-medium">To:</span> {message.recipient.full_name}
                {message.recipient.company && ` (${message.recipient.company})`}
              </div>
            )}
            <div>
              <span className="font-medium">Sent:</span> {new Date(message.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <Badge
          variant={
            message.message_type === "safety_alert"
              ? "destructive"
              : message.message_type === "announcement"
                ? "default"
                : "secondary"
          }
          className="capitalize text-xs"
        >
          {message.message_type.replace("_", " ")}
        </Badge>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="mt-1 text-slate-600">Team communication and announcements</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Send className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Unread</p>
              <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Received</p>
              <p className="text-2xl font-bold text-slate-900">{receivedMessages?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Sent</p>
              <p className="text-2xl font-bold text-slate-900">{sentMessages?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Received ({receivedMessages?.length || 0})
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentMessages?.length || 0})</TabsTrigger>
          <TabsTrigger value="announcements">Announcements ({announcements?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-3">
          {receivedMessages && receivedMessages.length > 0 ? (
            receivedMessages.map((message) => <MessageCard key={message.id} message={message} showSender={true} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No messages</h3>
                <p className="text-sm text-slate-600">You haven&apos;t received any messages yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {sentMessages && sentMessages.length > 0 ? (
            sentMessages.map((message) => (
              <MessageCard key={message.id} message={message} showSender={false} showRecipient={true} />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No sent messages</h3>
                <p className="text-sm text-slate-600">Send your first message to get started</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-3">
          {announcements && announcements.length > 0 ? (
            announcements.map((message) => (
              <div key={message.id} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    {message.subject && <h3 className="font-semibold text-blue-900">{message.subject}</h3>}
                    <p className="mt-1 text-sm text-blue-800">{message.content}</p>
                    <div className="mt-2 flex gap-3 text-xs text-blue-700">
                      <div>
                        <span className="font-medium">Posted by:</span> {message.sender.full_name}
                        {message.sender.role && ` (${message.sender.role.replace("_", " ")})`}
                      </div>
                      <span>•</span>
                      <div>{new Date(message.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No announcements</h3>
                <p className="text-sm text-slate-600">Site-wide announcements will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
