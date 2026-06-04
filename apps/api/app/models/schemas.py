from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

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
    inferred_type: str # 'string' | 'number' | 'date' | 'boolean' | 'unknown'
    missing_count: int
    missing_rate: float
    unique_count: int
    unique_rate: float
    flags: List[str] = []
    stats: Optional[ColumnStats] = None
    top_values: Optional[List[CategoryCount]] = None

class QualitySummary(BaseModel):
    health_score: int
    summary: str
    columns: List[ColumnProfile]
    dataset_flags: List[str] = []

class InferenceResult(BaseModel):
    test_name: str
    variables: List[str]
    statistic: float
    p_value: float
    effect_size: Optional[float] = None
    significance: bool
    interpretation: str
    limitations: str

class AnalysisMetadata(BaseModel):
    generated_at: str
    source: str # 'demo' | 'upload'
    rows: int
    columns: int

class AnalysisResponse(BaseModel):
    metadata: AnalysisMetadata
    quality: QualitySummary
    kpis: Dict[str, Any]
    charts: Dict[str, Any]
    inference: List[InferenceResult]
    insights: List[str]
    limitations: List[str]
    records: List[Dict[str, Any]] = []
