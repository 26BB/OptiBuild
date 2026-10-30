"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import {
  Shield,
  Briefcase,
  Wrench,
  Package,
  Compass,
  Calculator,
  UserCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react"

// Lazy-load CAD blueprint background to eliminate SSR overhead
const BlueprintBackground = dynamic(
  () => import("@/components/ui/BlueprintBackground"),
  { ssr: false }
)

interface RolePreset {
  role: string
  code: string
  title: string
  email: string
  pass: string
  icon: React.ComponentType<{ className?: string }>
  badge: string
  focus: string
}

const DEMO_PRESETS: RolePreset[] = [
  {
    role: "admin",
    code: "ADM",
    title: "System Admin",
    email: "admin@optibuild.io",
    pass: "Admin@123",
    icon: Shield,
    badge: "Full Access",
    focus: "Organization oversight & team roster",
  },
  {
    role: "project_manager",
    code: "PM",
    title: "Project Manager",
    email: "pm@optibuild.io",
    pass: "Pm@123",
    icon: Briefcase,
    badge: "MahaRERA & Schedule",
    focus: "Statutory compliance, WBS & CPM schedule",
  },
  {
    role: "site_engineer",
    code: "ENG",
    title: "Site Engineer",
    email: "site@optibuild.io",
    pass: "Site@123",
    icon: Wrench,
    badge: "Gantt & Photos",
    focus: "Daily site progress, photo logs & drawings",
  },
  {
    role: "store_keeper",
    code: "STR",
    title: "Store Keeper",
    email: "store@optibuild.io",
    pass: "Store@123",
    icon: Package,
    badge: "Materials & Stock",
    focus: "Material receipt, stock verification & invoices",
  },
  {
    role: "architect",
    code: "ARC",
    title: "Lead Architect",
    email: "architect@optibuild.io",
    pass: "Architect@123",
    icon: Compass,
    badge: "Drawings Vault",
    focus: "CAD/PDF blueprint repository (attach only)",
  },
  {
    role: "accountant",
    code: "ACC",
    title: "Accountant",
    email: "accountant@optibuild.io",
    pass: "Accountant@123",
    icon: Calculator,
    badge: "Budget Audits",
    focus: "Spend auditing & Budget vs Actual variance",
  },
  {
    role: "owner",
    code: "OWN",
    title: "Owner / Dev",
    email: "owner@optibuild.io",
    pass: "Owner@123",
    icon: UserCheck,
    badge: "Executive Risk",
    focus: "Delayed penalty exposure & milestones",
  },
]

