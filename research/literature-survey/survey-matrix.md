# Literature Survey Comparative Matrix

> **Academic Target:** SPPU B.E. Computer Engineering Final Year Project (*OptiBuild*).
> **Scope:** 12+ peer-reviewed papers spanning Operations Research, Genetic Algorithms, Time-Cost Trade-Off (TCTP), RCPSP, Exact Solvers, and Edge Computer Vision (IEEE, ASCE, Elsevier, Springer, MDPI, ArXiv).

---

## 1. Comparative Analysis Matrix

| Paper ID | Title & Year | Authors & Publication | Key Methodology / Algorithm | Parameters Evaluated | Limitations / Research Gap | Relevance to OptiBuild |
|---|---|---|---|---|---|---|
| **[P01]** | *Stochastic Risk-Aware Time–Cost Optimization of Construction Schedules (2024)* | Vaziri et al. (*Buildings*, MDPI) | Hybrid GA–GWO with discrete integer crash-day decisions | Makespan, Direct crash cost, Liquidated damages (LD), CVaR | High computational complexity; ignores statutory Indian real-estate regulations | Direct mathematical formulation for OptiBuild's Penalty-vs-Crash optimizer |
| **[P02]** | *Construction Project Scheduling Optimization with TCTP Based on GA in Python (2025)* | Mahendra et al. (*J. Social Research / Civ. Eng.*) | NetworkX DAG CPM + Python Genetic Algorithm | Project makespan, Total project cost, Hyperparameter tuning (Pop=50, Gen=100) | Single-project scope; lacks resource leveling and live progress tracking | Validates OptiBuild's exact Python tech stack (NetworkX + GA with 34.8% duration reduction) |
| **[P03]** | *Optimizing Contractor's Accruals under Penalty Imposition due to Delays (2023)* | Jain & Prakash (*Int. J. Constr. Manage.*, Taylor & Francis) | Constrained Linear Programming + CPM | Contractor cash accruals, Daily crash slope vs penalty rate | Tested on static historical case study; lacks automated re-scheduling | Justifies the economic rule: accept delay penalty when crashing cost slope exceeds penalty |
| **[P04]** | *A Competitive Genetic Algorithm for RCPSP (1998)* | Hartmann (*Naval Research Logistics*) | Permutation GA with Serial Schedule Generation Scheme (SSGS) | Average deviation from optimal makespan across PSPLIB instances | Focuses solely on duration minimization without financial crashing trade-offs | Algorithmic baseline for OptiBuild's DEAP chromosome encoding and resource constraint checks |
| **[P05]** | *Optimization of Construction Time–Cost Trade-Off Analysis Using GA (1999)* | Hegazy (*Can. J. Civ. Eng.*) | Discrete TCTP via Genetic Algorithm | Activity crash slopes, Indirect project overhead, Total cost | Assumes deterministic durations; lacks exact solver benchmarking | Foundational formulation for OptiBuild's activity crash slope equations |
| **[P06]** | *Using Improved Genetic Algorithms to Facilitate Time-Cost Optimization (1997)* | Li & Love (*ASCE J. Constr. Eng. Manage.*) | GA with dynamic penalty functions | Convergence rate, Schedule violation penalties | Prone to local optima in large search spaces; no interactive builder dashboard | Academic justification for penalty-weighted fitness evaluation in DEAP |
| **[P07]** | *Elitist Multi-Objective GA to Solve TCTP in Construction Industry (2019)* | Hosny (*ASGE / ICASGE Proceedings*) | Elitist NSGA-II Multi-Objective GA | Pareto frontier spread, Crowding distance, Cost-duration trade-offs | Does not model renewable labor constraints or statutory compliance | Validates multi-objective Pareto frontier generation for builder decision support |
| **[P08]** | *GA-Based Multicriteria Optimal Model for Construction Scheduling (1999)* | Leu & Yang (*ASCE J. Constr. Eng. Manage.*) | Multi-criteria GA with resource leveling | Daily resource moment, Peak crew demands, Project makespan | Two-stage decoupled optimization can miss global optimum | Primary reference for crew-size limits and resource leveling in OptiBuild |
| **[P09]** | *Solving RCPSP with Generalized Precedences by Lazy Clause Generation (2013)* | Schutt, Stuckey, Wallace, Perron (*Comput. Oper. Res.*) | Lazy Clause Generation (LCG) / SAT-based Constraint Programming | Makespan, Cumulative resource feasibility, Search proof time | High memory consumption on massive networks; steep modeling curve | Mathematical foundation for benchmarking DEAP GA against Google OR-Tools CP-SAT |
| **[P10]** | *Construction Jobsite Image Classification Using Edge Computing Framework (2024)* | Rashidi et al. (*Sensors*, MDPI) | MobileNetV2 with INT8 quantization on Edge Hardware | Inference latency (ms), Accuracy, On-device memory footprint | Limited to coarse category classification; does not link to project schedules | Justifies OptiBuild's lightweight MobileNetV2 binary stage classifier (Structural vs Finishing) |
| **[P11]** | *PSPLIB — A Project Scheduling Problem Library (1996)* | Kolisch & Sprecher (*Eur. J. Oper. Res.*) | Systematic Benchmark Instance Generator | Network complexity ($NC$), Resource factor ($RF$), Resource strength ($RS$) | Synthetic data does not capture real-world civil procurement delays | Standardizes benchmark instances for evaluating OptiBuild's scheduling engine |
| **[P12]** | *Discrete TCTP with GA and Exact Branch-and-Bound (2011)* | Sonmez (*ASCE J. Comput. Civ. Eng.*) | Hybrid GA vs Exact Branch-and-Bound comparison | Optimality gap %, Runtime scaling across problem scales ($N > 50$) | Branch-and-bound hits combinatorial explosion on large networks | Establishes academic justification for comparing heuristic GA against exact CP solvers |

---

## 2. Identified Research Gap for OptiBuild

1. **Absence of Statutory Penalty-Aware Optimization:** Existing literature on construction scheduling (Hartmann, Leu & Yang, Sonmez) models duration minimization or arbitrary liquidated damages. None integrate mandatory statutory compensation laws like **MahaRERA Section 18** (SBI MCLR + 2% monthly interest accrued on homebuyer funds).
2. **Gap Between Heuristic Scheduling and Exact Solvers:** Classical papers either apply pure heuristics (GA) or pure exact solvers (MILP/Branch-and-Bound). OptiBuild bridges this by deploying a fast **Genetic Algorithm (DEAP)** for daily planning while empirically validating its optimality gap against **Google OR-Tools CP-SAT**.
3. **Overkill vs. Pragmatic Edge Verification:** Existing progress tracking research pushes complex 3D BIM or high-overhead object detectors (YOLOv8) that fail on low-connectivity Indian jobsites. OptiBuild couples a lightweight **binary stage classifier (MobileNetV2)** with a strict human review-and-confirm fallback.

---

## 3. Local PDF Archive in Repository
All primary base papers and open-access reference PDFs are stored locally in:
`c:\Opti Build\research\literature-survey\papers\`
