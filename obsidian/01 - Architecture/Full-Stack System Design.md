---
title: "Full-Stack System Design & Database Schema"
type: "architecture"
tags: ["fastapi", "nextjs", "postgresql", "docker", "fullstack"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 💻 Full-Stack System Design & Data Architecture

> **Lead Modules:** `app/backend/`, `app/frontend/`  
> **Stack:** FastAPI (Python 3.10+), Next.js (React/Tailwind), PostgreSQL, SQLAlchemy.

§

## 🏛️ System Component Breakdown

```
[ Next.js Client Dashboard ]
          │ (REST / JSON)
          ▼
[ FastAPI Backend Application ]
   ├── /api/v1/projects      (Setup, RERA parameters)
   ├── /api/v1/schedule      (CPM calculation & GA optimizer)
   ├── /api/v1/benchmark     (OR-Tools CP-SAT comparison)
   ├── /api/v1/penalty       (MahaRERA delay tradeoff)
   └── /api/v1/progress      (Photo upload & MobileNetV2)
          │
          ▼
[ PostgreSQL Relational Database ]
```

§

## 🗄️ Core Relational Entities

1. **`projects`:** ID, name, built-up area (sq.ft), floors, total flats, target RERA deadline, total funds collected, SBI MCLR rate.
2. **`tasks`:** ID, project_id, name, normal_duration, crash_duration, normal_cost, crash_cost, early_start, early_finish, late_start, late_finish, total_float, is_critical.
3. **`task_dependencies`:** predecessor_id, successor_id (DAG edges).
4. **`task_resources`:** task_id, resource_type (masons, carpenters, equipment), daily_demand.
5. **`site_logs`:** ID, project_id, timestamp, reported_stage, photo_url, cv_prediction, confidence, verified_by.

§
