---
title: "Mathematical Model Reference"
type: "research"
tags: ["math", "formulation", "set-theory", "rcpsp"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🧮 Formal Mathematical Model Reference

> **Detailed Specification:** `research/math-model/mathematical_model.md`

§

## 📌 1. Sets and Indices
* $V = \{1, 2, \dots, N\}$: Set of project activities.
* $E \subset V \times V$: Set of finish-to-start precedence pairs $(u, v)$.
* $K = \{1, 2, \dots, M\}$: Set of renewable resource types (masons, carpenters, etc.).
* $T = \{1, 2, \dots, T_{\text{max}}\}$: Discrete scheduling time horizon.

§

## 📌 2. Parameters
* $d_i$: Duration of activity $i$.
* $r_{i, k}$: Daily demand of activity $i$ for resource $k$.
* $R_k$: Maximum daily available capacity of resource $k$.
* $C_{\text{indirect}}$: Daily indirect overhead cost of the site.
* $A_{\text{rera}}$: Total funds collected from homebuyers.
* $I_{\text{rera}}$: Prescribed annual interest rate ($\text{SBI MCLR} + 2\%$).
* $D_{\text{target}}$: Registered MahaRERA project completion date.

§

## 📌 3. Decision Variables
* $S_i \in \mathbb{Z}^+$: Start time of activity $i$.
* $C_i = S_i + d_i$: Completion time of activity $i$.
* $x_{i, t} \in \{0, 1\}$: Binary variable indicating if activity $i$ is actively executing at time $t$.

§

## 📌 4. Constraints
1. **Precedence Constraint:**
   $$S_v \ge S_u + d_u \quad \forall (u, v) \in E$$
2. **Resource Constraint:**
   $$\sum_{i=1}^N r_{i, k} \cdot x_{i, t} \le R_k \quad \forall k \in K, \; \forall t \in T$$
3. **Contiguity Constraint:**
   $$x_{i, t} = 1 \iff t \in [S_i, S_i + d_i)$$

§
