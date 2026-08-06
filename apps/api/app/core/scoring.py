"""Health Score v2 — a transparent, versioned, heuristic quality score.

IMPORTANT: this is a *screening heuristic*, not a universal quality certificate.
It is documented as such. The score decomposes into six dimensions, each in
[0, 100]; the overall is the weighted sum. Penalties are proportional to rates
(capped per rule and per dimension). Outliers are reported as *plausibility
anomalies*, never as automatic errors.

The classic implementation bug is fixed here: the denominator uses only DATA
columns (utility columns such as ``is_duplicate`` are excluded), so the missing
rate is no longer understated.
"""

from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from app.core.issues import Issue

# Default heuristic weights (documented in docs/methodology/quality-score.md).
DEFAULT_WEIGHTS = {
    "completeness": 0.30,
    "uniqueness": 0.15,
    "validity": 0.25,
    "consistency": 0.10,
    "plausibility": 0.10,
    "schema": 0.10,
}

# Columns that are pipeline metadata, never "data" for quality purposes.
UTILITY_COLUMNS = {"is_duplicate"}

_EMAIL_RE = r"^[\w\.-]+@[\w\.-]+\.\w+$"


def _is_invalid_email(value: Any) -> bool:
    import re

    if value is None or value == "":
        return False
    return not bool(re.match(_EMAIL_RE, str(value).strip()))


def _numeric_parse_failure_rate(series: pd.Series) -> float:
    non_null = series.dropna()
    if len(non_null) == 0:
        return 0.0
    numeric = pd.to_numeric(non_null, errors="coerce").dropna()
    # Column is "numeric-capable" if most values parse as numbers.
    if len(numeric) < 0.5 * len(non_null):
        return 0.0
    failures = len(non_null) - len(numeric)
    return failures / len(non_null)


