---
name: RetirePro required-corpus calculation
description: How requiredCorpusAtRetirement must be derived so it stays consistent with the plan chart's drawdown simulation.
---

# Required corpus must come from the real drawdown simulation, not a perpetuity shortcut

`requiredCorpusAtRetirement` (in `calculateRetirementPlan`, api-server `src/calculations.ts`) is derived by capturing every post-retirement year's actual net cash flow (income minus inflated expenses, already computed in the main year-by-year loop) and finding the minimum starting balance that keeps the simulated balance non-negative all the way to life expectancy — a discounted running-minimum over those captured cash flows, not a closed-form perpetuity formula.

**Why:** an earlier version used `retirementExpenses / returnPost` (single year's expense ÷ post-retirement return), implicitly assuming a constant expense funded forever at a rate already net of inflation. But the real simulation inflates expenses every year at `inflationHeadline` while compounding at nominal `returnPost` — a materially different model. Whenever the inflation/return spread is meaningful (e.g. 6% inflation vs 8% return), the perpetuity formula understated the required corpus badly enough that the "Funding Gap" KPI read ₹0 while the chart clearly showed the corpus depleting years before life expectancy — a real user-reported bug.

**How to apply:** if you touch the post-retirement math again (new expense categories, pension income streams, changing how drawdown merges buckets, etc.), keep `requiredCorpusAtRetirement` derived from the same cash-flow array the chart uses rather than reintroducing a standalone formula — otherwise the two can silently diverge again. There's a regression test in `calculations.test.ts` ("flags a real funding gap when the corpus depletes years before life expectancy") that reproduces this exact failure mode; keep it passing.
