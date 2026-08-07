import type { ScorePenalty } from "./scorePenalties";

// A single bar in the Health Score waterfall.
export interface WaterfallStep {
  label: string;
  // Cumulative value (0..100) *after* this step is applied.
  value: number;
  // Delta applied at this step: 0 for "start", negative for a penalty,
  // the signed rounding residual for "rounding", 0 for "end".
  change: number;
  type: "start" | "penalty" | "rounding" | "end";
}

// Below this absolute residual we treat the difference as float noise and do
// not render a separate rounding step.
const ROUNDING_EPSILON = 0.005;

/**
 * Builds the cumulative waterfall sequence from the backend-authoritative
 * penalties and the headline score.
 *
 * Reconciliation policy — we NEVER silently mutate a penalty to force the chart
 * to close at `score`. Instead:
 *   1. each penalty is deducted exactly as returned by the backend;
 *   2. if a residual remains between `(100 - Σ penalties)` and the authoritative
 *      `score` — a rounding artifact from `scoring.py` (see `scorePenalties.ts`)
 *      — it is surfaced as an explicit, labelled "Ajuste de arredondamento" step;
 *   3. the final "Score Final" step is anchored at the authoritative `score`.
 *
 * This makes the chart self-reconciling on the headline score while keeping the
 * rounding residual transparent rather than hidden inside the last penalty.
 */
export function buildWaterfallSteps(
  score: number,
  penalties: ScorePenalty[]
): WaterfallStep[] {
  const list: WaterfallStep[] = [
    { label: "Ref. Inicial (100)", value: 100, change: 0, type: "start" },
  ];

  let cumulative = 100;
  for (const p of penalties) {
    // Never deduct more than what remains before the final score.
    const pts = Math.min(cumulative, Math.max(0, p.points));
    cumulative -= pts;
    list.push({ label: p.label, value: cumulative, change: -pts, type: "penalty" });
  }

  // Explicit, transparent rounding adjustment. We do NOT fold this residual
  // into a penalty; it is shown as its own step so reviewers can see it is a
  // rounding artifact, not a missing deduction.
  const gap = score - cumulative; // + : penalties under-deduct ; - : over-deduct
  if (Math.abs(gap) > ROUNDING_EPSILON) {
    cumulative += gap;
    list.push({
      label: "Ajuste de arredondamento",
      value: cumulative,
      change: gap,
      type: "rounding",
    });
  }

  list.push({ label: "Score Final", value: score, change: 0, type: "end" });
  return list;
}
