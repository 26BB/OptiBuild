"""
Generate Figure 1 and Figure 2 for OptiBuild IEEE Conference Paper.
Optimized for IEEE column width: single-column ~3.45 in, crisp 600 DPI, clean B&W/grayscale aesthetics.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif', 'Times']
plt.rcParams['mathtext.fontset'] = 'stix'

def generate_figure1():
    # Figure 1: Taxonomy - Single Column width friendly (3.45 x 4.8 inches)
    fig, ax = plt.subplots(figsize=(3.45, 4.6), dpi=600)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Root Box
    root_bbox = dict(boxstyle="square,pad=0.3", fc="#FFFFFF", ec="#000000", lw=1.2)
    ax.text(50, 94, "Scheduling & Site Telemetry Literature",
            ha="center", va="center", fontsize=7.8, fontweight="bold", bbox=root_bbox)

    # 4 Category Rows
    branches = [
        {
            "name": "1. Deterministic & Exact Methods",
            "y": 78,
            "items": "• Kelley & Walker [1]: CPM Precedence DAG\n• Kolisch & Sprecher [2]: PSPLIB Benchmark\n• Schutt et al. [12]: Lazy Clause Gen. (LCG)\n• Perron & Furnon [13]: OR-Tools CP-SAT\n• Baptiste & Le Pape [14]: Branch & Bound"
        },
        {
            "name": "2. Evolutionary Metaheuristics",
            "y": 57,
            "items": "• Hartmann [3]: Permutation GA + SSGS\n• Leu & Yang [4]: Multi-Criteria Leveling\n• Hegazy [5]: Discrete TCTP Crash Slopes\n• Li & Love [6]: Adaptive Penalty GA\n• Hosny [7]: Elitist Multi-Objective TCTP\n• Mahendra et al. [8]: NetworkX + DEAP\n• Deb et al. [10]: NSGA-II Pareto Engine"
        },
        {
            "name": "3. Financial & Statutory Models",
            "y": 36,
            "items": "• Doloi et al. [15]: Indian Delay Factor Analysis\n• Jain & Prakash [16]: LD Cash Accrual Model\n• MahaRERA Act Sec. 18 [17]: Accruing Simple\n   Interest ($r_{\\mathrm{MCLR}} + 2\\%$ per annum)\n• Vaziri et al. [18]: Stochastic CVaR Risk\n• Prins et al. [19]: Dynamic Network Restructure"
        },
        {
            "name": "4. Progress Sensing & Vision",
            "y": 17,
            "items": "• Sandler et al. [20]: MobileNetV2 Architecture\n• Rashidi et al. [21]: Quantized Edge Classifier\n• Yang et al. [22]: Heavy YOLOv7 / CNN\n• Han et al. [23]: Photogrammetric BIM-CV\n• Kropp et al. [24]: Indoor 4D State Sync"
        }
    ]

    ax.plot([50, 50], [90, 85], color="#000000", lw=0.9)

    for b in branches:
        by = b["y"]
        # Header Box
        h_bbox = dict(boxstyle="square,pad=0.2", fc="#F0F0F0", ec="#000000", lw=0.9)
        ax.text(50, by + 4.2, b["name"], ha="center", va="center", fontsize=6.8, fontweight="bold", bbox=h_bbox)
        # Content Box
        c_bbox = dict(boxstyle="square,pad=0.3", fc="#FFFFFF", ec="#555555", lw=0.6, ls="--")
        ax.text(50, by - 3.2, b["items"], ha="center", va="center", fontsize=5.6, bbox=c_bbox, linespacing=1.25)

    # OptiBuild Convergence Footer Box
    conv_bbox = dict(boxstyle="square,pad=0.3", fc="#FAFAFA", ec="#000000", lw=1.1)
    ax.text(50, 3.5, "OptiBuild Convergence: Unifies CP-SAT Exact Benchmark [13]\n+ DEAP RCPSP GA [3, 8] + MahaRERA Sec. 18 Arbitrator [17]\n+ Quantized MobileNetV2 Edge Classifier [20, 21]",
            ha="center", va="center", fontsize=5.8, fontweight="bold", bbox=conv_bbox, linespacing=1.2)

    plt.tight_layout()
    plt.savefig("research/literature-survey/figures/fig1_taxonomy.png", dpi=600, bbox_inches="tight")
    plt.close()
    print("Figure 1 generated successfully (Single-column layout).")

def generate_figure2():
    # Figure 2: Architecture - Single Column or 2-column compact (6.8 x 2.2 inches)
    fig, ax = plt.subplots(figsize=(6.8, 2.1), dpi=600)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    stages = [
        {
            "num": "STAGE 1",
            "title": "Edge Vision Classifier",
            "x": 10,
            "y": 62,
            "desc": "Site Photo Capture\nMobileNetV2 Quantized\nStructural vs. Finishing\nHuman Review Audit"
        },
        {
            "num": "STAGE 2",
            "title": "Dynamic CPM DAG",
            "x": 30,
            "y": 62,
            "desc": "NetworkX DAG Engine\nAs-Built State Sync\nDual Topological Passes\nFloat Isolation ($TF_i=0$)"
        },
        {
            "num": "STAGE 3",
            "title": "Parallel Rescheduler",
            "x": 50,
            "y": 62,
            "desc": "DEAP RCPSP GA (SSGS)\nResource Bound Caps\nOR-Tools CP-SAT Solver\nOptimality Gap Benchmark"
        },
        {
            "num": "STAGE 4",
            "title": "Financial Arbitrator",
            "x": 70,
            "y": 62,
            "desc": "Sec. 18 Accruing Interest\nCrash Slopes ($S_i$)\nEconomic Arbitrator:\nAccelerate vs. Accept"
        },
        {
            "num": "STAGE 5",
            "title": "Actionable Schedule",
            "x": 90,
            "y": 62,
            "desc": "Crashing Work Orders\nRevised Baseline Gantt\nCrew Resource Matrix\nRERA Compliance Log"
        }
    ]

    for s in stages:
        bbox = dict(boxstyle="square,pad=0.25", fc="#FFFFFF", ec="#000000", lw=0.9)
        ax.text(s["x"], s["y"], f"{s['num']}: {s['title']}\n\n{s['desc']}",
                ha="center", va="center", fontsize=5.6, bbox=bbox, linespacing=1.2)

    arrow_props = dict(arrowstyle="->", color="#000000", lw=1.0, mutation_scale=9)
    ax.annotate("", xy=(20.5, 62), xytext=(17.5, 62), arrowprops=arrow_props)
    ax.annotate("", xy=(40.5, 62), xytext=(37.5, 62), arrowprops=arrow_props)
    ax.annotate("", xy=(60.5, 62), xytext=(57.5, 62), arrowprops=arrow_props)
    ax.annotate("", xy=(80.5, 62), xytext=(77.5, 62), arrowprops=arrow_props)

    # Feedback loop
    ax.plot([90, 90], [39, 18], color="#000000", lw=0.8, ls="-")
    ax.plot([90, 10], [18, 18], color="#000000", lw=0.8, ls="-")
    ax.annotate("", xy=(10, 39), xytext=(10, 18), arrowprops=dict(arrowstyle="->", color="#000000", lw=0.8, mutation_scale=8))

    fb_bbox = dict(boxstyle="square,pad=0.2", fc="#F5F5F5", ec="#444444", lw=0.6, ls="--")
    ax.text(50, 18, "Closed-Loop Field Telemetry: Periodic Visual Verification & Dynamic Re-Scheduling Loop",
            ha="center", va="center", fontsize=5.8, fontweight="bold", bbox=fb_bbox)

    # Top Title
    t_bbox = dict(boxstyle="square,pad=0.25", fc="#000000", ec="#000000", lw=0.8)
    ax.text(50, 93, "OPTIBUILD END-TO-END CLOSED-LOOP SCHEDULING & STATUTORY ARBITRATION ARCHITECTURE",
            ha="center", va="center", fontsize=6.8, fontweight="bold", color="#FFFFFF", bbox=t_bbox)

    plt.tight_layout()
    plt.savefig("research/literature-survey/figures/fig2_architecture.png", dpi=600, bbox_inches="tight")
    plt.close()
    print("Figure 2 generated successfully (Compact 2-column layout).")

if __name__ == "__main__":
    generate_figure1()
    generate_figure2()
