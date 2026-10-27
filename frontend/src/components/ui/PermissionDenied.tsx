"use client"

import React from "react"
import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { useAuth, ROLE_HOMES } from "@/context/AuthContext"

interface PermissionDeniedProps {
  title?: string
  description?: string
  requiredRoles?: string[]
}

export function PermissionDenied({
  title = "Permission Denied",
  description = "Your assigned role does not have authorization to view or manage this workspace module.",
  requiredRoles,
}: PermissionDeniedProps) {
  const { user } = useAuth()
  const homePath = (user?.role && ROLE_HOMES[user.role]) || "/"

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-destructive/30 bg-card/60 text-center my-12 max-w-lg mx-auto shadow-sm">
      <div className="w-14 h-14 flex items-center justify-center mb-4 bg-destructive/10 text-destructive border border-destructive/20">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold font-heading text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-xs text-muted-foreground font-mono leading-relaxed">
        {description}
      </p>

      {user && (
        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 bg-muted/60 border border-border text-[11px] font-mono text-muted-foreground">
          <span>Current Role:</span>
          <span className="font-semibold text-foreground uppercase">{user.role}</span>
        </div>
      )}

      {requiredRoles && requiredRoles.length > 0 && (
        <div className="mt-2 text-[11px] font-mono text-muted-foreground">
          <span>Allowed Roles: {requiredRoles.join(", ")}</span>
        </div>
      )}

      <div className="mt-6">
        <Link
          href={homePath}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Role Workspace</span>
        </Link>
      </div>
    </div>
  )
}
