from typing import List, Dict, Any, Optional

from pydantic import BaseModel, Field

from app.core.issues import Issue as IssueModel
from app.core.versions import (
    METHODOLOGY_VERSION,
    SCORE_POLICY_VERSION,
    ANALYSIS_ENGINE_VERSION,
)


class CandidateRecord(BaseModel):
    candidate_id: Optional[str] = None
    timestamp: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    education_level: Optional[str] = None
    experience_years: Optional[float] = None
    source_channel: Optional[str] = None
    role_applied: Optional[str] = None
    stage: Optional[str] = None
    score_test: Optional[float] = None
    score_interview: Optional[float] = None
    final_status: Optional[str] = None
    salary_expectation: Optional[float] = None
    availability: Optional[str] = None
    remote_preference: Optional[str] = None


class ColumnStats(BaseModel):
    mean: Optional[float] = None
    median: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    std: Optional[float] = None


class CategoryCount(BaseModel):
    value: str
    count: int
    rate: float


class ColumnProfile(BaseModel):
    name: str
    inferred_type: str  # 'string' | 'number' | 'date' | 'boolean' | 'unknown'
    missing_count: int
    missing_rate: float
    unique_count: int
    unique_rate: float
    flags: List[str] = Field(default_factory=list)
    stats: Optional[ColumnStats] = None
    top_values: Optional[List[CategoryCount]] = None


class QualityScore(BaseModel):
    overall: int
    dimension_scores: Dict[str, float] = Field(default_factory=dict)
    weights: Dict[str, float] = Field(default_factory=dict)
    policy_version: str = SCORE_POLICY_VERSION
    issues: List[IssueModel] = Field(default_factory=list)
    penalties: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = 1.0
    applicability: str = "screening heuristic for tabular data readiness"


class QualitySummary(BaseModel):
    health_score: int  # DEPRECATED alias of score.overall; kept for backward compat
    summary: str
    columns: List[ColumnProfile]
    dataset_flags: List[str] = Field(default_factory=list)
    score: QualityScore


class InferenceResult(BaseModel):
    test_name: str
    test_type: str = "unknown"
    variables: List[str]
    n_total: Optional[int] = None
    group_sizes: Optional[Dict[str, int]] = None
    statistic: Optional[float] = None
    # Raw (uncorrected) p-value. Kept as `p_value` for backward compatibility.
    p_value: float
    effect_size: Optional[float] = None
    effect_size_name: Optional[str] = None
    significance: bool  # DEPRECATED alias of significant_raw
    # Multiple-comparison correction
    nominal_alpha: float = 0.05
    bonferroni_alpha: Optional[float] = None
    corrected_significance: Optional[bool] = None
    p_value_adjusted: Optional[float] = None
    significant_raw: Optional[bool] = None
    significant_adjusted: Optional[bool] = None
    correction_method: Optional[str] = None
    assumptions: List[str] = Field(default_factory=list)
    assumption_checks: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    interpretation: str
    limitations: str
    decision_scope: Optional[str] = None


class AnalysisMetadata(BaseModel):
    generated_at: str
    source: str  # 'demo' | 'upload'
    rows: int
    columns: int
    methodology_version: str = METHODOLOGY_VERSION
    score_policy_version: str = SCORE_POLICY_VERSION
    analysis_engine_version: str = ANALYSIS_ENGINE_VERSION
    privacy_mode: str = "demo"
    request_id: Optional[str] = None
    parse_warnings: List[str] = Field(default_factory=list)
    encoding_used: Optional[str] = None
    delimiter_used: Optional[str] = None


class AnalysisResponse(BaseModel):
    metadata: AnalysisMetadata
    quality: QualitySummary
    kpis: Dict[str, Any] = Field(default_factory=dict)
    charts: Dict[str, Any] = Field(default_factory=dict)
    inference: List[InferenceResult] = Field(default_factory=list)
    insights: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    records: List[Dict[str, Any]] = Field(default_factory=list)
    original_columns: List[str] = Field(default_factory=list)
    privacy_mode: str = "demo"
    request_id: Optional[str] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
