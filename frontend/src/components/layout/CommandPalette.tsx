"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  CalendarDays,
  BarChart3,
  TrendingDown,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  PieChart,
  FolderKanban,
  Users,
  Search,
  Sun,
  Moon,
  LogOut,
  Building,
  Check,
} from "lucide-react"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { user, logout, projects, activeProjectId, setActiveProjectId, hasPermission } = useAuth()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onClose()
      } else if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modules = [
    { name: "Projects Overview / Home", href: "/", icon: CalendarDays, roles: ["all"] },
    { name: "MahaRERA Project Registration", href: "/rera-review", icon: FileCheck2, roles: ["admin", "project_manager"] },
    { name: "WBS & Parametric Costing", href: "/wbs", icon: FileSpreadsheet, roles: ["admin", "project_manager"] },
    { name: "Delay Recovery Optimizer", href: "/optimizer", icon: TrendingDown, roles: ["admin", "project_manager"] },
    { name: "GA vs CP-SAT Benchmark", href: "/benchmark", icon: BarChart3, roles: ["admin", "project_manager"] },
    { name: "Material Log & Receipts", href: "/materials", icon: Receipt, roles: ["admin", "store_keeper", "accountant", "site_engineer"] },
    { name: "Budget vs Actual Analytics", href: "/dashboard", icon: PieChart, roles: ["admin", "accountant", "owner", "project_manager"] },
    { name: "Architectural Drawings Vault", href: "/drawings", icon: FolderKanban, roles: ["admin", "architect", "project_manager", "site_engineer"] },
    { name: "User Roster & Team Mgmt", href: "/admin", icon: Users, roles: ["admin"] },
  ].filter((m) => m.roles.includes("all") || (user && (user.role === "admin" || m.roles.includes(user.role))))

  const filteredModules = modules.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.rera_registration_no && p.rera_registration_no.toLowerCase().includes(query.toLowerCase()))
  )

  const handleNavigate = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId)
    onClose()
  }

  const handleToggleTheme = () => {
    document.documentElement.classList.toggle("dark")
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Navigation Palette"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-[4px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3 border-b border-border bg-muted/20">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a module, project, or action... (Esc to close)"
            className="w-full py-3 text-xs font-mono bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-secondary px-1.5 py-0.5 border border-border text-muted-foreground rounded-[2px]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border p-2 space-y-2">
          {/* Modules Group */}
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1 tracking-wider font-semibold">
              Permitted Modules
            </div>
            <div className="space-y-0.5">
              {filteredModules.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.href}
                    type="button"
                    onClick={() => handleNavigate(m.href)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs font-sans text-foreground hover:bg-secondary rounded-[2px] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span>{m.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Projects Group */}
          {filteredProjects.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1 tracking-wider font-semibold">
                Switch Project
              </div>
              <div className="space-y-0.5">
                {filteredProjects.slice(0, 5).map((p) => {
                  const isActive = p.id === activeProjectId
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProject(p.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-xs rounded-[2px] transition-colors ${
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-muted-foreground">
                        <span>{p.rera_registration_no || "No RERA"}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 space-y-0.5">
            <div className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1 tracking-wider font-semibold">
              Quick Actions
            </div>
            <button
              type="button"
              onClick={handleToggleTheme}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-secondary rounded-[2px] transition-colors"
            >
              <Sun className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>Toggle Blueprint Paper / Dark Terminal Theme</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                onClose()
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10 rounded-[2px] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out of Site Session</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-muted/40 text-[10px] font-mono text-muted-foreground flex items-center justify-between px-3">
          <span>NAVIGATION // OPTIBUILD SHORTCUT</span>
          <span>PRESS &apos;CTRL+K&apos; TO OPEN</span>
        </div>
      </div>
    </div>
  )
}
