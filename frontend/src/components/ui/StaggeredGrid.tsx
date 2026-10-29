"use client"

import React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggeredGridProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number = 0.06) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.04,
    },
  }),
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
}

export function StaggeredGrid({
  children,
  className = "",
  staggerDelay = 0.06,
}: StaggeredGridProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={cn("grid", className)}>{children}</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      custom={staggerDelay}
      initial="hidden"
      animate="visible"
      className={cn("grid", className)}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredGridItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggeredGridItem({
  children,
  className = "",
}: StaggeredGridItemProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
