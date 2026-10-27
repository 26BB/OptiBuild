# OptiBuild — Live MVP Demo Script & Evaluation Protocol

## 1. Demo Credentials & Role Directory

All 7 demo accounts are pre-seeded in the database with identical credentials across the frontend preset buttons, seed script, and documentation:

| Role | User Name | Email Address | Password | Default Landing Page | Primary Demo Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Manager** | Rajesh Sharma | `pm@optibuild.io` | `Pm@123` | `/` (Projects Overview) | Upload MahaRERA PDF, generate WBS, solve CPM/GA schedule & penalty optimizer |
| **System Administrator** | System Admin | `admin@optibuild.io` | `Admin@123` | `/admin` | Organization security, create accounts, assign project team roles |
| **Site Engineer** | Amit Patil | `site@optibuild.io` | `Site@123` | `/materials` | Upload site construction photos, verify MobileNetV2 stage classifier |
| **Store Keeper** | Suresh Deshmukh | `store@optibuild.io` | `Store@123` | `/materials` | Log incoming material delivery receipts and upload bill photos (unparsed audit proof) |
| **Lead Architect** | Pooja Kulkarni | `architect@optibuild.io` | `Architect@123` | `/drawings` | Attach architectural CAD/DWG/PDF drawings (secure vault) |
| **Project Accountant** | Vikas Joshi | `accountant@optibuild.io` | `Accountant@123` | `/dashboard` | Audit Budget vs Actual spend, recalculate real-time crash-cost slopes |
| **Owner / Developer** | Anand Singhania | `owner@optibuild.io` | `Owner@123` | `/dashboard` | Review contractual delay exposure, S-curve cumulative cashflow, and penalty risk |

---

## 2. Pre-Demo Checklist

Complete these 5 verification steps 15 minutes before the live demonstration:

- [ ] **Wake Up Free-Tier Instances**: Render free-tier services spin down after inactivity. Ping `GET https://<render-backend-url>/health` or open the frontend in your browser. If cold, wait 30–50 seconds until the status returns `{"status":"healthy"}`.
- [ ] **Prepare Test MahaRERA PDF**: Place a sample MahaRERA certificate PDF on your desktop or easily accessible folder (e.g. `P52100018921` sample certificate).
- [ ] **Prepare Sample Drawing & Receipt Images**: Have one drawing (`.pdf` or `.png`) and one material invoice receipt (`.jpg` or `.png`) ready for upload.
- [ ] **Run Verification Script**:
  ```bash
  python scripts/check_services.py
  ```
  Confirm all three items (`Database`, `Storage Bucket`, `/health Endpoint`) return `[PASS]`.
- [ ] **Backup Demo Recording**: Have a locally recorded backup video of the complete walkthrough in case of conference venue Wi-Fi disruption.

---

## 3. The 7-Step Live Walkthrough Script

### Step 1: Project Manager Uploads MahaRERA Certificate & Confirms
1. Log in as **Project Manager** (`pm@optibuild.io` / `Pm@123`) by clicking the **Project Manager** one-click preset on `/login`.
2. Navigate to **MahaRERA Review** (`/rera-review`).
3. Drag and drop the MahaRERA certificate PDF into the parser dropzone.
4. Explain the statutory protocol:
   - High-confidence fields (RERA registration number, promoter name, completion date, built-up area) are pre-filled with confidence badges (`HIGH`, `MEDIUM`, or `INFERRED`).
   - If the certificate is scanned, the built-in `pypdfium2` + `pytesseract` OCR fallback automatically extracts text.
   - **Crucial Rule**: The engine *never* auto-saves parsed data. The engineer must review and click **Confirm & Register Project**.
5. Click **Confirm & Register Project**.
6. The green confirmation banner and the **4-Step Guided Setup Stepper** appear immediately.

### Step 2: Admin or PM Assigns Team Members
1. Click **Step 2: Add Team** on the guided stepper (or navigate to `/admin`).
2. Show that both `admin` and `project_manager` can assign existing users to this project with project-scoped roles:
   - Select the newly confirmed project from the dropdown.
   - Assign `Amit Patil (Site Engineer)` as `site_engineer`.
   - Assign `Suresh Deshmukh (Store Keeper)` as `store_keeper`.
   - Assign `Pooja Kulkarni (Lead Architect)` as `architect`.
3. Highlight project-level access control: unassigned users receive strict `403 Forbidden` responses.

