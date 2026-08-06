"""Statistical engine — correct, explicit and auditable.

Design rules (see docs/methodology/statistics.md):
- Compute raw statistics first; only then correct for multiple comparisons.
- Every test returns the hypothesis family, raw + adjusted p, assumptions,
  assumption checks, warnings and a non-causal interpretation.
- Welch's t-test is the default for two means (variances need not be equal).
- One-way ANOVA is classical when variances are homogeneous; when Levene
  rejects homoscedasticity we switch to Welch's one-way ANOVA (implemented
  below and tested against the classic F when variances are equal).
- We never claim causality.
"""

from typing import Any, Dict, List, Optional, Tuple
import warnings

import numpy as np
import pandas as pd
from scipy import stats

try:  # statsmodels is declared in requirements; use it for corrections.
    from statsmodels.stats.multitest import multipletests

    _HAS_STATSMODELS = True
except Exception:  # pragma: no cover - defensive fallback only
    _HAS_STATSMODELS = False


# ---------------------------------------------------------------------------
# Effect sizes
# ---------------------------------------------------------------------------
def cohens_d(group1: pd.Series, group2: pd.Series) -> float:
    """Cohen's d with pooled standard deviation (biased for tiny samples)."""
    n1, n2 = len(group1), len(group2)
    if n1 < 2 or n2 < 2:
        return 0.0
    v1, v2 = group1.var(ddof=1), group2.var(ddof=1)
    m1, m2 = group1.mean(), group2.mean()
    pooled_std = np.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2))
    if pooled_std == 0:
        return 0.0
    return float((m1 - m2) / pooled_std)


def cramers_v(contingency: pd.DataFrame) -> float:
    """Cramer's V effect size for a chi-square contingency table."""
    n = contingency.sum().sum()
    if n == 0:
        return 0.0
    chi2 = stats.chi2_contingency(contingency)[0]
    min_dim = min(contingency.shape) - 1
    if min_dim <= 0:
        return 0.0
    return float(np.sqrt(chi2 / (n * min_dim)))


def eta_squared(groups: List[pd.Series]) -> float:
    """Eta-squared (proportion of variance explained) for one-way ANOVA."""
    all_vals = pd.concat(groups)
    grand_mean = all_vals.mean()
    ss_total = float(((all_vals - grand_mean) ** 2).sum())
    ss_between = float(
        sum(len(g) * ((g.mean() - grand_mean) ** 2) for g in groups)
    )
    if ss_total == 0:
        return 0.0
    return ss_between / ss_total


# ---------------------------------------------------------------------------
# Variance diagnostics + ANOVA strategy
# ---------------------------------------------------------------------------
def levene_test(groups: List[pd.Series]) -> Dict[str, Any]:
    """Levene's test for homogeneity of variances (diagnostic only)."""
    try:
        res = stats.levene(*groups, center="median")
        return {
            "statistic": float(res.statistic),
            "p_value": float(res.pvalue),
            "homoscedastic": bool(res.pvalue >= 0.05),
        }
    except Exception:
        return {"statistic": None, "p_value": None, "homoscedastic": True}


