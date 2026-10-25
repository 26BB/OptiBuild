# 🏃 OptiBuild — Active Sprint Board (Live Team Sync)

> **Antigravity Fast-Sync File:** Check this file before starting any work to avoid code collisions and coordinate with teammates.

---

## 📅 Sprint 2: Core Optimization Engine, Research & Viva Presentation
- **Dates:** Oct 7, 2026 – Oct 28, 2026
- **Sprint Goal:** Build the standalone Hero Module (CPM + GA + CP-SAT + Penalty Optimizer), author the comprehensive IEEE Literature Survey Paper, and prepare the project seminar/viva presentation deck.

---

## 👥 Teammate Active Tasks & File Ownership

### 1. Role 1 & Role 2: Optimization & Benchmark Leads (Divyal & Chaitanya)
- **Active Jira Tickets:**
  - `[SCRUM-14]` `[CODEBASE] Divyal & Chaitanya: Develop & Update Core Scheduling & Benchmark Codebase` (⏳ In Progress)
  - `[SCRUM-10]` `[HERO-ENGINE] Implement CPM DAG (NetworkX) & Resource-Constrained GA (DEAP)` (⏳ In Progress — Assigned to Divyal)
  - `[SCRUM-11]` `[BENCHMARK] Implement Google OR-Tools CP-SAT Solver Benchmarking` (⏳ In Progress — Assigned to Chaitanya)
- **Files Owned:**
  - `app/engine/cpm/` (CPM DAG forward/backward pass, float calculations)
  - `app/engine/ga/` (DEAP chromosome encoding, fitness penalties, SSGS)
  - `app/engine/cpsat/` (OR-Tools CP-SAT IntervalVar & AddCumulative model)
  - `app/engine/benchmark/` (Optimality gap & execution runtime comparison script)
  - `app/engine/data/sample_tasks.json` (15-20 RCC activity dataset)
- **Interface Output:** Returns schedule dictionary `{task_id: {"start": int, "end": int, "duration": int, "crews": dict}}` and verified optimality gap vs CP-SAT.

---

### 2. Role 3: Research & Financial Optimizer (Bhushan Bhosale)
- **Active Jira Tickets:**
  - `[SCRUM-16]` `[RESEARCH-PAPER] Bhushan: Draft & Finalize Literature Survey Paper on RCPSP & Metaheuristics` (⏳ In Progress — Assigned to Bhushan)
  - `[SCRUM-8]` `[PAPER-1-DRAFT] Draft, Review & Submit Conference Paper 1 (Deadline: Oct 25)` (⏳ In Progress — Assigned to Bhushan)
  - `[SCRUM-12]` `[OPTIMIZER] Implement MahaRERA Section 18 Delay-Penalty vs Crash Cost Engine` (⏳ Ready / In Progress)
- **Files Owned:**
  - `research/literature-survey/` (Survey paper draft, LaTeX template, BibTeX references)
  - `app/engine/penalty/` (MahaRERA Section 18 SBI MCLR + 2% formula, activity crash slope engine)
  - `docs/` & `PROJECT_MEMORY.md` (System specs & Jira sync)
- **Dependencies:** Consumes Critical Path list from `app/engine/cpm/` to calculate crash cost slopes.

---

### 3. Role 4: Full-Stack & Presentation Lead (Aniket / Flexible)
- **Active Jira Tickets:**
  - `[SCRUM-15]` `[PRESENTATION] Aniket: Design & Prepare OptiBuild Project Seminar & Viva PPT Deck` (⏳ In Progress)
  - `[SCRUM-13]` `[FULLSTACK-UI] Build FastAPI Backend & Next.js Parameter Ingestion Dashboard` (⏳ Ready)
- **Files Owned:**
  - `docs/presentation/` (`OptiBuild_Project_Presentation.pptx`, slide assets, architecture diagrams)
  - `app/backend/` (FastAPI endpoints, SQLAlchemy models, Pydantic schemas)
  - `app/frontend/` (Next.js UI, parameter form, Gantt chart visualization)
- **Dependencies:** Consumes engine metrics and architecture diagrams to assemble high-impact seminar/viva slides.

---

## 🚨 Blockers & Interface Notices
- *None currently.* All teammates have active, non-colliding tasks synchronized across Jira Cloud and local git repositories.
