# Synopsis For (410248: Project Work Stage-I)

## **OptiBuild: Resource-Constrained Construction Project Scheduling with Statutory Delay-Penalty Optimization**

**SUBMITTED TO SAVITRIBAI PHULE PUNE UNIVERSITY**  
**BACHELOR OF ENGINEERING IN COMPUTER ENGINEERING**

### **Submitted By:**
- **Bhushan V. Bhosale** (Roll No. 4101)
- **Divyal Patel** (Roll No. 4102)
- **Chaitanya Ghorpade** (Roll No. 4103)
- **Aniket Jadhav** (Roll No. 4104)

### **Under the Guidance of:**
**Prof. [Guide Name]**  
Department of Computer Engineering  
**Genba Sopanrao Moze College of Engineering, Balewadi, Pune**  
Academic Year: 2026–2027

---

## Abstract
Residential and commercial construction projects throughout India face persistent schedule delays, with empirical studies indicating that over 70% of active projects exceed planned milestones. Under statutory regulations such as Section 18 of the Real Estate (Regulation and Development) Act (MahaRERA), builders who fail to deliver projects on schedule must pay allottees recurring monthly interest calculated at the State Bank of India's benchmark lending rate plus 2% (SBI MCLR + 2%). Because cumulative homebuyer collections often exceed tens or hundreds of crores, daily statutory liability accrues rapidly. Traditional project management software (Primavera P6, MS Project) provides manual bar charting and basic resource leveling, but lacks automated re-scheduling engines and dynamic penalty-versus-crashing optimization.

This project proposes **OptiBuild**, an intelligent decision-support platform designed to solve the Resource-Constrained Project Scheduling Problem (RCPSP) while accounting for statutory delay liabilities. The system integrates:
1. A **Critical Path Method (CPM)** engine utilizing NetworkX Directed Acyclic Graphs (DAG);
2. A **Genetic Algorithm (GA)** scheduler developed with the DEAP library to generate resource-feasible schedules;
3. Exact solver benchmarking via **Google OR-Tools CP-SAT** to quantify optimality gaps;
4. A **MahaRERA Delay-Penalty vs. Crash Cost Optimizer** that compares statutory daily interest penalties against activity crash slopes to recommend cost-effective recovery actions; and
5. An edge-deployable **MobileNetV2** binary image classifier (Structural vs. Finishing) with a human-in-the-loop review interface to verify on-site milestone progress.

The expected outcome is a functional, full-stack web platform that generates resource-optimized schedules, verifies construction milestones, and minimizes statutory delay penalties for real-estate developers.

---

## 1. Problem Statement
Construction project scheduling under renewable resource constraints is an established NP-hard combinatorial optimization challenge (RCPSP). Existing commercial tools rely on static Gantt charts that do not dynamically evaluate trade-offs between activity crashing costs and statutory financial liabilities (such as MahaRERA Section 18 delay interest). Furthermore, manual progress reporting lacks automated, objective verification, causing schedule drift to go undetected until completion milestones lapse.

**Scope and Boundaries:**
- **In Scope:** Precedence modeling via DAGs, resource-constrained genetic scheduling, exact CP-SAT benchmarking, MahaRERA delay-penalty versus crash-slope optimization, and edge-based binary visual progress verification (Structural vs. Finishing).
- **Out of Scope:** Architectural CAD/DWG floor-plan generation, automated billing OCR, and heavy edge object detection (YOLO).

---

## 2. Objectives
The project pursues five SMART (Specific, Measurable, Achievable, Relevant, Time-bound) objectives:
- **Objective 1 (CPM DAG Analysis):** Model construction workflows as Directed Acyclic Graphs (DAGs) using NetworkX to compute Early/Late start-finish windows and total float within $\le 50$ ms for networks up to 100 activities.
- **Objective 2 (Resource-Constrained GA):** Implement a permutation-based Genetic Algorithm using DEAP and Serial Schedule Generation Scheme (SSGS) to enforce renewable crew limits, achieving a makespan reduction $\ge 15\%$ over un-leveled baseline schedules.
- **Objective 3 (Exact Solver Benchmarking):** Benchmark the GA scheduler against Google OR-Tools CP-SAT (`AddCumulative` constraint) on identical problem instances to calculate and document the empirical optimality gap ($\le 8\%$).
- **Objective 4 (Statutory Penalty vs. Crash Arbitrator):** Implement an automated decision engine comparing MahaRERA Section 18 statutory liabilities against critical-path activity crash slopes to determine whether to crash activities or absorb delay penalties.
- **Objective 5 (Edge Progress Verification & Full-Stack MVP):** Fine-tune a lightweight MobileNetV2 classifier achieving $\ge 90\%$ accuracy in distinguishing Structural from Finishing phases, deployed via a FastAPI backend and interactive Next.js dashboard.

