---
title: "MahaRERA Financial Delay-Penalty vs Crash Cost Engine"
type: "architecture"
tags: ["maharera", "finance", "penalty", "crashing", "decision-engine"]
created: "2026-10-28"
updated: "2026-10-28"
---

# 💰 MahaRERA Section 18 Delay-Penalty vs. Crash Cost Optimizer

> **Lead Module:** `app/engine/penalty/`  
> **Legal Foundation:** Real Estate (Regulation and Development) Act, 2016 (MahaRERA Section 18)  
> **Viva Defense Focus:** Statutory interest rates (SBI MCLR + 2%), activity cost slopes, time-cost trade-off economics.

§

## 📜 The Regulatory Problem (MahaRERA Section 18)

Under MahaRERA Section 18:
* If a promoter fails to complete or give possession of an apartment in accordance with the terms of the agreement for sale by the registered completion date:
* The promoter **must pay interest to all allottees for every month of delay** until possession is handed over.
* **Statutory Prescribed Rate:** **State Bank of India (SBI) Highest Marginal Cost of Funds Based Lending Rate (MCLR) + 2%**.
* Assuming current SBI 1-year MCLR $\approx 8.85\%$, the penalty rate is **$10.85\%$ per annum** on all funds collected.

§

## 🧮 Mathematical Formulations

### 1. Monthly Statutory Penalty
$$\text{Penalty}_{\text{monthly}} = \text{Total Funds Collected} \times \frac{\text{SBI MCLR} + 2\%}{12}$$
$$\text{Penalty}_{\text{daily}} = \frac{\text{Total Funds Collected} \times (\text{SBI MCLR} + 2\%)}{365}$$

### 2. Activity Crash Cost Slope
For any activity $i$ on the Critical Path $\mathcal{CP}$:
* Normal Duration: $D_{n, i}$, Normal Cost: $C_{n, i}$
* Crash Duration: $D_{c, i}$, Crash Cost: $C_{c, i}$
* **Cost Slope ($S_i$):**
  $$S_i = \frac{C_{c, i} - C_{n, i}}{D_{n, i} - D_{c, i}} \quad (\text{₹ per day saved})$$

§

## 🤖 Decision Engine Logic

When site progress reports project completion extending beyond the target RERA delivery date by $\Delta D$ days:

1. Identify all activities on the current Critical Path $\mathcal{CP}$ that have crash potential ($d_i > D_{c, i}$).
2. Compute the Cost Slope $S_i$ for each candidate.
3. Select activity $i^* = \arg\min_{i \in \mathcal{CP}} (S_i)$ (the cheapest activity to crash per day saved).
4. **The Economic Decision Rule:**
   * **If $S_{i^*} < \text{Penalty}_{\text{daily}}$:**  
     👉 **RECOMMENDATION: CRASH ACTIVITY $i^*$** (Hire extra shift / double crews).  
     *Preserves capital because expediting work costs less than statutory compensation.*
   * **If $S_{i^*} \ge \text{Penalty}_{\text{daily}}$:**  
     👉 **RECOMMENDATION: ACCEPT DELAY PENALTY.**  
     *Crashing is economically irrational; builder saves money by accepting the RERA penalty.*

§
