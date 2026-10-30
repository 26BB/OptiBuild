# Chapter 2: Literature Survey
## SPPU B.E. Project Work Stage-I (410248)
**Project Title:** OptiBuild: Resource-Constrained Construction Project Scheduling with Statutory Delay-Penalty Optimization  
**Department:** Computer Engineering, Genba Sopanrao Moze College of Engineering, Balewadi, Pune  
**Savitribai Phule Pune University (SPPU)**  

---

### 2.1 Introduction to the Literature Survey
Real estate construction in India faces chronic delivery slippage, triggering stringent legal penalties under statutory frameworks like the Real Estate (Regulation and Development) Act (MahaRERA Section 18). While software tools such as Primavera P6, Microsoft Project, and ERP suites assist with baseline tracking, they do not computationally synthesize resource allocation limits with legal and financial penalty liabilities.

From a computer science perspective, scheduling project tasks under restricted resources is defined as the Resource-Constrained Project Scheduling Problem (RCPSP). RCPSP is a well-known combinatorial optimization challenge proven to be NP-hard. 

To build an academically sound and practically viable solution, this chapter conducts a structured literature survey across twenty-two peer-reviewed papers and authoritative references. The surveyed works are organized into five core functional clusters:
1. **Critical Path Method (CPM) and Baseline Scheduling Foundations**
2. **Genetic Algorithms (GA) and Metaheuristics for RCPSP and Time-Cost Trade-Off (TCTP)**
3. **Exact Solvers, Constraint Satisfaction, and Benchmarking (CP-SAT / LCG)**
4. **Statutory Delay Penalties, Liquidated Damages, and Financial Crashing Economics**
5. **Computer Vision (CV) and Edge Inference for Progress Tracking**

---

### 2.2 Critical Path Method (CPM) and Scheduling Foundations
Activity dependency networks are historically modeled as Directed Acyclic Graphs (DAG) $G = (V, E)$, pioneered by **Kelley and Walker (1959)**. Tasks $V$ represent project operations, and directed edges $E$ indicate strict sequence constraints.
- **Forward Sweep:** Determines Early Start ($ES_i$) and Early Finish ($EF_i$) times by traversing the network from start to finish:
  $$ES_i = \max_{p \in \text{Pred}(i)} (EF_p), \quad EF_i = ES_i + d_i$$
- **Backward Sweep:** Calculates Late Finish ($LF_i$) and Late Start ($LS_i$) by traversing backwards from the project deadline:
  $$LF_i = \min_{s \in \text{Succ}(i)} (LS_s), \quad LS_i = LF_i - d_i$$
- **Total Float:** $TF_i = LS_i - ES_i$. Activities possessing $TF_i = 0$ constitute the critical path governing total duration.

**Limitation:** Classical CPM assumes infinite resource availability. In civil construction, crews, machinery, and material throughput are strictly limited.

To benchmark resource-constrained scheduling algorithms, **Kolisch and Sprecher (1996)** developed the Project Scheduling Problem Library (PSPLIB). PSPLIB provides standardized problem sets parameterized by Network Complexity ($NC$), Resource Factor ($RF$), and Resource Strength ($RS$), establishing a universal testing baseline for RCPSP research.

---

### 2.3 Genetic Algorithms and Metaheuristics for RCPSP and TCTP
Because exact methods hit combinatorial bottlenecks on large scheduling DAGs, heuristic and metaheuristic approaches have been widely studied.

#### 2.3.1 Chromosome Representation and Schedule Generation
- **Hartmann (1998)** established a landmark permutation-based genetic representation evaluated using a Serial Schedule Generation Scheme (SSGS). Rather than encoding explicit timestamps, chromosomes represent precedence-feasible activity queues. Decoding sequentially places tasks into the earliest valid time windows respecting resource constraints. This prevents invalid schedules and outperforms classical priority heuristics.
- **Pimapunsri et al. (2022)** adapted permutation GAs with elitist strategies for aircraft maintenance under complex resource restrictions, demonstrating that topological repair operators maintain chromosome validity without destroying genetic diversity.

#### 2.3.2 Multi-Criteria Scheduling and Resource Leveling
- **Leu and Yang (1999)** introduced a multi-criteria GA combining duration reduction with resource leveling. They used resource moments to minimize daily crew fluctuations. However, their two-stage decoupled optimization approach can converge on sub-optimal local basins when direct activity crashing costs are applied.

#### 2.3.3 Time-Cost Trade-Off Problem (TCTP) and Crashing
- **Hegazy (1999)** formulated discrete TCTP using genetic search, allowing critical tasks to be expedited by assigning overtime or additional crews. Hegazy calculated the activity cost slope as:
  $$S_i = \frac{C_{\text{crash}, i} - C_{\text{normal}, i}}{D_{\text{normal}, i} - D_{\text{crash}, i}}$$
  Crashing tasks with the lowest cost slope produces the most cost-effective acceleration.
