import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.parser import CSVParser
from app.services.mapper import ColumnMapper
from app.services.cleaner import DataCleaner
from app.services.profiler import DataProfiler
from app.services.inference import InferenceEngine
from app.services.masking import mask_email, mask_name, mask_records, mask_salary
from app.api.routes import DEMO_PATH, run_pipeline
import pandas as pd

client = TestClient(app)


def test_parser_valid():
    csv_bytes = b"id,nome,cargo\n1,Felipe,Analista\n2,Mariana,Cientista"
    records, errors = CSVParser.parse(csv_bytes)
    assert not errors
    assert len(records) == 2
    assert records[0]['nome'] == 'Felipe'
    assert records[1]['id'] == '2'


def test_parser_empty():
    records, errors = CSVParser.parse(b"")
    assert errors
    assert len(records) == 0


def test_mapper_autodetect():
    headers = ["Candidato ID", "Data de Inscricao", "Nome Completo", "Pretensao Salarial"]
    mapping = ColumnMapper.auto_detect_mapping(headers)
    assert mapping['candidate_id'] == "Candidato ID"
    assert mapping['timestamp'] == "Data de Inscricao"
    assert mapping['name'] == "Nome Completo"
    assert mapping['salary_expectation'] == "Pretensao Salarial"
    assert mapping['email'] is None


def test_cleaner_casing_and_dates():
    dirty_records = [
        {
            'candidate_id': 'CAN0001',
            'timestamp': '04/06/2026 16:00',
            'name': ' Felipe Baruja ',
            'education_level': 'ensino superior',
            'experience_years': ' 5,5 ',
            'source_channel': 'LINKEDIN',
            'final_status': 'aprovado no processo'
        }
    ]
    cleaned, logs = DataCleaner.clean_dataset(dirty_records)
    assert len(cleaned) == 1
    rec = cleaned[0]
    assert rec['name'] == 'Felipe Baruja'
    assert rec['education_level'] == 'Ensino Superior'
    assert rec['experience_years'] == 5.5
    assert rec['source_channel'] == 'LinkedIn'
    assert rec['final_status'] == 'Aprovado'
    assert rec['timestamp'] == '2026-06-04 16:00:00'


def test_profiler_and_health_score():
    records = [
        {'candidate_id': 'CAN001', 'experience_years': 5.0, 'email': 'valid@example.com', 'is_duplicate': False},
        {'candidate_id': 'CAN002', 'experience_years': 3.0, 'email': 'invalid-email', 'is_duplicate': False},
        {'candidate_id': 'CAN001', 'experience_years': None, 'email': 'valid@example.com', 'is_duplicate': True},
    ]
    profile = DataProfiler.profile_dataset(records)
    assert profile['health_score'] < 100
    assert 'health_score_breakdown' in profile
    assert profile['health_score_breakdown']['final'] == profile['health_score']
    assert profile['health_score_breakdown']['invalid_email_penalty'] == 10
    assert profile['health_score_breakdown']['duplicate_penalty'] >= 2
    assert any("E-mails inválidos" in f for c in profile['columns'] if c['name'] == 'email' for f in c['flags'])


def test_health_score_bounds_empty_dataset():
    profile = DataProfiler.profile_dataset([])
    assert 0 <= profile['health_score'] <= 100


def test_inference_t_test():
    data = []
    for i in range(15):
        data.append({'score_test': 90.0 + i % 5, 'final_status': 'Aprovado'})
    for i in range(15):
        data.append({'score_test': 60.0 + i % 5, 'final_status': 'Reprovado'})

    df = pd.DataFrame(data)
    res = InferenceEngine.run_t_test(df, 'score_test', 'final_status')
    assert res is not None
    assert res['significance'] is True
    assert res['statistic'] > 0
    assert "Aprovados" in res['interpretation']


def test_masking_helpers():
    assert mask_name("Felipe Baruja", "CAN001") == "Candidato CAN001"
    assert mask_email("felipe@empresa.com") == "f***@empresa.com"
    assert mask_salary(7200) == 6500
    masked = mask_records([{
        "candidate_id": "CAN009",
        "name": "Ana Silva",
        "email": "ana@corp.com",
        "salary_expectation": 11000,
        "city": "SP",
    }])[0]
    assert masked["name"] == "Candidato CAN009"
    assert masked["email"].startswith("a***@")
    assert masked["salary_expectation"] == 10000
    assert masked["city"] == "SP"


def test_pipeline_masks_by_default():
    csv_bytes = (
        b"candidate_id,name,email,salary_expectation,final_status,score_test\n"
        b"CAN100,Joao Teste,joao@test.com,9000,Aprovado,88\n"
    )
    result = run_pipeline(csv_bytes, source="upload", privacy_mode="masked")
    assert result.metadata.privacy_mode == "masked"
    assert result.records[0]["name"] == "Candidato CAN100"
    assert "joao@test.com" not in str(result.records[0]["email"])
    assert result.metadata.schema_headers
    assert "candidate_id" in result.metadata.schema_headers


def test_pipeline_reveal_requires_env(monkeypatch):
    csv_bytes = (
        b"candidate_id,name,email,salary_expectation\n"
        b"CAN200,Maria Teste,maria@test.com,5000\n"
    )
    monkeypatch.delenv("DATAFLOW_ALLOW_PII_REVEAL", raising=False)
    result = run_pipeline(csv_bytes, source="upload", privacy_mode="reveal")
    assert result.metadata.privacy_mode == "masked"
    assert result.records[0]["name"] == "Candidato CAN200"

    monkeypatch.setenv("DATAFLOW_ALLOW_PII_REVEAL", "true")
    result2 = run_pipeline(csv_bytes, source="upload", privacy_mode="reveal")
    assert result2.metadata.privacy_mode == "reveal"
    assert result2.records[0]["name"] == "Maria Teste"


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"


@pytest.mark.skipif(not os.path.exists(DEMO_PATH), reason="demo CSV missing")
def test_demo_endpoint_masks_pii():
    res = client.get("/api/demo")
    assert res.status_code == 200
    body = res.json()
    assert body["metadata"]["privacy_mode"] == "masked"
    assert body["quality"]["health_score_breakdown"]["final"] == body["quality"]["health_score"]
    first = body["records"][0]
    assert str(first.get("name", "")).startswith("Candidato ")


def test_demo_case_snapshot_matches_pipeline():
    """Regression: portfolio snapshot must stay aligned with live demo pipeline."""
    import json
    from pathlib import Path

    snapshot_path = Path(__file__).resolve().parents[3] / "data" / "demo_case_snapshot.json"
    assert snapshot_path.exists(), "missing data/demo_case_snapshot.json"
    snap = json.loads(snapshot_path.read_text(encoding="utf-8"))

    assert os.path.exists(DEMO_PATH)
    with open(DEMO_PATH, "rb") as f:
        result = run_pipeline(f.read(), source="demo", privacy_mode="masked")

    m = snap["metrics"]
    assert result.metadata.rows == m["rows_ingested"]
    assert result.kpis["valid_candidates"] == m["rows_valid"]
    assert result.kpis["duplicate_count"] == m["duplicate_count"]
    assert result.quality.health_score == m["health_score"]
    assert result.quality.health_score_breakdown is not None
    assert result.quality.health_score_breakdown.final == snap["health_score_breakdown"]["final"]
    assert result.metadata.privacy_mode == "masked"


def test_analyze_rejects_non_csv():
    res = client.post(
        "/api/analyze",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 400
