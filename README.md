# OptiBuild — Penalty-Aware Construction Scheduling & Resource Optimization System

> **B.E. Computer Engineering Final Year Project**  
> *Savitribai Phule Pune University (SPPU)*  
> *A full-stack, penalty-aware construction planning and resource allocation monorepo.*

---

## 🏗️ 1. Executive Summary

Construction projects in India face severe statutory penalties under the **Real Estate (Regulation and Development) Act, 2016 (RERA)**. Under **MahaRERA Section 18**, developers defaulting on promised possession dates must pay home-buyers monthly interest calculated at the **State Bank of India (SBI) Highest Marginal Cost of Funds Based Lending Rate (MCLR) + 200 bps** (presently **10.85% p.a.**) on all collected funds until possession is handed over.

Traditional scheduling tools (such as Primavera P6 or MS Project) treat schedules purely as technical durations or CPM floats without computing the direct financial liability of RERA penalties. **OptiBuild** bridges this critical gap:

1. **Hero Engine**: Solves the Resource-Constrained Project Scheduling Problem (**RCPSP**) using a custom **Genetic Algorithm (GA)** powered by a **Serial Schedule Generation Scheme (Serial SGS)** and **Precedence-Preserving Crossover (PPX)**.
2. **Benchmark Engine**: Benchmarks GA schedules against an exact mathematical formulation solved via **Google OR-Tools CP-SAT** with cumulative resource constraints.
3. **MahaRERA Penalty vs. Crash Cost Optimizer**: Calculates statutory daily delay penalties under MahaRERA Sec 18 and greedily compresses the critical path using marginal crash-cost slopes ($S_i = \frac{\Delta C}{\Delta D}$), recommending the strictly cheaper path (Crash vs. Pay Penalty) with quantified net savings in Indian Rupees ($\text{INR } ₹$).
4. **Site Office Blueprint UX**: An engineering-grade UI crafted with dark/light blueprint grids, safety-orange accents, dense tabular views, interactive Gantt charts, and Indian numbering notation (Lakh/Crore grouping).

---

## 🔒 2. Locked Invariants & Architectural Rules

OptiBuild adheres strictly to the following non-negotiable architectural invariants:

| # | Invariant | Enforcement Implementation |
|---|---|---|
| **1** | **Hero Module Primacy** | The CPM + Genetic Algorithm engine is the hero module. All other features (WBS, PDF parser, CV classifier, Dashboard) are auxiliary supporting services. |
| **2** | **Architect's Drawing Invariant** | CAD/PDF architectural drawings are **attach-only**. Uploaded to S3/MinIO with metadata `{"type": "architect_drawing_attach_only", "unparsed": "true"}` for human viewing only. **NEVER parsed or OCR'd**. |
| **3** | **Bill Photo Invariant** | Invoice photos uploaded to the Material & Cost Log are stored as **unparsed documentary evidence only**. No OCR or NLP invoice parsing is permitted. |
| **4** | **MahaRERA PDF Safeguard** | MahaRERA certificate PDF parsing **only pre-fills a draft review form**. The system requires explicit, verified human engineer confirmation before any project record is saved. |
| **5** | **CV Classifier Boundary** | Site progress photo classifier is a lightweight binary visual inspection module (`STRUCTURAL_STAGE` vs. `FINISHING_STAGE`) using spatial edge density and color spectrum analysis. AI modules are strictly decoupled and **never required** for the scheduling system to function. |

---

## 📐 3. Design System ("Engineering Blueprint / Site Office")

OptiBuild discards generic SaaS templates and purple gradients in favor of an authentic site-office blueprint aesthetic:

- **Color Tokens**:
  - Light Background: `#F4F1EA` (Drafting Vellum / Architectural Paper)
  - Dark Background: `#14181F` (Dark Blueprint Carbon)
  - Accent Color: `#E8590C` (Safety Orange / Site Helmet Orange)
  - Ink Foreground: `#1E2530` (Drafting Ink) / `#F1F5F9`
  - Border: 1px subtle hairline rule (`#D1C7B7` light, `#232C3B` dark)
  - Grid: Subtle $24\text{px} \times 24\text{px}$ architectural drafting grid
