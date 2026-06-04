"use client";

import React from "react";
import { Database, Binary, Sparkles, Percent, Scale, FileText, CheckCircle2, HelpCircle } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";

interface PipelineTimelineProps {
  analysis: AnalysisResponse;
}

export default function PipelineTimeline({ analysis }: PipelineTimelineProps) {
  const { kpis, metadata, inference } = analysis;

  const formatPercent = (val?: number) => {
    if (val === undefined) return "N/A";
    return `${(val * 100).toFixed(0)}%`;
  };

  const steps = [
    {
      title: "Ingestão",
      desc: "Upload e leitura do arquivo",
      metric: `${kpis.total_candidates} registros ingeridos`,
      status: "success" as const,
      icon: Database,
      tooltip: "Processamento inicial do CSV e validação do delimitador (vírgula ou ponto-e-vírgula)."
    },
    {
      title: "Profiling",
      desc: "Mapeamento estrutural",
      metric: `${metadata.columns} colunas detectadas`,
      status: "success" as const,
      icon: Binary,
      tooltip: "Classificação automática de tipos (texto, numérico, data, booleano) e cálculo de nulos."
    },
    {
      title: "Limpeza",
      desc: "Normalização e saneamento",
      metric: `${kpis.duplicate_count} duplicidades tratadas`,
      status: "success" as const,
      icon: Sparkles,
      tooltip: "Desduplicação de registros por chave técnica e sinalização de e-mails/outliers inválidos."
    },
    {
      title: "Análise KPIs",
      desc: "Cálculo de métricas agregadas",
      metric: `Tx. Aprovação: ${formatPercent(kpis.approval_rate)}`,
      status: "success" as const,
      icon: Percent,
      tooltip: "Processamento de estatísticas descritivas básicas, expectativas salariais e funis."
    },
    {
      title: "Inferência",
      desc: "Testes estatísticos SciPy",
      metric: `${inference.length} testes executados`,
      status: "success" as const,
      icon: Scale,
      tooltip: "Cálculo de significância estatística (p-valor) e tamanho de efeito (Cramer, Cohen, Eta)."
    },
    {
      title: "Relatório",
      desc: "PDF pronto para exportação",
      metric: "Disponível para download",
      status: "warning" as const, // Attention to prompt action
      icon: FileText,
      tooltip: "Compilação de todas as descobertas em um documento executivo formatado para impressão."
    }
  ];

  return (
    <div className="glass-card p-5 w-full flex flex-col gap-4 border border-border-subtle bg-surface-elevated/20">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
          Pipeline de Processamento de Dados (Status em Tempo Real)
        </span>
        <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Concluído
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning"></span> Atenção / Ação
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSuccess = step.status === "success";

          return (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle/60 bg-surface/40 hover:bg-surface-elevated/40 hover:border-border-hover transition group relative"
            >
              {/* Icon & status indicator */}
              <div className="relative shrink-0">
                <div className={`p-2 rounded-lg border ${
                  isSuccess 
                    ? "bg-success/15 border-success/20 text-success" 
                    : "bg-warning/15 border-warning/20 text-warning"
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className={`absolute -top-1.5 -right-1.5 rounded-full border border-surface p-0.2 ${
                  isSuccess ? "bg-success" : "bg-warning"
                }`}>
                  <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 justify-between">
                  <span className="text-xs font-bold text-text-primary truncate">{step.title}</span>
                  {/* Tooltip triggers info icon */}
                  <div className="relative group/tooltip">
                    <HelpCircle className="w-3 h-3 text-text-muted hover:text-text-secondary cursor-pointer shrink-0" />
                    {/* Tooltip bubble */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 rounded-lg bg-surface-elevated border border-border-hover text-[9px] text-text-secondary leading-relaxed shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition duration-200 z-50">
                      {step.tooltip}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-text-secondary block truncate mt-0.5" title={step.desc}>
                  {step.desc}
                </span>
                <span className="text-[9px] font-semibold font-mono text-text-muted block mt-1.5 bg-surface/50 border border-border-subtle/50 px-1.5 py-0.5 rounded w-fit max-w-full truncate">
                  {step.metric}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
