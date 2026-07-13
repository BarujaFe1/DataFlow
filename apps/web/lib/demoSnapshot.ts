/**
 * Static demo case metrics — single source of truth for landing/showcase/portfolio cards.
 * Keep in sync with data/demo_case_snapshot.json (verified against API pipeline).
 * Never display fabricated zeros when the live API is cold.
 */
export const DEMO_CASE_SNAPSHOT = {
  caseId: "processo_seletivo_demo",
  sourceFile: "data/seed/processo_seletivo_demo.csv",
  verifiedAt: "2026-07-13",
  privacyModeDefault: "masked" as const,
  metrics: {
    rowsIngested: 305,
    rowsValid: 300,
    duplicateCount: 5,
    columnsMapped: 17,
    healthScore: 82,
    approvalRate: 0.3,
    avgScoreTest: 69.56,
  },
  breakdown: {
    base: 100,
    missingPenalty: 1,
    duplicatePenalty: 2,
    emptyColumnPenalty: 0,
    constantColumnPenalty: 0,
    invalidEmailPenalty: 10,
    outlierPenalty: 5,
    final: 82,
  },
} as const;

export type DemoCaseSnapshot = typeof DEMO_CASE_SNAPSHOT;

/** Prefer live analysis metrics; fall back to verified snapshot (never invent zeros). */
export function resolveDemoMetrics(live?: {
  rows?: number;
  valid?: number;
  healthScore?: number;
  duplicates?: number;
  columns?: number;
} | null) {
  const s = DEMO_CASE_SNAPSHOT.metrics;
  return {
    rowsIngested: live?.rows && live.rows > 0 ? live.rows : s.rowsIngested,
    rowsValid: live?.valid && live.valid > 0 ? live.valid : s.rowsValid,
    healthScore:
      live?.healthScore !== undefined && live.healthScore > 0
        ? live.healthScore
        : s.healthScore,
    duplicateCount:
      live?.duplicates !== undefined && live.duplicates >= 0
        ? live.duplicates
        : s.duplicateCount,
    columnsMapped:
      live?.columns && live.columns > 0 ? live.columns : s.columnsMapped,
    fromSnapshot: !(live?.rows && live.rows > 0),
  };
}
