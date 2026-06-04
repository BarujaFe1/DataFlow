import os
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict

from app.models.schemas import AnalysisResponse, AnalysisMetadata, QualitySummary, InferenceResult
from app.services.parser import CSVParser
from app.services.mapper import ColumnMapper
from app.services.cleaner import DataCleaner
from app.services.profiler import DataProfiler
from app.services.aggregator import DataAggregator
from app.services.inference import InferenceEngine

router = APIRouter()

DEMO_PATH = "C:\\dev\\DataFlow\\data\\seed\\processo_seletivo_demo.csv"

def run_pipeline(content_bytes: bytes, source: str, client_mapping: Optional[Dict[str, Optional[str]]] = None) -> AnalysisResponse:
    # 1. Parse
    records, parse_errors = CSVParser.parse(content_bytes)
    if parse_errors:
        raise HTTPException(status_code=400, detail=parse_errors[0])
        
    if not records:
        raise HTTPException(status_code=400, detail="Não foi possível extrair registros do arquivo.")

    # Get headers
    headers = list(records[0].keys())

    # 2. Map
    if client_mapping:
        mapping = client_mapping
    else:
        # Auto-detect mapping
        mapping = ColumnMapper.auto_detect_mapping(headers)
        
    mapped_records = ColumnMapper.map_records(records, mapping)

    # 3. Clean
    cleaned_records, cleaning_logs = DataCleaner.clean_dataset(mapped_records)

    # 4. Profile & Quality
    quality_profile = DataProfiler.profile_dataset(cleaned_records)

    # 5. Aggregate KPIs & Charts
    kpis, charts, insights, limitations = DataAggregator.aggregate(cleaned_records)
    
    # Add mapping and raw header information in charts metadata for the frontend
    charts['mapping_config'] = mapping
    charts['available_headers'] = headers
    charts['cleaning_logs'] = cleaning_logs

    # 6. Statistical Inference
    inference_results_raw = InferenceEngine.run_all_inference(cleaned_records)
    inference_results = [InferenceResult(**res) for res in inference_results_raw]

    # Assemble response
    metadata = AnalysisMetadata(
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        source=source,
        rows=len(records),
        columns=len(headers)
    )

    quality_summary = QualitySummary(
        health_score=quality_profile['health_score'],
        summary=quality_profile['summary'],
        columns=quality_profile['columns'],
        dataset_flags=quality_profile['dataset_flags']
    )

    # Convert pandas NaN/None inside charts/kpis
    # JSON serialization is handled by FastAPI, but let's ensure clean native types
    
    return AnalysisResponse(
        metadata=metadata,
        quality=quality_summary,
        kpis=kpis,
        charts=charts,
        inference=inference_results,
        insights=insights,
        limitations=limitations,
        records=cleaned_records
    )

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "dataflow-api",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/demo", response_model=AnalysisResponse)
def get_demo():
    if not os.path.exists(DEMO_PATH):
        raise HTTPException(status_code=404, detail="Dataset demo não encontrado no servidor.")
        
    try:
        with open(DEMO_PATH, "rb") as f:
            content_bytes = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler dataset demo: {str(e)}")
        
    return run_pipeline(content_bytes, source="demo")

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    mapping: Optional[str] = Form(None) # JSON string of mapping configuration
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são suportados na V1.")
        
    try:
        content_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler arquivo enviado: {str(e)}")
        
    client_mapping = None
    if mapping:
        try:
            client_mapping = json.loads(mapping)
        except Exception:
            raise HTTPException(status_code=400, detail="Configuração de mapeamento inválida (JSON inválido).")
            
    return run_pipeline(content_bytes, source="upload", client_mapping=client_mapping)
