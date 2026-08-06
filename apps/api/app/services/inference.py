"""Statistical inference orchestration.

Domain-specific test mapping (which columns to compare) lives here for now;
the generic, auditable math lives in ``app.core.statistics``. Each test returns
a raw result; the multiple-comparison correction for the family is applied by
the route layer (see ``api/routes.py``) so the whole family is corrected once.
"""

from typing import Any, Dict, List

import numpy as np
import pandas as pd

from app.core import statistics as st


class InferenceEngine:
    # --- delegations to the auditable core engine -------------------------
    # The math lives in ``app.core.statistics``; these thin wrappers keep the
    # historical public API (used by tests and the route layer) stable.
    @staticmethod
    def run_t_test(df, num_col, group_col, group_a, group_b=None):
        return st.run_t_test(df, num_col, group_col, group_a, group_b)

    @staticmethod
    def run_chi_square(df, cat_col, target_col):
        return st.run_chi_square(df, cat_col, target_col)

    @staticmethod
    def run_anova(df, num_col, group_col, min_group_size=5):
        return st.run_anova(df, num_col, group_col, min_group_size)

    @staticmethod
    def calculate_wilson_ci(
        successes: int, total: int, confidence: float = 0.95
    ) -> tuple[float, float]:
        if total == 0:
            return 0.0, 0.0
        p = successes / total
        z = st_norm_ppf(1 - (1 - confidence) / 2)
        denominator = 1 + z**2 / total
        centre = p + z**2 / (2 * total)
        error = z * np.sqrt(p * (1 - p) / total + z**2 / (4 * total**2))
        lower = (centre - error) / denominator
        upper = (centre + error) / denominator
        return max(0.0, float(lower)), min(1.0, float(upper))

    @classmethod
    def run_all_inference(
        cls, cleaned_records: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        df = pd.DataFrame(cleaned_records)
        if "is_duplicate" in df.columns:
            df = df[df["is_duplicate"] == False].copy()  # noqa: E712

        if len(df) < 15:
            return []

        cols = df.columns
        results: List[Dict[str, Any]] = []

        # Chi-square association tests
        for cat_col in ("source_channel", "education_level"):
            if cat_col in cols and "final_status" in cols:
                res = st.run_chi_square(df, cat_col, "final_status")
                if res:
                    results.append(cls._finalize(res))

        # Welch t-tests (two-group comparison vs Aprovado; "Outros" = not Aprovado)
        for num_col in ("score_test", "score_interview"):
            if num_col in cols and "final_status" in cols:
                res = st.run_t_test(df, num_col, "final_status", "Aprovado")
                if res:
                    results.append(cls._finalize(res))

        # One-way ANOVA / Welch ANOVA (variance-aware)
        for group_col in ("education_level", "role_applied"):
            if "score_test" in cols and group_col in cols:
                res = st.run_anova(df, "score_test", group_col)
                if res:
                    results.append(cls._finalize(res))

        return results

    @staticmethod
    def _finalize(res: Dict[str, Any]) -> Dict[str, Any]:
        """Attach the raw (uncorrected) significance flag; correction is applied later."""
        p = res.get("p_value")
        sig = bool(p is not None and p < 0.05)
        res["significance"] = sig
        res["significant_raw"] = sig
        res["significant_adjusted"] = None
        res["p_value_adjusted"] = None
        res["correction_method"] = None
        return res


def st_norm_ppf(q: float) -> float:
    from scipy import stats

    return float(stats.norm.ppf(q))
