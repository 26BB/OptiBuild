# 📊 OptiBuild — SPPU Project Work Stage-I (410248)
## Review-II Presentation Deck & Viva Defense Guide
**Department of Computer Engineering**  
**Genba Sopanrao Moze College of Engineering, Balewadi, Pune**  
**Academic Year 2026–2027**  

---

### Slide 1: Title Slide
- **Header:** Genba Sopanrao Moze College of Engineering, Balewadi, Pune-45
- **Department:** Department of Computer Engineering
- **Course:** 410248: Project Work Stage – I (Review-II)
- **Project Title:** **OptiBuild: Resource-Constrained Construction Project Scheduling with Statutory Delay-Penalty Optimization**
- **Presented By:**
  - Bhushan V. Bhosale (Roll No. 4101) — *Financial Optimizer & Research Lead*
  - Divyal Patel (Roll No. 4102) — *CPM DAG & GA Optimization Lead*
  - Chaitanya Ghorpade (Roll No. 4103) — *CP-SAT Exact Benchmarking Lead*
  - Aniket Jadhav (Roll No. 4104) — *Full-Stack & Computer Vision Lead*
- **Under the Guidance of:** Prof. [Guide Name], Department of Computer Engineering

---

### Slide 2: Outline
1. Project Introduction & Problem Domain
2. Problem Statement & Scope Guardrails
3. SMART Project Objectives
4. Literature Survey (5 Thematic Clusters)
5. Comparative Analysis Matrix (Existing vs. Proposed)
6. Proposed System Architecture (The "Hero Module")
7. Formal Mathematical Model (SPPU 7-Tuple Set Theory)
8. Implementation Status & Passing Test Benchmarks
9. Team Viva Division & Module Ownership
10. References & Summary

---

### Slide 3: Introduction & Industry Relevance
- **The Construction Delay Reality:** Over 70% of Indian multi-story residential projects encounter schedule slippage (Doloi et al., 2012).
- **Statutory Crisis (MahaRERA Section 18):** Under Maharashtra real-estate law, delayed handover mandates compounding interest penalties to home buyers calculated at **SBI Highest MCLR + 2% per annum** on all collected funds.
- **The Industry Gap:** Traditional tools (Primavera P6, MS Project, Procore) provide manual Gantt charts and basic resource histograms, but **zero automated crashing-cost versus statutory penalty decision support**.
- **OptiBuild Proposition:** An intelligent scheduling platform integrating Critical Path Method (CPM) DAGs, Resource-Constrained Genetic Algorithm (GA), Google OR-Tools CP-SAT benchmarking, and an automated delay-penalty arbitration engine.

---

### Slide 4: Problem Statement & Scope Guardrails
- **Formal Problem Statement:**
  > To design and develop an algorithmic decision-support system that models construction tasks under renewable crew constraints (RCPSP), optimizes project makespan using heuristic and exact solvers, and dynamically advises project managers whether to crash critical activities or accept statutory delay penalties (MahaRERA Section 18).
- **Strict Academic Guardrails:**
  - ❌ **No Architectural CAD/DWG Generation:** OptiBuild is an algorithmic scheduling engine, not a floor-plan designer.
  - ❌ **No Heavy Edge Object Detection:** Discarded heavyweight YOLO in favor of lightweight MobileNetV2 binary classification (Structural vs. Finishing).
  - ❌ **No Silent/Blind Commits:** PDF parameter extraction pre-fills forms; human review-and-confirm is strictly mandatory.

---

### Slide 5: SMART Objectives
- **Objective 1 (CPM Engine):** Construct activity Directed Acyclic Graphs (DAGs) using NetworkX; compute Early/Late start-finish times and total float in $\le 50$ ms.
- **Objective 2 (Resource-Constrained GA):** Implement a permutation Genetic Algorithm using DEAP with Serial Schedule Generation Scheme (SSGS) to enforce daily labor limits.
- **Objective 3 (Exact Solver Benchmarking):** Formulate identical project networks in Google OR-Tools CP-SAT to calculate the empirical optimality gap ($\le 8\%$).
- **Objective 4 (Penalty vs. Crash Optimizer):** Implement the MahaRERA Section 18 penalty formula against activity crash slopes ($S_i$) to provide clear financial recommendations.
- **Objective 5 (Edge Progress Sensing & UI):** Fine-tune MobileNetV2 for binary stage verification ($\ge 90\%$ accuracy) with an interactive Next.js Gantt dashboard.

