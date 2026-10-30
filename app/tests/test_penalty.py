"""Unit tests for MahaRERA Section 18 Penalty vs Crash Cost Engine."""

import pytest
from app.engine.penalty.penalty_engine import PenaltyEngine


def test_penalty_calculation():
    amount = 50_000_000.0  # Rs. 5 Crore
    mclr = 8.85            # 8.85% -> RERA Rate = 10.85%
    delay = 365            # Exactly 1 year

    engine = PenaltyEngine(sbi_mclr_rate=mclr, amount_collected=amount)
    penalty = engine.compute_penalty(delay_days=delay)

    # 50,000,000 * 10.85% * (365/365) = 5,425,000
    expected = 50_000_000.0 * 0.1085
    assert pytest.approx(penalty, rel=1e-3) == expected


def test_zero_or_negative_delay():
    engine = PenaltyEngine(sbi_mclr_rate=8.85, amount_collected=10_000_000.0)
    assert engine.compute_penalty(delay_days=0) == 0.0
    assert engine.compute_penalty(delay_days=-10) == 0.0


def test_crash_decision_crash_cheaper():
    engine = PenaltyEngine(sbi_mclr_rate=8.85, amount_collected=100_000_000.0)  # Rs. 10 Cr

    critical_acts = [
        {
            "id": "A1",
            "name": "Footing RCC",
            "duration": 10,
            "crash_duration": 6,
            "normal_cost": 500000,
            "crash_cost": 600000,  # 100k for 4 days = 25k/day
        }
    ]

    # For 4 days delay on 10 Cr:
    # Penalty = 100,000,000 * 10.85% * 4/365 = ~118,904
    # Crash cost = 100,000
    # Crash is cheaper!
    result = engine.compute_optimal_crashing(critical_acts, delay_days=4)
    assert result.recommendation == "CRASH"
    assert result.total_crash_cost == 100000.0
    assert result.penalty_amount > result.total_crash_cost
    assert result.savings > 0
