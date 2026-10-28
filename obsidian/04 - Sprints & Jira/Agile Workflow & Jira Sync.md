---
title: "Agile Workflow & Jira Cloud Sync"
type: "agile"
tags: ["jira", "agile", "scrum", "workflow", "commits"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🏃 Agile Workflow & Jira Cloud Sync Protocol

> **Single Source of Truth:** Jira Cloud is used for all sprint tracking, burndown generation, and viva proof.

§

## 🎯 Jira Instance Details
* **Base URL:** `https://bhosalebhushanvijay.atlassian.net`
* **Project Key:** `SCRUM` (or `OPTI`)

§

## 👥 Ticket Allocation Matrix

| Ticket Key | Summary | Assignee | Status |
|---|---|---|:---:|
| `[SCRUM-10]` | Implement CPM DAG (NetworkX) & Resource-Constrained GA (DEAP) | Divyal | In Progress |
| `[SCRUM-11]` | Implement Google OR-Tools CP-SAT Solver Benchmarking | Chaitanya | In Progress |
| `[SCRUM-12]` | Implement MahaRERA Section 18 Delay-Penalty vs Crash Cost Engine | Bhushan | Ready / In Progress |
| `[SCRUM-13]` | Build FastAPI Backend & Next.js Parameter Ingestion Dashboard | Aniket | Ready |
| `[SCRUM-14]` | Develop & Update Core Scheduling & Benchmark Codebase | Divyal & Chaitanya | In Progress |
| `[SCRUM-15]` | Design & Prepare OptiBuild Project Seminar & Viva PPT Deck | Aniket | In Progress |
| `[SCRUM-16]` | Draft & Finalize Literature Survey Paper on RCPSP & Metaheuristics | Bhushan | In Progress |

§

## 🌿 Git Commit Message Convention

Every commit must follow this format to link automatically with Jira and Antigravity:
```
[<TICKET-KEY>] <type>(<scope>): <concise description>
```
*Examples:*
* `[SCRUM-10] feat(cpm): implement forward pass and total float calculation in NetworkX`
* `[SCRUM-12] feat(penalty): implement SBI MCLR + 2% delay cost engine`
* `[SCRUM-11] test(benchmark): add makespan optimality gap comparison against CP-SAT`

§
