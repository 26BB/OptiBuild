---
description: Automatically trigger full onboarding bootstrap when a teammate introduces themselves by name
globs: ["**/*"]
always_on: true
---

# 🚀 Teammate Self-Introduction & Instant Bootstrap Protocol

## Trigger Condition
Whenever the user introduces themselves naturally by name or role, such as:
- *"Hi, I am Divyal"* / *"Divyal here"* / *"I'm Divyal"*
- *"Hi, I am Chaitanya"* / *"Chaitanya here"* / *"I'm Chaitanya"*
- *"Hi, I am Bhushan"* / *"Bhushan here"*
- *"Hi, I am Member 4"* / or any fourth teammate's name

The agent **MUST IMMEDIATELY** execute the following 4-step bootstrap protocol without requiring the teammate to copy-paste any scripts or prompt templates:

---

## 1. Recognize & Welcome by Role
Immediately identify their ownership and viva defense domain:
- **Divyal Padalkar (Member 1 - Lead / Optimization):**
  - **Owned Directories:** `app/engine/cpm/`, `app/engine/ga/`
  - **Current Sprint Ticket:** `[SCRUM-10]` (CPM DAG NetworkX & Resource-Constrained GA DEAP)
  - **Viva Defense:** Graph theory, topological sorts, GA chromosome encoding, fitness convergence.
- **Chaitanya (Member 2 - Benchmark & Math Lead):**
  - **Owned Directories:** `app/engine/cpsat/`, `app/engine/benchmark/`
  - **Current Sprint Ticket:** `[SCRUM-11]` (Google OR-Tools CP-SAT Solver Benchmarking)
  - **Viva Defense:** Exact combinatorial solvers, interval variables, makespan optimality gap calculation.
- **Bhushan Bhosale (Member 3 - Research & Financial Optimizer):**
  - **Owned Directories:** `app/engine/penalty/`, `research/math-model/`, `docs/`
  - **Current Sprint Ticket:** `[SCRUM-12]` (MahaRERA Section 18 Delay Penalty vs Crash Cost Engine)
  - **Viva Defense:** Statutory RERA penalty interest ($\text{SBI MCLR} + 2\%$), cost slope tradeoff advisory.
- **Member 4 (Teammate 4 - Full-Stack & Ingestion Lead):**
  - **Owned Directories:** `app/backend/`, `app/frontend/`, `app/ingestion/`, `app/cv/`
  - **Current Sprint Ticket:** `[SCRUM-13]` (FastAPI backend, Next.js dashboard, MobileNetV2 classifier)
  - **Viva Defense:** System architecture, REST APIs, reactive Gantt chart, binary progress classifier.

---

## 2. Automated Local Environment Verification (Hands-Free)
Proactively check their environment using shell commands:
1. **Python Virtual Environment & Dependencies:**
   - Check if a `venv` exists.
   - If missing, offer or run:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate   # (or source venv/bin/activate on Mac/Linux)
     pip install -r requirements.txt
     ```
2. **Git Branch & Push Protection:**
   - Run `git branch --show-current` or `git status`.
   - If they are on `main`, immediately offer to create and switch to their feature branch:
     - Divyal: `git checkout -b feat/scrum-10-cpm-ga`
     - Chaitanya: `git checkout -b feat/scrum-11-cpsat`
     - Bhushan: `git checkout -b feat/scrum-12-rera-penalty`
     - Member 4: `git checkout -b feat/scrum-13-fullstack-ui`
3. **GitHub Collaborator Check:**
   - Remind them: *"Make sure Bhushan (`26BB`) has added your GitHub username as a Collaborator at https://github.com/26BB/OptiBuild/settings/access so you can push code without permission errors."*

---

## 3. Sprint Sync & Immediate Next Step
- Read `ACTIVE_SPRINT.md` for their active Jira ticket.
- Show their module's input/output interface contract.
- Propose the exact file to scaffold or write first, and offer to start pair programming immediately!
