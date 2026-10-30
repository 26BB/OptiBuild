"""MahaRERA Section 18 Penalty vs. Crash Cost Decision Engine.

Mathematical Formulation (SPPU B.E. Project — OptiBuild):

    MahaRERA Penalty (per Section 18 of RERA Act, 2016):
        Penalty = Amount_Collected * (SBI_MCLR + 2%) * (Delay_Days / 365)

        Where:
            - Amount_Collected: Total amount collected from homebuyers (INR)
            - SBI_MCLR: State Bank of India Marginal Cost of Lending Rate (%)
            - Delay_Days: Number of days beyond contractual deadline

    Crash Cost Calculation:
        For critical activity i:
            cost_slope_i = (C_crash_i - C_normal_i) / (D_normal_i - D_crash_i)
            crash_cost_i = cost_slope_i * Delta_d_i

        Total_Crash_Cost = sum(crash_cost_i) for all crashed activities

    Decision Logic:
        If Total_Crash_Cost < Penalty_RERA:
            RECOMMEND: Crash critical activities (overtime / extra crews)
        Else:
            RECOMMEND: Accept delay penalty (cheaper than crashing)

References:
    MahaRERA Sec. 18: https://maharera.mahaonline.gov.in
    SBI MCLR: https://sbi.co.in/web/interest-rates/interest-rates/mclr
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)

# Default SBI MCLR (1-year tenor): ~8.60% - 8.85%
DEFAULT_SBI_MCLR = 8.85


@dataclass
class CrashAnalysis:
    """Crash cost analysis for a single activity."""
    activity_id: str
    name: str
    normal_duration: int
    crash_duration: int
    normal_cost: float
    crash_cost: float
    cost_slope: float  # INR per day of crashing
    max_crash_days: int
    applied_crash_days: int = 0
    applied_crash_cost: float = 0.0


@dataclass
class PenaltyResult:
    """Complete penalty-vs-crash analysis result."""
    # MahaRERA penalty
    delay_days: int = 0
    sbi_mclr_rate: float = 0.0
    interest_rate: float = 0.0  # MCLR + 2%
    amount_collected: float = 0.0
    penalty_amount: float = 0.0

    # Crash analysis
    crash_analyses: list[CrashAnalysis] = field(default_factory=list)
    total_crash_cost: float = 0.0
    days_recoverable: int = 0

    # Decision
    recommendation: str = ""
    savings: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "delay_days": self.delay_days,
            "sbi_mclr_rate": self.sbi_mclr_rate,
            "interest_rate_pct": self.interest_rate,
            "amount_collected_inr": self.amount_collected,
            "penalty_amount_inr": round(self.penalty_amount, 2),
            "total_crash_cost_inr": round(self.total_crash_cost, 2),
            "days_recoverable": self.days_recoverable,
            "recommendation": self.recommendation,
            "savings_inr": round(self.savings, 2),
            "crash_breakdown": [
                {
                    "activity_id": ca.activity_id,
                    "name": ca.name,
                    "cost_slope_inr_per_day": round(ca.cost_slope, 2),
                    "max_crash_days": ca.max_crash_days,
                    "applied_crash_days": ca.applied_crash_days,
                    "applied_crash_cost_inr": round(ca.applied_crash_cost, 2),
                }
                for ca in self.crash_analyses
            ],
        }


class PenaltyEngine:
    """MahaRERA penalty-vs-crash cost decision engine.

    Computes the financial penalty for project delays and compares it
    against the cost of crashing critical-path activities to determine
    the optimal recovery strategy.
    """

    def __init__(
        self,
        sbi_mclr_rate: float = DEFAULT_SBI_MCLR,
        amount_collected: float = 0.0,
        contractual_deadline_days: int = 0,
    ) -> None:
        """Initialize penalty engine.

        Args:
            sbi_mclr_rate: SBI MCLR rate in percent (e.g. 8.85 for 8.85%).
            amount_collected: Total amount collected from homebuyers (INR).
            contractual_deadline_days: Project deadline in days from start.
        """
        if sbi_mclr_rate < 0:
            raise ValueError("SBI MCLR rate cannot be negative.")
        if amount_collected < 0:
            raise ValueError("Amount collected cannot be negative.")

        self.sbi_mclr_rate = sbi_mclr_rate
        self.amount_collected = amount_collected
        self.contractual_deadline_days = contractual_deadline_days

    def compute_penalty(self, delay_days: int) -> float:
        """Compute MahaRERA Section 18 delay penalty.

        Formula: Penalty = Amount * (MCLR + 2%) * (Delay / 365)

        Args:
            delay_days: Number of days beyond contractual deadline.

        Returns:
            Penalty amount in INR.
        """
        if delay_days <= 0:
            return 0.0

        interest_rate = (self.sbi_mclr_rate + 2.0) / 100.0
        penalty = self.amount_collected * interest_rate * (delay_days / 365.0)

        logger.debug(
            "Penalty: Rs.%.2f = Rs.%.2f * %.4f * (%d/365)",
            penalty,
            self.amount_collected,
            interest_rate,
            delay_days,
        )

        return penalty

    def analyze_crash_options(
        self,
        critical_activities: list[dict[str, Any]],
    ) -> list[CrashAnalysis]:
        """Analyze crash cost options for critical-path activities.

        Args:
            critical_activities: List of activity dicts on the critical path,
                each with: id, name, duration, crash_duration, normal_cost, crash_cost.

        Returns:
            List of CrashAnalysis sorted by cost_slope (cheapest first).
        """
        analyses: list[CrashAnalysis] = []

        for act in critical_activities:
            normal_dur = int(act["duration"])
            crash_dur = int(act.get("crash_duration", normal_dur))
            normal_cost = float(act.get("normal_cost", 0))
            crash_cost = float(act.get("crash_cost", 0))

            max_crash_days = normal_dur - crash_dur

            if max_crash_days <= 0:
                cost_slope = float("inf")
            else:
                cost_slope = (crash_cost - normal_cost) / max_crash_days

            analyses.append(
                CrashAnalysis(
                    activity_id=act["id"],
                    name=act["name"],
                    normal_duration=normal_dur,
                    crash_duration=crash_dur,
                    normal_cost=normal_cost,
                    crash_cost=crash_cost,
                    cost_slope=cost_slope,
                    max_crash_days=max_crash_days,
                )
            )

        # Sort by cost slope (cheapest to crash first)
        analyses.sort(key=lambda x: x.cost_slope)

        return analyses

    def compute_optimal_crashing(
        self,
        critical_activities: list[dict[str, Any]],
        delay_days: int,
    ) -> PenaltyResult:
        """Full penalty-vs-crash analysis with optimal crashing allocation.

        Greedily allocates crash days to the cheapest activities first,
        up to the number of delay days that need recovery.

        Args:
            critical_activities: Activities on the critical path.
            delay_days: Number of delay days to potentially recover.

        Returns:
            PenaltyResult with penalty, crash costs, and recommendation.
        """
        interest_rate = self.sbi_mclr_rate + 2.0
        penalty_amount = self.compute_penalty(delay_days)

        crash_analyses = self.analyze_crash_options(critical_activities)

        remaining_days = delay_days
        total_crash_cost = 0.0
        days_recovered = 0

        for ca in crash_analyses:
            if remaining_days <= 0:
                break

            if ca.max_crash_days <= 0 or ca.cost_slope == float("inf"):
                continue

            crash_days = min(remaining_days, ca.max_crash_days)
            crash_cost = ca.cost_slope * crash_days

            ca.applied_crash_days = crash_days
            ca.applied_crash_cost = crash_cost

            total_crash_cost += crash_cost
            days_recovered += crash_days
            remaining_days -= crash_days

        if delay_days <= 0:
            recommendation = "ON_SCHEDULE"
            savings = 0.0
        elif total_crash_cost < penalty_amount:
            recommendation = "CRASH"
            savings = penalty_amount - total_crash_cost
        elif total_crash_cost == penalty_amount:
            recommendation = "NEUTRAL"
            savings = 0.0
        else:
            recommendation = "ACCEPT_PENALTY"
            savings = total_crash_cost - penalty_amount

        result = PenaltyResult(
            delay_days=delay_days,
            sbi_mclr_rate=self.sbi_mclr_rate,
            interest_rate=interest_rate,
            amount_collected=self.amount_collected,
            penalty_amount=penalty_amount,
            crash_analyses=crash_analyses,
            total_crash_cost=total_crash_cost,
            days_recoverable=days_recovered,
            recommendation=recommendation,
            savings=savings,
        )

        logger.info(
            "Penalty analysis: delay=%d days, penalty=Rs.%.2f, crash_cost=Rs.%.2f -> %s (save Rs.%.2f)",
            delay_days,
            penalty_amount,
            total_crash_cost,
            recommendation,
            savings,
        )

        return result
