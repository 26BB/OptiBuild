"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  BarChart3,
  TrendingDown,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  PieChart,
  HardHat,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    name: "Gantt Schedule",
    href: "/",
    icon: CalendarDays,
    tag: "HERO",
  },
  {
    name: "GA vs CP-SAT Benchmark",
    href: "/benchmark",
    icon: BarChart3,
  },
  {
    name: "Penalty vs Crash Cost",
    href: "/optimizer",
    icon: TrendingDown,
  },
  {
    name: "WBS & Cost Estimation",
    href: "/wbs",
    icon: FileSpreadsheet,
  },
  {
    name: "MahaRERA Form Draft",
    href: "/rera-review",
    icon: FileCheck2,
  },
  {
    name: "Material & Cost Log",
    href: "/materials",
    icon: Receipt,
  },
  {
    name: "Budget vs Actual",
    href: "/dashboard",
    icon: PieChart,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isDark, setIsDark] = React.useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <aside className="w-64 border-r border-border bg-card/60 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Site Header / Project Brand */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-none flex items-center justify-center text-primary-foreground font-mono font-bold text-xs tracking-wider">
              OB
            </div>
            <div>
              <div className="font-heading font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                OptiBuild
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-secondary border border-border text-muted-foreground">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">SITE ENGINE OS</div>
            </div>
          </div>
        </div>

        {/* Project Switcher */}
        <div className="p-3 border-b border-border bg-muted/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
            Active Project
          </div>
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-card border border-border text-foreground hover:bg-muted/70 transition-colors text-left">
            <div className="truncate">
              <div className="font-medium truncate">Tower-A (G+14)</div>
              <div className="text-[10px] font-mono text-muted-foreground">P52100018921 • SPPU Site</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-0.5">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            Control Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 text-xs transition-colors rounded-none border border-transparent font-sans",
                  isActive
                    ? "bg-secondary text-primary font-medium border-border"
                    : "text-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.tag && (
                  <span className="text-[9px] font-mono uppercase px-1 py-0.5 bg-primary/10 text-primary border border-primary/20">
                    {item.tag}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Info & Dark Mode Toggle */}
      <div className="p-3 border-t border-border bg-muted/20 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-muted-foreground">Mode: {isDark ? "Dark Office" : "Paper Blueprint"}</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 border border-border hover:bg-secondary transition-colors"
            title="Toggle Blueprint / Dark Theme"
            type="button"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground border-t border-border/50 pt-2 flex items-center justify-between">
          <span>CPM • GA RCPSP</span>
          <span className="text-status-success font-medium">READY</span>
        </div>
      </div>
    </aside>
  )
}