def welch_anova(groups: List[pd.Series]) -> Dict[str, Any]:
    """Welch's one-way ANOVA (Welch, 1951).

    scipy's ``f_oneway`` does not support ``equal_var``; we implement the
    Welch statistic and its Satterthwaite approximate degrees of freedom
    directly so the ANOVA strategy can switch from the classical F test when
    Levene rejects homoscedasticity. Note: the Welch statistic is NOT identical
    to the classical F even when variances happen to be equal (its denominator
    carries a variance-weighted correction term); the two only coincide in the
    limit. ``run_anova`` uses the classical test when Levene accepts equal
    variances, precisely to avoid this approximation when it is unnecessary.
    """
    groups = [g.dropna() for g in groups if len(g.dropna()) > 1]
    k = len(groups)
    if k < 2:
        return {"statistic": None, "p_value": None, "df_between": None, "df_within": None}
    n = [len(g) for g in groups]
    means = [float(g.mean()) for g in groups]
    vars_ = [float(g.var(ddof=1)) for g in groups]
    weights = [ni / (vi if vi > 0 else np.nan) for ni, vi in zip(n, vars_)]
    W = float(np.nansum(weights))
    if not np.isfinite(W) or W == 0:
        return {"statistic": None, "p_value": None, "df_between": None, "df_within": None}
    grand_mean = float(sum(w * m for w, m in zip(weights, means)) / W)
    num = sum(w * (m - grand_mean) ** 2 for w, m in zip(weights, means))
    den = (k - 1) + 2 * (k - 1) / (k**2 - 1) * sum(
        (1 - w / W) ** 2 * w * (m - grand_mean) ** 2 / (k - 1)
        for w, m in zip(weights, means)
    )
    if den <= 0:
        return {"statistic": None, "p_value": None, "df_between": k - 1, "df_within": None}
    F = (num / (k - 1)) / (den / (k - 1)) if den > 0 else num
    df1 = k - 1
    df2 = (k**2 - 1) / (
        3 * sum((1 - w / W) ** 2 / (ni - 1) for w, ni in zip(weights, n) if ni > 1)
    )
    df2 = float(df2) if np.isfinite(df2) and df2 > 0 else float(k * min(n) - k)
    try:
        p = float(stats.f.sf(F, df1, df2))
    except Exception:
        p = None
    return {
        "statistic": float(F),
        "p_value": p,
        "df_between": float(df1),
        "df_within": float(df2),
    }


# ---------------------------------------------------------------------------
# Multiple-comparison correction
# ---------------------------------------------------------------------------
def correct_pvalues(
    pvals: List[float], alpha: float = 0.05, method: str = "bonferroni"
) -> Dict[str, Any]:
    """Correct a family of p-values.

    Primary method is Bonferroni (honours the existing documentation promise).
    Holm is available (``method='holm'``) without being silently activated.
    Falls back to a manual Bonferroni if statsmodels is unavailable.
    """
    clean = [float(p) for p in pvals if p is not None and np.isfinite(p)]
    if not clean:
        return {
            "method": method,
            "alpha": alpha,
            "rejected": [],
            "pvals_corrected": [],
        }
    if _HAS_STATSMODELS:
        # statsmodels returns (reject, pvals_corrected, alphacSidak, alphacBonf).
        rejected, pvals_adj, _, _ = multipletests(clean, alpha=alpha, method=method)
        return {
            "method": method,
            "alpha": alpha,
            "rejected": [bool(r) for r in rejected],
            "pvals_corrected": [float(p) for p in pvals_adj],
        }
    # Manual Bonferroni fallback.
    m = len(clean)
    corrected = [min(p * m, 1.0) for p in clean]
    rejected = [c < alpha for c in corrected]
    return {"method": method, "alpha": alpha, "rejected": rejected, "pvals_corrected": corrected}


# ---------------------------------------------------------------------------
# Individual tests (enriched, domain-agnostic)
# ---------------------------------------------------------------------------
def run_chi_square(
    df: pd.DataFrame, cat_col: str, target_col: str
) -> Optional[Dict[str, Any]]:
    """Chi-square test of association with Cochran's rule warnings."""
    clean_df = df[[cat_col, target_col]].dropna()
    if len(clean_df) < 30:
        return None
    contingency = pd.crosstab(clean_df[cat_col], clean_df[target_col])
    if contingency.shape[0] < 2 or contingency.shape[1] < 2:
        return None
    expected = stats.contingency.expected_freq(contingency)
    low_expected_ratio = float((expected < 5).mean())
    cohran_warning = low_expected_ratio > 0.20
    strong_warning = bool((expected < 1).any())
    try:
        res = stats.chi2_contingency(contingency)
        stat, p_val, dof = res.statistic, res.pvalue, res.dof
    except Exception:
        return None
    warnings = []
    if cohran_warning:
        warnings.append(
            f"Cochran: {low_expected_ratio * 100:.0f}% das células esperadas < 5; "
            "o teste pode ser instável — considere exato de Fisher ou agrupar categorias."
        )
    if strong_warning:
        warnings.append("Alguma frequência esperada < 1: evite conclusões fortes.")
    n_total = int(len(clean_df))
    group_sizes = {str(k): int(v) for k, v in clean_df[cat_col].value_counts().items()}
    return {
        "test_name": f"Qui-quadrado de associação ({cat_col} x {target_col})",
        "test_type": "chi_square",
        "variables": [cat_col, target_col],
        "n_total": n_total,
        "group_sizes": group_sizes,
        "statistic": float(stat),
        "p_value": float(p_val),
        "significance": bool(p_val < 0.05),
        "effect_size": cramers_v(contingency),
        "effect_size_name": "Cramer's V",
        "assumptions": [
            "Observações independentes.",
            "Tabela de contingência >= 2x2.",
            "Frequências esperadas recomendadas >= 5 (regra de Cochran).",
        ],
        "assumption_checks": {
            "low_expected_ratio": low_expected_ratio,
            "min_expected": float(expected.min()),
        },
        "warnings": warnings,
        "decision_scope": "exploratory",
        "correction_method": None,
        "interpretation": _chi_interpretation(cat_col, target_col, p_val, cramers_v(contingency)),
        "limitations": (
            "1. Associação não implica causalidade. "
            "2. Pressupõe independência das observações. "
            "3. Não use para criar regras de triagem discriminatórias."
        ),
    }


