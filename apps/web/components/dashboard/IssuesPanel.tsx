"use client";

import React from "react";
import { ClipboardList, CheckCircle2, Wrench, Tag } from "lucide-react";
import { QualityIssue } from "@/types/analysis";

interface IssuesPanelProps {
  issues: QualityIssue[];
}

const DIMENSION_LABELS: Record<string, string> = {
  completeness: "Completude",
  uniqueness: "Unicidade",
  validity: "Validade",
  consistency: "Consistência",
  plausibility: "Plausibilidade",
  schema: "Esquema",
};

const SEVERITY_STYLES: Record<QualityIssue["severity"], { label: string; cls: string }> = {
  high: { label: "ALTO", cls: "bg-danger/10 text-danger border-danger/20" },
  medium: { label: "MÉDIO", cls: "bg-warning/15 text-warning border-warning/30" },
  low: { label: "BAIXO", cls: "bg-blue/10 text-blue border-blue/20" },
};

export default function IssuesPanel({ issues }: IssuesPanelProps) {
  const sorted = [...(issues || [])].sort((a, b) => {
    const order: Record<QualityIssue["severity"], number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="glass-card p-5 border border-border-subtle bg-surface-elevated/10 flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-accent" />
          <span>Registro de Issues de Qualidade (Motor)</span>
        </h4>
        <p className="text-[10px] text-text-secondary mt-0.5">
          Achados estruturados e explicáveis emitidos pelo motor de scoring. Cada issue é informação, não remoção automática.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="p-6 rounded-xl border border-success/15 bg-success/[0.02] flex items-center gap-3 text-sm text-success">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Nenhum issue de qualidade detectado pelo motor — base íntegra nos critérios avaliados.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((iss) => {
            const sev = SEVERITY_STYLES[iss.severity] ?? SEVERITY_STYLES.low;
            const dimLabel = DIMENSION_LABELS[iss.dimension] ?? iss.dimension;
            return (
              <div
                key={iss.issue_id}
                className="p-3 rounded-xl border border-border-subtle bg-surface/40 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${sev.cls}`}>
                      {sev.label}
                    </span>
                    <span className="text-[11px] font-semibold text-text-primary truncate">{dimLabel}</span>
                    {iss.column && (
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[9px] text-text-secondary flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {iss.column}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-text-muted shrink-0">
                    {iss.count} · {(iss.rate * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Ação sugerida:</strong> {iss.action}
                  {iss.is_auto_fixable ? (
                    <span className="ml-1 inline-flex items-center gap-1 text-success">
                      <Wrench className="w-3 h-3" /> auto-corrigível
                    </span>
                  ) : (
                    <span className="ml-1 text-text-muted">(revisão manual)</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
