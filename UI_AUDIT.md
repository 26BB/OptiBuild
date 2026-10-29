# OptiBuild UI Redesign Audit (UI_AUDIT.md)

> **Generated using `taste-skill` and `ui_ux_pro_max`**  
> Comprehensive audit of the baseline OptiBuild frontend presentation layer prior to the `ui-rebuild`.

---

## 1. Executive Summary & Aesthetic Assessment

The baseline OptiBuild user interface functions mechanically, but looks generic, stark, and unpolished:
1. **Generic Layouts**: Standard rows of plain cards without hierarchy; missing the visual authority of a civil engineering blueprint workstation.
2. **Missing Engineered Motion**: Abrupt screen transitions, zero entrance choreography, static number rendering without counter motion.
3. **Typography & Formatting Inconsistencies**: Key financial numbers and task IDs are rendered in standard proportional fonts rather than monospaced tabular numbers; standard comma formatting is used instead of Indian Lakh/Crore (`₹15.00 L`, `₹1.50 Cr`).
4. **Weak State Handling**: Missing engineered skeleton loaders during API latency; raw spinners and text banners ("Waking up server") instead of polished feedback.
5. **App Shell Clutter**: Standard sidebar without role-filtered visual indicators or searchable project quick-switcher; missing `Ctrl+K` command palette.

---

## 2. Page-by-Page Audit & Rebuild Objectives

### Page 1: Login (`/login`)
* **Current State**: Centered plain card on a white background with basic email/password input fields and standard demo buttons.
* **Target Rebuilt State**:
  * Professional split layout: left technical blueprint brand panel featuring dynamic CAD background (`Grid Scan` / `Dot Grid` with fallback) and technical headline (`Shiny Text`).
  * Right form panel using shadcn `Card` + `Field` form controls.
  * Demo credentials presented as interactive role chips (1-click autofill for all 7 roles).
  * Micro-animated primary submit button (`my-animated-button` with `Magnet` hover).
  * Inline loading state and clear, accessible error notifications.

### Page 2: Application Shell (`ClientLayoutWrapper`, `Sidebar`, `TopBar`)
* **Current State**: Basic fixed sidebar and top bar; plain text "Waking up server" banner.
* **Target Rebuilt State**:
  * Collapsible shadcn `Sidebar` with role-filtered navigation items.
  * Sidebar header: Project Switcher `Combobox` with quick-search.
  * Dynamic `Breadcrumb` navigation in top bar.
  * Quick-search `Command` palette accessible via `Ctrl+K`.
  * User profile menu displaying user name, role badge, and 1-click logout.
  * Dark-mode toggle (Parchment Blueprint ↔ Carbon Terminal).
  * Smooth Sonner toast notification integration.
  * Mobile drawer support for 375px viewport responsiveness.
  * Replace the "Waking up server" banner with Vengeance UI `kinetic-text-loader`.

### Page 3: Projects Overview (`/`)
* **Current State**: Simple card grid; plain text status and numbers.
* **Target Rebuilt State**:
  * Staggered-grid layout (`staggered-grid` from Vengeance UI).
  * Project cards displaying name, RERA registration, proposed completion date, delay days, and status badges (WBS, Schedule, Optimizer).
  * `shared-tooltip-avatars` for project team members with role badges.
  * Metric ribbons featuring animated `Counter` (Total Projects, Delayed Projects, Active Value in ₹ Cr).
  * Polished `Empty` state ("Upload a MahaRERA PDF to create your first project").

### Page 4: MahaRERA Upload & Confirm (`/rera-review`)
* **Current State**: Basic file input and raw form fields; early return hook violation bug in baseline.
* **Target Rebuilt State**:
  * Styled drag-and-drop dropzone with file size/type validation.
  * `Status Mark` visual indicator for parsing states (Extracting text, Regex classification, Ready).
  * 4-step guided setup stepper (`Stepper` from React Bits) driven by real project data:
    1. Upload & Confirm
    2. Add Team
    3. Building Parameters & WBS
    4. Run Schedule & Optimizer
  * Pre-filled shadcn `Field` form with confidence `Badge` indicators and explanatory `Tooltip` elements.
  * Highlights on missing or low-confidence parameters.
  * `AlertDialog` confirmation gate before committing project parameters to the database.

### Page 5: WBS & Cost Estimation (`/wbs` - WBS Tab)
* **Current State**: Basic HTML table without collapsible grouping; standard currency strings.
* **Target Rebuilt State**:
  * TanStack Data Table with collapsible WBS category grouping.
  * Tab navigation (WBS Breakdown vs Cost Summary).
  * Total project cost with animated `Counter` in Indian Rupees (`₹... Cr`).
  * Tabular monospaced numbers (`font-mono`) for all durations, quantities, and rates.
  * Internal responsive scroll container preventing body-level horizontal overflow.