---

### Slide 6: Literature Survey Summary
| Cluster | Key Authors & Year | Algorithm / Methodology | Key Findings | Limitations Identified |
|---|---|---|---|---|
| **CPM Foundations** | Kelley & Walker (1959), Kolisch & Sprecher (1996) | DAG Traversal, PSPLIB Benchmark Library | Standardized RCPSP complexity parameters ($NC, RF, RS$) | Presumes infinite crew and machinery elasticity |
| **GA for RCPSP** | Hartmann (1998), Pimapunsri et al. (2022) | Permutation GA + Serial Schedule Generation (SSGS) | Prevents invalid chromosome schedules, outperforms priority rules | Omits financial crashing and penalty trade-offs |
| **Time-Cost (TCTP)** | Hegazy (1999), Li & Love (1997), Mahendra et al. (2025) | Discrete Crash Slopes, Adaptive Penalty GA | Crashing critical tasks with lowest cost slope optimizes capital | Heuristic only; lacks exact mathematical validation |
| **Exact Solvers** | Schutt et al. (2013), Perron & Furnon (2020), Sonmez (2011) | Lazy Clause Generation (LCG), OR-Tools CP-SAT | CP-SAT guarantees mathematical optimality on $\le 50$ task networks | Combinatorial explosion occurs on $>100$ task networks |
| **Delay Economics** | Doloi et al. (2012), Jain & Prakash (2023), MahaRERA (2016) | Factor Regression, Constrained LP, Act Sec 18 | Accept penalty when crashing cost exceeds daily delay liability | Existing models ignore Indian statutory compounding interest |
| **Jobsite CV** | Sandler et al. (2018), Rashidi et al. (2024), Yang (2023) | MobileNetV2 Inverted Residuals, Edge Inference | MobileNetV2 achieves $>94\%$ accuracy with $<45$ ms latency | Prior vision tools decoupled from scheduling engines |

---

### Slide 7: Comparative Analysis (Existing Systems vs. OptiBuild)
| Feature / Parameter | Primavera P6 / MS Project | BuildNext / Procore | Research Heuristic GAs | OptiBuild (Proposed) |
|---|:---:|:---:|:---:|:---:|
| **CPM Precedence DAG** | Manual / Static | Manual / ERP | Automated DAG | **Automated (NetworkX)** |
| **Resource-Constrained RCPSP** | Basic Leveling | Manual | Automated (GA) | **Automated (DEAP GA)** |
| **Exact Solver Benchmarking** | ❌ None | ❌ None | ❌ Rare | **Google OR-Tools CP-SAT** |
| **MahaRERA Delay Penalty Model** | ❌ None | ❌ Compliance PDF Only | ❌ None | **Statutory Sec 18 Formula** |
| **Crash Cost vs. Penalty Advisory** | ❌ None | ❌ None | ❌ Arbitrary Penalties | **Automated Decision Engine** |
| **Edge Visual Progress Verification** | ❌ Manual Checklists | ❌ Photo Upload Only | ❌ Isolated YOLO | **MobileNetV2 Binary Classifier** |
| **Tech Stack Openness** | Proprietary Desktop | Proprietary SaaS | Python Scripts | **FastAPI + Next.js Web App** |

---

