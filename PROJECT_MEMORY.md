# 🏗️ OptiBuild — Project Memory & Context Hub

> **System & Agent Context:** This document serves as the persistent project memory, technical specification, and progress tracker for **OptiBuild** (B.E. Final Year Computer Engineering Project, SPPU). All agents and developers must consult and update this document to maintain seamless continuity.

§

## 📌 1. Project Overview & Context
- **Project Name:** OptiBuild
- **Degree / University:** B.E. Computer Engineering, Savitribai Phule Pune University (SPPU)
- **Domain:** Construction-Tech, Operations Research, Applied Optimization & Heuristic AI
- **Primary Team:** Divyal, Bhushan Bhosale & team
- **Current Milestone:** Stage 1 (Review 2 prep, mathematical modeling, base paper justification, standalone scheduling engine build)
- **Previous Rejection Context:** An earlier idea (*SLO-driven canary deployment controller for DevOps*) was rejected by the SPPU panel for being a generic wrapper over Prometheus/Grafana. OptiBuild was conceptualized, defended, and **approved at Review 1** due to its algorithmic depth and clear problem domain.

§

## 🎯 2. Core Problem Statement & Market Gap
- **The Construction Penalty Crisis:** In India, real estate builders face massive statutory financial penalties under **MahaRERA (Section 18)** when projects suffer delays. Builders must pay homebuyers monthly interest at **SBI MCLR + 2%** on total funds collected.
- **The Market Gap:** Existing market tools (**In4Suite, RECOS, Ramsetu, BuildNext, Procore, Primavera P6**) only provide digitised paperwork, manual Gantt charts, ERP tracking, or RERA compliance reports. **None** provide automated, algorithmically generated resource-constrained schedules coupled with an automated **delay-penalty vs. crash-cost decision engine**.
- **OptiBuild Value Proposition:** 
  1. Ingests basic project parameters (area, floors, flats, target deadline).
  2. Generates an optimized schedule respecting crew and resource limits via **CPM + Genetic Algorithm (GA)**.
  3. Detects schedule drift from site updates.
  4. Formulates a concrete financial recommendation: **Crash critical activities (overtime/extra crews)** or **Accept the MahaRERA penalty**, selecting whichever preserves project capital.

§

## 🏛️ 3. Architectural Blueprint & The "Hero Module"
To ensure the project is not rejected by academic examiners as "several small APIs stapled together", OptiBuild is strictly organized around **one mathematically rigorous Hero Module**:

```
                             ┌──────────────────────────────────────────────┐
                             │                 HERO MODULE                  │
                             │  • CPM Precedence Analysis (NetworkX)        │
                             │  • Resource-Constrained GA Engine (DEAP)     │
                             │  • Penalty-vs-Crash Cost Optimizer          │
                             │  • Exact Solver Benchmarking (CP-SAT)        │
                             └──────────────────────┬───────────────────────┘
                                                    │
             ┌──────────────────────┬───────────────┴──────────────┬──────────────────────┐
             ▼                      ▼                              ▼                      ▼
       [Data Ingestion]      [WBS Estimation]              [Progress Tracking]       [Dashboard]
       - Manual Web Form     - Parametric ratios           - Weekly site photos      - Budget vs Actual
       - MahaRERA PDF (OCR)    (Approximate rules,           (Binary MobileNetV2:     - Delay alerts &
         Review-and-Confirm    not civil takeoff)            Structural vs Finish)     recovery options
```

§

## 🔒 4. Locked Scope Guardrails (DO NOT RE-OPEN OR ALTER)
These architectural boundaries were locked during Review 1 and supervisor consultations:
1. **NO Architectural Flat Design:** OptiBuild does **not** design flats, floor layouts, or CAD/BIM drawings. It is a scheduling & optimization engine, not an architectural generator.
2. **Architect Drawings are Attach-Only:** DWG/CAD/PDF architectural files may be uploaded as attachments for reference/storage only; they are **never parsed** (parsing CAD is a separate civil/computer vision field).
3. **No Silent / Blind AI Commits:** MahaRERA PDF parsing (`pdfplumber` / OCR) extracts project parameters to **pre-fill a form**. The user must review, edit, and confirm the numbers before they enter the optimizer.
4. **Binary CV Classification Only:** Progress verification uses a lightweight binary classifier (**Structural Phase vs. Finishing Phase** via MobileNetV2). High-overhead object detection (YOLOv8) is discarded. Manual overrides are always provided.
5. **Material / Cost Logs:** Site engineers log material entries manually. Receipts/bills are uploaded as image attachments for evidence only (no OCR invoice parsing required).
6. **Web Application Only:** A single responsive web app. Desktop UI for the Builder / Project Owner; Mobile-responsive UI for the Site Engineer. No native mobile app needed for B.E. scope.

§

