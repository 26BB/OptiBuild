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

def set_table_borders(table, color="9CA3AF", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="E5E7EB"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_chapter2():
    doc = docx.Document()
    
    # 1 inch margins all sides
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

    # Style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(17, 24, 39)
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(6)

    # Header / Chapter Title
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run("Chapter 2")
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 58, 138)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(18)
    run = p.add_run("Literature Survey")
    run.font.size = Pt(20)
    run.font.bold = True
    run.font.color.rgb = RGBColor(17, 24, 39)

    # Sub-header info
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(24)
    run = p.add_run("OptiBuild: Resource-Constrained Construction Project Scheduling with Statutory Delay-Penalty Optimization\nDepartment of Computer Engineering, Genba Sopanrao Moze College of Engineering, Balewadi, Pune")
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.color.rgb = RGBColor(75, 85, 99)

    # Helper function for adding headings
    def add_sec_heading(title):
        h = doc.add_paragraph()
        run = h.add_run(title)
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138)
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)

    def add_subsec_heading(title):
        h = doc.add_paragraph()
        run = h.add_run(title)
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(31, 41, 55)
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)

    # 2.1
    add_sec_heading("2.1 Introduction to the Literature Survey")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Real estate construction in India faces chronic delivery slippage, triggering stringent legal penalties under statutory frameworks like the Real Estate (Regulation and Development) Act (MahaRERA Section 18). While software tools such as Primavera P6, Microsoft Project, and ERP suites assist with baseline tracking, they do not computationally synthesize resource allocation limits with legal and financial penalty liabilities.\n\n"
        "From a computer science perspective, scheduling project tasks under restricted resources is defined as the Resource-Constrained Project Scheduling Problem (RCPSP). RCPSP is a well-known combinatorial optimization challenge proven to be NP-hard. To build an academically sound and practically viable solution, this chapter conducts a structured literature survey across twenty-two peer-reviewed papers and authoritative references organized into five core functional clusters:\n"
        "1. Critical Path Method (CPM) and Baseline Scheduling Foundations\n"
        "2. Genetic Algorithms (GA) and Metaheuristics for RCPSP and Time-Cost Trade-Off (TCTP)\n"
        "3. Exact Solvers, Constraint Satisfaction, and Benchmarking (CP-SAT / LCG)\n"
        "4. Statutory Delay Penalties, Liquidated Damages, and Financial Crashing Economics\n"
        "5. Computer Vision (CV) and Edge Inference for Progress Tracking"
    )

    # 2.2
    add_sec_heading("2.2 Critical Path Method (CPM) and Scheduling Foundations")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Activity dependency networks are historically modeled as Directed Acyclic Graphs (DAG) G = (V, E), pioneered by Kelley and Walker (1959). Tasks V represent project operations, and directed edges E indicate strict sequence constraints.\n"
        "• Forward Sweep: Determines Early Start (ES_i) and Early Finish (EF_i) times by traversing the network from start to finish: ES_i = max_{p in Pred(i)} (EF_p), EF_i = ES_i + d_i.\n"
        "• Backward Sweep: Calculates Late Finish (LF_i) and Late Start (LS_i) by traversing backwards from the project deadline: LF_i = min_{s in Succ(i)} (LS_s), LS_i = LF_i - d_i.\n"
        "• Total Float: TF_i = LS_i - ES_i. Activities possessing TF_i = 0 constitute the critical path governing total duration.\n\n"
        "Limitation: Classical CPM assumes infinite resource availability. In civil construction, crews, machinery, and material throughput are strictly limited. To benchmark resource-constrained scheduling algorithms, Kolisch and Sprecher (1996) developed the Project Scheduling Problem Library (PSPLIB). PSPLIB provides standardized problem sets parameterized by Network Complexity (NC), Resource Factor (RF), and Resource Strength (RS), establishing a universal testing baseline for RCPSP research."
    )

    # 2.3
    add_sec_heading("2.3 Genetic Algorithms and Metaheuristics for RCPSP and TCTP")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Because exact methods hit combinatorial bottlenecks on large scheduling DAGs, heuristic and metaheuristic approaches have been widely studied in operational research."
    )

    add_subsec_heading("2.3.1 Chromosome Representation and Schedule Generation")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Hartmann (1998) established a landmark permutation-based genetic representation evaluated using a Serial Schedule Generation Scheme (SSGS). Rather than encoding explicit timestamps, chromosomes represent precedence-feasible activity queues. Decoding sequentially places tasks into the earliest valid time windows respecting resource constraints. This prevents invalid schedules and outperforms classical priority heuristics.\n\n"
        "Pimapunsri et al. (2022) adapted permutation GAs with elitist strategies for aircraft maintenance under complex resource restrictions, demonstrating that topological repair operators maintain chromosome validity without destroying genetic diversity."
    )

    add_subsec_heading("2.3.2 Multi-Criteria Scheduling and Resource Leveling")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Leu and Yang (1999) introduced a multi-criteria GA combining duration reduction with resource leveling. They used resource moments to minimize daily crew fluctuations. However, their two-stage decoupled optimization approach can converge on sub-optimal local basins when direct activity crashing costs are applied."
    )

    add_subsec_heading("2.3.3 Time-Cost Trade-Off Problem (TCTP) and Crashing")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Hegazy (1999) formulated discrete TCTP using genetic search, allowing critical tasks to be expedited by assigning overtime or additional crews. Hegazy calculated the activity cost slope as: S_i = (C_crash - C_normal) / (D_normal - D_crash). Crashing tasks with the lowest cost slope produces the most cost-effective acceleration.\n\n"
        "Li and Love (1997) introduced dynamic penalty functions into GA fitness evaluations, allowing intermediate search iterations to explore infeasible boundary solutions rather than instantly discarding them. Hosny (2019) utilized NSGA-II to construct Pareto frontiers between project makespan and direct costs. Mohammadjafari et al. (2024) incorporated productivity learning curves into multi-mode TCTP. Recently, Mahendra et al. (2025) presented a Python-based implementation uniting NetworkX DAG representations with GA heuristics, reporting a 34.82% duration reduction and a 3.49% cost savings on a civil case study."
    )

    # 2.4
    add_sec_heading("2.4 Exact Solvers, Constraint Programming, and Benchmarking")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Metaheuristics provide fast execution but do not guarantee mathematical optimality. Exact solvers are essential to measure the optimality gap.\n\n"
        "Constraint Programming (CP) formulates project tasks as interval decision variables bounded by cumulative resource capacities: sum_{i in Active(t)} r_{i,k} <= R_{k,max}. Schutt et al. (2013) implemented Lazy Clause Generation (LCG), uniting finite domain constraint propagation with Boolean Satisfiability (SAT) solvers. Whenever a propagator deduces domain pruning or detects an infeasible condition, it generates explanatory clauses stored in a SAT database, allowing non-chronological backjumping.\n\n"
        "Perron and Furnon (2020) incorporated LCG principles into the open-source Google OR-Tools CP-SAT solver, providing robust constraint modeling through the AddCumulative constraint. Baptiste and Le Pape (1996) and Sonmez (2011) benchmarked exact Branch-and-Bound algorithms against metaheuristics. Sonmez showed that while exact algorithms prove true mathematical optimality for project networks with up to 50 tasks, combinatorial explosion occurs on networks with over 100 activities. This justifies a dual-engine architecture: fast GA scheduling for operational use, benchmarked against CP-SAT for mathematical verification."
    )

    # 2.5
    add_sec_heading("2.5 Construction Delay Economics and Statutory Penalties")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Project scheduling tools must consider the financial consequences of delays.\n\n"
        "Doloi et al. (2012) investigated delay factors in Indian construction, revealing that over 70% of projects experience significant delays due to cash-flow shortages, late approvals, and delayed sub-contractor mobilization. Traditional project managers frequently delay re-scheduling until schedule slippage becomes irreversible.\n\n"
        "Jain and Prakash (2023) modeled contractor financial accruals under liquidated damages (LD), demonstrating that when the cost slope of remaining critical activities exceeds daily contractual penalties, the financially optimal decision is to accept the delay penalty rather than pay for excessive labor overtime. Vaziri et al. (2024) applied stochastic risk optimization using Conditional Value at Risk (CVaR) to evaluate schedule robustness under material delivery delays. Prins et al. (2022) developed automated network restructuring controllers to dynamically reorganize task dependencies upon detecting progress delays.\n\n"
        "Statutory MahaRERA Mandate (2016): Unlike arbitrary liquidated damages, Section 18 of the MahaRERA Act mandates compounding interest on total homebuyer funds collected: Penalty_RERA = Amount Collected × (SBI MCLR + 2%) × (Delay Days / 365). Because collected capital often spans tens to hundreds of crores, this statutory interest quickly overtakes direct construction costs."
    )

    # 2.6
    add_sec_heading("2.6 Computer Vision for Site Progress Monitoring")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Automated rescheduling depends on accurate, unbiased site telemetry.\n\n"
        "Yang et al. (2023) tested YOLOv7 and Faster R-CNN on construction sites. While accurate under ideal conditions, these models require dedicated GPU infrastructure, demand extensive bounding box annotations, and are sensitive to dust, weather, and occlusions.\n\n"
        "Sandler et al. (2018) designed MobileNetV2 with inverted residual blocks and depthwise separable convolutions, reducing compute and memory usage by over 80% compared to ResNet architectures. Rashidi et al. (2024) deployed quantized MobileNetV2 models for edge-based jobsite image classification, achieving over 94% accuracy with inference times under 45 ms. This demonstrates that binary phase classification (e.g., Structural vs. Finishing) provides a reliable progress signal on resource-constrained mobile hardware without the overhead of heavy object detection models."
    )

    # 2.7
    add_sec_heading("2.7 Comparative Analysis Matrix")
    p = doc.add_paragraph()
    p.add_run("Table 2.1 summarizes the literature survey across eight evaluation dimensions:")

    # Add Comparative Table
    matrix_data = [
        ("Hartmann (1998)", "Permutation GA + SSGS", "Yes", "No", "No", "No", "No", "Focuses only on makespan; no cost or financial penalty models."),
        ("Leu & Yang (1999)", "Multi-Criteria GA", "Yes", "Yes", "No", "No", "No", "Two-stage leveling prone to local optima under direct crashing."),
        ("Hegazy (1999)", "Discrete TCTP GA", "No", "Yes", "No", "No", "No", "Omits renewable labor caps and physical site progress inputs."),
        ("Li & Love (1997)", "Adaptive Penalty GA", "No", "Yes", "No", "No", "No", "Uses arbitrary penalty weights without statutory legal grounding."),
        ("Sonmez (2011)", "Hybrid GA + B&B", "No", "Yes", "No", "Yes", "No", "High computational scaling latency; ignores resource leveling."),
        ("Schutt et al. (2013)", "Lazy Clause Gen / SAT", "Yes", "No", "No", "Yes", "No", "Theoretical focus; lacks financial penalty logic and telemetry."),
        ("Hosny (2019)", "Elitist NSGA-II", "No", "Yes", "No", "No", "No", "Does not model renewable labor crew capacity constraints."),
        ("Doloi et al. (2012)", "Regression Factor Analysis", "No", "No", "No", "No", "No", "Diagnostic survey; provides no automated scheduling tools."),
        ("Jain & Prakash (2023)", "Constrained Linear Prog.", "No", "Yes", "Yes*", "No", "No", "Analyzes static contractual penalties; lacks dynamic rescheduling."),
        ("Vaziri et al. (2024)", "Hybrid GA-GWO", "No", "Yes", "Yes*", "No", "No", "High complexity; ignores Indian regulatory statutes."),
        ("Prins et al. (2022)", "Automated Network Restruct.", "Yes", "Yes", "No", "No", "No", "Focuses on sequencing changes without formal crash slope economics."),
        ("Mahendra et al. (2025)", "NetworkX CPM + GA", "No", "Yes", "No", "No", "No", "Single-project scope; lacks resource leveling and visual telemetry."),
        ("Rashidi et al. (2024)", "Quantized MobileNetV2", "No", "No", "No", "No", "Yes", "Isolated vision classifier; decoupled from scheduling systems."),
        ("Yang et al. (2023)", "Real-Time YOLO Detector", "No", "No", "No", "No", "Yes", "Computationally heavy; susceptible to false triggers on raw sites."),
        ("OptiBuild (Proposed)", "DEAP GA + CP-SAT + CV", "Yes", "Yes", "Yes**", "Yes", "Yes", "Unified system combining scheduling, penalties, and vision.")
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
        set_cell_background(cell, "1E3A8A") # Navy header
        set_cell_margins(cell, top=120, bottom=120, left=100, right=100)
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
            set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.05
            p.paragraph_format.space_after = Pt(0)
            
            # Alignment
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
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run("* Evaluates contract-specific liquidated damages (LD), not statutory consumer protection laws.\n** Formally integrates statutory MahaRERA Section 18 penalty computation (SBI MCLR + 2%) into crashing trade-off logic.")
    run.font.size = Pt(8.5)
    run.font.italic = True
    run.font.color.rgb = RGBColor(107, 114, 128)

    # 2.8
    add_sec_heading("2.8 Research Gaps and OptiBuild Contributions")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(
        "Based on this comprehensive literature review, three critical research gaps were identified:\n\n"
        "1. Absence of Statutory Regulatory Penalty Integration in Scheduling Engines: Existing literature models financial damages either as static lump sums or linear liquidated damages formulas. None integrate mandatory statutory compensation laws like MahaRERA Section 18 (SBI MCLR + 2% per annum on total homebuyer funds collected). Because consumer investments in real estate projects represent tens to hundreds of crores, daily statutory liability accrues rapidly, making traditional schedule crashing models inadequate.\n\n"
        "2. Dichotomy Between Heuristic Speed and Exact Solver Verification: Most contemporary systems rely solely on metaheuristic algorithms (GA) without quantifying their distance from mathematical optimality, or they rely on exact solvers (Branch-and-Bound, CP-SAT) that become computationally intractable on real-world networks with over 100 activities. There is a lack of practical architectures that run fast genetic algorithms for daily scheduling while benchmarking against an exact CP-SAT solver to verify the optimality gap.\n\n"
        "3. Decoupling of Edge Visual Site Telemetry from Dynamic Scheduling Engines: Recent computer vision research on construction sites focuses primarily on isolated perceptual tasks (detecting helmets, equipment, or cracks). These models are not integrated into scheduling backends. There is an absence of closed-loop systems where edge-classified progress updates automatically trigger CPM float recalculations and invoke penalty-versus-crashing advisory workflows.\n\n"
        "The OptiBuild Contribution:\n"
        "OptiBuild directly resolves these research voids through a unified platform:\n"
        "• Core Engine: Integrates a NetworkX CPM DAG engine with a DEAP Resource-Constrained Genetic Algorithm.\n"
        "• Exact Benchmarking: Benchmarks GA performance against Google OR-Tools CP-SAT using the AddCumulative constraint.\n"
        "• Statutory Decision Engine: Evaluates MahaRERA Section 18 penalties against activity crash slopes, providing actionable recommendations to project managers (accelerate critical tasks or accept the penalty).\n"
        "• Edge Progress Feedback: Uses a lightweight MobileNetV2 binary classifier (Structural vs. Finishing) with a human-in-the-loop review interface to verify physical site status."
    )

    out_path = r"d:\Opti Build\docs\OptiBuild_Chapter2_Literature_Survey.docx"
    doc.save(out_path)
    print(f"Successfully generated {out_path}")

if __name__ == "__main__":
    build_chapter2()
