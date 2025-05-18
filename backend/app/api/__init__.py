"""API package."""

from .v1.routes import api_router as v1_router

__all__ = ["v1_router"]
