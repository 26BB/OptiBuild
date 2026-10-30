"use client"

import React, { useEffect, useState } from "react"
import { onWakeupStateChange, isServerWakingUp } from "@/lib/api"
import { AlertTriangle, Loader2 } from "lucide-react"

export function WakeupBanner() {
  const [isWakingUp, setIsWakingUp] = useState(false)

  useEffect(() => {
    setIsWakingUp(isServerWakingUp())
    const unsubscribe = onWakeupStateChange((waking) => {
      setIsWakingUp(waking)
    })
    return unsubscribe
  }, [])

  if (!isWakingUp) return null

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] border-b border-amber-500/40 bg-amber-500/10 dark:bg-[#1a1813]/95 backdrop-blur-md px-4 py-2 text-amber-900 dark:text-amber-200 transition-all duration-300 shadow-md select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Amber Warning Pulse */}
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>

          {/* Industrial CAD Status Tag */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-amber-500/20 border border-amber-500/40 font-mono text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span>COLD START</span>
          </span>

          {/* Primary Status Notice */}
          <span className="font-heading font-medium truncate text-amber-950 dark:text-amber-100">
            Connecting to OptiBuild Engine — Cloud service is spinning up, retrying automatically...
          </span>
        </div>

        {/* Telemetry and Activity Spinner */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-amber-800/80 dark:text-amber-300/80">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">AUTONOMOUS RETRY ACTIVE</span>
        </div>
      </div>
    </aside>
  )
}
