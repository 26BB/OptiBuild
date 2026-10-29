"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, type Variants } from "framer-motion"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { PermissionDenied } from "@/components/ui/PermissionDenied"
import { useAuth } from "@/context/AuthContext"
import { formatINR } from "@/lib/utils"
import { Counter } from "@/components/ui/Counter"
import { Badge } from "@/components/ui/badge"
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Calculator,
  Loader2,
  Play,
} from "lucide-react"

interface CrashAction {
  task_id: string
  task_name: string
  original_duration: number
  new_duration: number
  days_shortened: number
  cost_per_day: number
  total_additional_cost: number
  reason: string
}

interface OptimizationState {
  delay_days: number
  days_recovered: number
  effective_annual_rate: number
  rera_daily_penalty: number
  total_rera_penalty: number
  total_crash_cost: number
  net_savings: number
  recommendation: "CRASH_SCHEDULE" | "ACCEPT_PENALTY" | string
  recommendation_title: string
  rationale: string
  crashing_actions: CrashAction[]
}

interface ProjectTask {
  id: string
  name: string
  duration: number
  normal_cost: number
  crash_cost: number
  crash_duration: number
  predecessors: string[]
  is_critical?: boolean
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export default function OptimizerPage() {
  const { user, token, activeProjectId, activeProject, hasPermission } = useAuth()

  const [investmentCrores, setInvestmentCrores] = useState<number>(10.0)
  const [sbiMclr, setSbiMclr] = useState<number>(8.85)
  const [reraSpread, setReraSpread] = useState<number>(2.0)
  const [delayDays, setDelayDays] = useState<number>(14)
  const [tasks, setTasks] = useState<ProjectTask[]>([])

  const [result, setResult] = useState<OptimizationState | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch project tasks and optimizer record
  useEffect(() => {
    if (!activeProjectId || !token) {
      setIsLoading(false)
      return
    }

    const fetchProjectData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}`), {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error("Failed to load project details.")
        }

        const data = await res.json()
        const projectTasks = data.tasks || []
        setTasks(projectTasks)

        // Seed parameter inputs from project
        if (data.total_allottee_investment) {
          setInvestmentCrores(Number((data.total_allottee_investment / 10000000).toFixed(2)))
        } else if (data.total_project_cost) {
          setInvestmentCrores(Number(((data.total_project_cost * 0.7) / 10000000).toFixed(2)))
        }

        if (data.sbi_mclr_rate) {
          setSbiMclr(Number((data.sbi_mclr_rate * 100).toFixed(2)))
        }
        if (data.rera_spread) {
          setReraSpread(Number((data.rera_spread * 100).toFixed(2)))
        }
        if (data.delay_days) {
          setDelayDays(data.delay_days)
        }

        if (data.optimizer_data) {
          setResult(data.optimizer_data)
        } else {
          setResult(null)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load project optimization data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [activeProjectId, token])

  const handleRecalculate = async () => {
    if (!activeProjectId || !token || tasks.length === 0) return
    setIsCalculating(true)
    setError(null)

    const investmentInr = investmentCrores * 10000000

    try {
      const crashableTasks = tasks.map((t) => ({
        id: t.id,
        name: t.name,
        normal_duration: t.duration,
        crash_duration: t.crash_duration || Math.max(1, Math.floor(t.duration * 0.65)),
        normal_cost: t.normal_cost || 100000,
        crash_cost: t.crash_cost || (t.normal_cost ? t.normal_cost * 1.35 : 135000),
        predecessors: t.predecessors || [],
      }))

      const res = await fetch(getApiUrl("/api/v1/optimizer/evaluate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rera_params: {
            total_allottee_investment: investmentInr,
            sbi_mclr_rate: sbiMclr,
            rera_spread: reraSpread,
            delay_days: delayDays,
          },
          tasks: crashableTasks,
          target_recovery_days: delayDays,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        // Also persist to project in background
        fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/optimizer?target_recovery_days=${delayDays}`), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null)
      } else {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Optimization calculation failed.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to calculate optimization.")
    } finally {
      setIsCalculating(false)
    }
  }

  // Cost vs Time Trade-off curve data generator
  const tradeOffCurveData = useMemo(() => {
    if (!result) return []

    const actions = result.crashing_actions || []
    const points = []

    // Baseline: 0 days recovered
    let cumRecovered = 0
    let cumCrashCost = 0
    const dailyPenalty = result.rera_daily_penalty || 0
    let remainingDelay = result.delay_days

    points.push({
      step: "Baseline",
      daysRecovered: 0,
      crashCost: 0,
      reraPenalty: Math.round(remainingDelay * dailyPenalty),
      totalExposure: Math.round(remainingDelay * dailyPenalty),
    })

    // Progressive crashing steps
    actions.forEach((act, idx) => {
      cumRecovered += act.days_shortened
      cumCrashCost += act.total_additional_cost
      remainingDelay = Math.max(0, result.delay_days - cumRecovered)
      const currentPenalty = Math.round(remainingDelay * dailyPenalty)

      points.push({
        step: `+${cumRecovered}d (${act.task_id})`,
        daysRecovered: cumRecovered,
        crashCost: cumCrashCost,
        reraPenalty: currentPenalty,
        totalExposure: cumCrashCost + currentPenalty,
      })
    })

    return points
  }, [result])

  // Permission check
  if (!hasPermission(["admin", "project_manager", "owner"])) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Delay Penalty vs Crashing Cost Optimizer" />
        <main className="p-6">
          <PermissionDenied
            title="Access Restricted"
            description="MahaRERA delay penalty calculation and schedule crashing optimization is restricted to Project Managers, Owners, and Administrators."
            requiredRoles={["admin", "project_manager", "owner"]}
          />
        </main>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Delay Penalty vs Crashing Cost Optimizer" />
        <div className="flex flex-col items-center justify-center p-20 font-mono text-xs text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
          <span className="tracking-wider uppercase">Loading project CPM parameters & cost slopes...</span>
        </div>
      </div>
    )
  }

  // No active project
  if (!activeProjectId) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Delay Penalty vs Crashing Cost Optimizer" />
        <main className="p-6">
          <EmptyState
            title="No Active Project Selected"
            description="Select or upload a MahaRERA project from the sidebar to evaluate statutory delay penalties against schedule crashing costs."
            actionLabel="Upload MahaRERA PDF"
            actionHref="/rera-review"
          />
        </main>
      </div>
    )
  }

  // No tasks
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName={activeProject?.name || "Delay Penalty vs Crashing Cost Optimizer"} />
        <main className="p-6">
          <EmptyState
            title="No Scheduled Activities Found"
            description="This project does not have a Work Breakdown Structure or activities yet. Generate a WBS and schedule first to compute compression cost slopes."
            actionLabel="Generate WBS & Cost Estimate"
            actionHref="/wbs"
          />
        </main>
      </div>
    )
  }

  const isCrashCheaper = result ? result.recommendation === "CRASH_SCHEDULE" : false

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName={activeProject?.name || "MahaRERA Delay Penalty vs Crashing Cost Optimizer"}
        delayRiskDays={delayDays}
        onRecalculate={handleRecalculate}
        isOptimizing={isCalculating}
      />

      <motion.main
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Statutory Formula Banner */}
        <div className="border border-border bg-card p-4 rounded-[4px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                MahaRERA Section 18 Statutory Rule Optimizer
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Statutory Formula: Delay Penalty = Total Allottee Collections × [ (SBI MCLR + 2.0%) / 365 ] × Delay Days
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-mono px-2.5 py-1 bg-secondary border border-border text-foreground rounded-[4px]">
              Statutory Rate: {(sbiMclr + reraSpread).toFixed(2)}% p.a.
            </span>
            <button
              onClick={handleRecalculate}
              disabled={isCalculating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Evaluate Strategy
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive text-destructive font-mono text-xs flex items-center gap-2.5 rounded-[4px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-border bg-card p-4 rounded-[4px]">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1.5 font-medium">
              Allottee Investment (₹ Cr)
            </label>
            <input
              type="number"
              step="0.25"
              min="0.5"
              value={investmentCrores}
              onChange={(e) => setInvestmentCrores(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
            />
            <span className="text-[11px] font-mono text-muted-foreground mt-1 block">
              {formatINR(investmentCrores * 10000000)}
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1.5 font-medium">
              SBI MCLR Benchmark (%)
            </label>
            <input
              type="number"
              step="0.05"
              value={sbiMclr}
              onChange={(e) => setSbiMclr(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
            />
            <span className="text-[11px] font-mono text-muted-foreground mt-1 block">
              Highest Marginal Cost of Funds
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1.5 font-medium">
              RERA Spread (%)
            </label>
            <input
              type="number"
              step="0.25"
              value={reraSpread}
              onChange={(e) => setReraSpread(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
            />
            <span className="text-[11px] font-mono text-muted-foreground mt-1 block">
              Prescribed: +200 bps
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1.5 font-medium">
              Forecasted Delay (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                className="w-20 text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
              />
              <input
                type="range"
                min="1"
                max="90"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground mt-1 block">
              Calendar days behind critical path
            </span>
          </div>
        </div>

        {/* Results View or Prompt to Run */}
        {!result ? (
          <div className="border border-dashed border-border bg-card/60 p-10 text-center space-y-3 rounded-[4px]">
            <Calculator className="w-9 h-9 text-primary mx-auto opacity-80" />
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Ready to Evaluate Delay Trade-offs
            </h3>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
              Compare statutory MahaRERA interest liability against crashing activities on the critical path
              for the {tasks.length} tasks in {activeProject?.name}.
            </p>
            <button
              onClick={handleRecalculate}
              disabled={isCalculating}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Delay vs Crashing Analysis
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Dual Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option A: Accept MahaRERA Delay Penalty */}
              <div
                className={`border p-5 rounded-[4px] transition-all ${
                  !isCrashCheaper
                    ? "border-status-success bg-status-success/[0.04] ring-1 ring-status-success/30"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    OPTION A • PAY MAHARERA PENALTY
                  </span>
                  {!isCrashCheaper ? (
                    <Badge variant="outline" className="border-status-success/40 bg-status-success/15 text-status-success font-bold text-[11px] font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> RECOMMENDED STRATEGY
                    </Badge>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 border border-border text-muted-foreground">
                      HIGHER EXPOSURE
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-mono text-muted-foreground block uppercase">
                    Total Statutory Liability
                  </span>
                  <div className="mt-1 text-3xl font-mono font-bold text-foreground">
                    <Counter value={result.total_rera_penalty} isCurrency />
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs font-mono text-muted-foreground border-t border-border/50 pt-3">
                  <div className="flex justify-between">
                    <span>Daily Statutory Interest:</span>
                    <span className="text-foreground font-medium">{formatINR(result.rera_daily_penalty)} / day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effective Annual Rate:</span>
                    <span className="text-foreground font-medium">{result.effective_annual_rate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Allottee Liability:</span>
                    <span className="text-foreground font-medium">{delayDays} calendar days</span>
                  </div>
                </div>
              </div>

              {/* Option B: Fast-Track Schedule Crashing */}
              <div
                className={`border p-5 rounded-[4px] transition-all ${
                  isCrashCheaper
                    ? "border-status-success bg-status-success/[0.04] ring-1 ring-status-success/30"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    OPTION B • CRASH CONSTRUCTION SCHEDULE
                  </span>
                  {isCrashCheaper ? (
                    <Badge variant="outline" className="border-status-success/40 bg-status-success/15 text-status-success font-bold text-[11px] font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> RECOMMENDED STRATEGY
                    </Badge>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 border border-border text-muted-foreground">
                      HIGHER COST
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-mono text-muted-foreground block uppercase">
                    Total Schedule Crashing Cost
                  </span>
                  <div className="mt-1 text-3xl font-mono font-bold text-primary">
                    <Counter value={result.total_crash_cost} isCurrency />
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs font-mono text-muted-foreground border-t border-border/50 pt-3">
                  <div className="flex justify-between">
                    <span>Days Recovered:</span>
                    <span className="text-status-success font-bold">-{result.days_recovered} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Activities Compressed:</span>
                    <span className="text-foreground font-medium">
                      {result.crashing_actions ? result.crashing_actions.length : 0} activities
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Financial Benefit:</span>
                    <span className="text-status-success font-bold">
                      <Counter value={result.net_savings} isCurrency />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Recommendation Banner */}
            <div className="border border-border bg-secondary/50 p-4 rounded-[4px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                    RECOMMENDATION: {result.recommendation_title}
                  </h3>
                </div>
                <p className="text-xs text-foreground leading-relaxed font-sans max-w-3xl">
                  {result.rationale}
                </p>
              </div>

              <div className="shrink-0 p-3 bg-background border border-border rounded-[4px] text-right">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Net Financial Savings
                </span>
                <span className="text-lg font-mono font-bold text-status-success">
                  <Counter value={Math.abs(result.net_savings)} isCurrency />
                </span>
              </div>
            </div>

            {/* Recharts Cost vs Time Trade-off Curve */}
            {tradeOffCurveData.length > 1 && (
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                      CPM COST-TIME OPTIMIZATION CURVE
                    </h3>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Direct Crashing Cost vs Statutory MahaRERA Penalty trade-off across recovery steps
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 border border-border bg-secondary/50 rounded-[4px]">
                    CONVEX COST SLOPE
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tradeOffCurveData} margin={{ top: 10, right: 24, left: 24, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                      <XAxis
                        dataKey="step"
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                      />
                      <YAxis
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                        tickFormatter={(val) => formatINR(val, true)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "4px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        formatter={(val: any) => [formatINR(Number(val) || 0), ""]}
                      />
                      <Legend
                        wrapperStyle={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          paddingTop: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="crashCost"
                        name="Crashing Expenditure (Direct)"
                        stroke="#E8590C"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#E8590C" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reraPenalty"
                        name="MahaRERA Statutory Penalty"
                        stroke="#5C6470"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: "#5C6470" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalExposure"
                        name="Total Financial Exposure"
                        stroke="#2B8A3E"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#2B8A3E" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Crashing Execution Plan Table */}
            {result.crashing_actions && result.crashing_actions.length > 0 && (
              <div className="border border-border bg-card rounded-[4px] overflow-hidden">
                <div className="p-3.5 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                      CRITICAL PATH CRASHING BREAKDOWN (LOWEST COST SLOPE ORDER)
                    </h3>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Optimal sequence of activity compression calculated via CPM cost-slope minimization
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 border border-border bg-background rounded-[4px] font-medium">
                    TOTAL RECOVERED: {result.days_recovered} DAYS
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase">
                        <th className="p-3 font-semibold">Activity ID</th>
                        <th className="p-3 font-semibold">Task Name</th>
                        <th className="p-3 font-semibold text-right">Normal Dur</th>
                        <th className="p-3 font-semibold text-right">Crashed Dur</th>
                        <th className="p-3 font-semibold text-right">Shortened</th>
                        <th className="p-3 font-semibold text-right">Cost Slope</th>
                        <th className="p-3 font-semibold text-right">Expenditure</th>
                        <th className="p-3 font-semibold">Implementation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.crashing_actions.map((act) => (
                        <tr key={act.task_id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-bold text-foreground">{act.task_id}</td>
                          <td className="p-3 font-sans font-medium text-foreground">{act.task_name}</td>
                          <td className="p-3 text-right">{act.original_duration}d</td>
                          <td className="p-3 text-right font-bold text-primary">{act.new_duration}d</td>
                          <td className="p-3 text-right font-bold text-status-success">-{act.days_shortened}d</td>
                          <td className="p-3 text-right text-muted-foreground">{formatINR(act.cost_per_day)}/d</td>
                          <td className="p-3 text-right font-bold text-foreground">
                            {formatINR(act.total_additional_cost)}
                          </td>
                          <td className="p-3 text-[11px] text-muted-foreground font-sans">{act.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </motion.main>
    </div>
  )
}
