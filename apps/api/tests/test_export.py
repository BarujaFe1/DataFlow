"""Fase 1 follow-up — CSV export must respect the PII masking contract (claim C6).

These turn the previously "unverified" CSV-export masking claim into real,
CI-run evidence:
- demo mode  -> names/emails masked in the exported CSV (no raw PII leaks)
- local+raw  -> raw names/emails exposed (intentional, documented opt-in)
"""
import os

import pytest
from fastapi.testclient import TestClient

from app.main import app

DEMO_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "data", "seed", "processo_seletivo_demo.csv"
    )
)


@pytest.fixture
def client():
    return TestClient(app)


RAW_EMAIL = "gustavo.pereira@example.com"
MASKED_EMAIL_FRAGMENT = "g***@example.com"


def test_export_csv_demo_masks_pii(client, monkeypatch):
    monkeypatch.setenv("DATAFLOW_PRIVACY_MODE", "demo")
    monkeypatch.setenv("DATAFLOW_ENABLE_RAW_RECORDS", "false")
    r = client.get("/api/export")
    assert r.status_code == 200
    # Content type + download filename (claim C6: "nome do arquivo se pertinente").
    assert "text/csv" in r.headers["content-type"]
    disp = r.headers.get("content-disposition", "")
    assert "attachment" in disp
    assert "dataflow_export.csv" in disp
    body = r.text
    # Name masked (mask_name -> "Candidato CANxxxx") and email masked (g***@...).
    assert "Candidato" in body
    assert MASKED_EMAIL_FRAGMENT in body
    # The raw PII must NOT leak in the public demo export.
    assert RAW_EMAIL not in body
    # Verify the masking survives the CSV serialization (not just the JSON API).
    assert "gustavo.pereira" not in body


def test_export_csv_local_raw_exposes_pii(client, monkeypatch):
    monkeypatch.setenv("DATAFLOW_PRIVACY_MODE", "local")
    monkeypatch.setenv("DATAFLOW_ENABLE_RAW_RECORDS", "true")
    r = client.get("/api/export")
    assert r.status_code == 200
    body = r.text
    # Raw mode: nothing is masked, so the synthetic "Candidato" label is absent
    # and the actual identifier/email is present.
    assert "Candidato" not in body
    assert RAW_EMAIL in body
