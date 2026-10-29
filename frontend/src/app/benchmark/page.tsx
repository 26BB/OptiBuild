"use client"

import React, { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
import { Counter } from "@/components/ui/Counter"
import { Badge } from "@/components/ui/badge"
import {
  Cpu,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  Play,
  AlertTriangle,
} from "lucide-react"

interface SolverMetrics {
  solver_name: string
  status: string
  makespan_days: number
  runtime_ms: number
}

interface BenchmarkData {
  benchmark_name: string
  task_count: number
  resource_limits: Record<string, number>
  ga_metrics: SolverMetrics
  cpsat_metrics: SolverMetrics
  optimality_gap_percent: number
  cpsat_is_optimal: boolean
  markdown_table: string
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export default function BenchmarkPage() {
  const { user, token, activeProjectId, activeProject, hasPermission } = useAuth()

  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string>("active_project")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasProjectTasks, setHasProjectTasks] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedMd, setCopiedMd] = useState<boolean>(false)
  const [copiedJson, setCopiedJson] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"table" | "json">("table")

  // Load project benchmark or presets
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    const checkProject = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (activeProjectId) {
          const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}`), {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            const tasks = data.tasks || []
            setHasProjectTasks(tasks.length > 0)
            if (data.benchmark_data) {
              setBenchmark(data.benchmark_data)
            } else {
              setBenchmark(null)
            }

            if (tasks.length === 0) {
              setSelectedTarget("medium_superstructure")
            }
          }
        } else {
          setSelectedTarget("medium_superstructure")
        }
      } catch (err: any) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    checkProject()
  }, [activeProjectId, token])

  const handleRun = async () => {
    if (!token) return
    setIsRunning(true)
    setError(null)

    try {
      if (selectedTarget === "active_project" && activeProjectId) {
        // Run on active project network
        const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/benchmark`), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || "Active project benchmark failed.")
        }

        const data = await res.json()
        setBenchmark(data)
      } else {
        // Run on preset
        const res = await fetch(getApiUrl("/api/v1/benchmark/run"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            benchmark_name:
              selectedTarget === "small_substructure"
                ? "Small: Substructure & Foundation (8 Tasks)"
                : "Medium: G+7 Superstructure & Services (14 Tasks)",
            cpsat_time_limit_seconds: 5.0,
            ga_population_size: 40,
            ga_generations: 50,
            random_seed: 42,
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || "Benchmark execution failed.")
        }

        const data = await res.json()
        setBenchmark(data)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to execute solver benchmark.")
    } finally {
      setIsRunning(false)
    }
  }

  const copyMarkdown = () => {
    if (!benchmark?.markdown_table) return
    navigator.clipboard.writeText(benchmark.markdown_table)
    setCopiedMd(true)
    setTimeout(() => setCopiedMd(false), 2000)
  }

  const copyJson = () => {
    if (!benchmark) return
    navigator.clipboard.writeText(JSON.stringify(benchmark, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  // Permission check
  if (!hasPermission(["admin", "project_manager"])) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="OR-Tools CP-SAT vs Genetic Algorithm Benchmark" />
        <main className="p-6">
          <PermissionDenied
            title="Access Restricted"
            description="OR-Tools CP-SAT exact validation and RCPSP solver benchmarking is restricted to Project Managers and Administrators."
            requiredRoles={["admin", "project_manager"]}
          />
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="OR-Tools CP-SAT vs Genetic Algorithm Benchmark" />
        <div className="flex flex-col items-center justify-center p-20 font-mono text-xs text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
          <span className="uppercase tracking-wider">Loading solver benchmarks and project networks...</span>
        </div>
      </div>
    )
  }

  // Chart data for comparison
  const comparisonChartData = benchmark
    ? [
        {
          name: "Makespan (Days)",
          GA: benchmark.ga_metrics.makespan_days,
          CPSAT: benchmark.cpsat_metrics.makespan_days,
        },
      ]
    : []

  const runtimeChartData = benchmark
    ? [
        {
          name: "Runtime (ms)",
          GA: Math.round(benchmark.ga_metrics.runtime_ms),
          CPSAT: Math.round(benchmark.cpsat_metrics.runtime_ms),
        },
      ]
    : []

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName="OR-Tools CP-SAT vs Genetic Algorithm Benchmark"
        delayRiskDays={0}
        onRecalculate={handleRun}
        isOptimizing={isRunning}
      />

      <motion.main
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Benchmark Header & Preset Selection Card */}
        <div className="border border-border bg-card p-4 rounded-[4px] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                  RCPSP Solver Benchmark Engine
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                Exact Constraint Programming (Google OR-Tools CP-SAT) vs Fast Serial SGS Genetic Algorithm
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
              >
                {activeProjectId && hasProjectTasks && (
                  <option value="active_project">
                    Active Project: {activeProject?.name || "Current Tasks"}
                  </option>
                )}
                <option value="medium_superstructure">
                  Medium Benchmark: G+7 Superstructure (14 Tasks)
                </option>
                <option value="small_substructure">
                  Small Benchmark: Foundation & Substructure (8 Tasks)
                </option>
              </select>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Solvers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive text-destructive font-mono text-xs flex items-center gap-2.5 rounded-[4px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!benchmark ? (
          <div className="border border-dashed border-border bg-card/60 p-12 text-center space-y-3 rounded-[4px]">
            <Cpu className="w-10 h-10 text-primary mx-auto opacity-80" />
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Ready to Benchmark Construction Schedulers
            </h3>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
              Execute Google OR-Tools CP-SAT (exact mathematical constraint solver) against the Genetic Algorithm metaheuristic to verify schedule optimality and solve times.
            </p>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Solving Network...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Run Benchmark Now</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Top Metrics Cards with Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* GA Card */}
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                    Heuristic Engine
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5 bg-primary/10 border-primary/20 text-primary rounded-[3px]">
                    {benchmark.ga_metrics.status}
                  </Badge>
                </div>
                <div className="text-sm font-semibold font-heading text-foreground">
                  {benchmark.ga_metrics.solver_name}
                </div>
                <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-foreground">
                    <Counter value={benchmark.ga_metrics.makespan_days} suffix=" d" />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    <Counter value={Math.round(benchmark.ga_metrics.runtime_ms)} suffix=" ms" />
                  </span>
                </div>
              </div>

              {/* CP-SAT Card */}
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                    Exact Solver (Google OR-Tools)
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5 bg-status-success/15 border-status-success/30 text-status-success rounded-[3px]">
                    {benchmark.cpsat_metrics.status}
                  </Badge>
                </div>
                <div className="text-sm font-semibold font-heading text-foreground">
                  {benchmark.cpsat_metrics.solver_name}
                </div>
                <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-status-success">
                    <Counter value={benchmark.cpsat_metrics.makespan_days} suffix=" d" />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    <Counter value={Math.round(benchmark.cpsat_metrics.runtime_ms)} suffix=" ms" />
                  </span>
                </div>
              </div>

              {/* Optimality Gap Card */}
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                    Optimality Gap
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-secondary border border-border text-foreground rounded-[3px]">
                    {benchmark.task_count} Activities
                  </span>
                </div>
                <div className="text-sm font-semibold font-heading text-foreground">
                  {benchmark.optimality_gap_percent === 0
                    ? "GA Reached Exact Global Optimal"
                    : `+${benchmark.optimality_gap_percent.toFixed(2)}% Over Global Optimal`}
                </div>
                <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-primary">
                    <Counter
                      value={benchmark.optimality_gap_percent}
                      prefix="+"
                      suffix="%"
                    />
                  </span>
                  <span className="text-xs font-mono text-status-success flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>CP-SAT Verified</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Makespan Chart */}
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                    Schedule Makespan Comparison (Days)
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">LOWER IS BETTER</span>
                </div>

                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                      <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)", paddingTop: "4px" }} />
                      <Bar dataKey="GA" name="Genetic Algorithm" fill="#E8590C" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="CPSAT" name="OR-Tools CP-SAT" fill="#2B8A3E" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Runtime Chart */}
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                    Execution Runtime Comparison (Milliseconds)
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">SPEED BENCHMARK</span>
                </div>

                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={runtimeChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                      <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)", paddingTop: "4px" }} />
                      <Bar dataKey="GA" name="Genetic Algorithm" fill="#E8590C" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="CPSAT" name="OR-Tools CP-SAT" fill="#5C6470" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* View Selector & Export Buttons with Monospace Output */}
            <div className="border border-border bg-card rounded-[4px] overflow-hidden shadow-sm">
              <div className="p-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("table")}
                    className={`px-3 py-1 text-xs font-mono rounded-[3px] border transition-colors cursor-pointer ${
                      activeTab === "table"
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    Comparison Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`px-3 py-1 text-xs font-mono rounded-[3px] border transition-colors cursor-pointer ${
                      activeTab === "json"
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    Raw Solver JSON
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyMarkdown}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-[3px] transition-colors cursor-pointer"
                  >
                    {copiedMd ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMd ? "Copied" : "Copy Markdown"}</span>
                  </button>

                  <button
                    onClick={copyJson}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-[3px] transition-colors cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>
              </div>

              {activeTab === "table" ? (
                <div className="p-4 overflow-x-auto font-mono text-xs space-y-3">
                  <div className="p-3 bg-muted/20 border border-border rounded-[4px] text-[11px] text-muted-foreground flex items-center justify-between">
                    <div>
                      Target: <span className="text-foreground font-semibold">{benchmark.benchmark_name}</span>
                    </div>
                    <div className="text-[10px]">
                      Capacities: {JSON.stringify(benchmark.resource_limits)}
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground bg-muted/10 p-4 border border-border rounded-[4px] leading-relaxed">
                    {benchmark.markdown_table}
                  </pre>
                </div>
              ) : (
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-muted-foreground bg-muted/20 p-4 border border-border rounded-[4px] overflow-x-auto max-h-96">
                    {JSON.stringify(benchmark, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </motion.main>
    </div>
  )
}
