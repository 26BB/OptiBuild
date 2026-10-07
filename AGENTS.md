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

## 👥 2. Team Member Registry & Module Ownership (4-Person Split)

To keep code modular and ensure full academic viva defense balance, each team member and their Antigravity agent owns a dedicated module:

| Member | Role | Owned Directory | Primary Responsibilities |
|---|---|---|---|
| **Member 1** | **Lead / Optimization** | `app/engine/cpm/`, `app/engine/ga/` | CPM DAG scheduling, NetworkX forward/backward passes, DEAP Genetic Algorithm chromosome encoding, fitness functions, resource constraint handling. |
| **Member 2** | **Benchmark & Math** | `app/engine/cpsat/`, `app/engine/penalty/`, `research/math-model/` | Google OR-Tools CP-SAT exact solver benchmarking, optimality gap calculations, MahaRERA Section 18 penalty engine (SBI MCLR + 2%). |
| **Member 3** | **Full-Stack & UX** | `app/backend/`, `app/frontend/`, `jira-feedback/` | FastAPI REST APIs, PostgreSQL/SQLAlchemy schemas, Next.js UI, Gantt chart visualization, in-app user feedback Jira webhook. |
| **Member 4** | **Data & Computer Vision** | `app/cv/`, `app/ingestion/` | `pdfplumber` MahaRERA form pre-filling (review-and-confirm), MobileNetV2 binary site progress classifier (Structural vs. Finishing), material/expense logger. |

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
    subgraph Teammate 1 (Optimization)
        AG1[Antigravity 2.0 (Member 1)]
    end
    subgraph Teammate 2 (Benchmark & Math)
        AG2[Antigravity 2.0 (Member 2)]
    end
    subgraph Teammate 3 (Full-Stack & UX)
        AG3[Antigravity 2.0 (Member 3)]
    end
    subgraph Teammate 4 (Data & CV)
        AG4[Antigravity 2.0 (Member 4)]
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

## 🚀 6. First-Time Agent Bootstrapping & Local Environment Verification

When any teammate introduces themselves to Antigravity 2.0 (e.g., *"I am Divyal"*, *"I am Chaitanya"*, etc.):
1. **Identify Role & Boundaries:** Match their identity to the registry in Section 2 and enforce strict directory ownership. Never edit another teammate's owned directory without explicit cross-member coordination.
2. **Environment Verification:** Verify that the Python virtual environment is activated and dependencies from `requirements.txt` are installed (`networkx`, `deap`, `ortools`, `fastapi`, etc.). If missing, offer to run `pip install -r requirements.txt`.
3. **Branch Enforcement:** Check `git status`. Ensure the teammate is working on their dedicated feature branch (`feat/<ticket-key>-<short-description>`), never directly committing to `main`.
4. **Sprint & Ticket Ingestion:** Read `ACTIVE_SPRINT.md` to retrieve their active ticket (e.g., `SCRUM-10`), dependencies, and expected interfaces, and immediately begin pairing on that specific task.

---

## 📂 7. Essential Documentation & Memory Hubs

- **Project Master Memory:** [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md)
- **Active Sprint & Team Board:** [`ACTIVE_SPRINT.md`](./ACTIVE_SPRINT.md)
- **Team Viva Quickstart:** [`TEAM_ONBOARDING.md`](./TEAM_ONBOARDING.md)
- **Jira Workflow Guide:** [`docs/jira-workflow-guide.md`](./docs/jira-workflow-guide.md)
- **Mathematical Specification:** [`research/math-model/mathematical_model.md`](./research/math-model/mathematical_model.md)