def score_dataset(
    records: List[Dict[str, Any]],
    weights: Optional[Dict[str, float]] = None,
    policy_version: str = "2.0.0",
    duplicate_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    weights = weights or DEFAULT_WEIGHTS
    df = pd.DataFrame(records)
    total_rows = len(df)
    data_cols = [c for c in df.columns if c not in UTILITY_COLUMNS]
    df_data = df[data_cols].copy() if data_cols else df.drop(columns=UTILITY_COLUMNS, errors="ignore")
    total_cols = len(df_data.columns)

    issues: List[Issue] = []

    # --- completeness -----------------------------------------------------
    total_cells = total_rows * total_cols if total_cols > 0 else 0
    missing_cells = int(df_data.isna().sum().sum())
    missing_rate = (missing_cells / total_cells) if total_cells > 0 else 0.0
    completeness = max(0.0, 1.0 - missing_rate)

    # --- uniqueness -------------------------------------------------------
    duplicate_count = 0
    if "is_duplicate" in df.columns:
        duplicate_count = int(df["is_duplicate"].sum())
    dup_rate = (duplicate_count / total_rows) if total_rows > 0 else 0.0
    uniqueness = max(0.0, 1.0 - dup_rate)

    # --- validity (invalid emails) ---------------------------------------
    invalid_email_rate = 0.0
    email_col = next((c for c in df_data.columns if c.lower() == "email"), None)
    if email_col is not None:
        invalid = [e for e in df_data[email_col].dropna() if _is_invalid_email(e)]
        invalid_email_rate = len(invalid) / total_rows if total_rows > 0 else 0.0
    validity = max(0.0, 1.0 - invalid_email_rate)

    # --- consistency (numeric parse failures) ----------------------------
    cons_fail_rates = [_numeric_parse_failure_rate(df_data[c]) for c in df_data.columns]
    consistency_fail = float(np.mean(cons_fail_rates)) if cons_fail_rates else 0.0
    consistency = max(0.0, 1.0 - consistency_fail)

    # --- plausibility (impossible values) ---------------------------------
    impossible = 0
    for col in ("experience_years", "salary_expectation"):
        if col in df_data.columns:
            num = pd.to_numeric(df_data[col], errors="coerce")
            impossible += int((num < 0).sum())
    plaus_rate = (impossible / total_cells) if total_cells > 0 else 0.0
    plausibility = max(0.0, 1.0 - plaus_rate)

    # --- schema (empty columns) ------------------------------------------
    empty_cols = 0
    for c in df_data.columns:
        if total_rows > 0 and int(df_data[c].isna().sum()) == total_rows:
            empty_cols += 1
    schema_fail = (empty_cols / total_cols) if total_cols > 0 else 0.0
    schema = max(0.0, 1.0 - schema_fail)

    dims = {
        "completeness": completeness,
        "uniqueness": uniqueness,
        "validity": validity,
        "consistency": consistency,
        "plausibility": plausibility,
        "schema": schema,
    }

    dimension_scores: Dict[str, float] = {n: round(dims[n] * 100, 2) for n in dims}

    # Penalties (points lost in the weighted 0-100 overall) per dimension.
    penalties = [
        {"dimension": "completeness", "rate": round(missing_rate, 4),
         "penalty_points": round((1 - completeness) * 100 * weights.get("completeness", 0), 2)},
        {"dimension": "uniqueness", "rate": round(dup_rate, 4),
         "penalty_points": round((1 - uniqueness) * 100 * weights.get("uniqueness", 0), 2)},
        {"dimension": "validity", "rate": round(invalid_email_rate, 4),
         "penalty_points": round((1 - validity) * 100 * weights.get("validity", 0), 2)},
        {"dimension": "consistency", "rate": round(consistency_fail, 4),
         "penalty_points": round((1 - consistency) * 100 * weights.get("consistency", 0), 2)},
        {"dimension": "plausibility", "rate": round(plaus_rate, 4),
         "penalty_points": round((1 - plausibility) * 100 * weights.get("plausibility", 0), 2)},
        {"dimension": "schema", "rate": round(schema_fail, 4),
         "penalty_points": round((1 - schema) * 100 * weights.get("schema", 0), 2)},
    ]
    penalties = [p for p in penalties if p["penalty_points"] > 0.01]

    overall = int(round(sum(dims[n] * weights.get(n, 0) * 100 for n in dims)))

    # --- structured issues -------------------------------------------------
    if missing_rate > 0.15:
        issues.append(Issue(
            issue_id="completeness.high_missing", dimension="completeness",
            severity="high" if missing_rate > 0.4 else "medium",
            count=missing_cells, rate=round(missing_rate, 4), rule_scope="generic",
            evidence={"missing_cells": missing_cells, "total_cells": total_cells},
            penalty=1 - completeness, action="review"))
    if dup_rate > 0:
        issues.append(Issue(
            issue_id="uniqueness.duplicates", dimension="uniqueness",
            severity="medium", count=duplicate_count, rate=round(dup_rate, 4),
            rule_scope="generic", evidence={"duplicate_count": duplicate_count},
            penalty=1 - uniqueness, action="review"))
    if invalid_email_rate > 0:
        issues.append(Issue(
            issue_id="validity.email_format", dimension="validity", column=email_col,
            severity="medium", count=int(invalid_email_rate * total_rows),
            rate=round(invalid_email_rate, 4), rule_scope="generic",
            evidence={}, penalty=1 - validity, action="review"))
    if consistency_fail > 0:
        issues.append(Issue(
            issue_id="consistency.numeric_parse", dimension="consistency",
            severity="low", count=int(consistency_fail * total_cells),
            rate=round(consistency_fail, 4), rule_scope="generic",
            evidence={}, penalty=1 - consistency, action="review"))
    if plaus_rate > 0:
        issues.append(Issue(
            issue_id="plausibility.negative_values", dimension="plausibility",
            severity="medium", count=impossible, rate=round(plaus_rate, 4),
            rule_scope="generic", evidence={}, penalty=1 - plausibility, action="review"))
    if empty_cols > 0:
        issues.append(Issue(
            issue_id="schema.empty_columns", dimension="schema",
            severity="medium", count=empty_cols, rate=round(schema_fail, 4),
            rule_scope="generic", evidence={"empty_columns": empty_cols},
            penalty=1 - schema, action="review"))

    # Outliers -> plausibility ANOMALY (no penalty, never auto-error).
    for c in df_data.columns:
        num = pd.to_numeric(df_data[c], errors="coerce").dropna()
        if len(num) >= 5:
            q1, q3 = num.quantile(0.25), num.quantile(0.75)
            iqr = q3 - q1
            outliers = num[(num < q1 - 1.5 * iqr) | (num > q3 + 1.5 * iqr)]
            if len(outliers) > 0:
                issues.append(Issue(
                    issue_id=f"plausibility.outliers.{c}", dimension="plausibility",
                    column=c, severity="low", count=len(outliers),
                    rate=round(len(outliers) / len(num), 4), rule_scope="generic",
                    evidence={"method": "IQR (1.5x)", "lower": float(q1 - 1.5 * iqr),
                               "upper": float(q3 + 1.5 * iqr)},
                    penalty=0.0, action="review", is_auto_fixable=False))

    confidence = 1.0 if total_rows >= 100 else round(max(0.3, total_rows / 100), 2)

    return {
        "overall": overall,
        "dimension_scores": dimension_scores,
        "weights": weights,
        "policy_version": policy_version,
        "issues": [i.to_dict() for i in issues],
        "penalties": penalties,
        "confidence": confidence,
        "applicability": "screening heuristic for tabular data readiness",
    }
