"""Fase 3 — Characterization tests for Health Score v2.

Pins down the *contract* of ``app.core.scoring.score_dataset``:

- Weights sum to 1.0 (the score is a genuine weighted combination).
- The denominator excludes utility columns (``is_duplicate``) — the historical
  bug is gone.
- Outliers are reported as *plausibility anomalies* with penalty 0.0, never as
  automatic errors.
- The score is monotonic in data quality (more nulls -> lower score).
- The dimensioned breakdown reconciles to the overall score.
- The overall score always lives in [0, 100].
"""

from app.core.scoring import DEFAULT_WEIGHTS, score_dataset


def test_weights_sum_to_one():
    assert abs(sum(DEFAULT_WEIGHTS.values()) - 1.0) < 1e-9


def test_denominator_excludes_utility_column():
    # is_duplicate is a utility column: it must NOT count toward missing cells.
    records = [
        {"candidate_id": "A", "email": "a@x.com", "is_duplicate": False},
        {"candidate_id": "B", "email": None, "is_duplicate": False},
        {"candidate_id": "C", "email": "c@x.com", "is_duplicate": True},
    ]
    s = score_dataset(records)
    comp = s["dimension_scores"]["completeness"]
    # 1 missing out of 6 DATA cells (candidate_id, email) -> ~83.3, not ~95.
    assert 80.0 < comp <= 85.0


def test_outlier_is_anomaly_not_error():
    records = [{"v": 10.0 + i} for i in range(20)]
    records.append({"v": 100000.0})  # extreme outlier
    s = score_dataset(records)
    out_issue = [i for i in s["issues"] if i["issue_id"].startswith("plausibility.outliers")]
    assert out_issue, "expected an outlier anomaly issue"
    assert out_issue[0]["penalty"] == 0.0
    assert out_issue[0]["severity"] == "low"
    assert out_issue[0]["is_auto_fixable"] is False


def test_monotonic_loss_with_more_missing():
    clean = [{"email": "a@x.com"}, {"email": "b@x.com"}, {"email": "c@x.com"}]
    dirty = [{"email": "a@x.com"}, {"email": None}, {"email": None}]
    assert score_dataset(dirty)["overall"] < score_dataset(clean)["overall"]


def test_breakdown_reconciles_to_overall():
    records = [
        {"candidate_id": str(i), "email": "a@x.com", "experience_years": float(i)}
        for i in range(50)
    ]
    s = score_dataset(records)
    recomputed = int(round(sum(
        s["dimension_scores"][d] / 100.0 * DEFAULT_WEIGHTS[d] * 100 for d in DEFAULT_WEIGHTS
    )))
    assert abs(recomputed - s["overall"]) <= 1


def test_health_score_in_range():
    records = [{"a": 1, "b": 2} for _ in range(10)]
    s = score_dataset(records)
    assert 0 <= s["overall"] <= 100


def test_version_is_exposed():
    s = score_dataset([{"a": 1}])
    assert s["policy_version"] == "2.0.0"
    assert "completeness" in s["weights"]
