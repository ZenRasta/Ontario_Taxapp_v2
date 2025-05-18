# app/data_models/explain.py
"""Pydantic models for the /explain endpoint."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field

from app.data_models.scenario import GoalEnum, ScenarioInput, StrategyCodeEnum
from app.data_models.results import SummaryMetrics


class ExplainRequest(BaseModel):
    """Request payload for generating an explanation."""

    scenario: ScenarioInput
    strategy_code: StrategyCodeEnum
    summary: SummaryMetrics
    goal: GoalEnum
    request_id: UUID | None = Field(default=None)


class ExplainApiResponse(BaseModel):
    """Simple wrapper for the explanation text."""

    explanation: str
