# 🏗️ OptiBuild — SPPU B.E. Final Year Project

[![Team: 4 Engineers](https://img.shields.io/badge/Team-4%20Engineers-blue.svg)](#-team-division-of-work)
[![AI Platform: Antigravity 2.0](https://img.shields.io/badge/AI%20Platform-Antigravity%202.0-purple.svg)](#-multi-agent-antigravity-20--jira-sync)
[![Agile: Jira Cloud](https://img.shields.io/badge/Agile-Jira%20Cloud-0052CC.svg)](#-jira-agile-hub)
[![Curriculum: SPPU Pune](https://img.shields.io/badge/Curriculum-SPPU%20B.E.%20Comp-orange.svg)](#-project-milestones)

**OptiBuild** is a research-backed construction scheduling and cost-delay optimization engine built for the Savitribai Phule Pune University (SPPU) B.E. Computer Engineering final-year project.

It features a mathematically rigorous **Hero Module**: CPM Precedence DAG + Resource-Constrained Genetic Algorithm (DEAP) + MahaRERA Section 18 Delay Penalty vs. Crash Cost Optimizer, benchmarked against Google OR-Tools CP-SAT.

---

## 👥 Team Division of Work (4-Member Split)

To guarantee academic viva defense balance and modular software architecture:

| Member | Module Ownership | Core Tech & Directories | Viva Defense Topic |
|---|---|---|---|
| **Member 1 (Lead)** | **CPM + Genetic Algorithm** | `networkx`, `deap` (`app/engine/cpm/`, `app/engine/ga/`) | DAG topological traversal, forward/backward passes, GA chromosome encoding & fitness convergence. |
| **Member 2** | **CP-SAT Solver & Penalty Engine** | `ortools`, Set Theory (`app/engine/cpsat/`, `app/engine/penalty/`) | Google OR-Tools exact solver benchmark, optimality gap, MahaRERA Section 18 penalty formula ($\text{MCLR} + 2\%$). |
| **Member 3** | **Full-Stack & UX** | FastAPI, Next.js, Jira REST (`app/backend/`, `app/frontend/`, `jira-feedback/`) | REST API schemas, database migrations, interactive Gantt chart, in-app Jira user feedback webhook. |
| **Member 4** | **Data & Computer Vision** | `pdfplumber`, MobileNetV2 (`app/ingestion/`, `app/cv/`) | MahaRERA PDF extraction with review-and-confirm UX, binary stage classifier (Structural vs Finishing). |

---

## 🤖 Multi-Agent Antigravity 2.0 + Jira Sync

When team members clone this repository and open it in **Antigravity 2.0**, all agents automatically share the exact same context, guardrails, and sprint progress:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Atlassian Jira Cloud                            │
│                 (Sprint backlog, epics, viva burndown)                 │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
          Atlassian MCP Tool               Atlassian MCP Tool
                    │                                │
         ┌──────────┴──────────┐          ┌──────────┴──────────┐
         │ Antigravity 2.0 (M1)│          │ Antigravity 2.0 (M2)│
         └──────────┬──────────┘          └──────────┬──────────┘
                    │                                │
                    └───────►  GitHub Repository ◄───┘
                               ├── AGENTS.md (Auto-loaded rules)
                               ├── ACTIVE_SPRINT.md (Live sync board)
                               └── .agents/ (Rules, skills, MCP configs)
```

1. **Auto-Loaded Master Context (`AGENTS.md`):** Loaded into every teammate's Antigravity context. Enforces role boundaries, viva scope guardrails, and commit conventions.
2. **Live Team Status Board (`ACTIVE_SPRINT.md`):** Synchronizes what each teammate's agent is working on across Git pushes/pulls.
3. **Agile Jira Hub (`SCRUM` / `OPTI`):** Industry-standard Agile workflow that generates real Sprint Burndown and Velocity charts for Chapter 3/4 of the SPPU project report.
4. **Custom Team Skills (`.agents/skills/`):**
   - `/jira-sync`: Pull tickets, transition status, log work.
   - `/team-sync`: Sync local branch with `ACTIVE_SPRINT.md` and teammate states.

---

## 🚀 Quick Setup for Teammates (Day 1 Onboarding)

### Step 1: Pre-requisites & GitHub Access
1. **GitHub Collaborator Invite (Mandatory):**
   - Even if the repo is public or cloned, **push access requires collaborator permissions**.
   - Ensure the repository owner (`26BB`) has added your GitHub username under **Repository Settings → Collaborators**.
   - Accept the invitation email or notification from GitHub before pushing any code.

### Step 2: Clone & Python Virtual Environment
```bash
# 1. Clone the repository
git clone https://github.com/26BB/OptiBuild.git
cd OptiBuild

# 2. Create and activate a Python 3.10+ virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# 3. Install all module dependencies
pip install -r requirements.txt
```

### Step 3: Open in Antigravity 2.0 & Activate Your Agent
1. Open the cloned `OptiBuild` folder in **Antigravity 2.0**.
2. Antigravity automatically detects `AGENTS.md`, `ACTIVE_SPRINT.md`, and `.agents/`.
3. In the chat, send your role-activation prompt:
   - **Member 1 (Divyal):** `"I am Divyal Padalkar (Optimization Lead). Read ACTIVE_SPRINT.md and AGENTS.md, set up my branch for [SCRUM-10], and let's start."`
   - **Member 2 (Chaitanya):** `"I am Chaitanya (Benchmark Lead). Read ACTIVE_SPRINT.md and AGENTS.md, set up my branch for [SCRUM-11], and let's start."`
   - **Member 3 (Bhushan):** `"I am Bhushan Bhosale (Penalty Optimizer & Architecture). Read ACTIVE_SPRINT.md and AGENTS.md, set up my branch for [SCRUM-12], and let's start."`
   - **Member 4:** `"I am Member 4 (Full-Stack & Ingestion Lead). Read ACTIVE_SPRINT.md and AGENTS.md, set up my branch for [SCRUM-13], and let's start."`

Your Antigravity agent will verify your environment, checkout your feature branch, and guide you straight into your assigned code module.

---

## 📁 Repository Structure

```text
OptiBuild/
├── AGENTS.md                   # Auto-loaded AI context & multi-agent rules
├── ACTIVE_SPRINT.md            # Live git-synced team sprint & status board
├── PROJECT_MEMORY.md           # Master technical memory & academic roadmap
├── TEAM_ONBOARDING.md          # 5-min viva defense & teammate quick-start
├── .agents/
│   ├── rules/                  # Antigravity rules (jira-agile-sync, module-contracts)
│   ├── skills/                 # Team skills (jira-sync, team-sync)
│   ├── skills.json             # Antigravity skill manifest
│   └── mcp_config.json         # Atlassian MCP configuration
├── app/                        # Source Code
│   ├── engine/                 # M1 & M2: CPM, GA, CP-SAT, Penalty
│   ├── backend/                # M3: FastAPI REST APIs
│   ├── frontend/               # M3: Next.js UI Dashboard
│   ├── ingestion/              # M4: MahaRERA PDF Extraction
│   └── cv/                     # M4: MobileNetV2 Binary Classifier
├── jira-feedback/              # Live MVP in-app feedback bridge into Jira
├── research/
│   ├── literature-survey/      # 12+ Audited research papers & comparative matrix
│   └── math-model/             # SPPU Set Theory formal specification
└── docs/                       # SPPU Synopsis, SRS, Viva Guides
```
