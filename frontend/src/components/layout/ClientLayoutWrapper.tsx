"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { WakeupBanner } from "@/components/layout/WakeupBanner"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return (
      <main className="flex-1 w-full">
        <WakeupBanner />
        <Toaster richColors position="top-right" />
        {children}
      </main>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground p-6 border border-border bg-card rounded-[4px] shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>INITIALIZING OPTIBUILD SESSION...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-background">
      <WakeupBanner />
      <Toaster richColors position="top-right" />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
