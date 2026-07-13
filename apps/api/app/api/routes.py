import os
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional, Dict, List, Any

from app.models.schemas import (
    AnalysisResponse,
    AnalysisMetadata,
    QualitySummary,
    InferenceResult,
    HealthScoreBreakdown,
)
from app.services.parser import CSVParser
from app.services.mapper import ColumnMapper
from app.services.cleaner import DataCleaner
from app.services.profiler import DataProfiler
from app.services.aggregator import DataAggregator
from app.services.inference import InferenceEngine
from app.services.masking import mask_records

router = APIRouter()

_ROUTES_FILE = os.path.abspath(__file__)      # .../DataFlow/apps/api/app/api/routes.py
_APP_DIR = os.path.dirname(os.path.dirname(_ROUTES_FILE))  # .../DataFlow/apps/api/app
_API_DIR = os.path.dirname(_APP_DIR)                       # .../DataFlow/apps/api
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_API_DIR)) # .../DataFlow

DEMO_PATH = os.path.join(_PROJECT_ROOT, "data", "seed", "processo_seletivo_demo.csv")

# Canonical schema order used by the frontend table (mapped keys, not raw CSV headers)
SCHEMA_HEADERS: List[str] = [
    "candidate_id",
    "timestamp",
    "name",
    "email",
    "city",
    "state",
    "education_level",
    "experience_years",
    "source_channel",
    "role_applied",
    "stage",
    "score_test",
    "score_interview",
    "final_status",
    "salary_expectation",
    "availability",
    "remote_preference",
    "is_duplicate",
]


def _sanitize_for_json(obj: Any) -> Any:
    """Replace NaN/Inf with None for safe JSON serialization."""
    try:
        import math
        if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
            return None
    except Exception:
        pass
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_json(v) for v in obj]
    return obj


def _allow_pii_reveal() -> bool:
    """Reveal mode only when explicitly enabled (local audit). Never default-on in public demos."""
    return os.getenv("DATAFLOW_ALLOW_PII_REVEAL", "").strip().lower() in {"1", "true", "yes"}


def run_pipeline(
    content_bytes: bytes,
    source: str,
    client_mapping: Optional[Dict[str, Optional[str]]] = None,
    privacy_mode: str = "masked",
) -> AnalysisResponse:
    try:
        # 1. Parse
        records, parse_errors = CSVParser.parse(content_bytes)
        if parse_errors:
            raise HTTPException(status_code=400, detail=parse_errors[0])

        if not records:
            raise HTTPException(status_code=400, detail="Não foi possível extrair registros do arquivo.")

        # Raw CSV headers (for mapping wizard)
        raw_headers = list(records[0].keys())

        # 2. Map
        if client_mapping:
            mapping = client_mapping
        else:
            mapping = ColumnMapper.auto_detect_mapping(raw_headers)

        mapped_records = ColumnMapper.map_records(records, mapping)

        # 3. Clean
        cleaned_records, cleaning_logs = DataCleaner.clean_dataset(mapped_records)

        # 4. Profile & Quality (on full cleaned data, before presentation masking)
        quality_profile = DataProfiler.profile_dataset(cleaned_records)

        # 5. Aggregate KPIs & Charts
        kpis, charts, insights, limitations = DataAggregator.aggregate(cleaned_records)

        # Schema headers present in cleaned records (stable keys for the UI table)
        present_schema = [h for h in SCHEMA_HEADERS if any(h in r for r in cleaned_records[:5])] or SCHEMA_HEADERS

        charts["mapping_config"] = mapping
        charts["available_headers"] = present_schema  # mapped keys (fixes upload table mismatch)
        charts["raw_headers"] = raw_headers
        charts["cleaning_logs"] = cleaning_logs
        if quality_profile.get("health_score_breakdown"):
            charts["health_score_breakdown"] = quality_profile["health_score_breakdown"]

        # 6. Statistical Inference
        inference_results_raw = InferenceEngine.run_all_inference(cleaned_records)
        inference_results = [InferenceResult(**res) for res in inference_results_raw]

        # 7. Privacy: mask PII in payload by default
        effective_privacy = "masked"
        output_records = cleaned_records
        if privacy_mode == "reveal" and _allow_pii_reveal():
            effective_privacy = "reveal"
        else:
            output_records = mask_records(cleaned_records)
            if privacy_mode == "reveal" and not _allow_pii_reveal():
                limitations = list(limitations) + [
                    "Modo revelar PII bloqueado no servidor (defina DATAFLOW_ALLOW_PII_REVEAL=true apenas em ambiente local de auditoria)."
                ]

        metadata = AnalysisMetadata(
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            source=source,
            rows=len(records),
            columns=len(raw_headers),
            privacy_mode=effective_privacy,
            schema_headers=present_schema,
        )

        breakdown_raw = quality_profile.get("health_score_breakdown")
        breakdown = HealthScoreBreakdown(**breakdown_raw) if breakdown_raw else None

        quality_summary = QualitySummary(
            health_score=quality_profile["health_score"],
            summary=quality_profile["summary"],
            columns=quality_profile["columns"],
            dataset_flags=quality_profile["dataset_flags"],
            health_score_breakdown=breakdown,
        )

        return AnalysisResponse(
            metadata=metadata,
            quality=quality_summary,
            kpis=_sanitize_for_json(kpis),
            charts=_sanitize_for_json(charts),
            inference=inference_results,
            insights=insights,
            limitations=limitations,
            records=_sanitize_for_json(output_records),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha no pipeline de análise: {type(e).__name__}: {e}") from e


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "dataflow-api",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/demo", response_model=AnalysisResponse)
def get_demo(privacy_mode: str = Query("masked", pattern="^(masked|reveal)$")):
    if not os.path.exists(DEMO_PATH):
        raise HTTPException(status_code=404, detail="Dataset demo não encontrado no servidor.")

    try:
        with open(DEMO_PATH, "rb") as f:
            content_bytes = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler dataset demo: {str(e)}")

    return run_pipeline(content_bytes, source="demo", privacy_mode=privacy_mode)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    mapping: Optional[str] = Form(None),  # JSON string of mapping configuration
    privacy_mode: str = Form("masked"),
):
    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são suportados na V1.")

    try:
        content_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler arquivo enviado: {str(e)}")

    if privacy_mode not in {"masked", "reveal"}:
        privacy_mode = "masked"

    client_mapping = None
    if mapping:
        try:
            client_mapping = json.loads(mapping)
        except Exception:
            raise HTTPException(status_code=400, detail="Configuração de mapeamento inválida (JSON inválido).")

    return run_pipeline(
        content_bytes,
        source="upload",
        client_mapping=client_mapping,
        privacy_mode=privacy_mode,
    )
