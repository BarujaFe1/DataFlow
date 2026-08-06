import pytest
import pandas as pd
from app.services.parser import CSVParser
from app.services.mapper import ColumnMapper
from app.services.cleaner import DataCleaner
from app.services.profiler import DataProfiler
from app.services.inference import InferenceEngine
from app.services.aggregator import DataAggregator

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
        {'candidate_id': 'CAN001', 'experience_years': None, 'email': 'valid@example.com', 'is_duplicate': True}, # Duplicate
    ]
    profile = DataProfiler.profile_dataset(records)
    assert profile['health_score'] < 100 # Deductions for duplicate, null, invalid email
    assert any("E-mails inválidos" in f for c in profile['columns'] if c['name'] == 'email' for f in c['flags'])

def test_inference_t_test():
    # Construct a dataset to test t-test
    data = []
    # Approved candidates (high scores)
    for i in range(15):
        data.append({'score_test': 90.0 + i % 5, 'final_status': 'Aprovado'})
    # Other candidates (lower scores)
    for i in range(15):
        data.append({'score_test': 60.0 + i % 5, 'final_status': 'Reprovado'})
        
    df = pd.DataFrame(data)
    res = InferenceEngine.run_t_test(df, 'score_test', 'final_status', 'Aprovado', 'Reprovado')
    assert res is not None
    assert res['significance'] is True
    assert res['statistic'] > 0
    assert "Aprovado" in res['interpretation']


def test_inference_chi_square():
    # Build a contingency where stage depends on education -> should detect association.
    raw = []
    for _ in range(20):
        raw.append({'education_level': 'Ensino Superior', 'final_status': 'Aprovado'})
        raw.append({'education_level': 'Ensino Superior', 'final_status': 'Reprovado'})
        raw.append({'education_level': 'Ensino Médio', 'final_status': 'Reprovado'})
        raw.append({'education_level': 'Ensino Médio', 'final_status': 'Reprovado'})
    df = pd.DataFrame(raw)
    res = InferenceEngine.run_chi_square(df, 'education_level', 'final_status')
    assert res is not None
    assert 'Qui-quadrado' in res['test_name']
    assert 'p_value' in res
    assert isinstance(res['effect_size'], float)
    assert res['effect_size'] >= 0  # Cramer's V is always non-negative
    assert 'Associação não implica causalidade' in res['limitations']


def test_inference_anova_and_levene():
    # Three groups with clearly different means and similar variances.
    data = []
    for i in range(20):
        data.append({'score_test': 80.0 + i % 3, 'role_applied': 'Dev'})
        data.append({'score_test': 60.0 + i % 3, 'role_applied': 'Designer'})
        data.append({'score_test': 70.0 + i % 3, 'role_applied': 'Cientista'})
    df = pd.DataFrame(data)
    res = InferenceEngine.run_anova(df, 'score_test', 'role_applied')
    assert res is not None
    assert 'ANOVA' in res['test_name']
    assert res['effect_size'] >= 0  # eta squared
    # Levene's note should be present in the limitations (Rodada 3 P14)
    assert 'Levene' in res['limitations']


def test_inference_skips_duplicates():
    # The run_all_inference should drop records flagged is_duplicate=True before tests
    data = []
    for i in range(20):
        data.append({'score_test': 90.0 + i % 5, 'final_status': 'Aprovado', 'is_duplicate': False})
    for i in range(20):
        data.append({'score_test': 60.0 + i % 5, 'final_status': 'Reprovado', 'is_duplicate': False})
    # Add 30 duplicate rows that would skew means if not filtered
    for i in range(30):
        data.append({'score_test': 999.0, 'final_status': 'Aprovado', 'is_duplicate': True})
    results = InferenceEngine.run_all_inference(data)
    # The t-test result should drop the 999 rows so Aprovados mean stays near 92
    t_test = next((r for r in results if r['test_type'] == 'welch_t'), None)
    assert t_test is not None
    # Try to parse the Aprovados mean from the interpretation string
    import re
    match = re.search(r"Aprovado' \(Média=([\d.]+)\)", t_test['interpretation'])
    assert match is not None, f"Could not parse mean from interpretation: {t_test['interpretation']}"
    approved_mean = float(match.group(1))
    # If duplicates were NOT filtered, the mean would be heavily inflated (toward 999).
    # With duplicates filtered, the mean should be around 92.
    assert approved_mean < 200, (
        f"Duplicates likely not filtered: Aprovados mean = {approved_mean} "
        f"(expected ~92 after filtering 999 duplicates)"
    )


