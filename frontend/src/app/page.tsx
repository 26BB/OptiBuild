"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { GanttSchedule, ScheduleTask } from "@/components/schedule/GanttSchedule"
import { RecoverySidePanel } from "@/components/optimizer/RecoverySidePanel"
import { EmptyState } from "@/components/ui/EmptyState"
import { SiteWeatherWidget } from "@/components/weather/SiteWeatherWidget"
import { useAuth } from "@/context/AuthContext"
import {
  Calendar,
  Layers,
  AlertTriangle,
  Users,
  CheckCircle2,
  HardHat,
  Activity,
  ArrowRight,
  Loader2,
  Sliders,
  Save,
  Check,
  RefreshCw,
} from "lucide-react"

export default function HomePage() {
  const { user, token, activeProjectId, activeProject, refreshProjects, hasPermission } = useAuth()

  const [tasks, setTasks] = useState<ScheduleTask[]>([])
  const [dbTasks, setDbTasks] = useState<any[]>([])
  const [optimizerData, setOptimizerData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Fetch project tasks and schedule
  const fetchProjectData = async () => {
    if (!activeProjectId || !token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error("Failed to load project schedule data.")
      }
      const data = await res.json()
      setDbTasks(data.tasks || [])
      if (data.optimizer_data) {
        setOptimizerData(data.optimizer_data)
      }

      // If project has saved schedule_data, use the GA schedule
      if (data.schedule_data && data.schedule_data.ga && data.schedule_data.ga.schedule) {
        setTasks(data.schedule_data.ga.schedule)
      } else if (data.tasks && data.tasks.length > 0) {
        // Build initial sequential timeline from tasks
        let currentDay = 0
        const initialTasks: ScheduleTask[] = data.tasks.map((t: any) => {
          const start = currentDay
          const finish = start + (t.duration || 1)
          currentDay = finish
          return {
            id: t.id,
            name: t.name,
            duration: t.duration,
            start_day: start,
            finish_day: finish,
            is_critical: t.is_critical || false,
            resource_demands: t.resource_demands || { labor: 10 },
            predecessors: t.predecessors || [],
          }
        })
        setTasks(initialTasks)
      } else {
        setTasks([])
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project tasks.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectData()
  }, [activeProjectId, token])

  const handleRunOptimizer = async () => {
    if (!activeProjectId || !token) return
    setIsOptimizing(true)
    setError(null)
    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/schedule`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resource_limits: { labor: 32, crane: 1 },
          ga_population_size: 40,
          ga_generations: 80,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Optimization failed.")
      }

      const data = await res.json()
      if (data.ga && data.ga.schedule) {
        setTasks(data.ga.schedule)
      }
      await fetchProjectData()
    } catch (err: any) {
      setError(err.message || "Schedule optimization failed.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleUpdateTaskProgress = async (taskId: string, newProgress: number) => {
    if (!activeProjectId || !token) return
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/projects/${activeProjectId}/tasks/${taskId}/progress`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress_percent: newProgress,
            status: newProgress === 100 ? "COMPLETED" : newProgress > 0 ? "IN_PROGRESS" : "NOT_STARTED",
          }),
        }
      )

      if (res.ok) {
        setDbTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress_percent: newProgress,
                  status: newProgress === 100 ? "COMPLETED" : newProgress > 0 ? "IN_PROGRESS" : "NOT_STARTED",
                }
              : t
          )
        )
        setSaveSuccessMsg(`Progress updated for activity ${taskId}`)
        setTimeout(() => setSaveSuccessMsg(null), 3000)
      }
    } catch (err) {
      console.error("Failed to update progress:", err)
    }
  }

  if (!activeProjectId) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Gantt Schedule & Critical Path" />
        <main className="p-6">
          <EmptyState
            title="No Active Project Selected"
            description="Upload a MahaRERA PDF to create your first project and initialize its schedule."
            actionLabel="Upload MahaRERA PDF"
            actionHref="/rera-review"
          />
        </main>
      </div>
    )
  }

  const criticalTasksCount = tasks.filter((t) => t.is_critical).length
  const totalMakespan = Math.max(...tasks.map((t) => t.finish_day), 0)
  const unconstrainedCpmDays = Math.max(1, Math.round(totalMakespan * 0.85))
  const delayRiskDays = activeProject?.delay_days || Math.max(0, totalMakespan - unconstrainedCpmDays)

  const canEditProgress = hasPermission(["site_engineer", "project_manager", "admin"])
  const canRunSchedule = hasPermission(["project_manager", "admin"])

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName={activeProject?.name ? `Schedule: ${activeProject.name}` : "Gantt Schedule"}
        delayRiskDays={delayRiskDays}
        onRecalculate={canRunSchedule && tasks.length > 0 ? handleRunOptimizer : undefined}
        isOptimizing={isOptimizing}
      />

      <main className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="flex items-center gap-2 p-3 border border-status-success/50 bg-status-success/10 text-status-success text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading Project Schedule & Critical Path...</span>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="Schedule Not Yet Generated for This Project"
            description="This project currently has no WBS activities or scheduled timeline. Generate the WBS from building parameters to populate activities."
            actionLabel={canRunSchedule ? "Generate WBS & Cost Estimate" : undefined}
            actionHref="/wbs"
          />
        ) : (
          <>
            {/* Site Meteorology & Rain Delay Guard Widget */}
            <SiteWeatherWidget tasks={tasks} projectCity="Pune" />

            {/* Metric Ribbons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="border border-border bg-card p-3">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Makespan (Days)
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {totalMakespan}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">days</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  Target Handover: {activeProject?.proposed_completion_date || "Active"}
                </div>
              </div>

              <div className="border border-border bg-card p-3">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Delay Risk
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-status-warning">
                    +{delayRiskDays}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">days</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  MahaRERA Exposure: {activeProject?.delay_days ? "Contractual Risk" : "Stable"}
                </div>
              </div>

              <div className="border border-border bg-card p-3">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Critical Path
                  </span>
                  <Activity className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-primary">
                    {criticalTasksCount}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    of {tasks.length} tasks
                  </span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  Zero float activities
                </div>
              </div>

              <div className="border border-border bg-card p-3">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Resource Constraints
                  </span>
                  <Users className="w-3.5 h-3.5 text-foreground" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-foreground">32</span>
                  <span className="text-xs font-mono text-muted-foreground">labor / 1 crane</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  RCPSP Genetic Algorithm Mode
                </div>
              </div>
            </div>

            {/* Gantt Chart & Recovery Side Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3 border border-border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="font-heading font-semibold text-sm text-foreground">
                      Construction Activity Gantt Timeline
                    </h2>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Critical path activities marked in solid red • Dynamic serial schedule generation
                    </p>
                  </div>
                  {canRunSchedule && (
                    <button
                      type="button"
                      disabled={isOptimizing}
                      onClick={handleRunOptimizer}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
                      <span>{isOptimizing ? "SOLVING GA..." : "RUN RCPSP GA SOLVER"}</span>
                    </button>
                  )}
                </div>

                <GanttSchedule tasks={tasks} />
              </div>

              {/* Side Panel */}
              <div className="lg:col-span-1">
                <RecoverySidePanel
                  delayDays={optimizerData?.delay_days ?? activeProject?.delay_days ?? 14}
                  penaltyCost={optimizerData?.total_rera_penalty ?? 485000}
                  crashCost={optimizerData?.total_crash_cost ?? 210000}
                  crashedDaysRecovered={optimizerData?.days_recovered ?? 14}
                />
              </div>
            </div>

            {/* Site Engineer Progress Tracking Table */}
            <div className="border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h3 className="font-heading font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    <span>Site Activity Progress Tracking & Verification</span>
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Site Engineers can update actual completion percentages directly from site inspections.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground border-y border-border">
                    <tr>
                      <th className="py-2 px-3">Activity ID</th>
                      <th className="py-2 px-3">Task Name</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Completion (%)</th>
                      {canEditProgress && <th className="py-2 px-3 text-right">Quick Update</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dbTasks.map((t) => {
                      const progress = t.progress_percent || 0
                      return (
                        <tr key={t.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-semibold text-primary">{t.id}</td>
                          <td className="py-2 px-3 text-foreground font-sans">
                            {t.name}
                            {t.is_critical && (
                              <span className="ml-2 text-[9px] font-mono px-1 py-0.2 bg-destructive/15 text-destructive border border-destructive/30">
                                CRITICAL
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{t.duration}d</td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                                progress === 100
                                  ? "bg-status-success/15 text-status-success border-status-success/30"
                                  : progress > 0
                                  ? "bg-status-warning/15 text-status-warning border-status-warning/30"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {progress === 100 ? "COMPLETED" : progress > 0 ? "IN PROGRESS" : "NOT STARTED"}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-muted h-2 border border-border">
                                <div
                                  className="bg-primary h-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{progress}%</span>
                            </div>
                          </td>
                          {canEditProgress && (
                            <td className="py-2 px-3 text-right space-x-1">
                              {[25, 50, 75, 100].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => handleUpdateTaskProgress(t.id, pct)}
                                  className={`px-1.5 py-0.5 text-[10px] border transition-colors ${
                                    progress === pct
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-card hover:bg-muted text-muted-foreground border-border"
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
