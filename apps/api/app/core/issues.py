"""Structured data-quality issue model.

An ``Issue`` is a single, explainable finding produced by the profiler/score
engine. Issues are deliberately *information*, not automatic destruction: the
consumer (UI, analyst) decides what to do. Outliers are modelled as
``plausibility`` issues, never as hard errors.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class Issue(BaseModel):
    issue_id: str
    dimension: str  # completeness | uniqueness | validity | consistency | plausibility | schema
    column: Optional[str] = None
    severity: str = "low"  # low | medium | high
    count: int = 0
    rate: float = 0.0
    rule_scope: str = "generic"  # generic | recruitment | <domain>
    evidence: Dict[str, Any] = Field(default_factory=dict)
    penalty: float = 0.0  # contribution to the dimension penalty (already weighted)
    action: str = "review"
    is_auto_fixable: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()
