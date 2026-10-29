# OptiBuild Developer & Agent Guidelines (AGENTS.md)

## 1. Project Summary
OptiBuild is a penalty-aware construction planning, resource leveling, and statutory compliance workstation.
It links CPM scheduling and RCPSP genetic algorithms with statutory MahaRERA Section 18 financial delay interest.
Developers defaulting on possession dates face monthly interest at SBI MCLR + 200 bps (10.85% p.a.) on all buyer funds.
The optimizer evaluates whether it is cheaper to pay statutory penalties or crash critical activities using cost slopes.
The frontend is an industrial CAD blueprint workstation with 11 production routes and 7 RBAC roles.

## 2. Source-of-Truth Files (Priority Order)
1. `PRD.md`: Core product requirements, 5 locked invariants, 7 personas, user stories, and acceptance criteria.
2. `ARCHITECTURE.md`: High-level topology, end-to-end data flow, state management, and algorithmic formulations.
3. `API.md`: 33 REST endpoints, Pydantic schemas, RBAC rules, cold-start handling, and error codes.
4. `DATABASE.md`: PostgreSQL/SQLite dual-engine schema, 10 SQLAlchemy ORM models, relations, cascades, and snapshots.
5. `DESIGN.md`: Site-office design tokens, WCAG AA palette, local typography, 4px radius, and component patterns.
6. `PROJECT_AUDIT.md`: Baseline audit, tech debt registry, and phased improvement roadmap.

## 3. Existing Conventions
* **Naming:** PascalCase for React components (`RecoverySidePanel.tsx`), camelCase for helpers (`formatINR()`), snake_case for Python modules (`cpm.py`), files, and functions.
* **Folder Structure:** Feature-driven backend (`app/api/v1/`, `app/engine/`, `app/db/`, `app/schemas/`), Next.js App Router frontend (`src/app/`, `src/components/{ui,layout,project,schedule,optimizer,weather}`).
* **Component Patterns:** shadcn/ui base (`@base-ui/react`), React Bits for motion, Vengeance UI for loaders/avatars. Strict 4px border radius (`rounded-[4px]`), 1px hairline rules, zero pill buttons.
* **State Management:** React 19 `AuthContext` (JWT, active project, RBAC), React Hook Form + Zod, and URL search params.
* **Error Handling:** FastAPI `{"detail": "..."}` with standard HTTP codes; frontend Sonner toasts with cold-start 3x retry in `lib/api.ts`.

## 4. DO Rules
* **DO** reuse existing UI components (`Counter`, `StatusMark`, `PermissionDenied`, `EmptyState`, `GuidedStepper`).
* **DO** format all currency using `formatINR()` and tabular numbers with `font-mono`.
* **DO** adhere strictly to the 5 locked invariants (`INV-1` to `INV-5`) and 7 RBAC roles.
* **DO** keep changes minimal, targeted, and self-contained; test before committing.
* **DO** update relevant documentation (`API.md`, `DATABASE.md`, `DESIGN.md`, `PRD.md`) when making corresponding code changes.

## 5. DO NOT Rules
* **DO NOT** change the core tech stack (FastAPI, Next.js 16, PostgreSQL/SQLite, Tailwind v4).
* **DO NOT** add new dependencies without explicit approval.
* **DO NOT** alter the database schema without updating `DATABASE.md` and migration plans.
* **DO NOT** parse or OCR architectural drawings (**INV-2**) or bill photos (**INV-3**); store as unparsed evidence only.
* **DO NOT** auto-save MahaRERA data without the compulsory human verification gate (**INV-4**).
* **DO NOT** make scheduling or optimization dependent on the CV classifier (**INV-5**).
* **DO NOT** refactor unrelated files or expose secrets (`JWT_SECRET`, database passwords) in code or commits.

## 6. Workflow
1. **Plan First:** Identify affected layers (API, schema, component, docs) and verify against invariants before editing.
2. **Make Smallest Safe Change:** Write targeted, minimal code conforming to existing project patterns.
3. **Verify:** Run linter (`npm run lint`), build (`npm run build`), and backend tests (`pytest`).
4. **Summarize & Document:** Summarize exact changes, link touched files, and update corresponding documentation.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
