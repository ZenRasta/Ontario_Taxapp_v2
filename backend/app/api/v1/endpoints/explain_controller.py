"""Endpoints providing LLM-generated strategy explanations."""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.data_models import ExplainRequest, ExplainApiResponse
from app.services.llm_service import explain_strategy_with_context

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/explain", response_model=ExplainApiResponse, tags=["Explain"])
async def explain(req: ExplainRequest) -> ExplainApiResponse:
    logger.info("explain request goal=%s strategy=%s", req.goal, req.strategy_code)
    try:
        text = await explain_strategy_with_context(
            scenario=req.scenario,
            strategy_code=req.strategy_code,
            summary_metrics=req.summary,
            goal=req.goal,
            yearly_results=req.yearly_results,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("LLM explain error: %s", exc)
        raise HTTPException(500, "Failed to generate explanation") from exc
    return ExplainApiResponse(explanation=text)
