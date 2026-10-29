"use client"

import React, { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import "gantt-task-react/dist/index.css"
import { Task, ViewMode } from "gantt-task-react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Calendar,
  Clock,
  Activity,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react"

// Dynamically import Gantt to prevent Next.js SSR window/document reference issues
const Gantt = dynamic(
  () => import("gantt-task-react").then((mod) => mod.Gantt),
  { ssr: false }
)

export interface ScheduleTask {
  id: string
  name: string
  duration: number
  start_day: number
  finish_day: number
  is_critical: boolean
  resource_demands: Record<string, number>
  predecessors: string[]
}

interface GanttScheduleProps {
  tasks: ScheduleTask[]
  projectStartDate?: Date
}

interface CustomTooltipProps {
  task: Task
  fontSize: string
  fontFamily: string
}

export function GanttSchedule({
  tasks,
  projectStartDate = new Date(2026, 0, 5),
}: GanttScheduleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const shouldReduceMotion = useReducedMotion()

  // Map to fast lookup for schedule task metadata in tooltips
  const taskMap = useMemo(() => {
    const map = new Map<string, ScheduleTask>()
    tasks.forEach((t) => map.set(t.id, t))
    return map
  }, [tasks])

  const ganttTasks: Task[] = useMemo(() => {
    if (!tasks || tasks.length === 0) return []

    return tasks.map((t) => {
      const start = new Date(projectStartDate)
      start.setDate(start.getDate() + t.start_day)

      const end = new Date(projectStartDate)
      end.setDate(end.getDate() + Math.max(t.start_day + 1, t.finish_day))

      return {
        start,
        end,
        name: `${t.id} - ${t.name}`,
        id: t.id,
        type: "task",
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: t.is_critical ? "#e8590c" : "#5c6470",
          backgroundSelectedColor: t.is_critical ? "#c92a2a" : "#414750",
          progressColor: "#1c2024",
          progressSelectedColor: "#14181f",
        },
      }
    })
  }, [tasks, projectStartDate])

  // Custom high-precision tooltip rendered on bar hover
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ task }) => {
    const rawTask = taskMap.get(task.id)
    if (!rawTask) return null

    const startStr = task.start.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    const endStr = task.end.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

    const laborDemand = rawTask.resource_demands?.labor ?? 12
    const craneDemand = rawTask.resource_demands?.crane ?? 0

    return (
      <div className="bg-card text-foreground p-3 border border-border rounded-[4px] shadow-lg font-mono text-xs max-w-xs space-y-2 select-none pointer-events-none">
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-1.5">
          <div>
            <span className="font-bold text-primary">{rawTask.id}</span>
            <h4 className="font-sans font-semibold text-xs leading-snug line-clamp-2">
              {rawTask.name}
            </h4>
          </div>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded-[2px] shrink-0 ${
              rawTask.is_critical
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {rawTask.is_critical ? "CRITICAL (0 FLOAT)" : "FLOAT"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-muted-foreground block text-[10px]">Start Date:</span>
            <span className="font-medium">{startStr}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Finish Date:</span>
            <span className="font-medium">{endStr}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Duration:</span>
            <span className="font-bold">{rawTask.duration} Days</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Predecessors:</span>
            <span className="truncate block">
              {rawTask.predecessors.length > 0 ? rawTask.predecessors.join(", ") : "None (Root)"}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-primary" />
            <span>Labor: {laborDemand}</span>
          </span>
          {craneDemand > 0 && (
            <span className="flex items-center gap-1 text-primary font-bold">
              <span>Crane: {craneDemand}</span>
            </span>
          )}
          <span>Days {rawTask.start_day} → {rawTask.finish_day}</span>
        </div>
      </div>
    )
  }

  if (ganttTasks.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border text-muted-foreground font-mono text-xs rounded-[4px] bg-card/40">
        No task timeline available. Run the GA optimizer to generate schedule.
      </div>
    )
  }

  const content = (
    <div className="border border-border bg-card rounded-[4px] shadow-2xs overflow-hidden">
      {/* Timeline Controls & Legend Toolbar */}
      <div className="px-3.5 py-2.5 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-[11px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Schedule Legend:</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-3 h-2.5 bg-[#e8590c] rounded-[1px] inline-block shadow-2xs" />
            <span className="font-semibold text-foreground">Critical Path</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-3 h-2.5 bg-[#5c6470] rounded-[1px] inline-block shadow-2xs" />
            <span className="text-muted-foreground">Float Activity</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-3 h-2.5 bg-[#2b8a3e] rounded-[1px] inline-block shadow-2xs" />
            <span className="text-muted-foreground">Handover Milestone</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-3 h-2.5 bg-[#0077b6] rounded-[1px] inline-block shadow-2xs" />
            <span className="text-muted-foreground">Weather Buffer</span>
          </div>
        </div>

        {/* Right: Zoom Toggle Group */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[11px] uppercase tracking-wider">Timeline Zoom:</span>
          <div className="inline-flex items-center p-0.5 bg-secondary border border-border rounded-[3px]">
            {(["Day", "Week", "Month"] as const).map((mode) => {
              const isSelected = viewMode === ViewMode[mode]
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(ViewMode[mode])}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-all ${
                    isSelected
                      ? "bg-card text-primary font-bold shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {mode}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Gantt Interactive Canvas */}
      <div className="overflow-x-auto p-1 font-mono text-xs min-h-[340px]">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          columnWidth={viewMode === ViewMode.Month ? 180 : viewMode === ViewMode.Week ? 100 : 45}
          listCellWidth="230px"
          rowHeight={36}
          barCornerRadius={2}
          fontSize="11px"
          TooltipContent={CustomTooltip}
        />
      </div>
    </div>
  )

  if (shouldReduceMotion) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  )
}
