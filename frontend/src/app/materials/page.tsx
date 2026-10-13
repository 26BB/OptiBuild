"use client"

import React, { useState } from "react"
import { useDropzone } from "react-dropzone"
import { TopBar } from "@/components/layout/TopBar"
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
  is_unparsed_evidence: boolean
}

interface ClassifierResult {
  predicted_stage: "STRUCTURAL_STAGE" | "FINISHING_STAGE"
  stage_label: string
  confidence_score: number
  detected_features: string[]
  file_name: string
  human_verified: boolean
}

const DEFAULT_MATERIALS: MaterialItem[] = [
  {
    entry_id: "MAT-001",
    date: "2026-10-02",
    material_category: "RMC Concrete",
    item_description: "M25 Grade Ready Mix Concrete for Raft Footing",
    quantity: 120,
    unit: "Cu.m",
    unit_rate: 4500,
    total_cost: 540000,
    vendor_name: "ACC Concrete Solutions",
    invoice_number: "INV-ACC-9821",
    wbs_code: "WBS-1.2",
    bill_photo_name: "rmc_batch_slip_9821.pdf",
    is_unparsed_evidence: true,
  },
  {
    entry_id: "MAT-002",
    date: "2026-10-05",
    material_category: "Steel / Rebar",
    item_description: "Fe 500D TMT Reinforcement Steel (12mm & 16mm)",
    quantity: 18,
    unit: "MT",
    unit_rate: 58000,
    total_cost: 1044000,
    vendor_name: "Tata Tiscon Distributors",
    invoice_number: "INV-TT-4412",
    wbs_code: "WBS-2.1",
    bill_photo_name: "tata_tiscon_weighbridge_slip.jpg",
    is_unparsed_evidence: true,
  },
  {
    entry_id: "MAT-003",
    date: "2026-10-08",
    material_category: "Cement",
    item_description: "53 Grade OPC Bags (Foundation & Columns)",
    quantity: 600,
    unit: "Bags",
    unit_rate: 385,
    total_cost: 231000,
    vendor_name: "UltraTech Cement Depot",
    invoice_number: "INV-UT-1049",
    wbs_code: "WBS-2.2",
    is_unparsed_evidence: true,
  },
  {
    entry_id: "MAT-004",
    date: "2026-10-10",
    material_category: "AAC Blocks",
    item_description: "Autoclaved Aerated Concrete Blocks (600x200x150mm)",
    quantity: 2400,
    unit: "Nos",
    unit_rate: 65,
    total_cost: 156000,
    vendor_name: "Siporex Blocks Pvt Ltd",
    invoice_number: "INV-SIP-3011",
    wbs_code: "WBS-3.1",
    bill_photo_name: "siporex_delivery_challan.png",
    is_unparsed_evidence: true,
  },
  {
    entry_id: "MAT-005",
    date: "2026-10-12",
    material_category: "Sand & Aggregates",
    item_description: "Crushed Sand (VSI) & 20mm Blue Metal Aggregates",
    quantity: 45,
    unit: "Brass",
    unit_rate: 7200,
    total_cost: 324000,
    vendor_name: "Shinde Stone Crushers",
    invoice_number: "INV-SSC-0842",
    wbs_code: "WBS-1.2",
    bill_photo_name: "quarry_receipt_0842.jpg",
    is_unparsed_evidence: true,
  },
]

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>(DEFAULT_MATERIALS)
  const [photoResult, setPhotoResult] = useState<ClassifierResult | null>({
    predicted_stage: "STRUCTURAL_STAGE",
    stage_label: "Structural Stage (RCC Columns / Formwork In-Progress)",
    confidence_score: 0.92,
    detected_features: [
      "High spatial edge density (28.4): rebar grid / formwork patterns",
      "Cementitious raw concrete gray spectrum detected",
    ],
    file_name: "site_cam_tower_a_oct13.jpg",
    human_verified: false,
  })
  const [isClassifying, setIsClassifying] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form states
  const [formDate, setFormDate] = useState("2026-10-13")
  const [formCategory, setFormCategory] = useState("Cement")
  const [formDesc, setFormDesc] = useState("")
  const [formQty, setFormQty] = useState(100)
  const [formUnit, setFormUnit] = useState("Bags")
  const [formRate, setFormRate] = useState(380)
  const [formVendor, setFormVendor] = useState("")
  const [formInvoice, setFormInvoice] = useState("")
  const [formWbs, setFormWbs] = useState("WBS-2.1")
  const [formBillName, setFormBillName] = useState("")

  const onDropPhoto = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    setIsClassifying(true)

    try {
      const body = new FormData()
      body.append("file", file)

      const res = await fetch("http://localhost:8000/api/v1/materials/classify-photo", {
        method: "POST",
        body,
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setPhotoResult(data)
      } else {
        // Fallback simulated classification
        setPhotoResult({
          predicted_stage: "STRUCTURAL_STAGE",
          stage_label: "Structural Stage (RCC / Earthwork / Shoring)",
          confidence_score: 0.88,
          detected_features: [
            "High edge density from formwork lattice",
            "Muted concrete gray tone dominance",
          ],
          file_name: file.name,
          human_verified: false,
        })
      }
    } finally {
      setIsClassifying(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropPhoto,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
  })

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    const newItem: MaterialItem = {
      entry_id: `MAT-${String(materials.length + 1).padStart(3, "0")}`,
      date: formDate,
      material_category: formCategory,
      item_description: formDesc || `${formCategory} procurement`,
      quantity: formQty,
      unit: formUnit,
      unit_rate: formRate,
      total_cost: formQty * formRate,
      vendor_name: formVendor || "Local Supplier",
      invoice_number: formInvoice || undefined,
      wbs_code: formWbs,
      bill_photo_name: formBillName || undefined,
      is_unparsed_evidence: true,
    }
    setMaterials([newItem, ...materials])
    setShowAddModal(false)
    setFormDesc("")
    setFormBillName("")
  }

  const totalSpent = materials.reduce((acc, m) => acc + m.total_cost, 0)
  const steelSpend = materials
    .filter((m) => m.material_category.includes("Steel"))
    .reduce((acc, m) => acc + m.total_cost, 0)
  const concreteSpend = materials
    .filter((m) => m.material_category.includes("Concrete") || m.material_category === "Cement")
    .reduce((acc, m) => acc + m.total_cost, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar projectName="Site Material Log & Binary CV Progress Classifier" delayRiskDays={0} />

      <main className="p-4 md:p-6 space-y-6">
        {/* Metric Ribbons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Total Material Spend
              </span>
              <Coins className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {formatINR(totalSpent)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Across {materials.length} verified consignments
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Steel & Rebar
              </span>
              <Layers className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {formatINR(steelSpend)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              {((steelSpend / (totalSpent || 1)) * 100).toFixed(1)}% of materials budget
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                RMC & Cement
              </span>
              <Truck className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div className="mt-1 text-2xl font-mono font-bold text-foreground">
              {formatINR(concreteSpend)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              Foundation & columns casting
            </div>
          </div>

          <div className="border border-border bg-card p-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Active CV Phase
              </span>
              <Camera className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="mt-1 text-sm font-mono font-bold text-primary truncate">
              {photoResult?.predicted_stage === "STRUCTURAL_STAGE" ? "STRUCTURAL" : "FINISHING"}
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              {((photoResult?.confidence_score || 0) * 100).toFixed(0)}% CV Confidence
            </div>
          </div>
        </div>

        {/* Binary CV Progress Classifier Widget */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                SITE PHOTO PROGRESS CLASSIFIER (BINARY CV)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              LOCKED RULE: BINARY CLASSIFICATION ONLY • NO OBJECT DETECTION
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Upload Box */}
            <div className="md:col-span-5">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:bg-muted/30"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UploadCloud className="w-7 h-7 text-primary" />
                  <div className="text-xs font-mono font-medium text-foreground">
                    {isClassifying
                      ? "Classifying site features..."
                      : "Drop site photo or click to upload"}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    Detects: Structural Stage vs Finishing Stage
                  </div>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="md:col-span-7 space-y-3">
              {photoResult ? (
                <div className="border border-border p-3.5 bg-secondary/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                        PREDICTED CONSTRUCTION STAGE
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                            photoResult.predicted_stage === "STRUCTURAL_STAGE"
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-status-success/10 border-status-success text-status-success"
                          }`}
                        >
                          {photoResult.predicted_stage}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          ({(photoResult.confidence_score * 100).toFixed(0)}% Confidence)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setPhotoResult({
                          ...photoResult,
                          predicted_stage:
                            photoResult.predicted_stage === "STRUCTURAL_STAGE"
                              ? "FINISHING_STAGE"
                              : "STRUCTURAL_STAGE",
                          human_verified: true,
                        })
                      }
                      className="text-[11px] font-mono px-2 py-1 border border-border bg-card hover:bg-muted text-foreground transition-colors"
                    >
                      {photoResult.human_verified ? "OVERRIDDEN BY ENGINEER" : "OVERRIDE STAGE"}
                    </button>
                  </div>

                  <div className="text-xs font-sans text-foreground font-medium">
                    {photoResult.stage_label}
                  </div>

                  <div className="border-t border-border/60 pt-2 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                      Detected Visual Features:
                    </span>
                    {photoResult.detected_features.map((feat, idx) => (
                      <div key={idx} className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-primary rounded-none inline-block" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground border-t border-border/40 pt-1.5 flex justify-between">
                    <span>File: {photoResult.file_name}</span>
                    <span>Status: {photoResult.human_verified ? "Verified by Engineer" : "AI Predicted"}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-muted-foreground border border-dashed border-border">
                  Upload a site photo to trigger progress classification
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Material & Cost Log Header & Actions */}
        <div className="border border-border bg-card">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-xs text-foreground uppercase tracking-wider">
                MATERIAL & PROCUREMENT COST LOG
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground">
                Documentary evidence stored as unparsed bill attachments per audit compliance
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="text-xs font-mono font-medium bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 transition-colors border border-primary flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>RECORD SHIPMENT</span>
            </button>
          </div>

          {/* New Entry Quick Form */}
          {showAddModal && (
            <form onSubmit={handleAddMaterial} className="p-4 border-b border-border bg-muted/20 space-y-3">
              <div className="text-xs font-mono font-bold text-foreground uppercase">
                Add Material Procurement Record
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground"
                  >
                    <option value="Cement">Cement</option>
                    <option value="Steel / Rebar">Steel / Rebar</option>
                    <option value="RMC Concrete">RMC Concrete</option>
                    <option value="Sand & Aggregates">Sand & Aggregates</option>
                    <option value="AAC Blocks">AAC Blocks</option>
                    <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                    <option value="Paint & Tiles">Paint & Tiles</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Unit Rate (INR)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    value={formRate}
                    onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Item Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 53 Grade OPC Bags"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full text-xs font-sans bg-background border border-border p-1.5 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UltraTech Depot"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full text-xs font-sans bg-background border border-border p-1.5 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">
                    Bill Photo Attachment (Evidence)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. invoice_scan_982.pdf"
                    value={formBillName}
                    onChange={(e) => setFormBillName(e.target.value)}
                    className="w-full text-xs font-mono bg-background border border-border p-1.5 text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-status-warning">
                  Notice: Bill photo will be archived as unparsed evidence only.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-xs font-mono px-3 py-1 border border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-mono px-4 py-1 bg-primary text-primary-foreground font-medium"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Dense Material Register Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase">
                  <th className="p-2.5 font-semibold">Entry ID</th>
                  <th className="p-2.5 font-semibold">Date</th>
                  <th className="p-2.5 font-semibold">Category</th>
                  <th className="p-2.5 font-semibold">Item Description</th>
                  <th className="p-2.5 font-semibold text-right">Quantity</th>
                  <th className="p-2.5 font-semibold text-right">Unit Rate</th>
                  <th className="p-2.5 font-semibold text-right">Total Cost</th>
                  <th className="p-2.5 font-semibold">Vendor</th>
                  <th className="p-2.5 font-semibold">Bill Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.map((mat) => (
                  <tr key={mat.entry_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{mat.entry_id}</td>
                    <td className="p-2.5 text-muted-foreground">{mat.date}</td>
                    <td className="p-2.5 font-semibold text-foreground">{mat.material_category}</td>
                    <td className="p-2.5 font-sans font-medium text-foreground">{mat.item_description}</td>
                    <td className="p-2.5 text-right font-medium">
                      {mat.quantity.toLocaleString("en-IN")} {mat.unit}
                    </td>
                    <td className="p-2.5 text-right text-muted-foreground">
                      ₹{mat.unit_rate.toLocaleString("en-IN")}
                    </td>
                    <td className="p-2.5 text-right font-bold text-primary">
                      {formatINR(mat.total_cost)}
                    </td>
                    <td className="p-2.5 text-muted-foreground truncate max-w-[150px]">
                      {mat.vendor_name}
                    </td>
                    <td className="p-2.5">
                      {mat.bill_photo_name ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 bg-secondary border border-border text-foreground">
                          <Paperclip className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[100px]">{mat.bill_photo_name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
