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

def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
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
        f'<w:top w:val="{val}" w:sz="6" w:space="0" w:color="1E3A8A"/>'
        f'<w:bottom w:val="{val}" w:sz="6" w:space="0" w:color="1E3A8A"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_ieee_paper_docx():
    doc = docx.Document()
    
    # 0.75 in margins for IEEE conference style
    for s in doc.sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)

    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(10)
    font.color.rgb = RGBColor(17, 24, 39)
    style.paragraph_format.line_spacing = 1.15
    style.paragraph_format.space_after = Pt(4)

    # Title
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run("Resource-Constrained Construction Project Scheduling with Statutory Delay-Penalty Optimization: A Comprehensive Literature Survey")
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 58, 138)

    # Authors
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run("Bhushan V. Bhosale¹, Divyal Patel², Chaitanya Ghorpade³, Aniket Jadhav⁴")
    run.font.size = Pt(11)
    run.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(18)
    run = p.add_run("Department of Computer Engineering, Savitribai Phule Pune University (SPPU)\nGenba Sopanrao Moze College of Engineering, Balewadi, Pune, Maharashtra, India\nEmails: {bhosalebhushanvijay, divyal, chaitanya, aniket}@optibuild.edu")
    run.font.size = Pt(9.5)
    run.font.italic = True
    run.font.color.rgb = RGBColor(75, 85, 99)

    # Abstract Box
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(7.0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    ap = cell.paragraphs[0]
    ap.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_abs = ap.add_run("Abstract—")
    r_abs.font.bold = True
    r_abs.font.size = Pt(9.5)
    
    r_text = ap.add_run(
        "Civil infrastructure and multi-story real estate projects routinely encounter execution slippage, culminating in substantial financial detriments. Under emerging statutory regimes such as India's Real Estate Regulatory Authority (MahaRERA Section 18), unmitigated delays impose statutory compounding interest penalties (SBI MCLR + 2%) payable to allottees. While modern project planning relies on the Critical Path Method (CPM) and metaheuristics for the Resource-Constrained Project Scheduling Problem (RCPSP), contemporary literature consistently overlooks statutory financial penalty regimes within crashing trade-off mechanisms. Furthermore, practical on-site schedule feedback remains decoupled from optimization pipelines. This paper conducts a rigorous, multi-faceted literature survey across eighteen seminal and contemporary works spanning: (i) CPM precedence networks and scheduling fundamentals, (ii) Genetic Algorithm (GA) formulations for multi-mode and resource-constrained scheduling, (iii) exact constraint programming formulations utilizing Google OR-Tools CP-SAT and Lazy Clause Generation, (iv) delay penalty economics and contractor accrual behavior, and (v) edge-deployable computer vision architectures (MobileNetV2) for non-intrusive progress verification. Through comparative synthesis, we delineate critical methodological voids in state-of-the-art frameworks and articulate the algorithmic architecture of OptiBuild—a unified decision support engine harmonizing DEAP-based GA metaheuristics, CP-SAT exact benchmark verification, statutory penalty-versus-crashing arbitration, and lightweight visual phase validation."
    )
    r_text.font.size = Pt(9.5)

    kp = cell.add_paragraph()
    kp.paragraph_format.space_before = Pt(6)
    r_k = kp.add_run("Keywords—")
    r_k.font.bold = True
    r_k.font.size = Pt(9)
    r_k_val = kp.add_run("RCPSP, Critical Path Method (CPM), Genetic Algorithm (GA), CP-SAT Solver, MahaRERA Section 18, Time-Cost Trade-Off (TCTP), Edge Computer Vision, MobileNetV2.")
    r_k_val.font.size = Pt(9)
    r_k_val.font.italic = True

    def add_sec(title):
        h = doc.add_paragraph()
        run = h.add_run(title)
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)

    def add_subsec(title):
        h = doc.add_paragraph()
        run = h.add_run(title)
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(31, 41, 55)
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(3)

    # I. INTRODUCTION
    add_sec("I. INTRODUCTION")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Capital infrastructure and residential development ventures across developing economies, particularly India, are severely afflicted by chronic schedule overruns. Empirical investigations into Indian infrastructure initiatives establish that over 70% of active public and commercial building developments exceed planned delivery baselines [10]. In response to consumer vulnerabilities arising from indefinite completion deferrals, statutory frameworks have instituted mandatory financial indemnities. Specifically, under Section 18 of the Real Estate (Regulation and Development) Act (MahaRERA) [12], registered builders exceeding published project targets must compensate purchasers with recurring monthly interest computed at the State Bank of India's highest Marginal Cost of Funds Based Lending Rate (MCLR) augmented by an incremental 200 basis points (SBI MCLR + 2%).\n\n"
        "From a computational perspective, balancing structural deadlines against constrained crew supplies constitutes an instance of the Resource-Constrained Project Scheduling Problem (RCPSP), established as strongly NP-hard in combinatorial optimization [2, 3]. Traditional commercial project management suites, including Primavera P6 and Microsoft Project, furnish deterministic bar charting and rudimentary resource-leveling heuristics. However, they lack automated combinatorial re-scheduling engines and dynamic monetary arbitration mechanisms capable of contrasting crash acceleration expenditures against statutory non-completion liabilities [11]."
    )

    # II. CPM PRECEDENCE
    add_sec("II. CPM PRECEDENCE AND SCHEDULING FOUNDATIONS")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "The formalization of activity precedence networks originates in the early work of Kelley and Walker [1], who introduced the Critical Path Method (CPM). In standard CPM formulations, an enterprise is abstracted as a Directed Acyclic Graph (DAG) G = (V, E), where V designates the discrete activity set and directed edges E capture finish-to-start dependencies. Dual forward and backward passes compute Early Start/Finish and Late Start/Finish times; activities with total float TF_i = 0 define the critical path. While classical CPM offers O(|V| + |E|) traversal efficiency, its chief limitation is the presumption of infinite resource elasticity. Kolisch and Sprecher [2] standardized resource-bound testing with the PSPLIB benchmark library, parameterized by Network Complexity (NC), Resource Factor (RF), and Resource Strength (RS)."
    )

    # III. GENETIC ALGORITHMS
    add_sec("III. GENETIC ALGORITHMS FOR RCPSP AND TIME-COST TRADE-OFF")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Because RCPSP and discrete Time-Cost Trade-Off Problems (TCTP) resist polynomial-time exact solutions, metaheuristics have received intensive focus.\n\n"
        "Hartmann [3] introduced permutation-based genetic representation evaluated through a Serial Schedule Generation Scheme (SSGS). Rather than directly manipulating calendar timestamps, chromosomes represent topological activity orderings decoded into earliest resource-feasible time windows. Leu and Yang [4] formulated multi-criteria GA combining duration reduction with resource leveling using resource moments. Hegazy [5] formulated discrete TCTP mechanics using genetic search, calculating activity crash slopes: S_i = (C_crash - C_normal) / (D_normal - D_crash). Li and Love [6] enhanced search efficiency using adaptive penalty functions. Recently, Mahendra et al. [15] validated Python-based GA implementations combining NetworkX DAGs with DEAP, reporting a 34.82% duration compression and a 3.49% overall cost reduction."
    )

    # IV. EXACT SOLVERS
    add_sec("IV. EXACT SOLVERS AND CONSTRAINT BENCHMARKING")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "While genetic metaheuristics provide rapid convergence, they cannot verify whether a generated makespan is mathematically optimal or resides within a known optimality gap.\n\n"
        "Schutt et al. [8] achieved breakthrough exact performance on RCPSP by implementing Lazy Clause Generation (LCG), uniting finite domain propagation with Boolean Satisfiability (SAT) solvers. Perron and Furnon [9] expanded LCG principles within Google OR-Tools CP-SAT, providing exact solving through interval variables and the AddCumulative global constraint. Sonmez [7] benchmarked GA against exact Branch-and-Bound, showing that exact methods guarantee optimality on networks up to 50 activities but suffer combinatorial explosion on 100+ task networks, validating an architecture where GA generates fast operational schedules while CP-SAT verifies optimality."
    )

    # V. STATUTORY DELAY PENALTIES
    add_sec("V. STATUTORY DELAY PENALTIES AND CRASHING ECONOMICS")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Doloi et al. [10] isolated structural causes of Indian construction delays, identifying cash-flow deficits and late approvals as primary factors. Jain and Prakash [11] demonstrated that when the marginal cost slope of remaining critical tasks exceeds daily contractual penalties, the profit-maximizing course is to accept liquidated damages rather than incur overtime labor premiums. Vaziri et al. [16] modeled stochastic time-cost optimization using Conditional Value at Risk (CVaR). Crucially, Section 18 of the MahaRERA Act [12] mandates compounding interest: Penalty_RERA = Amount Collected × (SBI MCLR + 2%) × (Delay Days / 365). Because collected capital often spans tens to hundreds of crores, daily statutory liability accrues rapidly, requiring automated optimization."
    )

    # VI. EDGE COMPUTER VISION
    add_sec("VI. EDGE COMPUTER VISION FOR PROGRESS VERIFICATION")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Yang et al. [17] tested deep convolutional object detectors (YOLOv7, Faster R-CNN) on construction jobsites, showing that while accurate, they demand high-end GPU backends and degrade under dynamic site dust and occlusions. Sandler et al. [13] introduced MobileNetV2 with inverted residual blocks, reducing compute and parameter footprint by over 80%. Rashidi et al. [14] evaluated quantized MobileNetV2 models for edge-based jobsite image classification, achieving over 94% accuracy with inference latency under 45 ms. This demonstrates that binary phase classification (Structural vs. Finishing) provides a reliable progress signal on mobile hardware without the annotation overhead of complex object detection models."
    )

    # VII. COMPARATIVE ANALYSIS & TABLE
    add_sec("VII. COMPARATIVE ANALYSIS AND IDENTIFIED RESEARCH GAPS")
    p = doc.add_paragraph()
    p.add_run("Table I summarizes the comparative analysis across surveyed literature:")

    # Comparative Table
    matrix_data = [
        ("Hartmann [3]", "Permutation GA + SSGS", "Yes", "No", "No", "No", "No", "Makespan only; no financial crash model"),
        ("Leu & Yang [4]", "Multi-Criteria GA", "Yes", "Yes", "No", "No", "No", "Two-stage leveling risks local optima"),
        ("Hegazy [5]", "Discrete TCTP GA", "No", "Yes", "No", "No", "No", "Omits renewable crew capacity limits"),
        ("Li & Love [6]", "Adaptive Penalty GA", "No", "Yes", "No", "No", "No", "Uses arbitrary non-legal penalty weights"),
        ("Sonmez [7]", "Hybrid GA + B&B", "No", "Yes", "No", "Yes", "No", "Combinatorial explosion on >100 tasks"),
        ("Schutt et al. [8]", "Lazy Clause Gen. (LCG)", "Yes", "No", "No", "Yes", "No", "Theoretical; lacks business penalty logic"),
        ("Doloi et al. [10]", "Regression Analysis", "No", "No", "No", "No", "No", "Diagnostic survey; no scheduling tool"),
        ("Jain & Prakash [11]", "Linear Programming", "No", "Yes", "Yes*", "No", "No", "Static case study; lacks rescheduling"),
        ("Rashidi et al. [14]", "MobileNetV2 on Edge", "No", "No", "No", "No", "Yes", "Isolated vision; decoupled from CPM/GA"),
        ("OptiBuild (Proposed)", "DEAP GA + CP-SAT + CV", "Yes", "Yes", "Yes**", "Yes", "Yes", "Unified: RCPSP + MahaRERA + Vision")
    ]

    tbl = doc.add_table(rows=len(matrix_data) + 1, cols=8)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl)

    headers = ["Paper", "Methodology", "Res.", "TCTP", "Pen.", "Exact", "CV", "Major Limitations"]
    col_widths = [Inches(1.2), Inches(1.3), Inches(0.4), Inches(0.4), Inches(0.4), Inches(0.4), Inches(0.4), Inches(2.0)]

    hdr_row = tbl.rows[0]
    for idx, (h_text, w) in enumerate(zip(headers, col_widths)):
        cell = hdr_row.cells[idx]
        cell.width = w
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h_text)
        run.font.bold = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, row_data in enumerate(matrix_data):
        row = tbl.rows[r_idx + 1]
        is_optibuild = (r_idx == len(matrix_data) - 1)
        bg_color = "EFF6FF" if is_optibuild else ("F9FAFB" if r_idx % 2 == 1 else "FFFFFF")
        
        for c_idx, (val, w) in enumerate(zip(row_data, col_widths)):
            cell = row.cells[c_idx]
            cell.width = w
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=60, bottom=60, left=60, right=60)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.05
            p.paragraph_format.space_after = Pt(0)
            
            if c_idx in [2, 3, 4, 5, 6]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT

            run = p.add_run(val)
            run.font.size = Pt(8)
            if is_optibuild:
                run.font.bold = True
                run.font.color.rgb = RGBColor(30, 58, 138)
            elif c_idx == 0:
                run.font.bold = True

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    run = p.add_run("* Evaluates contract-specific liquidated damages (LD), not statutory consumer protection laws.\n** Formally integrates statutory MahaRERA Section 18 penalty computation (SBI MCLR + 2%) into crashing trade-off logic.")
    run.font.size = Pt(8)
    run.font.italic = True
    run.font.color.rgb = RGBColor(107, 114, 128)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Identified Gaps: (1) Absence of statutory regulatory penalty integration in scheduling models; (2) Dichotomy between fast heuristic metaheuristics and exact mathematical solver verification; (3) Decoupling of automated edge visual site feedback from dynamic project scheduling engines."
    )

    # VIII. OPTIBUILD ARCHITECTURE & CONCLUSION
    add_sec("VIII. OPTIBUILD ARCHITECTURE AND CONCLUSION")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "The OptiBuild framework directly resolves these literature limitations through five cohesive modules: (i) NetworkX CPM DAG engine for topological dependency and critical float isolation; (ii) DEAP Resource-Constrained Genetic Algorithm enforcing renewable labor limits via SSGS; (iii) Google OR-Tools CP-SAT solver establishing exact benchmark lower-bound makespans; (iv) MahaRERA Section 18 decision engine contrasting activity crash slopes against statutory penalties; and (v) MobileNetV2 binary classifier verifying on-site structural progress. This literature survey provides a rigorous academic foundation for OptiBuild, bridging the divide between theoretical RCPSP algorithms and statutory Indian construction realities."
    )

    # REFERENCES
    add_sec("REFERENCES")
    refs = [
        "[1] J. E. Kelley and M. R. Walker, \"Critical-path planning and scheduling,\" in IRE-AIEE-ACM '59 Papers, 1959, pp. 160–173.",
        "[2] R. Kolisch and A. Sprecher, \"PSPLIB - A project scheduling problem library,\" Eur. J. Oper. Res., vol. 96, no. 1, pp. 205–216, 1996.",
        "[3] S. Hartmann, \"A competitive genetic algorithm for RCPSP,\" Naval Research Logistics, vol. 45, no. 7, pp. 733–750, 1998.",
        "[4] S. S. Leu and C. H. Yang, \"GA-based multicriteria optimal model for construction scheduling,\" ASCE J. Constr. Eng. Manage., vol. 125, no. 6, pp. 420–427, 1999.",
        "[5] T. Hegazy, \"Optimization of construction time-cost trade-off analysis using GA,\" Can. J. Civ. Eng., vol. 26, no. 6, pp. 685–697, 1999.",
        "[6] H. Li and P. E. D. Love, \"Using improved genetic algorithms to facilitate time-cost optimization,\" ASCE J. Constr. Eng. Manage., vol. 123, no. 3, pp. 233–237, 1997.",
        "[7] R. Sonmez, \"Discrete time-cost trade-off with a genetic algorithm and exact branch-and-bound method,\" ASCE J. Comput. Civ. Eng., vol. 25, no. 6, pp. 478–483, 2011.",
        "[8] A. Schutt, P. J. Stuckey, T. Feydy, and M. G. Wallace, \"Solving RCPSP/max by lazy clause generation,\" J. Scheduling, vol. 16, no. 3, pp. 273–289, 2013.",
        "[9] L. Perron and V. Furnon, \"OR-Tools user's guide: CP-SAT solver,\" Google Developers Technical Documentation, 2020.",
        "[10] H. Doloi, A. Sawhney, K. C. Iyer, and S. Rentala, \"Analysing factors affecting delays in Indian construction projects,\" Int. J. Proj. Manage., vol. 30, no. 4, pp. 479–489, 2012.",
        "[11] A. Jain and A. Prakash, \"Optimizing contractor's accruals under penalty imposition due to delays,\" Int. J. Constr. Manage., pp. 1–12, 2023.",
        "[12] Government of Maharashtra, Real Estate (Regulation and Development) Act, 2016 - Section 18: Return of Amount and Compensation, The Gazette of India, Act No. 16 of 2016.",
        "[13] M. Sandler, A. Howard, M. Zhu, A. Zhmoginov, and L.-C. Chen, \"MobileNetV2: Inverted residuals and linear bottlenecks,\" in Proc. CVPR, 2018, pp. 4510–4520.",
        "[14] A. Rashidi, M. H. Sigari, and M. Fathi, \"Construction jobsite image classification using edge computing framework,\" Sensors, vol. 24, no. 4, pp. 1150–1168, 2024.",
        "[15] A. Mahendra, M. A. Wibowo, and J. U. D. Hatmoko, \"Construction project scheduling optimization with time-cost trade-off based on genetic algorithm in Python,\" J. Social Research, vol. 4, no. 2, pp. 512–524, 2025.",
        "[16] S. M. Vaziri, P. Shakibabarough, J. Valizadeh, and S. H. Zolfani, \"Stochastic risk-aware time-cost optimization of construction schedules,\" Buildings, vol. 14, no. 1, pp. 1–25, 2024.",
        "[17] J. Yang, A. Wilde, K. Menzel, M. Z. Sheikh, and B. Kuznetsov, \"Computer vision for construction progress monitoring: A real-time object detection approach,\" arXiv:2305.18043, 2023."
    ]
    for r in refs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.05
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(r)
        run.font.size = Pt(8.5)

    out_path = r"d:\Opti Build\research\literature-survey\OptiBuild_Literature_Survey_IEEE.docx"
    doc.save(out_path)
    print(f"Successfully generated {out_path}")

if __name__ == "__main__":
    build_ieee_paper_docx()
