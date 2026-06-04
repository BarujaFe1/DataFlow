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

export interface QualitySummary {
  health_score: number;
  summary: string;
  columns: ColumnProfile[];
  dataset_flags: string[];
}

export interface InferenceResult {
  test_name: string;
  variables: string[];
  statistic: number;
  p_value: number;
  effect_size?: number;
  significance: boolean;
  interpretation: string;
  limitations: string;
}

export interface AnalysisMetadata {
  generated_at: string;
  source: 'demo' | 'upload';
  rows: number;
  columns: number;
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
