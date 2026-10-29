"use client"

import React, { useEffect, useState } from "react"
import { onWakeupStateChange } from "@/lib/api"
import KineticTextLoader from "@/components/ui/KineticTextLoader"

export function WakeupBanner() {
  const [isWakingUp, setIsWakingUp] = useState(false)

  useEffect(() => {
    return onWakeupStateChange((waking) => {
      setIsWakingUp(waking)
    })
  }, [])

  if (!isWakingUp) return null

  return <KineticTextLoader />
}
