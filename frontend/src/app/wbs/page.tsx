"use client"

import React, { useState } from "react"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { formatINR } from "@/lib/utils"
import {
  FileSpreadsheet,
  Building2,
  Layers,
  Coins,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

interface WbsItem {
  wbs_code: string
  title: string
  category: string
  budget_percentage: number
  estimated_cost: number
  duration_days: number
  predecessors: string[]
  resource_demands: Record<string, number>
}

interface WbsCategory {
  category_name: string
  total_percentage: number
  total_cost: number
  items: WbsItem[]
}

interface WbsData {
  project_name: string
  built_up_area_sqft: number
  base_rate_per_sqft: number
  total_estimated_cost: number
  categories: WbsCategory[]
  cpm_makespan_days: number
}

const DEFAULT_WBS_RESPONSE: WbsData = {
  project_name: "Tower-A Residential (G+14)",
  built_up_area_sqft: 75000,
  base_rate_per_sqft: 2400,
  total_estimated_cost: 180000000, // ₹18.00 Cr
  cpm_makespan_days: 142,
  categories: [
    {
      category_name: "1. Substructure & Earthwork",
      total_percentage: 12.0,
      total_cost: 21600000,
      items: [
        {
          wbs_code: "WBS-1.1",
          title: "Site Clearance, Shoring & Bulk Excavation",
          category: "1. Substructure & Earthwork",
          budget_percentage: 3.5,
          estimated_cost: 6300000,
          duration_days: 22,
          predecessors: [],
          resource_demands: { excavator: 2, labor: 12 },
        },
        {
          wbs_code: "WBS-1.2",
          title: "Raft Foundation & Retaining Basement Walls",
          category: "1. Substructure & Earthwork",
          budget_percentage: 8.5,
          estimated_cost: 15300000,
          duration_days: 24,
          predecessors: ["WBS-1.1"],
          resource_demands: { pump: 2, labor: 20 },
        },
      ],
    },
    {
      category_name: "2. RCC Superstructure Frame",
      total_percentage: 38.0,
      total_cost: 68400000,
      items: [
        {
          wbs_code: "WBS-2.1",
          title: "Podium / Lower Level RCC Columns & Slab",
          category: "2. RCC Superstructure Frame",
          budget_percentage: 10.0,
          estimated_cost: 18000000,
          duration_days: 22,
          predecessors: ["WBS-1.2"],
          resource_demands: { crane: 1, labor: 24 },
        },
        {
          wbs_code: "WBS-2.2",
          title: "Mid-Rise Typical Floor Slabs (Floors 1 to 7)",
          category: "2. RCC Superstructure Frame",
          budget_percentage: 14.0,
          estimated_cost: 25200000,
          duration_days: 43,
          predecessors: ["WBS-2.1"],
          resource_demands: { crane: 1, labor: 25 },
        },
        {
          wbs_code: "WBS-2.3",
          title: "High-Rise Typical Floor Slabs (Floors 8 to 14) + Terrace",
          category: "2. RCC Superstructure Frame",
          budget_percentage: 14.0,
          estimated_cost: 25200000,
          duration_days: 47,
          predecessors: ["WBS-2.2"],
          resource_demands: { crane: 1, labor: 25 },
        },
      ],
    },
    {
      category_name: "3. Masonry & Wet Finishes",
      total_percentage: 18.0,
      total_cost: 32400000,
      items: [
        {
          wbs_code: "WBS-3.1",
          title: "AAC Block Masonry & Brick Wall Partitions",
          category: "3. Masonry & Wet Finishes",
          budget_percentage: 8.0,
          estimated_cost: 14400000,
          duration_days: 36,
          predecessors: ["WBS-2.2"],
          resource_demands: { labor: 16, hoist: 1 },
        },
        {
          wbs_code: "WBS-3.2",
          title: "Internal Gypsum Plaster & External Sand-Face",
          category: "3. Masonry & Wet Finishes",
          budget_percentage: 10.0,
          estimated_cost: 18000000,
          duration_days: 34,
          predecessors: ["WBS-3.1"],
          resource_demands: { labor: 20 },
        },
      ],
    },
    {
      category_name: "4. MEP Building Services",
      total_percentage: 14.0,
      total_cost: 25200000,
      items: [
        {
          wbs_code: "WBS-4.1",
          title: "Internal Electrical Conduits & Plumbing Lines",
          category: "4. MEP Building Services",
          budget_percentage: 6.0,
          estimated_cost: 10800000,
          duration_days: 31,
          predecessors: ["WBS-3.1"],
          resource_demands: { labor: 10 },
        },
        {
          wbs_code: "WBS-4.2",
          title: "Firefighting Wet Risers & Main LT Panels",
          category: "4. MEP Building Services",
          budget_percentage: 8.0,
          estimated_cost: 14400000,
          duration_days: 22,
          predecessors: ["WBS-4.1"],
          resource_demands: { labor: 12 },
        },
      ],
    },
    {
      category_name: "5. Architectural Finishing",
      total_percentage: 12.0,
      total_cost: 21600000,
      items: [
        {
          wbs_code: "WBS-5.1",
          title: "Vitrified Tile Flooring & Bathroom Dado",
          category: "5. Architectural Finishing",
          budget_percentage: 7.0,
          estimated_cost: 12600000,
          duration_days: 34,
          predecessors: ["WBS-3.2", "WBS-4.1"],
          resource_demands: { labor: 14 },
        },
        {
          wbs_code: "WBS-5.2",
          title: "Doors, Aluminum Sliding Windows & Hardware",
          category: "5. Architectural Finishing",
          budget_percentage: 5.0,
          estimated_cost: 9000000,
          duration_days: 24,
          predecessors: ["WBS-5.1"],
          resource_demands: { labor: 8 },
        },
      ],
    },
    {
      category_name: "6. External Development & Handover",
      total_percentage: 6.0,
      total_cost: 10800000,
      items: [
        {
          wbs_code: "WBS-6.1",
          title: "Compound Wall, Storm Drain & Paver Blocks",
          category: "6. External Development & Handover",
          budget_percentage: 4.0,
          estimated_cost: 7200000,
          duration_days: 22,
          predecessors: ["WBS-5.2"],
          resource_demands: { labor: 12, excavator: 1 },
        },
        {
          wbs_code: "WBS-6.2",
          title: "Final Testing, Commissioning & Handover",
          category: "6. External Development & Handover",
          budget_percentage: 2.0,
          estimated_cost: 3600000,
          duration_days: 12,
          predecessors: ["WBS-4.2", "WBS-6.1"],
          resource_demands: { labor: 6 },
        },
      ],
    },
  ],
}

export default function WbsPage() {
  const [projectName, setProjectName] = useState("Tower-A Residential (G+14)")
  const [builtUpArea, setBuiltUpArea] = useState(75000)
  const [carpetArea, setCarpetArea] = useState(52500)
  const [floors, setFloors] = useState(15)
  const [basements, setBasements] = useState(1)
  const [baseRate, setBaseRate] = useState(2400)
  const [wbsData, setWbsData] = useState<WbsData>(DEFAULT_WBS_RESPONSE)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleGenerate = async () => {
    setIsCalculating(true)
    try {
      const res = await fetch(getApiUrl("/api/v1/wbs/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          built_up_area_sqft: builtUpArea,
          carpet_area_sqft: carpetArea,
          number_of_floors: floors,
          number_of_basements: basements,
          base_rate_per_sqft: baseRate,
        }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setWbsData(data)
      } else {
        // Fallback computation
        const total = builtUpArea * baseRate
        const updatedCats = DEFAULT_WBS_RESPONSE.categories.map((c) => ({
          ...c,
          total_cost: Math.round(total * (c.total_percentage / 100)),
          items: c.items.map((it) => ({
            ...it,
            estimated_cost: Math.round(total * (it.budget_percentage / 100)),
          })),
        }))
        setWbsData({
          project_name: projectName,
          built_up_area_sqft: builtUpArea,
          base_rate_per_sqft: baseRate,
          total_estimated_cost: total,
          categories: updatedCats,
          cpm_makespan_days: 142,
        })
      }
    } finally {
      setTimeout(() => setIsCalculating(false), 400)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName="Parametric WBS & Construction Cost Estimation"
        delayRiskDays={0}
        onRecalculate={handleGenerate}
        isOptimizing={isCalculating}
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Header Ribbon */}
        <div className="border border-border bg-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                Parametric Building Parameters & Work Breakdown Structure (WBS)
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Empirical cost distribution using SPPU standard ratios • Generates acyclic CPM activities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isCalculating}
              className="text-xs font-mono font-medium bg-primary text-primary-foreground px-3.5 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 border border-primary flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? "animate-spin" : ""}`} />
              <span>{isCalculating ? "GENERATING..." : "RECALCULATE WBS"}</span>
            </button>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div className="border border-border bg-card p-4 space-y-4">
          <div className="text-xs font-mono font-bold text-foreground uppercase border-b border-border pb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>BUILDING SPECIFICATIONS & METRICS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full text-xs font-sans bg-background border border-border p-2 text-foreground font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                Built-Up Area (sq.ft.)
              </label>
              <input
                type="number"
                step="1000"
                value={builtUpArea}
                onChange={(e) => setBuiltUpArea(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                Carpet Area (sq.ft.)
              </label>
              <input
                type="number"
                step="1000"
                value={carpetArea}
                onChange={(e) => setCarpetArea(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                Floors (G + N)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={floors}
                onChange={(e) => setFloors(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                Construction Rate (₹/sqft)
              </label>
              <input
                type="number"
                step="50"
                value={baseRate}
                onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-background border border-border p-2 text-primary font-bold"
              />
            </div>
          </div>
        </div>

        {/* Budget Summary Ribbons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Total Estimated Cost
              </span>
              <Coins className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {formatINR(wbsData.total_estimated_cost)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Built-up: {wbsData.built_up_area_sqft.toLocaleString("en-IN")} sq.ft.
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Baseline Rate
              </span>
              <Building2 className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              ₹{wbsData.base_rate_per_sqft}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Standard RCC residential
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                WBS Activities
              </span>
              <Layers className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {wbsData.categories.reduce((acc, c) => acc + c.items.length, 0)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Across 6 civil work packages
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                CPM Makespan
              </span>
              <Calendar className="w-3.5 h-3.5 text-status-success" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-status-success">
              {wbsData.cpm_makespan_days}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Unconstrained critical path
            </div>
          </div>
        </div>

        {/* Detailed WBS Table by Packages */}
        <div className="border border-border bg-card space-y-0">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                PARAMETRIC WORK BREAKDOWN STRUCTURE & COST DISTRIBUTION
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Itemized percentage ratios, duration scaling, and predecessor linkages
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-border bg-background">
              TOTAL: 100% ALLOCATED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <th className="p-2.5 font-semibold">WBS Code</th>
                  <th className="p-2.5 font-semibold">Activity Description</th>
                  <th className="p-2.5 font-semibold text-right">Budget %</th>
                  <th className="p-2.5 font-semibold text-right">Estimated Cost (INR)</th>
                  <th className="p-2.5 font-semibold text-right">Duration</th>
                  <th className="p-2.5 font-semibold">Predecessors</th>
                  <th className="p-2.5 font-semibold">Allocated Resources</th>
                </tr>
              </thead>
              <tbody>
                {wbsData.categories.map((cat) => (
                  <React.Fragment key={cat.category_name}>
                    {/* Category Header Row */}
                    <tr className="bg-secondary/70 border-y border-border">
                      <td colSpan={2} className="p-2 font-bold text-foreground">
                        {cat.category_name}
                      </td>
                      <td className="p-2 text-right font-bold text-foreground">
                        {cat.total_percentage}%
                      </td>
                      <td className="p-2 text-right font-bold text-primary">
                        {formatINR(cat.total_cost)}
                      </td>
                      <td colSpan={3} className="p-2 text-right text-muted-foreground">
                        Package Subtotal
                      </td>
                    </tr>

                    {/* Category Items */}
                    {cat.items.map((item) => (
                      <tr key={item.wbs_code} className="hover:bg-muted/30 border-b border-border/50">
                        <td className="p-2.5 font-bold text-foreground">{item.wbs_code}</td>
                        <td className="p-2.5 font-sans font-medium text-foreground">{item.title}</td>
                        <td className="p-2.5 text-right">{item.budget_percentage}%</td>
                        <td className="p-2.5 text-right font-medium">{formatINR(item.estimated_cost)}</td>
                        <td className="p-2.5 text-right font-bold">{item.duration_days}d</td>
                        <td className="p-2.5 text-muted-foreground">
                          {item.predecessors.length > 0 ? item.predecessors.join(", ") : "—"}
                        </td>
                        <td className="p-2.5 text-[11px] text-muted-foreground">
                          {Object.entries(item.resource_demands)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(" | ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
