---
title: "Team Viva Split & Modular Ownership"
type: "viva"
tags: ["team", "roles", "viva-split", "ownership"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 👥 Team Viva Split & Modular Ownership

> **SPPU 4-Member Balance:** The codebase is cleanly split into 4 independent modules so that each teammate defends an individual technical pillar during the oral viva.

§

## 📋 The 4 Modular Roles

### 🧑‍💻 Role 1: Optimization Lead (Divyal)
* **Code Owned:** `app/engine/cpm/`, `app/engine/ga/`
* **Viva Defense Topics:**
  - NetworkX DAG graph traversal and cycle detection.
  - Forward and backward CPM passes; total and free float equations.
  - DEAP Genetic Algorithm chromosome encoding and topological sorting.
  - Serial Schedule Generation Scheme (SSGS) and resource clash penalty function.

### 🧑‍💻 Role 2: Benchmark Lead (Chaitanya)
* **Code Owned:** `app/engine/cpsat/`, `app/engine/benchmark/`
* **Viva Defense Topics:**
  - Combinatorial optimization and Constraint Programming (CP).
  - Google OR-Tools CP-SAT formulation (`NewIntervalVar`, `AddCumulative`).
  - Empirical optimality gap calculation ($T_{\text{GA}}$ vs $T^*$).
  - Runtime scaling analysis (exponential exact solver vs linear GA).

### 🧑‍💻 Role 3: Research & Financial Optimizer (Bhushan Bhosale)
* **Code Owned:** `app/engine/penalty/`, `research/math-model/`, `docs/`
* **Viva Defense Topics:**
  - MahaRERA Section 18 statutory delay interest formula (SBI MCLR + 2%).
  - Activity crash cost slope calculation ($S_i = \Delta C / \Delta D$).
  - Economic decision rule: Crashing critical path vs accepting delay penalties.
  - System architecture, research papers, and literature survey methodology.

### 🧑‍💻 Role 4: Full-Stack & Computer Vision Lead (Aniket)
* **Code Owned:** `app/backend/`, `app/frontend/`, `app/cv/`, `app/ingestion/`
* **Viva Defense Topics:**
  - FastAPI asynchronous REST API architecture and PostgreSQL relational schema.
  - Next.js responsive dashboard, interactive Gantt chart, and resource histograms.
  - MobileNetV2 transfer learning for binary stage classification (Structural vs Finishing).
  - Human-in-the-loop review-and-confirm UX pattern for PDF ingestion.

§
