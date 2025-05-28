"""
Central dispatcher for running withdrawal strategies.

Original functions/classes are preserved.  Only two small additions:

    • run_strategy_batch()  ← new helper the /simulate route calls
    • _STRATEGY_REGISTRY    ← already existed but we expose it here

Everything else (individual strategy classes) lives unchanged in
backend/app/services/strategy_engine/strategies/*.py
"""

from __future__ import annotations

from typing import List, Dict, Type, Tuple

from app.data_models.scenario import (
    ScenarioInput,
    StrategyParamsInput,
    StrategyCodeEnum,
)
from app.data_models.results import ResultSummary, SummaryMetrics, YearlyResult
from app.services.strategy_engine.strategies.base_strategy import BaseStrategy
from app.utils.year_data_loader import load_tax_year_data


# ------------------------------------------------------------------
# Existing registry mapping code -> concrete Strategy class
# (the individual strategy modules register themselves on import)
# ------------------------------------------------------------------

_STRATEGY_REGISTRY: Dict[str, Type[BaseStrategy]] = {}


def register(code: str):
    """Decorator used by each strategy class to self-register"""
    def inner(cls: Type[BaseStrategy]):
        _STRATEGY_REGISTRY[code] = cls
        cls.code = code
        return cls
    return inner


# ------------------------------------------------------------------
# Load all strategy modules so decorators run on import
# ------------------------------------------------------------------
from . import strategies as _loaded_strategies  # noqa: F401


# ------------------------------------------------------------------
# Existing helper for single-strategy execution (unchanged)
# ------------------------------------------------------------------

def run_single_strategy(
    code: StrategyCodeEnum,
    scenario: ScenarioInput,
    params: StrategyParamsInput,
    tax_loader=load_tax_year_data,
) -> Tuple[List[YearlyResult], SummaryMetrics]:
    """Instantiate and execute a single strategy."""
    try:
        strategy_cls = _STRATEGY_REGISTRY[code]
    except KeyError:
        raise ValueError(f"Unknown strategy code '{code}'")

    engine = strategy_cls(scenario, params, tax_loader)
    return engine.run()


# ────────────────────────────────────────────────────────────────────────────
# ★ NEW batch helper – returns List[ResultSummary] for wizard UI
# ────────────────────────────────────────────────────────────────────────────
def run_strategy_batch(
    scenario: ScenarioInput,
    params: StrategyParamsInput,
    tax_loader=load_tax_year_data,
) -> List[ResultSummary]:
    """
    Loop over the user-selected strategy codes and build a
    ResultSummary for each (thin wrapper around existing logic).
    """
    summaries: List[ResultSummary] = []
    for code in scenario.strategies:
        yearly, metrics = run_single_strategy(code, scenario, params, tax_loader)
        name = (
            code.value if isinstance(code, StrategyCodeEnum) else str(code)
        ).replace("_", " ").title()

        summaries.append(
            ResultSummary(
                strategy_code=code,
                strategy_name=name,
                total_taxes=metrics.lifetime_tax_paid_nominal,
                total_spending=metrics.average_annual_real_spending,
                final_estate=metrics.final_total_portfolio_value_nominal,
                yearly_balances=[
                    YearlyResult(
                        year=r.year,
                        portfolio_end=r.end_rrif_balance
                        + r.end_tfsa_balance
                        + r.end_non_reg_balance,
                    )
                    for r in yearly
                ],
            )
        )
    return summaries

# ──────────────────────────────────────────────────────────────────
# ⚙️  Compatibility wrapper — keeps old imports working
# ──────────────────────────────────────────────────────────────────
class StrategyEngine:
    """
    Thin wrapper around the new functional helpers so legacy code that
    does things like:
        StrategyEngine(tax_year_data_loader=loader)
        StrategyEngine(scenario).run("GM")
    still works.
    """

    def __init__(
        self,
        scenario: ScenarioInput | None = None,
        tax_year_data_loader=load_tax_year_data,
        **_ignored,
    ):
        self.scenario = scenario
        self.tax_year_data_loader = tax_year_data_loader

    # ---------- legacy instance methods ---------------------------
    def run(
        self,
        scenario: ScenarioInput,
        code: StrategyCodeEnum,
        params: StrategyParamsInput,
    ) -> Tuple[List[YearlyResult], SummaryMetrics]:
        """Run a single strategy and return yearly + summary results."""
        sc = scenario or self.scenario
        if sc is None:
            raise ValueError("Scenario must be supplied.")
        return run_single_strategy(code, sc, params, self.tax_year_data_loader)

    def run_batch(
        self,
        scenario: ScenarioInput,
        params: StrategyParamsInput,
    ) -> List[ResultSummary]:
        """Run all codes in the scenario for the wizard UI."""
        sc = scenario or self.scenario
        if sc is None:
            raise ValueError("Scenario must be supplied.")
        return run_strategy_batch(sc, params, self.tax_year_data_loader)

