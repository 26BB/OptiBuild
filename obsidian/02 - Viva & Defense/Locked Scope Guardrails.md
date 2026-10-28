---
title: "Locked Scope Guardrails"
type: "viva"
tags: ["scope", "guardrails", "review-1", "viva-rules"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🔒 Locked Scope Guardrails (Non-Negotiable Boundaries)

> **Approved at Review 1:** Under no circumstances should any team member or AI agent alter or reopen these boundaries. Violating these risks project rejection by examiners.

§

## 🛑 The 6 Locked Scope Rules

| Rule | Description | Why It Was Locked |
|---|---|---|
| ❌ **1. NO Flat / Floor-Plan CAD Design** | OptiBuild does **not** generate 2D/3D floor layouts, CAD drawings, or BIM models. | Floor plan design belongs to Architecture/Civil Engineering. |
| ❌ **2. Drawings are Attach-Only** | DWG/CAD/PDF architectural files can only be uploaded as static attachments; they are **never parsed**. | Parsing vector CAD files is a separate multi-year research domain. |
| ❌ **3. No Silent / Blind AI Commits** | MahaRERA PDF parsing (`pdfplumber`) pre-fills a web form. The user must review, edit, and confirm values. | Financial and legal optimization must never run on hallucinated PDF extractions. |
| ❌ **4. Binary CV Classification Only** | We use MobileNetV2 (Structural vs Finishing). Heavy object detection (YOLOv8) is discarded. | Detecting loose hardhats does not reflect project milestone progress and is fragile on site. |
| ❌ **5. Manual Material Entry** | Site engineers enter quantities and costs manually; receipts are uploaded as photo attachments only. | OCR receipt parsing is error-prone on handwritten Indian construction chits. |
| ❌ **6. Responsive Web App Only** | Single web application (Desktop for Builder, Mobile-responsive for Site Engineer). No native mobile app. | Responsive Next.js is fully sufficient for SPPU B.E. final year viva scope. |

§
