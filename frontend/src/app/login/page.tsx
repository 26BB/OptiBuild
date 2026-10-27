"use client"

import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  HardHat,
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
} from "lucide-react"

const DEMO_PRESETS = [
  {
    role: "admin",
    title: "System Administrator",
    email: "admin@optibuild.io",
    pass: "Admin@123",
    icon: Shield,
    badge: "All Modules & User Mgmt",
  },
  {
    role: "project_manager",
    title: "Project Manager",
    email: "pm@optibuild.io",
    pass: "Pm@123",
    icon: Briefcase,
    badge: "MahaRERA, WBS & Schedule",
  },
  {
    role: "site_engineer",
    title: "Site Engineer",
    email: "site@optibuild.io",
    pass: "Site@123",
    icon: Wrench,
    badge: "Gantt Progress & Site Photos",
  },
  {
    role: "store_keeper",
    title: "Store Keeper",
    email: "store@optibuild.io",
    pass: "Store@123",
    icon: Package,
    badge: "Material Logs & Receipts",
  },
  {
    role: "architect",
    title: "Lead Architect",
    email: "architect@optibuild.io",
    pass: "Architect@123",
    icon: Compass,
    badge: "CAD/PDF Drawing Vault",
  },
  {
    role: "accountant",
    title: "Project Accountant",
    email: "accountant@optibuild.io",
    pass: "Accountant@123",
    icon: Calculator,
    badge: "Budget vs Actual Analytics",
  },
  {
    role: "owner",
    title: "Owner / Developer",
    email: "owner@optibuild.io",
    pass: "Owner@123",
    icon: UserCheck,
    badge: "Executive Risk & Penalties",
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setError(null)
    setLoading(true)
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Login failed.")
      setLoading(false)
    }
  }

  const handleQuickLogin = async (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail)
    setPassword(presetPass)
    setError(null)
    setLoading(true)
    const result = await login(presetEmail, presetPass)
    if (!result.success) {
      setError(result.error || "Login failed.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground font-mono font-bold text-lg mb-3">
          OB
        </div>
        <h2 className="text-2xl font-bold tracking-tight font-heading">OptiBuild Site Engine OS</h2>
        <p className="mt-1 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Role-Based Construction Scheduling & Cost Control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-card border border-border p-6 sm:p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@optibuild.io"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 border border-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING ROLE...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN TO OPTIBUILD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="border-t border-border pt-5">
            <div className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider mb-3 flex items-center justify-between">
              <span>Quick Demo Role Logins</span>
              <span className="text-[10px] text-primary">1-Click Sign In</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_PRESETS.map((p) => {
                const Icon = p.icon
                return (
                  <button
                    key={p.role}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(p.email, p.pass)}
                    className="flex items-start gap-2.5 p-2.5 text-left border border-border bg-muted/30 hover:bg-muted/80 hover:border-primary/50 transition-colors disabled:opacity-50"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{p.title}</div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">{p.badge}</div>
                      <div className="text-[9px] font-mono text-primary/80 mt-0.5">{p.email}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[10px] font-mono text-muted-foreground">
          Protected by OptiBuild RBAC Security Engine • Statutory MahaRERA Enforcement
        </div>
      </div>
    </div>
  )
}
