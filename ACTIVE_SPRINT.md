# 🏃 OptiBuild — Active Sprint Board (Live Team Sync)

> **Antigravity Fast-Sync File:** Check this file before starting any work to avoid code collisions and coordinate with teammates.

---

## 📅 Sprint 2: Core Optimization Engine & Benchmark
- **Dates:** Oct 7, 2026 – Oct 21, 2026
- **Sprint Goal:** Build the standalone Hero Module (CPM + GA + CP-SAT + Penalty Optimizer) on a 15–20 task sample dataset with verifiable optimality metrics.

---

## 👥 Teammate Active Tasks & File Ownership

### 1. Divyal Padalkar (Optimization Lead)
- **Active Jira Ticket:** `[SCRUM-10]` `[HERO-ENGINE] Implement CPM DAG (NetworkX) & Resource-Constrained GA (DEAP)`
- **Status:** ⏳ In Progress
- **Files Owned:**
  - `app/engine/cpm/` (CPM DAG forward/backward pass)
  - `app/engine/ga/` (DEAP chromosome, fitness, crossover, mutation)
  - `app/engine/data/sample_tasks.json` (15-20 RCC activity dataset)
- **Interface Output:** Returns schedule dictionary `{task_id: {"start": int, "end": int, "duration": int, "crews": dict}}` and total makespan.

---

### 2. Chaitanya (Benchmark Lead)
- **Active Jira Ticket:** `[SCRUM-11]` `[BENCHMARK] Implement Google OR-Tools CP-SAT Solver Benchmarking`
- **Status:** ⏳ Ready / In Progress
- **Files Owned:**
  - `app/engine/cpsat/` (OR-Tools CP-SAT IntervalVar & AddCumulative model)
  - `app/engine/benchmark/` (Optimality gap & execution runtime comparison script)
- **Dependencies:** Consumes `app/engine/data/sample_tasks.json` from Divyal; verifies makespan vs GA output.

---

### 3. Bhushan Bhosale (Research & Financial Optimizer)
- **Active Jira Ticket:** `[SCRUM-12]` `[OPTIMIZER] Implement MahaRERA Section 18 Delay-Penalty vs Crash Cost Engine`
- **Status:** ⏳ Ready / In Progress
- **Files Owned:**
  - `app/engine/penalty/` (MahaRERA Section 18 SBI MCLR + 2% formula, activity crash slope engine)
  - `research/literature-survey/` (Survey paper draft, LaTeX template)
  - `docs/` & `PROJECT_MEMORY.md` (System specs & Jira sync)
- **Dependencies:** Consumes Critical Path list from `app/engine/cpm/` to calculate crash cost slopes.

---

### 4. Teammate 4 (Full-Stack & Ingestion Lead)
- **Active Jira Ticket:** `[SCRUM-13]` `[FULLSTACK-UI] Build FastAPI Backend & Next.js Parameter Ingestion Dashboard`
- **Status:** ⏳ Ready
- **Files Owned:**
  - `app/backend/` (FastAPI endpoints, SQLAlchemy models, Pydantic schemas)
  - `app/frontend/` (Next.js UI, parameter form, Gantt chart visualization)
- **Dependencies:** Calls engine endpoints in `app/engine/` to render visual dashboard.

---

## 🚨 Blockers & Interface Notices
- *None currently.* All teams working on independent modular sub-directories under `app/engine/`.
