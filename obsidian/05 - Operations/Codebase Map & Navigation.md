---
title: "Codebase Map & Navigation"
type: "operations"
tags: ["codebase", "map", "navigation", "directory"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 🗺️ Codebase Map & Directory Navigation

> **Fast Routing for Humans and AI Agents:** Use this guide to immediately identify which folder and file owns any given functionality.

§

## 📁 Repository Directory Structure

```
d:\Opti Build\
├── .agents/                      <- Antigravity multi-agent configuration & skills
├── .obsidian/                    <- Local Obsidian vault configuration
├── obsidian/                     <- 💎 Structured Obsidian Knowledge Base & LLM Wiki
│   ├── .obsidian/                <- Embedded vault settings
│   ├── 00 - INDEX (MOC).md       <- Master Map of Content
│   ├── 01 - Architecture/        <- Deep architectural specifications
│   ├── 02 - Viva & Defense/      <- Presentation scripts, scope rules, viva split
│   ├── 03 - Research & Papers/   <- Literature survey, 12 papers, math model
│   ├── 04 - Sprints & Jira/      <- Jira synchronization & sprint boards
│   ├── 05 - Operations/          <- Codebase map & navigation
│   └── 06 - Log/                 <- Chronological timeline & changelog
├── app/
│   ├── engine/
│   │   ├── cpm/                  <- CPM DAG traversal (NetworkX) [Role 1: Divyal]
│   │   ├── ga/                   <- Resource-Constrained GA (DEAP) [Role 1: Divyal]
│   │   ├── cpsat/                <- Google OR-Tools CP-SAT exact model [Role 2: Chaitanya]
│   │   ├── benchmark/            <- Optimality gap comparison script [Role 2: Chaitanya]
│   │   ├── penalty/              <- MahaRERA Section 18 vs crash slope [Role 3: Bhushan]
│   │   └── data/                 <- Sample 15-20 RCC task datasets
│   ├── backend/                  <- FastAPI REST APIs & SQLAlchemy [Role 4: Aniket]
│   ├── frontend/                 <- Next.js UI & Gantt visualizer [Role 4: Aniket]
│   ├── cv/                       <- MobileNetV2 stage classifier [Role 4: Aniket]
│   └── ingestion/                <- PDF parser with confirm flow [Role 4: Aniket]
├── docs/                         <- SPPU Synopsis, Jira guides, Presentation assets
├── research/
│   ├── literature-survey/        <- LaTeX drafts, audited papers, BibTeX
│   └── math-model/               <- Formal mathematical model specifications
├── ACTIVE_SPRINT.md              <- Live team sync file
├── AGENTS.md                     <- Master team context & Antigravity 2.0 instructions
├── PROJECT_MEMORY.md             <- Persistent project specification & roadmap
├── TEAM_ONBOARDING.md            <- Teammate Day-1 onboarding & viva quick-start
└── requirements.txt              <- Python multi-module dependencies
```

§
