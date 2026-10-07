# SPPU Mathematical Model for Opti Build

In accordance with the Savitribai Phule Pune University (SPPU) BE Project evaluation scheme, the proposed system is mathematically modeled using Set Theory.

---

## 1. System Formal Definition
Let the system $S$ be represented as a 7-tuple:

$$S = \{ I, O, F, DD, NDD, S_{success}, S_{failure} \}$$

Where:
- **$I$ (Input Set):** The set of all valid system inputs.
  $$I = \{ U_c, C_{req}, P_{params}, F_{data} \}$$
  - $U_c$: User configuration and preferences.
  - $C_{req}$: Operational constraints (budget, hardware/software specifications, deadlines).
  - $P_{params}$: System parameters and weights.
  - $F_{data}$: Real-time user feedback and telemetry collected via Jira.

- **$O$ (Output Set):** The set of optimized deliverables produced by the system.
  $$O = \{ R_{opt}, M_{eval}, T_{jira} \}$$
  - $R_{opt}$: Optimized recommendation / build matrix.
  - $M_{eval}$: Quantitative performance metrics (cost reduction %, latency, efficiency).
  - $T_{jira}$: Structured Jira issue/ticket references created from feedback.

- **$F$ (Function Set):** The set of transformation functions:
  $$F = \{ f_{validate}, f_{optimize}, f_{rank}, f_{feedback\_sync} \}$$
  - $f_{validate}: I \to \{0, 1\}$: Validates input feasibility against boundary constraints.
  - $f_{optimize}: I \to R_{candidates}$: Executes multi-objective optimization algorithm.
  - $f_{rank}: R_{candidates} \to R_{opt}$: Ranks the Pareto-optimal candidate solutions.
  - $f_{feedback\_sync}: F_{data} \to T_{jira}$: Maps runtime anomalies/feedback into Jira issues.

---

## 2. Deterministic & Non-Deterministic States
- **$DD$ (Deterministic Data):** Predictable and static constraints (e.g., fixed hardware limits, database schemas, API specs).
- **$NDD$ (Non-Deterministic Data):** Dynamic variables, varying user inputs, network latency, and live user feedback ratings.

---

## 3. Success and Failure Conditions
- **$S_{success}$:**
  $$S_{success} \iff \text{Optimal build generated within time } t < t_{max} \land \text{Constraints satisfied } C_{req} = \text{True}$$
- **$S_{failure}$:**
  $$S_{failure} \iff \text{Infeasible constraint set } \lor \text{Timeout } t \ge t_{max} \lor \text{Optimization divergence}$$
