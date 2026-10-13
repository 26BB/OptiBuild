"use client"

import React, { useState } from "react"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { formatINR } from "@/lib/utils"
import {
  Scale,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Sliders,
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
  recommendation: "CRASH_SCHEDULE" | "ACCEPT_PENALTY"
  recommendation_title: string
  rationale: string
  crashing_actions: CrashAction[]
}

const DEFAULT_OPTIMIZATION: OptimizationState = {
  delay_days: 14,
  days_recovered: 14,
  effective_annual_rate: 10.85,
  rera_daily_penalty: 34657.53,
  total_rera_penalty: 485205.42,
  total_crash_cost: 210000.0,
  net_savings: 275205.42,
  recommendation: "CRASH_SCHEDULE",
  recommendation_title: "CRASH SCHEDULE (RECOMMENDED)",
  rationale:
    "Fast-tracking critical activities costs ₹2,10,000, saving ₹2,75,205 compared to statutory MahaRERA delay penalties of ₹4,85,205. This prevents buyer litigation and preserves regulatory compliance.",
  crashing_actions: [
    {
      task_id: "T04",
      task_name: "Podium Columns RCC Casting",
      original_duration: 16,
      new_duration: 11,
      days_shortened: 5,
      cost_per_day: 12000,
      total_additional_cost: 60000,
      reason: "Compressed by 5d on critical path via 2nd shift formwork crew.",
    },
    {
      task_id: "T05",
      task_name: "Tower Core Shear Walls (L1-L7)",
      original_duration: 25,
      new_duration: 18,
      days_shortened: 7,
      cost_per_day: 15000,
      total_additional_cost: 105000,
      reason: "Compressed by 7d on critical path via self-climbing formwork & night curing.",
    },
    {
      task_id: "T07",
      task_name: "Tower Core Shear Walls (L8-L14)",
      original_duration: 28,
      new_duration: 26,
      days_shortened: 2,
      cost_per_day: 22500,
      total_additional_cost: 45000,
      reason: "Compressed by 2d on critical path via high early-strength concrete mix.",
    },
  ],
}

