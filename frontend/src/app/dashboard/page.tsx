"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
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
  PieChart as PieIcon,
  RefreshCw,
  Sliders,
  AlertTriangle,
  ArrowRight,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

interface CategoryMetric {
  category_name: string
  planned_budget: number
  actual_spent: number
  variance: number
  percentage_utilized: number
}

interface SCurvePoint {
  month: string
  planned_monthly: number
  actual_monthly: number
  planned_cumulative: number
  actual_cumulative: number
}

interface RecalibratedTask {
  task_id: string
  task_name: string
  baseline_crash_slope: number
  recalibrated_crash_slope: number
  material_factor_applied: number
  change_percent: number
}

interface DashboardData {
  project_name: string
  total_planned_budget: number
  total_actual_spent: number
  total_variance: number
  is_over_budget: boolean
  budget_utilization_percent: number
  categories: CategoryMetric[]
  s_curve_data: SCurvePoint[]
  recalibration_available: boolean
  recalibrated_tasks: RecalibratedTask[]
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export default function DashboardPage() {
  const { user, token, activeProjectId, activeProject, hasPermission } = useAuth()

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRecalibrating, setIsRecalibrating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    if (!activeProjectId || !token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/dashboard/budget-vs-actual?project_id=${activeProjectId}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) {
        throw new Error("Failed to load dashboard metrics.")
      }
      const data = await res.json()
      setDashboardData(data)
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard analytics.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [activeProjectId, token])

