"""Individual withdrawal strategies.

Importing this package registers all strategy classes via the ``register``
decorator in :mod:`app.services.strategy_engine.engine`.
"""

from . import bracket_filling  # noqa: F401
from . import delay_cpp_oas  # noqa: F401
from . import early_rrif_conversion  # noqa: F401
from . import gradual_meltdown  # noqa: F401
from . import interest_offset_loan  # noqa: F401
from . import lump_sum_withdrawal  # noqa: F401
from . import spousal_equalization  # noqa: F401

__all__ = [
    "bracket_filling",
    "delay_cpp_oas",
    "early_rrif_conversion",
    "gradual_meltdown",
    "interest_offset_loan",
    "lump_sum_withdrawal",
    "spousal_equalization",
]
