import json
import os
import uuid
from datetime import datetime
from typing import Dict, Optional

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import PlainTextResponse

from app.api.errors import AppError
from app.core import security as sec
from app.core import statistics as st
from app.models.schemas import (
    AnalysisMetadata,
    AnalysisResponse,
    InferenceResult,
    QualitySummary,
)
from app.services.aggregator import DataAggregator
from app.services.cleaner import DataCleaner
from app.services.exporter import records_to_csv
from app.services.inference import InferenceEngine
from app.services.mapper import ColumnMapper
from app.services.parser import CSVParser
from app.services.profiler import DataProfiler

router = APIRouter()

_ROUTES_FILE = os.path.abspath(__file__)
_APP_DIR = os.path.dirname(os.path.dirname(_ROUTES_FILE))
_API_DIR = os.path.dirname(_APP_DIR)
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_API_DIR))

DEMO_PATH = os.path.join(_PROJECT_ROOT, "data", "seed", "processo_seletivo_demo.csv")

NOMINAL_ALPHA = 0.05


def _apply_family_correction(results: list) -> Dict[str, object]:
    """Correct the family of p-values once. Bonferroni by default (Holm available)."""
    pvals = [r["p_value"] for r in results]
    method = os.getenv("DATAFLOW_CORRECTION_METHOD", "bonferroni")
    m = len(pvals)
    bonf_alpha = (NOMINAL_ALPHA / m) if m > 0 else NOMINAL_ALPHA
    if m == 0:
        return {"results": results, "alpha": bonf_alpha, "method": method}
    corr = st.correct_pvalues(pvals, alpha=NOMINAL_ALPHA, method=method)
    for r, adj, rej in zip(results, corr["pvals_corrected"], corr["rejected"]):
        r["p_value_adjusted"] = adj
        r["significant_adjusted"] = bool(rej)
    return {"results": results, "alpha": bonf_alpha, "method": method}


def run_pipeline(
    content_bytes: bytes,
    source: str,
    client_mapping: Optional[Dict[str, Optional[str]]] = None,
    domain: str = "recruitment",
    request_id: str = "",
    privacy_mode: str = "demo",
) -> AnalysisResponse:
    # 1. Parse (safe: empty / malformed handled by parser)
    records, parse_errors = CSVParser.parse(content_bytes)
    if parse_errors:
        raise AppError(status_code=400, code="PARSE_ERROR", message=parse_errors[0])
    if not records:
        raise AppError(
            status_code=400,
            code="EMPTY_FILE",
            message="Não foi possível extrair registros do arquivo.",
        )

    headers = list(records[0].keys())

    # Guardrails on shape
    if len(records) > sec.get_max_rows():
        raise AppError(
            status_code=413,
            code="TOO_MANY_ROWS",
            message=f"O arquivo excede o limite de {sec.get_max_rows()} linhas.",
        )
    if len(headers) > sec.get_max_columns():
        raise AppError(
            status_code=413,
            code="TOO_MANY_COLUMNS",
            message=f"O arquivo excede o limite de {sec.get_max_columns()} colunas.",
        )

    # 2. Map
    mapping = client_mapping or ColumnMapper.auto_detect_mapping(headers)
    mapped_records = ColumnMapper.map_records(records, mapping)

    # 3. Clean
    cleaned_records, cleaning_logs = DataCleaner.clean_dataset(mapped_records)

    # 4. Profile & quality score (Health Score v2)
    quality_profile = DataProfiler.profile_dataset(cleaned_records)

    # 5. Aggregate KPIs & charts
    kpis, charts, insights, limitations = DataAggregator.aggregate(cleaned_records)
    charts["mapping_config"] = mapping
    charts["available_headers"] = headers
    charts["cleaning_logs"] = cleaning_logs

    # 6. Statistical inference + multiple-comparison correction
    inference_results_raw = InferenceEngine.run_all_inference(cleaned_records)
    corrected = _apply_family_correction(inference_results_raw)
    inference_results = [
        InferenceResult(
            **{k: v for k, v in r.items()
               if k not in ("p_value_adjusted", "significant_adjusted", "correction_method")},
            nominal_alpha=NOMINAL_ALPHA,
            bonferroni_alpha=corrected["alpha"],
            corrected_significance=r.get("significant_adjusted"),
            p_value_adjusted=r.get("p_value_adjusted"),
            significant_adjusted=r.get("significant_adjusted"),
            correction_method=corrected["method"],
        )
        for r in corrected["results"]
    ]

    # 7. Assemble
    metadata = AnalysisMetadata(
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        source=source,
        rows=len(records),
        columns=len(headers),
        privacy_mode=privacy_mode,
        request_id=request_id,
    )

    quality_summary = QualitySummary(
        health_score=quality_profile["health_score"],
        summary=quality_profile["summary"],
        columns=quality_profile["columns"],
        dataset_flags=quality_profile["dataset_flags"],
        score=quality_profile["score"],
    )

    # 8. PII: mask records unless explicitly in local raw mode
    records_out = cleaned_records
    if sec.should_mask_records():
        records_out = sec.mask_records(cleaned_records)

    return AnalysisResponse(
        metadata=metadata,
        quality=quality_summary,
        kpis=kpis,
        charts=charts,
        inference=inference_results,
        insights=insights,
        limitations=limitations,
        records=records_out,
        original_columns=headers,
        privacy_mode=privacy_mode,
        request_id=request_id,
    )


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "dataflow-api",
        "timestamp": datetime.now().isoformat(),
        "request_id": uuid.uuid4().hex,
    }


