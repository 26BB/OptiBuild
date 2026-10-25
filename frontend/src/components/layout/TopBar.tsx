"use client"

import React from "react"
import { AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface TopBarProps {
  projectName?: string
  delayRiskDays?: number
  completionDate?: string
  reraNo?: string
  onRecalculate?: () => void
  isOptimizing?: boolean
}

export function TopBar({
  projectName,
  delayRiskDays,
  completionDate,
  reraNo,
  onRecalculate,
  isOptimizing = false,
}: TopBarProps) {
  const { activeProject } = useAuth()

  const displayName = projectName || activeProject?.name || "No Project Selected"
  const delayDays = delayRiskDays !== undefined ? delayRiskDays : activeProject?.delay_days || 0
  const isDelayed = delayDays > 0
  const displayRera = reraNo || activeProject?.rera_registration_no || "UNREGISTERED"
  const targetDate = completionDate || activeProject?.proposed_completion_date || "TBD"

  return (
    <header className="h-13 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-semibold tracking-tight font-heading text-foreground truncate max-w-xs sm:max-w-md">
            {displayName}
          </h1>
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
            RERA: {displayRera}
          </span>
        </div>

        {/* Delay Risk Badge */}
        {activeProject && (
          isDelayed ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-mono font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DELAY RISK: +{delayDays} DAYS</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-status-success/40 bg-status-success/10 text-status-success text-[11px] font-mono font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>ON SCHEDULE • STABLE</span>
            </div>
          )
        )}
      </div>

      <div className="flex items-center gap-2">
        {activeProject && (
          <div className="text-right text-[11px] font-mono mr-2 hidden md:block">
            <span className="text-muted-foreground">Target RERA Handover: </span>
            <span className="font-semibold text-foreground">{targetDate}</span>
          </div>
        )}

        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 text-xs font-mono font-medium bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 border border-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
            <span>{isOptimizing ? "SOLVING GA..." : "RUN OPTIMIZER"}</span>
          </button>
        )}
      </div>
    </header>
  )
}
