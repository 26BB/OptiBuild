from typing import Dict, List, Optional
from backend.app.schemas.dashboard import (
    BudgetVsActualCategory,
    MonthlySpendDataPoint,
    CrashCostRecalibrationItem,
    DashboardResponse,
)

# Baseline benchmark market rates for construction materials (INR)
BASELINE_MATERIAL_BENCHMARKS: Dict[str, float] = {
    "Steel / Rebar": 54000.0,    # Baseline ₹54,000 / MT
    "RMC Concrete": 4200.0,      # Baseline ₹4,200 / Cu.m
    "Cement": 360.0,             # Baseline ₹360 / Bag
    "AAC Blocks": 60.0,          # Baseline ₹60 / Block
    "Sand & Aggregates": 6800.0, # Baseline ₹6,800 / Brass
}

BASELINE_CRASH_TASKS = [
    {
        "task_id": "T04",
        "task_name": "Podium Columns RCC Casting",
        "baseline_slope": 12000.0,
        "material_type": "Steel / Rebar",
        "material_weight": 0.55,
        "duration": 16,
        "crash_duration": 11,
        "normal_cost": 150000.0,
        "crash_cost": 210000.0,
    },
    {
        "task_id": "T05",
        "task_name": "Tower Core Shear Walls (L1-L7)",
        "baseline_slope": 15000.0,
        "material_type": "RMC Concrete",
        "material_weight": 0.60,
        "duration": 25,
        "crash_duration": 18,
        "normal_cost": 280000.0,
        "crash_cost": 385000.0,
    },
    {
        "task_id": "T07",
        "task_name": "Tower Core Shear Walls (L8-L14)",
        "baseline_slope": 22500.0,
        "material_type": "Steel / Rebar",
        "material_weight": 0.50,
        "duration": 22,
        "crash_duration": 16,
        "normal_cost": 310000.0,
        "crash_cost": 445000.0,
    },
    {
        "task_id": "T06",
        "task_name": "External Masonry Blockwork",
        "baseline_slope": 8500.0,
        "material_type": "AAC Blocks",
        "material_weight": 0.40,
        "duration": 18,
        "crash_duration": 14,
        "normal_cost": 120000.0,
        "crash_cost": 154000.0,
    },
]

DEFAULT_SAMPLE_LOGS = [
    {"material_category": "Steel / Rebar", "unit_rate": 58000.0, "total_amount": 1044000.0},
    {"material_category": "RMC Concrete", "unit_rate": 4500.0, "total_amount": 540000.0},
    {"material_category": "Cement", "unit_rate": 385.0, "total_amount": 231000.0},
    {"material_category": "AAC Blocks", "unit_rate": 65.0, "total_amount": 156000.0},
    {"material_category": "Sand & Aggregates", "unit_rate": 7200.0, "total_amount": 324000.0},
]

DEFAULT_CATEGORIES_TEMPLATE = [
    ("1. Substructure & Earthwork", 0.12),
    ("2. RCC Superstructure Frame", 0.38),
    ("3. Masonry & Wet Finishes", 0.18),
    ("4. MEP Building Services", 0.14),
    ("5. Architectural Finishing", 0.12),
    ("6. External Development & Handover", 0.06),
]


