"""Core package: generic, domain-agnostic data-quality engine.

The core never references recruitment-specific concepts (candidate, aprovação,
salário). Domain packs under ``app.domains`` add aliases, cleaning rules, KPIs and
statistics on top of this foundation.
"""

from app.core.versions import (
    ANALYSIS_ENGINE_VERSION,
    METHODOLOGY_VERSION,
    SCORE_POLICY_VERSION,
)

__all__ = [
    "METHODOLOGY_VERSION",
    "SCORE_POLICY_VERSION",
    "ANALYSIS_ENGINE_VERSION",
]
