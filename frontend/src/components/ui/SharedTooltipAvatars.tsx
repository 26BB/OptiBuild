"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TeamMemberAvatar {
  id: string
  name: string
  role: string
  roleTitle?: string
  initials?: string
}

interface SharedTooltipAvatarsProps {
  members: TeamMemberAvatar[]
  maxVisible?: number
  className?: string
  size?: "sm" | "md"
}

const ROLE_BADGE_MAP: Record<string, { label: string; badgeClass: string }> = {
  admin: { label: "ADM", badgeClass: "text-primary border-primary/40 bg-primary/10" },
  project_manager: { label: "PM", badgeClass: "text-primary border-primary/40 bg-primary/10" },
  site_engineer: { label: "ENG", badgeClass: "text-sky-600 dark:text-sky-400 border-sky-500/40 bg-sky-500/10" },
  store_keeper: { label: "STR", badgeClass: "text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10" },
  architect: { label: "ARC", badgeClass: "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  accountant: { label: "ACC", badgeClass: "text-indigo-600 dark:text-indigo-400 border-indigo-500/40 bg-indigo-500/10" },
  owner: { label: "OWN", badgeClass: "text-purple-600 dark:text-purple-400 border-purple-500/40 bg-purple-500/10" },
}

export function SharedTooltipAvatars({
  members,
  maxVisible = 4,
  className = "",
  size = "md",
}: SharedTooltipAvatarsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!members || members.length === 0) {
    return null
  }

  const visibleMembers = members.slice(0, maxVisible)
  const remainingCount = Math.max(0, members.length - maxVisible)

  const dimensionClass = size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-[11px]"

  return (
    <div className={cn("flex items-center -space-x-1.5 relative", className)}>
      {visibleMembers.map((member) => {
        const isHovered = hoveredId === member.id
        const initials =
          member.initials ||
          member.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()

        const roleMeta = ROLE_BADGE_MAP[member.role] || {
          label: "MBR",
          badgeClass: "text-muted-foreground border-border bg-secondary",
        }

        return (
          <div
            key={member.id}
            className="relative"
            onMouseEnter={() => setHoveredId(member.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(member.id)}
            onBlur={() => setHoveredId(null)}
            tabIndex={0}
            role="button"
            aria-label={`${member.name} (${member.roleTitle || member.role})`}
          >
            <div
              className={cn(
                dimensionClass,
                "rounded-full border border-card bg-secondary/80 text-foreground font-mono font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:z-20 shadow-xs select-none",
                isHovered && "ring-1 ring-primary z-20"
              )}
            >
              {initials}
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 pointer-events-none whitespace-nowrap bg-card text-foreground px-2 py-1 rounded-[2px] border border-border shadow-md"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span
                      className={cn(
                        "px-1 py-0.2 border text-[9px] font-bold rounded-[2px]",
                        roleMeta.badgeClass
                      )}
                    >
                      {roleMeta.label}
                    </span>
                    <span className="font-semibold">{member.name}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {remainingCount > 0 && (
        <div
          className={cn(
            dimensionClass,
            "rounded-full border border-card bg-muted text-muted-foreground font-mono text-[9px] font-bold flex items-center justify-center select-none"
          )}
          title={`${remainingCount} more team members`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
