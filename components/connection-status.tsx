"use client"

import { WifiOff } from "lucide-react"

interface ConnectionStatusProps {
  isOffline: boolean;
}

export default function ConnectionStatus({ isOffline }: ConnectionStatusProps) {
  if (!isOffline) return null

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiOff className="h-4 w-4 text-yellow-700 dark:text-yellow-500" />
      <span className="text-sm text-yellow-700 dark:text-yellow-500">You are offline</span>
    </div>
  )
}
