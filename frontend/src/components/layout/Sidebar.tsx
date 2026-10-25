"use client"

import React, { useState } from "react"
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
  LogOut,
  FolderKanban,
  FileUp,
  ShieldAlert,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface NavItem {
  name: string
  href: string
  icon: any
  tag?: string
  roles: string[]
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    name: "Gantt Schedule",
    href: "/",
    icon: CalendarDays,
    tag: "HERO",
    roles: ["admin", "project_manager", "site_engineer"],
  },
  {
    name: "MahaRERA Review",
    href: "/rera-review",
    icon: FileCheck2,
    tag: "SETUP",
    roles: ["admin", "project_manager"],
  },
  {
    name: "WBS & Cost Estimation",
    href: "/wbs",
    icon: FileSpreadsheet,
    roles: ["admin", "project_manager"],
  },
  {
    name: "Penalty vs Crash Cost",
    href: "/optimizer",
    icon: TrendingDown,
    roles: ["admin", "project_manager"],
  },
  {
    name: "GA vs CP-SAT Benchmark",
    href: "/benchmark",
    icon: BarChart3,
    roles: ["admin", "project_manager"],
  },
  {
    name: "Material & Cost Log",
    href: "/materials",
    icon: Receipt,
    roles: ["admin", "store_keeper", "accountant", "site_engineer"],
  },
  {
    name: "Budget vs Actual",
    href: "/dashboard",
    icon: PieChart,
    roles: ["admin", "accountant", "owner", "project_manager"],
  },
  {
    name: "Drawing Vault",
    href: "/drawings",
    icon: FolderKanban,
    tag: "CAD",
    roles: ["admin", "architect", "project_manager", "site_engineer"],
  },
  {
    name: "User & Team Mgmt",
    href: "/admin",
    icon: Users,
    roles: ["admin"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, projects, activeProjectId, activeProject, setActiveProjectId } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  // Filter navigation items by role permissions
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (!user) return false
    if (user.role === "admin") return true
    return item.roles.includes(user.role)
  })

  return (
    <aside className="w-64 border-r border-border bg-card/70 flex flex-col justify-between shrink-0 select-none h-screen sticky top-0">
      <div className="flex flex-col min-h-0">
        {/* Site Header / Project Brand */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-none flex items-center justify-center text-primary-foreground font-mono font-bold text-xs tracking-wider">
              OB
            </div>
            <div>
              <div className="font-heading font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                OptiBuild
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-secondary border border-border text-muted-foreground">
                  RBAC
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">SITE ENGINE OS</div>
            </div>
          </div>
        </div>

        {/* Project Switcher */}
        <div className="p-3 border-b border-border bg-muted/40 relative shrink-0">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Active Project</span>
            {projects.length > 0 && (
              <span className="text-[9px] text-primary font-mono">{projects.length} available</span>
            )}
          </div>

          {projects.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-card border border-border text-foreground hover:bg-muted/70 transition-colors text-left"
              >
                <div className="truncate">
                  <div className="font-medium truncate">{activeProject?.name || "Select Project"}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {activeProject?.rera_registration_no || "No RERA No"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
              </button>

              {showProjectDropdown && (
                <div className="absolute left-3 right-3 top-16 bg-card border border-border shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-border">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActiveProjectId(p.id)
                        setShowProjectDropdown(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-secondary/70",
                        p.id === activeProjectId ? "bg-secondary text-primary font-medium" : "text-foreground"
                      )}
                    >
                      <div className="truncate">{p.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {p.rera_registration_no || "Registered Project"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="px-2.5 py-2 bg-card border border-dashed border-border text-center">
              <div className="text-[11px] font-mono text-muted-foreground">No Projects in DB</div>
              {(user?.role === "project_manager" || user?.role === "admin") && (
                <Link
                  href="/rera-review"
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
                >
                  <FileUp className="w-3 h-3" />
                  <span>Upload MahaRERA PDF</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-0.5 overflow-y-auto flex-1">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            Permitted Modules
          </div>
          {visibleNavItems.map((item) => {
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

      {/* User Profile & Footer Info */}
      <div className="p-3 border-t border-border bg-muted/30 space-y-2 shrink-0">
        {user && (
          <div className="p-2 border border-border bg-card flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold truncate text-foreground">{user.full_name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-primary/10 text-primary border border-primary/20">
                  {user.role.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout of OptiBuild"
              type="button"
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] font-mono text-muted-foreground">
            Theme: {isDark ? "Dark Office" : "Paper Blueprint"}
          </span>
          <button
            onClick={toggleTheme}
            className="p-1 border border-border hover:bg-secondary transition-colors"
            title="Toggle Blueprint / Dark Theme"
            type="button"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
