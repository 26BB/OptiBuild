---
title: "Computer Vision & Site Progress Verification"
type: "architecture"
tags: ["cv", "mobilenetv2", "progress", "transfer-learning"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 📷 Computer Vision & Progress Verification (MobileNetV2)

> **Lead Module:** `app/cv/`  
> **Viva Defense Focus:** Transfer learning, lightweight edge inference, why YOLO was rejected, human-in-the-loop review.

§

## 🎯 Purpose & Scope

Site engineers upload weekly site photos from their mobile browser. The system must verify whether the reported project phase matches physical reality:
* **Structural Phase:** Foundation, RCC columns, beams, slab casting, formwork, rebar.
* **Finishing Phase:** Brickwork, plastering, plumbing, electrical conduit, tiling, painting.

§

## 🚫 Why YOLOv8 Was Discarded (Examiner Defense)

During Review 1, the panel agreed that object-detection models (YOLOv8) are poorly suited for construction progress tracking because:
1. Detecting 50 individual hardhats or cement bags does not tell you if the 4th floor slab was poured.
2. Construction sites have severe dust, variable lighting, and occlusions.
3. High computational overhead: YOLO requires heavy GPU infrastructure on mobile sites.
4. **OptiBuild Solution:** A lightweight binary classifier via **MobileNetV2** transfer learning. It achieves >92% accuracy on stage validation while running in milliseconds on CPU/mobile.

§

## 🔒 Human-in-the-Loop Guardrail

* AI never overrides human site engineers silently.
* If MobileNetV2 detects a stage mismatch (e.g., site engineer logged "Finishing" but image classifier flags "Structural" with 95% confidence):
* A warning flag is displayed on the dashboard for the project owner to review.
* Manual override with justification is always permitted.

§
