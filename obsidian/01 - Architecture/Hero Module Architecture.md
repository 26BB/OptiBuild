---
title: "Hero Module Architecture"
type: "architecture"
tags: ["optibuild", "hero-module", "cpm", "ga", "cpsat", "maharera"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🧮 OptiBuild Hero Module — Unified Scheduling & Optimization Architecture

> **The Core Academic Moat:** OptiBuild is intentionally architected around **one mathematically heavyweight Hero Module** to prevent examiner criticism of being "several unrelated APIs stapled together".

§

## 🏗️ Architectural Topology

The Hero Module integrates four mathematical engines into a cohesive pipeline:

```
                            ┌──────────────────────────────────────────────┐
                            │                 HERO MODULE                  │
                            │  1. CPM Precedence DAG (NetworkX)            │
                            │  2. Resource-Constrained GA (DEAP)           │
                            │  3. Exact Solver Benchmarking (OR-Tools)    │
                            │  4. MahaRERA Delay vs Crash Tradeoff Engine  │
                            └──────────────────────┬───────────────────────┘
                                                   │
             ┌─────────────────────┬───────────────┴──────────────┬─────────────────────┐
             ▼                     ▼                              ▼                     ▼
       [Data Ingestion]     [WBS Generation]             [Progress Verification]   [Decision Dashboard]
       - Web Form / RERA    - Parametric ratios          - Weekly site photos      - Makespan vs Budget
       - Confirmed by User  - Activity quantities        - MobileNetV2 (Binary)    - Crash vs Penalty Advice
```

§

## 🔄 Mathematical Engine Flow

1. **Precedence Ingestion (`[[CPM & Graph Traversal]]`):**
   - Ingests $N$ activities with durations $d_i$ and dependency tuples $(u, v)$.
   - Constructs DAG $G=(V, E)$ via NetworkX.
   - Computes Earliest/Latest Start/Finish times ($ES, EF, LS, LF$) and Total Float ($TF$).
   - Flags zero-float tasks as the initial **Critical Path ($\mathcal{CP}$)**.

2. **Resource-Constrained GA Optimization (`[[Genetic Algorithm & RCPSP]]`):**
   - Applies the Serial Schedule Generation Scheme (SSGS) or Topological GA representation.
   - Respects renewable daily crew limits $\sum_{i \in \text{Active}(t)} R_{i, k} \le R_{k, \text{max}}$.
   - Minimizes project makespan $T$ and indirect overheads.

3. **Exact Solver Benchmark (`[[CP-SAT Benchmarking]]`):**
   - Formulates the identical scheduling problem in Google OR-Tools CP-SAT using `NewIntervalVar` and `AddCumulative`.
   - Solves for the provably optimal makespan $T^*$ on small-to-medium project instances.
   - Calculates the empirical **Optimality Gap**:
     $$\text{Gap} = \frac{T_{\text{GA}} - T_{\text{exact}}}{T_{\text{exact}}} \times 100\%$$

4. **Delay Penalty vs. Crash Cost Advisor (`[[MahaRERA Financial Engine]]`):**
   - When project drift occurs, calculates the daily statutory penalty under MahaRERA Section 18:
     $$\text{Daily Penalty} = \frac{\text{Funds Collected} \times (\text{SBI MCLR} + 2\%)}{365}$$
   - Calculates the **Cost Slope** for every activity on the Critical Path:
     $$S_i = \frac{C_{\text{crash}, i} - C_{\text{normal}, i}}{D_{\text{normal}, i} - D_{\text{crash}, i}}$$
   - Iteratively crashes the cheapest critical activity as long as $S_i < \text{Daily Penalty}$.
   - If crashing cost exceeds statutory penalty, advises the builder to accept the penalty.

§
