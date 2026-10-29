# OptiBuild System Audit & Technical Specification (PROJECT_AUDIT.md)

> **Document Type:** Comprehensive Architectural Audit & Codebase Baseline  
> **Repository:** `divyal27/OptiBuild-Main`  
> **Audit Date:** 2026-10-29  
> **Context:** B.E. Final Year Project — Penalty-Aware Construction Scheduling & Resource Optimization Engine

---

## Executive Overview

**OptiBuild** is a full-stack, penalty-aware construction planning, scheduling, and resource optimization system designed specifically for the Indian construction sector. Under **MahaRERA Section 18**, developers defaulting on promised possession dates must pay home buyers monthly interest calculated at the **State Bank of India (SBI) Highest Marginal Cost of Funds Based Lending Rate (MCLR) + 200 bps** (presently **10.85% p.a.**) on all collected funds until handover.

OptiBuild directly connects CPM scheduling and resource allocation (RCPSP) with statutory financial delay penalties. It features:
1. **Hero Engine**: A hybrid **Critical Path Method (CPM)** and **Genetic Algorithm (GA)** solver for the Resource-Constrained Project Scheduling Problem (RCPSP) using Serial Schedule Generation Scheme (Serial SGS) and Precedence-Preserving Crossover (PPX).
2. **Benchmark Engine**: Exact mathematical formulation solved via **Google OR-Tools CP-SAT** with cumulative resource intervals.
3. **MahaRERA Penalty vs. Schedule Crashing Optimizer**: Compares statutory delay penalties against greedy critical-path compression using marginal crash-cost slopes ($S_i = \frac{\Delta C}{\Delta D}$).
4. **Site Office Workstation UI**: A high-density, engineering-grade CAD blueprint interface built with Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, React Bits, and Vengeance UI.

---

## 1. Tech Stack, Frameworks, Major Dependencies, and Versions

