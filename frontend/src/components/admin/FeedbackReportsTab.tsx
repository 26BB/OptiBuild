"use client"

import React, { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Counter } from "@/components/ui/Counter"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Bug,
  MessageSquare,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Star,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface FeedbackRecord {
  id: string
  ticket_id: string
  type: "BUG" | "FEEDBACK"
  title: string
  category: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  rating?: number | null
  status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED"
  description: string
  telemetry: {
    timestamp: string
    pathname: string
    activeProjectId?: string | null
    activeProjectName?: string | null
    userRole?: string | null
    screenResolution: string
    theme: "dark" | "parchment"
    userAgent: string
    networkOnline?: boolean
    errorContext?: unknown
  }
  user_email: string
  user_name: string
  jira_key?: string | null
  created_at: string
}

export function FeedbackReportsTab() {
  const [reports, setReports] = useState<FeedbackRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [selectedReport, setSelectedReport] = useState<FeedbackRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/feedback")
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load telemetry reports.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const total = reports.length
    const bugs = reports.filter((r) => r.type === "BUG")
    const feedback = reports.filter((r) => r.type === "FEEDBACK")
    const openBugs = bugs.filter((b) => b.status === "OPEN" || b.status === "IN_PROGRESS" || b.status === "TRIAGED").length
    const resolvedBugs = bugs.filter((b) => b.status === "RESOLVED").length

    const ratedItems = feedback.filter((f) => f.rating !== null && f.rating !== undefined)
    const avgRating =
      ratedItems.length > 0
        ? (ratedItems.reduce((acc, f) => acc + (f.rating || 0), 0) / ratedItems.length).toFixed(1)
        : "5.0"

    return { total, openBugs, resolvedBugs, avgRating }
  }, [reports])

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.jira_key && r.jira_key.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter
      const matchesType = typeFilter === "ALL" || r.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [reports, searchQuery, statusFilter, typeFilter])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
        )
        if (selectedReport && selectedReport.id === id) {
          setSelectedReport((prev) => (prev ? { ...prev, status: newStatus as any } : null))
        }
        toast.success(`Status transitioned to ${newStatus}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update report status.")
    }
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-destructive/15 text-destructive border border-destructive/30 rounded-[2px] font-bold">CRITICAL</span>
      case "HIGH":
        return <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-primary/10 text-primary border border-primary/20 rounded-[2px] font-semibold">HIGH</span>
      case "MEDIUM":
        return <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-[2px]">MEDIUM</span>
      case "LOW":
      default:
        return <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-[2px]">LOW</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-[2px] font-bold">RESOLVED</span>
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/30 rounded-[2px] font-semibold">IN PROGRESS</span>
      case "TRIAGED":
        return <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-[2px]">TRIAGED</span>
      case "OPEN":
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-[2px]">OPEN</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Banners */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border border-border bg-card rounded-[4px] shadow-xs">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">Total Telemetry Reports</div>
          <div className="mt-1 font-heading text-2xl font-bold text-foreground font-mono">
            <Counter value={stats.total} />
          </div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Terminal className="w-3 h-3 text-primary" />
            <span>SCRUM-17 // 20 Live Data</span>
          </div>
        </div>

        <div className="p-4 border border-border bg-card rounded-[4px] shadow-xs">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">Active Open Bugs</div>
          <div className="mt-1 font-heading text-2xl font-bold text-destructive font-mono">
            <Counter value={stats.openBugs} />
          </div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Bug className="w-3 h-3 text-destructive" />
            <span>Pending Triage / Fix</span>
          </div>
        </div>

        <div className="p-4 border border-border bg-card rounded-[4px] shadow-xs">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">Resolved Issues</div>
          <div className="mt-1 font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            <Counter value={stats.resolvedBugs} />
          </div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Deployed to Sprint</span>
          </div>
        </div>

        <div className="p-4 border border-border bg-card rounded-[4px] shadow-xs">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">Avg Satisfaction Score</div>
          <div className="mt-1 font-heading text-2xl font-bold text-primary font-mono flex items-baseline gap-1">
            <span>{stats.avgRating}</span>
            <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span>Empirical Viva Metric</span>
          </div>
        </div>
      </div>

      {/* Control Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 border border-border bg-card rounded-[4px]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, ticket ID, or user..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-background border border-border rounded-[4px] focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-mono bg-background border border-border px-2.5 py-1.5 rounded-[4px] text-foreground focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Types</option>
            <option value="BUG">Bugs Only</option>
            <option value="FEEDBACK">Feedback Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-mono bg-background border border-border px-2.5 py-1.5 rounded-[4px] text-foreground focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            type="button"
            onClick={fetchReports}
            className="p-1.5 border border-border hover:bg-secondary rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Refresh Reports"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* High-Density Reports Table */}
      <div className="border border-border bg-card rounded-[4px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[11px] uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Summary & Subsystem</th>
                <th className="py-2.5 px-3">Severity / Rating</th>
                <th className="py-2.5 px-3">Reporter & Route</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-mono">
                    No feedback or telemetry reports match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-muted/10 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedReport(report)
                      setIsDetailOpen(true)
                    }}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-primary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{report.ticket_id}</span>
                        {report.jira_key && (
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-primary/10 text-primary border border-primary/20 rounded-[2px]">
                            {report.jira_key}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {report.type === "BUG" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-destructive bg-destructive/10 border border-destructive/30 rounded-[2px]">
                          <Bug className="w-3 h-3" />
                          <span>BUG</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-primary bg-primary/10 border border-primary/20 rounded-[2px]">
                          <MessageSquare className="w-3 h-3" />
                          <span>FEEDBACK</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs sm:max-w-md">
                      <div className="font-medium text-foreground truncate font-sans text-xs">
                        {report.title}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        Category: <span className="text-foreground">{report.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {report.type === "BUG" ? (
                        getSeverityBadge(report.severity)
                      ) : (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{report.rating || 5}★</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-xs text-foreground font-sans truncate max-w-[120px]">
                        {report.user_name}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
                        {report.telemetry?.pathname || "/"}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          className="text-[10px] font-mono bg-background border border-border px-1.5 py-1 rounded-[2px] text-foreground focus:outline-none focus:border-primary"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="TRIAGED">TRIAGED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(report)
                            setIsDetailOpen(true)
                          }}
                          className="p-1 hover:bg-secondary rounded-[2px] text-muted-foreground hover:text-foreground transition-colors"
                          title="View Telemetry Diagnostics"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Detail Drawer (Sheet) */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-card border-l border-border p-0 text-foreground overflow-y-auto">
          {selectedReport && (
            <div className="p-6 space-y-5">
              <SheetHeader className="space-y-1.5 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary">
                    {selectedReport.ticket_id}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedReport.status)}
                    {selectedReport.jira_key && (
                      <a
                        href={`https://bhosalebhushanvijay.atlassian.net/browse/${selectedReport.jira_key}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-[2px] hover:underline"
                      >
                        <span>Jira {selectedReport.jira_key}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                <SheetTitle className="font-heading text-sm font-bold text-foreground text-left">
                  {selectedReport.title}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono text-left">
                  Logged on {new Date(selectedReport.created_at).toLocaleString()} by {selectedReport.user_name}
                </SheetDescription>
              </SheetHeader>

              {/* Description Body */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Issue Description & Reproduction
                </div>
                <div className="p-3 bg-background border border-border rounded-[4px] text-xs font-sans whitespace-pre-wrap leading-relaxed text-foreground">
                  {selectedReport.description}
                </div>
              </div>

              {/* Status Transition Control */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  Update Resolution Status
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedReport.id, st)}
                      className={cn(
                        "py-1.5 px-2 text-[10px] font-mono border rounded-[2px] transition-colors cursor-pointer",
                        selectedReport.status === st
                          ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telemetry Diagnostics Block */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-muted-foreground font-medium">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span>Telemetry Diagnostic Snapshot</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border rounded-[4px] space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Route: </span>
                      <span className="text-foreground">{selectedReport.telemetry?.pathname}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Theme: </span>
                      <span className="text-foreground uppercase">{selectedReport.telemetry?.theme}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resolution: </span>
                      <span className="text-foreground">{selectedReport.telemetry?.screenResolution}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User Role: </span>
                      <span className="text-primary uppercase">{selectedReport.telemetry?.userRole || "guest"}</span>
                    </div>
                  </div>
                  <pre className="p-2.5 bg-background border border-border text-[10px] font-mono text-muted-foreground rounded-[2px] overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {JSON.stringify(selectedReport.telemetry, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
