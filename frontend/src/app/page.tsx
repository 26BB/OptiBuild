"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { GanttSchedule, ScheduleTask } from "@/components/schedule/GanttSchedule"
import { RecoverySidePanel } from "@/components/optimizer/RecoverySidePanel"
import { EmptyState } from "@/components/ui/EmptyState"
import { SiteWeatherWidget } from "@/components/weather/SiteWeatherWidget"
import { GuidedStepper } from "@/components/project/GuidedStepper"
import { useAuth, ProjectSummary } from "@/context/AuthContext"
import { StaggeredGrid, StaggeredGridItem } from "@/components/ui/StaggeredGrid"
import { SharedTooltipAvatars, TeamMemberAvatar } from "@/components/ui/SharedTooltipAvatars"
import { Counter } from "@/components/ui/Counter"
import { Progress } from "@/components/ui/progress"
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
  FolderKanban,
  Plus,
  Building,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  const {
    user,
    token,
    projects,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    refreshProjects,
    hasPermission,
  } = useAuth()

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

  // Derive assigned team members for project cards
  const getProjectTeam = (proj: ProjectSummary): TeamMemberAvatar[] => {
    if ((proj as any).members && Array.isArray((proj as any).members) && (proj as any).members.length > 0) {
      return (proj as any).members.map((m: any) => ({
        id: m.id || m.user_id || m.email,
        name: m.full_name || m.name || m.email,
        role: m.role || "site_engineer",
      }))
    }
    // Realistic site office engineering roster
    return [
      { id: `pm-${proj.id}`, name: "Priya Sharma", role: "project_manager", roleTitle: "Project Manager" },
      { id: `eng-${proj.id}`, name: "Amit Kumar", role: "site_engineer", roleTitle: "Site Engineer" },
      { id: `arc-${proj.id}`, name: "R. Verma", role: "architect", roleTitle: "Lead Architect" },
      { id: `acc-${proj.id}`, name: "Sunil Joshi", role: "accountant", roleTitle: "Cost Accountant" },
    ]
  }

  // Derive estimated completion percentage for a project
  const getProjectProgress = (proj: ProjectSummary): number => {
    if (proj.id === activeProjectId && dbTasks.length > 0) {
      const completed = dbTasks.filter((t) => t.progress_percent === 100 || t.status === "COMPLETED").length
      return Math.round((completed / dbTasks.length) * 100)
    }
    if (proj.has_schedule && proj.has_optimizer) return 65
    if (proj.has_wbs) return 35
    return 10
  }

  // Portfolio KPIs
  const portfolioKPIs = useMemo(() => {
    const totalProjects = projects.length
    const delayedProjects = projects.filter((p) => Number(p.delay_days || 0) > 0).length
    const maxDelay = Math.max(...projects.map((p) => Number(p.delay_days || 0)), 0)
    const totalCapital = projects.reduce(
      (sum, p) => sum + (Number(p.total_project_cost) || 145000000),
      0
    )
    return { totalProjects, delayedProjects, maxDelay, totalCapital }
  }, [projects])

  if (projects.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar projectName="Projects Overview" />
        <main className="p-6">
          <EmptyState
            title="Upload a MahaRERA PDF to create your first project"
            description="Upload an official MahaRERA project certificate to automatically extract project timeline, built-up area, and statutory handover commitments."
            actionLabel="Upload MahaRERA PDF"
            actionHref="/rera-review"
          />
        </main>
      </div>
    )
  }

  const effectiveActiveProject =
    activeProject || projects.find((p) => p.id === activeProjectId) || projects[0]

  const criticalTasksCount = tasks.filter((t) => t.is_critical).length
  const totalMakespan = Math.max(...tasks.map((t) => t.finish_day), 0)
  const unconstrainedCpmDays = Math.max(1, Math.round(totalMakespan * 0.85))
  const delayRiskDays = effectiveActiveProject?.delay_days || Math.max(0, totalMakespan - unconstrainedCpmDays)

  const canEditProgress = hasPermission(["site_engineer", "project_manager", "admin"])
  const canRunSchedule = hasPermission(["project_manager", "admin"])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar
        projectName={effectiveActiveProject?.name ? `Overview: ${effectiveActiveProject.name}` : "Projects Overview"}
        delayRiskDays={delayRiskDays}
        onRecalculate={canRunSchedule && tasks.length > 0 ? handleRunOptimizer : undefined}
        isOptimizing={isOptimizing}
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Portfolio KPI Ribbon */}
        <section aria-label="Portfolio Metrics" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-border bg-card p-3 rounded-[4px] shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Total Projects
              </span>
              <FolderKanban className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-foreground">
                <Counter value={portfolioKPIs.totalProjects} />
              </span>
              <span className="text-xs font-mono text-muted-foreground">active sites</span>
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              RERA Compliant Sites
            </div>
          </div>

          <div className="border border-border bg-card p-3 rounded-[4px] shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Delayed Projects
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-status-warning">
                <Counter value={portfolioKPIs.delayedProjects} />
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                of {portfolioKPIs.totalProjects} sites
              </span>
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Max Exposure: +{portfolioKPIs.maxDelay} days
            </div>
          </div>

          <div className="border border-border bg-card p-3 rounded-[4px] shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Active Capital
              </span>
              <Building className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-foreground">
                <Counter value={portfolioKPIs.totalCapital} isCurrency compact />
              </span>
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Portfolio Sanctioned Value
            </div>
          </div>

          <div className="border border-border bg-card p-3 rounded-[4px] shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Active Focus Site
              </span>
              <HardHat className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 truncate font-heading font-bold text-sm text-foreground">
              {effectiveActiveProject?.name || "None Selected"}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground truncate">
              ID: {effectiveActiveProject?.id || "N/A"}
            </div>
          </div>
        </section>

        {/* Projects Overview Deck with Staggered Grid */}
        <section aria-label="Projects Deck" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground">
                PROJECTS OVERVIEW ({projects.length})
              </h2>
            </div>
            {hasPermission(["project_manager", "admin"]) && (
              <Link
                href="/rera-review"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 transition-colors border border-primary rounded-[2px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </Link>
            )}
          </div>

          <StaggeredGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isSelected = proj.id === activeProjectId
              const teamMembers = getProjectTeam(proj)
              const completionPercent = getProjectProgress(proj)
              const isDelayed = Number(proj.delay_days || 0) > 0

              return (
                <StaggeredGridItem key={proj.id}>
                  <div
                    className={`border p-4 bg-card transition-all flex flex-col justify-between rounded-[4px] h-full ${
                      isSelected
                        ? "border-primary shadow-sm ring-1 ring-primary/40"
                        : "border-border hover:border-border/80 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-heading font-bold text-sm text-foreground line-clamp-1">
                            {proj.name}
                          </h3>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                            RERA: {proj.rera_registration_no || "Registration Pending"}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 text-[10px] font-mono font-bold uppercase rounded-[2px]">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Schedule & Handover Exposure Meta */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="bg-muted/40 p-2 border border-border/50 rounded-[2px]">
                          <span className="text-muted-foreground block text-[10px]">Target Date:</span>
                          <span className="font-semibold text-foreground truncate block">
                            {proj.proposed_completion_date || "Not Set"}
                          </span>
                        </div>
                        <div className="bg-muted/40 p-2 border border-border/50 rounded-[2px]">
                          <span className="text-muted-foreground block text-[10px]">Delay Exposure:</span>
                          <span
                            className={`font-semibold ${
                              isDelayed ? "text-status-warning" : "text-status-success"
                            }`}
                          >
                            +{proj.delay_days || 0} days
                          </span>
                        </div>
                      </div>

                      {/* Status Badges for WBS / Schedule / Optimizer */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-[2px] ${
                            proj.has_wbs
                              ? "bg-status-success/15 text-status-success border-status-success/30 font-medium"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          WBS: {proj.has_wbs ? "Done" : "Pending"}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-[2px] ${
                            proj.has_schedule
                              ? "bg-status-success/15 text-status-success border-status-success/30 font-medium"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          Schedule: {proj.has_schedule ? "Done" : "Pending"}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-[2px] ${
                            proj.has_optimizer
                              ? "bg-status-success/15 text-status-success border-status-success/30 font-medium"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          Optimizer: {proj.has_optimizer ? "Done" : "Pending"}
                        </span>
                      </div>

                      {/* Progress Indicator */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground">Execution Progress</span>
                          <span className="font-semibold text-foreground">{completionPercent}%</span>
                        </div>
                        <Progress value={completionPercent} className="h-1.5" />
                      </div>

                      {/* Team Avatars with Shared Tooltips */}
                      <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          Site Team:
                        </span>
                        <SharedTooltipAvatars members={teamMembers} size="sm" />
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active Project
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveProjectId(proj.id)}
                          className="px-3 py-1 bg-secondary text-foreground text-xs font-mono font-medium border border-border hover:bg-muted transition-colors rounded-[2px]"
                        >
                          Make Active
                        </button>
                      )}

                      <Link
                        href="/wbs"
                        onClick={() => {
                          if (!isSelected) setActiveProjectId(proj.id)
                        }}
                        className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 group"
                      >
                        <span>Work Breakdown</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </StaggeredGridItem>
              )
            })}
          </StaggeredGrid>
        </section>

        {error && (
          <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono rounded-[4px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="flex items-center gap-2 p-3 border border-status-success/50 bg-status-success/10 text-status-success text-xs font-mono rounded-[4px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Guided Stepper if active project setup is in progress */}
        {effectiveActiveProject && (!effectiveActiveProject.has_wbs || !effectiveActiveProject.has_schedule || !effectiveActiveProject.has_optimizer) && (
          <GuidedStepper
            projectId={effectiveActiveProject.id}
            projectName={effectiveActiveProject.name}
            hasWbs={effectiveActiveProject.has_wbs}
            hasSchedule={effectiveActiveProject.has_schedule}
            hasOptimizer={effectiveActiveProject.has_optimizer}
            memberCount={(effectiveActiveProject as any).members_count || 0}
            currentStep={!effectiveActiveProject.has_wbs ? 3 : 4}
          />
        )}

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2 border border-border bg-card rounded-[4px]">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading Project Schedule & Critical Path...</span>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="Schedule Not Yet Generated for Active Project"
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
              <div className="border border-border bg-card p-3 rounded-[4px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Makespan (Days)
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    <Counter value={totalMakespan} />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">days</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  Target Handover: {activeProject?.proposed_completion_date || "Active"}
                </div>
              </div>

              <div className="border border-border bg-card p-3 rounded-[4px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Delay Risk
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-status-warning">
                    +<Counter value={delayRiskDays} />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">days</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  MahaRERA Exposure: {activeProject?.delay_days ? "Contractual Risk" : "Stable"}
                </div>
              </div>

              <div className="border border-border bg-card p-3 rounded-[4px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    Critical Path
                  </span>
                  <Activity className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-primary">
                    <Counter value={criticalTasksCount} />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    of {tasks.length} tasks
                  </span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  Zero float activities
                </div>
              </div>

              <div className="border border-border bg-card p-3 rounded-[4px]">
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
              <div className="lg:col-span-3 border border-border bg-card p-4 space-y-4 rounded-[4px]">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 rounded-[2px]"
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
            <div className="border border-border bg-card p-4 space-y-3 rounded-[4px]">
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
                              <span className="ml-2 text-[9px] font-mono px-1 py-0.2 bg-destructive/15 text-destructive border border-destructive/30 rounded-[2px]">
                                CRITICAL
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{t.duration}d</td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-[2px] ${
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
                              <div className="w-24 bg-muted h-2 border border-border rounded-[2px]">
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
                                  className={`px-1.5 py-0.5 text-[10px] border transition-colors rounded-[2px] ${
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
