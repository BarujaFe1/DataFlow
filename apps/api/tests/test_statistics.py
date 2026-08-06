"""Fase 2 — Characterization tests for the statistical engine.

These pin down the *correct* behaviour of ``app.core.statistics``:

- Effect sizes (Cramér's V, Cohen's d, eta²) have correct bounds/signs.
- Levene decides homoscedasticity; ``run_anova`` switches to Welch when it
  rejects, and stays classical when it accepts.
- Bonferroni correction: raw vs adjusted p, and reject decisions.
- Chi-square warns under Cochran's rule (low expected frequencies).
- Degenerate inputs (constant groups, tiny n) degrade gracefully, never crash.
- The "Outros" semantics of ``run_t_test`` (group_b=None) is correct.
"""

import numpy as np
import pandas as pd

from app.core import statistics as st


# ---------------------------------------------------------------------------
# Effect sizes
# ---------------------------------------------------------------------------
def test_cramers_v_perfect_association_is_near_one():
    # scipy applies Yates correction by default for 2x2, so V is ~0.98, not 1.0.
    ct = pd.DataFrame([[50, 0], [0, 50]])
    assert st.cramers_v(ct) > 0.9


def test_cramers_v_independent_is_near_zero():
    ct = pd.DataFrame([[25, 25], [25, 25]])
    assert st.cramers_v(ct) < 0.01


def test_cohens_d_sign_and_magnitude():
    np.random.seed(5)
    g1 = pd.Series(np.random.normal(10, 2, 50))
    g2 = pd.Series(np.random.normal(20, 2, 50))
    d = st.cohens_d(g1, g2)
    assert d < -1.0  # m1 < m2 -> negative, large effect


def test_cohens_d_tiny_sample_returns_zero():
    assert st.cohens_d(pd.Series([1.0]), pd.Series([2.0])) == 0.0


def test_eta_squared_bounds_and_zero():
    gs = [pd.Series([1.0, 2, 3]), pd.Series([10.0, 11, 12]), pd.Series([5.0, 6, 7])]
    e = st.eta_squared(gs)
    assert 0.0 <= e <= 1.0
    same = [pd.Series([5.0, 5, 5]), pd.Series([5.0, 5, 5])]
    assert st.eta_squared(same) == 0.0


# ---------------------------------------------------------------------------
# Variance diagnostics + ANOVA strategy
# ---------------------------------------------------------------------------
def test_levene_detects_heteroscedasticity():
    np.random.seed(0)
    a = pd.Series(np.random.normal(0, 1, 200))
    b = pd.Series(np.random.normal(0, 50, 200))
    assert st.levene_test([a, b])["homoscedastic"] is False


def test_levene_accepts_equal_variances():
    # Two series with identical sample variance -> deterministic acceptance (p=1).
    a = pd.Series([0.0, 1, 2, 3, 4])      # var 2.5
    b = pd.Series([10.0, 11, 12, 13, 14])  # var 2.5
    res = st.levene_test([a, b])
    assert res["p_value"] == 1.0
    assert res["homoscedastic"] is True


def test_welch_anova_returns_finite_p():
    np.random.seed(2)
    gs = [
        pd.Series(np.random.normal(0, 1, 100)),
        pd.Series(np.random.normal(3, 1, 100)),
        pd.Series(np.random.normal(6, 1, 100)),
    ]
    res = st.welch_anova(gs)
    assert res["p_value"] is not None
    assert 0.0 <= res["p_value"] <= 1.0
    assert np.isfinite(res["statistic"])


def test_run_anova_classical_when_levene_ok():
    np.random.seed(3)
    df = pd.DataFrame({
        "num": (list(np.random.normal(0, 1, 60))
                + list(np.random.normal(2, 1, 60))
                + list(np.random.normal(4, 1, 60))),
        "grp": ["A"] * 60 + ["B"] * 60 + ["C"] * 60,
    })
    res = st.run_anova(df, "num", "grp")
    assert res is not None
    assert res["test_type"] == "anova"
    assert "Levene" in res["limitations"]


def test_run_anova_welch_when_levene_rejects():
    np.random.seed(4)
    a = np.random.normal(0, 1, 80)
    b = np.random.normal(0, 1, 80)
    c = np.random.normal(0, 60, 80)  # massive variance
    df = pd.DataFrame({
        "num": np.concatenate([a, b, c]),
        "grp": ["A"] * 80 + ["B"] * 80 + ["C"] * 80,
    })
    res = st.run_anova(df, "num", "grp")
    assert res is not None
    assert res["test_type"] == "welch_anova"
    assert any("Welch" in w for w in res["warnings"])


# ---------------------------------------------------------------------------
# Multiple-comparison correction
# ---------------------------------------------------------------------------
def test_correct_pvalues_bonferroni_reject_decision():
    out = st.correct_pvalues([0.01, 0.02, 0.03], alpha=0.05, method="bonferroni")
    assert out["method"] == "bonferroni"
    assert out["pvals_corrected"] == [0.03, 0.06, 0.09]
    # Only the smallest survives Bonferroni at alpha=0.05
    assert out["rejected"] == [True, False, False]


def test_correct_pvalues_raw_vs_adjusted():
    pvals = [0.01] + [0.5] * 9  # one strong p among 10 tests
    out = st.correct_pvalues(pvals, alpha=0.05, method="bonferroni")
    adj = out["pvals_corrected"][0]
    assert adj == 0.1  # 0.01 * 10
    assert out["rejected"][0] is False  # 0.1 > 0.05 -> not significant after correction


# ---------------------------------------------------------------------------
# Chi-square robustness
# ---------------------------------------------------------------------------
def test_run_chi_square_low_expected_warns():
    # Imbalanced margins -> several cells with expected frequency < 5,
    # tripping Cochran's rule warning.
    raw = []
    for _ in range(4):
        raw.append({"edu": "Superior", "st": "Aprovado"})
    for _ in range(1):
        raw.append({"edu": "Superior", "st": "Reprovado"})
    for _ in range(46):
        raw.append({"edu": "Medio", "st": "Aprovado"})
    for _ in range(3):
        raw.append({"edu": "Medio", "st": "Reprovado"})
    df = pd.DataFrame(raw)
    res = st.run_chi_square(df, "edu", "st")
    assert res is not None
    assert any("Cochran" in w for w in res["warnings"])


def test_run_chi_square_none_for_small_n():
    df = pd.DataFrame({"a": ["x", "y", "x"], "b": ["p", "p", "q"]})
    assert st.run_chi_square(df, "a", "b") is None


# ---------------------------------------------------------------------------
# t-test robustness + "Outros" semantics
# ---------------------------------------------------------------------------
def test_run_t_test_constant_group_is_none():
    # Both groups constant -> Welch undefined; must return None, never raise.
    df = pd.DataFrame({
        "num": [5.0] * 15 + [5.0] * 15,
        "grp": ["A"] * 15 + ["B"] * 15,
    })
    assert st.run_t_test(df, "num", "grp", "A", "B") is None


def test_run_t_test_others_semantics():
    num = [90.0 + (i % 5) for i in range(20)] + [60.0 + (i % 5) for i in range(20)]
    df = pd.DataFrame({
        "num": num,
        "grp": ["Aprovado"] * 20 + ["Reprovado"] * 20,
    })
    res = st.run_t_test(df, "num", "grp", "Aprovado")
    assert res is not None
    assert res["test_type"] == "welch_t"
    assert res["group_sizes"]["Aprovado"] == 20
    assert res["group_sizes"]["Outros"] == 20
    assert res["significance"] is True