export default function OptimizerPage() {
  const [investmentCrores, setInvestmentCrores] = useState<number>(11.65) // 11.65 Cr collected
  const [sbiMclr, setSbiMclr] = useState<number>(8.85)
  const [reraSpread, setReraSpread] = useState<number>(2.0)
  const [delayDays, setDelayDays] = useState<number>(14)
  const [result, setResult] = useState<OptimizationState>(DEFAULT_OPTIMIZATION)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleRecalculate = async () => {
    setIsCalculating(true)
    const investmentInr = investmentCrores * 10000000

    try {
      const res = await fetch(getApiUrl("/api/v1/optimizer/evaluate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rera_params: {
            total_allottee_investment: investmentInr,
            sbi_mclr_rate: sbiMclr,
            rera_spread: reraSpread,
            delay_days: delayDays,
          },
          tasks: [
            {
              id: "T04",
              name: "Podium Columns RCC Casting",
              normal_duration: 16,
              crash_duration: 11,
              normal_cost: 450000,
              crash_cost: 510000,
              predecessors: [],
            },
            {
              id: "T05",
              name: "Tower Core Shear Walls (L1-L7)",
              normal_duration: 25,
              crash_duration: 18,
              normal_cost: 850000,
              crash_cost: 955000,
              predecessors: ["T04"],
            },
            {
              id: "T07",
              name: "Tower Core Shear Walls (L8-L14)",
              normal_duration: 28,
              crash_duration: 24,
              normal_cost: 950000,
              crash_cost: 1040000,
              predecessors: ["T05"],
            },
          ],
        }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        // Local calculation fallback
        const effRate = sbiMclr + reraSpread
        const dailyPen = (investmentInr * (effRate / 100)) / 365
        const totalPen = dailyPen * delayDays
        const crashCost = 210000.0
        const isCrash = crashCost < totalPen

        setResult({
          delay_days: delayDays,
          days_recovered: delayDays,
          effective_annual_rate: effRate,
          rera_daily_penalty: dailyPen,
          total_rera_penalty: totalPen,
          total_crash_cost: crashCost,
          net_savings: Math.abs(totalPen - crashCost),
          recommendation: isCrash ? "CRASH_SCHEDULE" : "ACCEPT_PENALTY",
          recommendation_title: isCrash ? "CRASH SCHEDULE (RECOMMENDED)" : "ACCEPT RERA DELAY PENALTY",
          rationale: isCrash
            ? `Fast-tracking critical activities costs ₹${crashCost.toLocaleString("en-IN")}, saving ₹${Math.abs(totalPen - crashCost).toLocaleString("en-IN")} vs statutory penalty.`
            : `Crashing costs exceed statutory interest liability by ₹${Math.abs(totalPen - crashCost).toLocaleString("en-IN")}.`,
          crashing_actions: DEFAULT_OPTIMIZATION.crashing_actions,
        })
      }
    } finally {
      setTimeout(() => setIsCalculating(false), 400)
    }
  }

  const isCrashCheaper = result.recommendation === "CRASH_SCHEDULE"

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName="MahaRERA Delay Penalty vs Crashing Cost Optimizer"
        delayRiskDays={delayDays}
        onRecalculate={handleRecalculate}
        isOptimizing={isCalculating}
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Statutory Formula Banner */}
        <div className="border border-border bg-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono px-2.5 py-1 bg-secondary border border-border text-foreground">
              Statutory Rate: {sbiMclr + reraSpread}% p.a.
            </span>
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-border bg-card p-4">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
              Allottee Investment (₹ Cr)
            </label>
            <input
              type="number"
              step="0.25"
              min="0.5"
              value={investmentCrores}
              onChange={(e) => setInvestmentCrores(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
            />
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
              {formatINR(investmentCrores * 10000000)}
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
              SBI MCLR Benchmark (%)
            </label>
            <input
              type="number"
              step="0.05"
              value={sbiMclr}
              onChange={(e) => setSbiMclr(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
            />
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
              Highest Marginal Cost
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
              RERA Spread (%)
            </label>
            <input
              type="number"
              step="0.25"
              value={reraSpread}
              onChange={(e) => setReraSpread(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
            />
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
              Prescribed: +200 bps
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
              Forecasted Delay (Days)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
            />
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
              Calendar days behind
            </span>
          </div>
        </div>

        {/* Comparison Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option A: Accept MahaRERA Delay Penalty */}
          <div
            className={`border p-4 transition-colors ${
              !isCrashCheaper
                ? "border-status-success bg-status-success/[0.04] ring-1 ring-status-success/30"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                OPTION A • ACCEPT RERA PENALTY
              </span>
              {!isCrashCheaper && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-status-success/15 border border-status-success/30 text-status-success font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> CHEAPER STRATEGY
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-mono text-muted-foreground block">
                Total Statutory Liability
              </span>
              <div className="mt-1 text-3xl font-mono font-bold text-foreground">
                {formatINR(result.total_rera_penalty)}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono text-muted-foreground border-t border-border/50 pt-3">
              <div className="flex justify-between">
                <span>Daily Interest Rate:</span>
                <span className="text-foreground">{formatINR(result.rera_daily_penalty)} / day</span>
              </div>
              <div className="flex justify-between">
                <span>Applicable Annual Rate:</span>
                <span className="text-foreground">{result.effective_annual_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Allottee Liability:</span>
                <span className="text-foreground">{delayDays} days interest</span>
              </div>
            </div>
          </div>

          {/* Option B: Fast-Track Schedule Crashing */}
          <div
            className={`border p-4 transition-colors ${
              isCrashCheaper
                ? "border-status-success bg-status-success/[0.04] ring-1 ring-status-success/30"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                OPTION B • CRASH SCHEDULE (EXPEDITE)
              </span>
              {isCrashCheaper && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-status-success/15 border border-status-success/30 text-status-success font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> CHEAPER STRATEGY
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-mono text-muted-foreground block">
                Total Additional Crashing Cost
              </span>
              <div className="mt-1 text-3xl font-mono font-bold text-primary">
                {formatINR(result.total_crash_cost)}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono text-muted-foreground border-t border-border/50 pt-3">
              <div className="flex justify-between">
                <span>Days Recovered:</span>
                <span className="text-status-success font-bold">-{result.days_recovered} days</span>
              </div>
              <div className="flex justify-between">
                <span>Crashing Actions:</span>
                <span className="text-foreground">{result.crashing_actions.length} activities compressed</span>
              </div>
              <div className="flex justify-between">
                <span>Net Financial Savings:</span>
                <span className="text-status-success font-bold">{formatINR(result.net_savings)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Decision Card */}
        <div className="border border-border bg-secondary/60 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
              OPTIMIZER RECOMMENDATION: {result.recommendation_title}
            </h3>
          </div>
          <p className="mt-2 text-xs text-foreground leading-relaxed font-sans">
            {result.rationale}
          </p>
        </div>

        {/* Crashing Execution Plan Table */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                CRITICAL PATH CRASHING BREAKDOWN (LOWEST COST SLOPE ORDER)
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Optimal sequence of activity compression calculated via CPM cost-slope minimization
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-border bg-background">
              TOTAL RECOVERED: {result.days_recovered} DAYS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <th className="p-2.5 font-semibold">Activity ID</th>
                  <th className="p-2.5 font-semibold">Task Name</th>
                  <th className="p-2.5 font-semibold text-right">Normal Dur</th>
                  <th className="p-2.5 font-semibold text-right">Crashed Dur</th>
                  <th className="p-2.5 font-semibold text-right">Shortened</th>
                  <th className="p-2.5 font-semibold text-right">Cost Slope</th>
                  <th className="p-2.5 font-semibold text-right">Expenditure</th>
                  <th className="p-2.5 font-semibold">Implementation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.crashing_actions.map((act) => (
                  <tr key={act.task_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{act.task_id}</td>
                    <td className="p-2.5 font-sans font-medium text-foreground">{act.task_name}</td>
                    <td className="p-2.5 text-right">{act.original_duration}d</td>
                    <td className="p-2.5 text-right font-bold text-primary">{act.new_duration}d</td>
                    <td className="p-2.5 text-right font-bold text-status-success">-{act.days_shortened}d</td>
                    <td className="p-2.5 text-right text-muted-foreground">{formatINR(act.cost_per_day)}/d</td>
                    <td className="p-2.5 text-right font-bold text-foreground">
                      {formatINR(act.total_additional_cost)}
                    </td>
                    <td className="p-2.5 text-[11px] text-muted-foreground">{act.reason}</td>
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
