"""Fase 7 + Fase 6 — Endpoint (TestClient) and security/privacy tests.

These promote the manual ``/api/demo`` smoke test into versioned, CI-run evidence:

- ``/api/health`` and ``/api/demo`` return 200 with a request_id.
- ``/api/analyze`` runs the full upload -> profile -> inference pipeline.
- File extension is validated case-insensitively; non-CSV is rejected (400).
- Uploads above the configured limit are rejected with 413 (not 500).
- PII (name/email) is masked in the public demo response, and NOT masked when
  explicitly in local + raw mode.
- Structured errors carry a stable code/message/request_id and never leak a
  traceback.
- The privacy_mode and request_id are surfaced in the payload.
"""

import os

import pytest
from fastapi.testclient import TestClient

from app.main import app

DEMO_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "data", "seed", "processo_seletivo_demo.csv"
)
DEMO_PATH = os.path.abspath(DEMO_PATH)


@pytest.fixture
def client():
    return TestClient(app)


def _demo_bytes():
    with open(DEMO_PATH, "rb") as f:
        return f.read()


# ---------------------------------------------------------------------------
# Basic endpoints + request_id
# ---------------------------------------------------------------------------
def test_health_has_request_id(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert "request_id" in body and isinstance(body["request_id"], str)
    assert len(body["request_id"]) > 0


def test_demo_returns_200_with_request_id(client):
    r = client.get("/api/demo")
    assert r.status_code == 200
    body = r.json()
    assert body["request_id"]
    assert body["privacy_mode"] == "demo"
    assert 0 <= body["quality"]["health_score"] <= 100
    assert len(body["inference"]) >= 3


# ---------------------------------------------------------------------------
# Upload pipeline (/api/analyze)
# ---------------------------------------------------------------------------
def test_analyze_upload_demo_csv(client):
    r = client.post(
        "/api/analyze",
        files={"file": ("processo_seletivo_demo.csv", _demo_bytes(), "text/csv")},
    )
    assert r.status_code == 200
    body = r.json()
    # Structured payload present
    for key in ("metadata", "quality", "kpis", "charts", "inference", "records"):
        assert key in body
    assert body["privacy_mode"] == "demo"
    # Demo (~305 rows) flows through and is masked
    assert any("***" in rec.get("email", "") for rec in body["records"] if rec.get("email"))


def test_analyze_accepts_uppercase_extension(client):
    # Extension validation is case-insensitive.
    r = client.post(
        "/api/analyze",
        files={"file": ("demo.CSV", _demo_bytes(), "text/csv")},
    )
    assert r.status_code == 200


def test_analyze_rejects_non_csv_extension(client):
    r = client.post(
        "/api/analyze",
        files={"file": ("data.txt", b"id,name\n1,foo", "text/plain")},
    )
    assert r.status_code == 400
    body = r.json()
    assert body["error"]["code"] == "INVALID_FILE_TYPE"
    assert body["error"]["request_id"]


# ---------------------------------------------------------------------------
# Upload limits (413)
# ---------------------------------------------------------------------------
def test_analyze_rejects_oversized_file(client, monkeypatch):
    # Shrink the limit far below the demo file size to force a 413 deterministically.
    monkeypatch.setenv("DATAFLOW_MAX_UPLOAD_MB", "0.00001")  # ~10 bytes
    r = client.post(
        "/api/analyze",
        files={"file": ("big.csv", _demo_bytes(), "text/csv")},
    )
    assert r.status_code == 413
    assert r.json()["error"]["code"] == "CSV_TOO_LARGE"


# ---------------------------------------------------------------------------
# PII masking toggle
# ---------------------------------------------------------------------------
def test_demo_masks_pii_by_default(client):
    r = client.get("/api/demo")
    records = r.json()["records"]
    # name is masked to "Candidato <id>"; email keeps domain but masks the user.
    assert any(rec.get("name", "").startswith("Candidato ") for rec in records)
    assert any("***" in rec.get("email", "") for rec in records if rec.get("email"))


def test_local_raw_mode_keeps_pii(client, monkeypatch):
    monkeypatch.setenv("DATAFLOW_PRIVACY_MODE", "local")
    monkeypatch.setenv("DATAFLOW_ENABLE_RAW_RECORDS", "true")
    r = client.get("/api/demo")
    assert r.status_code == 200
    records = r.json()["records"]
    # In local + raw mode, at least one email is left untouched (no mask token).
    assert any("***" not in rec.get("email", "") for rec in records if rec.get("email"))


# ---------------------------------------------------------------------------
# Structured errors never leak tracebacks
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("request_fn", [
    lambda c: c.post("/api/analyze", files={"file": ("x.txt", b"x", "text/plain")}),
    lambda c: c.post(
        "/api/analyze",
        files={"file": ("big.csv", _demo_bytes(), "text/csv")},
    ),
])
def test_errors_are_structured_without_traceback(client, monkeypatch, request_fn):
    monkeypatch.setenv("DATAFLOW_MAX_UPLOAD_MB", "0.00001")
    r = request_fn(client)
    assert r.status_code in (400, 413)
    body = r.json()
    err = body["error"]
    assert err["code"]
    assert err["message"]
    assert err["request_id"]
    # No stack-trace leakage to the client.
    assert "Traceback" not in r.text
    assert 'File "' not in r.text
