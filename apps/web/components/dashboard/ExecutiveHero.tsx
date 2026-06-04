"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, FileText, AlertTriangle, ArrowRight, RefreshCw, Activity, ShieldCheck, ExternalLink } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";

interface ExecutiveHeroProps {
  analysis: AnalysisResponse;
  onGenerateReport: () => void;
  onReset: () => void;
  onScrollToSection: (id: string) => void;
}

export default function ExecutiveHero({ analysis, onGenerateReport, onReset, onScrollToSection }: ExecutiveHeroProps) {
  const { quality, kpis, metadata } = analysis;
  const score = quality.health_score;

  // Determine health details
  const getHealthDetails = (val: number) => {
    if (val >= 85) return { label: "Excelente", color: "text-success bg-success/10 border-success/20", stroke: "stroke-success" };
    if (val >= 70) return { label: "Bom", color: "text-warning bg-warning/10 border-warning/20", stroke: "stroke-warning" };
    if (val >= 50) return { label: "Atenção", color: "text-accent bg-accent/10 border-accent/20", stroke: "stroke-accent" };
    return { label: "Crítico", color: "text-danger bg-danger/10 border-danger/20", stroke: "stroke-danger" };
  };

  const health = getHealthDetails(score);

  // Dynamic header title based on score
  const getHeaderTitle = (val: number) => {
    if (val >= 85) return "Qualidade Excelente — base altamente íntegra";
    if (val >= 70) return "Qualidade Boa — base utilizável com alertas controlados";
    if (val >= 50) return "Qualidade Regular — requer verificação e saneamento";
    return "Qualidade Crítica — base insegura para decisões";
  };

  // SVG Gauge calculations (larger and more dominant)
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 100);

  // Formatting helpers
  const formatPercent = (val?: number) => {
    if (val === undefined) return "N/A";
    return `${(val * 100).toFixed(1)}%`;
  };

  // Structured copy based on metrics
  const getSummaryTexts = () => {
    const topChan = kpis.top_source_channel || "LinkedIn";
    const emailFlag = quality.columns.find(c => c.name === 'email')?.flags.find(f => f.includes("E-mails inválidos"));
    const emailErrors = emailFlag ? parseInt(emailFlag.replace(/[^\d]/g, "")) || 0 : 0;
    const outliersCount = quality.columns.filter(c => c.flags.some(f => f.toLowerCase().includes("outlier"))).length;
    const missingCount = quality.columns.filter(c => c.missing_rate > 0.15).length;

    const insight = `O canal '${topChan}' lidera em captação de talentos no processo. O funil apresenta uma taxa líquida de aprovação de ${formatPercent(kpis.approval_rate)} sobre a base de candidatos desduplicados.`;
    
    let risk = "Nenhum problema grave de integridade estrutural foi detectado na base de dados.";
    if (emailErrors > 0 || outliersCount > 0 || missingCount > 0) {
      const issues = [];
      if (emailErrors > 0) issues.push(`${emailErrors} e-mails inválidos`);
      if (outliersCount > 0) issues.push(`${outliersCount} colunas com outliers`);
      if (missingCount > 0) issues.push(`${missingCount} campos com alta ausência`);
      risk = `Foram identificados pontos de atenção na base: ${issues.join(", ")}. Isso reduz o Health Score local e exige validação.`;
    }

    const action = emailErrors > 0 || missingCount > 0
      ? "Execute a desduplicação, revise os e-mails com formatos inválidos e torne obrigatórios os campos com alto índice de nulos."
      : "Prossiga para a análise estatística de calibragem de notas e gere o relatório executivo para apresentação.";

    return { insight, risk, action };
  };

  const summary = getSummaryTexts();

  return (
    <div className="glass-card p-6 md:p-8 w-full border border-border-subtle bg-gradient-to-br from-surface-elevated/40 via-surface to-surface-elevated/20 relative overflow-hidden flex flex-col gap-6 rounded-2xl">
      
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-success/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border-subtle pb-6">
        <div>
          {/* Badges Section */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {metadata.source === "demo" ? (
              <span className="text-[10px] text-warning font-extrabold uppercase tracking-wider bg-warning/10 border border-warning/15 px-2.5 py-1 rounded-full">
                Demo Sintético
              </span>
            ) : (
              <span className="text-[10px] text-accent font-extrabold uppercase tracking-wider bg-accent/10 border border-accent/15 px-2.5 py-1 rounded-full">
                Upload Local
              </span>
            )}
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-full">
              LGPD Ativo
            </span>
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded-full">
              Engine Analítica
            </span>
            <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider bg-violet-950/40 border border-violet-800/40 px-2.5 py-1 rounded-full">
              Responsible Analytics
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight leading-tight">
            {getHeaderTitle(score)}
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-3xl leading-relaxed">
            {metadata.rows} registros ingeridos, {kpis.valid_candidates} válidos, {metadata.columns} colunas mapeadas e LGPD ativo por padrão.
          </p>
        </div>

        {/* Technical Metadata Box */}
        <div className="text-xs text-text-muted font-mono flex flex-col gap-1.5 bg-surface-elevated/50 p-3.5 rounded-xl border border-border-subtle shrink-0 self-start lg:self-auto">
          <p className="flex justify-between gap-6">
            <span>Dataset:</span>
            <span className="text-text-secondary font-bold">{metadata.source === "demo" ? "processo_seletivo_demo.csv" : "Upload Local"}</span>
          </p>
          <p className="flex justify-between gap-6">
            <span>Linhas Ingeridas:</span>
            <span className="text-text-secondary font-bold">{metadata.rows}</span>
          </p>
          <p className="flex justify-between gap-6">
            <span>Mapeamento:</span>
            <span className="text-text-secondary font-bold">{metadata.columns} colunas</span>
          </p>
          <p className="flex justify-between gap-6">
            <span>Data:</span>
            <span className="text-text-secondary font-bold">{metadata.generated_at}</span>
          </p>
        </div>
      </div>

      {/* Main content grid: Left findings, Right health gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left 8 columns: Key findings and CTAs */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          
          {/* Diagnostic boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Insight */}
            <div className="p-4 rounded-xl border border-border-subtle bg-surface/50 flex flex-col gap-1.5 hover:border-border-hover transition">
              <span className="text-[9px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Principal Achado</span>
              </span>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                {summary.insight}
              </p>
            </div>

            {/* Risk */}
            <div className="p-4 rounded-xl border border-border-subtle bg-surface/50 flex flex-col gap-1.5 hover:border-border-hover transition">
              <span className="text-[9px] font-bold text-danger uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Principal Risco</span>
              </span>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                {summary.risk}
              </p>
            </div>

            {/* Next action */}
            <div className="p-4 rounded-xl border border-border-subtle bg-surface/50 flex flex-col gap-1.5 hover:border-border-hover transition">
              <span className="text-[9px] font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Próxima Ação</span>
              </span>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                {summary.action}
              </p>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <button
              onClick={onGenerateReport}
              className="flex items-center space-x-2 px-5 py-3 text-sm font-semibold text-black bg-accent hover:bg-opacity-95 rounded-lg transition cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Gerar PDF Executivo</span>
            </button>
            
            <button
              onClick={() => onScrollToSection("quality-cockpit")}
              className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-text-primary bg-surface-elevated border border-border-subtle hover:border-border-hover rounded-lg transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Ver Issues</span>
            </button>

            <button
              onClick={() => onScrollToSection("statistics-inference")}
              className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary bg-surface border border-border-subtle hover:border-border-hover rounded-lg transition cursor-pointer"
            >
              <Activity className="w-4 h-4 text-accent" />
              <span>Abrir Evidência Estatística</span>
            </button>

            <Link
              href="/showcase"
              className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-violet-300 bg-violet-950/20 border border-violet-850 hover:border-violet-650 hover:bg-violet-950/40 rounded-lg transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Showcase</span>
            </Link>

            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 text-xs text-text-muted hover:text-text-primary px-3 py-2 transition font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Novo CSV</span>
            </button>
          </div>

        </div>

        {/* Right 4 columns: Health score gauge and quick stats */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6 p-6 rounded-xl border border-border-subtle bg-surface/30">
          
          {/* Circular health score meter (Dominant & Larger gauge) */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-border-subtle fill-none"
                strokeWidth="8"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className={`fill-none transition-all duration-1000 ${health.stroke}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-text-primary font-mono tracking-tighter">
                {score}
              </span>
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">
                Health Score
              </span>
            </div>
          </div>

          {/* Quick numbers */}
          <div className="flex-1 flex flex-col justify-center w-full gap-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-border-subtle/55">
              <span className="text-text-secondary font-medium">Classificação:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${health.color}`}>
                {health.label}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-subtle/55">
              <span className="text-text-secondary font-medium">Registros Ingeridos:</span>
              <span className="font-mono font-bold text-text-primary">{kpis.total_candidates}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-subtle/55">
              <span className="text-text-secondary font-medium">Registros Saneados:</span>
              <span className="font-mono font-bold text-success">{kpis.valid_candidates}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-secondary font-medium">Mapeamento de Colunas:</span>
              <span className="font-mono font-bold text-text-primary">{metadata.columns} / 17</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