- **Li and Love (1997)** introduced dynamic penalty functions into GA fitness evaluations, allowing intermediate search iterations to explore infeasible boundary solutions rather than instantly discarding them.
- **Hosny (2019)** utilized NSGA-II to construct Pareto frontiers between project makespan and direct costs.
- **Mohammadjafari et al. (2024)** incorporated productivity learning curves into multi-mode TCTP.
- **Mahendra et al. (2025)** presented a Python-based implementation uniting NetworkX DAG representations with GA heuristics, reporting a 34.82% duration reduction and a 3.49% cost savings on a real-world civil case study.

---

### 2.4 Exact Solvers, Constraint Programming, and Benchmarking
Metaheuristics provide fast execution but do not guarantee mathematical optimality. Exact solvers are essential to measure the optimality gap.

- **Constraint Programming (CP):** Formulates project tasks as interval decision variables bounded by cumulative resource capacities:
  $$\sum_{i \in \text{Active}(t)} r_{i, k} \le R_{k, \text{max}}, \quad \forall k \in \mathcal{K}, \forall t \in [0, T]$$
- **Schutt et al. (2013):** Implemented Lazy Clause Generation (LCG), uniting finite domain constraint propagation with Boolean Satisfiability (SAT) solvers. Whenever a propagator deduces domain pruning or detects an infeasible condition, it generates explanatory clauses stored in a SAT database, allowing non-chronological backjumping.
- **Perron and Furnon (2020) / Google OR-Tools CP-SAT:** Incorporated LCG principles into the open-source Google OR-Tools CP-SAT solver, providing robust constraint modeling through the `AddCumulative` constraint.
- **Baptiste and Le Pape (1996) & Sonmez (2011):** Benchmarked exact Branch-and-Bound algorithms against metaheuristics. Sonmez showed that while exact algorithms prove true mathematical optimality for project networks with up to 50 tasks, combinatorial explosion occurs on networks with over 100 activities. This justifies a dual-engine architecture: fast GA scheduling for operational use, benchmarked against CP-SAT for mathematical verification.

---

### 2.5 Construction Delay Economics and Statutory Penalties
Project scheduling tools must consider the financial consequences of delays:

- **Doloi et al. (2012):** Investigated delay factors in Indian construction, revealing that over 70% of projects experience significant delays due to cash-flow shortages, late approvals, and delayed sub-contractor mobilization. Traditional project managers frequently delay re-scheduling until schedule slippage becomes irreversible.
- **Jain and Prakash (2023):** Modeled contractor financial accruals under liquidated damages (LD), demonstrating that when the cost slope of remaining critical activities exceeds daily contractual penalties, the financially optimal decision is to accept the delay penalty rather than pay for excessive labor overtime.
- **Vaziri et al. (2024):** Applied stochastic risk optimization using Conditional Value at Risk (CVaR) to evaluate schedule robustness under material delivery delays.
- **Prins et al. (2022):** Developed automated network restructuring controllers to dynamically reorganize task dependencies upon detecting progress delays.
- **Statutory MahaRERA Mandate (2016):** Unlike arbitrary liquidated damages, Section 18 of the MahaRERA Act mandates compounding interest on total homebuyer funds collected:
  $$\text{Penalty}_{\text{RERA}} = \text{Amount Collected} \times (\text{SBI MCLR} + 2\%) \times \frac{\text{Delay Days}}{365}$$
  Because collected capital often spans tens to hundreds of crores, this statutory interest quickly overtakes direct construction costs.

---

### 2.6 Computer Vision for Site Progress Monitoring
Automated rescheduling depends on accurate, unbiased site telemetry:

- **Heavyweight Object Detectors:** **Yang et al. (2023)** tested YOLOv7 and Faster R-CNN on construction sites. While accurate under ideal conditions, these models require dedicated GPU infrastructure, demand extensive bounding box annotations, and are sensitive to dust, weather, and occlusions.
- **Lightweight Edge Architectures:** **Sandler et al. (2018)** designed MobileNetV2 with inverted residual blocks and depthwise separable convolutions, reducing compute and memory usage by over 80% compared to ResNet architectures.
- **Jobsite Edge Classification:** **Rashidi et al. (2024)** deployed quantized MobileNetV2 models for edge-based jobsite image classification, achieving over 94% accuracy with inference times under 45 ms. This demonstrates that binary phase classification (e.g., Structural vs. Finishing) provides a reliable progress signal on resource-constrained mobile hardware without the overhead of heavy object detection models.

---

### 2.7 Comparative Analysis Matrix

