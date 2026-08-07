export interface ColumnStats {
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  std?: number;
}

export interface CategoryCount {
  value: string;
  count: number;
  rate: number;
}

export interface ColumnProfile {
  name: string;
  inferred_type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  missing_count: number;
  missing_rate: number;
  unique_count: number;
  unique_rate: number;
  flags: string[];
  stats?: ColumnStats;
  top_values?: CategoryCount[];
}

// Structured, explainable data-quality finding produced by the scoring engine.
// Mirrors backend `app.core.issues.Issue`.
export interface QualityIssue {
  issue_id: string;
  dimension: string; // completeness | uniqueness | validity | consistency | plausibility | schema
  column?: string | null;
  severity: "low" | "medium" | "high";
  count: number;
  rate: number;
  rule_scope: string; // generic | recruitment | <domain>
  evidence: Record<string, unknown>;
  penalty: number; // contribution to the dimension penalty (already weighted)
  action: string;
  is_auto_fixable: boolean;
}

// Backend-authoritative quality score (Health Score v2, versioned heuristic).
// Mirrors backend `app.core.scoring.QualityScore`.
export interface QualityScore {
  overall: number;
  dimension_scores: Record<string, number>; // dimension -> 0..100
  weights: Record<string, number>; // dimension -> weight (sums to 1)
  policy_version: string;
  issues: QualityIssue[];
  penalties: Array<{ dimension: string; rate: number; penalty_points: number }>;
  confidence: number; // 1.0 if rows >= 100 else max(0.3, rows/100) — small-sample proxy
  applicability: string;
}

export interface QualitySummary {
  health_score: number;
  summary: string;
  columns: ColumnProfile[];
  dataset_flags: string[];
  score: QualityScore; // Backend-authoritative score breakdown (Fase 8)
}

export interface InferenceResult {
  test_name: string;
  test_type: string; // t_test | chi_square | anova | unknown
  variables: string[];
  n_total?: number | null;
  group_sizes?: Record<string, number> | null;
  statistic: number;
  p_value: number;
  effect_size?: number;
  effect_size_name?: string | null;
  significance: boolean; // DEPRECATED alias of significant_raw
  // Multiple-comparison correction (Bonferroni) — authoritative values come
  // from the backend since Rodada 4.
  nominal_alpha?: number;
  bonferroni_alpha?: number;
  corrected_significance?: boolean;
  p_value_adjusted?: number | null;
  significant_raw?: boolean | null;
  significant_adjusted?: boolean | null;
  correction_method?: string | null;
  assumptions?: string[];
  assumption_checks?: Record<string, unknown>;
  warnings?: string[];
  interpretation: string;
  limitations: string;
  decision_scope?: string | null;
}

export interface AnalysisMetadata {
  generated_at: string;
  source: 'demo' | 'upload';
  rows: number;
  columns: number;
  privacy_mode?: string; // 'demo' | 'local' | 'raw' (backend masking context)
}

export interface AnalysisResponse {
  metadata: AnalysisMetadata;
  quality: QualitySummary;
  kpis: {
    total_candidates: number;
    valid_candidates: number;
    duplicate_count: number;
    approved_count?: number;
    approval_rate?: number;
    approval_rate_ci?: [number, number];
    avg_score_test?: number;
    median_score_test?: number;
    avg_score_interview?: number;
    median_score_interview?: number;
    median_salary_expectation?: number;
    most_common_stage?: string;
    top_source_channel?: string;
    top_role_applied?: string;
    [key: string]: unknown;
  };
  charts: {
    missingness: Array<{
      column: string;
      missing_count: number;
      missing_rate: number;
      completeness_rate: number;
    }>;
    funnel: Array<{
      stage: string;
      count: number;
    }>;
    sources: Array<{
      source: string;
      count: number;
      approved_count: number;
      approval_rate: number;
    }>;
    roles: Array<{
      role: string;
      count: number;
    }>;
    score_test_distribution?: Array<{
      bin: string;
      count: number;
    }>;
    timeline?: Array<{
      date: string;
      count: number;
    }>;
    mapping_config?: Record<string, string | null>;
    available_headers?: string[];
    cleaning_logs?: string[];
    [key: string]: unknown;
  };
  inference: InferenceResult[];
  insights: string[];
  limitations: string[];
  records: Record<string, unknown>[];
}