---

## 3. Proposed System

### 3.1 System Overview
OptiBuild provides an end-to-end scheduling and financial risk management platform for construction developers and project engineers. The system ingests project scope parameters (gross area, floor count, target delivery date) or extracts structured data from MahaRERA registration PDFs to generate an initial Work Breakdown Structure (WBS). The core engine schedules tasks subject to daily crew limits, provides visual Gantt chart tracking, validates weekly on-site progress via photo uploads, and provides automated financial advice when schedule deviations occur.

### 3.2 Key Features and Novelty
- **Statutory Financial Optimization:** First project management framework to incorporate Indian statutory compensation laws (MahaRERA Section 18) directly into schedule crashing calculations.
- **Dual Heuristic-Exact Optimization:** Combines fast GA metaheuristics for operational daily scheduling with exact CP-SAT solvers for rigorous optimality gap benchmarking.
- **Lightweight Closed-Loop Vision Feedback:** Replaces heavy 3D BIM/YOLO setups with an efficient MobileNetV2 edge classifier supported by human review fallbacks.

### 3.3 High-Level System Block Diagram
```
                     ┌──────────────────────────────────────────────┐
                     │          DATA INGESTION & WBS SETUP          │
                     │  • Web Setup Form / MahaRERA PDF Extraction  │
                     │  • Parametric Estimation (Floors, Area)      │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │                 HERO MODULE                  │
                     │  • CPM Precedence Analysis (NetworkX DAG)    │
                     │  • Resource-Constrained GA Engine (DEAP)     │
                     │  • Exact CP-SAT Solver Benchmark (OR-Tools)  │
                     │  • Penalty vs. Crash Cost Decision Optimizer │
                     └──────────────────────┬───────────────────────┘
                                            │
                     ┌──────────────────────┴───────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   PROGRESS VERIFICATION   │                 │     FULL-STACK PORTAL     │
       │ • Weekly Site Photo Log   │                 │ • Interactive Gantt Chart │
       │ • MobileNetV2 Binary CV   │                 │ • Delay Alerts & Cost Log │
       │ • Human Review & Override │                 │ • FastAPI + Next.js UI    │
       └───────────────────────────┘                 └───────────────────────────┘
```

---

## 4. Methodology / Approach

### 4.1 Stepwise Process of Execution
1. **Scope Ingestion & WBS Generation:** Ingest project metadata (area, floors, flats, budget) and generate parametric activity durations, predecessors, and labor crew demands.
2. **Precedence Analysis (CPM):** Construct the activity DAG using NetworkX; execute forward and backward passes to determine Early Start ($ES$), Late Finish ($LF$), and total float ($TF$). Identify the critical path.
3. **Resource-Constrained GA Scheduling:** Encode tasks as topological chromosome permutations in DEAP. Apply crossover, mutation, and Serial Schedule Generation Scheme (SSGS) to ensure daily labor limits ($\sum r_{i,k} \le R_{k,\text{max}}$) are respected.
4. **Exact Solver Benchmarking:** Formulate the scheduling problem in Google OR-Tools CP-SAT using interval variables and the `AddCumulative` constraint to compute the mathematically optimal makespan and runtime gap.
5. **Progress Sensing & Delay Calculation:** Ingest site photo logs; run MobileNetV2 inference to verify stage completion. If site milestones lag behind schedule, calculate delay duration ($\Delta t$).
6. **Financial Arbitrator Formulation:** Compute statutory liability:
   $$\text{Penalty}_{\text{RERA}} = \text{Amount Collected} \times (\text{SBI MCLR} + 2\%) \times \frac{\Delta t}{365}$$
   Compare against critical activity crash slope:
   $$S_i = \frac{C_{\text{crash}, i} - C_{\text{normal}, i}}{D_{\text{normal}, i} - D_{\text{crash}, i}}$$
   Output optimal strategy: **Crash Critical Activities** if $\sum S_i \Delta d_i < \text{Penalty}_{\text{RERA}}$, else **Accept Statutory Penalty**.
7. **Interactive Dashboard:** Render interactive Gantt charts, resource histograms, and cost-vs-penalty analytics via a Next.js web application.

### 4.2 Algorithms and Frameworks
- **Algorithms:** Critical Path Method (CPM), Genetic Algorithm with SSGS (DEAP), CP-SAT Constraint Programming (OR-Tools), MobileNetV2 Transfer Learning.
- **Languages & Frameworks:** Python 3.10+, FastAPI, SQLAlchemy, PostgreSQL, PyTorch, torchvision, TypeScript, Next.js, Tailwind CSS.

---

