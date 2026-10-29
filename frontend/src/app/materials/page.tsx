"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { motion, type Variants } from "framer-motion"
import { getApiUrl } from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { PermissionDenied } from "@/components/ui/PermissionDenied"
import { useAuth } from "@/context/AuthContext"
import { formatINR } from "@/lib/utils"
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
  Receipt,
  Camera,
  UploadCloud,
  Paperclip,
  Plus,
  AlertCircle,
  Loader2,
  Search,
  Lock,
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

const CATEGORIES = [
  "All",
  "Cement",
  "Steel / Rebar",
  "RMC Concrete",
  "Sand & Aggregates",
  "AAC Blocks",
  "Electrical & MEP",
  "Plumbing",
  "Paint & Finishes",
]

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
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
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")

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

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.material_category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.vendor_name.toLowerCase().includes(query) ||
        (item.invoice_number && item.invoice_number.toLowerCase().includes(query)) ||
        item.item_description.toLowerCase().includes(query) ||
        (item.wbs_code && item.wbs_code.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [materials, selectedCategory, searchQuery])

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

      // Reset form & close sheet
      setFormDesc("")
      setUploadedBillUrl(null)
      setUploadedBillName(null)
      setIsSheetOpen(false)
      await fetchMaterialsAndPhotos()
    } catch (err: any) {
      setError(err.message || "Failed to create material record.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Permission check
  if (!hasPermission(["store_keeper", "site_engineer", "project_manager", "admin", "accountant", "owner"])) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar projectName="Material & Cost Log" />
        <main className="p-6">
          <PermissionDenied
            title="Access Restricted"
            description="Viewing and logging materials or site photos is restricted to authorized field engineers, accountants, and project managers."
            requiredRoles={["store_keeper", "site_engineer", "project_manager", "admin", "accountant", "owner"]}
          />
        </main>
      </div>
    )
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

      <motion.main
        className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Top Header Card */}
        <div className="border border-border bg-card p-4 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="font-heading font-semibold text-base text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span>Material Procurement Log & Statutory Audit Proofs</span>
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Invoice Evidence Linked to WBS Packages • Real Site Rate Inflation Tracking
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {canLogMaterial && (
              <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors rounded-[4px] shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>LOG NEW MATERIAL</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono rounded-[4px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Spend KPI Cards Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Total Actual Material Expenditure
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">
              <Counter value={totalExpenditure} isCurrency />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Across {materials.length} verified vendor receipts
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Categories Tracked
            </div>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              <Counter value={Object.keys(categoryTotals).length} suffix=" Categories" />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Dynamic unit-rate inflation tracked
            </div>
          </div>

          <div className="p-4 border border-border bg-card rounded-[4px] shadow-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground font-medium">
              Audited Site Photos
            </div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">
              <Counter value={photos.length} suffix=" Captured" />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">
              Computer Vision stage verified
            </div>
          </div>
        </div>

        {/* Locked Rule Audit Notice */}
        <div className="border border-border bg-secondary/40 p-3.5 rounded-[4px] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>LOCKED RULE: Bill photos and weighbridge slips are stored as unparsed evidentiary records for statutory audit trails.</span>
          </div>
          <Badge variant="outline" className="border-border text-[10px] bg-background">
            EVIDENCE ONLY
          </Badge>
        </div>

        {/* Material Entries Table with Category Filter & Search */}
        {isLoading ? (
          <div className="p-20 text-center text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="uppercase tracking-wider">Loading Material Procurement Logs...</span>
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            title="No Material Invoices Logged for this Project"
            description="Store Keepers can log material delivery slips, invoices, and weighbridge receipts to feed real purchase rates into the Budget vs Actual engine."
            actionLabel={canLogMaterial ? "Log First Material Delivery" : undefined}
            onAction={canLogMaterial ? () => setIsSheetOpen(true) : undefined}
          />
        ) : (
          <div className="border border-border bg-card rounded-[4px] overflow-hidden shadow-sm space-y-0">
            {/* Filter and Search Bar */}
            <div className="p-3.5 bg-muted/20 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-mono whitespace-nowrap transition-colors rounded-[4px] border ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary/60"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vendor, invoice, spec..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-mono bg-background border border-border pl-8 pr-3 py-1.5 text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">Entry ID</th>
                    <th className="py-2.5 px-3.5 font-semibold">Date</th>
                    <th className="py-2.5 px-3.5 font-semibold">Category</th>
                    <th className="py-2.5 px-3.5 font-semibold">Description</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Quantity</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Unit Rate</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Total Amount</th>
                    <th className="py-2.5 px-3.5 font-semibold">Vendor / Invoice</th>
                    <th className="py-2.5 px-3.5 font-semibold">Evidence Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground font-mono">
                        No material entries match category &apos;{selectedCategory}&apos; or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((m) => (
                      <tr key={m.entry_id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3.5 font-bold text-primary">{m.entry_id}</td>
                        <td className="py-3 px-3.5 text-muted-foreground">{m.date}</td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 bg-secondary border border-border text-[10px] rounded-[3px]">
                            {m.material_category}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-foreground font-sans font-medium max-w-xs truncate">
                          {m.item_description}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-foreground">
                          {m.quantity.toLocaleString()} {m.unit}
                        </td>
                        <td className="py-3 px-3.5 text-right text-muted-foreground">
                          {formatINR(m.unit_rate)}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-foreground">
                          {formatINR(m.total_cost)}
                        </td>
                        <td className="py-3 px-3.5 text-muted-foreground">
                          <div className="text-foreground font-medium">{m.vendor_name}</div>
                          <div className="text-[10px] text-muted-foreground/80">{m.invoice_number}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          {m.bill_photo_url ? (
                            <a
                              href={m.bill_photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>View Slip</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-muted/10 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Showing {filteredMaterials.length} of {materials.length} receipts</span>
              <span>Total Displayed: {formatINR(filteredMaterials.reduce((acc, curr) => acc + curr.total_cost, 0))}</span>
            </div>
          </div>
        )}

        {/* Site Photos & Classification Section */}
        <div className="border border-border bg-card p-4 rounded-[4px] space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Site Inspection Photos & Structural Stage Classifier</span>
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Computer Vision heuristics classify rebar grid density vs planar finishing surfaces
              </p>
            </div>

            {canUploadPhoto && (
              <div
                {...getPhotoRootProps()}
                className="px-3 py-1.5 bg-secondary border border-border text-foreground hover:bg-secondary/80 cursor-pointer text-xs font-mono font-medium flex items-center gap-1.5 rounded-[4px] transition-colors self-start sm:self-auto shadow-sm"
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
            <div className="p-8 border border-dashed border-border text-center text-xs font-mono text-muted-foreground rounded-[4px]">
              No site photos uploaded for this project yet. Site Engineers can upload photos to verify work progress.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((p) => (
                <div key={p.id} className="border border-border bg-background p-3 space-y-2 rounded-[4px] shadow-xs">
                  <div className="aspect-video bg-muted/30 relative overflow-hidden border border-border rounded-[2px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photo_url}
                      alt={p.stage_label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as any).style.display = "none"
                      }}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-background/95 border border-border text-[10px] font-mono font-bold rounded-[3px] shadow-xs">
                      {Math.round(p.confidence_score * 100)}% CONFIDENCE
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground font-heading">{p.stage_label}</div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      Stage: <span className="font-bold text-primary">{p.predicted_stage}</span>
                    </div>
                    {p.uploaded_at && (
                      <div className="text-[10px] font-mono text-muted-foreground mt-1">
                        Recorded: {new Date(p.uploaded_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slide-Over Sheet for Logging Material Delivery */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Record Material Delivery Receipt</SheetTitle>
              <SheetDescription>
                Log physical delivery challan or weighbridge receipt to calibrate project cost slopes.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleCreateMaterialLog} className="space-y-4 py-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Receipt Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Material Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground block font-medium">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={formQty}
                    onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground block font-medium">Unit of Measure</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Bags, MT, Cu.m"
                    className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Unit Rate (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={formRate}
                  onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Vendor / Supplier</label>
                <input
                  type="text"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  placeholder="e.g. UltraTech Cement Depot"
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Invoice / Challan No</label>
                <input
                  type="text"
                  value={formInvoice}
                  onChange={(e) => setFormInvoice(e.target.value)}
                  placeholder="e.g. INV-2026-908"
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Linked WBS Code</label>
                <input
                  type="text"
                  value={formWbs}
                  onChange={(e) => setFormWbs(e.target.value)}
                  placeholder="e.g. WBS-1.2"
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">Item Description / Spec</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. OPC 53 Grade Cement for Slab Casting"
                  className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-[4px] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Bill Attachment Dropzone */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] uppercase text-muted-foreground block font-medium">
                  Attach Invoice / Weighbridge Slip
                </label>
                <div
                  {...getBillRootProps()}
                  className="p-4 border border-dashed border-border bg-muted/20 text-center cursor-pointer hover:bg-muted/40 transition-colors rounded-[4px]"
                >
                  <input {...getBillInputProps()} />
                  <span className="text-[11px] font-mono text-muted-foreground flex items-center justify-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-primary" />
                    <span>{uploadedBillName || "Drop bill PDF/image or click to browse"}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/75 block">
                  Preserved as unparsed evidence for statutory auditing.
                </span>
              </div>

              <div className="p-3 bg-secondary/50 border border-border rounded-[4px] flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Calculated Line Cost:</span>
                <span className="font-bold text-foreground text-sm">{formatINR(formQty * formRate)}</span>
              </div>

              <SheetFooter className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-primary text-primary-foreground font-mono text-xs font-medium hover:bg-primary/90 transition-colors rounded-[4px] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? "SAVING DELIVERY LOG..." : "CONFIRM & LOG MATERIAL"}
                </button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </motion.main>
    </div>
  )
}
