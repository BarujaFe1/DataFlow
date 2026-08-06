"""Version constants surfaced in every API response.

Bumping these numbers is the explicit contract signal that methodology, the
quality-score policy, or the analysis engine changed. They let the frontend (and
a human reviewer) know exactly which rules produced a given result.
"""

# Documentation / methodology version (see docs/methodology/*).
METHODOLOGY_VERSION = "1.0.0"

# Health Score policy version (see docs/methodology/quality-score.md).
# Major bumps = incompatible scoring changes; minor = tuning only.
SCORE_POLICY_VERSION = "2.0.0"

# Analysis engine version (statistical routines + correction strategy).
ANALYSIS_ENGINE_VERSION = "1.0.0"