class CrashCostRecalibrator:
    @classmethod
    def compute_material_variance_factors(cls, material_logs: Optional[List[dict]] = None) -> Dict[str, float]:
        """
        Calculates inflation factors: actual average unit rate / baseline benchmark rate.
        If material_logs is None, uses default baseline benchmark logs.
        """
        logs = DEFAULT_SAMPLE_LOGS if material_logs is None else material_logs

        if not logs:
            return {k: 1.0 for k in BASELINE_MATERIAL_BENCHMARKS}

        rates_by_cat: Dict[str, List[float]] = {}
        for entry in logs:
            cat = entry.get("material_category")
            rate = float(entry.get("unit_rate", 0))
            if cat and rate > 0:
                rates_by_cat.setdefault(cat, []).append(rate)

        variance_factors: Dict[str, float] = {}
        for cat, baseline in BASELINE_MATERIAL_BENCHMARKS.items():
            actual_rates = rates_by_cat.get(cat, [])
            if actual_rates:
                avg_actual = sum(actual_rates) / len(actual_rates)
                variance_factors[cat] = round(avg_actual / baseline, 4)
            else:
                variance_factors[cat] = 1.0

        return variance_factors

    @classmethod
    def recalibrate_tasks(
        cls,
        tasks: Optional[List[dict]] = None,
        material_logs: Optional[List[dict]] = None,
    ) -> List[CrashCostRecalibrationItem]:
        """
        Recalibrates critical path task crash-cost slopes based on latest material unit rates.
        """
        factors = cls.compute_material_variance_factors(material_logs)
        task_list = BASELINE_CRASH_TASKS if tasks is None else tasks

        recalibrated: List[CrashCostRecalibrationItem] = []
        for item in task_list:
            task_id = item.get("id") or item.get("task_id", "")
            name = item.get("name") or item.get("task_name", "")
            duration = int(item.get("duration", 1))
            crash_duration = int(item.get("crash_duration") or max(1, int(duration * 0.65)))
            normal_cost = float(item.get("normal_cost", 0.0))
            crash_cost = float(item.get("crash_cost") or (normal_cost * 1.35))

            baseline_slope = item.get("baseline_slope")
            if baseline_slope is None:
                days_reducible = max(1, duration - crash_duration)
                baseline_slope = round((crash_cost - normal_cost) / days_reducible, 2)
            if baseline_slope <= 0:
                baseline_slope = 10000.0

            mat_type = item.get("material_type") or "Steel / Rebar"
            weight = float(item.get("material_weight") or 0.50)
            lname = name.lower()
            if not item.get("material_type"):
                if "concrete" in lname or "rmc" in lname or "core" in lname or "shear" in lname:
                    mat_type = "RMC Concrete"
                    weight = 0.60
                elif "block" in lname or "masonry" in lname or "brick" in lname:
                    mat_type = "AAC Blocks"
                    weight = 0.40
                elif "excavation" in lname or "sand" in lname:
                    mat_type = "Sand & Aggregates"
                    weight = 0.35

            factor = factors.get(mat_type, 1.0)
            slope_multiplier = 1.0 + weight * (factor - 1.0)
            new_slope = round(baseline_slope * slope_multiplier, 2)
            pct_change = round(((new_slope - baseline_slope) / baseline_slope) * 100, 2)

            recalibrated.append(
                CrashCostRecalibrationItem(
                    task_id=task_id,
                    task_name=name,
                    baseline_crash_slope=baseline_slope,
                    recalibrated_crash_slope=new_slope,
                    material_factor_applied=factor,
                    change_percent=pct_change,
                )
            )

        return recalibrated

    @classmethod
    def get_dashboard_metrics(
        cls,
        project_name: Optional[str] = None,
        total_planned: Optional[float] = None,
        wbs_categories: Optional[List[dict]] = None,
        material_logs: Optional[List[dict]] = None,
        tasks: Optional[List[dict]] = None,
    ) -> DashboardResponse:
        """
        Dynamically calculates budget vs actual, package breakdown, S-curve, and recalibration.
        """
        name = project_name or "Tower-A Residential (G+14)"
        planned = 180000000.0 if total_planned is None or total_planned == 0.0 else total_planned
        logs = DEFAULT_SAMPLE_LOGS if material_logs is None else material_logs

        material_spent = sum(float(l.get("total_amount", 0.0)) for l in logs)
        total_actual = round(material_spent, 2)
        total_variance = round(planned - total_actual, 2)
        is_over_budget = total_actual > planned if planned > 0 else False
        utilization = round((total_actual / planned) * 100, 2) if planned > 0 else 0.0

        categories: List[BudgetVsActualCategory] = []
        if wbs_categories and len(wbs_categories) > 0:
            for cat in wbs_categories:
                cname = cat.get("category_name", "Package")
                cbudget = float(cat.get("total_cost", 0.0))
                c_spent = sum(
                    float(l.get("total_amount", 0.0))
                    for l in logs
                    if (l.get("wbs_code") and cname.lower() in str(l.get("wbs_code")).lower())
                    or (l.get("material_category") and l.get("material_category", "").lower() in cname.lower())
                )
                c_var = round(cbudget - c_spent, 2)
                c_util = round((c_spent / cbudget) * 100, 1) if cbudget > 0 else 0.0
                categories.append(
                    BudgetVsActualCategory(
                        category_name=cname,
                        planned_budget=round(cbudget, 2),
                        actual_spent=round(c_spent, 2),
                        variance=c_var,
                        percentage_utilized=c_util,
                    )
                )
        else:
            for cname, share in DEFAULT_CATEGORIES_TEMPLATE:
                cbudget = round(planned * share, 2)
                c_spent = round(total_actual * share, 2) if total_actual > 0 else 0.0
                categories.append(
                    BudgetVsActualCategory(
                        category_name=cname,
                        planned_budget=cbudget,
                        actual_spent=c_spent,
                        variance=round(cbudget - c_spent, 2),
                        percentage_utilized=round((c_spent / cbudget) * 100, 1) if cbudget > 0 else 0.0,
                    )
                )

        s_curve: List[MonthlySpendDataPoint] = []
        monthly_distribution = [
            0.05, 0.07, 0.09, 0.11, 0.13, 0.15,
            0.14, 0.11, 0.08, 0.04, 0.02, 0.01,
        ]
        plan_cum = 0.0
        act_cum = 0.0
        for i in range(12):
            p_month = round(planned * monthly_distribution[i], 2)
            plan_cum = round(plan_cum + p_month, 2)
            a_month = round(total_actual * (0.35 if i == 0 else 0.65 if i == 1 else 0.0), 2)
            act_cum = round(act_cum + a_month, 2)
            s_curve.append(
                MonthlySpendDataPoint(
                    month=f"M{i+1:02d}",
                    planned_monthly=p_month,
                    actual_monthly=a_month,
                    planned_cumulative=plan_cum,
                    actual_cumulative=act_cum,
                )
            )

        recalibrated_tasks = cls.recalibrate_tasks(tasks=tasks, material_logs=logs)

        return DashboardResponse(
            project_name=name,
            total_planned_budget=planned,
            total_actual_spent=total_actual,
            total_variance=total_variance,
            is_over_budget=is_over_budget,
            budget_utilization_percent=utilization,
            categories=categories,
            s_curve_data=s_curve,
            recalibration_available=len(recalibrated_tasks) > 0,
            recalibrated_tasks=recalibrated_tasks,
        )
