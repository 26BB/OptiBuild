---
title: "Critical Path Method (CPM) & Graph Traversal"
type: "architecture"
tags: ["cpm", "networkx", "graph-theory", "algorithms"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 📊 Critical Path Method (CPM) & DAG Algorithms

> **Lead Module:** `app/engine/cpm/`  
> **Viva Defense Focus:** Graph Theory, DAG traversals, topological sorting, forward/backward passes.

§

## 🕸️ Network Graph Representation

The project activity network is modeled as a Directed Acyclic Graph (DAG) $G = (V, E)$:
* **Vertices ($V$):** Construction tasks $\{1, 2, \dots, N\}$ (e.g., Excavation, Footings, Columns, Slab, Brickwork, Plastering).
* **Directed Edges ($E$):** Finish-to-Start (FS) precedence constraints $(u, v) \in E \implies \text{Task } u \text{ must finish before Task } v \text{ can start}$.
* **Activity Duration:** Each node $i$ has an estimated duration $d_i \in \mathbb{Z}^+$.

§

## 🧮 Classical CPM Formulations

### 1. Forward Pass (Earliest Times)
For every activity $i$ topologically ordered:
$$ES_i = \begin{cases} 0 & \text{if } \text{Pred}(i) = \emptyset \\ \max_{p \in \text{Pred}(i)} (EF_p) & \text{otherwise} \end{cases}$$
$$EF_i = ES_i + d_i$$
Project Makespan: $T_{\text{CPM}} = \max_{i \in V} (EF_i)$.

### 2. Backward Pass (Latest Times)
For every activity $i$ in reverse topological order:
$$LF_i = \begin{cases} T_{\text{CPM}} & \text{if } \text{Succ}(i) = \emptyset \\ \min_{s \in \text{Succ}(i)} (LS_s) & \text{otherwise} \end{cases}$$
$$LS_i = LF_i - d_i$$

### 3. Float & Critical Path Identification
* **Total Float ($TF_i$):**
  $$TF_i = LS_i - ES_i = LF_i - EF_i$$
* **Free Float ($FF_i$):**
  $$FF_i = \min_{s \in \text{Succ}(i)} (ES_s) - EF_i$$
* **Critical Activities:** Any activity where $TF_i = 0$.
* **Critical Path ($\mathcal{CP}$):** The longest path through the network DAG. A delay in any critical activity extends the total project makespan by an identical duration.

§

## 💻 Implementation Highlights (`app/engine/cpm/`)

* Uses `networkx.DiGraph`.
* Checks for cycles via `nx.is_directed_acyclic_graph(G)` — prevents infinite loops if user accidentally enters circular dependencies.
* Emits topological sorts via `nx.topological_sort(G)`.
* Returns structured dictionary consumed by GA chromosome generators and crash optimizers.

§
