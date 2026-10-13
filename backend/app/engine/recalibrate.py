from typing import Dict, List, Tuple
from backend.app.schemas.dashboard import (
    BudgetVsActualCategory,
    MonthlySpendDataPoint,
    CrashCostRecalibrationItem,
    DashboardResponse,
)
from backend.app.api.v1.materials import MATERIAL_LOG_STORE

# Baseline benchmark market rates for construction materials (INR)
BASELINE_MATERIAL_BENCHMARKS: Dict[str, float] = {
    "Steel / Rebar": 54000.0,    # Baseline ₹54,000 / MT
    "RMC Concrete": 4200.0,      # Baseline ₹4,200 / Cu.m
    "Cement": 360.0,             # Baseline ₹360 / Bag
    "AAC Blocks": 60.0,          # Baseline ₹60 / Block
    "Sand & Aggregates": 6800.0, # Baseline ₹6,800 / Brass
}

# Baseline tasks with crash slopes
BASELINE_CRASH_TASKS = [
    {
        "task_id": "T04",
        "task_name": "Podium Columns RCC Casting",
        "baseline_slope": 12000.0,
        "material_type": "Steel / Rebar",
        "material_weight": 0.55,
    },
    {
        "task_id": "T05",
        "task_name": "Tower Core Shear Walls (L1-L7)",
        "baseline_slope": 15000.0,
        "material_type": "RMC Concrete",
        "material_weight": 0.60,
    },
    {
        "task_id": "T07",
        "task_name": "Tower Core Shear Walls (L8-L14)",
        "baseline_slope": 22500.0,
        "material_type": "Steel / Rebar",
        "material_weight": 0.50,
    },
    {
        "task_id": "T06",
        "task_name": "External Masonry Blockwork",
        "baseline_slope": 8500.0,
        "material_type": "AAC Blocks",
        "material_weight": 0.40,
    },
]


