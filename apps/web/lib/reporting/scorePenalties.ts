import type { QualityScore } from "@/types/analysis";

// A single penalty component of the Health Score decomposition.
export interface ScorePenalty {
  dimension: string; // backend dimension key (completeness, uniqueness, ...)
  label: string; // PT-BR display label
  points: number; // backend penalty points; invalid values reach contract validation
  rate: number; // underlying rate (missing rate, dup rate, ...)
}

const DIMENSION_LABELS: Record<string, string> = {
  completeness: "Ausência / Nulos",
  uniqueness: "Duplicidades",
  validity: "E-mails Inválidos",
  consistency: "Falhas de Consistência",
  plausibility: "Valores Implausíveis",
  schema: "Colunas Vazias",
};

/**
 * Derives the Health Score decomposition from the backend-authoritative
 * weighted penalties (`QualityScore.penalties`).
 *
 * IMPORTANT — reconciliation is *approximate by construction*, never exact:
 *   • `overall` is rounded to an integer on the backend
 *     (`int(round(...))` in `app/core/scoring.py`);
 *   • each `penalty_points` is rounded independently to 2 decimals and any
 *     dimension with `penalty_points <= 0.01` is dropped from the list.
 * So `sum(penalties)` is only *approximately* `100 - overall`; the residual
 * (typically < 1 point) is a rounding artifact, not a logic error.
 *
 * The waterfall chart (`HealthScoreWaterfall`, via `buildWaterfallSteps`) does
 * NOT silently invent points to close at the headline score. It surfaces the
 * residual transparently as an explicit "Ajuste de arredondamento" step. If you
 * need an exact invariant in tests, assert the residual is within a small
 * tolerance (see `scorePenalties.test.ts`), not that the sums are equal.
 */
export function buildScorePenalties(score?: QualityScore): ScorePenalty[] {
  if (!score || !Array.isArray(score.penalties)) return [];
  return score.penalties
    // Valid values at or below the backend display threshold remain omitted.
    // Invalid values must reach the waterfall validator; filtering or clamping
    // them here would turn a bad backend contract into a plausible chart.
    .filter((p) => !Number.isFinite(p.penalty_points) || p.penalty_points < 0 || p.penalty_points > 0.01)
    .map((p) => ({
      dimension: p.dimension,
      label: DIMENSION_LABELS[p.dimension] ?? p.dimension,
      points: p.penalty_points,
      rate: p.rate,
    }));
}
