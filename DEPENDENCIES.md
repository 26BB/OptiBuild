# OptiBuild UI Rebuild Dependency Log (DEPENDENCIES.md)

> Records all components, packages, and registries added during the UI rebuild, along with architectural justification and bundle impact.

---

## 1. Baseline Dependencies (Pre-Rebuild)

* **Next.js**: `16.4.0` (Turbopack, App Router)
* **React**: `19.3.0` / React DOM `19.3.0`
* **Tailwind CSS**: `v4` (`@tailwindcss/turbopack`)
* **Core Libraries**:
  * `framer-motion`: `^14.1.1` (hardware-accelerated motion orchestration)
  * `lucide-react`: `^1.56.0` (technical engineering iconography)
  * `recharts`: `^3.10.1` (CPM cost-time curves, S-curves, and benchmark bar charts)
  * `gantt-task-react`: `^0.3.9` (CPM schedule timeline)
  * `@tanstack/react-table`: `^9.3.1` (high-density data tables)
  * `@fontsource-variable/space-grotesk`, `@fontsource-variable/ibm-plex-sans`, `@fontsource/ibm-plex-mono` (local zero-network typography)

---

## 2. Rebuild Additions (Audit Log)

| Component / Primitive | Source Registry | Purpose & Justification | Bundle & Performance Impact |
|:---|:---|:---|:---|
| `Sheet` | shadcn/ui (Base-UI Dialog) | Slide-over drawers for material logging, project member assignment, and drawing preview | Lightweight; zero new external runtime deps |
| `Dialog` & `AlertDialog` | shadcn/ui (Base-UI Dialog) | Statutory confirmation gate before committing MahaRERA draft, user registration dialog | Lightweight; zero new external runtime deps |
| `Badge` | shadcn/ui (CVA) | High-contrast 7-role badges, confidence scores, and unparsed evidence markers | Pure CSS / CVA utility; 0kb runtime |
| `Progress` | shadcn/ui | Visual budget utilization and WBS progress bars | Pure CSS utility; 0kb runtime |
| `CommandPalette` (`Ctrl+K`) | cmdk / shadcn/ui | Instant keyboard navigation across all modules and projects | Lightweight (`cmdk`) |
| `Counter` | React Bits / framer-motion | Rupee amounts and KPI count-up animations respecting `prefers-reduced-motion` | Zero new deps (built on existing `framer-motion`) |
| `StatusMark` | React Bits / SVG | 3-state animated parse status indicator for MahaRERA PDF ingestion | Pure SVG / CSS |
| `BlueprintBackground` | React Bits / CAD SVG | CAD line blueprint background for `/login`, lazy loaded (`ssr: false`), disabled on `<768px` | Dynamic import, zero main-thread block |
| `KineticTextLoader` | Vengeance UI | Replaces static "Waking up server" banner with kinetic engineering loader | Framer motion based |
| `SharedTooltipAvatars` | Vengeance UI | Team member avatar stack with role tooltip badges on project cards and admin | Framer motion based |
| `StaggeredGrid` | Vengeance UI | Staggered entrance animation for project overview cards (<= 400ms duration) | Framer motion based |

---

## 3. Production Build & Page Size Metrics

### Final Turbopack Static Prerender Metrics
* Route `○ /` (Projects Overview): Static (Prerendered)
* Route `○ /_not-found`: Static (Prerendered)
* Route `○ /admin` (Team & User Roster): Static (Prerendered)
* Route `ƒ /api/[...path]` (Reverse Proxy): Dynamic (Server-rendered)
* Route `○ /benchmark` (Solver Benchmark): Static (Prerendered)
* Route `○ /dashboard` (Executive Dashboard): Static (Prerendered)
* Route `○ /drawings` (Architectural Vault): Static (Prerendered)
* Route `○ /login` (CAD Login): Static (Prerendered)
* Route `○ /materials` (Materials & Site Photos): Static (Prerendered)
* Route `○ /optimizer` (Delay Recovery Optimizer): Static (Prerendered)
* Route `○ /rera-review` (MahaRERA 4-Step Stepper): Static (Prerendered)
* Route `○ /wbs` (Parametric WBS & Gantt): Static (Prerendered)

**Build Result**: `13 of 13 routes prerendered in ~1.2s` with **0 TypeScript and 0 compilation errors**.