- **Typography** (via `@fontsource`):
  - **Headings**: `Space Grotesk` (Geometric, technical architectural sans)
  - **Body**: `IBM Plex Sans` (Clean, legible technical prose)
  - **Data, Costs, Dates, IDs**: `IBM Plex Mono` (Tabular monospace for precise numeric alignment)
- **Geometry**: Strict `4px` maximum border radius (`rounded-sm`), zero heavy drop shadows.
- **Currency**: Indian Rupee (`₹`) with Indian numbering grouping (e.g., `₹12,45,000` Lakhs / `₹4.85 Cr` Crores).

---

## 📂 4. Monorepo Structure

```text
OptiBuild_Main/
├── .env.example                     # Unified environment template
├── docker-compose.yml               # Local multi-service orchestration
├── README.md                        # Primary system documentation
├── backend/
│   ├── Dockerfile                   # Python 3.11-slim + libpq + Tesseract OCR
│   ├── requirements.txt             # Pinned dependencies (ortools==9.11.4210, FastAPI, etc.)
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & CORS
│   │   ├── api/v1/                  # REST API route handlers
│   │   │   ├── benchmark.py         # GA vs CP-SAT comparison endpoints
│   │   │   ├── dashboard.py         # S-Curve & crash recalibration endpoints
│   │   │   ├── materials.py         # Material log & binary CV classifier
│   │   │   ├── optimizer.py         # MahaRERA Sec 18 penalty & crashing
│   │   │   ├── pdf_parser.py        # PDF pre-fill & confirmation guard
│   │   │   ├── schedule.py          # CPM calculation & GA scheduler
│   │   │   └── wbs.py               # Parametric building WBS generator
│   │   ├── engine/                  # Core algorithmic modules
│   │   │   ├── benchmark.py         # OR-Tools CP-SAT exact formulation
│   │   │   ├── classifier.py        # Structural vs Finishing spatial CV
│   │   │   ├── cpm.py               # CPM DAG, Kahn's cycle check, total float
│   │   │   ├── ga.py                # Serial SGS, PPX, daily resource leveling
│   │   │   ├── optimizer.py         # RERA daily interest vs greedy crashing
│   │   │   ├── pdf_parser.py        # pdfplumber / pypdf certificate extractor
│   │   │   ├── recalibrate.py       # EV S-Curve & actual cost slope updater
│   │   │   └── wbs_generator.py     # Parametric dimensions to 6-package WBS
│   │   ├── models/schemas.py        # Pydantic v2 schemas for all payloads
│   │   └── storage/s3.py            # Boto3 S3/MinIO/R2 unparsed storage client
│   └── tests/                       # 42 Automated unit and integration tests
│       ├── test_api.py
│       ├── test_benchmark.py
│       ├── test_cpm.py
│       ├── test_dashboard.py
│       ├── test_ga.py
│       ├── test_materials.py
│       ├── test_optimizer.py
│       ├── test_pdf_parser.py
│       ├── test_storage.py
│       └── test_wbs.py
└── frontend/
    ├── Dockerfile                   # Multi-stage Next.js production build
    ├── package.json                 # Next.js 16, Tailwind CSS v4, Recharts
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx           # Blueprint layout with persistent TopBar & LeftNav
    │   │   ├── page.tsx             # Hero: Gantt chart + RERA vs Crash side panel
    │   │   ├── benchmark/page.tsx   # GA vs CP-SAT comparison matrix
    │   │   ├── dashboard/page.tsx   # EV S-Curve (PV vs AC) & recalibration
    │   │   ├── materials/page.tsx   # Site photo classifier + Material log
    │   │   ├── optimizer/page.tsx   # Interactive MahaRERA Sec 18 crash planner
    │   │   ├── rera-review/page.tsx # PDF certificate dropzone & confirmation guard
    │   │   └── wbs/page.tsx         # Parametric building dimension estimator
    │   ├── components/              # Blueprint navigation, TopBar, formatters
    │   └── styles/globals.css       # Design tokens, drafting grid, font imports
```

