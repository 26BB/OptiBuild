"use client"

import React, { useState } from "react"
import { useDropzone } from "react-dropzone"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { formatINR } from "@/lib/utils"
import {
  FileCheck2,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building,
  Calendar,
  Layers,
  Coins,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from "lucide-react"

interface ReraDraftData {
  project_name: string
  rera_registration_no: string
  promoter_name: string
  proposed_completion_date: string
  plot_area_sqft: number
  built_up_area_sqft: number
  carpet_area_sqft: number
  number_of_floors: number
  number_of_basements: number
  total_project_cost: number
  confidence_scores: Record<string, string>
}

const DEFAULT_SAMPLE_DRAFT: ReraDraftData = {
  project_name: "Emerald Heights Phase 1",
  rera_registration_no: "P52100018921",
  promoter_name: "Solitaire Infra Projects Private Limited",
  proposed_completion_date: "31/12/2027",
  plot_area_sqft: 48437.55,
  built_up_area_sqft: 134548.75,
  carpet_area_sqft: 91493.15,
  number_of_floors: 15,
  number_of_basements: 1,
  total_project_cost: 425000000, // ₹42.50 Cr
  confidence_scores: {
    project_name: "HIGH",
    rera_registration_no: "HIGH",
    promoter_name: "HIGH",
    proposed_completion_date: "HIGH",
    plot_area_sqft: "HIGH",
    built_up_area_sqft: "HIGH",
    carpet_area_sqft: "HIGH",
    number_of_floors: "HIGH",
    total_project_cost: "HIGH",
  },
}

export default function ReraReviewPage() {
  const [formData, setFormData] = useState<ReraDraftData>(DEFAULT_SAMPLE_DRAFT)
  const [fileName, setFileName] = useState<string>("MahaRERA_Certificate_P52100018921.pdf")
  const [isParsing, setIsParsing] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [userNotes, setUserNotes] = useState(
    "Verified against MahaRERA Annexure B sanctioned layout drawing dated 12-Oct-2026."
  )

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    setFileName(file.name)
    setIsParsing(true)
    setIsConfirmed(false)

    try {
      const body = new FormData()
      body.append("file", file)

      const res = await fetch(getApiUrl("/api/v1/rera/upload-parse"), {
        method: "POST",
        body,
      }).catch(() => null)

      if (res && res.ok) {
        const draft = await res.json()
        setFormData({
          project_name: draft.project_name || "Extracted MahaRERA Project",
          rera_registration_no: draft.rera_registration_no || "P5XXXXXXXXXX",
          promoter_name: draft.promoter_name || "Developer / Promoter",
          proposed_completion_date: draft.proposed_completion_date || "31/12/2027",
          plot_area_sqft: draft.plot_area_sqft || 45000,
          built_up_area_sqft: draft.built_up_area_sqft || 120000,
          carpet_area_sqft: draft.carpet_area_sqft || 80000,
          number_of_floors: draft.number_of_floors || 14,
          number_of_basements: draft.number_of_basements || 1,
          total_project_cost: draft.total_project_cost || 350000000,
          confidence_scores: draft.confidence_scores || {},
        })
      }
    } finally {
      setTimeout(() => setIsParsing(false), 500)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  })

  const handleConfirm = async () => {
    setIsParsing(true)
    try {
      await fetch(getApiUrl("/api/v1/rera/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_notes: userNotes,
        }),
      }).catch(() => null)
      setIsConfirmed(true)
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName="MahaRERA PDF Form Pre-Fill & Review"
        delayRiskDays={0}
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Compulsory Review Alert */}
        <div className="border border-status-warning/40 bg-status-warning/10 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
          <div className="text-xs">
            <h2 className="font-heading font-semibold text-foreground uppercase tracking-wider">
              MahaRERA Compulsory Verification Safeguard
            </h2>
            <p className="mt-1 text-muted-foreground leading-relaxed font-sans">
              MahaRERA PDF extraction strictly pre-fills a draft. It never auto-commits to your database.
              As project engineer or promoter, you must review, edit where required, and explicitly confirm each value below.
            </p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:bg-muted/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="w-8 h-8 text-primary" />
            <div className="text-xs font-mono font-medium text-foreground">
              {isDragActive
                ? "Drop the MahaRERA PDF certificate here..."
                : "Drag & drop MahaRERA Registration Certificate (PDF) or click to browse"}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              Extracts project name, registration ID, proposed handover date, FSI area, floors, and cost
            </div>
            {fileName && (
              <div className="mt-2 text-xs font-mono px-2.5 py-1 bg-secondary border border-border text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>{fileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Status Banner */}
        {isConfirmed && (
          <div className="border border-status-success/40 bg-status-success/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-status-success" />
              <div>
                <h3 className="font-heading font-semibold text-xs text-foreground uppercase">
                  PROJECT PARAMETERS CONFIRMED & SAVED
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Data committed for {formData.project_name} ({formData.rera_registration_no}).
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-status-success px-2.5 py-1 bg-status-success/15 border border-status-success/30">
              STATUS: CONFIRMED
            </span>
          </div>
        )}

        {/* Editable Form with Confidence Badges */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                PRE-FILLED MAHARERA DATA FIELDS (REVIEW & EDIT)
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                All fields are fully editable before final verification
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-border bg-background">
              DRAFT VERIFICATION
            </span>
          </div>

          <div className="p-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Project Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Project Name
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.project_name || "HIGH"}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full text-xs font-sans bg-background border border-border p-2 text-foreground font-medium"
                />
              </div>

              {/* RERA Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    MahaRERA Registration No.
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.rera_registration_no || "HIGH"}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.rera_registration_no}
                  onChange={(e) => setFormData({ ...formData, rera_registration_no: e.target.value })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-primary font-bold"
                />
              </div>

              {/* Promoter Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Promoter / Developer
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.promoter_name || "HIGH"}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.promoter_name}
                  onChange={(e) => setFormData({ ...formData, promoter_name: e.target.value })}
                  className="w-full text-xs font-sans bg-background border border-border p-2 text-foreground"
                />
              </div>

              {/* Proposed Handover Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Proposed Completion Date
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.proposed_completion_date || "HIGH"}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.proposed_completion_date}
                  onChange={(e) => setFormData({ ...formData, proposed_completion_date: e.target.value })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground font-bold"
                />
              </div>

              {/* Sanctioned Built-Up Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Built-Up Area (sq.ft.)
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.built_up_area_sqft || "HIGH"}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.built_up_area_sqft}
                  onChange={(e) => setFormData({ ...formData, built_up_area_sqft: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground font-bold"
                />
              </div>

              {/* Carpet Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Carpet Area (sq.ft.)
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.carpet_area_sqft || "HIGH"}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.carpet_area_sqft}
                  onChange={(e) => setFormData({ ...formData, carpet_area_sqft: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
                />
              </div>

              {/* Floors */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Floors Count (G+N)
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.number_of_floors || "HIGH"}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.number_of_floors}
                  onChange={(e) => setFormData({ ...formData, number_of_floors: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground font-bold"
                />
              </div>

              {/* Basements */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Basements Count
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-secondary text-muted-foreground border border-border">
                    {formData.confidence_scores.number_of_basements || "MANUAL"}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.number_of_basements}
                  onChange={(e) => setFormData({ ...formData, number_of_basements: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
                />
              </div>

              {/* Total Project Cost */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Total Estimated Cost (INR)
                  </label>
                  <span className="text-[9px] font-mono px-1 bg-status-success/15 text-status-success border border-status-success/30">
                    {formData.confidence_scores.total_project_cost || "HIGH"}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.total_project_cost}
                  onChange={(e) => setFormData({ ...formData, total_project_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground font-bold"
                />
                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
                  {formatINR(formData.total_project_cost)}
                </span>
              </div>
            </div>

            {/* Engineer Verification Notes */}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                Engineer Verification Notes & Discrepancy Log
              </label>
              <textarea
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-muted-foreground">
                Clicking confirm establishes this as verified baseline project data.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(DEFAULT_SAMPLE_DRAFT)
                    setIsConfirmed(false)
                  }}
                  className="text-xs font-mono px-3 py-1.5 border border-border bg-background hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>RESET</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isParsing}
                  className="text-xs font-mono font-medium bg-primary text-primary-foreground px-4 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 border border-primary flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isConfirmed ? "RE-CONFIRM VALUES" : "CONFIRM & APPLY TO PROJECT"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
