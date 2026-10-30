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
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  FolderKanban,
  FileUp,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Building,
  Check,
  Bug,
  LogIn,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { FeedbackModal } from "@/components/feedback/FeedbackModal"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
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
    name: "WBS & Costing",
    href: "/wbs",
    icon: FileSpreadsheet,
    roles: ["admin", "project_manager"],
  },
  {
    name: "Recovery Optimizer",
    href: "/optimizer",
    icon: TrendingDown,
    roles: ["admin", "project_manager"],
  },
  {
    name: "Solver Benchmark",
    href: "/benchmark",
    icon: BarChart3,
    roles: ["admin", "project_manager"],
  },
  {
    name: "Material & Photos",
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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const { user, logout, projects, activeProjectId, activeProject, setActiveProjectId } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [projectSearch, setProjectSearch] = useState("")

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

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.rera_registration_no && p.rera_registration_no.toLowerCase().includes(projectSearch.toLowerCase()))
  )

  return (
    <aside
      className={cn(
        "border-r border-border bg-card/90 backdrop-blur-sm flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 transition-all duration-200 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand & Collapse Header */}
        <div className="p-3.5 border-b border-border flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center text-primary-foreground font-mono font-bold text-xs tracking-wider shrink-0 shadow-xs">
              OB
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-heading font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                  OptiBuild
                  <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-secondary border border-border text-muted-foreground rounded-[2px]">
                    OS
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  Site Engine
                </div>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 border border-border hover:bg-secondary rounded-[2px] text-muted-foreground hover:text-foreground transition-colors ml-auto hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Project Switcher Combobox */}
        {!isCollapsed ? (
          <div className="p-3 border-b border-border bg-muted/30 relative shrink-0">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="font-semibold text-foreground">Project Selector</span>
              {projects.length > 0 && (
                <span className="text-[9px] text-primary font-mono">{projects.length} loaded</span>
              )}
            </div>

            {projects.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-card border border-border text-foreground hover:bg-muted/70 transition-colors text-left rounded-[4px]"
                >
                  <div className="truncate pr-1">
                    <div className="font-medium text-xs truncate">{activeProject?.name || "Select Project"}</div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      {activeProject?.rera_registration_no || "Registration Pending"}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>

                {showProjectDropdown && (
                  <div className="absolute left-0 right-0 top-14 bg-card border border-border shadow-xl z-50 rounded-[4px] overflow-hidden divide-y divide-border">
                    {/* Search inside project combobox */}
                    <div className="p-2 bg-muted/30 flex items-center gap-1.5 border-b border-border">
                      <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        placeholder="Search project..."
                        className="w-full text-[11px] font-mono bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-border/60">
                      {filteredProjects.map((p) => {
                        const isSelected = p.id === activeProjectId
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setActiveProjectId(p.id)
                              setShowProjectDropdown(false)
                            }}
                            className={cn(
                              "w-full px-2.5 py-2 text-left text-xs transition-colors hover:bg-secondary flex items-center justify-between",
                              isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                            )}
                          >
                            <div className="truncate pr-1">
                              <div className="truncate text-xs">{p.name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">
                                {p.rera_registration_no || "MahaRERA"}
                              </div>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-2.5 py-2 bg-card border border-dashed border-border text-center rounded-[4px]">
                <div className="text-[11px] font-mono text-muted-foreground">No Projects Created</div>
                {(user?.role === "project_manager" || user?.role === "admin") && (
                  <Link
                    href="/rera-review"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
                  >
                    <FileUp className="w-3 h-3" />
                    <span>Upload MahaRERA PDF</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 border-b border-border flex justify-center" title={activeProject?.name || "Active Project"}>
            <Building className="w-4 h-4 text-primary" />
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-2 space-y-0.5 overflow-y-auto flex-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
              Site Workspaces
            </div>
          )}
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 text-xs transition-colors rounded-[4px] border font-sans",
                  isActive
                    ? "bg-primary/10 text-primary font-medium border-primary/30"
                    : "text-foreground hover:bg-secondary/70 border-transparent",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!isCollapsed && item.tag && (
                  <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-primary/10 text-primary border border-primary/20 rounded-[2px]">
                    {item.tag}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Telemetry & Feedback Quick Action */}
      <div className="px-2 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsFeedbackOpen(true)}
          title={isCollapsed ? "Report Bug / Feedback Telemetry" : undefined}
          className={cn(
            "w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors rounded-[4px] border border-border/60 bg-muted/20 hover:bg-secondary text-foreground font-sans",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Bug className="w-3.5 h-3.5 text-primary shrink-0" />
            {!isCollapsed && <span className="truncate text-[11px] font-mono">Report Bug / Feedback</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-primary/10 text-primary border border-primary/20 rounded-[2px]">
              DIAG
            </span>
          )}
        </button>
      </div>

      {/* User Profile & Theme Toggle Footer */}
      <div className="p-3 border-t border-border bg-muted/20 space-y-2 shrink-0">
        {user && !isCollapsed && (
          <div className="p-2.5 border border-border bg-card flex items-center justify-between rounded-[4px]">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold truncate text-foreground">{user.full_name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-primary/10 text-primary border border-primary/20 rounded-[2px]">
                  {user.role.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              type="button"
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors rounded-[2px]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {user && isCollapsed && (
          <div className="flex justify-center">
            <button
              onClick={logout}
              title={`Sign Out (${user.full_name})`}
              type="button"
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border hover:border-destructive/30 transition-colors rounded-[2px]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!user && (
          <div className="flex justify-center">
            <Link
              href="/login"
              title="Sign In"
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-primary text-primary-foreground font-mono text-xs font-semibold rounded-[4px] hover:bg-primary/90 transition-colors",
                isCollapsed && "px-0 w-8 h-8"
              )}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span>Sign In</span>}
            </Link>
          </div>
        )}

        <div className={cn("flex items-center justify-between text-xs", isCollapsed && "justify-center")}>
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {isDark ? "Carbon Terminal" : "Parchment Blueprint"}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="p-1 border border-border hover:bg-secondary transition-colors rounded-[2px]"
            title="Toggle Blueprint / Dark Theme"
            type="button"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </aside>
  )
}
