"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant="destructive" className="border-amber-600 bg-amber-50">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-amber-900">
          You&apos;re offline. Changes will sync when connection is restored.
        </AlertDescription>
      </Alert>
    </div>
  )
}
