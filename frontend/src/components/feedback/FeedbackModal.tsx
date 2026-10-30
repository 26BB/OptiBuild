"use client"

import React, { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { getTelemetrySnapshot, formatTelemetryForDisplay, TelemetrySnapshot } from "@/lib/telemetry"
import { cn } from "@/lib/utils"
import {
  Bug,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Terminal,
  Send,
  Loader2,
  Star,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
} from "lucide-react"

export interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "BUG" | "FEEDBACK"
  errorContext?: unknown
}

const BUG_CATEGORIES = [
  { value: "SCHEDULER", label: "Gantt / CPM Scheduler" },
  { value: "OPTIMIZER_GA", label: "Recovery Optimizer (GA)" },
  { value: "RERA_PARSER", label: "MahaRERA PDF Parser" },
  { value: "MATERIALS", label: "Materials & Receipts" },
  { value: "DRAWINGS", label: "CAD Drawing Vault" },
  { value: "UI_UX", label: "Interface & Layout" },
  { value: "GENERAL", label: "General Workstation" },
]

const FEEDBACK_CATEGORIES = [
  { value: "FEATURE_REQUEST", label: "Feature Suggestion" },
  { value: "PERFORMANCE", label: "Computation Speed" },
  { value: "USABILITY", label: "CAD Workstation UX" },
  { value: "COMPLIANCE_RERA", label: "Statutory MahaRERA" },
  { value: "GENERAL", label: "General Feedback" },
]

const SEVERITY_LEVELS: {
  value: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  label: string
  colorClass: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    value: "LOW",
    label: "LOW (Cosmetic)",
    colorClass: "border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10",
    icon: CheckCircle2,
  },
  {
    value: "MEDIUM",
    label: "MEDIUM (Standard)",
    colorClass: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    icon: AlertTriangle,
  },
  {
    value: "HIGH",
    label: "HIGH (Urgent)",
    colorClass: "border-primary text-primary bg-primary/10",
    icon: Flame,
  },
  {
    value: "CRITICAL",
    label: "CRITICAL (Blocker)",
    colorClass: "border-destructive text-destructive bg-destructive/15 font-bold animate-pulse",
    icon: ShieldAlert,
  },
]