  const handleRecalibrate = async () => {
    if (!activeProjectId || !token) return
    setIsRecalibrating(true)
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/dashboard/recalibrate-crash-costs?project_id=${activeProjectId}`),
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (res.ok) {
        await fetchDashboardData()
      }
    } catch (err) {
      console.error("Recalibrate error:", err)
    } finally {
      setIsRecalibrating(false)
    }
  }

  // Permission check
  if (!hasPermission(["accountant", "owner", "admin", "project_manager"])) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Budget vs Actual Dashboard" />
        <main className="p-6">
          <PermissionDenied
            title="Finance / Executive Access Required"
            description="Budget vs Actual financial analytics and delay risk exposure are restricted to Accountants, Owners, and Project Managers."
            requiredRoles={["accountant", "owner", "admin", "project_manager"]}
          />
        </main>
      </div>
    )
  }

  if (!activeProjectId) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Budget vs Actual Dashboard" />
        <main className="p-6">
          <EmptyState
            title="No Active Project Selected"
            description="Select an active project from the sidebar to inspect Budget vs Actual spend series, S-curves, and MahaRERA risk exposure."
          />
        </main>
      </div>
    )
  }

  const isOwner = user?.role === "owner"
  const canRecalibrate = hasPermission(["accountant", "project_manager", "admin"])
  const delayDays = activeProject?.delay_days || 0
  const totalCost = activeProject?.total_project_cost || dashboardData?.total_planned_budget || 0
  const estimatedEscrow = totalCost * 0.70
  // MahaRERA annual rate: SBI MCLR 8.85% + 2% = 10.85%
  const annualInterestRate = 0.1085
  const dailyPenalty = (estimatedEscrow * annualInterestRate) / 365
  const totalPenaltyExposure = dailyPenalty * delayDays

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName={activeProject?.name ? `Financials: ${activeProject.name}` : "Budget vs Actual Analytics"}
        delayRiskDays={delayDays}
      />

      <motion.main
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Top Header Card */}
        <div className="border border-border bg-card p-4 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="font-heading font-semibold text-base text-foreground flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              <span>
                {isOwner ? "Owner Executive Risk & Cost Control Dashboard" : "Budget vs Actual Cost Analytics"}
              </span>
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Live S-Curve Spend Model • Rate Recalibration from Material Delivery Slips
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {canRecalibrate && (
              <button
                type="button"
                disabled={isRecalibrating}
                onClick={handleRecalibrate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border text-foreground hover:bg-secondary/80 font-mono text-xs font-medium transition-colors rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? "animate-spin" : ""}`} />
                <span>{isRecalibrating ? "RECALIBRATING..." : "RECALIBRATE FROM INVOICES"}</span>
              </button>
            )}

            <Link
              href="/materials"
              className="px-3.5 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors rounded-[4px] shadow-sm"
            >
              View Material Logs
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono rounded-[4px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Owner / Executive Delay & Statutory Penalty Alert */}
        {(isOwner || delayDays > 0) && (
          <div className="border border-destructive/30 bg-destructive/[0.04] p-4 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive font-heading font-semibold text-xs tracking-wider uppercase">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Statutory MahaRERA Delay Exposure Alert</span>
              </div>
              <Badge variant="outline" className="border-destructive/30 bg-destructive/15 text-destructive font-bold text-[10px] font-mono">
                RULE 18 ENFORCEMENT
              </Badge>
            </div>
            <p className="text-xs font-sans text-muted-foreground leading-relaxed">
              MahaRERA Section 18 mandates interest compensation at SBI MCLR + 2% (currently 10.85% p.a.) on allottee investment funds for every calendar day of delay past contractual possession date.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs font-mono">
              <div className="p-3 bg-card border border-border rounded-[4px]">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">Project Delay</div>
                <div className="text-base font-bold text-destructive mt-0.5">+{delayDays} Days</div>
              </div>
              <div className="p-3 bg-card border border-border rounded-[4px]">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">Statutory Daily Liability</div>
                <div className="text-base font-bold text-foreground mt-0.5">{formatINR(dailyPenalty)} / day</div>
              </div>
              <div className="p-3 bg-card border border-border rounded-[4px]">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">Cumulative Penalty Exposure</div>
                <div className="text-base font-bold text-destructive mt-0.5">
                  <Counter value={totalPenaltyExposure} isCurrency />
                </div>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-end">
              <Link
                href="/optimizer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline font-semibold"
              >
                <span>Run Delay Penalty vs Schedule Crashing Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-20 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="uppercase tracking-wider">Loading Financial Analytics & S-Curve...</span>
          </div>
        ) : !dashboardData || dashboardData.total_planned_budget === 0 ? (
          <EmptyState
            title="No Budget Data Available for this Project"
            description="Generate the Parametric WBS first to establish planned budgets across packages and track real spend from material logs."
            actionLabel="Generate Project WBS"
            actionHref="/wbs"
          />
        ) : (
          <>
            {/* Primary Metrics Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
                  Planned Budget
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  <Counter value={dashboardData.total_planned_budget} isCurrency />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground mt-1">
                  WBS Parametric Baseline
                </div>
              </div>

              <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
                  Actual Material Spent
                </div>
                <div className="text-2xl font-bold font-mono text-primary mt-1">
                  <Counter value={dashboardData.total_actual_spent} isCurrency />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground mt-1">
                  From site delivery receipts
                </div>
              </div>

              <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
                  Budget Variance
                </div>
                <div
                  className={`text-2xl font-bold font-mono mt-1 ${
                    dashboardData.total_variance >= 0 ? "text-status-success" : "text-destructive"
                  }`}
                >
                  <Counter
                    value={Math.abs(dashboardData.total_variance)}
                    isCurrency
                    prefix={dashboardData.total_variance >= 0 ? "+ " : "- "}
                  />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground mt-1 flex items-center gap-1">
                  {dashboardData.total_variance >= 0 ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-status-success" />
                      <span>Under allocated budget</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-destructive" />
                      <span>Cost overrun alert</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
                  Budget Utilization
                </div>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  <Counter value={dashboardData.budget_utilization_percent} suffix="%" />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground mt-1">
                  Overall construction spend
                </div>
              </div>
            </div>

            {/* S-Curve Chart (Restyled only with design tokens per Rule 4) */}
            <div className="border border-border bg-card p-5 rounded-[4px] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                    12-Month S-Curve Progress (Planned vs Actual Cumulative Spend)
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Cumulative cashflow projection vs real site invoices
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 border border-border bg-secondary/50 rounded-[4px] self-start sm:self-auto">
                  EARNED VALUE ANALYSIS
                </span>
              </div>

              <div className="h-64 sm:h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.s_curve_data} margin={{ top: 10, right: 24, left: 16, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                    />
                    <YAxis
                      tickFormatter={(val) => formatINR(val, true)}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatINR(Number(val) || 0), "Spend"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        paddingTop: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="planned_cumulative"
                      name="Planned Cumulative Budget"
                      stroke="#5C6470"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual_cumulative"
                      name="Actual Cumulative Spend"
                      stroke="#E8590C"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#E8590C" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Package Breakdown Table */}
            <div className="border border-border bg-card rounded-[4px] overflow-hidden shadow-sm">
              <div className="p-3.5 bg-muted/20 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                    Work Package Level Budget Allocation vs Actual Spent
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Statutory MahaRERA Construction Packages
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 border border-border bg-background rounded-[4px]">
                  {dashboardData.categories.length} PACKAGES
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3.5 font-semibold">Work Package</th>
                      <th className="py-2.5 px-3.5 font-semibold text-right">Planned Budget</th>
                      <th className="py-2.5 px-3.5 font-semibold text-right">Actual Spent</th>
                      <th className="py-2.5 px-3.5 font-semibold text-right">Variance</th>
                      <th className="py-2.5 px-3.5 font-semibold text-right">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dashboardData.categories.map((c, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3.5 font-sans font-medium text-foreground">{c.category_name}</td>
                        <td className="py-3 px-3.5 text-right">{formatINR(c.planned_budget)}</td>
                        <td className="py-3 px-3.5 text-right text-primary font-bold">{formatINR(c.actual_spent)}</td>
                        <td className="py-3 px-3.5 text-right font-medium">
                          <span className={c.variance >= 0 ? "text-status-success font-bold" : "text-destructive font-bold"}>
                            {formatINR(c.variance)}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-muted h-2 border border-border rounded-[2px] overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all"
                                style={{ width: `${Math.min(100, c.percentage_utilized)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold w-9 text-right">{c.percentage_utilized}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recalibrated Critical Crash Slopes Section */}
            {dashboardData.recalibrated_tasks.length > 0 && (
              <div className="border border-border bg-card p-4 rounded-[4px] space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <h3 className="font-heading font-semibold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <span>Recalibrated Critical Activity Crash Costs (Site Invoice Feedback)</span>
                    </h3>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Crash-cost slopes adjusted dynamically using actual site purchase delivery invoices
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border bg-secondary/50 rounded-[4px]">
                    FEEDBACK LOOP ACTIVE
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3.5 font-semibold">Activity ID</th>
                        <th className="py-2.5 px-3.5 font-semibold">Task Title</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Baseline Slope</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Recalibrated Slope</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Material Factor</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Slope Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dashboardData.recalibrated_tasks.map((task) => (
                        <tr key={task.task_id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-primary">{task.task_id}</td>
                          <td className="py-3 px-3.5 text-foreground font-sans font-medium">{task.task_name}</td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground">{formatINR(task.baseline_crash_slope)}/d</td>
                          <td className="py-3 px-3.5 text-right font-bold text-foreground">
                            {formatINR(task.recalibrated_crash_slope)}/d
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground">{task.material_factor_applied}x</td>
                          <td className="py-3 px-3.5 text-right">
                            <span
                              className={
                                task.change_percent > 0
                                  ? "text-status-warning font-bold"
                                  : "text-status-success font-bold"
                              }
                            >
                              {task.change_percent > 0 ? `+${task.change_percent}%` : `${task.change_percent}%`}
                            </span>
                          </td>
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
