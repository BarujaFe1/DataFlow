"""LGPD-aware PII masking for candidate records.

Presentation + API defense-in-depth. Does not replace access control or encryption.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


def mask_name(name: Optional[str], candidate_id: Optional[str]) -> str:
    if not name:
        return "N/A"
    cid = candidate_id or "S/ID"
    return f"Candidato {cid}"


def mask_email(email: Optional[str]) -> str:
    if not email:
        return "N/A"
    email_str = str(email).strip()
    at_idx = email_str.find("@")
    if at_idx <= 0:
        return "e***@example.com"
    user = email_str[:at_idx]
    domain = email_str[at_idx:]
    if len(user) <= 1:
        return f"{user}***{domain}"
    return f"{user[0]}***{domain}"


def mask_salary(value: Any) -> Any:
    """Coarse salary band — enough for distribution charts, not individual negotiation."""
    if value is None or value == "":
        return None
    try:
        n = float(value)
    except (TypeError, ValueError):
        return None
    if n < 3000:
        return 2500
    if n < 5000:
        return 4000
    if n < 8000:
        return 6500
    if n < 12000:
        return 10000
    if n < 18000:
        return 15000
    return 20000


def mask_record(record: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(record)
    cid = out.get("candidate_id")
    if "name" in out:
        out["name"] = mask_name(out.get("name"), str(cid) if cid is not None else None)
    if "email" in out:
        out["email"] = mask_email(out.get("email"))
    if "salary_expectation" in out:
        out["salary_expectation"] = mask_salary(out.get("salary_expectation"))
    return out


def mask_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [mask_record(r) for r in records]
