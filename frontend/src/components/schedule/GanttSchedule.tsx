"use client"

import React from "react"
import dynamic from "next/dynamic"
import "gantt-task-react/dist/index.css"
import { Task, ViewMode } from "gantt-task-react"

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

export function GanttSchedule({
  tasks,
  projectStartDate = new Date(2026, 0, 5),
}: GanttScheduleProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day)

  const ganttTasks: Task[] = React.useMemo(() => {
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
          backgroundColor: t.is_critical ? "#e8590c" : "#7c8594",
          backgroundSelectedColor: t.is_critical ? "#c92a2a" : "#4a5568",
          progressColor: "#1c2024",
          progressSelectedColor: "#14181f",
        },
      }
    })
  }, [tasks, projectStartDate])

  if (ganttTasks.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border text-muted-foreground font-mono text-xs">
        No task timeline available. Run the GA optimizer to generate schedule.
      </div>
    )
  }

  return (
    <div className="border border-border bg-card">
      <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">GANTT TIMELINE</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 bg-[#e8590c] inline-block" />
            <span className="text-foreground">Critical Path</span>
            <span className="w-2.5 h-2.5 bg-[#7c8594] inline-block ml-2" />
            <span className="text-muted-foreground">Float Activity</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-1 text-[11px]">Zoom:</span>
          {(["Day", "Week", "Month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(ViewMode[mode])}
              className={`px-2 py-0.5 text-[10px] border font-mono transition-colors ${
                viewMode === ViewMode[mode]
                  ? "bg-secondary border-primary text-primary font-bold"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto p-1 font-mono text-xs min-h-[300px]">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          columnWidth={viewMode === ViewMode.Month ? 180 : viewMode === ViewMode.Week ? 100 : 45}
          listCellWidth="220px"
          rowHeight={36}
          barCornerRadius={2}
          fontSize="11px"
        />
      </div>
    </div>
  )
}