class CrashCostRecalibrator:
    @classmethod
    def compute_material_variance_factors(cls) -> Dict[str, float]:
        """
        Calculates inflation factors: actual average unit rate / baseline benchmark rate.
        """
        rates_by_cat: Dict[str, List[float]] = {}
        for entry in MATERIAL_LOG_STORE:
            rates_by_cat.setdefault(entry.material_category, []).append(entry.unit_rate)

        variance_factors: Dict[str, float] = {}
        for cat, baseline in BASELINE_MATERIAL_BENCHMARKS.items():
            actual_rates = rates_by_cat.get(cat, [])
            if actual_rates:
                avg_actual = sum(actual_rates) / len(actual_rates)
                variance_factors[cat] = round(avg_actual / baseline, 4)
            else:
                variance_factors[cat] = 1.0  # No change if no material logged yet

        return variance_factors

    @classmethod
    def recalibrate_tasks(cls) -> List[CrashCostRecalibrationItem]:
        """
        Recalibrates crash slopes based on real material purchase variances.
        """
        factors = cls.compute_material_variance_factors()
        recalibrated: List[CrashCostRecalibrationItem] = []

        for item in BASELINE_CRASH_TASKS:
            mat_type = item["material_type"]
            factor = factors.get(mat_type, 1.0)
            weight = item["material_weight"]

            # Adjusted slope = baseline * (1 + weight * (factor - 1))
            slope_multiplier = 1.0 + weight * (factor - 1.0)
            new_slope = round(item["baseline_slope"] * slope_multiplier, 2)
            pct_change = round(((new_slope - item["baseline_slope"]) / item["baseline_slope"]) * 100, 2)

            recalibrated.append(
                CrashCostRecalibrationItem(
                    task_id=item["task_id"],
                    task_name=item["task_name"],
                    baseline_crash_slope=item["baseline_slope"],
                    recalibrated_crash_slope=new_slope,
                    material_factor_applied=factor,
                    change_percent=pct_change,
                )
            )

        return recalibrated

    @classmethod
    def get_dashboard_metrics(cls) -> DashboardResponse:
        total_planned = 180000000.0  # ₹18.00 Cr
        # Actual material spent from MATERIAL_LOG_STORE + equipment & labor overheads
        material_spent = sum(item.total_cost for item in MATERIAL_LOG_STORE)
        site_labor_equipment = 1125000.0
        total_actual = round(material_spent + site_labor_equipment, 2)

        total_variance = round(total_planned - total_actual, 2)
        is_over_budget = total_actual > total_planned
        utilization = round((total_actual / total_planned) * 100, 2)

        # 6 WBS package breakdowns
        categories = [
            BudgetVsActualCategory(
                category_name="1. Substructure & Earthwork",
                planned_budget=21600000.0,
                actual_spent=round(material_spent * 0.40 + 450000, 2),
                variance=round(21600000.0 - (material_spent * 0.40 + 450000), 2),
                percentage_utilized=round(((material_spent * 0.40 + 450000) / 21600000.0) * 100, 1),
            ),
            BudgetVsActualCategory(
                category_name="2. RCC Superstructure Frame",
                planned_budget=68400000.0,
                actual_spent=round(material_spent * 0.45 + 500000, 2),
                variance=round(68400000.0 - (material_spent * 0.45 + 500000), 2),
                percentage_utilized=round(((material_spent * 0.45 + 500000) / 68400000.0) * 100, 1),
            ),
            BudgetVsActualCategory(
                category_name="3. Masonry & Wet Finishes",
                planned_budget=32400000.0,
                actual_spent=round(material_spent * 0.15 + 175000, 2),
                variance=round(32400000.0 - (material_spent * 0.15 + 175000), 2),
                percentage_utilized=round(((material_spent * 0.15 + 175000) / 32400000.0) * 100, 1),
            ),
            BudgetVsActualCategory(
                category_name="4. MEP Building Services",
                planned_budget=25200000.0,
                actual_spent=0.0,
                variance=25200000.0,
                percentage_utilized=0.0,
            ),
            BudgetVsActualCategory(
                category_name="5. Architectural Finishing",
                planned_budget=21600000.0,
                actual_spent=0.0,
                variance=21600000.0,
                percentage_utilized=0.0,
            ),
            BudgetVsActualCategory(
                category_name="6. External Development & Handover",
                planned_budget=10800000.0,
                actual_spent=0.0,
                variance=10800000.0,
                percentage_utilized=0.0,
            ),
        ]

        # 12-Month S-Curve Progress
        monthly_planned = [
            1200000.0, 1800000.0, 2200000.0, 2600000.0, 3100000.0, 3400000.0,
            3200000.0, 2800000.0, 2400000.0, 1900000.0, 1400000.0, 1000000.0,
        ]
        actual_monthly = [
            1350000.0, 1920000.0, 2150000.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        ]

        s_curve: List[MonthlySpendDataPoint] = []
        plan_cum = 0.0
        act_cum = 0.0
        for i in range(12):
            plan_cum += monthly_planned[i]
            act_cum += actual_monthly[i]
            s_curve.append(
                MonthlySpendDataPoint(
                    month=f"M{i+1:02d}",
                    planned_monthly=monthly_planned[i],
                    actual_monthly=actual_monthly[i],
                    planned_cumulative=plan_cum,
                    actual_cumulative=act_cum if actual_monthly[i] > 0 or i < 3 else None or act_cum,
                )
            )

        recalibrated_tasks = cls.recalibrate_tasks()

        return DashboardResponse(
            project_name="Tower-A Residential (G+14)",
            total_planned_budget=total_planned,
            total_actual_spent=total_actual,
            total_variance=total_variance,
            is_over_budget=is_over_budget,
            budget_utilization_percent=utilization,
            categories=categories,
            s_curve_data=s_curve,
            recalibration_available=len(recalibrated_tasks) > 0,
            recalibrated_tasks=recalibrated_tasks,
        )