## 5. Expected Outcomes
- **Technical Deliverables:**
  - Standalone Python scheduling engine combining NetworkX CPM, DEAP GA, and Google OR-Tools CP-SAT.
  - Automated MahaRERA Section 18 financial crash-vs-penalty optimizer module.
  - Lightweight MobileNetV2 PyTorch model for binary stage classification.
  - Full-stack web application with RESTful FastAPI backend and interactive Next.js dashboard.
- **Industry & User Benefits:**
  - Enables real estate developers to avoid statutory non-compliance penalties through data-driven scheduling recovery plans.
  - Provides site engineers with an intuitive web tool for tracking daily crew allocations and milestone progress.

---

## 6. Applications
- **Real Estate Developers & Builders:** Optimal project duration scheduling and financial risk management under MahaRERA compliance.
- **Project Management Consultants (PMC):** Rapid what-if scenario simulation when labor shortages or material procurement bottlenecks arise.
- **Academic Research in Operations Research:** Benchmarking dataset evaluating metaheuristic GA performance against exact CP-SAT solvers on civil engineering project instances.

---

## 7. Future Scope
- **Multi-Project Resource Sharing:** Expanding the GA engine to balance mobile equipment (cranes, concrete pumps) across multiple concurrent project sites.
- **Automated Weather & Supply Chain Risk Ingestion:** Incorporating monsoon precipitation forecasts and cement/steel price volatility indices into stochastic schedule models.
- **Mobile PWA Integration:** Developing a Progressive Web Application (PWA) with offline-first caching for site engineers working in low-connectivity jobsite environments.

---

## 8. References (IEEE Format)

[1] J. E. Kelley and M. R. Walker, "Critical-path planning and scheduling," in *IRE-AIEE-ACM '59 (Eastern) Papers*, 1959, pp. 160–173.  
[2] R. Kolisch and A. Sprecher, "PSPLIB - A project scheduling problem library," *European Journal of Operational Research*, vol. 96, no. 1, pp. 205–216, 1996.  
[3] S. Hartmann, "A competitive genetic algorithm for resource-constrained project scheduling," *Naval Research Logistics*, vol. 45, no. 7, pp. 733–750, 1998.  
[4] S. S. Leu and C. H. Yang, "GA-based multicriteria optimal model for construction scheduling," *Journal of Construction Engineering and Management*, vol. 125, no. 6, pp. 420–427, 1999.  
[5] T. Hegazy, "Optimization of construction time-cost trade-off analysis using genetic algorithms," *Canadian Journal of Civil Engineering*, vol. 26, no. 6, pp. 685–697, 1999.  
[6] H. Li and P. E. D. Love, "Using improved genetic algorithms to facilitate time-cost optimization," *Journal of Construction Engineering and Management*, vol. 123, no. 3, pp. 233–237, 1997.  
[7] R. Sonmez, "Discrete time-cost trade-off with a genetic algorithm and exact branch-and-bound method," *Journal of Computing in Civil Engineering*, vol. 25, no. 6, pp. 478–483, 2011.  
[8] A. Schutt, P. J. Stuckey, T. Feydy, and M. G. Wallace, "Solving RCPSP/max by lazy clause generation," *Journal of Scheduling*, vol. 16, no. 3, pp. 273–289, 2013.  
[9] L. Perron and V. Furnon, "OR-Tools user's guide: Constraint programming and satisfiability with CP-SAT," Google Developers Technical Documentation, 2020.  
[10] H. Doloi, A. Sawhney, K. C. Iyer, and S. Rentala, "Analysing factors affecting delays in Indian construction projects," *International Journal of Project Management*, vol. 30, no. 4, pp. 479–489, 2012.  
[11] A. Jain and A. Prakash, "Optimizing contractor's accruals under penalty imposition due to delays," *International Journal of Construction Management*, pp. 1–12, 2023.  
[12] Government of Maharashtra, *Real Estate (Regulation and Development) Act, 2016 - Section 18: Return of Amount and Compensation*, The Gazette of India, Act No. 16 of 2016.  
[13] M. Sandler, A. Howard, M. Zhu, A. Zhmoginov, and L.-C. Chen, "MobileNetV2: Inverted residuals and linear bottlenecks," in *Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)*, 2018, pp. 4510–4520.  
[14] A. Rashidi, M. H. Sigari, and M. Fathi, "Construction jobsite image classification using edge computing framework," *Sensors*, vol. 24, no. 4, pp. 1150–1168, 2024.  
[15] A. Mahendra, M. A. Wibowo, and J. U. D. Hatmoko, "Construction project scheduling optimization with time-cost trade-off based on genetic algorithm in Python," *Journal of Social Research*, vol. 4, no. 2, pp. 512–524, 2025.
