"use client"

import type React from "react"

import { useState } from "react"
import { createPermit } from "@/app/actions/permits"
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
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreatePermitDialogProps {
  zones?: any[]
  users?: any[]
}

export function CreatePermitDialog({ zones = [], users = [] }: CreatePermitDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      await createPermit(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create permit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Issue Permit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Permit-to-Work</DialogTitle>
          <DialogDescription>Authorize work activities with safety controls</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="permit_type">Permit Type *</Label>
            <Select name="permit_type" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot_work">Hot Work</SelectItem>
                <SelectItem value="confined_space">Confined Space</SelectItem>
                <SelectItem value="working_at_height">Working at Height</SelectItem>
                <SelectItem value="excavation">Excavation</SelectItem>
                <SelectItem value="electrical">Electrical Work</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_description">Work Description *</Label>
            <Textarea
              id="work_description"
              name="work_description"
              placeholder="Detailed description of the work to be performed..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issued_to">Issued To *</Label>
              <Select name="issued_to" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Valid From *</Label>
              <Input id="valid_from" name="valid_from" type="datetime-local" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_to">Valid Until *</Label>
              <Input id="valid_to" name="valid_to" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_assessment">Risk Assessment</Label>
            <Textarea
              id="risk_assessment"
              name="risk_assessment"
              placeholder="Identified risks and hazards..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="control_measures">Control Measures *</Label>
            <Textarea
              id="control_measures"
              name="control_measures"
              placeholder="Safety measures and precautions to be taken..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Issue Permit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
