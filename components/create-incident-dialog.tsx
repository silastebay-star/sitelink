"use client"

import type React from "react"

import { useState } from "react"
import { createIncident } from "@/app/actions/incidents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { PhotoUpload } from "./photo-upload"

interface CreateIncidentDialogProps {
  zones?: any[]
}

export function CreateIncidentDialog({ zones = [] }: CreateIncidentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRiddor, setIsRiddor] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("is_riddor", isRiddor.toString())

    try {
      await createIncident(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create incident:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report Safety Incident
          </DialogTitle>
          <DialogDescription>Document incidents for safety compliance and investigation</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="incident_type">Incident Type *</Label>
              <Select name="incident_type" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="near_miss">Near Miss</SelectItem>
                  <SelectItem value="injury">Injury</SelectItem>
                  <SelectItem value="property_damage">Property Damage</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select name="severity" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detailed description of what happened..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" name="location" placeholder="e.g., Zone A, Level 3" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone_id">Zone</Label>
              <Select name="zone_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="immediate_action">Immediate Action Taken</Label>
            <Textarea
              id="immediate_action"
              name="immediate_action"
              placeholder="Describe actions taken immediately after the incident..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="witnesses">Witnesses</Label>
            <Input id="witnesses" name="witnesses" placeholder="Names of witnesses (comma separated)" />
          </div>

          <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <Checkbox id="is_riddor" checked={isRiddor} onCheckedChange={(checked) => setIsRiddor(checked === true)} />
            <div className="flex-1">
              <label
                htmlFor="is_riddor"
                className="text-sm font-medium leading-none text-red-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                RIDDOR Reportable
              </label>
              <p className="text-xs text-red-700">Check if this incident must be reported under RIDDOR regulations</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo Evidence</Label>
            <PhotoUpload bucket="incident-photos" maxFiles={5} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