## 🧮 5. Mathematical Formulations & Algorithms

### A. Critical Path Method (CPM)
- Activity network represented as a Directed Acyclic Graph (DAG) $G = (V, E)$.
- **Forward Pass:**
  $$ES_i = \max_{p \in \text{Pred}(i)} (EF_p), \quad EF_i = ES_i + d_i$$
- **Backward Pass:**
  $$LF_i = \min_{s \in \text{Succ}(i)} (LS_s), \quad LS_i = LF_i - d_i$$
- **Total Float:**
  $$TF_i = LS_i - ES_i = LF_i - EF_i$$
- Activities with $TF_i = 0$ constitute the **Critical Path**.

### B. Resource-Constrained Genetic Algorithm (DEAP)
- **Chromosome Representation:** Permutation / topological sort of activities subject to precedence constraints with resource mode assignments.
- **Constraints:** Daily resource usage $\sum_{i \in \text{Active}(t)} R_{i, k} \le R_{k, \text{max}}$ for all resource types $k$ (e.g., masons, carpenters, concrete crews).
- **Fitness Function:**
  $$\text{Minimize } Z = C_{\text{indirect}}(T) + \sum_{i=1}^N C_{\text{direct}}(i) + C_{\text{crash}} + \text{Penalty}_{\text{RERA}}(T)$$
  where $T$ is the total project makespan.

### C. MahaRERA Delay Penalty vs. Crash Cost Optimizer
- **MahaRERA Penalty (per Section 18):**
  $$\text{Penalty}_{\text{RERA}} = \text{Amount Collected} \times (\text{SBI MCLR} + 2\%) \times \frac{\text{Delay Days}}{365}$$
- **Crash Cost Calculation:**
  For critical activity $i$ with normal duration $D_{n, i}$, crash duration $D_{c, i}$, normal cost $C_{n, i}$, and crash cost $C_{c, i}$:
  $$\text{Cost Slope}_i = \frac{C_{c, i} - C_{n, i}}{D_{n, i} - D_{c, i}}$$
  $$\text{Total Crash Cost} = \sum_{i \in \text{Crashed}} \left( \text{Cost Slope}_i \times \Delta d_i \right)$$
- **Decision Engine Rule:**
  - If $\text{Total Crash Cost} < \text{Penalty}_{\text{RERA}} \implies \textbf{RECOMMEND: Crash Critical Activities (Overtime/Extra Crews)}$
  - If $\text{Penalty}_{\text{RERA}} \le \text{Total Crash Cost} \implies \textbf{RECOMMEND: Accept Delay Penalty (Cheaper than Crashing)}$

### D. Exact Solver Benchmarking
- The heuristic GA results are benchmarked against **Google OR-Tools CP-SAT** (Constraint Programming / Boolean Satisfiability) on identical problem instances to empirically validate optimality gap and execution runtime.

§

## 📚 6. Academic Papers & Faculty Defense

### Core Reference Papers (SPPU Guide Hardcopy Pack)
1. **Time-Cost Tradeoff via GA:** *Li, H., & Love, P. E. D. (1999)* — *Using genetic algorithms to solve time-cost trade-off problems.* Journal of Construction Engineering and Management. (Justifies GA for crashing vs delay trade-offs).
2. **Resource-Constrained Construction GA:** *Leu, S. S., & Yang, C. H. (1999)* — *GA-based multicriteria optimal model for construction scheduling.* (Justifies CPM + resource allocation limits).
3. **Python Implementation Benchmark:** *Construction Project Scheduling Optimization with Time-Cost Trade-Off Based on Genetic Algorithm in Python* (NetworkX-CPM + GA hybrid). Demonstrates 3.49% cost reduction and 34.82% duration reduction.
4. **RCPSP Standard Benchmark:** *Hartmann, S. (1998)* — *A competitive genetic algorithm for resource-constrained project scheduling.* Naval Research Logistics. (Justifies benchmarking against standard PSPLIB instances and CP-SAT).

### Faculty Viva Defense: Computer Engineering vs. Civil
- **Distribution of Tech:**
  - **~70% Algorithms & Optimization:** Graph algorithms (CPM DAGs), Metaheuristics (DEAP Genetic Algorithm), Combinatorial Optimization (OR-Tools CP-SAT benchmarking).
  - **~20% Applied AI / CV:** MobileNetV2 transfer learning for binary stage classification, OCR text extraction pipeline.
  - **~10% Software Engineering:** Full-stack FastAPI, async queues, PostgreSQL schemas, responsive dashboard.
- **Examiner Pitch:**
  > *"OptiBuild is a Computer Engineering project applying Operations Research and Applied Heuristics to the Resource-Constrained Project Scheduling Problem (RCPSP), which is mathematically NP-hard. Civil engineering merely provides the domain inputs (durations and dependencies); the core engineering is the graph theory, genetic algorithm chromosome encoding, fitness convergence, and exact solver benchmarking."*