### 1.1 Backend Service
* **Language & Runtime:** Python 3.11+ (Dockerized on `python:3.11-slim`)
* **API Framework:** FastAPI `>=0.110.0`
* **ASGI Server:** Uvicorn `>=0.28.0`
* **Data Validation & Serialisation:** Pydantic v2 `>=2.6.0`
* **Database ORM:** SQLAlchemy `>=2.0.28`
* **Database Drivers:** `psycopg2-binary>=2.9.9` (PostgreSQL), native `sqlite3` fallback
* **Mathematical & Algorithmic Optimization:**
  * **Google OR-Tools:** `9.11.4210` (CP-SAT Constraint Programming Solver)
  * **NetworkX:** `>=3.2.1` (DAG construction, topological sort, Kahn's cycle detection)
  * **NumPy:** `>=1.26.0`
  * **SciPy:** `>=1.12.0`
* **Document & Image Processing:**
  * **PDF Extraction:** `pdfplumber>=0.10.0`, `pypdf>=4.0.0`, `pypdfium2>=4.28.0`
  * **OCR Engine:** `pytesseract>=0.3.10` (wrapper over system `tesseract-ocr`)
  * **Image Processing:** `Pillow>=10.2.0`
* **Object Storage Client:** `boto3>=1.34.0` (S3 API compatible with MinIO, Supabase S3, AWS S3, Cloudflare R2)
* **Authentication & Cryptography:**
  * `bcrypt>=4.1.0` (Strict blowfish password hashing)
  * `PyJWT>=2.8.0` (JWT HS256 tokens)
  * `python-multipart>=0.0.9` (Form data & multipart file uploads)
* **Testing:** `pytest>=8.0.0`, `httpx>=0.27.0` (TestClient)

### 1.2 Frontend Application
* **Framework:** Next.js `16.4.0` (App Router, Turbopack, Partial Prerendering)
* **Core Runtime:** React `19.3.0` / React DOM `19.3.0`
* **Styling & Design System:**
  * Tailwind CSS `v4` (`@tailwindcss/turbopack`, `tw-animate-css`)
  * shadcn/ui (`^4.21.4`, built on `@base-ui/react ^1.9.0`)
  * React Bits (Hardware-accelerated CSS/SVG motion primitives)
  * Vengeance UI (Kinetic text loaders, shared tooltip avatars, staggered entrance grids)
* **State & Forms:**
  * React Context (`AuthContext`)
  * `react-hook-form ^7.90.0`
  * `@hookform/resolvers ^5.9.1`
  * `zod ^4.6.7`
* **Data Visualization & Scheduling:**
  * `recharts ^3.10.1` (S-Curves, CPM Cost-Time trade-off curves, Solver Benchmark bars)
  * `gantt-task-react ^0.3.9` (Interactive CPM/GA Gantt timeline)
* **Tables & Command Navigation:**
  * `@tanstack/react-table ^9.3.1` (High-density sortable, collapsible tables)
  * `cmdk ^1.1.1` (Global `Ctrl+K` command palette)
* **Typography (Zero-Network Local Fonts):**
  * `@fontsource-variable/space-grotesk` (Technical Headings)
  * `@fontsource-variable/ibm-plex-sans` (Interface Prose)
  * `@fontsource/ibm-plex-mono` (Numeric Data, Currency, IDs)
* **Utilities & Icons:**
  * `lucide-react ^1.56.0`
  * `sonner ^2.0.8` (Engineering toast notifications)
  * `react-dropzone ^20.1.3` (MahaRERA PDF & drawing drag-and-drop)

### 1.3 Infrastructure & Databases
* **PostgreSQL:** Version 16 Alpine (`postgres:16-alpine`), Transaction Pooler port 6543 (Supabase compatibility)
* **Object Storage:** MinIO (`cgr.dev/chainguard/minio:latest`) on ports 9000 (API) / 9001 (Console) with local filesystem fallback
* **Container Orchestration:** Docker Compose multi-service network (`postgres`, `minio`, `backend`, `frontend`)

---

## 2. Current Folder Structure and Subsystem Responsibilities

```text
OptiBuild-Main/
├── .agent/                             # Agent workflows, rules, and global skills (taste-skill, debugging-master)
├── backend/                            # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                     # App factory, CORS, router mounts, startup auto-seeding
│   │   ├── api/v1/                     # REST API Route Endpoints (32 endpoints across 10 modules)
│   │   │   ├── auth.py                 # Login, logout, me, JWT cookie issuing
│   │   │   ├── benchmark.py            # GA vs CP-SAT comparison runner & presets
│   │   │   ├── dashboard.py            # S-Curve spend analytics & crash cost recalibration
│   │   │   ├── materials.py            # Material procurement log & CV stage classifier
│   │   │   ├── optimizer.py            # MahaRERA Sec 18 penalty & schedule crashing
│   │   │   ├── projects.py             # Project CRUD, WBS/schedule/optimizer persistence, drawings, photos
│   │   │   ├── rera_parser.py          # MahaRERA PDF parsing and confirmation gate
│   │   │   ├── schedule.py             # CPM forward/backward pass & GA RCPSP solver
│   │   │   ├── users.py                # User administration and role provisioning
│   │   │   └── wbs.py                  # Parametric WBS generator & CPWD cost ratios
│   │   ├── core/
│   │   │   ├── auth.py                 # Password hashing (bcrypt), JWT generation, RBAC dependencies
│   │   │   └── config.py               # Pydantic/Environment settings, CORS origins, storage quotas
│   │   ├── db/
│   │   │   ├── models.py               # 10 SQLAlchemy ORM database models
│   │   │   ├── session.py              # Engine creation, NullPool pooling, SQLite resilient fallback
│   │   │   ├── seed.py                 # Initializer for 7 demo role accounts & org
│   │   │   └── init_db.py              # Standalone DB initialization script
│   │   ├── engine/                     # Core Algorithmic & Scientific Engines
│   │   │   ├── benchmark.py            # Google OR-Tools CP-SAT formulation vs GA
│   │   │   ├── classifier.py           # Computer vision edge/color density stage classifier
│   │   │   ├── cpm.py                  # Critical Path Method (ES/EF, LS/LF, Floats, Kahn's DAG verify)
│   │   │   ├── ga.py                   # Genetic Algorithm for RCPSP (Serial SGS, PPX, Resource Leveling)
│   │   │   ├── optimizer.py            # MahaRERA Sec 18 penalty vs greedy cost slope crashing
│   │   │   ├── pdf_parser.py           # Multi-tier PDF parser (pdfplumber, pypdf, pypdfium2, Tesseract)
│   │   │   ├── recalibrate.py          # EV S-Curve spend auditor & crash cost slope updater
│   │   │   └── wbs_generator.py        # Parametric building WBS generator (CPWD standard ratios)
│   │   ├── schemas/                    # Pydantic v2 schemas for request/response DTOs
│   │   │   ├── auth.py                 # TokenResponse, UserProfile, LoginRequest, CreateUserRequest
│   │   │   ├── benchmark.py            # BenchmarkRunRequest, BenchmarkComparisonResult
│   │   │   ├── dashboard.py            # DashboardResponse, SCurvePoint, CategoryVariance
│   │   │   ├── materials.py            # MaterialLogItem, CreateMaterialLogRequest, MaterialLogSummary
│   │   │   ├── optimizer.py            # CrashableTaskItem, RERAPenaltyParams, OptimizationResult
│   │   │   ├── pdf_parser.py           # MahaRERAPreFillDraft, ConfirmRERADraftRequest
│   │   │   ├── schedule.py             # TaskInputItem, ScheduleRequest, CPMResponse, GAResponse
│   │   │   └── wbs.py                  # BuildingParametersInput, ParametricWbsResponse
│   │   └── storage/
│   │       └── s3.py                   # Boto3 client, presigned URLs, MIME/size validator, disk fallback
│   ├── tests/                          # 13 Test suites (45+ automated tests)
│   ├── Dockerfile                      # Python 3.11-slim + libpq + Tesseract OCR
│   └── requirements.txt                # Pinned Python package dependencies
├── frontend/                           # Next.js 16 + Tailwind CSS v4 Frontend
│   ├── public/                         # Static assets (CAD blueprints, icons, badges)
│   ├── src/
│   │   ├── middleware.ts               # Cookie-based routing & authentication gate
│   │   ├── app/                        # Next.js App Router (13 routes)
│   │   │   ├── layout.tsx              # Root HTML wrapper, technical font loading, metadata
│   │   │   ├── globals.css             # Design tokens, CSS variables, drafting grid background
│   │   │   ├── page.tsx                # Projects Overview (Staggered cards, KPIs, progress)
│   │   │   ├── login/page.tsx          # Split CAD login, 7-role instant fill chips, animated submit
│   │   │   ├── rera-review/page.tsx    # 4-step guided setup, PDF dropzone, confidence badges, confirm dialog
│   │   │   ├── wbs/page.tsx            # Parametric WBS generator, cost data table, interactive Gantt
│   │   │   ├── optimizer/page.tsx      # MahaRERA Sec 18 penalty vs schedule crashing trade-off analyzer
│   │   │   ├── dashboard/page.tsx      # S-Curve spend audit, category variance, invoice recalibration
│   │   │   ├── materials/page.tsx      # Procurement log, unparsed bill viewer, CV stage classifier
│   │   │   ├── admin/page.tsx          # User roster data table, user dialog, project member assignment
│   │   │   ├── drawings/page.tsx       # Architectural drawing vault (view-only blueprint cards)
│   │   │   ├── benchmark/page.tsx      # Solver benchmark (GA vs OR-Tools CP-SAT side-by-side)
│   │   │   └── api/[...path]/route.ts  # Next.js reverse proxy to FastAPI backend
│   │   ├── components/
│   │   │   ├── layout/                 # Sidebar, TopBar, CommandPalette (Ctrl+K), KineticTextLoader
│   │   │   ├── optimizer/              # RecoverySidePanel (Dynamic recommendation comparison)
│   │   │   ├── project/                # GuidedStepper (4-step onboarding progress)
│   │   │   ├── schedule/               # GanttSchedule (gantt-task-react wrapper with design tokens)
│   │   │   ├── ui/                     # shadcn, React Bits, and Vengeance UI technical primitives
│   │   │   └── weather/                # SiteWeatherWidget (Open-Meteo rain & wind risk correlation)
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # User state, JWT cookies, project switcher, RBAC role guard
│   │   └── lib/
│   │       ├── api.ts                  # API resolver, cold-start wakeup interceptor, 3x retry loop
│   │       └── utils.ts                # cn() class merger, formatINR() Indian Rupee formatter
│   ├── package.json                    # Frontend package dependencies & scripts
│   ├── tsconfig.json                   # TypeScript path aliases (`@/*`)
│   └── next.config.ts                  # Turbopack & standalone output configuration
├── docs/                               # Baseline screenshots (ui-before/) & checkpoint captures
├── scripts/
│   ├── check_services.py               # Multi-service verification (DB, S3, FastAPI health)
│   ├── capture_all_checkpoint.mjs      # Headless Chrome authenticated screenshot automation
│   └── mock_backend.mjs                # Standalone Node.js mock backend for offline UI development
├── docker-compose.yml                  # Docker Compose multi-container setup
├── Dockerfile                          # Root Dockerfile
├── DEPENDENCIES.md                     # Registry audit log of all UI rebuild additions
├── DESIGN.md                           # Single source of truth for site-office design system
├── DEMO.md                             # 7-step presentation and demo script for all 7 roles
└── README.md                           # Monorepo technical documentation
```

---

## 3. Existing Features and User Flows

### 3.1 Role-Based Access Control (7 RBAC Workspaces)
OptiBuild enforces strict role-based authorization across 7 discrete construction project roles:

| Role Name | Identifier | Default Landing Route | Accessible Capabilities |
|:---|:---|:---|:---|
| **System Administrator** | `admin` | `/admin` | Complete access to all 10 modules, user roster creation, organization settings. |
| **Project Manager** | `project_manager` | `/` (Home) | MahaRERA PDF onboarding, WBS generation, CPM + GA schedule optimization, delay recovery, team assignment. |
| **Site Engineer** | `site_engineer` | `/materials` | Material logging, site progress photo uploading and CV stage classification review. |
| **Store Keeper** | `store_keeper` | `/materials` | Material inventory receipt entry, unparsed bill photo uploading, supplier tracking. |
| **Lead Architect** | `architect` | `/drawings` | CAD/PDF blueprint drawing upload, revision tracking (attach-only, view-only). |
| **Project Accountant** | `accountant` | `/dashboard` | Budget vs. Actual spend audit, invoice rate recalibration, S-Curve financial reporting. |
| **Owner / Developer** | `owner` | `/dashboard` | Executive KPI dashboard, MahaRERA delay penalty liability monitoring, S-Curve spend audit. |

### 3.2 Key User Flows & Walkthroughs

```mermaid
flowchart TD
    A["1. Login (/login)<br/>Select Role Chip (e.g. PM)"] --> B["2. Home Overview (/)<br/>View Projects & Delay KPIs"]
    B --> C["3. MahaRERA Setup (/rera-review)<br/>Upload PDF -> Inspect Confidence"]
    C -->|Explicit Confirmation Gate| D["4. Confirm Project Creation<br/>Saves Project & RERA Certificate to DB"]
    D --> E["5. Parametric WBS (/wbs)<br/>Enter Area, Floors -> Generate 6-Package WBS"]
    E --> F["6. CPM + GA Schedule (/wbs)<br/>Run Resource-Constrained RCPSP -> View Gantt"]
    F --> G["7. Delay Recovery Optimizer (/optimizer)<br/>MahaRERA Penalty vs. Schedule Crashing"]
    G --> H["8. Material & Site Photos (/materials)<br/>Store Keeper Logs Bills; Engineer Uploads Photos"]
    H --> I["9. Executive Dashboard (/dashboard)<br/>Accountant Recalibrates Unit Rates; S-Curve Audit"]
```

1. **Authentication Flow (`/login`):**
   - User arrives at the split-screen CAD blueprint view.
   - User clicks any of the 7 role chips (e.g., `Project Manager`), which instantly populates valid demo credentials.
   - On submit, `POST /api/v1/auth/login` issues an HS256 JWT, sets an HTTP-only cookie, stores user state in `localStorage`, and routes the user to their designated role home.
2. **Project Creation & MahaRERA Parsing Flow (`/rera-review`):**
   - PM or Admin uploads a MahaRERA registration certificate or project detail PDF.
   - `POST /api/v1/rera/upload-parse` runs `pdfplumber` (falling back to `pypdf` and `pytesseract` OCR).
   - A 4-step `GuidedStepper` visualizes the onboarding stages: *Upload & Confirm*, *Assign Team*, *Building Parameters & WBS*, and *Schedule & Optimizer*.
   - A pre-filled draft displays field-level confidence badges (`HIGH`, `INFERRED`, `NOT_FOUND`). Missing fields are highlighted.
   - **Locked Rule:** No database record is created until the user reviews the draft and confirms inside a compulsory `AlertDialog`. On confirmation, `POST /api/v1/rera/confirm` persists the `Project` and `RERACertificateModel`.
3. **Parametric WBS & Cost Estimation Flow (`/wbs`):**
   - PM enters building dimensions: Built-up Area (sq.ft.), Above-ground Floors, Basements, Base Construction Rate (₹/sqft).
   - `POST /api/v1/projects/{project_id}/wbs` generates a 6-package WBS based on CPWD standard ratios:
     1. Substructure & Earthwork (~12%)
     2. Superstructure RCC Frame (~38%)
     3. Masonry & Plastering (~14%)
     4. Electrical & Plumbing MEP (~16%)
     5. Flooring & Finishing (~12%)
     6. Handover & External Development (~8%)
   - Generates tasks with pre-computed CPM float and criticality in `TaskModel`.
4. **Hero Scheduling Engine Flow (`/wbs` Schedule Tab):**
   - PM triggers `POST /api/v1/projects/{project_id}/schedule`.
   - **Step 1 (CPM Baseline):** Calculates unconstrained early/late start and finish times, total float, and critical path.
   - **Step 2 (GA RCPSP):** Evaluates daily resource demand against limits (Masons, Barbenders, Concrete Pumps, Cranes). Uses Serial SGS to generate feasible schedules and PPX crossover to optimize makespan.
   - Renders interactive Gantt chart with Safety Orange (`#E8590C`) critical path tasks, CAD tooltips, and zoom toggles (Day, Week, Month).
5. **MahaRERA Delay Recovery Optimizer Flow (`/optimizer`):**
   - Evaluates project delay risk against statutory possession deadlines.
   - Calculates daily MahaRERA Section 18 penalty:
     $$\text{Daily Penalty} = \text{Total Allottee Investment} \times \frac{\text{SBI MCLR} + 200\text{ bps}}{365 \times 100}$$
   - Executes greedy CPM schedule crashing by identifying critical activities with the lowest cost slope ($S_i = \frac{\Delta C}{\Delta D}$) and compressing durations day-by-day.
   - Compares: **Option A (Accept Penalty)** vs. **Option B (Crash Critical Path)**. Recommends the cheaper option with quantified net savings in ₹ Lakh/Crore.
6. **Procurement & Site Evidence Flow (`/materials`):**
   - Store Keeper logs materials (Cement, Steel, Aggregates, Ready-Mix Concrete, Bricks) with invoice number, vendor, quantity, rate, and attached bill photo.
   - **Locked Invariant:** Bill photos are stored as unparsed documentary evidence only.
   - Site Engineer uploads site photos. `SitePhotoClassifier` evaluates RGB color histograms and spatial edge contours to classify stage (`STRUCTURAL_STAGE` vs. `FINISHING_STAGE`) and logs confidence score and detected features.
7. **Executive Dashboard & Rate Recalibration Flow (`/dashboard`):**
   - Displays 12-month Planned vs. Actual cumulative S-Curve spend.
   - Displays package-level budget variance (Under Budget / Over Budget).
   - **Crash Cost Recalibration:** When real market invoice rates diverge from initial estimates, clicking *Recalibrate Crash Slopes* (`POST /api/v1/dashboard/recalibrate-crash-costs`) updates the task crash cost slopes in the database so the optimizer reflects live site economics.
8. **Architectural Vault Flow (`/drawings`):**
   - Architect uploads CAD/PDF drawings.
   - **Locked Invariant:** Drawings are attach-only for human viewing, strictly never OCR'd or parsed.
   - Slide-over preview `Sheet` and pre-signed download URLs.
9. **Solver Benchmark Flow (`/benchmark`):**
   - Solves identical problem instances using Genetic Algorithm vs. exact Google OR-Tools CP-SAT.
   - Displays side-by-side metrics: Makespan (days), CPU runtime (ms), memory footprint, and markdown report.

---

## 4. Database Models, Tables, and Relationships

The database layer consists of 10 SQLAlchemy ORM models in [`backend/app/db/models.py`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/backend/app/db/models.py):

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ PROJECTS : has
    USERS ||--o{ PROJECT_MEMBERS : "belongs to"
    PROJECTS ||--o{ PROJECT_MEMBERS : assigns
    PROJECTS ||--o{ TASKS : contains
    PROJECTS ||--o{ MATERIAL_LOGS : records
    PROJECTS ||--o{ PROJECT_DRAWINGS : stores
    PROJECTS ||--o{ RERA_CERTIFICATES : confirms
    PROJECTS ||--o{ SITE_PHOTOS : captures
    PROJECTS ||--o{ DELAY_RECOVERY_EVALUATIONS : logs

    ORGANIZATIONS {
        string id PK
        string name
        datetime created_at
    }

    USERS {
        string id PK
        string email UK
        string hashed_password
        string full_name
        string role
        boolean is_active
        datetime created_at
    }

    PROJECTS {
        string id PK
        string organization_id FK
        string name
        string status
        string rera_registration_no
        string promoter_name
        string proposed_completion_date
        float plot_area_sqft
        float built_up_area_sqft
        float carpet_area_sqft
        int number_of_floors
        int number_of_basements
        float base_rate_per_sqft
        float total_project_cost
        float total_allottee_investment
        float sbi_mclr_rate
        float rera_spread
        int delay_days
        json wbs_data
        json schedule_data
        json optimizer_data
        json benchmark_data
        string created_by_id FK
        datetime created_at
        datetime updated_at
    }

    PROJECT_MEMBERS {
        string id PK
        string project_id FK
        string user_id FK
        string role
        datetime created_at
    }

    TASKS {
        string id PK
        string project_id FK
        string name
        int duration
        float normal_cost
        float crash_cost
        int crash_duration
        json predecessors
        json resource_demands
        boolean is_critical
        int total_float
        int free_float
        float progress_percent
        string status
        string actual_start
        string actual_finish
        datetime created_at
    }

    MATERIAL_LOGS {
        string entry_id PK
        string project_id FK
        string date
        string material_category
        text item_description
        string wbs_code
        float quantity
        string unit
        float unit_rate
        float total_amount
        string supplier_name
        string invoice_no
        text bill_attachment_url
        string logged_by_id FK
        datetime created_at
    }

    PROJECT_DRAWINGS {
        string id PK
        string project_id FK
        string title
        string drawing_type
        string file_name
        text file_url
        string uploaded_by_id FK
        datetime uploaded_at
    }

    RERA_CERTIFICATES {
        string id PK
        string project_id FK
        string rera_registration_no
        string project_name
        string promoter_name
        string proposed_completion_date
        float plot_area_sqft
        float built_up_area_sqft
        float carpet_area_sqft
        int number_of_floors
        int number_of_basements
        float total_project_cost
        string status
        text raw_pdf_url
        datetime confirmed_at
    }

    SITE_PHOTOS {
        string id PK
        string project_id FK
        text photo_url
        string predicted_stage
        string stage_label
        float confidence_score
        json detected_features
        text notes
        string engineer_confirmed_stage
        string uploaded_by_id FK
        datetime uploaded_at
    }

    DELAY_RECOVERY_EVALUATIONS {
        string id PK
        string project_id FK
        int delay_days
        float rera_daily_penalty
        float rera_total_penalty
        float total_crash_cost
        int days_recovered
        float net_savings
        string recommendation
        json crashing_actions
        datetime evaluated_at
    }
```

### Table Details & Foreign Key Cascades:
* **`organizations`**: Root tenant for enterprise isolation.
* **`users`**: Global identity table with unique indexed `email`, hashed passwords, and primary `role`.
* **`projects`**: Central project entity containing physical parameters, financial escrow parameters, and JSON blobs for pre-computed snapshots (`wbs_data`, `schedule_data`, `optimizer_data`, `benchmark_data`).
* **`project_members`**: Join table mapping users to projects with project-specific roles (`ondelete="CASCADE"`).
* **`tasks`**: Granular WBS schedule activities with normal/crash costs, durations, JSON dependencies (`predecessors`), JSON resource requirements (`resource_demands`), and CPM floats.
* **`material_logs`**: Itemized material procurement records linked to WBS codes and unparsed bill photo URLs.
* **`project_drawings`**: View-only CAD/PDF blueprint files.
* **`rera_certificates`**: Confirmed MahaRERA certificate record linked to the project.
* **`site_photos`**: Computer vision classified site inspection images with detected features and confirmed stage.
* **`delay_recovery_evaluations`**: Audit log of delay penalty vs. crashing evaluations.

---

## 5. API Routes and Endpoints (32 Endpoints)

All endpoints are registered under prefix `/api/v1` in [`backend/app/main.py`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/backend/app/main.py):

| Module | Method | Endpoint Path | Allowed Roles / Auth | Description |
|:---|:---|:---|:---|:---|
| **Auth** | `POST` | `/auth/login` | Public | Authenticate with email/password; returns JWT and sets `access_token` HTTP-only cookie. |
| | `POST` | `/auth/logout` | Authenticated | Clears authentication cookie. |
| | `GET` | `/auth/me` | Authenticated | Returns current user profile and list of assigned/visible projects. |
| **Users** | `GET` | `/users` | `admin`, `project_manager` | Lists all registered organization users. |
| | `POST` | `/users` | `admin` | Provisions a new user account with assigned role and password. |
| **Projects** | `GET` | `/projects` | Authenticated | Lists all projects (filtered by membership unless admin). |
| | `POST` | `/projects` | `project_manager`, `admin` | Creates a new blank project record. |
| | `GET` | `/projects/{project_id}` | Project Member | Returns comprehensive project details, WBS, schedule, and team. |
| | `POST` | `/projects/{project_id}/members` | `project_manager`, `admin` | Assigns an organization user to the project team with a specific role. |
| | `POST` | `/projects/{project_id}/wbs` | `project_manager`, `admin` | Generates parametric WBS and populates `tasks` table with CPM floats. |
| | `POST` | `/projects/{project_id}/schedule` | `project_manager`, `admin` | Runs CPM + GA RCPSP schedule solver and persists results. |
| | `POST` | `/projects/{project_id}/optimizer` | `project_manager`, `admin` | Evaluates delay recovery (penalty vs crash) and saves result. |
| | `POST` | `/projects/{project_id}/benchmark` | `project_manager`, `admin` | Runs GA vs OR-Tools CP-SAT benchmark on project tasks. |
| | `PATCH` | `/projects/{project_id}/tasks/{task_id}/progress` | `site_engineer`, `pm`, `admin` | Updates progress percentage and status of a schedule task. |
| | `GET` | `/projects/{project_id}/drawings` | Project Member | Lists architectural CAD/PDF drawings for the project. |
| | `POST` | `/projects/{project_id}/drawings` | `architect`, `pm`, `admin` | Uploads an attach-only architectural drawing to object storage. |
| | `GET` | `/projects/{project_id}/photos` | Project Member | Lists uploaded site progress photos and CV stage predictions. |
| | `POST` | `/projects/{project_id}/photos` | `site_engineer`, `pm`, `admin` | Uploads a site photo, runs classifier heuristics, and records prediction. |
| **Schedule** | `POST` | `/schedule/cpm` | Authenticated | Stateless CPM calculation: forward/backward pass, float, critical path. |
| | `POST` | `/schedule/optimize` | `project_manager`, `admin` | Stateless RCPSP Genetic Algorithm scheduler with resource limits. |
| **Optimizer** | `POST` | `/optimizer/evaluate` | `project_manager`, `admin` | Stateless delay recovery evaluation: MahaRERA Sec 18 penalty vs crashing. |
| **WBS** | `GET` | `/wbs/default-ratios` | Authenticated | Returns CPWD standard building category ratio templates. |
| | `POST` | `/wbs/generate` | `project_manager`, `admin` | Stateless WBS generation from building parameters (area, floors, rate). |
| **MahaRERA** | `POST` | `/rera/upload-parse` | `project_manager`, `admin` | Uploads PDF certificate and returns pre-filled draft with confidence scores. |
| | `POST` | `/rera/confirm` | `project_manager`, `admin` | Compulsory confirmation gate; persists confirmed project to database. |
| **Materials** | `GET` | `/materials/log` | Project Member | Returns logged material entries, category totals, and grand total expenditure. |
| | `POST` | `/materials/log` | `store_keeper`, `pm`, `admin` | Logs a new material receipt record with invoice details. |
| | `POST` | `/materials/upload-bill` | `store_keeper`, `pm`, `admin` | Uploads invoice photo as unparsed evidence to object storage. |
| | `POST` | `/materials/classify-photo` | `site_engineer`, `pm`, `admin` | Stateless CV classification of site photo bytes. |
| **Dashboard** | `GET` | `/dashboard/budget-vs-actual` | `accountant`, `owner`, `pm`, `admin` | Returns 12-month S-Curve, category variance, and recalibrated crash costs. |
| | `POST` | `/dashboard/recalibrate-crash-costs` | `accountant`, `pm`, `admin` | Recalibrates critical path crash cost slopes based on live material invoice rates. |
| **Benchmark** | `GET` | `/benchmark/presets` | Authenticated | Returns available construction benchmark presets (Small, Medium, Large). |
| | `POST` | `/benchmark/run` | `project_manager`, `admin` | Executes side-by-side GA vs Google OR-Tools CP-SAT benchmark. |
| **Health** | `GET` | `/health` | Public | Service health check returning status, version, and engine name. |

---

## 6. Authentication, Environment Variables, Integrations, and External Services

### 6.1 Authentication Architecture
* **Tokens:** JSON Web Token (JWT) signed with HS256 algorithm.
* **Claims:** User ID (`sub`), email (`email`), role (`role`), full name (`name`), and expiration timestamp (`exp`).
* **Validity:** Default 1440 minutes (24 hours).
* **Dual Delivery:**
  1. Set as an HTTP-only, `SameSite=Lax` browser cookie (`access_token`) on `/login`.
  2. Returned in JSON body (`TokenResponse`) and stored in `localStorage` for client-side API Authorization headers (`Bearer <token>`).
* **Password Hashing:** Strict `bcrypt.hashpw` with salt rounds. Verification supports bcrypt hashes and fallback for seeded demo passwords.
* **Frontend Middleware (`middleware.ts`):** Intercepts non-static paths, reads `optibuild_token` / `auth_token` cookies, and redirects unauthenticated users to `/login`.

### 6.2 Environment Variables

| Variable | Target Component | Default / Example Value | Description |
|:---|:---|:---|:---|
| `PROJECT_NAME` | Backend | `"OptiBuild Construction Scheduling Engine"` | Human-readable title in OpenAPI docs. |
| `PORT` | Backend | `8000` | Port for Uvicorn server. |
| `HOST` | Backend | `0.0.0.0` | Network bind address. |
| `ENVIRONMENT` | Backend | `development` | Deployment environment (`development` / `production`). |
| `JWT_SECRET` | Backend | *At least 32 characters* | Cryptographic secret for signing JWTs. Throws `RuntimeError` on startup if `< 32` characters. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | `1440` (24h) | JWT lifespan in minutes. |
| `MAX_PROJECT_STORAGE_MB` | Backend | `200` | Maximum storage quota per project before HTTP 413 is raised. |
| `DATABASE_URL` | Backend | `postgresql://optibuild:secret@postgres:5432/optibuild_db` | Connection URI. Supports Supabase pooler (port 6543) and auto-falls back to SQLite (`sqlite:///./optibuild.db`). |
| `S3_ENDPOINT_URL` | Backend | `http://minio:9000` | S3-compatible object storage endpoint (MinIO / Supabase S3 / AWS / Cloudflare R2). |
| `S3_ACCESS_KEY` | Backend | `optibuild_minio_admin` | Storage authentication key. |
| `S3_SECRET_KEY` | Backend | `optibuild_minio_secret` | Storage authentication secret. |
| `S3_BUCKET_NAME` | Backend | `optibuild-artifacts` | Storage bucket for unparsed bills, drawings, and PDFs. |
| `S3_REGION` | Backend | `us-east-1` (or `ap-south-1`) | S3 region configuration. |
| `FRONTEND_URL` | Backend | `http://localhost:3000` | Comma-separated CORS allowed origin URLs. |
| `BACKEND_URL` | Frontend | `http://backend:8000` | Internal server-to-server URL used by Next.js proxy route handler in Docker. |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:8000` | External URL used by browser client for direct API access or local dev. |
| `NEXT_PUBLIC_SITE_NAME` | Frontend | `"OptiBuild Site Engine"` | Application brand string. |

### 6.3 External Services & Integrations
1. **PostgreSQL / Supabase:** Primary relational store. Cleaned connection strings remove transaction pooling session parameters incompatible with SQLAlchemy.
2. **MinIO / AWS S3 / Supabase Storage:** Unparsed binary asset store. Validates file headers (`%PDF-`, `\xff\xd8\xff`), enforces strict per-category file size limits (PDF: 10MB, Drawings: 20MB, Images: 5MB), and generates short-lived presigned download URLs (600 seconds).
3. **Google OR-Tools CP-SAT:** Native C++ constraint programming solver bundled via Python bindings for mathematical benchmark validation.
4. **Tesseract OCR:** System OCR engine invoked via `pytesseract` as a tertiary fallback when MahaRERA certificate scans lack native PDF text layers.
5. **Open-Meteo Weather API:** Lightweight weather integration in `SiteWeatherWidget.tsx` querying live rain and wind parameters to correlate weather risk against scheduled sensitive outdoor tasks (e.g. Earthwork, Foundation, External Plastering).

---

## 7. Known Incomplete Areas, TODOs, Bugs, and Technical Debt

### 7.1 Framework & Deprecation Notices
1. **Next.js 16 Middleware Convention:** Next.js 16 emits a warning during build:
   `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
   *Impact:* Benign deprecation warning. Middleware currently works as expected, but will require updating to `proxy` in future Next.js major releases.
2. **Next.js Duplex Header in Reverse Proxy:** In [`frontend/src/app/api/[...path]/route.ts`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/frontend/src/app/api/[...path]/route.ts#L46):
   Uses `@ts-expect-error duplex: "half"` for streaming array buffer payloads through Node fetch. This is standard in Next.js App Router reverse proxies but should be monitored as Node fetch evolves.
3. **Next.js Security Advisory (`16.4.0` vs `16.4.3`):** The repository has a draft PR (#1) on branch `security-upgrade` upgrading Next.js to `16.4.3` to satisfy automated CVE scanners. Current branch `ui-rebuild` builds cleanly on `16.4.0` with Turbopack.

### 7.2 Database & Storage Technical Debt
1. **Database Migrations (Alembic):** The repository does not currently use Alembic for versioned schema migrations. Schema creation is handled via `Base.metadata.create_all(bind=engine)` in [`backend/app/main.py`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/backend/app/main.py#L53). Modifying column types in existing tables requires manual SQL alterations or database re-creation.
2. **SQLite vs PostgreSQL Feature Disparity:** When PostgreSQL is unreachable, the system gracefully falls back to `sqlite:///./optibuild.db`. While all basic CRUD and demo flows work, SQLite has limited native support for advanced JSON queries and concurrent write transactions.
3. **Local Filesystem Fallback Storage:** When S3/MinIO is unreachable, [`backend/app/storage/s3.py`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/backend/app/storage/s3.py#L179) writes files to `uploads/`. In multi-container or serverless production deployments, local disk storage is ephemeral unless backed by a persistent volume claim (PVC).

### 7.3 Frontend Code Quality & Lint Warnings
1. **ESLint Relaxed Warnings:** In [`frontend/eslint.config.mjs`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/frontend/eslint.config.mjs), rules for `@typescript-eslint/no-explicit-any` and `react-hooks/set-state-in-effect` were configured as `"warn"` rather than `"error"`. While this allows the build to pass cleanly (0 errors), cleaning up remaining type annotations and effect setState patterns would improve code hygiene.
2. **Weather Widget Client-Side Fetch:** In [`frontend/src/components/weather/SiteWeatherWidget.tsx`](file:///d:/OptiBuild%20BE%20Project/OptiBuild-Main/frontend/src/components/weather/SiteWeatherWidget.tsx), the Open-Meteo weather API is fetched directly from the browser. In restricted corporate networks or offline demonstration environments, this can fail silently and fallback to simulated site weather data.

---

## 8. Recommended Order for Documenting and Improving the Project

Based on the audit, here is the recommended phased roadmap for continuing development, documentation, and production hardening:

```mermaid
flowchart LR
    P1["Phase 1: DB Migrations<br/>& Security Bump"] --> P2["Phase 2: API Contract<br/>& Postman Docs"]
    P2["Phase 2: API Contract<br/>& Postman Docs"] --> P3["Phase 3: Multi-Mode RCPSP<br/>& Solver Expansion"]
    P3["Phase 3: Multi-Mode RCPSP<br/>& Solver Expansion"] --> P4["Phase 4: CI/CD Pipeline<br/>& Production Hardening"]
```

### Phase 1: Operational Stability & Dependency Modernization
1. **Upgrade Next.js to 16.4.3:** Merge the security patch from PR #1 into `ui-rebuild` and update package dependencies to silence CVE advisories.
2. **Introduce Alembic Database Migrations:** Initialize Alembic (`alembic init backend/alembic`) and generate initial revision scripts for all 10 models to replace raw `create_all()`.
3. **Migrate Next.js Middleware:** Refactor `frontend/src/middleware.ts` to the recommended Next.js 16 proxy pattern to future-proof routing.

### Phase 2: Documentation & API Contract Standardization
1. **Interactive API Collection:** Export a complete Bruno / Postman collection containing all 32 endpoints with pre-configured authentication scripts for the 7 demo accounts.
2. **Architecture Decision Records (ADRs):** Create formal ADRs in `docs/adr/` documenting the locked invariants:
   - *ADR-001:* Attach-only architectural drawings policy.
   - *ADR-002:* Unparsed bill photo evidence safeguard.
   - *ADR-003:* Compulsory human confirmation gate for MahaRERA parsing.
   - *ADR-004:* Decoupled heuristic computer vision classifier boundary.
3. **Enhanced OpenAPI Metadata:** Annotate all FastAPI route definitions with explicit error response schemas (400, 401, 403, 404, 413, 500) and response examples.

### Phase 3: Algorithmic & Solver Enhancements
1. **Multi-Mode RCPSP:** Extend the Genetic Algorithm in `backend/app/engine/ga.py` to support multi-mode task execution (trading off varying resource intensities for duration compression).
2. **Pareto Multi-Objective Frontier:** Enhance `backend/app/engine/optimizer.py` to plot an interactive 2D Pareto front of Total Cost vs. Completion Days, allowing project managers to visualize multiple intermediate recovery options rather than a binary choice.
3. **Expanded Benchmark Dataset:** Add standard PSPLIB (Project Scheduling Problem Library) benchmark sets (J30, J60, J120) to `backend/app/engine/benchmark.py` for comprehensive academic evaluation against state-of-the-art literature.

### Phase 4: Production Deployment & Observability
1. **Centralized Logging & Sentry:** Replace standard Python `print()` statements with structured JSON logging (`structlog` or standard library `logging`) and integrate Sentry error tracking for both Next.js and FastAPI.
2. **Automated CI/CD Pipeline:** Configure GitHub Actions workflow running:
   - Python linting (`ruff`), type checking (`mypy`), and backend unit tests (`pytest`).
   - Next.js production build (`npm run build`) and ESLint check.
   - Docker image build verification.
3. **Health & Readiness Probes:** Expand `/health` into `/health/liveness` and `/health/readiness` verifying database connectivity and S3 bucket availability for Kubernetes / ECS deployment.

---

*Audit completed by Antigravity Assistant. Single source of truth recorded in `PROJECT_AUDIT.md`.*

