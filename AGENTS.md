# 🤖 Antigravity 2.0 — Team Context & Master Agent Guidelines
# Project: OptiBuild (SPPU B.E. Final Year Project)

> **Auto-Loaded by Antigravity 2.0:** This file is automatically loaded into the context window of Antigravity 2.0 for all 4 team members on every interaction in this workspace.

---

## 🏗️ 1. Project Identity & Domain
- **Project Name:** OptiBuild
- **Degree / University:** B.E. Computer Engineering, Savitribai Phule Pune University (SPPU)
- **Domain:** Construction-Tech, Operations Research, Resource-Constrained Project Scheduling (RCPSP), Metaheuristic Optimization.
- **Hero Module:** CPM Precedence DAG (NetworkX) + Resource-Constrained Genetic Algorithm (DEAP) + MahaRERA Delay Penalty vs. Crash Cost Optimizer + Google OR-Tools CP-SAT Benchmarking.

---

## 👥 2. Team Member Registry & Modular Roles (Flexible Viva Split)

To keep code modular and ensure full academic viva defense balance, OptiBuild is split into 4 distinct roles for the 4 team members (Divyal, Chaitanya, Bhushan, and Aniket). The team can flexibly decide who leads which module:

| Module Role | Focus Area | Owned Directory | Primary Responsibilities & Viva Defense | Suggested Assignment |
|---|---|---|---|:---:|
| **Role 1: Optimization Lead** | **CPM + Genetic Algorithm** | `app/engine/cpm/`, `app/engine/ga/` | CPM DAG scheduling, NetworkX forward/backward passes, DEAP Genetic Algorithm chromosome encoding, fitness functions, resource constraint handling. | *Divyal / Open* |
| **Role 2: Benchmark Lead** | **OR-Tools CP-SAT & Solvers** | `app/engine/cpsat/`, `app/engine/benchmark/` | Google OR-Tools CP-SAT exact solver benchmarking, optimality gap calculations, combinatorial interval constraints. | *Chaitanya / Open* |
| **Role 3: Financial Optimizer** | **MahaRERA & Architecture** | `app/engine/penalty/`, `research/math-model/`, `docs/` | MahaRERA Section 18 penalty engine (SBI MCLR + 2%), activity crash slope tradeoff advisory, architecture & papers. | *Bhushan Bhosale* |
| **Role 4: Full-Stack & CV Lead** | **FastAPI, Next.js & MobileNetV2** | `app/backend/`, `app/frontend/`, `app/cv/`, `app/ingestion/` | FastAPI REST APIs, Next.js dashboard & Gantt chart, `pdfplumber` form pre-filling, MobileNetV2 binary classifier. | *Aniket / Open* |

---

## 🎯 3. Jira-First Agile Collaboration Protocol

**Jira is the single source of truth for all sprints, tasks, and viva proof.**

1. **Jira Workspace:**
   - **Base URL:** `https://bhosalebhushanvijay.atlassian.net`
   - **Project Key:** `SCRUM` (or `OPTI`)
2. **Before Starting Any Task:**
   - Identify the user's role (Member 1, 2, 3, or 4).
   - Check `ACTIVE_SPRINT.md` and/or query Jira via MCP (`getJiraIssue` or `searchJiraIssuesUsingJql`) to confirm the active ticket (e.g., `OPTI-101`).
   - If starting a ticket, transition it to **In Progress**.
3. **Commit Message Format:**
   - Every commit must follow:
     ```
     [<TICKET-KEY>] <type>(<scope>): <concise description>
     ```
     *Example:* `[OPTI-12] feat(ga): implement multi-resource constraint penalty in DEAP fitness function`
4. **When Work is Complete:**
   - Add a worklog comment to the Jira ticket.
   - Update `ACTIVE_SPRINT.md` under the member's section.
   - Push code to Git branch `feat/<ticket-key>-<short-name>`.

---

## 🔄 4. How Antigravity 2.0 Synchronizes Across the 4 Teammates

Because each team member runs Antigravity 2.0 locally, context is synchronized across machines through a dual-channel bridge:

