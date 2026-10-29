"use client"

import React from "react"

export default function BlueprintBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
    >
      {/* CAD Coordinate Grid (Pure SVG) */}
      <svg
        className="w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="cad-small-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(232, 89, 12, 0.25)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="cad-large-grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect width="100" height="100" fill="url(#cad-small-grid)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(232, 89, 12, 0.45)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cad-large-grid)" />

        {/* Blueprint CAD Crosshairs and Coordinate Marks */}
        <g stroke="rgba(232, 89, 12, 0.35)" strokeWidth="1">
          <line x1="50" y1="40" x2="50" y2="60" />
          <line x1="40" y1="50" x2="60" y2="50" />
          <circle cx="50" cy="50" r="14" fill="none" />

          <line x1="90%" y1="120" x2="90%" y2="140" />
          <line x1="calc(90% - 10px)" y1="130" x2="calc(90% + 10px)" y2="130" />

          <line x1="20%" y1="80%" x2="20%" y2="calc(80% + 20px)" />
          <line x1="calc(20% - 10px)" y1="calc(80% + 10px)" x2="calc(20% + 10px)" y2="calc(80% + 10px)" />
        </g>
      </svg>

      {/* Subtle radial blueprint gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(232,89,12,0.08),transparent_70%)]" />

      {/* Engineering technical border ticks */}
      <div className="absolute top-4 left-4 text-[9px] font-mono text-[#E8590C]/60 tracking-widest">
        SEC.18 // MAHARERA-ENGINE: READY
      </div>
      <div className="absolute bottom-4 left-4 text-[9px] font-mono text-muted-foreground/40 tracking-widest">
        GRID 20x20 // METRIC // SCALE 1:100
      </div>
    </div>
  )
}
