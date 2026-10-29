# OptiBuild UI Rebuild Implementation Plan (PLAN.md)

> **Branch:** `ui-rebuild`  
> **Aesthetic Target:** Modern, premium construction-tech SaaS with smooth, purposeful motion (`DESIGN.md`).  
> **Execution Rule:** One task at a time. Run `npm run build` & `lint` after each, commit (`ui: <page> - <what>`), and push to `ui-rebuild`.  
> **Bounded Fix Loop:** Maximum 3 attempts per task using `debugging-master`. Revert task if failing and mark Skipped in `UI_AUDIT.md`.  
> **Checkpoint:** Complete Tasks 1 & 2 (Login + App Shell), then **STOP** and wait for user approval before proceeding to Task 3+.

---

## Task 0: Foundations & Component Registry Setup
* **Goal**:
  * Save "before" screenshots of all routes to `docs/ui-before/` (if headless browser is available).
  * Record baseline page sizes and build times in `DEPENDENCIES.md`.
  * Ensure `DESIGN.md`, `UI_AUDIT.md`, and `DEPENDENCIES.md` are aligned with the blueprint specification.
  * Verify/install required shadcn component primitives (`sidebar`, `breadcrumb`, `command`, `sheet`, `alert-dialog`, `progress`, `avatar`, `skeleton`, `sonner`, `scroll-area`, `separator`).
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: foundations - install core shadcn primitives and record baseline metrics`.

---

## Task 1: Rebuild Page 1 — Login (`/login`)
* **Goal**:
  * Build a split layout:
    * **Left Brand Panel**: Dark technical blueprint aesthetic with CSS/SVG or lazy-loaded (`dynamic(..., { ssr: false })`) CAD blueprint background (`Grid Scan` / `Dot Grid`) disabled on small screens (`< 768px`) and with `prefers-reduced-motion`. Technical headline (`Shiny Text`).
    * **Right Form Panel**: shadcn `Card` + `Field` form controls for email and password.
    * **Demo Role Chips**: Interactive role selector chips (Admin, PM, Site Engineer, Store Keeper, Architect, Accountant, Owner) that autofill credentials with 1 click.
    * **Primary Button**: Animated button (`my-animated-button` with `Magnet`) that preserves loading and disabled states (prevents double submit) and remains fully keyboard-accessible.
    * **States**: Inline loading states and clear, accessible error notifications.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: login - blueprint split layout, demo role chips, and animated submit`.

---

## Task 2: Rebuild Page 2 — Application Shell (`Sidebar`, `TopBar`, `Breadcrumb`, `Command`)
* **Goal**:
  * Rebuild `Sidebar.tsx`: Collapsible shadcn `Sidebar` with role-filtered navigation items and clean active states.
  * Sidebar Header: Searchable project switcher (`Combobox`).
  * Rebuild `TopBar.tsx`:
    * Dynamic `Breadcrumb` tracking the active module.
    * Global `Command` palette shortcut (`Ctrl+K`).
    * User menu displaying current name, role badge, and 1-click logout.
    * Dark-mode toggle (Parchment Blueprint ↔ Carbon Terminal).
  * Rebuild `WakeupBanner.tsx`: Replace static text banner with Vengeance UI `kinetic-text-loader`.
  * Mobile Drawer: Fully responsive drawer on viewports `< 768px` (375px usable).
  * Sonner toast notifications wired into layout.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: layout - collapsible role-filtered sidebar, command palette, and kinetic loader`.

---

## 🛑 CHECKPOINT (STOP & WAIT FOR APPROVAL)
* Verify Tasks 1 & 2 in the browser as different roles.
* Produce build metrics, summary of changes, and screenshots for Login and App Shell.
* **Wait for user explicit approval before proceeding to Task 3.**

---

## Task 3: Rebuild Page 4 — Projects Overview (`/`)
* **Goal**:
  * Implement `staggered-grid` layout for project cards.
  * Project cards displaying name, RERA registration, proposed completion date, delay days, and status badges (WBS, Schedule, Optimizer).
  * `shared-tooltip-avatars` for team members with role badges.
  * Animated `Counter` for top-level KPI metrics (Total Projects, Delayed Projects, Active Capital).
  * Polished `Empty` state with quick action to upload a MahaRERA PDF.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: home - staggered-grid project cards, avatar tooltips, and counter KPIs`.

---

## Task 4: Rebuild Page 5 — MahaRERA Upload & 4-Step Stepper (`/rera-review`)
* **Goal**:
  * Styled drag-and-drop dropzone with file size/type validation.
  * `Status Mark` visual indicator for parsing stages.
  * React Bits `Stepper` for the 4-step guided setup flow (Upload & Confirm → Add Team → Building Parameters & WBS → Run Schedule & Optimizer) driven by real project status.
  * Pre-filled shadcn `Field` form with confidence `Badge` indicators and `Tooltip` explanations.
  * Highlight missing/low-confidence fields.
  * `AlertDialog` confirmation gate before saving project parameters.
  * Fix unconditional hook placement.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: rera-review - 4-step stepper, confidence badges, and confirm dialog`.

---

## Task 5: Rebuild Page 6 — WBS Breakdown & Costing Table (`/wbs`)
* **Goal**:
  * TanStack Data Table with collapsible WBS category grouping.
  * Tabs switching between WBS Breakdown and Cost Category Distribution.
  * Animated `Counter` for total estimated cost in Indian Rupees (`formatINR`).
  * Tabular monospaced numbers (`font-mono`) for all durations, quantities, and rates.
  * Self-contained responsive scroll container (`overflow-x-auto`).
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: wbs - collapsible grouped data table, inr counter, and responsive container`.

