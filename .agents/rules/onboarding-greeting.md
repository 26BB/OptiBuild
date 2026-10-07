---
description: Trigger conversational teammate introduction, interactive role selection, and automated environment bootstrap
globs: ["**/*"]
always_on: true
---

# 🚀 Teammate Introduction & Interactive Role Selection Protocol

## Trigger Condition
Whenever the user introduces themselves naturally by name, such as:
- *"Hi, I am Divyal"* / *"Divyal here"*
- *"Hi, I am Chaitanya"* / *"Chaitanya here"*
- *"Hi, I am Aniket"* / *"Aniket here"*
- *"Hi, I am Bhushan"* / *"Bhushan here"*
- Or any teammate introducing themselves to the agent.

The agent **MUST IMMEDIATELY** execute the following protocol:

---

## 1. Warm Greeting & Role Selection Menu
If the teammate does not explicitly declare a role in their message, greet them warmly by name and present the **4 OptiBuild Core Modules** so the team can decide who takes what:

> *"Welcome [Name] to OptiBuild! 👋*  
> *We have 4 balanced engineering modules designed to give each team member a dedicated viva defense topic for SPPU:*
>
> 1. 🧬 **Lead / Optimization:** CPM DAG Precedence Network + Resource-Constrained Genetic Algorithm (DEAP)  
>    - **Directories:** `app/engine/cpm/`, `app/engine/ga/`  
>    - **Viva Defense:** Graph theory, NetworkX forward/backward passes, GA chromosome encoding, fitness convergence.  
>    - **Jira Ticket:** `[SCRUM-10]`  
>
> 2. ⚙️ **Benchmark & Operations Research:** Exact Solvers & Google OR-Tools CP-SAT Benchmark  
>    - **Directories:** `app/engine/cpsat/`, `app/engine/benchmark/`  
>    - **Viva Defense:** Combinatorial optimization, CP-SAT `IntervalVar` & `AddCumulative`, makespan optimality gap.  
>    - **Jira Ticket:** `[SCRUM-11]`  
>
> 3. ⚖️ **Financial Optimizer & Research:** MahaRERA Section 18 Penalty vs. Crash Cost Engine  
>    - **Directories:** `app/engine/penalty/`, `research/math-model/`, `docs/`  
>    - **Viva Defense:** Statutory RERA penalty interest ($\text{SBI MCLR} + 2\%$), critical activity crash cost slopes.  
>    - **Jira Ticket:** `[SCRUM-12]` *(Primary: Bhushan Bhosale)*  
>
> 4. 🌐 **Full-Stack & Computer Vision:** FastAPI Backend, Next.js UI & MobileNetV2 Site Classifier  
>    - **Directories:** `app/backend/`, `app/frontend/`, `app/cv/`, `app/ingestion/`  
>    - **Viva Defense:** System architecture, REST APIs, reactive Gantt chart, MobileNetV2 transfer learning.  
>    - **Jira Ticket:** `[SCRUM-13]`  
>
> *Which module would you like to take ownership of for your viva and implementation?"*

*(If the teammate already specifies their preference, e.g., "I want to do CPM and GA", confirm that selection immediately without re-asking).*

---

## 2. Automated Local Environment Setup (Hands-Free)
Once their module is chosen or confirmed, proactively run or offer:
1. **Python Virtual Environment & Dependencies:**
   - Check if a `venv` exists.
   - If missing, offer or run:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate   # (or source venv/bin/activate on Mac/Linux)
     pip install -r requirements.txt
     ```
2. **Git Branch & Push Protection:**
   - Check `git branch --show-current`. If on `main`, immediately offer to create their feature branch:
     - Optimization: `git checkout -b feat/scrum-10-cpm-ga`
     - Benchmark: `git checkout -b feat/scrum-11-cpsat`
     - Financial Penalty: `git checkout -b feat/scrum-12-rera-penalty`
     - Full-Stack & CV: `git checkout -b feat/scrum-13-fullstack-ui`
3. **GitHub Collaborator Check:**
   - Remind them: *"Make sure Bhushan (`26BB`) has added your GitHub username as a Collaborator at https://github.com/26BB/OptiBuild/settings/access so you can push your branch without permission issues."*

---

## 3. Immediate Pair-Programming
- Read `ACTIVE_SPRINT.md` for their active ticket.
- Show them the starter file in their chosen directory.
- Start writing the code together right away!
