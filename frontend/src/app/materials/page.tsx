"use client"

import React, { useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { useAuth } from "@/context/AuthContext"
import { formatINR } from "@/lib/utils"
import {
  Receipt,
  Camera,
  UploadCloud,
  CheckCircle2,
  Paperclip,
  Plus,
  Coins,
  Truck,
  Layers,
  ShieldCheck,
  AlertCircle,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react"

interface MaterialItem {
  entry_id: string
  date: string
  material_category: string
  item_description: string
  quantity: number
  unit: string
  unit_rate: number
  total_cost: number
  vendor_name: string
  invoice_number?: string
  wbs_code?: string
  bill_photo_name?: string
  bill_photo_url?: string
  is_unparsed_evidence: boolean
}

interface SitePhotoItem {
  id: string
  photo_url: string
  predicted_stage: string
  stage_label: string
  confidence_score: number
  detected_features?: string[]
  engineer_confirmed_stage?: string
  uploaded_at?: string
}

export default function MaterialsPage() {
  const { user, token, activeProjectId, activeProject, hasPermission } = useAuth()

  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [totalExpenditure, setTotalExpenditure] = useState<number>(0)
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({})
  const [photos, setPhotos] = useState<SitePhotoItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isClassifying, setIsClassifying] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState<boolean>(false)

  // Material Log Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formCategory, setFormCategory] = useState("Cement")
  const [formDesc, setFormDesc] = useState("")
  const [formQty, setFormQty] = useState<number>(100)
  const [formUnit, setFormUnit] = useState("Bags")
  const [formRate, setFormRate] = useState<number>(380)
  const [formVendor, setFormVendor] = useState("")
  const [formInvoice, setFormInvoice] = useState("")
  const [formWbs, setFormWbs] = useState("WBS-1.2")
  const [uploadedBillUrl, setUploadedBillUrl] = useState<string | null>(null)
  const [uploadedBillName, setUploadedBillName] = useState<string | null>(null)

  // Fetch materials and photos
  const fetchMaterialsAndPhotos = async () => {
    if (!activeProjectId || !token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // 1. Fetch materials
      const matRes = await fetch(getApiUrl(`/api/v1/materials/log?project_id=${activeProjectId}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (matRes.ok) {
        const matData = await matRes.json()
        setMaterials(matData.items || [])
        setTotalExpenditure(matData.total_expenditure || 0)
        setCategoryTotals(matData.category_totals || {})
      }

      // 2. Fetch photos
      const photoRes = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/photos`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (photoRes.ok) {
        const photoData = await photoRes.json()
        setPhotos(photoData || [])
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project records.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterialsAndPhotos()
  }, [activeProjectId, token])

  // Bill photo dropzone (Store Keeper)
  const onDropBill = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !token) return
    const file = acceptedFiles[0]
    setUploadedBillName(file.name)
    try {
      const body = new FormData()
      body.append("file", file)
      if (activeProjectId) {
        body.append("project_id", activeProjectId)
      }
      const res = await fetch(getApiUrl("/api/v1/materials/upload-bill"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      if (res.ok) {
        const data = await res.json()
        setUploadedBillUrl(data.file_url)
      }
    } catch (err) {
      console.error("Bill upload error:", err)
    }
  }

  const { getRootProps: getBillRootProps, getInputProps: getBillInputProps } = useDropzone({
    onDrop: onDropBill,
    maxFiles: 1,
  })

  // Site photo dropzone (Site Engineer)
  const onDropSitePhoto = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !activeProjectId || !token) return
    const file = acceptedFiles[0]
    setIsClassifying(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch(getApiUrl(`/api/v1/projects/${activeProjectId}/photos`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      if (res.ok) {
        await fetchMaterialsAndPhotos()
      }
    } catch (err) {
      console.error("Site photo error:", err)
    } finally {
      setIsClassifying(false)
    }
  }

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps } = useDropzone({
    onDrop: onDropSitePhoto,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    maxFiles: 1,
  })

  const handleCreateMaterialLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProjectId || !token) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(getApiUrl("/api/v1/materials/log"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: activeProjectId,
          date: formDate,
          material_category: formCategory,
          item_description: formDesc || `${formCategory} delivery`,
          quantity: formQty,
          unit: formUnit,
          unit_rate: formRate,
          vendor_name: formVendor || "Site Supplier",
          invoice_number: formInvoice || "CHALLAN-PENDING",
          wbs_code: formWbs,
          bill_photo_name: uploadedBillName,
          bill_photo_url: uploadedBillUrl,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to log material delivery.")
      }

      // Reset form
      setFormDesc("")
      setUploadedBillUrl(null)
      setUploadedBillName(null)
      setShowAddForm(false)
      await fetchMaterialsAndPhotos()
    } catch (err: any) {
      setError(err.message || "Failed to create material record.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeProjectId) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Material & Cost Log" />
        <main className="p-6">
          <EmptyState
            title="No Active Project Selected"
            description="Please select an active project from the sidebar to view material delivery receipts or log new supplier invoices."
          />
        </main>
      </div>
    )
  }

  const canLogMaterial = hasPermission(["store_keeper", "project_manager", "admin"])
  const canUploadPhoto = hasPermission(["site_engineer", "project_manager", "admin"])

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        projectName={activeProject?.name ? `Materials: ${activeProject.name}` : "Material & Cost Log"}
        delayRiskDays={activeProject?.delay_days || 0}
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Top Summary Banner */}
        <div className="border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-base text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span>Material Procurement Log & Statutory Audit Proofs</span>
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Invoice Evidence Linked to WBS Packages • Real Site Rate Inflation Tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canLogMaterial && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? "CLOSE FORM" : "LOG NEW MATERIAL"}</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Material Delivery Form (Store Keeper) */}
        {showAddForm && canLogMaterial && (
          <form
            onSubmit={handleCreateMaterialLog}
            className="border border-primary/50 bg-card p-5 space-y-4"
          >
            <div className="text-xs font-mono uppercase text-primary font-semibold border-b border-border pb-2">
              Record Site Material Receipt & Delivery Challan
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="block text-muted-foreground mb-1">Receipt Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Material Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                >
                  <option value="Cement">Cement (Bags)</option>
                  <option value="Steel / Rebar">Steel / Rebar (MT)</option>
                  <option value="RMC Concrete">RMC Concrete (Cu.m)</option>
                  <option value="Sand & Aggregates">Sand & Aggregates (Brass)</option>
                  <option value="AAC Blocks">AAC Blocks (Nos)</option>
                  <option value="Electrical & MEP">Electrical & MEP</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Paint & Finishes">Paint & Finishes</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={formQty}
                  onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="Bags, MT, Cu.m, Nos"
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Unit Rate (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={formRate}
                  onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  placeholder="e.g. UltraTech Cement Depot"
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Invoice / Challan No</label>
                <input
                  type="text"
                  value={formInvoice}
                  onChange={(e) => setFormInvoice(e.target.value)}
                  placeholder="e.g. INV-2026-908"
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Linked WBS Code</label>
                <input
                  type="text"
                  value={formWbs}
                  onChange={(e) => setFormWbs(e.target.value)}
                  placeholder="e.g. WBS-1.2"
                  className="w-full px-3 py-1.5 bg-background border border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Item Description / Grade Specification
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. M25 Grade Ready Mix Concrete for Podium Casting"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border text-foreground"
                />
              </div>

              {/* Bill Attachment Dropzone */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Attach Invoice / Weighbridge Slip (Unparsed Evidence)
                </label>
                <div
                  {...getBillRootProps()}
                  className="p-3 border border-dashed border-border bg-muted/20 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input {...getBillInputProps()} />
                  <span className="text-[11px] font-mono text-muted-foreground flex items-center justify-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-primary" />
                    <span>{uploadedBillName || "Drop bill PDF/image or click to browse"}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-xs font-mono text-muted-foreground">
                Calculated Line Cost: <span className="font-bold text-foreground">{formatINR(formQty * formRate)}</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "SAVING DELIVERY LOG..." : "CONFIRM & LOG MATERIAL"}
              </button>
            </div>
          </form>
        )}

        {/* Spend KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-border bg-card">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Total Actual Material Expenditure
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-1">
              {formatINR(totalExpenditure)}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
              Across {materials.length} verified vendor receipts
            </div>
          </div>

          <div className="p-4 border border-border bg-card">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Categories Tracked
            </div>
            <div className="text-xl font-bold font-mono text-primary mt-1">
              {Object.keys(categoryTotals).length} Material Types
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
              Dynamic unit-rate inflation calculated
            </div>
          </div>

          <div className="p-4 border border-border bg-card">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Audited Site Photos
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-1">
              {photos.length} Captured
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
              Computer Vision stage verified
            </div>
          </div>
        </div>

        {/* Material Entries Table */}
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading Material Logs...</span>
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            title="No Material Invoices Logged for this Project"
            description="Store Keepers can log material delivery slips, invoices, and weighbridge receipts to feed real purchase rates into the Budget vs Actual engine."
            actionLabel={canLogMaterial ? "Log First Material Delivery" : undefined}
            onAction={canLogMaterial ? () => setShowAddForm(true) : undefined}
          />
        ) : (
          <div className="border border-border bg-card overflow-hidden">
            <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <span className="font-heading font-semibold text-xs text-foreground">
                Verified Material Log Entries
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                LOCKED RULE: Invoices preserved as unparsed audit evidence
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Entry ID</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Unit Rate</th>
                    <th className="py-2 px-3">Total Amount</th>
                    <th className="py-2 px-3">Vendor / Invoice</th>
                    <th className="py-2 px-3">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {materials.map((m) => (
                    <tr key={m.entry_id} className="hover:bg-muted/30">
                      <td className="py-2 px-3 font-semibold text-primary">{m.entry_id}</td>
                      <td className="py-2 px-3 text-muted-foreground">{m.date}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 bg-secondary border border-border text-[10px]">
                          {m.material_category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-foreground font-sans max-w-xs truncate">
                        {m.item_description}
                      </td>
                      <td className="py-2 px-3 font-semibold text-foreground">
                        {m.quantity.toLocaleString()} {m.unit}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">₹{m.unit_rate.toLocaleString()}</td>
                      <td className="py-2 px-3 font-semibold text-foreground">{formatINR(m.total_cost)}</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        <div>{m.vendor_name}</div>
                        <div className="text-[10px] text-muted-foreground/80">{m.invoice_number}</div>
                      </td>
                      <td className="py-2 px-3">
                        {m.bill_photo_url ? (
                          <a
                            href={m.bill_photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>View Bill</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Site Photos & Classification Section */}
        <div className="border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Site Inspection Photos & Structural Stage Classifier</span>
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Computer Vision heuristics classify rebar grid density vs planar finishing surfaces.
              </p>
            </div>

            {canUploadPhoto && (
              <div
                {...getPhotoRootProps()}
                className="px-3 py-1.5 bg-secondary border border-border text-foreground hover:bg-muted cursor-pointer text-xs font-mono font-medium flex items-center gap-1.5"
              >
                <input {...getPhotoInputProps()} />
                {isClassifying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-primary" />
                )}
                <span>{isClassifying ? "CLASSIFYING..." : "UPLOAD SITE PHOTO"}</span>
              </div>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="p-6 border border-dashed border-border text-center text-xs font-mono text-muted-foreground">
              No site photos uploaded for this project yet. Site Engineers can upload photos to verify work progress.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((p) => (
                <div key={p.id} className="border border-border bg-background p-3 space-y-2">
                  <div className="aspect-video bg-muted/40 relative overflow-hidden border border-border flex items-center justify-center">
                    <img
                      src={p.photo_url}
                      alt={p.stage_label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback placeholder if image not reachable
                        ;(e.target as any).style.display = "none"
                      }}
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-background/90 border border-border text-[9px] font-mono">
                      {Math.round(p.confidence_score * 100)}% CONFIDENCE
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{p.stage_label}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      Stage: <span className="font-bold text-primary">{p.predicted_stage}</span>
                    </div>
                    {p.uploaded_at && (
                      <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                        {new Date(p.uploaded_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