```mermaid
flowchart TD
    subgraph Divyal (Optimization)
        AG1[Antigravity 2.0 (Divyal)]
    end
    subgraph Chaitanya (Benchmark & Math)
        AG2[Antigravity 2.0 (Chaitanya)]
    end
    subgraph Bhushan (Research & Full-Stack)
        AG3[Antigravity 2.0 (Bhushan)]
    end
    subgraph Aniket (Data & CV)
        AG4[Antigravity 2.0 (Aniket)]
    end

    JIRA[(Atlassian Jira Cloud<br/>Sprints, Epics, Tasks)]
    GIT[(GitHub Repository<br/>Code + ACTIVE_SPRINT.md + AGENTS.md)]

    AG1 <-->|Atlassian MCP| JIRA
    AG2 <-->|Atlassian MCP| JIRA
    AG3 <-->|Atlassian MCP| JIRA
    AG4 <-->|Atlassian MCP| JIRA

    AG1 <-->|git pull / push| GIT
    AG2 <-->|git pull / push| GIT
    AG3 <-->|git pull / push| GIT
    AG4 <-->|git pull / push| GIT
```

1. **The Fast Channel (`ACTIVE_SPRINT.md` via Git):**
   - Whenever any teammate finishes or updates a task, their agent updates `ACTIVE_SPRINT.md`.
   - When any other teammate pulls `main` or checks the repo, their Antigravity 2.0 reads `ACTIVE_SPRINT.md` and immediately knows:
     - What tickets everyone is currently tackling.
     - Which files/APIs are being modified.
     - Any blockers or shared interface changes.
2. **The Agile Source of Truth (Jira Cloud):**
   - All 4 agents use Jira to query current sprint tickets, log work hours, and generate burndown proof for Chapter 3/4 of the SPPU project report.

---

## 🛑 5. Locked Scope Guardrails (Strict Viva Boundaries)

All 4 agents **MUST NEVER** violate these boundaries:
1. ❌ **NO Architectural Flat / CAD Design:** OptiBuild does not generate or parse floor plans.
2. ❌ **No Heavy Object Detection:** No YOLO. Strictly MobileNetV2 binary classification (Structural vs. Finishing).
3. ❌ **No Blind AI PDF Commits:** MahaRERA PDF extraction pre-fills a form; human confirmation is mandatory before running optimization.
4. ❌ **Contract Stability:** No agent may modify schemas in `app/schemas/` without cross-member alignment in `ACTIVE_SPRINT.md`.

---

## 🚀 6. Zero-Friction Teammate Introduction & Interactive Role Selection
When any teammate introduces themselves naturally (e.g., *"Hi, I am Divyal"*, *"Chaitanya here"*, *"Hey, I'm Aniket"*):
1. **Interactive Role Selection:** If they haven't picked a role yet, present the 4 modules with their viva defense value and let them choose which one they want to lead.
2. **Automated Environment Verification:** Check if a Python virtual environment is set up. If not, offer or run `python -m venv venv` and `pip install -r requirements.txt`.
3. **Branch Protection:** Check current git branch (`git branch --show-current`). If on `main`, offer to switch to their dedicated feature branch (e.g., `feat/<module-name>`).
4. **Collaborator Verification:** Remind them to ensure Bhushan added their GitHub username as a Collaborator to prevent push permission errors.
5. **Start Pair-Programming:** Immediately present the first task or file they should start building for their chosen role, so they write code on minute one without reading lengthy manuals.

---

## 📂 7. Essential Documentation & Memory Hubs

- **Project Master Memory:** [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md)
- **Active Sprint & Team Board:** [`ACTIVE_SPRINT.md`](./ACTIVE_SPRINT.md)
- **Team Viva Quickstart:** [`TEAM_ONBOARDING.md`](./TEAM_ONBOARDING.md)
- **Jira Workflow Guide:** [`docs/jira-workflow-guide.md`](./docs/jira-workflow-guide.md)
- **Mathematical Specification:** [`research/math-model/mathematical_model.md`](./research/math-model/mathematical_model.md)