---

## 🔑 5. Role-Based Access Control (RBAC) & Demo Logins

OptiBuild operates on an enterprise Role-Based Access Control model backed by bcrypt password hashing and JWT access tokens containing role claims. 

### Seeded Demo Accounts (1-Click Login Available)

Run the seed script to initialize the 7 demo accounts and the base organization (`OptiBuild Infrastructure Corp`):
```bash
backend/.venv/Scripts/python.exe -m backend.app.db.seed
```
> [!NOTE]
> The seed script creates **ONLY** these 7 users and 1 empty organization. **No fake projects or mock MahaRERA certificates are created.** All pages query real database tables and render empty states with clear action pathways until a user uploads and confirms real project documents.

| Role | Demo Email | Password | Default Home Route | Permitted Capabilities & Workflow |
|---|---|---|---|---|
| **Administrator** | `admin@optibuild.io` | `Admin@123` | `/admin` | Manage organization users, invite staff, assign team members to projects, access all system views. |
| **Project Manager** | `pm@optibuild.io` | `Pm@123` | `/rera-review` | Upload MahaRERA PDF, review editable pre-fill draft, confirm project creation, generate parametric WBS, run CPM + GA scheduler, evaluate Section 18 crashing optimizer. |
| **Site Engineer** | `site@optibuild.io` | `Site@123` | `/` | Inspect project Gantt timeline, update real-time activity completion percentage and status, upload site inspection photos for AI stage classification. |
| **Store Keeper** | `store@optibuild.io` | `Store@123` | `/materials` | Log material deliveries (Steel, Cement, Concrete), record actual invoice costs, attach unparsed bill photos as documentary evidence. |
| **Architect** | `architect@optibuild.io` | `Architect@123` | `/drawings` | Attach architectural, structural, and MEP CAD/PDF drawings for site visual reference (**stored for human viewing only; never parsed**). |
| **Accountant** | `accountant@optibuild.io` | `Accountant@123` | `/dashboard` | Audit project financial health: Budget vs. Actual (EV S-Curve), cumulative material expenditure breakdown, actual vs planned cost variance. |
| **Owner / Promoter** | `owner@optibuild.io` | `Owner@123` | `/dashboard` | Read-only executive dashboard: milestone completion, statutory delay risk (days), and MahaRERA Section 18 penalty liability exposure. |

---

## ⚡ 6. Quick Start & Local Execution

### Option A: Local Development (Recommended for Coding)

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

#### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000` to interact with the engineering blueprint interface.

---

### Option B: Full Stack Docker Compose

Run the entire cluster (PostgreSQL, MinIO S3 Object Storage, FastAPI Backend, Next.js Frontend) with a single command:

```bash
docker compose up -d --build
```

#### Services Spawned:
| Service | Internal Port | Host Port | Description |
|---|---|---|---|
| `frontend` | 3000 | `http://localhost:3000` | Next.js 16 Web Application |
| `backend` | 8000 | `http://localhost:8000` | FastAPI Optimization Engine |
| `minio` | 9000 / 9001 | `http://localhost:9000` (API), `9001` (Console) | S3-Compatible Object Store |
| `postgres` | 5432 | `localhost:5432` | PostgreSQL Relational Database |

---

## 🔬 6. Core Modules & Mathematical Foundations

