import React from "react"
import Link from "next/link"
import { LucideIcon, FolderPlus, ShieldAlert, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  isPermissionDenied?: boolean
}

export function EmptyState({
  icon: Icon = FolderPlus,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  isPermissionDenied = false,
}: EmptyStateProps) {
  const DisplayIcon = isPermissionDenied ? ShieldAlert : Icon

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-dashed border-border bg-card/40 text-center my-6 max-w-xl mx-auto">
      <div className={`w-12 h-12 flex items-center justify-center mb-3 ${isPermissionDenied ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
        <DisplayIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold font-heading text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground font-mono max-w-md leading-relaxed">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary"
        >
          <span>{actionLabel}</span>
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}
