# app/main.py
"""
FastAPI entry‑point.

Run dev server:
    poetry run uvicorn app.main:app --reload
"""

from __future__ import annotations

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session_manager import create_db_and_tables
from app.services.strategy_engine.engine import StrategyEngine
from app.services.monte_carlo_service import MonteCarloService
from app.utils.year_data_loader import load_tax_year_data
from app.api.v1.routes import api_router

# ------------------------------------------------------------------ #
# logging
# ------------------------------------------------------------------ #
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(levelname)s:%(name)s:%(message)s",
)
logger = logging.getLogger("rrif_api")

# ------------------------------------------------------------------ #
# top‑level FastAPI app
# ------------------------------------------------------------------ #
app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Simulate tax‑efficient RRIF/RRSP withdrawal strategies",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False if "*" in settings.ALLOWED_CORS_ORIGINS else True,
)

# ------------------------------------------------------------------ #
# database init (runs once at start‑up)
# ------------------------------------------------------------------ #
@app.on_event("startup")
async def _init_db() -> None:
    logger.info("Creating DB tables if missing …")
    await create_db_and_tables()
    logger.info("DB ready.")

# ------------------------------------------------------------------ #
# services initialisation
# ------------------------------------------------------------------ #
@app.on_event("startup")
async def _init_services() -> None:
    app.state.engine = StrategyEngine(tax_year_data_loader=load_tax_year_data)
    app.state.mc_service = MonteCarloService(
        engine_factory=lambda: StrategyEngine(tax_year_data_loader=load_tax_year_data),
        n_trials=1_000,
    )


# ------------------------------------------------------------------ #
# mount router on app
# ------------------------------------------------------------------ #
app.include_router(api_router, prefix=settings.API_PREFIX)

