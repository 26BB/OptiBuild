# 👥 OptiBuild — Teammate Quick-Start & Viva Prep Guide

> **For:** All team members of OptiBuild (SPPU B.E. Final Year Project).  
> **Goal:** Get everyone on the same page in 5 minutes for reviews, report drafting, and examiner viva.

---

## ⚡ 1. The 30-Second Elevator Pitch (Memorize This)
> *"Indian real estate builders face heavy statutory penalties under MahaRERA Section 18 (SBI MCLR + 2% interest to homebuyers) when projects are delayed. Existing software like In4Suite or Procore only tracks paperwork and manual Gantt charts.*  
>  
> *OptiBuild is an intelligent scheduling platform with a CPM + Genetic Algorithm (GA) hero module. It generates resource-constrained schedules, detects site delays, and automatically calculates whether it is cheaper to **crash the project (hire extra crews/overtime)** or **accept the MahaRERA penalty**."*

---

## 🛑 2. Scope Boundaries (What NOT to say in Viva)
Examiners love trying to trip up groups with scope questions. Keep these locked:
- ❌ **"Do we design flats or floor plans?"** $\to$ **NO.** OptiBuild only takes high-level numbers (built-up area, floors, flat counts). Floor-plan design is civil/architecture and strictly out of scope.
- ❌ **"Do we parse architect CAD drawings?"** $\to$ **NO.** CAD/DWG files are upload/attach-only for viewing; never parsed.
- ❌ **"Does AI make decisions blindly?"** $\to$ **NO.** MahaRERA PDF parsing pre-fills a form that the user must review and confirm before running the optimizer.
- ❌ **"Are we using heavy object detection (YOLO)?"** $\to$ **NO.** We use a lightweight binary classifier (**MobileNetV2: Structural vs Finishing**) suitable for low-connectivity mobile sites.

---

## 🎯 3. Group Division of Work (4-Member SPPU Viva Split)

To ensure the guide and external examiners see that everyone contributed equally:

| Team Member | Module Ownership | Viva Defense Topic | Jira Ticket |
|---|---|---|:---:|
| **Divyal Padalkar (Lead / Optimization)** | **CPM + Genetic Algorithm (DEAP)** | How NetworkX DAGs compute critical path, chromosome encoding, and GA fitness function. | `SCRUM-10` |
| **Chaitanya (Benchmark & Exact Solvers)** | **CP-SAT Solver & OR-Tools** | Google OR-Tools CP-SAT benchmarking, optimality gap, and interval constraints. | `SCRUM-11` |
| **Bhushan Bhosale (Research & Full-Stack)** | **Penalty Optimizer & Architecture** | MahaRERA interest formula ($\text{MCLR} + 2\%$), Tradeoff advisory, and System architecture. | `SCRUM-12`, `SCRUM-7` |
| **Teammate 4 (Full-Stack & CV UI)** | **FastAPI + Next.js Web App** | Database schema, REST APIs, builder dashboard, and Gantt chart visualization. | `SCRUM-13` |

---

## 🎓 4. How to Answer: "Is this CS or Civil Engineering?"
If the examiner says: *"This looks like a Civil project!"*  
**Give this exact answer:**
> *"OptiBuild is strictly an Operations Research and Applied Computer Science project solving the Resource-Constrained Project Scheduling Problem (RCPSP), which is mathematically NP-hard.*  
>  
> *Civil engineering only provides the input domain (durations and dependencies). The computational core is Computer Engineering:*  
> *1. Graph Theory (CPM DAG traversals in NetworkX)*  
> *2. Metaheuristic Optimization (Genetic Algorithm in DEAP)*  
> *3. Exact Combinatorial Solvers (Benchmarking against Google OR-Tools CP-SAT)*  
> *4. Lightweight Deep Learning (MobileNetV2 binary transfer learning)*  
>  
> *The technical distribution is 70% Optimization/Algorithms, 20% Computer Vision, and 10% Full-Stack System Architecture."*

---

## 📁 5. Where Everything Lives in the Repository

- **Complete Technical & Architectural Spec:** [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md)
- **Literature Survey (12 Audited Papers):** [`research/literature-survey/survey-matrix.md`](./research/literature-survey/survey-matrix.md)
- **Downloadable Research PDFs (11 Papers):** [`research/literature-survey/papers/`](./research/literature-survey/papers/)
- **Mathematical Model (SPPU Set Theory):** [`research/math-model/mathematical_model.md`](./research/math-model/mathematical_model.md)
- **Agile Task Tracking & Sprints:** [`docs/jira-workflow-guide.md`](./docs/jira-workflow-guide.md)
- **SPPU Stage 1 Synopsis:** [`docs/synopsis.md`](./docs/synopsis.md)

---

## 6. Guide Submission Hardcopies
If your guide asks for reference paper printouts, print the top 2 papers from [`research/literature-survey/papers/`](./research/literature-survey/papers/):
1. **P01 (CPM + GA in Python):** [`P01_Optimization_Project_Scheduling_Dynamic_CPM_GA_ArXiv1902.pdf`](./research/literature-survey/papers/P01_Optimization_Project_Scheduling_Dynamic_CPM_GA_ArXiv1902.pdf)
2. **P02 (Time-Cost Trade-Off & Crashing):** [`P02_Multi_Objective_Time_Cost_Tradeoff_Construction_ArXiv2401.pdf`](./research/literature-survey/papers/P02_Multi_Objective_Time_Cost_Tradeoff_Construction_ArXiv2401.pdf)

---

## 🤖 7. Antigravity 2.0 & Jira Workflow for All 4 Members

Whenever you open this repository in **Antigravity 2.0**:
1. Your agent automatically reads `AGENTS.md` and detects your module boundaries.
2. Tell your agent: *"I am Member X (e.g. Member 2). Check ACTIVE_SPRINT.md and tell me my current task."*
3. Use Jira ticket IDs in your commits (`git commit -m "[OPTI-102] feat: add MCLR penalty formula"`).
4. When your agent finishes a task, it updates `ACTIVE_SPRINT.md`.
5. After you `git push`, your 3 teammates run `git pull`, and their Antigravity 2.0 immediately inherits everything you built!

