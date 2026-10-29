"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, Loader2, Sparkles, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export type ParseStatus = "idle" | "extracting" | "classifying" | "ready" | "error"

interface StatusMarkProps {
  status: ParseStatus
  fileName?: string | null
  className?: string
}

const STATUS_CONFIG: Record<
  ParseStatus,
  {
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    badgeClass: string
    iconClass: string
  }
> = {
  idle: {
    label: "IDLE • AWAITING PDF",
    description: "Upload official MahaRERA certificate to begin extraction",
    icon: FileText,
    badgeClass: "bg-secondary text-muted-foreground border-border",
    iconClass: "text-muted-foreground",
  },
  extracting: {
    label: "EXTRACTING TEXT STREAM",
    description: "pdfplumber scanning layout blocks and tabular schedules...",
    icon: Loader2,
    badgeClass: "bg-primary/10 text-primary border-primary/40",
    iconClass: "text-primary animate-spin",
  },
  classifying: {
    label: "REGEX CLASSIFICATION",
    description: "Matching statutory patterns for RERA ID, FSI, floors, and dates...",
    icon: Sparkles,
    badgeClass: "bg-status-warning/10 text-status-warning border-status-warning/40",
    iconClass: "text-status-warning animate-pulse",
  },
  ready: {
    label: "PRE-FILL DRAFT READY",
    description: "Statutory parameters populated. Human confirmation required.",
    icon: CheckCircle2,
    badgeClass: "bg-status-success/15 text-status-success border-status-success/30",
    iconClass: "text-status-success",
  },
  error: {
    label: "PARSING EXCEPTION",
    description: "Could not extract statutory fields automatically. Manual entry enabled.",
    icon: AlertTriangle,
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    iconClass: "text-destructive",
  },
}

export function StatusMark({ status, fileName, className = "" }: StatusMarkProps) {
  const current = STATUS_CONFIG[status] || STATUS_CONFIG.idle
  const IconComponent = current.icon

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center justify-between p-3 border rounded-[4px] bg-card text-xs font-mono",
          current.badgeClass,
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <IconComponent className={cn("w-4 h-4 shrink-0", current.iconClass)} />
          <div>
            <div className="font-bold tracking-wider uppercase text-[11px]">
              {current.label}
              {fileName && <span className="ml-2 font-normal lowercase text-[10px]">({fileName})</span>}
            </div>
            <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
              {current.description}
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-[2px] shrink-0">
          SEC.18 VERIFICATION
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