export function FeedbackModal({
  isOpen,
  onClose,
  initialTab = "BUG",
  errorContext,
}: FeedbackModalProps) {
  const pathname = usePathname()
  const { user, activeProject } = useAuth()

  const [activeTab, setActiveTab] = useState<"BUG" | "FEEDBACK">(initialTab)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTelemetry, setShowTelemetry] = useState(false)

  // Bug Tab Form State
  const [bugTitle, setBugTitle] = useState("")
  const [bugCategory, setBugCategory] = useState("GENERAL")
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM")
  const [bugDescription, setBugDescription] = useState("")

  // Feedback Tab Form State
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackCategory, setFeedbackCategory] = useState("FEATURE_REQUEST")
  const [feedbackComment, setFeedbackComment] = useState("")

  // Synchronize initialTab
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab, isOpen])

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const ce = e as CustomEvent<{ tab?: "BUG" | "FEEDBACK" }>
      if (ce.detail?.tab) {
        setActiveTab(ce.detail.tab)
      }
    }
    window.addEventListener("open-feedback-modal", handleEvent)
    return () => window.removeEventListener("open-feedback-modal", handleEvent)
  }, [])

  // Capture diagnostic snapshot
  const telemetryData: TelemetrySnapshot = useMemo(() => {
    return getTelemetrySnapshot(
      errorContext,
      activeProject ? { id: activeProject.id, name: activeProject.name } : null,
      user?.role || null
    )
  }, [errorContext, activeProject, user, pathname, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "BUG") {
      if (!bugTitle.trim()) {
        toast.error("Please enter a summary title for the bug.")
        return
      }
      if (!bugDescription.trim()) {
        toast.error("Please provide steps to reproduce or an issue description.")
        return
      }
    } else {
      if (!feedbackComment.trim()) {
        toast.error("Please enter your feedback or suggestions.")
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload = {
        type: activeTab,
        title: activeTab === "BUG" ? bugTitle.trim() : `Workstation Feedback (${feedbackRating}★ - ${feedbackCategory})`,
        category: activeTab === "BUG" ? bugCategory : feedbackCategory,
        severity: activeTab === "BUG" ? severity : "LOW",
        rating: activeTab === "FEEDBACK" ? feedbackRating : null,
        description: activeTab === "BUG" ? bugDescription.trim() : feedbackComment.trim(),
        telemetry: telemetryData,
        user_email: user?.email || "site.engineer@optibuild.io",
        user_name: user?.full_name || "OptiBuild Workstation Operator",
        jira_key: activeTab === "BUG" ? "SCRUM-18" : null,
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Server returned error while logging telemetry.")
      }

      const data = await res.json()
      const ticketId = data.ticket_id || `OB-${Math.floor(1000 + Math.random() * 9000)}`

      toast.success(`Report logged successfully [Ticket #${ticketId}]`, {
        description:
          activeTab === "BUG"
            ? "Diagnostic telemetry snapshot attached. Engineering team notified."
            : "Thank you for contributing to OptiBuild's workstation precision.",
      })

      // Reset Form State
      setBugTitle("")
      setBugDescription("")
      setFeedbackComment("")
      setSeverity("MEDIUM")
      setShowTelemetry(false)
      onClose()
    } catch (err: unknown) {
      console.error(err)
      toast.error("Failed to submit feedback. Check server connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-card border border-border text-foreground p-0 rounded-[4px] shadow-2xl overflow-hidden select-none">
        {/* Header Bar */}
        <div className="p-4 border-b border-border bg-muted/20">
          <DialogHeader className="gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center rounded-[2px] font-mono text-xs font-bold shadow-xs">
                  OB
                </div>
                <DialogTitle className="font-heading font-bold text-sm tracking-tight text-foreground uppercase">
                  Workstation Telemetry & Feedback
                </DialogTitle>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-[2px]">
                SCRUM-18 // 20
              </span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground font-sans">
              Log reproducible CAD issues or submit feature recommendations with client diagnostic telemetry.
            </DialogDescription>
          </DialogHeader>

          {/* Dual Tab Switch - Strict 4px & 1px Hairline */}
          <div className="mt-3.5 flex border border-border rounded-[4px] p-0.5 bg-background font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("BUG")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[2px] transition-colors cursor-pointer text-xs font-medium",
                activeTab === "BUG"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>[ REPORT A BUG ]</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("FEEDBACK")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[2px] transition-colors cursor-pointer text-xs font-medium",
                activeTab === "FEEDBACK"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>[ SYSTEM FEEDBACK ]</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[72vh] overflow-y-auto">
          {activeTab === "BUG" ? (
            /* ================= BUG REPORT TAB ================= */
            <div className="space-y-3.5">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium flex items-center justify-between">
                  <span>Issue Summary / Title *</span>
                  <span className="text-[10px] text-muted-foreground/80">Clear technical description</span>
                </label>
                <input
                  type="text"
                  required
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  placeholder="e.g. GA solver produces float overlap on milestone loops..."
                  className="w-full text-xs font-mono bg-background border border-border px-3 py-2 rounded-[4px] focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
                />
              </div>

              {/* Severity Group */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITY_LEVELS.map((lvl) => {
                    const isSelected = severity === lvl.value
                    const Icon = lvl.icon
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setSeverity(lvl.value)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 px-2 py-1.5 border rounded-[4px] text-xs font-mono transition-all cursor-pointer",
                          lvl.colorClass,
                          isSelected
                            ? "ring-1 ring-primary/80 font-bold"
                            : "opacity-60 hover:opacity-100"
                        )}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="text-[10px] truncate">{lvl.value}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Subsystem Category Dropdown / Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Subsystem Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BUG_CATEGORIES.map((cat) => {
                    const isSelected = bugCategory === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setBugCategory(cat.value)}
                        className={cn(
                          "px-2 py-1 text-[11px] font-mono border rounded-[2px] transition-colors cursor-pointer",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description & Reproduction Steps */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Description & Reproduction Steps *
                </label>
                <textarea
                  required
                  rows={3}
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="1. Open Recovery Optimizer&#10;2. Click Run Genetic Algorithm&#10;3. Notice timeline indicator freezes..."
                  className="w-full text-xs font-sans bg-background border border-border p-2.5 rounded-[4px] focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none transition-colors"
                />
              </div>

              {/* Collapsible Telemetry Diagnostic Snapshot */}
              <div className="border border-border rounded-[4px] overflow-hidden bg-background">
                <button
                  type="button"
                  onClick={() => setShowTelemetry(!showTelemetry)}
                  className="w-full flex items-center justify-between p-2.5 bg-muted/20 hover:bg-muted/30 transition-colors text-left font-mono text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span>Telemetry Diagnostic Snapshot (Auto-Collected)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded-[2px] border border-border">
                      {telemetryData.screenResolution}
                    </span>
                    {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {showTelemetry && (
                  <div className="p-3 border-t border-border bg-card/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-muted-foreground">Path: </span>
                        <span className="text-foreground">{telemetryData.pathname}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Theme: </span>
                        <span className="text-foreground uppercase">{telemetryData.theme}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Project: </span>
                        <span className="text-foreground truncate">{telemetryData.activeProjectName || "None"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User Role: </span>
                        <span className="text-primary uppercase">{telemetryData.userRole || "guest"}</span>
                      </div>
                    </div>
                    <pre className="p-2 bg-background border border-border text-[10px] font-mono text-muted-foreground rounded-[2px] overflow-x-auto max-h-28">
                      {formatTelemetryForDisplay(telemetryData)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= SYSTEM FEEDBACK TAB ================= */
            <div className="space-y-4">
              {/* Satisfaction Numeric / Star Rating */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium flex items-center justify-between">
                  <span>Workstation Experience Rating</span>
                  <span className="text-[11px] font-mono text-primary font-bold">{feedbackRating} / 5 Stars</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = feedbackRating >= star
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 border rounded-[4px] transition-all cursor-pointer font-mono text-xs",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border bg-background text-muted-foreground hover:border-border/80"
                        )}
                      >
                        <Star className={cn("w-4 h-4 mb-1", isSelected ? "fill-primary text-primary" : "text-muted-foreground")} />
                        <span>{star}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Feedback Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Feedback Topic
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_CATEGORIES.map((cat) => {
                    const isSelected = feedbackCategory === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFeedbackCategory(cat.value)}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-mono border rounded-[2px] transition-colors cursor-pointer",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Feature Suggestions & Usability Observations *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share ideas to improve OptiBuild's scheduling, statutory calculations, or CAD navigation..."
                  className="w-full text-xs font-sans bg-background border border-border p-2.5 rounded-[4px] focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-mono border border-border hover:bg-secondary rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-semibold rounded-[4px] hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{activeTab === "BUG" ? "SUBMIT BUG REPORT" : "SEND FEEDBACK"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
