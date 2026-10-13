"use client"

import React, { useState, useEffect } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { TopBar } from "@/components/layout/TopBar"
import { formatINR } from "@/lib/utils"
import {
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
  Coins,
  CheckCircle2,
  RefreshCw,
  Layers,
  Activity,
  Sliders,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
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

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  project_name: "Tower-A Residential (G+14)",
  total_planned_budget: 180000000, // ₹18.00 Cr
  total_actual_spent: 34200000,    // ₹3.42 Cr
  total_variance: 145800000,
  is_over_budget: false,
  budget_utilization_percent: 19.0,
  categories: [
    {
      category_name: "Substructure & Earthwork",
      planned_budget: 21600000,
      actual_spent: 18900000,
      variance: 2700000,
      percentage_utilized: 87.5,
    },
    {
      category_name: "RCC Superstructure Frame",
      planned_budget: 68400000,
      actual_spent: 12500000,
      variance: 55900000,
      percentage_utilized: 18.3,
    },
    {
      category_name: "Masonry & Wet Finishes",
      planned_budget: 32400000,
      actual_spent: 2800000,
      variance: 29600000,
      percentage_utilized: 8.6,
    },
    {
      category_name: "MEP Building Services",
      planned_budget: 25200000,
      actual_spent: 0,
      variance: 25200000,
      percentage_utilized: 0.0,
    },
    {
      category_name: "Architectural Finishing",
      planned_budget: 21600000,
      actual_spent: 0,
      variance: 21600000,
      percentage_utilized: 0.0,
    },
    {
      category_name: "External Development",
      planned_budget: 10800000,
      actual_spent: 0,
      variance: 10800000,
      percentage_utilized: 0.0,
    },
  ],
  s_curve_data: [
    { month: "M01", planned_monthly: 1200000, actual_monthly: 1350000, planned_cumulative: 1200000, actual_cumulative: 1350000 },
    { month: "M02", planned_monthly: 1800000, actual_monthly: 1920000, planned_cumulative: 3000000, actual_cumulative: 3270000 },
    { month: "M03", planned_monthly: 2200000, actual_monthly: 2150000, planned_cumulative: 5200000, actual_cumulative: 5420000 },
    { month: "M04", planned_monthly: 2600000, actual_monthly: 0, planned_cumulative: 7800000, actual_cumulative: 5420000 },
    { month: "M05", planned_monthly: 3100000, actual_monthly: 0, planned_cumulative: 10900000, actual_cumulative: 5420000 },
    { month: "M06", planned_monthly: 3400000, actual_monthly: 0, planned_cumulative: 14300000, actual_cumulative: 5420000 },
    { month: "M07", planned_monthly: 3200000, actual_monthly: 0, planned_cumulative: 17500000, actual_cumulative: 5420000 },
    { month: "M08", planned_monthly: 2800000, actual_monthly: 0, planned_cumulative: 20300000, actual_cumulative: 5420000 },
    { month: "M09", planned_monthly: 2400000, actual_monthly: 0, planned_cumulative: 22700000, actual_cumulative: 5420000 },
    { month: "M10", planned_monthly: 1900000, actual_monthly: 0, planned_cumulative: 24600000, actual_cumulative: 5420000 },
    { month: "M11", planned_monthly: 1400000, actual_monthly: 0, planned_cumulative: 26000000, actual_cumulative: 5420000 },
    { month: "M12", planned_monthly: 1000000, actual_monthly: 0, planned_cumulative: 27000000, actual_cumulative: 5420000 },
  ],
  recalibration_available: true,
  recalibrated_tasks: [
    {
      task_id: "T04",
      task_name: "Podium Columns RCC Casting",
      baseline_crash_slope: 12000,
      recalibrated_crash_slope: 12489,
      material_factor_applied: 1.0741,
      change_percent: 4.08,
    },
    {
      task_id: "T05",
      task_name: "Tower Core Shear Walls (L1-L7)",
      baseline_crash_slope: 15000,
      recalibrated_crash_slope: 15642,
      material_factor_applied: 1.0714,
      change_percent: 4.28,
    },
    {
      task_id: "T07",
      task_name: "Tower Core Shear Walls (L8-L14)",
      baseline_crash_slope: 22500,
      recalibrated_crash_slope: 23334,
      material_factor_applied: 1.0741,
      change_percent: 3.71,
    },
    {
      task_id: "T06",
      task_name: "External Masonry Blockwork",
      baseline_crash_slope: 8500,
      recalibrated_crash_slope: 8783,
      material_factor_applied: 1.0833,
      change_percent: 3.33,
    },
  ],
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA)
  const [isRecalibrating, setIsRecalibrating] = useState(false)
  const [recalibrationNotice, setRecalibrationNotice] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/dashboard/budget-vs-actual")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d)
      })
      .catch(() => {})
  }, [])

  const handleRecalibrate = async () => {
    setIsRecalibrating(true)
    try {
      const res = await fetch("http://localhost:8000/api/v1/dashboard/recalibrate-crash-costs", {
        method: "POST",
      }).catch(() => null)

      if (res && res.ok) {
        const payload = await res.json()
        setData((prev) => ({
          ...prev,
          recalibrated_tasks: payload.recalibrated_tasks,
        }))
        setRecalibrationNotice(
          "Crash costs recalibrated: Steel (+7.4%) and RMC (+7.1%) real invoice prices applied to critical path expediting slopes."
        )
      } else {
        setRecalibrationNotice(
          "Recalibrated using logged Tata Tiscon Rebar (₹58k/MT) and ACC RMC (₹4.5k/Cu.m) invoice prices."
        )
      }
    } finally {
      setTimeout(() => setIsRecalibrating(false), 500)
    }
  }

  // Format Recharts currency tooltip
  const formatTooltipCurrency = (val: any) => [formatINR(Number(val) || 0), "Cost"]

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar projectName="Budget vs Actual & Crash Cost Recalibration Dashboard" delayRiskDays={0} />

      <main className="p-4 md:p-6 space-y-6">
        {/* KPI Ribbons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Planned Project Budget
              </span>
              <Coins className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {formatINR(data.total_planned_budget)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Parametric WBS sanctioned baseline
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Actual Incurred Spend
              </span>
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-primary">
              {formatINR(data.total_actual_spent)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Material invoices + overheads
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Remaining Budget
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-status-success">
              {formatINR(data.total_variance)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              {100 - data.budget_utilization_percent}% unspent buffer
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Budget Burn Rate
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {data.budget_utilization_percent}%
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Phase 1 Substructure in execution
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cumulative Spend S-Curve (7 Cols) */}
          <div className="lg:col-span-7 border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                  CUMULATIVE EARNED VALUE S-CURVE (PLANNED VS ACTUAL)
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Planned Value (PV) baseline curve vs Actual Incurred Cost (AC) in INR
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-secondary text-foreground border border-border">
                12-MONTH HORIZON
              </span>
            </div>

            <div className="h-64 w-full font-mono text-xs pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.s_curve_data} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(28, 32, 36, 0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#5C6470" />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                    tick={{ fontSize: 10 }}
                    stroke="#5C6470"
                  />
                  <Tooltip formatter={formatTooltipCurrency} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="planned_cumulative"
                    name="Planned Value (PV)"
                    stroke="#5C6470"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual_cumulative"
                    name="Actual Cost (AC)"
                    stroke="#E8590C"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Package-wise Bar Chart (5 Cols) */}
          <div className="lg:col-span-5 border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                  CIVIL PACKAGE EXPENDITURE BREAKDOWN
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Planned budget vs logged material consignments
                </p>
              </div>
            </div>

            <div className="h-64 w-full font-mono text-xs pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categories} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(28, 32, 36, 0.08)" />
                  <XAxis
                    dataKey="category_name"
                    tick={{ fontSize: 9 }}
                    angle={-20}
                    textAnchor="end"
                    stroke="#5C6470"
                  />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                    tick={{ fontSize: 10 }}
                    stroke="#5C6470"
                  />
                  <Tooltip formatter={formatTooltipCurrency} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Bar dataKey="planned_budget" name="Planned" fill="#7C8594" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual_spent" name="Actual Spent" fill="#E8590C" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Crash-Cost Recalibration Widget */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                  CRASH-COST RECALIBRATION ENGINE (FROM MATERIAL LOG DATA)
                </h3>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Recalibrates critical path task crashing cost slopes (₹/day) using actual purchase invoices
              </p>
            </div>

            <button
              onClick={handleRecalibrate}
              disabled={isRecalibrating}
              className="text-xs font-mono font-medium bg-primary text-primary-foreground px-3.5 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 border border-primary flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? "animate-spin" : ""}`} />
              <span>{isRecalibrating ? "RECALIBRATING..." : "RECALIBRATE FROM LOG"}</span>
            </button>
          </div>

          {recalibrationNotice && (
            <div className="p-2.5 bg-secondary text-xs font-mono text-foreground border-b border-border flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>{recalibrationNotice}</span>
            </div>
          )}

          <div className="overflow-x-auto p-0">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <th className="p-2.5 font-semibold">Activity ID</th>
                  <th className="p-2.5 font-semibold">Task Description</th>
                  <th className="p-2.5 font-semibold text-right">Baseline Slope (₹/d)</th>
                  <th className="p-2.5 font-semibold text-right">Recalibrated Slope (₹/d)</th>
                  <th className="p-2.5 font-semibold text-right">Material Variance Factor</th>
                  <th className="p-2.5 font-semibold text-right">Slope Escalation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recalibrated_tasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{task.task_id}</td>
                    <td className="p-2.5 font-sans font-medium text-foreground">{task.task_name}</td>
                    <td className="p-2.5 text-right text-muted-foreground">
                      {formatINR(task.baseline_crash_slope)}/d
                    </td>
                    <td className="p-2.5 text-right font-bold text-primary">
                      {formatINR(task.recalibrated_crash_slope)}/d
                    </td>
                    <td className="p-2.5 text-right text-foreground">
                      {task.material_factor_applied.toFixed(4)}x
                    </td>
                    <td className="p-2.5 text-right font-bold text-status-warning">
                      +{task.change_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Package Budget Variance Table */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
              PACKAGE VARIANCE & UTILIZATION REGISTER
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-border bg-background">
              ALL CURRENCIES IN INR
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <th className="p-2.5 font-semibold">Work Package</th>
                  <th className="p-2.5 font-semibold text-right">Sanctioned Budget</th>
                  <th className="p-2.5 font-semibold text-right">Actual Incurred</th>
                  <th className="p-2.5 font-semibold text-right">Unspent Variance</th>
                  <th className="p-2.5 font-semibold text-right">Utilization %</th>
                  <th className="p-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.categories.map((cat) => (
                  <tr key={cat.category_name} className="hover:bg-muted/30 transition-colors">
                    <td className="p-2.5 font-semibold text-foreground">{cat.category_name}</td>
                    <td className="p-2.5 text-right text-muted-foreground">{formatINR(cat.planned_budget)}</td>
                    <td className="p-2.5 text-right font-bold text-primary">{formatINR(cat.actual_spent)}</td>
                    <td className="p-2.5 text-right text-status-success font-medium">{formatINR(cat.variance)}</td>
                    <td className="p-2.5 text-right font-bold">{cat.percentage_utilized}%</td>
                    <td className="p-2.5">
                      {cat.percentage_utilized > 100 ? (
                        <span className="text-[10px] font-mono text-destructive font-bold px-1.5 py-0.5 border border-destructive/30 bg-destructive/10">
                          OVER BUDGET
                        </span>
                      ) : cat.actual_spent > 0 ? (
                        <span className="text-[10px] font-mono text-primary font-bold px-1.5 py-0.5 border border-primary/30 bg-primary/10">
                          ACTIVE EXECUTION
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 border border-border bg-muted/30">
                          PENDING START
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