### Slide 8: Proposed System Architecture (The "Hero Module")
```
                 ┌─────────────────────────────────────────────────────────┐
                 │                INPUT & INGESTION LAYER                  │
                 │  • Project Scope Web Form (Floors, Area, Deadline)      │
                 │  • MahaRERA PDF Auto-Extraction (Review & Confirm)      │
                 └────────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                 ┌─────────────────────────────────────────────────────────┐
                 │                       HERO ENGINE                       │
                 │  ┌───────────────────────────────────────────────────┐  │
                 │  │ 1. CPM DAG Analysis (NetworkX)                    │  │
                 │  │    • Early/Late Passes • Critical Float           │  │
                 │  └─────────────────────────┬─────────────────────────┘  │
                 │                            ▼                            │
                 │  ┌───────────────────────────────────────────────────┐  │
                 │  │ 2. Resource-Constrained GA (DEAP)                 │  │
                 │  │    • Permutation Chromosome • SSGS Active Times   │  │
                 │  └─────────────────────────┬─────────────────────────┘  │
                 │                            ▼                            │
                 │  ┌───────────────────────────────────────────────────┐  │
                 │  │ 3. CP-SAT Exact Benchmark Validator (OR-Tools)    │  │
                 │  │    • Interval Variables • AddCumulative Limits   │  │
                 │  └─────────────────────────┬─────────────────────────┘  │
                 │                            ▼                            │
                 │  ┌───────────────────────────────────────────────────┐  │
                 │  │ 4. MahaRERA Sec 18 Penalty vs Crash Cost Engine   │  │
                 │  │    • Cost Slopes vs (SBI MCLR + 2%) Interest      │  │
                 │  └───────────────────────────────────────────────────┘  │
                 └────────────────────────────┬────────────────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │    PROGRESS VERIFICATION    │               │     DASHBOARD & REPORTS     │
        │  • Weekly Jobsite Photos    │               │  • Next.js Interactive      │
        │  • MobileNetV2 (PyTorch)    │               │    Gantt & Resource Curves  │
        │  • Human Override Fallback  │               │  • Budget vs Delay Advice   │
        └─────────────────────────────┘               └─────────────────────────────┘
```

---

### Slide 9: Mathematical Model (SPPU 7-Tuple Set Theory)
- **7-Tuple Definition:**
  $$S = \{ I, O, F, DD, NDD, S_{\text{success}}, S_{\text{failure}} \}$$
- **Key Equations:**
  1. **CPM Forward / Backward:**
     $$ES_i = \max_{p \in \text{Pred}(i)} (EF_p), \quad LF_i = \min_{s \in \text{Succ}(i)} (LS_s), \quad TF_i = LS_i - ES_i$$
  2. **RCPSP Daily Capacity Constraint:**
     $$\sum_{i \in \text{Active}(t)} r_{i, k} \le R_{k, \text{max}}, \quad \forall k \in \mathcal{K}, \forall t \in [0, T]$$
  3. **MahaRERA Section 18 Statutory Penalty:**
     $$\text{Penalty}_{\text{RERA}} = \text{Amount Collected} \times (\text{SBI MCLR} + 2\%) \times \frac{\Delta t_{\text{delay}}}{365}$$
  4. **Activity Crash Cost Slope:**
     $$S_i = \frac{C_{\text{crash}, i} - C_{\text{normal}, i}}{D_{\text{normal}, i} - D_{\text{crash}, i}}$$
  5. **Arbitration Rule:**
     $$\text{If } \sum_{i \in \text{Critical}} S_i \Delta d_i < \text{Penalty}_{\text{RERA}} \implies \textbf{Crash Activity}; \quad \text{Else } \implies \textbf{Accept Penalty}$$

---

### Slide 10: Current Implementation Status & Test Verification
- ✅ **Core Scheduling & Benchmark Engine:**
  - `app/engine/cpm/cpm_engine.py`: NetworkX DAG forward/backward pass, float calculations verified.
  - `app/engine/ga/ga_scheduler.py`: DEAP permutation chromosome, SSGS decoder, and penalty evaluation complete.
  - `app/engine/cpsat/cpsat_solver.py`: Google OR-Tools CP-SAT interval scheduling verified.
  - `app/engine/benchmark/benchmark_runner.py`: Benchmark comparison running on 20-task RCC dataset.
- ✅ **Financial & Backend Infrastructure:**
  - `app/engine/penalty/penalty_engine.py`: Section 18 interest rate computation verified.
  - `app/backend/`: FastAPI REST endpoints and Pydantic schemas built.
  - `app/cv/progress_classifier.py`: MobileNetV2 binary stage classifier implemented.
- ✅ **Test Verification:** **14/14 Pytest Unit & Integration Tests Passing (100% Green).**

---

### Slide 11: Team Member Roles & Viva Defense Split

