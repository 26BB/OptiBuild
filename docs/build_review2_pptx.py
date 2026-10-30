import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    NAVY = RGBColor(30, 58, 138)       # #1E3A8A Primary Brand
    DARK = RGBColor(17, 24, 39)        # #111827 Text Dark
    MUTED = RGBColor(107, 114, 128)    # #6B7280 Muted Gray
    BG_LIGHT = RGBColor(248, 250, 252) # #F8FAFC Slide BG
    WHITE = RGBColor(255, 255, 255)
    BLUE_ACCENT = RGBColor(37, 99, 235)# #2563EB
    CARD_BG = RGBColor(255, 255, 255)
    CARD_BORDER = RGBColor(226, 232, 240)
    SUCCESS = RGBColor(22, 101, 52)     # #166534 Green

    def add_header(slide, title_text, category_text="410248: PROJECT WORK STAGE – I | REVIEW-II"):
        # Header banner
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.9))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p0 = tf.paragraphs[0]
        p0.text = category_text.upper()
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = BLUE_ACCENT
        p0.space_after = Pt(2)

        p1 = tf.add_paragraph()
        p1.text = title_text
        p1.font.size = Pt(22)
        p1.font.bold = True
        p1.font.color.rgb = NAVY

    # -------------------------------------------------------------
    # SLIDE 1: TITLE SLIDE
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    
    bg = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_LIGHT
    bg.line.fill.background()

    # College info
    tb = slide1.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(1.2))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = "GENBA SOPANRAO MOZE COLLEGE OF ENGINEERING, BALEWADI, PUNE"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = NAVY
    
    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.text = "Department of Computer Engineering | Savitribai Phule Pune University (SPPU)\nAcademic Year 2026–2027"
    p2.font.size = Pt(11)
    p2.font.color.rgb = MUTED

    # Project Title Card
    card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(2.1), Inches(10.933), Inches(2.2))
    card.fill.solid()
    card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = BLUE_ACCENT
    card.line.width = Pt(2)
    
    ctf = card.text_frame
    ctf.word_wrap = True
    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
    
    cp1 = ctf.paragraphs[0]
    cp1.alignment = PP_ALIGN.CENTER
    cp1.text = "410248: PROJECT WORK STAGE – I (REVIEW-II PRESENTATION)"
    cp1.font.size = Pt(11)
    cp1.font.bold = True
    cp1.font.color.rgb = BLUE_ACCENT
    cp1.space_after = Pt(6)

    cp2 = ctf.add_paragraph()
    cp2.alignment = PP_ALIGN.CENTER
    cp2.text = "OptiBuild: Resource-Constrained Construction Project Scheduling\nwith Statutory Delay-Penalty Optimization"
    cp2.font.size = Pt(24)
    cp2.font.bold = True
    cp2.font.color.rgb = NAVY

    # Presenters & Guide Info
    info_box = slide1.shapes.add_textbox(Inches(1.5), Inches(4.7), Inches(10.333), Inches(2.2))
    itf = info_box.text_frame
    itf.word_wrap = True

    ip1 = itf.paragraphs[0]
    ip1.alignment = PP_ALIGN.CENTER
    ip1.text = "Project Team Members (B.E. Computer Engineering):"
    ip1.font.size = Pt(12)
    ip1.font.bold = True
    ip1.font.color.rgb = DARK
    ip1.space_after = Pt(4)

    ip2 = itf.add_paragraph()
    ip2.alignment = PP_ALIGN.CENTER
    ip2.text = "Bhushan V. Bhosale (4101)  •  Divyal Patel (4102)  •  Chaitanya Ghorpade (4103)  •  Aniket Jadhav (4104)"
    ip2.font.size = Pt(13)
    ip2.font.bold = True
    ip2.font.color.rgb = BLUE_ACCENT
    ip2.space_after = Pt(12)

    ip3 = itf.add_paragraph()
    ip3.alignment = PP_ALIGN.CENTER
    ip3.text = "Under the Guidance of: Prof. [Guide Name], Department of Computer Engineering"
    ip3.font.size = Pt(12)
    ip3.font.italic = True
    ip3.font.color.rgb = DARK

    # -------------------------------------------------------------
    # SLIDE 2: OUTLINE
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Presentation Outline & Structure")
    
    items = [
        ("01", "Project Context & Problem Domain", "Indian real estate construction delays & MahaRERA Section 18 statutory liabilities."),
        ("02", "Problem Statement & Locked Guardrails", "Formal RCPSP problem formulation, NP-hardness, and strict viva boundaries."),
        ("03", "SMART Project Objectives", "5 measurable targets spanning CPM, GA, CP-SAT, Penalty Engine, and MobileNetV2."),
        ("04", "Comprehensive Literature Survey", "Synthesis of 22 peer-reviewed papers across 5 functional optimization clusters."),
        ("05", "Comparative Analysis Matrix", "Benchmarking existing systems (Primavera, Procore, Research GAs) vs. OptiBuild."),
        ("06", "System Architecture & The Hero Module", "Unified dataflow connecting NetworkX CPM, DEAP GA, OR-Tools CP-SAT, and CV."),
        ("07", "Mathematical Model & Formulation", "SPPU 7-Tuple Set Theory, CPM forward/backward passes, and crash slope arbitration."),
        ("08", "Implementation Status & Passing Tests", "Current progress with 14/14 automated Pytest unit and integration tests passing."),
        ("09", "Modular Team Division & Viva Defense", "Clear academic ownership split for Divyal, Chaitanya, Bhushan, and Aniket.")
    ]

    for idx, (num, title, desc) in enumerate(items):
        col = idx % 3
        row = idx // 3
        x = Inches(0.8 + col * 3.9)
        y = Inches(1.6 + row * 1.8)
        
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.7), Inches(1.6))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = CARD_BORDER
        
        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_top = Inches(0.15)
        ctf.margin_left = Inches(0.15)
        
        p1 = ctf.paragraphs[0]
        p1.text = f"{num}. {title}"
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = NAVY
        p1.space_after = Pt(4)

        p2 = ctf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = MUTED

    # -------------------------------------------------------------
    # SLIDE 3: PROBLEM DOMAIN & MAHARERA
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Project Background & Real-World Domain Crisis")

    # Left card
    card_l = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    card_l.fill.solid()
    card_l.fill.fore_color.rgb = WHITE
    card_l.line.color.rgb = CARD_BORDER
    ltf = card_l.text_frame
    ltf.word_wrap = True
    ltf.margin_left = ltf.margin_right = ltf.margin_top = Inches(0.25)

    p = ltf.paragraphs[0]
    p.text = "The Indian Construction Delay Crisis"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)

    pts = [
        ("70%+ Overruns: ", "Empirical civil research (Doloi et al., 2012) reveals over 70% of multi-story projects in India exceed contracted completion baselines."),
        ("Multi-Crore Capital At Stake: ", "Projects accrue tens or hundreds of crores in buyer advances. Project managers lack dynamic algorithmic rescheduling tools."),
        ("Static Tools Fail: ", "Commercial software (Primavera P6, MS Project) only produces manual bar charts; they cannot automatically balance crashing costs against delay penalties.")
    ]
    for b_title, b_desc in pts:
        bp = ltf.add_paragraph()
        bp.space_after = Pt(8)
        r = bp.add_run()
        r.text = "• " + b_title
        r.font.bold = True
        r.font.size = Pt(11)
        r.font.color.rgb = DARK
        r2 = bp.add_run()
        r2.text = b_desc
        r2.font.size = Pt(11)
        r2.font.color.rgb = MUTED

    # Right card
    card_r = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    card_r.fill.solid()
    card_r.fill.fore_color.rgb = RGBColor(239, 246, 255)
    card_r.line.color.rgb = BLUE_ACCENT
    rtf = card_r.text_frame
    rtf.word_wrap = True
    rtf.margin_left = rtf.margin_right = rtf.margin_top = Inches(0.25)

    p = rtf.paragraphs[0]
    p.text = "MahaRERA Section 18: Mandatory Legal Liability"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)

    pts_r = [
        ("Statutory Interest Mandate: ", "Builders who exceed registered deadlines must compensate homebuyers monthly interest at SBI Highest MCLR + 2% per annum on total collected funds."),
        ("The Mathematical Equation: ", "Penalty = Amount Collected × (SBI MCLR + 2%) × (Delay Days / 365). Daily accumulation routinely exceeds tens of thousands of rupees."),
        ("The OptiBuild Solution: ", "Algorithmic decision engine that computes activity crash slopes vs. statutory penalties to guide builders whether to crash critical tasks or accept the penalty.")
    ]
    for b_title, b_desc in pts_r:
        bp = rtf.add_paragraph()
        bp.space_after = Pt(8)
        r = bp.add_run()
        r.text = "• " + b_title
        r.font.bold = True
        r.font.size = Pt(11)
        r.font.color.rgb = NAVY
        r2 = bp.add_run()
        r2.text = b_desc
        r2.font.size = Pt(11)
        r2.font.color.rgb = DARK

    # -------------------------------------------------------------
    # SLIDE 4: LITERATURE SURVEY MATRIX
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Literature Survey & Comparative Analysis Matrix")

    table_shape = slide4.shapes.add_table(11, 7, Inches(0.8), Inches(1.6), Inches(11.733), Inches(5.2))
    tbl = table_shape.table

    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(2.2)
    tbl.columns[2].width = Inches(1.1)
    tbl.columns[3].width = Inches(1.1)
    tbl.columns[4].width = Inches(1.1)
    tbl.columns[5].width = Inches(1.1)
    tbl.columns[6].width = Inches(2.933)

    t_headers = ["Paper / Author", "Methodology / Model", "Resource", "TCTP", "Penalty", "Exact", "Identified Research Void"]
    for c_idx, h_text in enumerate(t_headers):
        cell = tbl.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = h_text
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = WHITE

    rows_data = [
        ("Hartmann (1998)", "Permutation GA + SSGS", "Yes", "No", "No", "No", "Makespan only; no financial crash model"),
        ("Leu & Yang (1999)", "Multi-Criteria GA", "Yes", "Yes", "No", "No", "Two-stage leveling risks local optima"),
        ("Hegazy (1999)", "Discrete TCTP GA", "No", "Yes", "No", "No", "Omits renewable crew capacity limits"),
        ("Li & Love (1997)", "Adaptive Penalty GA", "No", "Yes", "No", "No", "Uses arbitrary non-legal penalty weights"),
        ("Schutt et al. (2013)", "Lazy Clause Gen. (LCG)", "Yes", "No", "No", "Yes", "Theoretical; no business penalty logic"),
        ("Sonmez (2011)", "Hybrid GA + B&B", "No", "Yes", "No", "Yes", "Combinatorial explosion on >100 tasks"),
        ("Doloi et al. (2012)", "Regression Analysis", "No", "No", "No", "No", "Diagnostic survey; no scheduling tool"),
        ("Jain & Prakash (2023)", "Linear Programming", "No", "Yes", "Yes*", "No", "Static case study; lacks rescheduling"),
        ("Rashidi et al. (2024)", "MobileNetV2 on Edge", "No", "No", "No", "No", "Isolated vision; decoupled from CPM/GA"),
        ("OptiBuild (Proposed)", "DEAP GA + CP-SAT + CV", "Yes", "Yes", "Yes**", "Yes", "Unified: RCPSP + MahaRERA + Vision")
    ]

    for r_idx, r_vals in enumerate(rows_data):
        is_optibuild = (r_idx == len(rows_data) - 1)
        for c_idx, val in enumerate(r_vals):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            if is_optibuild:
                cell.fill.fore_color.rgb = RGBColor(239, 246, 255)
            elif r_idx % 2 == 1:
                cell.fill.fore_color.rgb = RGBColor(249, 250, 251)
            else:
                cell.fill.fore_color.rgb = WHITE

            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9)
            if is_optibuild:
                p.font.bold = True
                p.font.color.rgb = NAVY
            elif c_idx == 0:
                p.font.bold = True
                p.font.color.rgb = DARK
            else:
                p.font.color.rgb = DARK

            if c_idx in [2, 3, 4, 5]:
                p.alignment = PP_ALIGN.CENTER

    # -------------------------------------------------------------
    # SLIDE 5: SYSTEM ARCHITECTURE
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Proposed Architecture: The OptiBuild Hero Module")

    modules = [
        ("1. CPM Precedence DAG Engine", "NetworkX Directed Acyclic Graph", "Traverses topological task dependencies, computes Early/Late passes, and isolates critical float in ≤ 50 ms."),
        ("2. Resource-Constrained GA", "DEAP Heuristic Scheduling", "Chromosome permutations decoded via Serial Schedule Generation Scheme (SSGS) to enforce renewable crew constraints."),
        ("3. CP-SAT Benchmark Validator", "Google OR-Tools Exact Solver", "Employs interval decision variables and AddCumulative global constraints to measure the empirical GA optimality gap."),
        ("4. MahaRERA Penalty Optimizer", "Statutory Delay Decision Engine", "Evaluates activity crash slope (Si) vs. SBI MCLR + 2% interest penalties to formulate concrete build acceleration advice."),
        ("5. Edge Vision Progress Verification", "PyTorch MobileNetV2 Classifier", "Provides fast binary inference (< 45 ms) distinguishing Structural from Finishing phases with human review fallback.")
    ]

    for idx, (m_title, m_tech, m_desc) in enumerate(modules):
        y = Inches(1.5 + idx * 1.05)
        card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.733), Inches(0.95))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = BLUE_ACCENT if idx == 3 else CARD_BORDER
        card.line.width = Pt(1.5 if idx == 3 else 1)

        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_left = Inches(0.25)
        ctf.margin_top = Inches(0.12)

        p1 = ctf.paragraphs[0]
        r1 = p1.add_run()
        r1.text = m_title + "  "
        r1.font.bold = True
        r1.font.size = Pt(12)
        r1.font.color.rgb = NAVY

        r2 = p1.add_run()
        r2.text = "[" + m_tech + "]"
        r2.font.bold = True
        r2.font.size = Pt(10)
        r2.font.color.rgb = BLUE_ACCENT

        p2 = ctf.add_paragraph()
        p2.text = m_desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = MUTED

    # -------------------------------------------------------------
    # SLIDE 6: MATHEMATICAL MODEL
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Mathematical Model (SPPU 7-Tuple Set Theory)")

    box1 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.733), Inches(1.1))
    box1.fill.solid()
    box1.fill.fore_color.rgb = RGBColor(239, 246, 255)
    box1.line.color.rgb = BLUE_ACCENT
    b1tf = box1.text_frame
    b1tf.word_wrap = True
    b1tf.margin_left = Inches(0.2)
    b1tf.margin_top = Inches(0.15)
    
    p = b1tf.paragraphs[0]
    p.text = "System Formal Definition:  S = { I, O, F, DD, NDD, S_success, S_failure }"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(4)

    p2 = b1tf.add_paragraph()
    p2.text = "Inputs (I): User config (Uc), Project constraints (Creq), Task parameters (Pparams)  |  Outputs (O): Optimized schedule (Ropt), Benchmark metrics (Meval)"
    p2.font.size = Pt(10)
    p2.font.color.rgb = DARK

    eqs = [
        ("1. Critical Path Method (CPM)", "ES_i = max(EF_p),  EF_i = ES_i + d_i\nLF_i = min(LS_s),  LS_i = LF_i - d_i\nTotal Float: TF_i = LS_i - ES_i\nCritical Chain: TF_i = 0"),
        ("2. RCPSP Resource Limit", "Daily Crew Demand Bound:\nsum_{i in Active(t)} r_{i,k} <= R_{k,max}\nfor all renewable crew types k\nacross all days t in [0, T]"),
        ("3. MahaRERA Statutory Penalty", "Penalty_RERA = Amount Collected ×\n(SBI MCLR + 2%) × (Delay Days / 365)\nAccrues daily interest liability\npayable to homebuyers on default"),
        ("4. Activity Crash Cost Slope", "Cost Slope: S_i = (C_c - C_n) / (D_n - D_c)\nDecision Engine Rule:\nIf sum(S_i × Δd_i) < Penalty_RERA\n=> CRASH TASK; Else ACCEPT PENALTY")
    ]

    for idx, (eq_title, eq_body) in enumerate(eqs):
        x = Inches(0.8 + idx * 2.95)
        card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.9), Inches(2.8), Inches(3.9))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_right = Inches(0.18)
        ctf.margin_top = Inches(0.15)

        p = ctf.paragraphs[0]
        p.text = eq_title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

        p2 = ctf.add_paragraph()
        p2.text = eq_body
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = DARK

    # -------------------------------------------------------------
    # SLIDE 7: TEAM SPLIT & VIVA OWNERSHIP
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Team Member Modular Division & Viva Defense Split")

    roles = [
        ("Divyal Patel", "Optimization Lead", "app/engine/cpm/\napp/engine/ga/", "CPM Precedence DAG (NetworkX), DEAP Genetic Algorithm chromosome encoding, crossover/mutation operators, and Serial Schedule Generation Scheme (SSGS)."),
        ("Chaitanya Ghorpade", "Benchmark Lead", "app/engine/cpsat/\napp/engine/benchmark/", "Google OR-Tools CP-SAT exact solver modeling, AddCumulative global constraints, and mathematical optimality gap calculation vs. heuristic GA."),
        ("Bhushan Bhosale", "Financial Optimizer", "app/engine/penalty/\nresearch/ & docs/", "MahaRERA Section 18 penalty computation (SBI MCLR + 2%), activity crash slope tradeoff engine, architecture specifications, and SPPU documentation."),
        ("Aniket Jadhav", "Full-Stack & CV Lead", "app/backend/\napp/cv/ & frontend/", "FastAPI REST API routes, Next.js interactive Gantt chart dashboard, and PyTorch MobileNetV2 binary progress verification model.")
    ]

    for idx, (name, role, folder, desc) in enumerate(roles):
        x = Inches(0.8 + idx * 2.95)
        card = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.6), Inches(2.8), Inches(5.2))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = BLUE_ACCENT if idx == 2 else CARD_BORDER
        card.line.width = Pt(1.5 if idx == 2 else 1)

        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_right = Inches(0.18)
        ctf.margin_top = Inches(0.2)

        p = ctf.paragraphs[0]
        p.text = name
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = NAVY

        p_r = ctf.add_paragraph()
        p_r.text = role
        p_r.font.size = Pt(10.5)
        p_r.font.bold = True
        p_r.font.color.rgb = BLUE_ACCENT
        p_r.space_after = Pt(6)

        p_f = ctf.add_paragraph()
        p_f.text = "Owned Codebase:\n" + folder
        p_f.font.size = Pt(9)
        p_f.font.italic = True
        p_f.font.color.rgb = MUTED
        p_f.space_after = Pt(10)

        p_d = ctf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = DARK

    # -------------------------------------------------------------
    # SLIDE 8: CURRENT STATUS & 14 PASSING TESTS
    # -------------------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Current Implementation Status & Verified Test Suite")

    stat_items = [
        ("CPM & GA Engine", "app/engine/cpm/ & ga/", "Verified forward/backward pass & DEAP permutation chromosomes on 20-activity RCC benchmark dataset.", True),
        ("OR-Tools CP-SAT", "app/engine/cpsat/", "Exact solver modeling complete with AddCumulative constraints to measure empirical optimality gap.", True),
        ("MahaRERA Penalty Engine", "app/engine/penalty/", "Accurately compares SBI MCLR + 2% interest penalties against critical-path crash slopes.", True),
        ("FastAPI Backend", "app/backend/routers/", "REST API routes verified for projects, tasks, schedule optimization, and progress telemetry.", True),
        ("MobileNetV2 Classifier", "app/cv/", "Transfer learning pipeline configured for Structural vs. Finishing phase binary image inference.", True),
        ("SPPU Deliverables", "docs/ & research/", "Stage-1 Synopsis, Report Chapter 2, IEEE conference paper draft, and Overleaf ZIP ready.", True)
    ]

    for idx, (title, path, details, done) in enumerate(stat_items):
        col = idx % 2
        row = idx // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.6 + row * 1.45)

        card = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(1.3))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = CARD_BORDER

        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_left = Inches(0.2)
        ctf.margin_top = Inches(0.12)

        p = ctf.paragraphs[0]
        r1 = p.add_run()
        r1.text = "PASS: " + title + "  "
        r1.font.bold = True
        r1.font.size = Pt(12)
        r1.font.color.rgb = NAVY

        r2 = p.add_run()
        r2.text = "[" + path + "]"
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = BLUE_ACCENT

        p2 = ctf.add_paragraph()
        p2.text = details
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = DARK

    # Test Suite Banner at bottom
    tb_banner = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.733), Inches(0.85))
    tb_banner.fill.solid()
    tb_banner.fill.fore_color.rgb = RGBColor(240, 253, 244)
    tb_banner.line.color.rgb = SUCCESS
    
    ttf = tb_banner.text_frame
    ttf.word_wrap = True
    ttf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tp = ttf.paragraphs[0]
    tp.alignment = PP_ALIGN.CENTER
    r = tp.add_run()
    r.text = "Automated Pytest Suite Status:  14 Passed, 0 Failed, 100% Green  (Execution Time: ~21s)"
    r.font.bold = True
    r.font.size = Pt(13)
    r.font.color.rgb = SUCCESS

    # -------------------------------------------------------------
    # SLIDE 9: THANK YOU & Q&A
    # -------------------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    bg = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_LIGHT
    bg.line.fill.background()

    card = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.0), Inches(1.8), Inches(9.333), Inches(3.9))
    card.fill.solid()
    card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = BLUE_ACCENT
    card.line.width = Pt(2)

    ctf = card.text_frame
    ctf.word_wrap = True
    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE

    p1 = ctf.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    p1.text = "Thank You!"
    p1.font.size = Pt(32)
    p1.font.bold = True
    p1.font.color.rgb = NAVY
    p1.space_after = Pt(12)

    p2 = ctf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.text = "OptiBuild: Resource-Constrained Construction Project Scheduling\nwith Statutory Delay-Penalty Optimization"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = BLUE_ACCENT
    p2.space_after = Pt(16)

    p3 = ctf.add_paragraph()
    p3.alignment = PP_ALIGN.CENTER
    p3.text = "Questions & Technical Discussion Invited"
    p3.font.size = Pt(14)
    p3.font.italic = True
    p3.font.color.rgb = DARK

    out_path = r"d:\Opti Build\docs\OptiBuild_Review_II_Presentation.pptx"
    prs.save(out_path)
    print(f"Successfully generated {out_path}")

if __name__ == "__main__":
    create_deck()