### 1. Critical Path Method (CPM)
Computes Early Start ($ES$), Early Finish ($EF$), Late Start ($LS$), Late Finish ($LF$), Total Float ($TF$), and Free Float ($FF$):
- Forward pass: $ES_j = \max_{i \in \text{Pred}(j)} (EF_i)$, $EF_j = ES_j + D_j$
- Backward pass: $LF_i = \min_{j \in \text{Succ}(i)} (LS_j)$, $LS_i = LF_i - D_i$
- Total Float: $TF_i = LS_i - ES_i$. Critical Path defined as $\{i \mid TF_i = 0\}$.
- Kahn's algorithm verifies DAG topological order and flags cyclic task dependencies.

### 2. RCPSP Genetic Algorithm with Serial SGS
- **Representation**: Activity list chromosome representing topological topological execution order.
- **Serial Schedule Generation Scheme (Serial SGS)**: Decodes chromosome by scheduling each task at the earliest feasible time $t \ge \max_{p \in \text{Pred}} (C_p)$ such that $\sum_{a \in A_t} r_{a, k} \le R_k$ for all resource types $k$.
- **Precedence-Preserving Crossover (PPX)**: Generates child chromosomes by preserving ancestor ordering without cyclic dependency violations.
- **Resource Leveling**: Penalizes makespan and peak resource over-allocations.

### 3. Exact Benchmark: Google OR-Tools CP-SAT
Formulated as an exact Constraint Programming model:
- Interval variables: `model.NewIntervalVar(start, duration, end, f"task_{t}")`
- Precedence constraints: `model.Add(start_b >= end_a)`
- Renewable resource constraints: `model.AddCumulative(intervals, demands, capacity)`
- Objective: `model.Minimize(makespan)`
- Produces exact optimal makespan and compares GA optimality gap ($Gap\% = \frac{MS_{GA} - MS_{CP}}{MS_{CP}} \times 100$).

### 4. MahaRERA Section 18 Statutory Delay Penalty vs. Crashing
Under MahaRERA Rule 18:
$$\text{Penalty Rate} = \text{SBI MCLR} + 2.0\% = 8.85\% + 2.0\% = 10.85\% \text{ p.a.}$$
$$\text{Daily Statutory Penalty} = \frac{\text{Cumulative Allottee Investment} \times 0.1085}{365}$$
Marginal crash cost slope for activity $i$:
$$S_i = \frac{\text{Crash Cost}_i - \text{Normal Cost}_i}{\text{Normal Duration}_i - \text{Crash Duration}_i}$$
The optimizer iteratively crashes the critical-path activity with the lowest $S_i$ until either the target recovery duration is reached or crashing becomes more expensive than paying the daily RERA penalty.

### 5. Earned Value S-Curve & Empirical Recalibration
- Computes Planned Value ($PV$) vs. Actual Cost ($AC$).
- Automatically recalibrates theoretical crash-cost slopes $S_i$ using real invoice receipts logged in the Material Log:
  $$S_{i,\text{calibrated}} = S_{i,\text{nominal}} \times \left(1 + \text{Cost Variance Factor}\right)$$

---

## 🧪 7. Automated Verification & Test Coverage

All modules are protected by 42 comprehensive pytest tests:

```bash
backend/.venv/Scripts/python.exe -m pytest backend/tests -v
```

