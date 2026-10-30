import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_synopsis():
    doc = docx.Document()
    
    # Page setup - 1 inch margins all around
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        
    # Set default style to Times New Roman 12pt, 1.5 spacing
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(17, 24, 39)
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # TITLE PAGE (PAGE 1)
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(8)
    run = p.add_run("Synopsis For\n(410248: Project Work Stage-I)")
    run.font.size = Pt(14)
    run.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(24)
    run = p.add_run("“OptiBuild: Resource-Constrained Construction Project Scheduling with Statutory Delay-Penalty Optimization”")
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 58, 138) # Deep navy

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run("SUBMITTED TO SAVITRIBAI PHULE PUNE UNIVERSITY\nIN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE DEGREE OF\n")
    run.font.size = Pt(11)
    run = p.add_run("BACHELOR OF ENGINEERING\n(Computer Engineering)")
    run.font.size = Pt(13)
    run.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run("Submitted By:")
    run.font.size = Pt(12)
    run.font.bold = True

    # Student Names Table
    tbl = doc.add_table(rows=4, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    students = [
        ("Bhushan V. Bhosale", "Roll No: 4101"),
        ("Divyal Patel", "Roll No: 4102"),
        ("Chaitanya Ghorpade", "Roll No: 4103"),
        ("Aniket Jadhav", "Roll No: 4104")
    ]
    for idx, (name, roll) in enumerate(students):
        row = tbl.rows[idx]
        row.cells[0].width = Inches(3.2)
        row.cells[1].width = Inches(2.0)
        c0 = row.cells[0].paragraphs[0]
        c0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r0 = c0.add_run(name)
        r0.font.bold = True
        r0.font.size = Pt(11)
        c1 = row.cells[1].paragraphs[0]
        c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r1 = c1.add_run(roll)
        r1.font.size = Pt(11)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run("UNDER THE GUIDANCE OF\n")
    run.font.size = Pt(11)
    run = p.add_run("Prof. [Guide Name]")
    run.font.size = Pt(13)
    run.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(36)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run("Department of Computer Engineering\nGenba Sopanrao Moze College of Engineering, Balewadi, Pune.\nAcademic Year: 2026–2027")
    run.font.size = Pt(12)
    run.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 2: ABSTRACT & BODY
    # -------------------------------------------------------------
    h = doc.add_paragraph()
    run = h.add_run("Abstract")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(6)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Residential and commercial construction projects throughout India face persistent schedule overruns, with empirical investigations establishing that over 70% of active developments exceed baseline delivery targets. Under statutory regimes such as Section 18 of the Real Estate (Regulation and Development) Act (MahaRERA), builders who fail to deliver projects on schedule must compensate allottees through mandatory recurring monthly interest calculated at the State Bank of India's benchmark lending rate plus 2% (SBI MCLR + 2%). Because cumulative homebuyer collections often exceed tens or hundreds of crores, daily statutory liability accrues rapidly. Traditional project management software (Primavera P6, MS Project) provides manual bar charting and basic resource leveling, but lacks automated re-scheduling engines and dynamic penalty-versus-crashing optimization.\n\n"
        "This project proposes OptiBuild, an intelligent decision-support platform designed to solve the Resource-Constrained Project Scheduling Problem (RCPSP) while accounting for statutory delay liabilities. The system integrates: (1) a Critical Path Method (CPM) engine utilizing NetworkX Directed Acyclic Graphs (DAG); (2) a Genetic Algorithm (GA) scheduler developed with the DEAP library to generate resource-feasible schedules; (3) exact solver benchmarking via Google OR-Tools CP-SAT to quantify optimality gaps; (4) a MahaRERA Delay-Penalty vs. Crash Cost Optimizer that compares statutory daily interest penalties against activity crash slopes to recommend cost-effective recovery actions; and (5) an edge-deployable MobileNetV2 binary image classifier (Structural vs. Finishing) with a human-in-the-loop review interface to verify on-site milestone progress. The expected outcome is a functional, full-stack web platform that generates resource-optimized schedules, verifies construction milestones, and minimizes statutory delay penalties for real-estate developers."
    )

    # 1. Problem Statement
    h = doc.add_paragraph()
    run = h.add_run("1. Problem Statement")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Construction project scheduling under renewable resource constraints is an established NP-hard combinatorial optimization challenge (RCPSP). Existing commercial tools rely on static Gantt charts that do not dynamically evaluate trade-offs between activity crashing costs and statutory financial liabilities (such as MahaRERA Section 18 delay interest). Furthermore, manual progress reporting lacks automated, objective verification, causing schedule drift to go undetected until completion milestones lapse."
    )
    
    p = doc.add_paragraph()
    p.add_run("Scope and Boundaries:").bold = True
    
    bp1 = doc.add_paragraph(style='List Bullet')
    bp1.add_run("In-Scope: ").bold = True
    bp1.add_run("Precedence modeling via DAGs, resource-constrained genetic scheduling, exact CP-SAT benchmarking, MahaRERA delay-penalty versus crash-slope optimization, and edge-based binary visual progress verification (Structural vs. Finishing).")
    
    bp2 = doc.add_paragraph(style='List Bullet')
    bp2.add_run("Out-of-Scope: ").bold = True
    bp2.add_run("Architectural CAD/DWG floor-plan generation, automated billing OCR, and heavy edge object detection (YOLO).")

    # 2. Objectives
    h = doc.add_paragraph()
    run = h.add_run("2. Objectives")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    p = doc.add_paragraph()
    p.add_run("The project pursues five SMART (Specific, Measurable, Achievable, Relevant, Time-bound) objectives:")

    objs = [
        ("Objective 1 (CPM DAG Analysis):", " Model construction workflows as Directed Acyclic Graphs (DAGs) using NetworkX to compute Early/Late start-finish windows and total float within ≤ 50 ms for networks up to 100 activities."),
        ("Objective 2 (Resource-Constrained GA):", " Implement a permutation-based Genetic Algorithm using DEAP and Serial Schedule Generation Scheme (SSGS) to enforce renewable crew limits, achieving a makespan reduction ≥ 15% over un-leveled baseline schedules."),
        ("Objective 3 (Exact Solver Benchmarking):", " Benchmark the GA scheduler against Google OR-Tools CP-SAT (AddCumulative constraint) on identical problem instances to calculate and document the empirical optimality gap (≤ 8%)."),
        ("Objective 4 (Statutory Penalty vs. Crash Arbitrator):", " Implement an automated decision engine comparing MahaRERA Section 18 statutory liabilities against critical-path activity crash slopes to determine whether to crash activities or absorb delay penalties."),
        ("Objective 5 (Edge Progress Verification & Full-Stack MVP):", " Fine-tune a lightweight MobileNetV2 classifier achieving ≥ 90% accuracy in distinguishing Structural from Finishing phases, deployed via a FastAPI backend and interactive Next.js dashboard.")
    ]
    for title, desc in objs:
        bp = doc.add_paragraph(style='List Bullet')
        r = bp.add_run(title)
        r.bold = True
        bp.add_run(desc)

    # 3. Proposed System
    h = doc.add_paragraph()
    run = h.add_run("3. Proposed System")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "OptiBuild provides an end-to-end scheduling and financial risk management platform for construction developers and project engineers. The system ingests project scope parameters (gross area, floor count, target delivery date) or extracts structured data from MahaRERA registration PDFs to generate an initial Work Breakdown Structure (WBS). The core engine schedules tasks subject to daily crew limits, provides visual Gantt chart tracking, validates weekly on-site progress via photo uploads, and provides automated financial advice when schedule deviations occur."
    )

    p = doc.add_paragraph()
    p.add_run("Key Features and Novelty:").bold = True

    features = [
        ("Statutory Financial Optimization: ", "First project management framework to incorporate Indian statutory compensation laws (MahaRERA Section 18) directly into schedule crashing calculations."),
        ("Dual Heuristic-Exact Optimization: ", "Combines fast GA metaheuristics for operational daily scheduling with exact CP-SAT solvers for rigorous optimality gap benchmarking."),
        ("Lightweight Closed-Loop Vision Feedback: ", "Replaces heavy 3D BIM/YOLO setups with an efficient MobileNetV2 edge classifier supported by human review fallbacks.")
    ]
    for feat, fdesc in features:
        bp = doc.add_paragraph(style='List Bullet')
        bp.add_run(feat).bold = True
        bp.add_run(fdesc)

    # 4. Methodology / Approach
    h = doc.add_paragraph()
    run = h.add_run("4. Methodology / Approach")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    steps = [
        ("1. Scope Ingestion & WBS Generation: ", "Ingest project metadata (area, floors, flats, budget) and generate parametric activity durations, predecessors, and labor crew demands."),
        ("2. Precedence Analysis (CPM): ", "Construct the activity DAG using NetworkX; execute forward and backward passes to determine Early Start (ES), Late Finish (LF), and total float (TF). Identify the critical path."),
        ("3. Resource-Constrained GA Scheduling: ", "Encode tasks as topological chromosome permutations in DEAP. Apply crossover, mutation, and Serial Schedule Generation Scheme (SSGS) to ensure daily labor limits are respected."),
        ("4. Exact Solver Benchmarking: ", "Formulate the scheduling problem in Google OR-Tools CP-SAT using interval variables and the AddCumulative constraint to compute the mathematically optimal makespan and runtime gap."),
        ("5. Progress Sensing & Delay Calculation: ", "Ingest site photo logs; run MobileNetV2 inference to verify stage completion. If site milestones lag behind schedule, calculate delay duration."),
        ("6. Financial Arbitrator Formulation: ", "Compute statutory liability: Penalty_RERA = Amount Collected × (SBI MCLR + 2%) × (Delay Days / 365). Compare against critical activity crash slope: S_i = (C_crash - C_normal) / (D_normal - D_crash). Output optimal strategy: Crash Critical Activities if total crash cost < Penalty_RERA, else Accept Statutory Penalty."),
        ("7. Interactive Dashboard: ", "Render interactive Gantt charts, resource histograms, and cost-vs-penalty analytics via a Next.js web application.")
    ]
    for s_title, s_desc in steps:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.add_run(s_title).bold = True
        p.add_run(s_desc)

    # 5. Expected Outcomes
    h = doc.add_paragraph()
    run = h.add_run("5. Expected Outcomes")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    outcomes = [
        ("Technical Deliverables: ", "Standalone Python scheduling engine combining NetworkX CPM, DEAP GA, and Google OR-Tools CP-SAT; automated MahaRERA Section 18 financial crash-vs-penalty optimizer module; lightweight MobileNetV2 PyTorch model for binary stage classification; full-stack web application with RESTful FastAPI backend and interactive Next.js dashboard."),
        ("Industry & User Benefits: ", "Enables real estate developers to avoid statutory non-compliance penalties through data-driven scheduling recovery plans; provides site engineers with an intuitive web tool for tracking daily crew allocations and milestone progress.")
    ]
    for o_title, o_desc in outcomes:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.add_run(o_title).bold = True
        p.add_run(o_desc)

    # 6. Applications
    h = doc.add_paragraph()
    run = h.add_run("6. Applications")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    apps = [
        ("Real Estate Developers & Builders: ", "Optimal project duration scheduling and financial risk management under MahaRERA compliance."),
        ("Project Management Consultants (PMC): ", "Rapid what-if scenario simulation when labor shortages or material procurement bottlenecks arise."),
        ("Academic Research in Operations Research: ", "Benchmarking dataset evaluating metaheuristic GA performance against exact CP-SAT solvers on civil engineering project instances.")
    ]
    for a_title, a_desc in apps:
        bp = doc.add_paragraph(style='List Bullet')
        bp.add_run(a_title).bold = True
        bp.add_run(a_desc)

    # 7. Future Scope
    h = doc.add_paragraph()
    run = h.add_run("7. Future Scope")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    scopes = [
        ("Multi-Project Resource Sharing: ", "Expanding the GA engine to balance mobile equipment (cranes, concrete pumps) across multiple concurrent project sites."),
        ("Automated Weather & Supply Chain Risk Ingestion: ", "Incorporating monsoon precipitation forecasts and cement/steel price volatility indices into stochastic schedule models."),
        ("Mobile PWA Integration: ", "Developing a Progressive Web Application (PWA) with offline-first caching for site engineers working in low-connectivity jobsite environments.")
    ]
    for sc_title, sc_desc in scopes:
        bp = doc.add_paragraph(style='List Bullet')
        bp.add_run(sc_title).bold = True
        bp.add_run(sc_desc)

    # 8. References
    h = doc.add_paragraph()
    run = h.add_run("8. References")
    run.font.size = Pt(14)
    run.font.bold = True
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)

    refs = [
        "[1] J. E. Kelley and M. R. Walker, \"Critical-path planning and scheduling,\" in IRE-AIEE-ACM '59 (Eastern) Papers, 1959, pp. 160–173.",
        "[2] R. Kolisch and A. Sprecher, \"PSPLIB - A project scheduling problem library,\" European Journal of Operational Research, vol. 96, no. 1, pp. 205–216, 1996.",
        "[3] S. Hartmann, \"A competitive genetic algorithm for resource-constrained project scheduling,\" Naval Research Logistics, vol. 45, no. 7, pp. 733–750, 1998.",
        "[4] S. S. Leu and C. H. Yang, \"GA-based multicriteria optimal model for construction scheduling,\" Journal of Construction Engineering and Management, vol. 125, no. 6, pp. 420–427, 1999.",
        "[5] T. Hegazy, \"Optimization of construction time-cost trade-off analysis using genetic algorithms,\" Canadian Journal of Civil Engineering, vol. 26, no. 6, pp. 685–697, 1999.",
        "[6] H. Li and P. E. D. Love, \"Using improved genetic algorithms to facilitate time-cost optimization,\" Journal of Construction Engineering and Management, vol. 123, no. 3, pp. 233–237, 1997.",
        "[7] R. Sonmez, \"Discrete time-cost trade-off with a genetic algorithm and exact branch-and-bound method,\" Journal of Computing in Civil Engineering, vol. 25, no. 6, pp. 478–483, 2011.",
        "[8] A. Schutt, P. J. Stuckey, T. Feydy, and M. G. Wallace, \"Solving RCPSP/max by lazy clause generation,\" Journal of Scheduling, vol. 16, no. 3, pp. 273–289, 2013.",
        "[9] L. Perron and V. Furnon, \"OR-Tools user's guide: Constraint programming and satisfiability with CP-SAT,\" Google Developers Technical Documentation, 2020.",
        "[10] H. Doloi, A. Sawhney, K. C. Iyer, and S. Rentala, \"Analysing factors affecting delays in Indian construction projects,\" International Journal of Project Management, vol. 30, no. 4, pp. 479–489, 2012.",
        "[11] A. Jain and A. Prakash, \"Optimizing contractor's accruals under penalty imposition due to delays,\" International Journal of Construction Management, pp. 1–12, 2023.",
        "[12] Government of Maharashtra, Real Estate (Regulation and Development) Act, 2016 - Section 18: Return of Amount and Compensation, The Gazette of India, Act No. 16 of 2016.",
        "[13] M. Sandler, A. Howard, M. Zhu, A. Zhmoginov, and L.-C. Chen, \"MobileNetV2: Inverted residuals and linear bottlenecks,\" in Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR), 2018, pp. 4510–4520.",
        "[14] A. Rashidi, M. H. Sigari, and M. Fathi, \"Construction jobsite image classification using edge computing framework,\" Sensors, vol. 24, no. 4, pp. 1150–1168, 2024.",
        "[15] A. Mahendra, M. A. Wibowo, and J. U. D. Hatmoko, \"Construction project scheduling optimization with time-cost trade-off based on genetic algorithm in Python,\" Journal of Social Research, vol. 4, no. 2, pp. 512–524, 2025."
    ]
    for r in refs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(r)
        run.font.size = Pt(10)

    out_path = r"d:\Opti Build\docs\OptiBuild_Stage1_Synopsis.docx"
    doc.save(out_path)
    print(f"Successfully generated {out_path}")

if __name__ == "__main__":
    build_synopsis()