| Member | Module Role | Directory Owned | Primary Responsibilities & Viva Defense Pitch |
|---|---|---|---|
| **Divyal Patel** | **Role 1: Optimization Lead** | `app/engine/cpm/`, `app/engine/ga/` | CPM DAG topological analysis, DEAP chromosome representation, crossover/mutation, and Serial Schedule Generation Scheme (SSGS). |
| **Chaitanya Ghorpade** | **Role 2: Benchmark Lead** | `app/engine/cpsat/`, `app/engine/benchmark/` | Google OR-Tools CP-SAT solver modeling, `AddCumulative` constraint satisfaction, and optimality gap analysis. |
| **Bhushan Bhosale** | **Role 3: Financial Optimizer** | `app/engine/penalty/`, `research/`, `docs/` | MahaRERA Section 18 penalty mathematics, cost slope trade-off economics, system architecture, and SPPU documentation. |
| **Aniket Jadhav** | **Role 4: Full-Stack & CV Lead** | `app/backend/`, `app/frontend/`, `app/cv/` | FastAPI REST endpoints, Next.js Gantt chart dashboard, and MobileNetV2 binary stage classification. |

---

### Slide 12: Anticipated Viva Defense Q&A

1. **Examiner Question:** *"Why is this a Computer Engineering project and not Civil Engineering?"*  
   **Defense Answer (Divyal/Chaitanya):**  
   *"Civil engineering merely defines activity durations and predecessor links as domain inputs. The core computer science contribution is solving the Resource-Constrained Project Scheduling Problem (RCPSP), which is mathematically NP-hard, using a combination of Graph Algorithms (NetworkX DAG), Metaheuristics (DEAP Genetic Algorithm), and Combinatorial Constraint Programming (Google OR-Tools CP-SAT)."*

2. **Examiner Question:** *"Why compare Genetic Algorithms with CP-SAT?"*  
   **Defense Answer (Chaitanya):**  
   *"Genetic algorithms are fast and scale to large networks, but they are stochastic and do not guarantee an optimal solution. CP-SAT uses Lazy Clause Generation and SAT propagation to find the exact global optimum, allowing us to empirically measure and prove the optimality gap of our GA."*

3. **Examiner Question:** *"How does the MahaRERA penalty engine prevent builders from losing money?"*  
   **Defense Answer (Bhushan):**  
   *"Under Section 18, delays cost SBI MCLR + 2% per year on all buyer money collected. However, crashing tasks with overtime labor also costs money. Our engine calculates the cost slope of each critical activity. If crashing costs ₹1,500/day and the penalty is ₹5,000/day, it tells the builder to crash. If crashing costs ₹8,000/day, it warns the builder that crashing is more expensive than paying the penalty, preventing capital waste."*

4. **Examiner Question:** *"Why not use YOLOv8 for construction progress tracking?"*  
   **Defense Answer (Aniket):**  
   *"YOLOv8 requires high-end server GPUs, detailed bounding box annotations, and often produces false positives under dusty, dynamic jobsite conditions. We use MobileNetV2 for binary phase classification (Structural vs. Finishing), which runs in under 45 ms on standard mobile devices and is paired with a mandatory human review-and-confirm interface."*

---

### Slide 13: References
- [1] J. E. Kelley and M. R. Walker, "Critical-path planning and scheduling," *IRE-AIEE-ACM Papers*, 1959.
- [2] R. Kolisch and A. Sprecher, "PSPLIB - A project scheduling problem library," *EJOR*, 1996.
- [3] S. Hartmann, "A competitive genetic algorithm for RCPSP," *Naval Research Logistics*, 1998.
- [4] T. Hegazy, "Optimization of construction time-cost trade-off analysis using GA," *Can. J. Civ. Eng.*, 1999.
- [5] A. Schutt et al., "Solving RCPSP/max by lazy clause generation," *J. Scheduling*, 2013.
- [6] L. Perron and V. Furnon, "OR-Tools: CP-SAT Solver," Google Developers, 2020.
- [7] H. Doloi et al., "Analysing factors affecting delays in Indian construction projects," *IJPM*, 2012.
- [8] MahaRERA Authority, *Real Estate (Regulation and Development) Act, Section 18*, 2016.
- [9] M. Sandler et al., "MobileNetV2: Inverted residuals and linear bottlenecks," *CVPR*, 2018.

---

### Slide 14: Thank You & Q&A
- **OptiBuild: The Intelligent Construction Scheduling Engine**
- **Questions & Discussion Invited**
