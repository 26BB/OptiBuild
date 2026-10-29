# OptiBuild Engineering Design System & Specification (DESIGN.md)

> **Single Source of Truth** for the OptiBuild Construction-Tech SaaS UI Rebuild.  
> Derived from `ui_ux_pro_max` intelligence and `taste-skill` Framed Sheet architectural direction.  
> Dials: Design Variance LOW-TO-MEDIUM, Motion Intensity MEDIUM, Visual Density HIGH on data pages.  
> If any other guide or skill conflicts with this document, **DESIGN.md takes precedence.**

---

## 1. Visual Identity & Brand Philosophy

OptiBuild is a mission-critical civil engineering construction management and statutory compliance platform (MahaRERA compliance, CPM scheduling, resource-constrained genetic algorithms, delay recovery optimization).

* **Aesthetic**: Modern, premium construction-tech SaaS with a **precision Site Office Blueprint & CAD terminal** feel.
* **Tone**: Serious, trustworthy, industrial-grade, clean. Avoid purple/pink gradients, playful illustrations, emojis, and repeated identical three-card rows.
* **Surface Model**: Framed Sheet — quiet tinted chrome shell framing crisp content sheets with hairline 1px architectural rules (`border-border`) and subtle 24px blueprint grid lines.
* **Hero Visual**: CPM + GA schedule (Gantt chart) timeline with critical path highlighted in Safety Orange.

---

## 2. Color Palette & Semantic Design Tokens

Strict WCAG AA contrast (>= 4.5:1 for body copy and data numbers). Light theme by default (suitable for site office projectors), with a dark-mode toggle (terminal mode).

| Token | Light Mode (Blueprint Parchment) | Dark Mode (Site Terminal) | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--background` | `#F4F1EA` (Warm blueprint paper) | `#14181F` (Carbon dark) | Main application canvas background |
| `--card` / `--surface` | `#FFFFFF` (Clean sheet) | `#1A2029` (Muted carbon tile) | Cards, panels, tables, dialogs, sheets |
| `--foreground` | `#1C2024` (Deep charcoal ink) | `#E8ECEF` (High-contrast slate) | Primary headings, table text, titles |
| `--muted-foreground` | `#5C6470` (Graphite grey) | `#8A94A6` (Muted steel) | Subtitles, helper text, labels |
| `--border` | `#D4CBBA` (Blueprint rule) | `#283243` (Steel structural rule) | 1px borders, separators, table rules |
| `--grid-line` | `rgba(28, 32, 36, 0.05)` | `rgba(232, 236, 239, 0.04)` | Subtle 24px engineering grid lines |
| `--primary` / `--accent` | `#E8590C` (Safety Orange) | `#E8590C` (Safety Orange) | **Single Accent Color**: Primary buttons, critical path, active states |
| `--primary-hover` | `#D9480F` (Deep Orange) | `#FF7A1A` (Vibrant Safety) | Interactive hover state |
| `--secondary` | `#EAE4D5` (Soft parchment) | `#222935` (Dark slate) | Secondary buttons, inactive tabs |
| `--status-success` | `#2B8A3E` (Forest Green) | `#2F9E44` (Vibrant Green) | On-schedule, verified RERA, completed tasks |
| `--status-warning` | `#E8590C` (Safety Orange) | `#F59E0B` (Amber Warning) | Approaching deadlines, delay risk exposure |
| `--destructive` | `#C92A2A` (Crimson Red) | `#FA5252` (Bright Red) | Critical path blockers, penalty overruns, delete |

---

## 3. Typography & Numerical Formatting

Typography uses locally loaded packages from `@fontsource` to ensure zero external network latency and complete privacy:

* **Heading Font**: `Space Grotesk Variable` (`var(--font-heading)`) — Clean, technical, geometric sans-serif for page headers and card titles. Letter spacing: `-0.02em`.
* **Body Font**: `IBM Plex Sans Variable` (`var(--font-sans)`) — Highly legible engineering body copy for descriptions, forms, and dialogs.
* **Monospace Font**: `IBM Plex Mono` (`var(--font-mono)`) — **MANDATORY** for all numbers, currency amounts, percentages, dates, task IDs (`T01`), RERA numbers, badges, and table figures. Uses `font-variant-numeric: tabular-nums`.

### Indian Rupee (INR) Standard
* All currency amounts MUST be formatted in Indian numbering comma format (2, 2, 3):
  * Standard: `₹15,00,000`
  * Compact: `₹15.00 L` (Lakhs), `₹1.50 Cr` (Crores)
  * Utility helper: `formatINR(amount, compact)`

---

## 4. Spacing, Geometry & Component Tokens

