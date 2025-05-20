"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export default function ConnectionStatus() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiOff className="h-4 w-4 text-yellow-700 dark:text-yellow-500" />
      <span className="text-sm text-yellow-700 dark:text-yellow-500">You are offline</span>
    </div>
  )
}
