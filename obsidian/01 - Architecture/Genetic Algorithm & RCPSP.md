---
title: "Resource-Constrained Genetic Algorithm (RCPSP)"
type: "architecture"
tags: ["ga", "deap", "rcpsp", "metaheuristics", "optimization"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🧬 Resource-Constrained Genetic Algorithm (RCPSP)

> **Lead Module:** `app/engine/ga/`  
> **Framework:** DEAP (Distributed Evolutionary Algorithms in Python)  
> **Viva Defense Focus:** Chromosome encoding, fitness evaluation, resource clash handling, metaheuristic convergence.

§

## 🎯 The RCPSP Problem Statement

The classical Resource-Constrained Project Scheduling Problem (RCPSP) is known to be **NP-hard** in the strong sense ($m \ge 2$ resources).
While CPM assumes unlimited resources, real construction sites operate with strict daily crew limits (e.g., maximum 12 masons, 8 carpenters, 1 concrete pump per day).

§

## 🧬 Genetic Algorithm Design

### 1. Chromosome Representation
* **Permutation-based Activity List:** A valid topological sort of activities respecting DAG precedence constraints.
* **Mode Assignment (Crash Mode):** A secondary integer vector indicating whether an activity is executed at normal pace ($m=0$), single crash ($m=1$), or double crash ($m=2$).

### 2. Schedule Decoder: Serial Schedule Generation Scheme (SSGS)
* Iterates through the chromosome activity by activity.
* For activity $i$, finds the earliest start time $t \ge \max_{p \in \text{Pred}(i)} (\text{Finish}_p)$ such that for all resource types $k$:
  $$\sum_{j \in \text{Active}(\tau)} R_{j, k} + R_{i, k} \le R_{k, \text{max}} \quad \forall \tau \in [t, t + d_i)$$

### 3. Fitness Function
OptiBuild's objective minimizes total project financial commitment:
$$\text{Minimize } Z = C_{\text{indirect}} \times T + \sum_{i=1}^N C_{\text{direct}, i} + \sum_{i=1}^N C_{\text{crash}, i} + \text{Penalty}_{\text{RERA}}(T) + \Pi_{\text{violation}}$$
* $T$: Achieved makespan under resource limits.
* $C_{\text{indirect}}$: Daily site overhead costs (supervision, crane lease, site office).
* $\Pi_{\text{violation}}$: Heavy penalty coefficient applied if hard precedence or unresolvable resource constraints are breached.

### 4. Genetic Operators
* **Crossover:** Order Crossover (OX) or Precedence-Preserving Crossover (PPX) to ensure offspring chromosomes do not violate DAG precedence.
* **Mutation:** Swap mutation conditioned on DAG reachability, or Gaussian duration jitter.
* **Selection:** Tournament selection ($k=3$) with elitism preserving top 5% chromosomes.

§