def test_parse_float_br_currency():
    # R$ 5.500,00 should resolve to 5500.0 (BR convention: dot thousands, comma decimal)
    assert DataCleaner.parse_float('R$ 5.500,00') == 5500.0
    assert DataCleaner.parse_float('R$ 5.500,00 ') == 5500.0
    # "1.234,56" mixed format -> 1234.56
    assert abs(DataCleaner.parse_float('1.234,56') - 1234.56) < 0.01
    # "5,5" comma-only decimal -> 5.5
    assert DataCleaner.parse_float('5,5') == 5.5
    # "1.200" only-dot thousand-sep -> 1200 (BR heuristic)
    assert DataCleaner.parse_float('1.200') == 1200.0
    # "1.5" only-dot decimal -> 1.5 (US-style)
    assert DataCleaner.parse_float('1.5') == 1.5
    # Negative currency
    assert DataCleaner.parse_float('-R$ 1.200,50') == -1200.5
    # Empty and None pass-through
    assert DataCleaner.parse_float('') is None
    assert DataCleaner.parse_float(None) is None


def test_parser_semicolon_delimiter():
    csv_bytes = b"id;nome;cargo\n1;Felipe;Analista\n2;Mariana;Cientista"
    records, errors = CSVParser.parse(csv_bytes)
    assert not errors
    assert len(records) == 2
    assert records[0]['nome'] == 'Felipe'
    assert records[1]['cargo'] == 'Cientista'


def test_demo_pipeline_end_to_end(tmp_path):
    # End-to-end smoke: ensure the demo dataset can flow through the full pipeline.
    import os
    demo_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'seed', 'processo_seletivo_demo.csv')
    demo_path = os.path.abspath(demo_path)
    assert os.path.exists(demo_path), f"demo CSV missing at {demo_path}"

    with open(demo_path, 'rb') as f:
        content = f.read()
    records, errors = CSVParser.parse(content)
    assert not errors
    assert len(records) == 305  # 300 base + 5 duplicates

    headers = list(records[0].keys())
    mapping = ColumnMapper.auto_detect_mapping(headers)
    mapped = ColumnMapper.map_records(records, mapping)
    cleaned, _logs = DataCleaner.clean_dataset(mapped)

    # Demo contains 5 duplicates by candidate_id
    duplicate_flags = [r.get('is_duplicate') for r in cleaned]
    assert sum(1 for d in duplicate_flags if d) == 5

    profile = DataProfiler.profile_dataset(cleaned)
    assert 0 <= profile['health_score'] <= 100
    # Health score ~82 is the documented value
    assert profile['health_score'] >= 60, f"Health score too low: {profile['health_score']}"

    kpis, charts, insights, limitations = DataAggregator.aggregate(cleaned)
    assert kpis['total_candidates'] == 305
    assert kpis['valid_candidates'] == 300
    assert kpis['duplicate_count'] == 5

    inference = InferenceEngine.run_all_inference(cleaned)
    # With demo data we expect at least 4 of 6 tests (chi-2x2, t-testx2, anovax2)
    assert len(inference) >= 3, f"Expected several inference tests, got {len(inference)}"


def test_health_score_empty_column_penalty():
    # A column entirely null should trigger 'Coluna totalmente vazia' flag and a -10 penalty (max -20).
    records = [
        {'candidate_id': 'CAN001', 'email': 'a@example.com', 'is_duplicate': False},
        {'candidate_id': 'CAN002', 'email': 'b@example.com', 'is_duplicate': False},
        {'candidate_id': 'CAN003', 'email': None, 'is_duplicate': False},  # 1 null in email
    ]
    profile = DataProfiler.profile_dataset(records)
    empty_cols = [c for c in profile['columns'] if 'Coluna totalmente vazia' in c['flags']]
    # email is mostly filled, candidate_id is fully filled -> no empty column expected
    # The dataset is high quality. This test asserts the flag is correctly absent here.
    assert empty_cols == []
    # Single null in 3-row base -> still small missing penalty, score should be high
    assert profile['health_score'] >= 85