### Step 3: PM Generates WBS, Baseline Schedule & Crash-Cost Optimizer
1. Navigate to **WBS Generator** (`/wbs`).
2. Review building parameters (built-up area e.g. 75,000 sq.ft, 14 floors, base rate ₹2,400/sq.ft).
3. Click **Generate Parametric WBS**:
   - Total estimated cost (e.g. ₹18.0 Cr) is partitioned across standard packages (Substructure, Superstructure, MEP, Finishing).
   - Generates the full Directed Acyclic Graph (DAG) with precedence constraints.
4. Navigate to **Home / Schedule Overview** (`/`):
   - View the interactive Gantt chart.
   - Run the Genetic Algorithm (GA) resource-constrained scheduler to eliminate resource over-allocations (crane and labor constraints).
5. Navigate to **Delay Optimizer** (`/optimizer`):
   - Simulate a delay (e.g. 14 days delay against RERA handover).
   - Compare daily statutory RERA interest penalty (SBI MCLR + 2%) against crashing costs.
   - Observe the greedy crashing algorithm identify critical-path tasks with lowest cost slope.

### Step 4: Lead Architect Attaches Working Drawings
1. Log out, then log in as **Lead Architect** (`architect@optibuild.io` / `Architect@123`).
2. The user lands directly on `/drawings`.
3. Select the active project, choose drawing category (Architectural, Structural, or MEP), attach a drawing file (`.pdf` or `.png`), and click **Upload Drawing**.
4. Show the statutory compliance note: Drawings are stored in private S3 buckets and accessed via secure, 10-minute short-lived signed URLs. They are **never parsed or OCR'd**.
5. Demonstrate role security: click `/admin` or `/wbs` and observe the dedicated **Permission Denied** screen with a button returning to `/drawings`.

### Step 5: Site Engineer Uploads Site Photo & Validates Progress
1. Log out, then log in as **Site Engineer** (`site@optibuild.io` / `Site@123`).
2. The user lands on `/materials` (the field operations workspace).
3. Scroll to the **Site Photo Inspection** section.
4. Upload a site progress photo.
5. The MobileNetV2 CNN classifier detects features (e.g., reinforcement rebar, column formwork) and suggests the construction stage with confidence score.
6. The Site Engineer confirms the milestone.

### Step 6: Store Keeper Logs Inbound Material Delivery with Bill Evidence
1. Log out, then log in as **Store Keeper** (`store@optibuild.io` / `Store@123`).
2. The user lands on `/materials`.
3. In the **Log Inbound Material Delivery** form:
   - Select Material Category: `Steel / Rebar`
   - Item Description: `Fe550D TMT Reinforcement Steel`
   - Quantity: `18` MT, Unit Rate: `₹58,000` / MT
   - Total Amount: `₹10,44,000`
   - Vendor Name: `Tata Tiscon Authorized Dealer`
   - Attach Bill / Delivery Challan photo.
4. Click **Submit Procurement Record**:
   - In accordance with the system rules, the invoice photo is stored as unparsed legal evidence.
   - The rate (`₹58,000` vs baseline `₹54,000`) introduces a +7.4% material rate variance into the project database.

### Step 7: Accountant & Developer View Real-Time Dashboard & Recalibration
1. Log out, then log in as **Project Accountant** (`accountant@optibuild.io` / `Accountant@123`) or **Owner** (`owner@optibuild.io` / `Owner@123`).
2. The user lands directly on the **Executive Dashboard** (`/dashboard`).
3. Point out the live calculations:
   - **Budget vs Actual**: Material purchases logged by the store keeper immediately roll into actual spend.
   - **Package Variance**: Superstructure and RCC packages show real-time budget utilization.
   - **Cumulative S-Curve Spend**: Planned monthly expenditure vs actual site outlays.
4. Click **Recalibrate Crash Slopes**:
   - The engine evaluates the recent steel rate inflation (+7.4%) and automatically updates the cost-to-crash for dependent critical path activities.
   - Shows engineers how site inflation impacts crashing trade-offs before contract renegotiations.

---

## 4. Key Architectural Differentiators to Highlight for Evaluators

1. **Deterministic Penalty Math**: RERA Section 18 penalty computation strictly follows statutory formulas (SBI MCLR + 2% per annum, compounded monthly).
2. **Hybrid Scheduling Pipeline**: Unconstrained CPM sets theoretical lower-bound makespan; Genetic Algorithm (GA) resolves resource-constrained project scheduling (RCPSP); OR-Tools CP-SAT verifies optimality invariants.
3. **Data Integrity & Storage Security**: All S3 objects are private with UUID keys and sanitized paths. Downloads use short-lived 10-minute signed URLs. Quotas protect tenant storage.
4. **Resilient Free-Server Architecture**: Requests gracefully detect cold starts with automatic retry and user notification banners.
