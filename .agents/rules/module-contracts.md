---
description: Ensure integrity of cross-module schema contracts and prevent accidental inter-module breakages
globs: ["app/**/*", "research/**/*"]
always_on: true
---

# Module Boundaries and Contract Protection

1. **Shared Schemas are Canonical:**
   - All data exchange between Member 1 (Optimization), Member 2 (Math/Penalty), Member 3 (FastAPI/Next.js), and Member 4 (CV/OCR) passes through `app/schemas/`.
   - Never change schema field names, types, or validations without updating `ACTIVE_SPRINT.md` and noting the change for dependent members.

2. **Viva Scope Guardrails:**
   - Never implement architectural CAD drawing parsers or floor planners.
   - Computer vision progress tracking must remain a lightweight binary classification (`Structural` vs. `Finishing`) using MobileNetV2. No heavy object detection (YOLO).
   - MahaRERA PDF parsing must strictly populate an editable form (review-and-confirm pattern). Never commit unconfirmed AI extracted data directly into database or solver.