* **Border Radius**: Strict `4px` maximum across the entire UI (`rounded-[4px]`). No pill buttons, no large rounded cards (`rounded-xl` and `rounded-2xl` are forbidden).
* **Border Width**: Uniform `1px` crisp borders (`border border-border`). No heavy decorative drop shadows; visual elevation is communicated through clean surface contrast and border definition.
* **Visual Density**: HIGH. Compact padding (`p-3` to `p-4` on cards, `py-2 px-3` on table rows) to maximize visible engineering data without excessive scrolling.
* **Tables**: Every table is wrapped in an internal overflow container (`overflow-x-auto`) so the page body never scrolls horizontally.

---

## 5. Three Component Sources

### Source 1: shadcn/ui (~90% of Structure)
* **Components**: Sidebar, Breadcrumb, Command (Ctrl+K palette), Card, Table & TanStack Data Table, Tabs, Toggle Group, Sheet, Dialog, Alert Dialog, Field/Form with Input, Select & Combobox, Badge, Progress, Avatar, Dropdown Menu, Tooltip, Skeleton, Empty, Sonner, Scroll Area, Separator, Chart (Recharts wrapper).
* **Theme**: Fully variable-driven through `globals.css` using the tokens defined above.

### Source 2: React Bits (Motion, Numbers & 1 Background)
* **Allowed**:
  * `Counter` and `Count Up`: Money, delay days, and KPI figures (en-IN locale, rupee, lakh/crore).
  * `Animated Content` and `Fade Content`: Cohesive entrance transitions (<= 400ms).
  * `Stepper`: 4-step guided setup flow on MahaRERA review page.
  * `Status Mark`: Visual indicator for PDF parsing status.
  * `Spotlight Card` / `Border Glow` / `Glare Hover`: Subtle hover effect on key KPI cards only.
  * `Magnet`: Login CTA button micro-interaction.
  * `Text Type` / `Shiny Text`: Technical blueprint headline on login page.
  * **Login Background**: Exactly ONE background on the login page: `Grid Scan` or `Dot Grid` (blueprint CAD feel). Dynamic import with `ssr: false`, disabled on small screens (`< 768px`) and when `prefers-reduced-motion` is active, with a plain CSS grid fallback.
* **Forbidden**: Cursor-effect components (Splash, Ghost, Blob, Swarm, trails), 3D galleries, WebGL backgrounds on data pages.

### Source 3: Vengeance UI (Selected Flourishes)
* **Allowed**:
  * `kinetic-text-loader`: Replaces the "Waking up the server" banner.
  * `shared-tooltip-avatars`: Team members with role tooltips on project cards and the admin roster.
  * `staggered-grid`: Projects overview layout.
  * `my-animated-button`: Polished micro-interaction on the primary login submit button.

---

## 6. Motion & Animation Rules

* **Duration**: Entrance animations MUST complete in **400ms or less** (target: 200–250ms).
* **Properties**: Animate `transform` (translateY, scale) and `opacity` **only** for 60fps hardware acceleration.
* **Stagger**: Stagger elements once on initial mount only; never repeat stagger on interaction.
* **Accessibility**: Fully respect `prefers-reduced-motion`.
* **Zero Decoration on Data Pages**: No looping decorative animations, floating particles, or bouncing elements on analytics/data pages.

---

## 7. Role Matrix & Navigation Chrome (7 Roles)

| Role Code | Display Name | Navigation Access | Key Landing Focus |
| :--- | :--- | :--- | :--- |
| `admin` | System Administrator | All Modules + User & Team Management | Complete platform oversight |
| `project_manager` | Project Manager | Projects, MahaRERA, WBS & Cost, Schedule (Gantt), Optimizer, Drawings, Dashboard | Schedule, cost variance & statutory compliance |
| `site_engineer` | Site Engineer | Schedule (Gantt), Site Photos & Materials, Drawings | Daily site execution, photos & visual progress |
| `store_keeper` | Store Keeper | Materials & Cost Log, Site Photos (Evidence) | Inward material receipts, inventory, bills |
| `architect` | Lead Architect | Architectural Drawings Vault | Drawing uploads (attach-only, never parsed) & viewing |
| `accountant` | Project Accountant | Materials Log, Budget vs Actual Dashboard | Spend auditing, material variance & expenditure |
| `owner` | Owner / Developer | Budget vs Actual, Delay Risk Summary, Schedule Overview | High-level financial KPIs & RERA delay risk |

### App Shell Rules:
* Collapsible, role-filtered shadcn `Sidebar`.
* Project switcher in the sidebar header via searchable `Combobox`.
* Dynamic `Breadcrumb` tracking the active module.
* `Command` palette (accessible via `Ctrl+K` shortcut).
* User menu displaying logged-in user name, active role badge, and logout.
* Built-in quick role-switch demo chips on the login screen for 1-click evaluation.