```text
backend/tests/test_api.py::test_health_check_endpoint PASSED
backend/tests/test_api.py::test_cpm_endpoint PASSED
backend/tests/test_api.py::test_optimize_endpoint PASSED
backend/tests/test_benchmark.py::test_cpsat_solver_finds_optimal PASSED
backend/tests/test_benchmark.py::test_cpsat_solution_feasibility_invariants PASSED
backend/tests/test_benchmark.py::test_benchmark_engine_comparison PASSED
backend/tests/test_benchmark.py::test_benchmark_api_endpoints PASSED
backend/tests/test_cpm.py::test_standard_construction_network PASSED
backend/tests/test_cpm.py::test_cycle_detection_raises_error PASSED
backend/tests/test_cpm.py::test_self_dependency_raises_error PASSED
backend/tests/test_cpm.py::test_invalid_predecessor_raises_error PASSED
backend/tests/test_cpm.py::test_zero_duration_milestone PASSED
backend/tests/test_cpm.py::test_parallel_independent_tasks PASSED
backend/tests/test_dashboard.py::test_dashboard_metrics_generation PASSED
backend/tests/test_dashboard.py::test_material_variance_factors PASSED
backend/tests/test_dashboard.py::test_task_crash_slope_recalibration PASSED
backend/tests/test_dashboard.py::test_dashboard_api_endpoints PASSED
backend/tests/test_ga.py::test_ga_resource_bottleneck_serialization PASSED
backend/tests/test_ga.py::test_ga_abundant_resources_matches_cpm PASSED
backend/tests/test_ga.py::test_ga_precedence_invariance PASSED
backend/tests/test_ga.py::test_ga_resource_capacity_invariance PASSED
backend/tests/test_materials.py::test_classifier_structural_stage PASSED
backend/tests/test_materials.py::test_classifier_finishing_stage PASSED
backend/tests/test_materials.py::test_material_log_expenditure_and_evidence_rule PASSED
backend/tests/test_materials.py::test_material_log_get_summary PASSED
backend/tests/test_materials.py::test_classify_photo_api_endpoint PASSED
backend/tests/test_optimizer.py::test_rera_penalty_calculation PASSED
backend/tests/test_optimizer.py::test_greedy_crashing_selects_lowest_slope PASSED
backend/tests/test_optimizer.py::test_recommendation_crash_cheaper PASSED
backend/tests/test_optimizer.py::test_recommendation_penalty_cheaper PASSED
backend/tests/test_optimizer.py::test_optimizer_api_endpoint PASSED
backend/tests/test_pdf_parser.py::test_extract_from_rera_text PASSED
backend/tests/test_pdf_parser.py::test_area_unit_conversion PASSED
backend/tests/test_pdf_parser.py::test_unparseable_text_safe_fallback PASSED
backend/tests/test_pdf_parser.py::test_confirm_rera_draft_endpoint PASSED
backend/tests/test_storage.py::test_s3_storage_architect_file_unparsed PASSED
backend/tests/test_storage.py::test_s3_storage_bill_evidence_unparsed PASSED
backend/tests/test_wbs.py::test_wbs_total_cost_calculation PASSED
backend/tests/test_wbs.py::test_wbs_category_sums_and_budget_percentages PASSED
backend/tests/test_wbs.py::test_wbs_generated_tasks_cpm_validity PASSED
backend/tests/test_wbs.py::test_wbs_duration_scaling_by_floors PASSED
backend/tests/test_wbs.py::test_wbs_api_endpoints PASSED

======================= 42 passed in 6.55s =======================
```

Frontend production verification:
```bash
cd frontend && npm run build
# ✓ Compiled successfully (10/10 static routes prerendered)
```

---

## 🚀 8. Production Deployment Guide

### A. Deploy Frontend to Vercel
1. Push repository to GitHub (`divyal27/OptiBuild-Main`).
2. Import project into [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com` (or your deployed backend URL).
5. Deploy. The Next.js App Router static pages and API proxy will build automatically.

### B. Deploy Backend to Render / AWS ECS / Fly.io
1. Use the pre-configured [backend/Dockerfile](file:///C:/Users/divyal/OptiBuild_Main/backend/Dockerfile).
2. Set Environment Variables:
   - `DATABASE_URL`: `postgresql://user:password@host:5432/optibuild_db`
   - `S3_ENDPOINT_URL`: `https://<account-id>.r2.cloudflarestorage.com` (or AWS S3)
   - `S3_ACCESS_KEY`: `<access-key>`
   - `S3_SECRET_KEY`: `<secret-key>`
   - `S3_BUCKET_NAME`: `optibuild-artifacts`
3. Expose port `8000`.

---

## 📜 9. Academic Citation & License

Developed as a Final Year Capstone Project in Computer Engineering, Savitribai Phule Pune University (SPPU).  
Distributed under the **MIT License**.
