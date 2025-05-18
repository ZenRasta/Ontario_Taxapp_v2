"""Metrics retrieval endpoints."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data_models import SummaryMetrics, StrategyCodeEnum
from app.db.schemas import SimulationRun
from app.db.session_manager import get_async_db_session

router = APIRouter()


@router.get("/metrics", response_model=SummaryMetrics, tags=["Metrics"])
async def get_metrics(
    scenario_id: UUID = Query(..., description="Simulation run ID"),
    strategy_code: StrategyCodeEnum = Query(...),
    db: AsyncSession = Depends(get_async_db_session),
) -> SummaryMetrics:
    result = await db.execute(
        select(SimulationRun.summary_json).where(
            SimulationRun.id == str(scenario_id),
            SimulationRun.strategy_code == strategy_code,
        )
    )
    payload = result.scalar_one_or_none()
    if not payload:
        raise HTTPException(status_code=404, detail="Metrics not found")
    return SummaryMetrics(**payload)
