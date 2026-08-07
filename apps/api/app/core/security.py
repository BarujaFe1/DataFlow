"""Security & privacy helpers.

- Request IDs on every response/error (never leak stack traces to clients).
- PII masking for the public demo: name/email are replaced before they ever
  leave the backend, so even a direct API consumer cannot harvest PII from the
  demo endpoint.
- Environment-driven, explicit configuration (no wildcard CORS + credentials).
"""

import os
import uuid
from typing import Any, Dict, List, Optional


def generate_request_id() -> str:
    return uuid.uuid4().hex


def mask_name(name: Optional[str], candidate_id: Optional[str] = None) -> str:
    if not name:
        return "N/A"
    cid = candidate_id or "S/ID"
    return f"Candidato {cid}"


def mask_email(email: Optional[str]) -> str:
    if not email:
        return "N/A"
    s = str(email).strip()
    at = s.find("@")
    if at <= 0:
        return "e***@example.com"
    user = s[:at]
    domain = s[at:]
    if len(user) <= 1:
        return f"{user}***{domain}"
    return f"{user[0]}***{domain}"


def mask_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Return a copy with PII fields masked. Never mutates the input."""
    out = dict(record)
    cid = out.get("candidate_id")
    if "name" in out:
        out["name"] = mask_name(out.get("name"), cid)
    if "email" in out:
        out["email"] = mask_email(out.get("email"))
    return out


def mask_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [mask_record(r) for r in records]


# ---------------------------------------------------------------------------
# Configuration (all optional; safe defaults)
# ---------------------------------------------------------------------------
def is_truthy(value: Optional[str]) -> bool:
    return str(value or "").lower() in {"1", "true", "yes", "on"}


def get_allowed_origins() -> List[str]:
    env = os.getenv("DATAFLOW_ALLOWED_ORIGINS")
    if env:
        return [o.strip() for o in env.split(",") if o.strip()]
    # Safe, explicit defaults (never "*").
    # Production frontend: https://dataflow-sand.vercel.app
    # (Render backend: https://dataflow-glu1.onrender.com)
    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://dataflow.vercel.app",
        "https://dataflow-sand.vercel.app",
    ]


def get_max_upload_bytes() -> int:
    mb = float(os.getenv("DATAFLOW_MAX_UPLOAD_MB", "15"))
    return int(mb * 1024 * 1024)


def get_max_rows() -> int:
    return int(os.getenv("DATAFLOW_MAX_ROWS", "200000"))


def get_max_columns() -> int:
    return int(os.getenv("DATAFLOW_MAX_COLUMNS", "500"))


def get_privacy_mode() -> str:
    """demo | production | local. Outside 'local' PII is masked."""
    return os.getenv("DATAFLOW_PRIVACY_MODE", "demo")


def raw_records_enabled() -> bool:
    return is_truthy(os.getenv("DATAFLOW_ENABLE_RAW_RECORDS", "false"))


def should_mask_records() -> bool:
    """Mask unless we are explicitly in local mode AND raw records are enabled."""
    if get_privacy_mode() == "local" and raw_records_enabled():
        return False
    return True


def structured_error(code: str, message: str, request_id: str, detail: Optional[str] = None) -> Dict[str, Any]:
    err: Dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
            "request_id": request_id,
        }
    }
    if detail:
        err["error"]["detail"] = detail
    return err
