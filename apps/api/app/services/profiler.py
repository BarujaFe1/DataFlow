"""Data profiling.

Per-column profiling (type, missingness, cardinality, stats, outlier flags) is
preserved for the UI. The overall quality score is now delegated to
``app.core.scoring`` (Health Score v2), which fixes the historical denominator
bug (utility columns such as ``is_duplicate`` no longer inflate the cell count)
and returns a versioned, dimensioned, explainable score.
"""

import re
from typing import Any, Dict, List

import pandas as pd

from app.core import scoring as scoring_engine


class DataProfiler:
    @staticmethod
    def infer_type(series: pd.Series) -> str:
        non_null = series.dropna()
        if len(non_null) == 0:
            return "unknown"
        # Boolean columns must be classified before the numeric check:
        # pandas' to_numeric accepts bools, so a flag column would otherwise be
        # mislabeled as "number" and crash downstream quantile/interpolation.
        if pd.api.types.is_bool_dtype(series) or isinstance(non_null.iloc[0], bool):
            return "boolean"
        try:
            pd.to_numeric(non_null)
            return "number"
        except (ValueError, TypeError):
            pass
        sample = str(non_null.iloc[0])
        if any(char in sample for char in ["-", "/"]):
            try:
                pd.to_datetime(non_null, errors="raise")
                return "date"
            except Exception:
                pass
        unique_vals = non_null.unique()
        unique_lower = [str(x).lower().strip() for x in unique_vals]
        bool_words = {"true", "false", "sim", "não", "nao", "yes", "no", "0", "1", "0.0", "1.0"}
        if all(x in bool_words for x in unique_lower) and len(unique_vals) <= 2:
            return "boolean"
        return "string"

    @staticmethod
    def detect_outliers(series: pd.Series) -> List[float]:
        if pd.api.types.is_bool_dtype(series):
            return []
        numeric_series = pd.to_numeric(series, errors="coerce").dropna()
        if len(numeric_series) < 5:
            return []
        q1 = numeric_series.quantile(0.25)
        q3 = numeric_series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = numeric_series[(numeric_series < lower_bound) | (numeric_series > upper_bound)]
        return outliers.tolist()

    @staticmethod
    def is_invalid_email(email: Any) -> bool:
        if email is None or email == "":
            return False
        email_str = str(email).strip()
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        return not bool(re.match(pattern, email_str))

    @classmethod
    def profile_dataset(cls, cleaned_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        df = pd.DataFrame(cleaned_records)
        total_rows = len(df)

        # --- quality score (Health Score v2) ---
        score = scoring_engine.score_dataset(cleaned_records)
        health_score = score["overall"]

        # --- per-column profiling (for UI) ---
        columns_profile = []
        for col_name in df.columns:
            series = df[col_name]
            missing_count = int(series.isna().sum())
            missing_rate = missing_count / total_rows if total_rows > 0 else 0
            non_null_series = series.dropna()
            unique_count = int(non_null_series.nunique())
            unique_rate = unique_count / total_rows if total_rows > 0 else 0
            inferred_type = cls.infer_type(series)
            flags = []
            stats = None
            top_values = None

            if inferred_type == "number":
                numeric_series = pd.to_numeric(series, errors="coerce")
                non_null_num = numeric_series.dropna()
                if len(non_null_num) > 0:
                    stats = {
                        "mean": float(non_null_num.mean()),
                        "median": float(non_null_num.median()),
                        "min": float(non_null_num.min()),
                        "max": float(non_null_num.max()),
                        "std": float(non_null_num.std()) if len(non_null_num) > 1 else 0.0,
                    }
                outliers = cls.detect_outliers(series)
                if outliers:
                    flags.append(f"Outliers detectados ({len(outliers)} valores)")
            else:
                if len(non_null_series) > 0:
                    counts = non_null_series.value_counts().head(5)
                    top_values = [
                        {"value": str(val), "count": int(c), "rate": float(c / total_rows)}
                        for val, c in counts.items()
                    ]

            if missing_rate > 0.15:
                flags.append(f"Alta taxa de nulos ({missing_rate * 100:.1f}%)")
            if missing_rate == 1.0:
                flags.append("Coluna totalmente vazia")
            if unique_count == 1 and missing_count == 0:
                flags.append("Coluna constante (mesmo valor em todas as linhas)")
            if inferred_type == "string" and unique_rate > 0.5 and unique_count > 10:
                if not any(k in col_name.lower() for k in ["id", "email", "name", "nome"]):
                    flags.append(f"Alta cardinalidade ({unique_count} valores únicos)")
            if col_name == "email" and len(non_null_series) > 0:
                invalid = [e for e in non_null_series if cls.is_invalid_email(e)]
                if invalid:
                    flags.append(f"E-mails inválidos detectados ({len(invalid)} registros)")

            columns_profile.append({
                "name": col_name,
                "inferred_type": inferred_type,
                "missing_count": missing_count,
                "missing_rate": float(missing_rate),
                "unique_count": unique_count,
                "unique_rate": float(unique_rate),
                "flags": flags,
                "stats": stats,
                "top_values": top_values,
            })

        # --- dataset-level flags + summary ---
        dataset_flags = [s for s in score["issues"] if s["dimension"] in ("schema", "validity")]
        dataset_flags = [
            f"{i['count']} issue(s) em '{i['dimension']}' ({i['issue_id']})"
            for i in score["issues"]
            if i["dimension"] in ("schema", "validity", "uniqueness")
        ]

        if health_score >= 85:
            summary = "Dataset saudável. Boa integridade com poucos nulos/anomalias."
        elif health_score >= 70:
            summary = "Dataset aceitável com pontos de atenção leves."
        elif health_score >= 50:
            summary = "Qualidade média. Há anomalias/completude que podem afetar análises."
        else:
            summary = "Crítico! Problemas sérios de qualidade (nulos, duplicatas, colunas vazias)."

        return {
            "health_score": health_score,
            "summary": summary,
            "columns": columns_profile,
            "dataset_flags": dataset_flags,
            "score": score,
        }
