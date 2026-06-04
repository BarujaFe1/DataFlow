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
    res = InferenceEngine.run_t_test(df, 'score_test', 'final_status')
    assert res is not None
    assert res['significance'] is True
    assert res['statistic'] > 0
    assert "Aprovados" in res['interpretation']
