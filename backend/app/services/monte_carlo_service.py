from __future__ import annotations

from typing import Callable, List, Tuple

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except Exception:  # noqa: BLE001
    import random
    NUMPY_AVAILABLE = False

from app.data_models.results import MonteCarloPath, SummaryMetrics
from app.data_models.scenario import (
    ScenarioInput,
    StrategyCodeEnum,
    StrategyParamsInput,
)
from app.services.strategy_engine.engine import StrategyEngine


class MonteCarloService:
    """Simple Monte‑Carlo simulator wrapping the deterministic engine."""

    def __init__(self, engine_factory: Callable[[], StrategyEngine], n_trials: int = 1000, seed: int | None = None) -> None:
        self.engine_factory = engine_factory
        self.n_trials = n_trials
        if NUMPY_AVAILABLE:
            self.rng = np.random.default_rng(seed)
        else:
            random.seed(seed)
            self.rng = random

    # --------------------------------------------------------------
    def run(
        self,
        scenario: ScenarioInput,
        strategy_code: StrategyCodeEnum,
        params: StrategyParamsInput,
    ) -> Tuple[List[MonteCarloPath], SummaryMetrics]:
        """Run Monte‑Carlo simulation for a given scenario and strategy."""
        engine = self.engine_factory()
        yearly, summary = engine.run(scenario, strategy_code, params)

        mean = scenario.expect_return_pct / 100.0
        sigma = scenario.stddev_return_pct / 100.0
        start_balance = scenario.rrsp_balance + scenario.tfsa_balance

        paths: List[MonteCarloPath] = []
        final_vals = []
        ruin_years = []

        for trial in range(self.n_trials):
            bal = start_balance
            rrif_bal = scenario.rrsp_balance
            portfolio_vals = []
            rrif_vals = []
            withdrawals = []
            ruined = None
            for idx, yr in enumerate(yearly):
                if NUMPY_AVAILABLE:
                    ret = self.rng.normal(mean, sigma)
                else:
                    ret = self.rng.normalvariate(mean, sigma)
                bal *= 1 + ret
                rrif_bal *= 1 + ret
                w = yr.income_sources.rrif_withdrawal
                bal -= w
                rrif_bal -= w
                withdrawals.append(w)
                if bal <= 0 and ruined is None:
                    ruined = idx + 1
                    bal = 0
                    rrif_bal = 0
                portfolio_vals.append(bal)
                rrif_vals.append(rrif_bal)
            final_vals.append(bal)
            ruin_years.append(ruined)
            paths.append(
                MonteCarloPath(
                    trial_id=trial,
                    yearly_portfolio_values=portfolio_vals,
                    yearly_rrif_values=rrif_vals,
                    yearly_net_withdrawals=withdrawals,
                    ruined_in_year=ruined,
                    final_portfolio_value=bal,
                )
            )

        ruin_probability_pct = sum(1 for r in ruin_years if r is not None) * 100 / self.n_trials
        if NUMPY_AVAILABLE:
            final_arr = np.array(final_vals)
            median_final = float(np.median(final_arr))
            perc10_final = float(np.percentile(final_arr, 10))
        else:
            final_arr = sorted(final_vals)
            mid = len(final_arr) // 2
            median_final = float(final_arr[mid]) if len(final_arr) % 2 else float((final_arr[mid - 1] + final_arr[mid]) / 2)
            idx10 = max(0, int(len(final_arr) * 0.10) - 1)
            perc10_final = float(final_arr[idx10])
        sequence_risk = median_final - perc10_final
        years_to_ruin = [r for r in ruin_years if r is not None]
        if years_to_ruin:
            if NUMPY_AVAILABLE:
                years_to_ruin_pct10 = int(np.percentile(years_to_ruin, 10))
            else:
                years_to_ruin.sort()
                idx = max(0, int(len(years_to_ruin) * 0.10) - 1)
                years_to_ruin_pct10 = years_to_ruin[idx]
        else:
            years_to_ruin_pct10 = None

        mc_summary_data = summary.dict()
        mc_summary_data.update(
            ruin_probability_pct=ruin_probability_pct,
            sequence_risk_score=sequence_risk,
            years_to_ruin_percentile_10=years_to_ruin_pct10,
        )
        mc_summary = SummaryMetrics(**mc_summary_data)
        return paths, mc_summary
