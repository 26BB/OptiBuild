"use client"

import React from "react"
import { AlertTriangle, Clock, RefreshCw } from "lucide-react"

interface TopBarProps {
  projectName?: string
  delayRiskDays?: number
  onRecalculate?: () => void
  isOptimizing?: boolean
}

export function TopBar({
  projectName = "Tower-A Residential (G+14)",
  delayRiskDays = 0,
  onRecalculate,
  isOptimizing = false,
}: TopBarProps) {
  const isDelayed = delayRiskDays > 0

  return (
    <header className="h-13 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-semibold tracking-tight font-heading text-foreground">
            {projectName}
          </h1>
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
            SITE ID: OB-PN-2026-088
          </span>
        </div>

        {/* Delay Risk Badge */}
        {isDelayed ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-mono font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DELAY RISK: +{delayRiskDays} DAYS</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-status-success/40 bg-status-success/10 text-status-success text-[11px] font-mono font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>ON SCHEDULE • CP STABLE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right text-[11px] font-mono mr-2 hidden md:block">
          <span className="text-muted-foreground">Target RERA Handover: </span>
          <span className="font-semibold text-foreground">15-DEC-2027</span>
        </div>

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
