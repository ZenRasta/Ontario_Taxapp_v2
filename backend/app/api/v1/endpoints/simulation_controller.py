"""Simulation-related API endpoints."""
from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi import Request

from app.data_models import (
    SimulateRequest,
    CompareRequest,
    StrategyParamsInput,
    GoalEnum,
    StrategyCodeEnum,
    SimulationResponse as SimulationApiResponse,
    CompareResponse as CompareApiResponse,
    ComparisonResponseItem,
    MonteCarloPath,
    SummaryMetrics,
)
from app.services.strategy_engine.engine import StrategyEngine, _STRATEGY_REGISTRY
from app.services.monte_carlo_service import MonteCarloService

logger = logging.getLogger(__name__)

router = APIRouter()


def get_engine(request: Request) -> StrategyEngine:
    return request.app.state.engine


def get_mc_service(request: Request) -> MonteCarloService:
    return request.app.state.mc_service


# ------------------------------------------------------------------
# helpers
# ------------------------------------------------------------------

def _strategy_display(code: StrategyCodeEnum) -> str:
    cls = _STRATEGY_REGISTRY.get(code)
    return getattr(cls, "display_name", code.value)


def _auto_strategies(goal: GoalEnum) -> List[StrategyCodeEnum]:
    match goal:
        case GoalEnum.MINIMIZE_TAX:
            return [StrategyCodeEnum.BF, StrategyCodeEnum.SEQ, StrategyCodeEnum.GM]
        case GoalEnum.MAXIMIZE_SPENDING:
            return [StrategyCodeEnum.CD, StrategyCodeEnum.GM, StrategyCodeEnum.LS]
        case GoalEnum.PRESERVE_ESTATE:
            return [StrategyCodeEnum.EBX, StrategyCodeEnum.LS, StrategyCodeEnum.SEQ]
        case GoalEnum.SIMPLIFY:
            return [StrategyCodeEnum.MIN, StrategyCodeEnum.GM]
    return [StrategyCodeEnum.GM]


@router.post("/simulate", response_model=SimulationApiResponse, tags=["Simulation"])
async def simulate(
    req: SimulateRequest,
    engine: StrategyEngine = Depends(get_engine),
) -> SimulationApiResponse:
    logger.info("simulate request_id=%s strategy=%s", req.request_id, req.strategy_code)
    params = req.scenario.strategy_params_override or StrategyParamsInput()
    yearly, summary = engine.run(req.scenario, req.strategy_code, params)
    return SimulationApiResponse(
        request_id=req.request_id,
        strategy_code=req.strategy_code,
        strategy_name=_strategy_display(req.strategy_code),
        yearly_results=yearly,
        summary=summary,
    )


@router.post("/compare", response_model=CompareApiResponse, tags=["Simulation"])
async def compare(
    req: CompareRequest,
    engine: StrategyEngine = Depends(get_engine),
) -> CompareApiResponse:
    logger.info("compare request_id=%s", req.request_id)
    if req.strategies == ["auto"]:
        codes = _auto_strategies(req.scenario.goal)
    elif not req.strategies:
        raise HTTPException(400, "strategies list cannot be empty")
    else:
        codes = req.strategies
    params = req.scenario.strategy_params_override or StrategyParamsInput()
    items: List[ComparisonResponseItem] = []
    for code in codes:
        try:
            yearly, summary = engine.run(req.scenario, code, params)
            items.append(
                ComparisonResponseItem(
                    strategy_code=code,
                    strategy_name=_strategy_display(code),
                    yearly_results=yearly,
                    summary=summary,
                )
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("compare error for %s: %s", code, exc)
            items.append(
                ComparisonResponseItem(
                    strategy_code=code,
                    strategy_name=_strategy_display(code),
                    yearly_results=[],
                    summary=None,
                    error_detail=str(exc),
                )
            )
    return CompareApiResponse(request_id=req.request_id, comparisons=items)


@router.post(
    "/simulate_mc",
    response_model=dict,
    tags=["Monte-Carlo"],
    summary="Run Monte-Carlo simulation for a single strategy",
)
async def simulate_mc(
    req: SimulateRequest,
    mc_service: MonteCarloService = Depends(get_mc_service),
) -> dict:
    logger.info("simulate_mc request_id=%s strategy=%s", req.request_id, req.strategy_code)
    params = req.scenario.strategy_params_override or StrategyParamsInput()
    paths, mc_summary = mc_service.run(
        scenario=req.scenario,
        strategy_code=req.strategy_code,
        params=params,
    )
    return {
        "request_id": req.request_id,
        "paths": paths,
        "mc_summary": mc_summary,
    }


@router.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "healthy"}
