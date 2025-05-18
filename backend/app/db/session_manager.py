# app/db/session_manager.py
from __future__ import annotations

from typing import AsyncGenerator, Any

try:
    from sqlalchemy.ext.asyncio import (
        create_async_engine,
        AsyncSession,
        async_sessionmaker,
    )
    from sqlalchemy.orm import declarative_base
    from sqlalchemy.pool import NullPool
    SQLALCHEMY_AVAILABLE = True
except Exception:  # noqa: BLE001
    SQLALCHEMY_AVAILABLE = False

from app.core.config import settings

# --------------------------------------------------------------------- #
# Engine
# --------------------------------------------------------------------- #
connect_args = {}

if SQLALCHEMY_AVAILABLE:
    # sqlite quirks in dev
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    async_engine = create_async_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        echo=settings.ENVIRONMENT.lower() == "development",
        future=True,
        poolclass=NullPool if connect_args else None,
        connect_args=connect_args,
    )
else:
    async_engine = None

# --------------------------------------------------------------------- #
# Session factory
# --------------------------------------------------------------------- #
if SQLALCHEMY_AVAILABLE:
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        autoflush=False,
        expire_on_commit=False,
    )
else:
    AsyncSessionLocal = None

# --------------------------------------------------------------------- #
# Declarative base
# --------------------------------------------------------------------- #
# Prefer importing Base from your models file so everything shares ONE MetaData
if SQLALCHEMY_AVAILABLE:
    try:
        from app.db.schemas import DbBase  # noqa: F401
    except Exception:
        from sqlalchemy.orm import declarative_base

        DbBase = declarative_base()
else:
    DbBase = None

# --------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------- #
async def create_db_and_tables() -> None:
    """Run at startup to create missing tables."""
    if not SQLALCHEMY_AVAILABLE or async_engine is None:
        return
    async with async_engine.begin() as conn:
        await conn.run_sync(DbBase.metadata.create_all)


async def get_async_db_session() -> AsyncGenerator[Any, None]:
    """
    FastAPI dependency providing an `AsyncSession`.
    Leave transaction control to route/CRUD layer.
    """
    if not SQLALCHEMY_AVAILABLE or AsyncSessionLocal is None:
        yield None
        return
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