| Paper / System | Year | Methodology | Resource Limits | TCTP Crashing | Statutory Penalty | Exact Benchmark | Visual Feedback | Major Limitations |
|---|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **Hartmann** | 1998 | Permutation GA + SSGS | ✅ | ❌ | ❌ | ❌ | ❌ | Focuses only on makespan; no cost or financial penalty models. |
| **Leu & Yang** | 1999 | Multi-Criteria GA | ✅ | ✅ | ❌ | ❌ | ❌ | Two-stage leveling prone to local optima under direct crashing. |
| **Hegazy** | 1999 | Discrete TCTP GA | ❌ | ✅ | ❌ | ❌ | ❌ | Omits renewable labor caps and physical site progress inputs. |
| **Li & Love** | 1997 | Adaptive Penalty GA | ❌ | ✅ | ❌ | ❌ | ❌ | Uses arbitrary penalty weights without statutory legal grounding. |
| **Sonmez** | 2011 | Hybrid GA + Branch-and-Bound | ❌ | ✅ | ❌ | ✅ | ❌ | High computational scaling latency; ignores resource leveling. |
| **Schutt et al.** | 2013 | Lazy Clause Generation / SAT | ✅ | ❌ | ❌ | ✅ | ❌ | Theoretical focus; lacks financial penalty logic and field telemetry. |
| **Hosny** | 2019 | Elitist NSGA-II | ❌ | ✅ | ❌ | ❌ | ❌ | Does not model renewable labor crew capacity constraints. |
| **Doloi et al.** | 2012 | Regression Factor Analysis | ❌ | ❌ | ❌ | ❌ | ❌ | Diagnostic survey; provides no automated scheduling tools. |
| **Jain & Prakash** | 2023 | Constrained Linear Programming | ❌ | ✅ | ✅* | ❌ | ❌ | Analyzes static contractual penalties; lacks dynamic rescheduling. |
| **Vaziri et al.** | 2024 | Hybrid GA–GWO Metaheuristic | ❌ | ✅ | ✅* | ❌ | ❌ | High computational complexity; ignores Indian regulatory statutes. |
| **Prins et al.** | 2022 | Automated Network Restructuring | ✅ | ✅ | ❌ | ❌ | ❌ | Focuses on sequencing changes without formal crash slope economics. |
| **Mahendra et al.**| 2025 | NetworkX CPM + DEAP GA | ❌ | ✅ | ❌ | ❌ | ❌ | Single-project scope; lacks resource leveling and visual telemetry. |
| **Rashidi et al.**| 2024 | Quantized MobileNetV2 on Edge | ❌ | ❌ | ❌ | ❌ | ✅ | Isolated vision classifier; decoupled from project scheduling systems. |
| **Yang et al.** | 2023 | Real-Time Object Detection (YOLO)| ❌ | ❌ | ❌ | ❌ | ✅ | Computationally heavy; susceptible to false triggers on raw sites. |
| **OptiBuild (Proposed)** | **2026** | **DEAP GA + CP-SAT + MobileNetV2** | **✅** | **✅** | **✅**† | **✅** | **✅** | **Unified system combining scheduling, penalties, and vision.** |

*\* Evaluates contract-specific liquidated damages (LD), not statutory consumer protection laws.*  
*† Formally integrates statutory MahaRERA Section 18 penalty computation (SBI MCLR + 2%) into crashing trade-off logic.*

---

### 2.8 Research Gaps and OptiBuild Contributions

Based on this comprehensive literature review, three critical research gaps were identified:

1. **Absence of Statutory Regulatory Penalty Integration in Scheduling Engines:**  
   Existing literature models financial damages either as static lump sums or linear liquidated damages formulas. None integrate mandatory statutory compensation laws like **MahaRERA Section 18** (SBI MCLR + 2% per annum on total homebuyer funds collected). Because consumer investments in real estate projects represent tens to hundreds of crores, daily statutory liability accrues rapidly, making traditional schedule crashing models inadequate.

2. **Dichotomy Between Heuristic Speed and Exact Solver Verification:**  
   Most contemporary systems rely solely on metaheuristic algorithms (GA) without quantifying their distance from mathematical optimality, or they rely on exact solvers (Branch-and-Bound, CP-SAT) that become computationally intractable on real-world networks with over 100 activities. There is a lack of practical architectures that run fast genetic algorithms for daily scheduling while benchmarking against an exact CP-SAT solver to verify the optimality gap.

3. **Decoupling of Edge Visual Site Telemetry from Dynamic Scheduling Engines:**  
   Recent computer vision research on construction sites focuses primarily on isolated perceptual tasks (detecting helmets, equipment, or cracks). These models are not integrated into scheduling backends. There is an absence of closed-loop systems where edge-classified progress updates automatically trigger CPM float recalculations and invoke penalty-versus-crashing advisory workflows.

#### The OptiBuild Contribution:
OptiBuild addresses these three research gaps through a single integrated platform:
- **Core Engine:** Integrates a NetworkX CPM DAG engine with a DEAP Resource-Constrained Genetic Algorithm.
- **Exact Benchmarking:** Benchmarks GA performance against Google OR-Tools CP-SAT using the `AddCumulative` constraint.
- **Statutory Decision Engine:** Evaluates MahaRERA Section 18 penalties against activity crash slopes, providing actionable recommendations to project managers (accelerate critical tasks or accept the penalty).
- **Edge Progress Feedback:** Uses a lightweight MobileNetV2 binary classifier (Structural vs. Finishing) with a human-in-the-loop review interface to verify physical site status.
