---
title: "OptiBuild Master Map of Content (MOC)"
type: "moc"
tags: ["optibuild", "sppu", "be-project", "moc", "llm-wiki"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🏗️ OptiBuild — Master Knowledge Vault & Map of Content (MOC)

> **Antigravity & Teammate Router:** This Obsidian vault serves as the persistent, compounding LLM Wiki and knowledge base for **OptiBuild** (B.E. Computer Engineering Final Year Project, SPPU). It is structured for instant agent navigation, academic viva defense, and modular engineering.

§

## ⚡ Fast-Boot Navigation (Hot Context)

| Section | Node | Purpose |
|---|---|---|
| 🧭 **Overview & Specs** | `[[Codebase Map & Navigation]]` | Master directory breakdown & file routing index |
| 🧮 **The Hero Module** | `[[Hero Module Architecture]]` | CPM + GA + CP-SAT + MahaRERA optimization pipeline |
| 🛡️ **Examiner Defense** | `[[Examiner Defense Master Script]]` | 30-second elevator pitch & "CS vs Civil" viva defense |
| 🔒 **Scope Boundaries** | `[[Locked Scope Guardrails]]` | Non-negotiable technical limits locked at Review 1 |
| 👥 **Team Split** | `[[Team Viva Split & Roles]]` | 4-member modular viva ownership (Divyal, Chaitanya, Bhushan, Aniket) |
| 📚 **Academic Literature** | `[[Literature Survey Matrix]]` | 12 audited base papers & mathematical justifications |
| 🏃 **Active Sprint** | `[[Agile Workflow & Jira Sync]]` | Jira Cloud synchronization & sprint conventions |
| 📜 **Changelog & Audit** | `[[log]]` | Chronological log of decisions, ingestions, and milestones |

§

## 🏛️ The Three-Layer LLM Wiki Architecture

```mermaid
flowchart TD
    subgraph Layer 1: Raw Sources
        R1[Research Papers in research/literature-survey/papers/]
        R2[MahaRERA Gazettes & Section 18 Rulings]
        R3[Raw Guide & Supervisor Meeting Notes]
    end

    subgraph Layer 2: Persistent Compounding Wiki
        MOC[00 - INDEX MOC]
        A1[01 - Architecture]
        A2[02 - Viva & Defense]
        A3[03 - Research & Papers]
        A4[04 - Sprints & Jira]
        A5[05 - Operations]
        LOG[06 - Log]
    end

    subgraph Layer 3: Engineering & Codebase
        C1[app/engine/cpm/ - NetworkX DAG]
        C2[app/engine/ga/ - DEAP RCPSP GA]
        C3[app/engine/cpsat/ - OR-Tools Benchmark]
        C4[app/engine/penalty/ - MahaRERA Delay Optimizer]
        C5[app/backend/ & app/frontend/ - Full-Stack]
    end

    Layer 1 --> Layer 2
    Layer 2 <--> Layer 3
```

§

## 📂 Vault Modular Clusters

### 1. Architectural Blueprints (`01 - Architecture/`)
- `[[Hero Module Architecture]]` — The mathematical centerpiece unifying CPM, GA, CP-SAT, and Penalty engine.
- `[[CPM & Graph Traversal]]` — DAG construction, NetworkX forward/backward passes, early/late dates, and floats.
- `[[Genetic Algorithm & RCPSP]]` — Chromosome representation, crossover, mutation, and penalty fitness function.
- `[[CP-SAT Benchmarking]]` — Google OR-Tools exact solver model, interval variables, and optimality gap metrics.
- `[[MahaRERA Financial Engine]]` — Section 18 delay interest ($\text{SBI MCLR} + 2\%$) vs Activity Crash Slopes.
- `[[Computer Vision & Progress]]` — MobileNetV2 binary transfer learning (Structural vs Finishing phase) on site photos.
- `[[Full-Stack System Design]]` — FastAPI REST endpoints, PostgreSQL relational schemas, and Next.js UI.

### 2. Viva Preparation & Governance (`02 - Viva & Defense/`)
- `[[Examiner Defense Master Script]]` — High-impact answers to faculty traps, oral defense scripts, and 70/20/10 tech split.
- `[[Locked Scope Guardrails]]` — Strict exclusions: No CAD parsing, no flat designs, no blind AI commits, no YOLO.
- `[[Team Viva Split & Roles]]` — Balanced technical ownership across all 4 group members.

### 3. Academic Foundations (`03 - Research & Papers/`)
- `[[Literature Survey Matrix]]` — Analysis of 12 peer-reviewed papers on RCPSP, metaheuristics, and time-cost trade-offs.
- `[[Mathematical Model Reference]]` — Formal set theory, indices, parameters, decision variables, and objective functions.

### 4. Agile Management (`04 - Sprints & Jira/`)
- `[[Agile Workflow & Jira Sync]]` — Jira Cloud boards (`SCRUM` / `OPTI`), ticket commit formats, and sprint handoffs.

### 5. Repository Operational Map (`05 - Operations/`)
- `[[Codebase Map & Navigation]]` — Direct mapping from file paths in `d:\Opti Build\` to their system roles.

§
