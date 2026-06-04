import React from "react";
import { Users, Copy, Percent, Star, DollarSign } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";

interface KPICardsProps {
  kpis: AnalysisResponse["kpis"];
}

export default function KPICards({ kpis }: KPICardsProps) {
  const formatPercent = (val?: number) => {
    if (val === undefined) return "N/A";
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val?: number) => {
    if (val === undefined) return "N/A";
    return val.toLocaleString("pt-BR");
  };

  const formatFloat = (val?: number) => {
    if (val === undefined) return "N/A";
    return val.toFixed(1);
  };

  const cards = [
    {
      title: "Candidatos Inscritos",
      value: formatNumber(kpis.total_candidates),
      desc: `${formatNumber(kpis.valid_candidates)} registros válidos`,
      icon: Users,
      color: "text-accent bg-accent/10"
    },
    {
      title: "Taxa de Aprovação",
      value: formatPercent(kpis.approval_rate),
      desc: kpis.approval_rate_ci 
        ? `IC: [${formatPercent(kpis.approval_rate_ci[0])} - ${formatPercent(kpis.approval_rate_ci[1])}]`
        : `${formatNumber(kpis.approved_count)} candidatos aprovados`,
      icon: Percent,
      color: "text-success bg-success/10"
    },
    {
      title: "Média no Teste",
      value: formatFloat(kpis.avg_score_test),
      desc: kpis.median_score_test ? `Mediana: ${formatFloat(kpis.median_score_test)}` : "Sem teste cadastrado",
      icon: Star,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Pretensão Salarial",
      value: formatCurrency(kpis.median_salary_expectation),
      desc: "Mediana (valores extremos filtrados)",
      icon: DollarSign,
      color: "text-accent bg-accent/10"
    },
    {
      title: "Registros Duplicados",
      value: formatNumber(kpis.duplicate_count),
      desc: kpis.total_candidates > 0 
        ? `${((kpis.duplicate_count / kpis.total_candidates) * 100).toFixed(1)}% de redundância`
        : "0%",
      icon: Copy,
      color: kpis.duplicate_count > 0 ? "text-danger bg-danger/10" : "text-text-muted bg-border-subtle"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="glass-card p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-text-secondary">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-semibold text-text-primary tracking-tight block">
                {card.value}
              </span>
              <span className="text-[11px] text-text-muted mt-1 block">
                {card.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
