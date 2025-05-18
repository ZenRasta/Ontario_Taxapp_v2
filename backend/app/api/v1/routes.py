"""Aggregate router for API v1."""
from __future__ import annotations

from fastapi import APIRouter

from .endpoints import simulation_router, explain_router, metrics_router

api_router = APIRouter()
api_router.include_router(simulation_router)
api_router.include_router(explain_router)
api_router.include_router(metrics_router)

__all__ = ["api_router"]