@router.get("/demo", response_model=AnalysisResponse)
def get_demo():
    request_id = uuid.uuid4().hex
    privacy_mode = sec.get_privacy_mode()
    if not os.path.exists(DEMO_PATH):
        raise AppError(
            status_code=404,
            code="DEMO_NOT_FOUND",
            message="Dataset demo não encontrado no servidor.",
        )
    try:
        with open(DEMO_PATH, "rb") as f:
            content_bytes = f.read()
    except OSError:
        raise AppError(
            status_code=500,
            code="DEMO_READ_ERROR",
            message="Erro ao ler dataset demo.",
        )
    return run_pipeline(
        content_bytes, source="demo", request_id=request_id, privacy_mode=privacy_mode
    )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    mapping: Optional[str] = Form(None),
    domain: str = Form("recruitment"),
):
    request_id = uuid.uuid4().hex
    privacy_mode = sec.get_privacy_mode()

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise AppError(
            status_code=400,
            code="INVALID_FILE_TYPE",
            message="Apenas arquivos CSV são suportados (extensão .csv).",
        )

    try:
        content_bytes = await file.read()
    except OSError:
        raise AppError(
            status_code=500,
            code="READ_ERROR",
            message="Erro ao ler o arquivo enviado.",
        )

    if len(content_bytes) > sec.get_max_upload_bytes():
        raise AppError(
            status_code=413,
            code="CSV_TOO_LARGE",
            message="O arquivo excede o limite de upload permitido.",
        )

    client_mapping = None
    if mapping:
        try:
            client_mapping = json.loads(mapping)
        except Exception:
            raise AppError(
                status_code=400,
                code="INVALID_MAPPING",
                message="Configuração de mapeamento inválida (JSON inválido).",
            )

    return run_pipeline(
        content_bytes,
        source="upload",
        client_mapping=client_mapping,
        domain=domain,
        request_id=request_id,
        privacy_mode=privacy_mode,
    )


@router.get("/export")
def export_csv():
    """Download the demo dataset as CSV.

    Returns the same records the API serves, already masked per the active
    privacy mode (demo => masked; local + raw => raw). This is the backend
    guarantee behind the "LGPD masking on export" claim (claim C6 in
    docs/claim_matrix.md): the exported content can never contain raw PII in
    the public demo, and raw mode is an explicit, documented opt-in.
    """
    request_id = uuid.uuid4().hex
    privacy_mode = sec.get_privacy_mode()
    if not os.path.exists(DEMO_PATH):
        raise AppError(
            status_code=404,
            code="DEMO_NOT_FOUND",
            message="Dataset demo não encontrado no servidor.",
        )
    try:
        with open(DEMO_PATH, "rb") as f:
            content_bytes = f.read()
    except OSError:
        raise AppError(
            status_code=500,
            code="DEMO_READ_ERROR",
            message="Erro ao ler dataset demo.",
        )
    response = run_pipeline(
        content_bytes, source="export", request_id=request_id, privacy_mode=privacy_mode
    )
    csv_text = records_to_csv(response.records)
    return PlainTextResponse(
        csv_text,
        headers={
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="dataflow_export.csv"',
        },
    )
