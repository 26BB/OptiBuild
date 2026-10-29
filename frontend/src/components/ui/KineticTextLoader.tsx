"use client"

import React from "react"
import { motion } from "framer-motion"
import { Cpu, Activity } from "lucide-react"

interface KineticTextLoaderProps {
  text?: string
  subtitle?: string
}

export default function KineticTextLoader({
  text = "WAKING UP SITE ENGINE BACKEND",
  subtitle = "Spinning up civil scheduling engine & PostgreSQL database container...",
}: KineticTextLoaderProps) {
  const letters = Array.from(text)

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[99999] bg-[#14181F]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none"
    >
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(232,89,12,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(232,89,12,0.06)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full border border-[#283243] bg-[#1A2029]/95 p-8 rounded-[4px] shadow-2xl text-center space-y-6">
        {/* Kinetic Header Status */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] uppercase tracking-wider rounded-[2px]">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Cold Start // Handshake in Progress</span>
        </div>

        {/* Kinetic Animated Letters */}
        <div className="flex items-center justify-center flex-wrap gap-x-1.5 gap-y-1 text-base sm:text-lg font-mono font-bold tracking-wider text-white">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              animate={{
                opacity: [0.35, 1, 0.35],
                y: [0, -3, 0],
                color: ["#8A94A6", "#E8590C", "#8A94A6"],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: index * 0.05,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Progress Bar & Subtext */}
        <div className="space-y-3">
          <div className="w-full bg-[#14181F] h-1.5 rounded-full overflow-hidden border border-[#283243]">
            <motion.div
              className="bg-primary h-full"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: "45%" }}
            />
          </div>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="pt-2 border-t border-[#283243] flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
          <span>PORT: 8000 // Uvicorn FastAPI</span>
          <span>EST. WAIT: ~15-30s</span>
        </div>
      </div>
    </div>
  )
}