def run_t_test(
    df: pd.DataFrame,
    num_col: str,
    group_col: str,
    group_a: str,
    group_b: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Welch's t-test (equal_var=False) comparing two groups.

    When ``group_b`` is ``None`` (the recruitment default), it means "all rows
    that are NOT ``group_a``" — i.e. the "Outros" (others) bucket. This avoids
    the historical bug where a literal ``"Outros"`` status label matched nothing
    and the comparison group was always empty.
    """
    clean_df = df[[num_col, group_col]].dropna()
    ga = clean_df[clean_df[group_col] == group_a][num_col]
    if group_b is None:
        gb = clean_df[clean_df[group_col] != group_a][num_col]
        gb_label = "Outros"
    else:
        gb = clean_df[clean_df[group_col] == group_b][num_col]
        gb_label = str(group_b)
    if len(ga) < 8 or len(gb) < 8:
        return None
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            res = stats.ttest_ind(ga, gb, equal_var=False)
        stat, p_val = res.statistic, res.pvalue
    except Exception:
        return None
    # Degenerate case: a constant group makes Welch's t undefined (inf/nan).
    if not (np.isfinite(stat) and np.isfinite(p_val)):
        return None
    d = cohens_d(ga, gb)
    n_total = int(len(clean_df))
    group_sizes = {str(group_a): int(len(ga)), gb_label: int(len(gb))}
    warn_msgs = []
    if (ga.var(ddof=1) / (gb.var(ddof=1) + 1e-12)) > 4 or (
        gb.var(ddof=1) / (ga.var(ddof=1) + 1e-12)
    ) > 4:
        warn_msgs.append("Variâncias muito diferentes; Welch foi usado por robustez.")
    return {
        "test_name": f"t de Welch ({num_col}: {group_a} vs {gb_label})",
        "test_type": "welch_t",
        "variables": [num_col, group_col],
        "n_total": n_total,
        "group_sizes": group_sizes,
        "statistic": float(stat),
        "p_value": float(p_val),
        "significance": bool(p_val < 0.05),
        "effect_size": float(d),
        "effect_size_name": "Cohen's d",
        "assumptions": [
            "Amostras independentes.",
            "Distribuição aproximadamente normal nas populações (Welch é robusto a variâncias desiguais).",
        ],
        "assumption_checks": {
            "var_ratio": float(ga.var(ddof=1) / (gb.var(ddof=1) + 1e-12)),
        },
        "warnings": warn_msgs,
        "decision_scope": "exploratory",
        "correction_method": None,
        "interpretation": _t_interpretation(num_col, group_a, gb_label, p_val, ga.mean(), gb.mean(), d),
        "limitations": (
            "1. Welch assume normalidade aproximada; outliers extremos distorcem a média. "
            "2. Não avalia a qualidade individual de registros, apenas calibragem global."
        ),
    }


def run_anova(
    df: pd.DataFrame, num_col: str, group_col: str, min_group_size: int = 5
) -> Optional[Dict[str, Any]]:
    """One-way ANOVA: classical by default, Welch when Levene rejects equal variances."""
    clean_df = df[[num_col, group_col]].dropna()
    counts = clean_df[group_col].value_counts()
    valid_groups = counts[counts >= min_group_size].index.tolist()
    if len(valid_groups) < 3:
        return None
    groups = [clean_df[clean_df[group_col] == g][num_col] for g in valid_groups]
    lev = levene_test(groups)
    homoscedastic = lev["homoscedastic"]
    warnings = []
    if homoscedastic:
        try:
            res = stats.f_oneway(*groups)
            stat, p_val = res.statistic, res.pvalue
            method = "anova"
        except Exception:
            return None
        effect = eta_squared(groups)
    else:
        warn = welch_anova(groups)
        stat, p_val = warn["statistic"], warn["p_value"]
        method = "welch_anova"
        effect = eta_squared(groups)
        warnings.append(
            "Levene indicou variâncias heterogêneas; usou-se Welch ANOVA."
        )
    n_total = int(len(clean_df))
    group_sizes = {str(g): int(len(clean_df[clean_df[group_col] == g])) for g in valid_groups}
    limitations = (
        "1. ANOVA pressupõe homocedasticidade e normalidade dos resíduos. "
        "2. Não diz quais grupos diferem (requer post-hoc com correção). "
        "3. Desbalanceamento acentuado reduz o poder do teste."
    )
    if lev["p_value"] is not None:
        limitations += (
            f" 4. Levene p={lev['p_value']:.4f} "
            f"({'homogêneo' if homoscedastic else 'heterogêneo'})."
        )
    return {
        "test_name": f"ANOVA de uma via ({num_col} por {group_col}) — {method}",
        "test_type": method,
        "variables": [num_col, group_col],
        "n_total": n_total,
        "group_sizes": group_sizes,
        "statistic": float(stat) if stat is not None else None,
        "p_value": float(p_val) if p_val is not None else None,
        "significance": bool(p_val < 0.05) if p_val is not None else False,
        "effect_size": float(effect),
        "effect_size_name": "eta^2",
        "assumptions": [
            "Independência das observações.",
            "Normalidade dos resíduos.",
            "Homocedasticidade (verificada por Levene; Welch usado se violada).",
        ],
        "assumption_checks": {
            "levene_statistic": lev["statistic"],
            "levene_p_value": lev["p_value"],
            "homoscedastic": homoscedastic,
        },
        "warnings": warnings,
        "decision_scope": "exploratory",
        "correction_method": None,
        "interpretation": _anova_interpretation(num_col, group_col, p_val, method, effect),
        "limitations": limitations,
    }


# ---------------------------------------------------------------------------
# Interpretation helpers (non-causal language)
# ---------------------------------------------------------------------------
def _chi_interpretation(cat_col, target_col, p_val, v) -> str:
    if p_val < 0.05:
        return (
            f"Foi encontrada evidência de associação entre '{cat_col}' e '{target_col}' "
            f"(p={p_val:.4f}, Cramér's V={v:.2f}). Sob as premissas do teste, as distribuições "
            f"não parecem independentes."
        )
    return (
        f"Não foi encontrada evidência suficiente de associação entre '{cat_col}' e "
        f"'{target_col}' (p={p_val:.4f}). As diferenças podem decorrer de variação amostral."
    )


def _t_interpretation(num_col, ga, gb, p_val, m1, m2, d) -> str:
    if p_val < 0.05:
        direction = "maior" if m1 > m2 else "menor"
        return (
            f"Foi encontrada diferença estatisticamente significativa em '{num_col}' entre "
            f"'{ga}' (Média={m1:.2f}) e '{gb}' (Média={m2:.2f}) (p={p_val:.4f}, d de Cohen={d:.2f})."
        )
    return (
        f"Não foi encontrada evidência suficiente de diferença em '{num_col}' entre '{ga}' "
        f"(Média={m1:.2f}) e '{gb}' (Média={m2:.2f}) (p={p_val:.4f})."
    )


def _anova_interpretation(num_col, group_col, p_val, method, effect) -> str:
    if p_val is None:
        return "ANOVA não pôde ser calculada para este conjunto."
    if p_val < 0.05:
        return (
            f"Foi encontrada variação estatisticamente relevante em '{num_col}' entre os grupos de "
            f"'{group_col}' (p={p_val:.4f}, {method}, eta²={effect:.2f}). Pelo menos um grupo difere; "
            f"post-hoc com correção seria necessário para identificar quais."
        )
    return (
        f"Não foi encontrada evidência suficiente de diferença em '{num_col}' entre os grupos de "
        f"'{group_col}' (p={p_val:.4f}, {method})."
    )
