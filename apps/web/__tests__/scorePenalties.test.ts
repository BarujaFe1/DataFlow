import { describe, it, expect } from "vitest";
import { buildScorePenalties } from "@/lib/reporting/scorePenalties";
import { buildWaterfallResult, buildWaterfallSteps } from "@/lib/reporting/waterfall";
import type { QualityScore } from "@/types/analysis";

// Minimal valid QualityScore; only `penalties` matters for buildScorePenalties.
function makeScore(penalties: QualityScore["penalties"] = []): QualityScore {
  return {
    overall: 100 - (penalties?.reduce((s, p) => s + p.penalty_points, 0) ?? 0),
    dimension_scores: {},
    weights: {},
    policy_version: "2.0.0",
    issues: [],
    penalties,
    confidence: 1.0,
    applicability: "screening heuristic",
  };
}

describe("buildScorePenalties", () => {
  it("returns an empty array for undefined / missing penalties", () => {
    expect(buildScorePenalties(undefined)).toEqual([]);
    expect(buildScorePenalties(makeScore(undefined))).toEqual([]);
    expect(buildScorePenalties(makeScore([]))).toEqual([]);
  });

  it("drops dimensions whose penalty_points is <= 0.01 (backend threshold)", () => {
    const score = makeScore([
      { dimension: "completeness", rate: 0.01, penalty_points: 0.005 }, // dropped
      { dimension: "validity", rate: 0.01, penalty_points: 0.5 }, // kept
    ]);
    const result = buildScorePenalties(score);
    expect(result).toHaveLength(1);
    expect(result[0].dimension).toBe("validity");
  });

  it("drops a valid zero penalty at the backend threshold", () => {
    const score = makeScore([
      { dimension: "validity", rate: 0, penalty_points: 0 },
    ]);
    expect(buildScorePenalties(score)).toEqual([]);
  });

  it.each([
    ["negative", -0.3],
    ["NaN", Number.NaN],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("preserves an invalid %s penalty for waterfall contract validation", (_caseName, penaltyPoints) => {
    const penalties = buildScorePenalties(makeScore([
      { dimension: "completeness", rate: 0, penalty_points: penaltyPoints },
    ]));

    expect(penalties).toHaveLength(1);
    expect(penalties[0].points).toBe(penaltyPoints);
    expect(buildWaterfallResult(98, penalties)).toMatchObject({
      ok: false,
      error: "INVALID_PENALTY",
    });
  });

  it("maps the plausibility dimension to 'Valores Implausíveis' (NO 'Outliers')", () => {
    const score = makeScore([
      { dimension: "plausibility", rate: 0.02, penalty_points: 0.3 },
    ]);
    const label = buildScorePenalties(score)[0].label;
    expect(label).toBe("Valores Implausíveis");
    expect(label).not.toContain("Outliers");
  });

  it("maps every backend dimension key to its PT-BR label", () => {
    const expected: Record<string, string> = {
      completeness: "Ausência / Nulos",
      uniqueness: "Duplicidades",
      validity: "E-mails Inválidos",
      consistency: "Falhas de Consistência",
      plausibility: "Valores Implausíveis",
      schema: "Colunas Vazias",
    };
    for (const [dimension, label] of Object.entries(expected)) {
      const score = makeScore([
        { dimension, rate: 0.01, penalty_points: 0.5 },
      ]);
      expect(buildScorePenalties(score)[0].label).toBe(label);
    }
  });

  it("falls back to the raw dimension key for unknown dimensions", () => {
    const score = makeScore([
      { dimension: "timeliness", rate: 0.01, penalty_points: 0.5 },
    ]);
    expect(buildScorePenalties(score)[0].label).toBe("timeliness");
  });
});

describe("Health Score waterfall — reconciliation (no silent gap-closer)", () => {
  // User's exact example: backend overall=98 (rounded int) but the dimension
  // penalties sum to 2.4, i.e. the precise decomposition gives 97.6. The
  // residual (+0.4) is a rounding artifact, not a missing deduction.
  const residualFixture: QualityScore["penalties"] = [
    { dimension: "completeness", rate: 0.012, penalty_points: 1.2 },
    { dimension: "uniqueness", rate: 0.004, penalty_points: 0.6 },
    { dimension: "validity", rate: 0.0024, penalty_points: 0.6 },
  ];

  it("surfaces the residual as an explicit 'Ajuste de arredondamento' step", () => {
    const penalties = buildScorePenalties(makeScore(residualFixture));
    const steps = buildWaterfallSteps(98, penalties);

    const rounding = steps.find((s) => s.type === "rounding");
    expect(rounding).toBeDefined();
    expect(rounding!.change).toBeCloseTo(0.4, 5);

    // The waterfall must close at the authoritative headline score.
    const end = steps[steps.length - 1];
    expect(end.type).toBe("end");
    expect(end.value).toBeCloseTo(98, 5);

    // The explicit step count equals the input penalty count (nothing folded
    // silently into a penalty).
    expect(steps.filter((s) => s.type === "penalty")).toHaveLength(
      penalties.length
    );
  });

  it("preserves a realistic negative independent-rounding residual as an explicit step", () => {
    const penalties = [
      { dimension: "completeness", label: "Ausência / Nulos", points: 1, rate: 0.01 },
      { dimension: "validity", label: "E-mails Inválidos", points: 1, rate: 0.01 },
    ];

    const result = buildWaterfallResult(97.62, penalties);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const rounding = result.steps.find((step) => step.type === "rounding");
    expect(rounding?.label).toBe("Ajuste de arredondamento");
    expect(rounding?.change).toBeCloseTo(-0.38, 5);
    expect(rounding?.value).toBeCloseTo(97.62, 5);
  });

  it.each([
    ["NaN score", Number.NaN, []],
    ["infinite score", Number.POSITIVE_INFINITY, []],
    ["score below zero", -1, []],
    ["score above 100", 101, []],
    ["NaN penalty", 99, [{ dimension: "x", label: "X", points: Number.NaN, rate: 0 }]],
    ["infinite penalty", 99, [{ dimension: "x", label: "X", points: Number.POSITIVE_INFINITY, rate: 0 }]],
    ["negative penalty", 99, [{ dimension: "x", label: "X", points: -1, rate: 0 }]],
    ["penalties taking cumulative below zero", 0, [{ dimension: "x", label: "X", points: 101, rate: 0 }]],
  ])("flags an invalid backend contract for %s", (_caseName, score, penalties) => {
    const result = buildWaterfallResult(score, penalties);
    expect(result.ok).toBe(false);
  });

  it("rejects an impossible reconciliation gap instead of calling it rounding", () => {
    expect(buildWaterfallResult(50, [])).toMatchObject({
      ok: false,
      error: "IMPOSSIBLE_RECONCILIATION_GAP",
    });
  });

  it.each([0.58, 0.59])("accepts a backend-plausible residual of %s", (gap) => {
    const result = buildWaterfallResult(100 - gap, []);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.steps.find((step) => step.type === "rounding")?.change).toBeCloseTo(-gap, 5);
  });

  it("does NOT add a rounding step when penalties already reconcile", () => {
    const exact: QualityScore["penalties"] = [
      { dimension: "completeness", rate: 0.01, penalty_points: 1.0 },
      { dimension: "uniqueness", rate: 0.004, penalty_points: 0.6 },
      { dimension: "validity", rate: 0.0016, penalty_points: 0.4 },
    ];
    const penalties = buildScorePenalties(makeScore(exact));
    const steps = buildWaterfallSteps(98, penalties);
    expect(steps.some((s) => s.type === "rounding")).toBe(false);
    expect(steps[steps.length - 1].value).toBeCloseTo(98, 5);
  });

  it("invariant: the chart always closes at the headline score and the total change reconciles", () => {
    const fixtures: Array<[number, QualityScore["penalties"]]> = [
      [98, residualFixture],
      [95, [{ dimension: "completeness", rate: 0.05, penalty_points: 4.5 }]],
      [
        94,
        [
          { dimension: "completeness", rate: 0.1, penalty_points: 3.0 },
          { dimension: "validity", rate: 0.08, penalty_points: 2.0 },
          { dimension: "uniqueness", rate: 0.04, penalty_points: 0.6 },
        ],
      ],
    ];
    for (const [score, pen] of fixtures) {
      const penalties = buildScorePenalties(makeScore(pen));
      const steps = buildWaterfallSteps(score, penalties);

      const end = steps[steps.length - 1];
      expect(end.type).toBe("end");
      expect(end.value).toBeCloseTo(score, 5);

      // Sum of every step's change must equal (score - 100): no hidden gap.
      const totalChange = steps.reduce((s, step) => s + step.change, 0);
      expect(totalChange).toBeCloseTo(score - 100, 5);
    }
  });

  it("documents that penalties sum ONLY approximately to 100-overall (not exactly)", () => {
    // Directly mirrors scoring.py: overall is an int, penalties are 2-decimal.
    const penalties = buildScorePenalties(makeScore(residualFixture));
    const sumPenalties = penalties.reduce((s, p) => s + p.points, 0);
    const approx = 100 - 98; // 2
    // The sum is NOT exactly 2 here (it is 2.4) — the residual is the rounding
    // artifact the waterfall surfaces explicitly. We assert it is within a
    // small tolerance, never that the sums are equal.
    expect(Math.abs(sumPenalties - approx)).toBeGreaterThan(0.01);
    expect(Math.abs(sumPenalties - approx)).toBeLessThanOrEqual(1.0);
  });
});
