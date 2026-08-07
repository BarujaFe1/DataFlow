"use client";

import React, { useMemo } from "react";
import { PieChart, Gauge, Info, AlertTriangle } from "lucide-react";
import { QualityScore } from "@/types/analysis";

interface ScoreBreakdownProps {
  score: QualityScore;
}

// Canonical dimension order and localized labels (mirrors backend DEFAULT_WEIGHTS).
const DIMENSION_META: Array<{ key: string; label: string }> = [
  { key: "completeness", label: "Completude" },
  { key: "validity", label: "Validade" },
  { key: "uniqueness", label: "Unicidade" },
  { key: "consistency", label: "Consistência" },
  { key: "plausibility", label: "Plausibilidade" },
  { key: "schema", label: "Esquema" },
];

const EMPTY_SCORE: QualityScore = {
  overall: 0,
  dimension_scores: {},
  weights: {},
  policy_version: "",
  issues: [],
  penalties: [],
  confidence: 1,
  applicability: "",
};

function colorForScore(val: number): string {
  if (val >= 85) return "bg-success";
  if (val >= 70) return "bg-warning";
  if (val >= 50) return "bg-accent";
  return "bg-danger";
}

export default function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const s = score ?? EMPTY_SCORE;

  const dims = useMemo(() => {
    return DIMENSION_META.map((meta) => {
      const value = s.dimension_scores?.[meta.key] ?? 0;
      const weight = s.weights?.[meta.key] ?? 0;
      const contribution = value * weight; // weighted points toward the 0-100 overall
      return { ...meta, value, weight, contribution };
    });
  }, [s]);

  const overall = s.overall ?? 0;
  const confidence = s.confidence ?? 1.0;
  const isSmallSample = confidence < 1.0;

  return (
    <div className="glass-card p-5 border border-border-subtle bg-surface-elevated/10 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle/60 pb-3">
        <div>
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <PieChart className="w-4 h-4 text-accent" />
            <span>Composição do Score de Qualidade</span>
          </h4>
          <p className="text-[10px] text-text-secondary mt-0.5">
            Decomposição por dimensão ponderada do motor de pontuação (v{s.policy_version || "—"}).
          </p>
        </div>

        {/* Overall + confidence inline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <span className="text-2xl font-extrabold font-mono text-text-primary leading-none">{overall}</span>
            <span className="text-[8px] text-text-muted uppercase tracking-widest block mt-0.5">Score Final</span>
          </div>
          <div
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 ${
              confidence >= 0.85
                ? "bg-success/10 border-success/20 text-success"
                : "bg-warning/10 border-warning/20 text-warning"
            }`}
            title={
              isSmallSample
                ? `Amostra pequena (${Math.round(confidence * 100)}% de robustez da avaliação): indicador heurístico de suporte baseado na quantidade e estrutura dos dados. Não representa probabilidade nem intervalo de confiança estatístico.`
                : "Amostra com suporte de dados suficiente (>=100 registros): heurística de triagem com boa base. Não representa probabilidade nem intervalo de confiança estatístico."
            }
          >
            <Gauge className="w-3.5 h-3.5 shrink-0" />
            <span>Robustez da avaliação {Math.round(confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Weighted dimension bars */}
      <div className="flex flex-col gap-3">
        {dims.map((d) => (
          <div key={d.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-text-primary">{d.label}</span>
              <span className="font-mono text-text-muted">
                {d.value.toFixed(0)}/100 · peso {(d.weight * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden border border-border-subtle/50">
              <div
                className={`h-full ${colorForScore(d.value)} rounded-full transition-all duration-700`}
                style={{ width: `${Math.max(2, Math.min(100, d.value))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted">
              <span>Contribuição ponderada: +{d.contribution.toFixed(1)} pts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Penalties (where the score lost points) */}
      {s.penalties && s.penalties.length > 0 && (
        <div className="p-3 rounded-xl border border-warning/15 bg-warning/[0.02] flex flex-col gap-2">
          <span className="text-[10px] font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Deduções por Dimensão
          </span>
          <div className="flex flex-wrap gap-1.5">
            {s.penalties.map((p) => {
              const label = DIMENSION_META.find((m) => m.key === p.dimension)?.label ?? p.dimension;
              return (
                <span
                  key={p.dimension}
                  className="px-2 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[10px] text-text-secondary"
                  title={`Taxa de falha: ${(p.rate * 100).toFixed(1)}%`}
                >
                  {label}: −{p.penalty_points.toFixed(1)} pts
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="p-2.5 bg-surface-elevated border border-border-subtle rounded-lg flex items-start gap-2 text-[10px] leading-relaxed text-text-muted">
        <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <p>
          <strong className="text-text-secondary">Heurística de triagem.</strong>{" "}
          {s.applicability || "Screening heuristic for tabular data readiness."}{" "}
          {isSmallSample && (
            <>
              Com <strong className="text-warning">{Math.round(confidence * 100)}%</strong> de robustez da avaliação (amostra
              &lt; 100 registros), leia o score como sinal direcional — este é um indicador heurístico, não um
              certificado absoluto de qualidade.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
