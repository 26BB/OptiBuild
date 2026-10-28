---
title: "Examiner Defense Master Script & Viva Prep"
type: "viva"
tags: ["viva", "sppu", "defense", "examiner", "q-and-a"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🎓 Examiner Defense Master Script & Viva Prep Guide

> **Mandatory Reading for All 4 Teammates:** Use this script to confidently defend OptiBuild in SPPU project reviews and final year viva examinations.

§

## ⚡ The 30-Second Elevator Pitch (Memorize Word-for-Word)

> *"Indian real estate builders face heavy statutory penalties under MahaRERA Section 18 (SBI MCLR + 2% interest to homebuyers) whenever projects suffer delays. Existing software like In4Suite or Procore only tracks paperwork and manual Gantt charts.*  
>  
> *OptiBuild is an intelligent scheduling platform with a CPM + Genetic Algorithm hero module. It generates resource-constrained schedules, detects site delays, and automatically calculates whether it is cheaper to **crash critical activities (hire extra crews/overtime)** or **accept the MahaRERA statutory penalty**."*

§

## 🎯 The Ultimate Viva Trap: "Is this CS or Civil Engineering?"

**Examiner Trap Question:**  
*"Why is this in Computer Engineering? Isn't construction scheduling and building design a Civil Engineering project?"*

**The Approved Defense Answer:**  
> *"OptiBuild is strictly an **Operations Research and Applied Computer Science** project solving the Resource-Constrained Project Scheduling Problem (RCPSP), which is mathematically NP-hard.*  
>  
> *Civil engineering merely provides domain inputs (task durations and dependencies). The computational core is pure Computer Engineering:*  
> *1. **Graph Theory:** DAG topological sorting, forward/backward traversals in NetworkX.*  
> *2. **Metaheuristics:** DEAP Genetic Algorithm with chromosome permutation encoding and resource constraint penalty functions.*  
> *3. **Combinatorial Optimization:** Exact solver benchmarking against Google OR-Tools CP-SAT.*  
> *4. **Applied AI:** MobileNetV2 transfer learning for binary progress verification.*  
>  
> *Our engineering distribution is **70% Algorithms & Optimization**, **20% Applied AI & Computer Vision**, and **10% Full-Stack System Architecture**."*

§

## ❓ Rapid-Fire Examiner Defense Q&A

### Q1: Why use a Genetic Algorithm instead of just CPM?
**Answer:** CPM calculates the theoretical critical path assuming unlimited resources. On real sites, resources (crews, equipment) are strictly capped. Resolving resource clashes while minimizing makespan is the NP-hard RCPSP, requiring heuristic methods like Genetic Algorithms.

### Q2: Why not just use Google OR-Tools CP-SAT for everything?
**Answer:** While CP-SAT finds exact provable optima for small projects ($N \le 30$), its execution time scales exponentially as activity count and resource types multiply. Our benchmarks prove that our GA achieves near-optimal schedules (within 2-3% optimality gap) in consistent sub-second runtimes.

### Q3: What is MahaRERA Section 18?
**Answer:** Under Section 18 of the Real Estate (Regulation and Development) Act 2016, if a builder delays possession beyond the registered deadline, they must pay interest to homebuyers at SBI MCLR + 2% on the total money collected. On a ₹50 crore project, this exceeds ₹45 lakh per month.

§
