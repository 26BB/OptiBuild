"use client"

import React, { useEffect, useState } from "react"
import { useMotionValue, useSpring } from "framer-motion"
import { formatINR } from "@/lib/utils"

export interface CounterProps {
  value: number
  isCurrency?: boolean
  compact?: boolean
  prefix?: string
  suffix?: string
  className?: string
  duration?: number
}

export function Counter({
  value,
  isCurrency = false,
  compact = false,
  prefix = "",
  suffix = "",
  className = "",
  duration = 0.4,
}: CounterProps) {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    isCurrency ? formatINR(value, compact) : `${prefix}${value}${suffix}`
  )

  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, {
    damping: 24,
    stiffness: 120,
    duration: duration * 1000,
  })

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setDisplayValue(
        isCurrency ? formatINR(value, compact) : `${prefix}${value}${suffix}`
      )
      return
    }

    motionVal.set(value)
  }, [value, isCurrency, compact, prefix, suffix, motionVal])

  useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      const rounded = Math.round(latest)
      if (isCurrency) {
        setDisplayValue(formatINR(rounded, compact))
      } else {
        setDisplayValue(`${prefix}${rounded.toLocaleString("en-IN")}${suffix}`)
      }
    })
    return () => unsubscribe()
  }, [springVal, isCurrency, compact, prefix, suffix])

  return <span className={className}>{displayValue}</span>
}