export default function LoginPage() {
  const { login, register } = useAuth()
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("pm@optibuild.io")
  const [password, setPassword] = useState("Pm@123")
  const [fullName, setFullName] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("project_manager")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (preset: RolePreset) => {
    setSelectedRole(preset.role)
    if (authMode === "signin") {
      setEmail(preset.email)
      setPassword(preset.pass)
    }
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please provide both email and password.")
      return
    }

    if (authMode === "signup" && !fullName.trim()) {
      setError("Please enter your full name.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      if (authMode === "signin") {
        const result = await login(email, password)
        if (!result.success) {
          setError(result.error || "Authentication failed. Verify credentials.")
          setLoading(false)
        }
      } else {
        const result = await register(email, password, fullName.trim(), selectedRole)
        if (!result.success) {
          setError(result.error || "Registration failed. Verify details.")
          setLoading(false)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected network failure."
      setError(msg)
      setLoading(false)
    }
  }

  const activePreset = DEMO_PRESETS.find((p) => p.role === selectedRole)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* 1. Left Technical Brand Hero (Hidden on Mobile < 1024px) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#14181F] text-[#E8ECEF] relative flex-col justify-between p-12 overflow-hidden border-r border-[#283243]">
        {/* CAD Blueprint Grid Background */}
        <div className="hidden md:block motion-reduce:hidden">
          <BlueprintBackground />
        </div>

        {/* Top Brand Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground font-mono font-bold text-base flex items-center justify-center rounded-[4px] shadow-sm">
              OB
            </div>
            <div>
              <div className="font-heading font-bold text-lg tracking-tight text-white flex items-center gap-2">
                OptiBuild <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 border border-primary/40 rounded-[2px]">OS 2.4</span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Site Office Terminal
              </div>
            </div>
          </div>
        </div>

        {/* Center Technical Blueprint Manifesto */}
        <div className="relative z-10 space-y-6 max-w-md my-auto">
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-primary font-semibold uppercase tracking-wider">
              Engineering Intelligence
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-white leading-tight">
              Civil Project Scheduling & Delay Recovery Engine
            </h1>
            <p className="text-xs text-[#8A94A6] leading-relaxed">
              Algorithmic critical path scheduling, statutory MahaRERA compliance safeguarding, and genetic resource leveling built for modern construction leaders.
            </p>
          </div>

          {/* Blueprint Engineering Invariants */}
          <div className="border border-[#283243] bg-[#1A2029]/80 backdrop-blur-sm p-4 rounded-[4px] space-y-2.5 font-mono text-[11px]">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider pb-1 border-b border-[#283243]">
              System Specifications
            </div>
            <div className="flex items-center justify-between text-[#E8ECEF]">
              <span className="text-muted-foreground">Schedule Solver</span>
              <span className="text-primary font-semibold">CPM + RCPSP (Genetic Alg)</span>
            </div>
            <div className="flex items-center justify-between text-[#E8ECEF]">
              <span className="text-muted-foreground">Statutory Framework</span>
              <span>MahaRERA Sec 18 Guard</span>
            </div>
            <div className="flex items-center justify-between text-[#E8ECEF]">
              <span className="text-muted-foreground">Access Control</span>
              <span>7 Role-Gated Workspaces</span>
            </div>
            <div className="flex items-center justify-between text-[#E8ECEF]">
              <span className="text-muted-foreground">Database Engine</span>
              <span className="text-emerald-400">PostgreSQL (Neon) / SQLite</span>
            </div>
          </div>
        </div>

        {/* Bottom Technical Footer */}
        <div className="relative z-10 text-[10px] font-mono text-muted-foreground/60 flex items-center justify-between pt-6 border-t border-[#283243]">
          <span>SPPU CAPSTONE // CE ARCHITECTURE</span>
          <span>STATION // MUMBAI_HQ</span>
        </div>
      </div>

      {/* 2. Right Form & Role Chips Workstation */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-xl space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground font-mono font-bold text-base rounded-[4px] mb-1">
              OB
            </div>
            <h2 className="text-xl font-bold font-heading tracking-tight">OptiBuild Site Engine OS</h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Civil Engineering Scheduling & Control
            </p>
          </div>

          {/* Login / Sign Up Card Panel */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-[4px] shadow-sm space-y-6">
            {/* Auth Mode Switcher */}
            <div className="flex items-center border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin")
                  setError(null)
                  if (!email) {
                    setEmail("pm@optibuild.io")
                    setPassword("Pm@123")
                  }
                }}
                className={`flex-1 pb-3 text-xs font-mono font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  authMode === "signin"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup")
                  setError(null)
                  setPassword("")
                  setEmail("")
                }}
                className={`flex-1 pb-3 text-xs font-mono font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  authMode === "signup"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold font-heading tracking-tight text-foreground">
                {authMode === "signin" ? "Sign In to Site Workstation" : "Register Engineering Profile"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {authMode === "signin"
                  ? "Select your engineering role preset or enter assigned work credentials."
                  : "Create an active user profile and assign your site authority role."}
              </p>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono rounded-[4px]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="full-name"
                    className="block text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-foreground/60 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      required={authMode === "signup"}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="work-email"
                  className="block text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold"
                >
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="work-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@optibuild.io"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-foreground/60 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="work-password"
                    className="block text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold"
                  >
                    Site Access Key (Password)
                  </label>
                  {authMode === "signin" && activePreset && (
                    <span className="text-[10px] font-mono text-primary">
                      Preset loaded
                    </span>
                  )}
                  {authMode === "signup" && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Min 6 chars
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="work-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-foreground/60 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Animated Submit Button with Protected States */}
              <motion.button
                type="submit"
                disabled={loading || !email || !password || (authMode === "signup" && !fullName)}
                whileHover={loading || !email || !password ? {} : { scale: 1.005 }}
                whileTap={loading || !email || !password ? {} : { scale: 0.99 }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-mono text-xs font-semibold rounded-[4px] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none border border-primary/20 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>
                      {authMode === "signin"
                        ? "AUTHENTICATING ROLE AUTHORITY..."
                        : "PROVISIONING WORKSTATION ACCOUNT..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {authMode === "signin"
                        ? `SIGN IN AS ${activePreset ? activePreset.title.toUpperCase() : "AUTHORIZED USER"}`
                        : `REGISTER AS ${activePreset ? activePreset.title.toUpperCase() : "ENGINEER"}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Selectable Role Chips Section */}
            <div className="border-t border-border pt-5 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <span className="font-semibold text-foreground">
                  {authMode === "signin" ? "Selectable Demo Roles" : "Assign Engineering Role"}
                </span>
                <span className="text-[10px] text-primary">
                  {authMode === "signin" ? "1-Click Auto-Fill" : "RBAC Bound"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {DEMO_PRESETS.map((p) => {
                  const isSelected = selectedRole === p.role
                  const Icon = p.icon
                  return (
                    <button
                      key={p.role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleRoleSelect(p)}
                      className={`flex flex-col items-start p-2.5 text-left border rounded-[4px] transition-all relative ${
                        isSelected
                          ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/40"
                          : "bg-muted/30 border-border hover:bg-muted/70 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                      } disabled:opacity-50`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-[9px] font-mono px-1 py-0.2 border rounded-[2px] ${
                          isSelected ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
                        }`}>
                          {p.code}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-foreground truncate w-full">
                        {p.title}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground truncate w-full mt-0.5">
                        {p.badge}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Active Role Explainer Pill */}
              {activePreset && (
                <div className="flex items-center gap-2 p-2 bg-muted/40 border border-border text-[11px] font-mono text-muted-foreground rounded-[4px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    <strong>{activePreset.title} Scope:</strong> {activePreset.focus}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-[10px] font-mono text-muted-foreground/80 space-y-1">
            <div>Protected by OptiBuild RBAC Security Engine • Statutory MahaRERA Enforcement</div>
            <div>Password policy verified: minimum 6 characters with authenticated session tokens</div>
          </div>
        </div>
      </div>
    </div>
  )
}