§

## 🛠️ 7. Technology Stack
- **Optimization & Core:** Python 3.10+, `networkx` (CPM), `deap` (Genetic Algorithm), `ortools` (CP-SAT Solver).
- **Backend & APIs:** FastAPI, Pydantic, SQLAlchemy, PostgreSQL.
- **Document & Image Processing:** `pdfplumber`, `pytesseract`, `torch` / `torchvision` (MobileNetV2).
- **Frontend:** Next.js (React), Tailwind CSS, Lucide icons, Chart.js / Vis.js for Gantt visualization.
- **Infrastructure:** Docker, PostgreSQL, free-tier hosting (Render / Vercel), Kaggle / Colab for model weights.

§

## 👥 8. User Roles & Workflows
1. **Builder / Project Owner (Desktop Web):**
   - Creates project, enters building parameters (or uploads MahaRERA PDF to pre-fill).
   - Reviews and edits parametric WBS and budget.
   - Triggers GA schedule optimizer; views Gantt chart and resource histograms.
   - Monitors Budget vs. Actual dashboard; reviews delay alerts and Crash vs. Penalty recommendations.
2. **Site Engineer (Mobile Web):**
   - Logs weekly milestone completions.
   - Uploads weekly site photo (verified by binary CV).
   - Logs material purchase entry (quantity, cost, attaches bill photo for evidence).

§

## 🗺️ 9. Master Roadmap & Progress Tracker

| Milestone | Sub-task | Status | Priority | Jira Ticket & Artifacts |
|---|---|:---:|:---:|---|
| **Phase 1: Core Hero Engine** | 1.1 Sample dataset definition (15-20 RCC tasks) | ⏳ Pending | High | `[SCRUM-10]` Define durations, predecessors, crew types |
| | 1.2 CPM Engine (NetworkX) | ⏳ Pending | High | `[SCRUM-10]` Forward/backward pass, float calculation |
| | 1.3 Resource-Constrained GA (DEAP) | ⏳ Pending | High | `[SCRUM-10]` Fitness evaluation, crossover/mutation |
| | 1.4 CP-SAT Exact Solver Benchmark | ⏳ Pending | High | `[SCRUM-11]` Compare makespan & runtime vs exact solver |
| | 1.5 Penalty vs. Crash Cost Optimizer | ⏳ Pending | High | `[SCRUM-12]` SBI MCLR + 2% vs activity crash cost slopes |
| **Phase 2: Data Ingestion & WBS** | 2.1 Parametric WBS Generator | ⏳ Pending | Medium | Area & floor ratios -> task quantities |
| | 2.2 Manual Project Setup Form | ⏳ Pending | Medium | Form validation & config |
| | 2.3 MahaRERA PDF Parser (`pdfplumber`) | ⏳ Pending | Medium | Review-and-confirm UX flow |
| **Phase 3: Progress & CV Module** | 3.1 MobileNetV2 Binary Classifier | ⏳ Pending | Low | Structural vs Finishing stage |
| | 3.2 Material & Expense Logger | ⏳ Pending | Medium | Manual entry + bill photo storage |
| **Phase 4: Dashboard & Full-Stack** | 4.1 FastAPI Backend & PostgreSQL Models | ⏳ Pending | High | `[SCRUM-13]` Unified database schema & REST endpoints |
| | 4.2 Next.js Dashboard & Gantt Chart | ⏳ Pending | High | `[SCRUM-13]` Visual interactive schedule & cost views |
| | 4.3 End-to-end integration | ⏳ Pending | High | Flow test from project setup to crash advice |
| **Phase 5: Academic Deliverables** | 5.1 SPPU Stage 1 Report | 🔄 In Progress | High | `docs/synopsis.md`, Stage 1 report chapters |
| | 5.2 Mathematical Model Documentation | 🔄 In Progress | High | `research/math-model/mathematical_model.md` |
| | 5.3 Literature Survey Matrix (12+ Papers) | ✅ Completed | High | `[SCRUM-6]`, `[SCRUM-7]` Done (11 PDFs in `papers/`) |
| | 5.4 Conference Paper 1 (Deadline: Oct 25) | 🔄 In Progress | High | `[SCRUM-8]` Draft in IEEE format via Overleaf |
| | 5.5 Review 2 Presentation Deck | ⏳ Pending | High | Gamma/Slides deck for guide & panel |

§

## 🔄 10. Update Protocol for Developers & AI Agents
Whenever completing an implementation step or modifying project scope:
1. Update the **Status** in Section 9 of this file.
2. Record any architectural refinements with the `§` delimiter.
3. If new formulas or constraints are added, update Section 5.
4. Keep all responses aligned with the **Locked Scope Guardrails** in Section 4.