### Page 6: Schedule / Gantt Timeline (`/wbs` - Schedule Tab)
* **Current State**: Stock `gantt-task-react` with generic blue bars.
* **Target Rebuilt State**:
  * Gantt chart restyled with custom engineering tokens matching `DESIGN.md`.
  * Critical Path tasks prominently highlighted in Safety Orange (`#E8590C`).
  * `Toggle Group` zoom controls (Day / Week / Month).
  * Interactive tooltips displaying task float, early start/finish, and resource demands.
  * `Animated Content` entrance transition on schedule calculation.

### Page 7: Delay Recovery Optimizer (`/optimizer`)
* **Current State**: Dense tabular view with raw numbers and basic comparison.
* **Target Rebuilt State**:
  * Dual comparison cards: "Pay Statutory Penalty" vs "Crash Critical Path", with the lower-cost option marked with a prominent "Recommended" badge.
  * Animated `Counter` highlighting the exact net rupee savings (`formatINR`).
  * Cost curve visualization via shadcn `Chart` (Recharts wrapper).
  * Monospaced crash options table with status badges and slope values.
  * Strict preservation of all existing slider and input logic (zero feature changes).

### Page 8: Executive & Role Dashboard (`/dashboard`)
* **Current State**: Standard Recharts line/bar charts with stock colors.
* **Target Rebuilt State**:
  * Role-customized KPI cards with animated `Counter` metrics.
  * Budget vs Actual Planned S-Curve styled with blueprint tokens (`#283243` planned vs `#E8590C` actual).
  * Monospaced tooltip cards with clean 1px borders.
  * Budget consumption progress indicator.
  * High-density executive layout with zero fluff.

### Page 9: Materials & Site Photos (`/materials`)
* **Current State**: Simple table; basic photo upload list.
* **Target Rebuilt State**:
  * Filterable TanStack Data Table with stage filters (Structural, Masonry, Finishing).
  * Slide-over `Sheet` for logging new material entries and uploading bills (evidence-only).
  * Site photo gallery with `Status Mark` classification indicators and confidence progress bars.
  * Clear "Evidence Only / Unparsed" statutory badge on invoice photos.

### Page 10: Architectural Drawing Vault (`/drawings`)
* **Current State**: Basic file list; download links.
* **Target Rebuilt State**:
  * Blueprint card grid with drawing previews.
  * Explicit "View Only / Never Parsed" statutory badge.
  * Slide-over `Sheet` preview for drawing specifications.
  * Secure pre-signed download action preserved.
  * Polished `Empty` state for projects without drawings.

### Page 11: Admin & Team Management (`/admin`)
* **Current State**: Basic user table and role select dropdown.
* **Target Rebuilt State**:
  * Clean Data Table listing active system users, emails, and roles.
  * Role badges styled with high-contrast semantic borders.
  * shadcn `Dialog` for registering new organization users.
  * Slide-over `Sheet` for assigning team members to specific projects.
  * `shared-tooltip-avatars` on the user roster.

### Page 12: Solver Benchmark (`/benchmark`)
* **Current State**: Raw logs and basic benchmark charts.
* **Target Rebuilt State**:
  * Tab navigation for dataset presets (Standard, Dense, Stress test).
  * Comparative Bar Chart for GA vs CP-SAT makespan and execution time.
  * Animated `Counter` for solver iteration counts and runtime milliseconds.
  * shadcn `ScrollArea` for inspectable solver output logs.

---

## 3. Rebuild Status Tracking Table

| Task # | Scope / Module | Status | Build Check | Lint Check | Git Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | Architecture, Tokens & Foundations | **Ready** | Pending | Pending | — |
| **1** | Page 1: Login Rebuild (`/login`) | **Pending** | Pending | Pending | — |
| **2** | Page 2: App Shell Rebuild (Sidebar, TopBar, Breadcrumb, Cmd+K) | **Pending** | Pending | Pending | — |
| **—** | *Checkpoint Review & User Approval* | **Pending** | — | — | — |
| **3** | Page 4: Projects Overview (`/`) | **Pending** | Pending | Pending | — |
| **4** | Page 5: MahaRERA Upload & 4-Step Stepper (`/rera-review`) | **Pending** | Pending | Pending | — |
| **5** | Page 6: WBS Breakdown & Costing Table (`/wbs`) | **Pending** | Pending | Pending | — |
| **6** | Page 7: Schedule & Gantt Restyling (`/wbs`) | **Pending** | Pending | Pending | — |
| **7** | Page 8: Delay Recovery Optimizer (`/optimizer`) | **Pending** | Pending | Pending | — |
| **8** | Page 9: Executive & Role Dashboard (`/dashboard`) | **Pending** | Pending | Pending | — |
| **9** | Page 10: Materials & Site Photos (`/materials`) | **Pending** | Pending | Pending | — |
| **10** | Page 11: Architectural Drawings Vault (`/drawings`) | **Pending** | Pending | Pending | — |
| **11** | Page 12: Admin & Team Roster (`/admin`) | **Pending** | Pending | Pending | — |
| **12** | Page 13: Solver Benchmark (`/benchmark`) | **Pending** | Pending | Pending | — |
| **13** | Verification, 7-Role Demo Walkthrough & Final Documentation | **Pending** | Pending | Pending | — |

