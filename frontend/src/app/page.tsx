"use client"

import React, { useState } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { GanttSchedule, ScheduleTask } from "@/components/schedule/GanttSchedule"
import { RecoverySidePanel } from "@/components/optimizer/RecoverySidePanel"
import {
  Calendar,
  Layers,
  AlertTriangle,
  Users,
  CheckCircle2,
  HardHat,
  Activity,
  ArrowRight,
} from "lucide-react"

// Sample realistic G+14 residential construction schedule
const DEFAULT_TASKS: ScheduleTask[] = [
  {
    id: "T01",
    name: "Site Excavation & Pile Foundation",
    duration: 18,
    start_day: 0,
    finish_day: 18,
    is_critical: true,
    resource_demands: { labor: 15, excavator: 2 },
    predecessors: [],
  },
  {
    id: "T02",
    name: "Basement Raft Concrete Casting",
    duration: 14,
    start_day: 18,
    finish_day: 32,
    is_critical: true,
    resource_demands: { labor: 24, pump: 2 },
    predecessors: ["T01"],
  },
  {
    id: "T03",
    name: "Plumbing Underground Invert Drain",
    duration: 8,
    start_day: 32,
    finish_day: 40,
    is_critical: false,
    resource_demands: { labor: 6, excavator: 0 },
    predecessors: ["T02"],
  },
  {
    id: "T04",
    name: "Podium Level 1-2 RCC Columns",
    duration: 16,
    start_day: 32,
    finish_day: 48,
    is_critical: true,
    resource_demands: { labor: 20, crane: 1 },
    predecessors: ["T02"],
  },
  {
    id: "T05",
    name: "Tower Core Shear Walls (Floors 1-7)",
    duration: 25,
    start_day: 48,
    finish_day: 73,
    is_critical: true,
    resource_demands: { labor: 22, crane: 1 },
    predecessors: ["T04"],
  },
  {
    id: "T06",
    name: "External Masonry Blockwork (Lower)",
    duration: 15,
    start_day: 55,
    finish_day: 70,
    is_critical: false,
    resource_demands: { labor: 14, hoist: 1 },
    predecessors: ["T04"],
  },
  {
    id: "T07",
    name: "Tower Core Shear Walls (Floors 8-14)",
    duration: 28,
    start_day: 73,
    finish_day: 101,
    is_critical: true,
    resource_demands: { labor: 25, crane: 1 },
    predecessors: ["T05"],
  },
  {
    id: "T08",
    name: "MEP Rough-in & Firefighting Risers",
    duration: 16,
    start_day: 70,
    finish_day: 86,
    is_critical: false,
    resource_demands: { labor: 10, welder: 2 },
    predecessors: ["T06"],
  },
  {
    id: "T09",
    name: "Internal Gypsum Plaster & Screed",
    duration: 20,
    start_day: 86,
    finish_day: 106,
    is_critical: false,
    resource_demands: { labor: 18 },
    predecessors: ["T08"],
  },
  {
    id: "T10",
    name: "Terrace Waterproofing & Final Handover",
    duration: 12,
    start_day: 101,
    finish_day: 113,
    is_critical: true,
    resource_demands: { labor: 12 },
    predecessors: ["T07", "T09"],
  },
]

