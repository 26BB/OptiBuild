# 🏃 OptiBuild — Active Sprint Board (Live Team Sync)

> **Antigravity Fast-Sync File:** Checked before starting work to avoid collisions and coordinate with teammates.

---

## 📅 Sprint 2: Core Optimization Engine, MVP Architecture & Testing
- **Dates:** Oct 7, 2026 – Oct 28, 2026
- **Sprint Goal:** Build the standalone Hero Module (CPM + GA + CP-SAT + Penalty Optimizer), FastAPI backend, MobileNetV2 CV inference, and 100% passing automated test suite.
- **Sprint Status:** ✅ **MVP Codebase Built & Verified (14/14 Pytest Tests Passing)**

---

## 👥 Teammate Active Tasks & File Ownership

### 1. Role 1 & Role 2: Optimization & Benchmark Leads (Divyal & Chaitanya)
- **Active Jira Tickets:**
  - `[SCRUM-14]` `[CODEBASE] Core Scheduling & Benchmark Codebase` (✅ COMPLETE)
  - `[SCRUM-10]` `[HERO-ENGINE] Implement CPM DAG (NetworkX) & Resource-Constrained GA (DEAP)` (✅ COMPLETE)
  - `[SCRUM-11]` `[BENCHMARK] Implement Google OR-Tools CP-SAT Solver Benchmarking` (✅ COMPLETE)
- **Files Delivered & Verified:**
  - `app/engine/cpm/cpm_engine.py` (CPM DAG forward/backward pass, float calculations)
  - `app/engine/ga/ga_scheduler.py` (DEAP chromosome encoding, fitness penalties, SSGS)
  - `app/engine/cpsat/cpsat_solver.py` (OR-Tools CP-SAT IntervalVar & AddCumulative model)
  - `app/engine/benchmark/benchmark_runner.py` (Optimality gap & execution runtime comparison script)
  - `app/engine/data/sample_tasks.json` (20-activity RCC benchmark dataset)
- **Interface Output:** Returns schedule dictionary `{task_id: {"start": int, "end": int, "duration": int, "crews": dict}}` and verified optimality gap vs CP-SAT.

---

### 2. Role 3: Research & Financial Optimizer (Bhushan Bhosale)
- **Active Jira Tickets:**
  - `[SCRUM-16]` `[RESEARCH-PAPER] Draft & Finalize Literature Survey Paper on RCPSP & Metaheuristics` (✅ DRAFT COMPLETE — Overleaf Bundle Ready)
  - `[SCRUM-8]` `[PAPER-1-DRAFT] Draft, Review & Submit Conference Paper 1 (Deadline: Oct 25)` (✅ DRAFT COMPLETE — IEEE LaTeX & BibTeX Complete)
  - `[SCRUM-12]` `[OPTIMIZER] Implement MahaRERA Section 18 Delay-Penalty vs Crash Cost Engine` (✅ COMPLETE)
- **Files Delivered & Verified:**
  - `research/references.bib` & `research/literature-survey/references.bib` (22 verified authentic BibTeX citations across CPM, GA, CP-SAT, MahaRERA, MobileNetV2)
  - `research/literature-survey/optibuild_literature_survey.tex` (Complete IEEEtran conference paper draft with 8 sections, 22 citations, comparative analysis matrix table, and OptiBuild Hero architecture)
  - `research/literature-survey/optibuild_overleaf_package.zip` (Self-contained Overleaf bundle: `.tex` + `.bib` + `IEEEtran.cls`)
  - `app/engine/penalty/penalty_engine.py` (MahaRERA Section 18 SBI MCLR + 2% formula, activity crash slope engine)
  - `docs/` & `PROJECT_MEMORY.md` (System specs & Jira sync)
  - `optibuild-mvp-product-spec.md` (MVP Product Spec & Launch Readiness Artifact)
- **Dependencies:** Consumes Critical Path list from `app/engine/cpm/` to calculate crash cost slopes.

---

### 3. Role 4: Full-Stack & Presentation Lead (Aniket / Flexible)
- **Active Jira Tickets:**
  - `[SCRUM-15]` `[PRESENTATION] Design & Prepare OptiBuild Project Seminar & Viva PPT Deck` (✅ COMPLETE — Slide Script & Viva Q&A in `docs/review_2_presentation.md`)
  - `[SCRUM-13]` `[FULLSTACK-UI] Build FastAPI Backend & Ingestion / CV Modules` (✅ COMPLETE)
- **Files Delivered & Verified:**
  - `docs/synopsis.md` (SPPU Stage-1 Official Synopsis format matching Genba Sopanrao Moze College guidelines)
  - `docs/chapter2_literature_survey.md` (SPPU Project Report Chapter 2 complete with 22 citations & matrix)
  - `docs/review_2_presentation.md` (14-slide SPPU Review-II deck script with 4-member viva defense split)
  - `app/backend/main.py` (FastAPI app, CORS, OpenAPI Swagger at `/docs`)
  - `app/backend/models.py` & `app/backend/schemas.py` (Pydantic v2 schemas and SQLAlchemy 2.0 ORM)
  - `app/backend/routers/` (Projects, Activities, Optimize, Ingestion, Progress, Health)
  - `app/ingestion/pdf_extractor.py` (pdfplumber MahaRERA PDF extraction)
  - `app/cv/progress_classifier.py` (MobileNetV2 binary classifier: Structural vs. Finishing)
  - `app/tests/` (14 unit and integration tests passing)

---

## 🚨 Blockers & Interface Notices
- *None.* Complete MVP foundation is now live, verified, and ready for real-user testing and presentation.
