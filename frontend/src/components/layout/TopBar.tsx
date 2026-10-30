"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  Menu,
  X,
  ChevronRight,
  Shield,
  Briefcase,
  Wrench,
  Package,
  Compass,
  Calculator,
  UserCheck,
  Bug,
  LogOut,
  LogIn,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { FeedbackModal } from "@/components/feedback/FeedbackModal"

interface TopBarProps {
  projectName?: string
  delayRiskDays?: number
  completionDate?: string
  reraNo?: string
  onRecalculate?: () => void
  isOptimizing?: boolean
}

const ROUTE_NAME_MAP: Record<string, string> = {
  "/": "Gantt Schedule",
  "/rera-review": "MahaRERA Registration",
  "/wbs": "WBS & Costing",
  "/optimizer": "Delay Recovery",
  "/benchmark": "Solver Benchmark",
  "/materials": "Materials & Photos",
  "/dashboard": "Budget vs Actual",
  "/drawings": "Drawing Vault",
  "/admin": "Admin & Team Roster",
}

export function TopBar({
  projectName,
  delayRiskDays,
  completionDate,
  reraNo,
  onRecalculate,
  isOptimizing = false,
}: TopBarProps) {
  const pathname = usePathname()
  const { activeProject, user, logout } = useAuth()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const displayName = projectName || activeProject?.name || "Active Workspace"
  const delayDays = delayRiskDays !== undefined ? delayRiskDays : activeProject?.delay_days || 0
  const isDelayed = delayDays > 0
  const displayRera = reraNo || activeProject?.rera_registration_no || "RERA-PENDING"
  const currentModuleName = ROUTE_NAME_MAP[pathname] || "Workspace"

  return (
    <>
      <header className="h-13 border-b border-border bg-card/85 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left: Mobile Toggle & Dynamic Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 border border-border hover:bg-secondary rounded-[2px] text-muted-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Projects
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 hidden sm:inline shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-xs font-heading">
              {displayName}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="text-primary font-medium px-1.5 py-0.2 bg-primary/10 border border-primary/20 rounded-[2px] text-[10px]">
              {currentModuleName}
            </span>
          </nav>

          {/* Delay Risk Indicator Pill */}
          {activeProject && (
            isDelayed ? (
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 border border-destructive/40 bg-destructive/10 text-destructive text-[10px] font-mono font-medium rounded-[2px]">
                <AlertTriangle className="w-3 h-3" />
                <span>DELAY: +{delayDays}D</span>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 border border-status-success/40 bg-status-success/10 text-status-success text-[10px] font-mono font-medium rounded-[2px]">
                <Clock className="w-3 h-3" />
                <span>ON SCHEDULE</span>
              </div>
            )
          )}
        </div>

        {/* Right: Command Palette, Optimizer Action & User Pill */}
        <div className="flex items-center gap-2.5">
          {/* Telemetry Bug & Feedback Trigger */}
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-[4px] transition-colors"
            title="Workstation Feedback / Report Bug"
            aria-label="Feedback / Report Bug"
          >
            <Bug className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xl:inline text-[11px]">Report Bug</span>
          </button>

          {/* Global Command Palette Trigger (Ctrl+K) */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-[4px] transition-colors"
            title="Global Navigation Search"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="hidden md:inline text-[11px]">Search Workstation...</span>
            <kbd className="text-[9px] font-mono bg-secondary px-1 py-0.2 border border-border text-muted-foreground rounded-[2px]">
              Ctrl+K
            </kbd>
          </button>

          {/* Recalculate / Solver Action */}
          {onRecalculate && (
            <button
              onClick={onRecalculate}
              disabled={isOptimizing}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 border border-primary/20 rounded-[4px] shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isOptimizing ? "SOLVING GA..." : "RUN OPTIMIZER"}</span>
            </button>
          )}

          {/* Active User Authority Badge & In-App Sign In / Out */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border text-[11px] font-mono">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-muted-foreground truncate max-w-[110px]" title={user.email}>{user.full_name}</span>
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-[2px] uppercase text-[9px] font-semibold">
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out of workstation"
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/80 hover:border-destructive/30 rounded-[2px] transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 rounded-[4px] shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Mobile Drawer Navigation (When hamburger is clicked) */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden flex"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-card border-r border-border h-full p-4 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white font-mono text-xs flex items-center justify-center rounded-[2px]">
                    OB
                  </div>
                  OptiBuild Mobile Menu
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold px-2">
                  Workspaces
                </div>
                {Object.entries(ROUTE_NAME_MAP).map(([href, name]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-2.5 py-2 text-xs rounded-[4px] transition-colors ${
                      pathname === href ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>

            {user && (
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="truncate pr-2">
                  <div className="text-xs font-semibold truncate text-foreground">{user.full_name}</div>
                  <div className="text-[10px] font-mono text-primary uppercase">{user.role}</div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2 py-1 text-[11px] font-mono text-destructive border border-destructive/30 rounded-[2px]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  )
}
