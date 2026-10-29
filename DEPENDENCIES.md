# OptiBuild UI Rebuild Dependency Log (DEPENDENCIES.md)

> Records all components, packages, and registries added during the UI rebuild, along with architectural justification and bundle impact.

---

## 1. Baseline Dependencies (Pre-Rebuild)

* **Next.js**: `16.4.3` (Turbopack, App Router)
* **React**: `19.3.0` / React DOM `19.3.0`
* **Tailwind CSS**: `v4` (`@tailwindcss/turbopack`)
* **Core Libraries**:
  * `framer-motion`: `^14.1.1` (motion orchestration)
  * `lucide-react`: `^1.56.0` (engineering iconography)
  * `recharts`: `^3.10.1` (financial and performance charts)
  * `gantt-task-react`: `^0.3.9` (CPM schedule timeline)
  * `@tanstack/react-table`: `^9.3.1` (data tables)
  * `@fontsource-variable/space-grotesk`, `@fontsource-variable/ibm-plex-sans`, `@fontsource/ibm-plex-mono` (local fonts)

---

## 2. Rebuild Additions (Audit Log)

| Component / Package | Source | Justification | Bundle / Size Impact |
| :--- | :--- | :--- | :--- |
| `sonner` | shadcn/ui | Unified, accessible toast notifications across all mutations | Minimal (clean replacement for raw alert dialogs) |
| `command` | shadcn/ui | Global Ctrl+K navigation palette for rapid module switching | Light |
| `separator`, `scroll-area` | shadcn/ui | Precise architectural hairline rules and contained scrolling | Minimal |
| `avatar`, `breadcrumb` | shadcn/ui | Role display and hierarchical navigation chrome | Minimal |
| `sheet` | shadcn/ui | Slide-over drawers for mobile navigation and detail forms | Light |
| `alert-dialog` | shadcn/ui | Confirmation barrier before committing MahaRERA parameters | Minimal |
| `progress`, `skeleton` | shadcn/ui | Visual confidence scores and engineered shimmer states | Minimal |
| `AnimatedNumber` / `Counter` | React Bits | Smooth KPI and rupee count-up animations on page mount | Zero extra deps (built on `framer-motion`) |
| `kinetic-text-loader` | Vengeance UI | Replaces static "Waking up server" text banner with kinetic loader | CSS / framer-motion based |
| `shared-tooltip-avatars` | Vengeance UI | Team member avatars with role tooltips on project cards | CSS / framer-motion based |
| `staggered-grid` | Vengeance UI | Architectural layout for projects overview | CSS / framer-motion based |

---

## 3. Production Build & Page Size Metrics

### Baseline Page Sizes (Turbopack Static Prerender)
* Route `/` (Projects): Static (Prerendered)
* Route `/login`: Static (Prerendered)
* Route `/rera-review`: Static (Prerendered)
* Route `/wbs`: Static (Prerendered)
* Route `/optimizer`: Static (Prerendered)
* Route `/dashboard`: Static (Prerendered)
* Route `/materials`: Static (Prerendered)
* Route `/drawings`: Static (Prerendered)
* Route `/admin`: Static (Prerendered)
* Route `/benchmark`: Static (Prerendered)
* Total build compilation time: ~16.0s

