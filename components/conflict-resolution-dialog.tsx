"use client"

import { useState, useEffect } from "react"
import { offlineSync } from "@/lib/offline-sync"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export function ConflictResolutionDialog() {
  const [conflicts, setConflicts] = useState<any[]>([])
  const [currentConflict, setCurrentConflict] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadConflicts()
  }, [])

  const loadConflicts = async () => {
    const data = await offlineSync.getConflicts()
    setConflicts(data)
    if (data.length > 0) {
      setCurrentConflict(data[0])
      setIsOpen(true)
    }
  }

  const handleResolve = async (resolution: "local" | "server") => {
    if (!currentConflict) return

    await offlineSync.resolveConflict(currentConflict.id, resolution)

    const remaining = conflicts.filter((c) => c.id !== currentConflict.id)
    setConflicts(remaining)

    if (remaining.length > 0) {
      setCurrentConflict(remaining[0])
    } else {
      setIsOpen(false)
      setCurrentConflict(null)
    }
  }

  if (!currentConflict) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Data Conflict Detected
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            The {currentConflict.entity} was modified both locally and on the server. Please choose which version to
            keep.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 font-semibold text-slate-900">Your Changes (Local)</h3>
              <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">
                {JSON.stringify(currentConflict.localData, null, 2)}
              </pre>
              <Button onClick={() => handleResolve("local")} className="mt-3 w-full" variant="default">
                Keep My Changes
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 font-semibold text-slate-900">Server Version</h3>
              <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">
                {JSON.stringify(currentConflict.serverData, null, 2)}
              </pre>
              <Button onClick={() => handleResolve("server")} className="mt-3 w-full" variant="outline">
                Keep Server Version
              </Button>
            </div>
          </div>

          {conflicts.length > 1 && (
            <p className="text-center text-sm text-slate-500">
              {conflicts.length - 1} more conflict{conflicts.length > 2 ? "s" : ""} to resolve
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