export default function HomePage() {
  const [tasks, setTasks] = useState<ScheduleTask[]>(DEFAULT_TASKS)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const criticalTasksCount = tasks.filter((t) => t.is_critical).length
  const totalMakespan = Math.max(...tasks.map((t) => t.finish_day), 0)
  const unconstrainedCpmDays = 99
  const delayRiskDays = Math.max(0, totalMakespan - unconstrainedCpmDays)

  const handleRunOptimizer = async () => {
    setIsOptimizing(true)
    try {
      // Simulate/call backend API
      const res = await fetch("http://localhost:8000/api/v1/schedule/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: "Tower-A Residential (G+14)",
          tasks: tasks.map((t) => ({
            id: t.id,
            name: t.name,
            duration: t.duration,
            predecessors: t.predecessors,
            resource_demands: t.resource_demands,
          })),
          resource_limits: { labor: 35, crane: 1, pump: 2 },
          ga_population_size: 40,
          ga_generations: 40,
        }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        if (data.ga && data.ga.schedule) {
          setTasks(data.ga.schedule)
        }
      }
    } finally {
      setTimeout(() => setIsOptimizing(false), 600)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName="Tower-A Residential (G+14) • SPPU Site"
        delayRiskDays={delayRiskDays}
        onRecalculate={handleRunOptimizer}
        isOptimizing={isOptimizing}
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Metric Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                GA Makespan
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
              CPM Lower Bound: {unconstrainedCpmDays}d
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Resource Delay
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
              Tower crane bottleneck (limit: 1)
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
                Peak Labor
              </span>
              <Users className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-foreground">32</span>
              <span className="text-xs font-mono text-muted-foreground">men / day</span>
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Limit cap: 35 men
            </div>
          </div>
        </div>

        {/* Hero Section: Gantt Chart + Recovery Comparison Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Gantt View (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <GanttSchedule tasks={tasks} />

            {/* Critical Path Flow Strip */}
            <div className="border border-border bg-card p-3 font-mono text-xs">
              <div className="text-[10px] uppercase text-muted-foreground mb-1.5 font-bold">
                CRITICAL PATH SEQUENCE (ZERO TOTAL FLOAT)
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {tasks
                  .filter((t) => t.is_critical)
                  .map((t, idx, arr) => (
                    <React.Fragment key={t.id}>
                      <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary font-bold text-[11px]">
                        {t.id}: {t.name} ({t.duration}d)
                      </span>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>

          {/* Recovery Side Panel (4 Cols) */}
          <div className="lg:col-span-4">
            <RecoverySidePanel
              delayDays={delayRiskDays}
              penaltyCost={485000}
              crashCost={210000}
              crashedDaysRecovered={delayRiskDays}
              interestRateAnnual={10.85}
            />
          </div>
        </div>

        {/* Dense Engineering Data Table */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                SCHEDULE ACTIVITY BREAKDOWN & FLOAT REGISTER
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                All durations in calendar days • Resource demand per 8-hour shift
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-border bg-background">
              TOTAL: {tasks.length} ACTIVITIES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <th className="p-2.5 font-semibold">WBS ID</th>
                  <th className="p-2.5 font-semibold">Activity Name</th>
                  <th className="p-2.5 font-semibold text-right">Dur</th>
                  <th className="p-2.5 font-semibold text-right">Start</th>
                  <th className="p-2.5 font-semibold text-right">Finish</th>
                  <th className="p-2.5 font-semibold">Status</th>
                  <th className="p-2.5 font-semibold">Predecessors</th>
                  <th className="p-2.5 font-semibold">Daily Resources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      task.is_critical ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <td className="p-2.5 font-bold text-foreground">
                      {task.id}
                    </td>
                    <td className="p-2.5 font-sans font-medium text-foreground">
                      {task.name}
                    </td>
                    <td className="p-2.5 text-right">{task.duration}d</td>
                    <td className="p-2.5 text-right font-medium">{task.start_day}</td>
                    <td className="p-2.5 text-right font-medium">{task.finish_day}</td>
                    <td className="p-2.5">
                      {task.is_critical ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold px-1.5 py-0.2 border border-primary/40 bg-primary/10">
                          CRITICAL PATH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground px-1.5 py-0.2 border border-border bg-muted/40">
                          FLOAT BUFFER
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-muted-foreground">
                      {task.predecessors.length > 0
                        ? task.predecessors.join(", ")
                        : "—"}
                    </td>
                    <td className="p-2.5 text-[11px] text-muted-foreground">
                      {Object.entries(task.resource_demands)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(" | ") || "—"}
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
