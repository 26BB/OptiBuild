"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { PermissionDenied } from "@/components/ui/PermissionDenied"
import { useAuth } from "@/context/AuthContext"
import {
  FolderKanban,
  FileText,
  Upload,
  Eye,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  FileCode,
  Layers,
  Calendar,
  ExternalLink,
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
  { value: "ARCHITECTURAL", label: "Architectural Layout" },
  { value: "STRUCTURAL", label: "Structural & Framing Plan" },
  { value: "MEP", label: "MEP (Electrical & Plumbing)" },
  { value: "ELEVATION", label: "Elevation & Façade" },
  { value: "FLOOR_PLAN", label: "Typical Floor Plan" },
]

export default function DrawingsPage() {
  const { user, token, activeProjectId, activeProject, hasPermission } = useAuth()

  const [drawings, setDrawings] = useState<DrawingItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState<string>("")
  const [drawingType, setDrawingType] = useState<string>("ARCHITECTURAL")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      // Reset input element
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

      <main className="p-4 md:p-6 space-y-6">
        {/* Compliance Banner: Stored for human viewing only, never parsed */}
        <div className="border border-border bg-card p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
                  Architectural Drawing Vault (Human Reference Only)
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                Preserves design integrity and building plans for on-site visual reference.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                LOCKED RULE: Stored For Viewing Only • Never Parsed
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive text-destructive font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-status-success/10 border border-status-success text-status-success font-mono text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Upload Form for Architect & Admin */}
        {canUpload && (
          <div className="border border-border bg-card p-4">
            <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-primary" />
              Attach Architectural / Engineering Drawing
            </h3>

            <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                  Drawing Sheet Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower 1 G+14 Structural Plan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                  Discipline / Type
                </label>
                <select
                  value={drawingType}
                  onChange={(e) => setDrawingType(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border p-2 text-foreground"
                >
                  {DRAWING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                  File (.pdf, .dwg, .dxf, .png, .jpg)
                </label>
                <input
                  id="drawing-file-input"
                  type="file"
                  required
                  accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[11px] file:font-mono file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isUploading || !title.trim() || !selectedFile}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors border border-primary disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading Drawing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Attach Drawing
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drawings Vault Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 font-mono text-xs text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
            Loading drawing files...
          </div>
        ) : !activeProjectId ? (
          <EmptyState
            title="No Active Project Selected"
            description="Select or create a project to view and attach architectural drawings."
            actionLabel="Go to Projects"
            actionHref="/rera-review"
          />
        ) : drawings.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No Drawings Attached"
            description="No architectural, structural, or MEP drawings have been attached to this project yet. Architects can attach drawing sheets above for site reference."
          />
        ) : (
          <div className="border border-border bg-card">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                ATTACHED DRAWINGS ({drawings.length})
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Click any sheet to view in viewer
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                    <th className="p-3 font-semibold">Sheet Title</th>
                    <th className="p-3 font-semibold">Discipline</th>
                    <th className="p-3 font-semibold">File Name</th>
                    <th className="p-3 font-semibold">Date Attached</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drawings.map((drawing) => (
                    <tr key={drawing.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-primary shrink-0" />
                        <span>{drawing.title}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-secondary border border-border text-foreground font-medium">
                          {drawing.drawing_type}
                        </span>
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
                      <td className="p-3 text-right">
                        <a
                          href={getApiUrl(drawing.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-mono transition-colors"
                        >
                          <Eye className="w-3 h-3 text-primary" />
                          <span>View Sheet</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