---

## Task 6: Rebuild Page 7 — Schedule / Gantt Timeline (`/wbs` Schedule Tab)
* **Goal**:
  * Keep existing `gantt-task-react` library; restyle with engineering design tokens from `DESIGN.md`.
  * Ensure large schedules (dense task lists) render smoothly without performance degradation.
  * Critical Path tasks prominently highlighted in Safety Orange (`#E8590C`).
  * `Toggle Group` zoom controls (Day / Week / Month).
  * Interactive tooltips displaying task float, early start/finish, and resource demands.
  * `Animated Content` entrance transition on schedule calculation.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: schedule - restyle gantt timeline with critical path accent and zoom toggles`.

---

## Task 7: Rebuild Page 8 — Delay Recovery Optimizer (`/optimizer`)
* **Goal**:
  * Dual comparison Cards: "Pay Statutory Penalty" vs "Crash Critical Path", with the lower-cost option marked with a prominent "Recommended" badge.
  * Animated `Counter` highlighting net rupee savings (`formatINR`).
  * Cost curve visualization via shadcn `Chart` (Recharts wrapper).
  * Monospaced crash options table with status badges and slope values.
  * Preserve all existing input controls and recalculation logic without modifications.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: optimizer - dual comparison cards, recommended badge, and cost curve chart`.

---

## Task 8: Rebuild Page 9 — Executive & Role Dashboard (`/dashboard`)
* **Goal**:
  * Role-customized KPI cards with animated `Counter` metrics.
  * Restyle existing S-curve (`s_curve_data`) and existing charts only with blueprint tokens (`#283243` planned vs `#E8590C` actual); add zero new charts or data.
  * Monospaced tooltip cards with clean 1px borders.
  * Budget consumption progress indicator.
  * High-density executive layout with zero decorative clutter.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: dashboard - blueprint s-curve charts, kpi counters, and budget progress`.

---

## Task 9: Rebuild Page 10 — Materials & Site Photos (`/materials`)
* **Goal**:
  * Filterable TanStack Data Table with stage filters (Structural, Masonry, Finishing).
  * Slide-over `Sheet` for logging new material entries and uploading bills (evidence-only).
  * Site photo gallery with `Status Mark` classification indicators and confidence progress bars.
  * Clear "Evidence Only / Unparsed" statutory badge on invoice photos.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: materials - filterable data table, upload sheet, and site photo badges`.

---

## Task 10: Rebuild Page 12 — Admin & Team Management (`/admin`)
* **Goal**:
  * Clean Data Table listing active system users, emails, and roles.
  * Role badges styled with high-contrast semantic borders.
  * shadcn `Dialog` for registering new organization users.
  * Slide-over `Sheet` for assigning team members to specific projects.
  * `shared-tooltip-avatars` on the user roster.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: admin - user roster data table, user dialog, and member assignment sheet`.

---

## Task 11: Rebuild Page 11 — Architectural Drawings Vault (`/drawings`)
* **Goal**:
  * Blueprint card grid with drawing previews.
  * Explicit "View Only / Never Parsed" statutory badge.
  * Slide-over `Sheet` preview for drawing specifications.
  * Secure pre-signed download action preserved.
  * Polished `Empty` state for projects without drawings.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: drawings - blueprint drawing cards, view-only badges, and sheet preview`.

---

## Task 12: Rebuild Page 13 — Benchmark Solver (`/benchmark`)
* **Goal**:
  * Tab navigation for dataset presets (Standard, Dense, Stress test).
  * Comparative Bar Chart for GA vs CP-SAT makespan and execution time.
  * Animated `Counter` for solver iteration counts and runtime milliseconds.
  * shadcn `ScrollArea` for inspectable solver output logs.
* **Verification**: `npm.cmd run build && npm.cmd run lint`.
* **Commit**: `ui: benchmark - solver bar charts, metrics counter, and scroll area logs`.

---

## Task 13: Final Verification & 7-Role Demo Walkthrough
* **Goal**:
  * Run full backend tests, frontend `npm run build` & `lint` with zero errors.
  * Comprehensive repository security scan for any secrets/tokens.
  * Walk through the complete 7-step demo flow as each role:
    1. PM uploads MahaRERA PDF and confirms.
    2. Team members assigned.
    3. WBS generated, CPM schedule computed, and optimizer executed.
    4. Architect uploads CAD drawing (unparsed, view-only).
    5. Site Engineer uploads site photo (heuristic classification).
    6. Store Keeper logs materials and bill invoice (evidence only).
    7. Accountant and Owner inspect Budget vs Actual dashboard.
  * Update `DESIGN.md`, `DEPENDENCIES.md`, `UI_AUDIT.md`, and report all page-size diffs.
* **Verification**: Complete test suite pass & zero build/lint errors.
* **Commit**: `docs: complete ui rebuild verification checklist and performance report`.
