---
description: Enforce Jira-first agile sprint alignment and git commit hygiene across all 4 team members
globs: ["**/*"]
always_on: true
---

# Jira-First Agile & Team Sync Rule

## 1. Role Identification
When beginning a user prompt, verify which team role is active:
- **Member 1 (Lead / Optimization):** `app/engine/cpm/`, `app/engine/ga/`
- **Member 2 (Benchmark & Math):** `app/engine/cpsat/`, `app/engine/penalty/`, `research/math-model/`
- **Member 3 (Full-Stack & UX):** `app/backend/`, `app/frontend/`, `jira-feedback/`
- **Member 4 (Data & Computer Vision):** `app/cv/`, `app/ingestion/`

If the user has not specified their role, inspect the files being edited or check `ACTIVE_SPRINT.md`.

## 2. Jira Ticket Association
Every engineering, bug-fix, or research task must be tied to a Jira issue in the `SCRUM` / `OPTI` project:
- Before making code modifications, check the active ticket in `ACTIVE_SPRINT.md` or query Jira using MCP tools.
- When generating commit messages or PR titles, **always prefix with the Jira ticket key**:
  ```
  [OPTI-XX] <type>(<scope>): <concise message>
  ```
  Examples:
  - `[OPTI-101] feat(cpm): add NetworkX forward and backward pass calculation`
  - `[OPTI-102] test(penalty): add unit tests for MahaRERA Section 18 MCLR formula`
  - `[OPTI-103] feat(backend): scaffold FastAPI routes and Pydantic schemas`
  - `[OPTI-104] feat(ingestion): parse MahaRERA completion date from registration PDF`

## 3. Cross-Teammate Awareness
- Always inspect `ACTIVE_SPRINT.md` to see what other teammates are currently building or changing.
- Never refactor or delete another member's module without confirming against `ACTIVE_SPRINT.md` and `app/schemas/`.
- After completing a feature or milestone, update `ACTIVE_SPRINT.md` so the rest of the team's Antigravity instances see the latest progress upon their next `git pull`.
