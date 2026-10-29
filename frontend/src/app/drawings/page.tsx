"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, type Variants } from "framer-motion"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { PermissionDenied } from "@/components/ui/PermissionDenied"
import { useAuth } from "@/context/AuthContext"
import { Counter } from "@/components/ui/Counter"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  FolderKanban,
  FileText,
  Upload,
  Eye,
  Lock,
  AlertTriangle,
  Loader2,
  FileCode,
  Layers,
  Calendar,
  ExternalLink,
  Search,
  CheckCircle2,
  Download,
  Maximize2,
  Grid,
  List,
} from "lucide-react"

interface DrawingItem {
  id: string
  title: string
  drawing_type: string
  file_name: string
  file_url: string
  uploaded_by_id?: string
  uploaded_at?: string
}

const DRAWING_TYPES = [
  { value: "ALL", label: "All Disciplines" },
  { value: "ARCHITECTURAL", label: "Architectural Layout" },
  { value: "STRUCTURAL", label: "Structural & Framing Plan" },
  { value: "MEP", label: "MEP (Electrical & Plumbing)" },
  { value: "ELEVATION", label: "Elevation & Façade" },
  { value: "FLOOR_PLAN", label: "Typical Floor Plan" },
]

const TYPE_BADGE_MAP: Record<string, { label: string; className: string }> = {
  ARCHITECTURAL: {
    label: "ARCHITECTURAL",
    className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold",
  },
  STRUCTURAL: {
    label: "STRUCTURAL",
    className: "bg-primary/10 border-primary/30 text-primary font-bold",
  },
  MEP: {
    label: "MEP",
    className: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 font-bold",
  },
  ELEVATION: {
    label: "ELEVATION",
    className: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold",
  },
  FLOOR_PLAN: {
    label: "FLOOR PLAN",
    className: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold",
  },
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export default function DrawingsPage() {
  const { user, token, activeProjectId, activeProject, hasPermission } = useAuth()

  const [drawings, setDrawings] = useState<DrawingItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filters & View State
  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [previewDrawing, setPreviewDrawing] = useState<DrawingItem | null>(null)

  // Form states
  const [title, setTitle] = useState<string>("")
  const [drawingType, setDrawingType] = useState<string>("ARCHITECTURAL")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false)

  const canUpload = hasPermission(["admin", "architect"])
  const canView = hasPermission(["admin", "architect", "project_manager", "site_engineer"])

  const fetchDrawings = async () => {
    if (!activeProjectId || !token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/drawings`), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error("Failed to load project drawings.")
      }

      const data = await res.json()
      setDrawings(data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load drawings.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDrawings()
  }, [activeProjectId, token])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !title.trim() || !activeProjectId || !token) return

    setIsUploading(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append("title", title.trim())
    formData.append("drawing_type", drawingType)
    formData.append("file", selectedFile)

    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/drawings`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to attach drawing.")
      }

      const created = await res.json()
      setSuccessMsg(`Successfully attached drawing "${created.title}".`)
      setTitle("")
      setSelectedFile(null)
      setShowUploadForm(false)

      const fileInput = document.getElementById("drawing-file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      fetchDrawings()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to upload drawing.")
    } finally {
      setIsUploading(false)
    }
  }

  // Filtered drawings
  const filteredDrawings = useMemo(() => {
    return drawings.filter((d) => {
      const matchesType = selectedType === "ALL" || d.drawing_type === selectedType
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.file_name.toLowerCase().includes(q) ||
        d.drawing_type.toLowerCase().includes(q)
      return matchesType && matchesSearch
    })
  }, [drawings, selectedType, searchQuery])

  // Count distinct disciplines
  const distinctDisciplines = useMemo(() => {
    const set = new Set(drawings.map((d) => d.drawing_type))
    return set.size
  }, [drawings])

  // Permission check
  if (!canView) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Architectural Drawing Vault" />
        <main className="p-6">
          <PermissionDenied
            title="Access Restricted"
            description="Viewing architectural drawings is restricted to Architects, Project Managers, Site Engineers, and Administrators."
            requiredRoles={["architect", "project_manager", "site_engineer", "admin"]}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName={activeProject?.name || "Architectural Drawing Vault"}
        delayRiskDays={0}
      />

      <motion.main
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Compliance Header Banner: Stored for human viewing only, never parsed */}
        <div className="border border-border bg-card p-4 rounded-[4px] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                  Architectural Drawing Vault (Human Reference Only)
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                CAD blueprints, G+14 structural plans, and MEP drawings preserved for on-site visual reference.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-[11px] font-bold py-1 px-2.5 rounded-[4px]">
                <Lock className="w-3 h-3 mr-1" />
                LOCKED RULE: VIEW-ONLY • NEVER PARSED
              </Badge>

              {canUpload && (
                <button
                  type="button"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors rounded-[4px] shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{showUploadForm ? "CLOSE FORM" : "ATTACH DRAWING"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive text-destructive font-mono text-xs flex items-center gap-2.5 rounded-[4px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-status-success/10 border border-status-success text-status-success font-mono text-xs flex items-center gap-2.5 rounded-[4px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Form for Architect & Admin */}
        {showUploadForm && canUpload && (
          <form
            onSubmit={handleUpload}
            className="border border-primary/40 bg-card p-5 rounded-[4px] shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-primary" />
                Attach New Architectural / Engineering Drawing Sheet
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">
                Attach-only visual artifact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase block font-medium">
                  Drawing Sheet Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower 1 G+14 Typical Floor Framing Plan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase block font-medium">
                  Discipline / Plan Type
                </label>
                <select
                  value={drawingType}
                  onChange={(e) => setDrawingType(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                >
                  {DRAWING_TYPES.filter((t) => t.value !== "ALL").map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground uppercase block font-medium">
                  File (.pdf, .dwg, .dxf, .png, .jpg)
                </label>
                <input
                  id="drawing-file-input"
                  type="file"
                  required
                  accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground rounded-[4px] file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[11px] file:font-mono file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:rounded-[2px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[11px] font-mono text-muted-foreground">
                Uploaded files are stored as unparsed evidence and served via secure pre-signed URLs.
              </span>
              <button
                type="submit"
                disabled={isUploading || !title.trim() || !selectedFile}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading Drawing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach Drawing Sheet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Vault KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Attached Drawing Sheets
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">
              <Counter value={drawings.length} />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              For {activeProject?.name || "Active Project"}
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Engineering Disciplines
            </div>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              <Counter value={distinctDisciplines} suffix=" Types" />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Arch, Structural, MEP, Elevations
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Integrity Status
            </div>
            <div className="text-2xl font-bold font-mono text-status-success mt-1">
              View-Only
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Protected against automated edits
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Site Reference Access
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">
              Field Ready
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Available to Site Engineers & PMs
            </div>
          </div>
        </div>

        {/* Filter and View Controls Bar */}
        <div className="border border-border bg-card p-3.5 rounded-[4px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Discipline Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {DRAWING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-2.5 py-1 text-xs font-mono whitespace-nowrap transition-colors rounded-[4px] border ${
                  selectedType === t.value
                    ? "bg-primary text-primary-foreground border-primary font-bold"
                    : "bg-background text-muted-foreground border-border hover:bg-secondary/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full md:w-60">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sheet title, file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-mono bg-background border border-border pl-8 pr-3 py-1.5 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-[4px] overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
                title="CAD Blueprint Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
                title="Data Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawings Vault Main Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 font-mono text-xs text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
            <span className="uppercase tracking-wider">Loading architectural drawing vault...</span>
          </div>
        ) : !activeProjectId ? (
          <EmptyState
            title="No Active Project Selected"
            description="Select or create a project from the sidebar to view and attach architectural drawings."
            actionLabel="Go to Projects"
            actionHref="/rera-review"
          />
        ) : drawings.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No Drawings Attached"
            description="No architectural, structural, or MEP drawings have been attached to this project yet. Architects can attach drawing sheets above for site reference."
            actionLabel={canUpload ? "Attach First Drawing" : undefined}
            onAction={canUpload ? () => setShowUploadForm(true) : undefined}
          />
        ) : filteredDrawings.length === 0 ? (
          <div className="p-12 border border-dashed border-border bg-card text-center text-xs font-mono text-muted-foreground rounded-[4px]">
            No drawings match discipline &apos;{selectedType}&apos; or search query &apos;{searchQuery}&apos;.
          </div>
        ) : viewMode === "grid" ? (
          /* Blueprint Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrawings.map((drawing) => {
              const typeBadge = TYPE_BADGE_MAP[drawing.drawing_type] || {
                label: drawing.drawing_type,
                className: "bg-secondary border-border text-foreground",
              }

              return (
                <div
                  key={drawing.id}
                  className="border border-border bg-card rounded-[4px] overflow-hidden shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] ${typeBadge.className}`}
                      >
                        {typeBadge.label}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3 text-muted-foreground/70" />
                        <span>VIEW-ONLY</span>
                      </span>
                    </div>

                    <div className="pt-1">
                      <h4 className="font-heading font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {drawing.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mt-1.5">
                        <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{drawing.file_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-muted-foreground">
                      {drawing.uploaded_at
                        ? new Date(drawing.uploaded_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Verified"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDrawing(drawing)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-mono rounded-[3px] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-primary" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={getApiUrl(drawing.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono rounded-[3px] transition-colors"
                        title="Download / Open Full Sheet"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Data Table View */
          <div className="border border-border bg-card rounded-[4px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase">
                    <th className="p-3 font-semibold">Sheet Title</th>
                    <th className="p-3 font-semibold">Discipline</th>
                    <th className="p-3 font-semibold">File Name</th>
                    <th className="p-3 font-semibold">Date Attached</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDrawings.map((drawing) => {
                    const typeBadge = TYPE_BADGE_MAP[drawing.drawing_type] || {
                      label: drawing.drawing_type,
                      className: "bg-secondary border-border text-foreground",
                    }
                    return (
                      <tr key={drawing.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-bold text-foreground flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-primary shrink-0" />
                          <span>{drawing.title}</span>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] ${typeBadge.className}`}
                          >
                            {typeBadge.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{drawing.file_name}</td>
                        <td className="p-3 text-muted-foreground">
                          {drawing.uploaded_at
                            ? new Date(drawing.uploaded_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-secondary border border-border text-muted-foreground rounded-[3px]">
                            VIEW-ONLY
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewDrawing(drawing)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-mono rounded-[3px] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-primary" />
                              <span>Preview</span>
                            </button>
                            <a
                              href={getApiUrl(drawing.file_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono rounded-[3px] transition-colors"
                              title="Open Full Sheet"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slide-over Preview Sheet */}
        <Sheet open={!!previewDrawing} onOpenChange={(open) => !open && setPreviewDrawing(null)}>
          <SheetContent side="right" className="sm:max-w-xl flex flex-col justify-between">
            <div>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-[10px]">
                    {previewDrawing?.drawing_type}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">ATTACH-ONLY ARTIFACT</span>
                </div>
                <SheetTitle className="mt-2">{previewDrawing?.title}</SheetTitle>
                <SheetDescription>
                  Original file: {previewDrawing?.file_name}
                </SheetDescription>
              </SheetHeader>

              <div className="py-5 space-y-4 font-mono text-xs">
                {/* Visual Preview Frame */}
                <div className="border border-border bg-muted/30 aspect-4/3 rounded-[4px] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <FileCode className="w-12 h-12 text-primary opacity-80" />
                  <div className="font-heading font-semibold text-sm text-foreground">
                    {previewDrawing?.title}
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-sm">
                    Architectural and structural drawings are protected under the locked rule: stored for visual reference only and never altered by AI solvers.
                  </p>
                </div>

                <div className="p-3.5 bg-secondary/40 border border-border rounded-[4px] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discipline:</span>
                    <span className="text-foreground font-semibold">{previewDrawing?.drawing_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded Timestamp:</span>
                    <span className="text-foreground">
                      {previewDrawing?.uploaded_at ? new Date(previewDrawing.uploaded_at).toLocaleString("en-IN") : "Verified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access Policy:</span>
                    <span className="text-status-success font-semibold">View & Download Authorized</span>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <a
                href={previewDrawing ? getApiUrl(previewDrawing.file_url) : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors rounded-[4px] flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Drawing Sheet</span>
              </a>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </motion.main>
    </div>
  )
}
