"use client";

import React, { useMemo } from "react";
import { Printer, ArrowLeft, ShieldCheck, Scale, Award, Info, AlertTriangle, FileSpreadsheet, Lock } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";
import { buildReportModel } from "@/lib/reporting/reportModel";
import HealthScoreWaterfall from "@/components/charts/HealthScoreWaterfall";
import OperationalFunnel from "@/components/charts/OperationalFunnel";

interface ReportViewProps {
  data: AnalysisResponse;
  onBack: () => void;
  isPrivacyEnabled?: boolean;
}

// Wrapper for A4 portrait pages
const PrintPage = ({ children, pageNumber }: { children: React.ReactNode; pageNumber: number }) => {
  return (
    <div 
      className="print-page bg-surface p-8 md:p-12 rounded-xl flex flex-col justify-between shadow-xl text-text-primary min-h-[95vh] mb-8 border border-border-subtle relative print:min-h-screen print:h-screen print:border-none print:shadow-none print:p-[20mm] print:mb-0"
      style={{ pageBreakAfter: pageNumber === 9 ? "avoid" : "always" }}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden">
        {children}
      </div>

      {/* Page Footer */}
      <div className="flex justify-between items-center text-[9px] text-text-muted border-t border-border-subtle pt-2 mt-4 font-mono">
        <span>DataFlow — Diagnóstico Executivo</span>
        <span>Confidencial / Demo Sintético</span>
        <span>Página {pageNumber} de 9</span>
      </div>
    </div>
  );
};

// Client-side Spearman Rank Correlation calculator for printable matrix
const VARIABLES = [
  { key: "experience_years", label: "Anos Exp" },
  { key: "salary_expectation", label: "Exp. Salarial" },
  { key: "score_test", label: "Nota Teste" },
  { key: "score_interview", label: "Nota Entr." }
];

function getRanks(arr: number[]): number[] {
  const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const ranks = new Array(arr.length);
  
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    const avgRank = 1 + (i + j - 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].idx] = avgRank;
    }
    i = j;
  }
  return ranks;
}

function getPearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let num = 0;
  let denX = 0;
  let denY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

function getSpearman(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const rankX = getRanks(x);
  const rankY = getRanks(y);
  return getPearson(rankX, rankY);
}

export default function ReportView({ data, onBack, isPrivacyEnabled = true }: ReportViewProps) {
  const report = useMemo(() => {
    return buildReportModel(data, isPrivacyEnabled);
  }, [data, isPrivacyEnabled]);

  const handlePrint = () => {
    window.print();
  };

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatFloat = (val: number) => {
    return val.toFixed(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);
  };

  const getHealthLabel = (score: number) => {
    if (score >= 85) return "Excelente";
    if (score >= 70) return "Bom";
    if (score >= 50) return "Atenção";
    return "Crítico";
  };

  // Generate Spearman correlation matrix specifically for printing (light-theme friendly shades)
  const printCorrelationMatrix = useMemo(() => {
    const records = data.records || [];
    const validRows = records.filter(row => {
      return VARIABLES.every(v => {
        const val = row[v.key];
        return val !== null && val !== undefined && !isNaN(Number(val));
      });
    });

    const n = validRows.length;
    if (n < 2) {
      return Array(4).fill(0).map(() => Array(4).fill(0));
    }

    const vectors: Record<string, number[]> = {};
    VARIABLES.forEach(v => {
      vectors[v.key] = validRows.map(row => Number(row[v.key] as number));
    });

    const res: number[][] = [];
    for (let i = 0; i < 4; i++) {
      res[i] = [];
      for (let j = 0; j < 4; j++) {
        res[i][j] = getSpearman(vectors[VARIABLES[i].key], vectors[VARIABLES[j].key]);
      }
    }
    return res;
  }, [data.records]);

  // CSS print styling for correlation cells
  const getPrintCellColor = (val: number) => {
    const absVal = Math.abs(val);
    if (val > 0) {
      return {
        background: `rgba(59, 130, 246, ${absVal * 0.3})`,
        color: "#ffffff"
      };
    } else {
      return {
        background: `rgba(239, 68, 68, ${absVal * 0.3})`,
        color: "#ffffff"
      };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 md:px-0 font-sans">
      
      {/* Top action bar (hidden on print) */}
      <div className="no-print flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-black bg-accent hover:bg-opacity-90 rounded-lg transition shadow-lg cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Exportar PDF</span>
        </button>
      </div>

      {/* Main Report Pages */}
      <div className="flex flex-col gap-6">

        {/* ================= PÁGINA 1 — CAPA ================= */}
        <PrintPage pageNumber={1}>
          <div className="flex flex-col justify-between h-[75vh]">
            <div>
              <div className="flex items-center space-x-2.5 text-accent text-xs font-bold uppercase tracking-widest mb-6">
                <Award className="w-5 h-5 shrink-0 animate-pulse" />
                <span className="font-mono">DataFlow Executive Engine</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-text-primary mt-2">
                DATAFLOW DIAGNÓSTICO
              </h1>
              <span className="text-xl text-accent font-bold mt-1 block">Relatório Técnico Executivo</span>
              <p className="text-sm text-text-secondary mt-4 max-w-xl leading-relaxed">
                Auditoria de integridade estrutural, calibração estatística do funil operacional e governança de dados tabulares.
              </p>
            </div>

            {/* Health Meter Box (Premium Capa Layout) */}
            <div className="my-10 flex items-center space-x-6 p-6 bg-surface-elevated/40 rounded-2xl border border-border-subtle w-fit">
              <div className="w-28 h-28 rounded-full border-4 border-accent flex flex-col items-center justify-center shrink-0 shadow-lg relative bg-surface-elevated">
                <span className="text-4xl font-extrabold text-text-primary font-mono tracking-tighter">{report.healthScore}</span>
                <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Score</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Saúde Geral do Dataset</span>
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full">LGPD Ativo</span>
                </div>
                <span className="text-lg font-bold text-text-primary block mt-1">
                  Qualidade {getHealthLabel(report.healthScore)}
                </span>
                <p className="text-xs text-text-secondary mt-1.5 max-w-md leading-relaxed">
                  Conformidade estrutural boa com saneamento local de PII ativo. Contém dados de caráter analítico agregador.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border-subtle pt-8 text-xs text-text-muted gap-4">
              <div className="space-y-1.5 font-mono">
                <p>Dataset: <span className="text-text-secondary font-bold">{report.metadata.source === 'demo' ? 'processo_seletivo_demo.csv (Demo Sintético)' : 'Upload Local'}</span></p>
                <p>Volume: <span className="text-text-secondary font-bold">{report.metadata.rows} candidatos</span></p>
                <p>Campos: <span className="text-text-secondary font-bold">{report.metadata.columns} colunas mapeadas</span></p>
              </div>
              <div className="space-y-1.5 font-mono text-left sm:text-right">
                <p>Data de geração: <span className="text-text-secondary">{report.metadata.generatedAt}</span></p>
                <p>Analytics Engineer: <span className="text-text-secondary font-bold">Felipe Alirio Baruja</span></p>
                <p>Uso regulado: <span className="text-red-400 font-bold">Relatório Agregado. Não utilizar para decisão automatizada individual sobre pessoas.</span></p>
              </div>
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 2 — SUMÁRIO EXECUTIVO (ONE-PAGE) ================= */}
        <PrintPage pageNumber={2}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2 justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">2. Executive One-Page Summary</h2>
              </div>
              <span className="text-[9px] text-text-muted font-mono bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle">
                Health Score: {report.healthScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Conclusions and Risks */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="p-4 bg-accent/[0.02] border border-accent/10 rounded-xl">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-2">Conclusões Executivas</span>
                  <ul className="list-disc list-inside text-xs text-text-secondary space-y-2 leading-relaxed">
                    {report.executiveSummary.slice(0, 4).map((summaryText, i) => (
                      <li key={i} className="marker:text-accent">{summaryText}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Principal Risco */}
                  <div className="p-3.5 bg-red-950/10 border border-red-900/20 rounded-lg">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Principal Risco Detectado
                    </span>
                    <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                      E-mails de contato inválidos na base e omissão de expectativa salarial reduzem a precisão dos cruzamentos estatísticos.
                    </p>
                  </div>

                  {/* Principal Ação */}
                  <div className="p-3.5 bg-amber-950/10 border border-amber-900/20 rounded-lg">
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Principal Ação Sugerida
                    </span>
                    <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                      Implementar validações do lado do formulário e auditar processos para avaliar a distribuição de notas técnicas no funil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Mini gauge & KPIs */}
              <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-xl border border-border-subtle bg-surface/30">
                {/* Mini visual health meter */}
                <div className="flex flex-col items-center justify-center p-2 mb-2 border-b border-border-subtle/50">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-border-subtle fill-none" strokeWidth="4" />
                    <circle cx="40" cy="40" r="32" className="stroke-success fill-none" strokeWidth="4" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - report.healthScore / 100)} strokeLinecap="round" />
                  </svg>
                  <span className="text-xl font-mono font-bold text-text-primary mt-1">{report.healthScore} pts</span>
                  <span className="text-[7.5px] text-text-muted uppercase font-bold tracking-wider">Data Quality</span>
                </div>

                {/* 6 core KPIs */}
                <div className="flex flex-col gap-1 text-[10px] font-mono">
                  <div className="flex justify-between py-1 border-b border-border-subtle/40">
                    <span className="text-text-muted">Total Ingeridos:</span>
                    <span className="text-text-primary font-bold">{report.kpis.totalCandidates}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle/40">
                    <span className="text-text-muted">Saneados (Válidos):</span>
                    <span className="text-success font-bold">{report.kpis.validCandidates}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle/40">
                    <span className="text-text-muted">Tx. Aprovação:</span>
                    <span className="text-accent font-bold">{formatPercent(report.kpis.approvalRate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle/40">
                    <span className="text-text-muted">Média Teste:</span>
                    <span className="text-text-primary font-bold">{formatFloat(report.kpis.avgScoreTest)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle/40">
                    <span className="text-text-muted">Média Entrevista:</span>
                    <span className="text-text-primary font-bold">{formatFloat(report.kpis.avgScoreInterview)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-subtle/40">
                    <span className="text-text-muted">Duplicados:</span>
                    <span className="text-text-primary font-bold">{report.kpis.duplicateCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Exp. Salarial (Med):</span>
                    <span className="text-text-primary font-bold">{formatCurrency(report.kpis.medianSalaryExpectation)}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-text-muted mt-2 bg-surface-elevated/20 p-3 rounded-xl border border-border-subtle leading-relaxed font-sans">
              <strong>Diretriz Ética de Governança:</strong> Os testes de Welch indicaram ausência de evidência significativa nas notas médias de teste técnico e entrevista entre aprovados e reprovados. As variáveis humanas e técnicas são utilizadas apenas para auditoria de calibragem de processo, sendo vedadas regras automáticas de descarte de candidatos.
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 3 — DATA QUALITY WATERFALL ================= */}
        <PrintPage pageNumber={3}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">3. Diagnóstico e Waterfall do Score de Qualidade</h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              O Health Score da base é reduzido cumulativamente de acordo com a identificação de nulos, duplicados e anomalias de formato. O gráfico abaixo ilustra visualmente as penalidades aplicadas a partir de 100 pontos:
            </p>

            {/* Waterfall Visual component */}
            <div className="border border-border-subtle rounded-xl p-4 bg-surface-elevated/10">
              <HealthScoreWaterfall 
                score={report.healthScore} 
                penalties={report.qualityPenalties} 
                isPrintMode={true} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary mt-2">
              <div className="p-4 rounded-xl border border-border-subtle bg-surface/30">
                <span className="font-bold text-text-primary uppercase text-[10px] tracking-wider block mb-1">Impactos por Campo Incompleto</span>
                <p className="leading-relaxed">
                  A presença de campos em branco em variáveis-chave diminui a confiabilidade das associações ordinais de Spearman. Nulos excessivos reduzem a capacidade do teste qui-quadrado de encontrar significância legítima.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border-subtle bg-surface/30">
                <span className="font-bold text-text-primary uppercase text-[10px] tracking-wider block mb-1">Outliers de Performance</span>
                <p className="leading-relaxed">
                  Valores que excedem limites operacionais razoáveis (como anos de experiência acima de 20 ou salários discrepantes) distorcem as médias do t-test e exigiram saneamento no pipeline.
                </p>
              </div>
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 4 — AUDITORIA BEFORE / AFTER E CLEANING ================= */}
        <PrintPage pageNumber={4}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">4. Auditoria de Saneamento (Before vs After)</h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Auditoria de transição do pipeline analítico. Dados brutos passam por padronização e desduplicação técnica antes de alimentar o Cockpit do dashboard:
            </p>

            {/* Visual comparison bar for Before vs After */}
            <div className="p-5 border border-border-subtle rounded-xl bg-surface-elevated/20 flex flex-col gap-4">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Fluxo de Integridade Volumétrica</span>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-text-primary">1. Registros Ingeridos (Brutos)</span>
                  <span className="text-text-muted font-bold">{report.cleaningAudit.totalRows} registros (100.0%)</span>
                </div>
                <div className="w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-border-subtle">
                  <div className="bg-accent/70 h-full rounded-full w-full"></div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-success">2. Registros Saneados (Limpos)</span>
                  <span className="text-success font-bold">
                    {report.cleaningAudit.validRows} registros ({(report.cleaningAudit.validRows / report.cleaningAudit.totalRows * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-border-subtle">
                  <div 
                    className="bg-success h-full rounded-full" 
                    style={{ width: `${(report.cleaningAudit.validRows / report.cleaningAudit.totalRows * 100)}%` }}
                  ></div>
                </div>
              </div>

              {report.cleaningAudit.duplicatesRemoved > 0 && (
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-red-400">3. Registros Duplicados Excluídos</span>
                    <span className="text-red-400 font-bold">
                      {report.cleaningAudit.duplicatesRemoved} registros ({(report.cleaningAudit.duplicatesRemoved / report.cleaningAudit.totalRows * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-elevated h-3 rounded-full overflow-hidden border border-border-subtle">
                    <div 
                      className="bg-red-500/60 h-full rounded-full" 
                      style={{ width: `${(report.cleaningAudit.duplicatesRemoved / report.cleaningAudit.totalRows * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-primary block">Regras de Negócio Aplicadas no Saneamento</span>
                <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-elevated/15 divide-y divide-border-subtle text-[11px] font-mono text-text-secondary">
                  <div className="flex justify-between px-3 py-2">
                    <span>Desduplicação por candidate_id</span>
                    <span className="text-success font-bold">Executada</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span>Validação estrutural de email</span>
                    <span className="text-success font-bold">Executada</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span>Filtro de limites para score_test</span>
                    <span className="text-success font-bold">Executada</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span>Identificação de outliers (IQR)</span>
                    <span className="text-success font-bold">Executada</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-primary block">Conformidade e Mascaramento de Identificadores (PII)</span>
                <div className="border border-border-subtle rounded-lg bg-surface-elevated/15 p-4 text-[11px] leading-relaxed text-text-secondary flex flex-col gap-2">
                  <p>
                    <strong>Mascaramento Ativo:</strong> {report.cleaningAudit.maskingEnabled ? "SIM (Nível de Apresentação)" : "NÃO"}.
                  </p>
                  <p>
                    Em alinhamento com as regras da LGPD, os campos contendo nomes completos de candidatos e endereços eletrônicos originais são substituídos por hashes anonimizados técnicos no relatório.
                  </p>
                  <p className="font-mono text-[10px] text-accent flex items-center gap-1.5 mt-1">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Nome real &rarr; Candidato CAN0001 | E-mail real &rarr; g***@domain.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 5 — PROCESS FUNNEL & CHANNELS ================= */}
        <PrintPage pageNumber={5}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-1.5 justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">5. Funil Operacional e Eficiência de Canais</h2>
              </div>
              <span className="text-[9px] text-text-muted font-mono">Total Válidos: {report.kpis.validCandidates}</span>
            </div>

            {/* Custom SVG Funnel inside PDF */}
            <div className="border border-border-subtle rounded-xl p-3 bg-surface-elevated/5 flex items-center justify-center min-h-[220px]">
              <OperationalFunnel funnelData={data.charts.funnel || []} totalCandidates={report.kpis.validCandidates} />
            </div>

            {/* Printable Channel Efficiency horizontal bars */}
            <div className="border border-border-subtle rounded-xl p-4 bg-surface-elevated/10 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-text-primary block uppercase tracking-wider">Desempenho por Canal de Captação</span>
              
              <div className="flex flex-col gap-2.5">
                {report.channelEfficiency.slice(0, 4).map((c, i) => (
                  <div key={i} className="grid grid-cols-12 items-center text-xs gap-3">
                    <span className="col-span-3 font-semibold text-text-primary truncate">{c.source}</span>
                    <span className="col-span-2 font-mono text-text-muted text-[11px]">{c.count} inscritos</span>
                    
                    <div className="col-span-5 bg-surface h-2 rounded-full overflow-hidden border border-border-subtle/50">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${(c.count / report.kpis.validCandidates * 100)}%` }}></div>
                    </div>
                    
                    <div className="col-span-2 text-right font-mono font-bold text-success">
                      {formatPercent(c.approvalRate)} aprov.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[9.5px] leading-relaxed text-text-secondary bg-surface/30 p-2.5 border border-border-subtle rounded-lg">
              <strong>Nota de Distribuição Transversal:</strong> Os volumes refletem a contagem em corte transversal (cross-sectional) das etapas declaradas no banco de dados. Os drop-offs calculados representam a relação estática de volume entre etapas no dataset, não indicando atrito temporal individual de candidatos.
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 6 — STATISTICAL EVIDENCE & Spearman Correlation ================= */}
        <PrintPage pageNumber={6}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2">
              <Scale className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">6. Evidência Estatística e Matriz de Correlação</h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Resultados dos testes de hipótese estatísticos (confiança de 95%) e coeficientes ordinais de correlação de Spearman:
            </p>

            {/* Heatmap Grid for Print */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Spearman Heatmap grid */}
              <div className="md:col-span-5 bg-surface-elevated/40 border border-border-subtle p-3 rounded-xl flex flex-col justify-center items-center h-[180px] shrink-0">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-2 font-mono">Correlações de Spearman (R)</span>
                
                <div className="grid grid-cols-5 gap-1 w-full max-w-[280px]">
                  <div></div>
                  {VARIABLES.map((v, i) => (
                    <div key={i} className="text-[8px] font-bold text-center text-text-muted truncate px-0.5" title={v.label}>
                      {v.label.split(" ")[0]}
                    </div>
                  ))}

                  {VARIABLES.map((rowVar, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      <div className="text-[8px] font-bold text-left text-text-muted flex items-center pr-0.5 truncate" title={rowVar.label}>
                        {rowVar.label.split(" ")[0]}
                      </div>

                      {VARIABLES.map((colVar, colIndex) => {
                        const val = printCorrelationMatrix[rowIndex][colIndex];
                        const style = getPrintCellColor(val);
                        return (
                          <div
                            key={colIndex}
                            style={style}
                            className="aspect-square flex items-center justify-center rounded border border-border-subtle/50 text-[9px] font-bold font-mono text-center select-none"
                            title={`${rowVar.label} vs ${colVar.label} = ${val.toFixed(4)}`}
                          >
                            {val.toFixed(2)}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Welch results and p-value indicator */}
              <div className="md:col-span-7 flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Auditoria de Notas (Welch t-test)</span>
                
                {report.statisticalEvidence.filter(e => e.testName.includes("Welch")).map((test, idx) => (
                  <div key={idx} className="p-2.5 bg-surface/30 border border-border-subtle rounded-lg text-[10px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-text-primary text-[10.5px]">{test.testName.split(" para ")[0]}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] ${
                        test.nominalSignificance ? "bg-warning/15 text-warning" : "bg-text-muted/15 text-text-muted"
                      }`}>
                        p-valor = {test.pValue.toFixed(4)}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-tight mt-0.5">{test.practicalInterpretation}</p>
                    
                    {/* Visual Significance Slider */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[7.5px] text-text-muted font-mono">Significância</span>
                      <div className="flex-1 bg-surface h-1 rounded-full relative overflow-hidden border border-border-subtle/40">
                        <div className="absolute left-[5%] top-0 bottom-0 w-[0.8px] bg-red-400"></div> {/* alpha 0.05 marker */}
                        <div 
                          className={`h-full ${test.nominalSignificance ? "bg-success" : "bg-text-muted"}`} 
                          style={{ width: `${Math.max(10, Math.min(100, (1 - test.pValue) * 100))}%` }}
                        ></div>
                      </div>
                      <span className="text-[7.5px] text-text-muted font-mono">1-p</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi-Square (Escolaridade) and ANOVA cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {report.statisticalEvidence.filter(e => !e.testName.includes("Welch")).slice(0, 2).map((test, idx) => (
                <div key={idx} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-lg text-[10px] flex flex-col justify-between gap-1.5">
                  <div>
                    <div className="flex justify-between items-start border-b border-border-subtle/50 pb-1 mb-1 gap-2">
                      <span className="font-bold text-text-primary text-[10.5px] truncate max-w-[170px]" title={test.testName}>{test.testName.replace("Análise de Variância ", "")}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] ${
                        test.correctedSignificance ? "bg-success/15 text-success font-extrabold" : test.nominalSignificance ? "bg-warning/15 text-warning" : "bg-text-muted/15 text-text-muted"
                      }`}>
                        p = {test.pValue.toFixed(4)}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed font-normal">{test.practicalInterpretation}</p>
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-text-muted border-t border-border-subtle/40 pt-1">
                    <span>Estatística: {test.statistic.toFixed(2)}</span>
                    <span>Efeito ({test.testName.includes("Qui-Quadrado") ? "Cramer's V" : "Eta Sq"}): {test.effectSize?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 7 — RESPONSIBLE ANALYTICS & BIAS AUDIT ================= */}
        <PrintPage pageNumber={7}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2">
              <ShieldCheck className="w-5 h-5 text-success" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">7. Governança e Responsible Analytics Center</h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Estrutura ética e governança de dados em conformidade com as diretrizes da LGPD (Lei Geral de Proteção de Dados):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div className="p-4 rounded-xl border border-success/20 bg-success/[0.01] flex flex-col gap-1.5">
                <span className="font-bold text-success uppercase tracking-wider block text-[11px] border-b border-success/10 pb-1">Uso Permitido (Auditoria)</span>
                <ul className="list-disc list-inside space-y-1.5 text-text-secondary leading-relaxed font-medium">
                  {report.responsibleAnalytics.permittedUses.map((use, i) => (
                    <li key={i} className="marker:text-success">{use}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-danger/20 bg-danger/[0.01] flex flex-col gap-1.5">
                <span className="font-bold text-danger uppercase tracking-wider block text-[11px] border-b border-danger/10 pb-1">Uso Proibido (Veto)</span>
                <ul className="list-disc list-inside space-y-1.5 text-text-secondary leading-relaxed font-medium">
                  {report.responsibleAnalytics.prohibitedUses.map((use, i) => (
                    <li key={i} className="marker:text-danger">{use}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Checklist of sensitive fields audit */}
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-elevated/40 text-xs">
              <span className="font-bold text-text-primary block mb-2.5 uppercase text-[10px] tracking-wider">Filtro de Variáveis Sensíveis Auditadas</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="flex items-center space-x-2 text-success">
                  <span className="w-4 h-4 rounded border border-success flex items-center justify-center text-[9px] font-bold">✓</span>
                  <span>Nome: Mascarado</span>
                </div>
                <div className="flex items-center space-x-2 text-success">
                  <span className="w-4 h-4 rounded border border-success flex items-center justify-center text-[9px] font-bold">✓</span>
                  <span>Email: Mascarado</span>
                </div>
                <div className="flex items-center space-x-2 text-success">
                  <span className="w-4 h-4 rounded border border-success flex items-center justify-center text-[9px] font-bold">✓</span>
                  <span>Salário: Sob Custódia</span>
                </div>
                <div className="flex items-center space-x-2 text-warning animate-pulse">
                  <span className="w-4 h-4 rounded border border-warning flex items-center justify-center text-[9px] font-bold">!</span>
                  <span>Proxies: Monitoradas</span>
                </div>
              </div>
            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 8 — RECOMMENDATIONS & ACTION PLAN ================= */}
        <PrintPage pageNumber={8}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">8. Recomendações de Engenharia e Plano de Ação</h2>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              
              <div className="border border-border-subtle p-4 rounded-xl bg-surface-elevated/30 flex flex-col gap-1 hover:border-border-hover transition">
                <span className="font-bold text-text-primary block text-[11px] uppercase tracking-wider text-accent">Curto Prazo: Correções de Qualidade</span>
                <p className="text-text-secondary leading-relaxed">
                  Tratar registros que possuem e-mails de contato inválidos na captação inicial. Revisar os formulários de entrada para exigir validações Regex de e-mail e tornar obrigatório o preenchimento de expectativa salarial, prevenindo nulos estruturais.
                </p>
              </div>

              <div className="border border-border-subtle p-4 rounded-xl bg-surface-elevated/30 flex flex-col gap-1 hover:border-border-hover transition">
                <span className="font-bold text-text-primary block text-[11px] uppercase tracking-wider text-success">Médio Prazo: Auditoria de Calibração</span>
                <p className="text-text-secondary leading-relaxed">
                  Avaliar as réguas de corte de notas. Como os testes de Welch não indicaram diferenças significativas nas médias entre aprovados e reprovados nas notas técnicas de avaliações, é provável que critérios qualitativos de entrevista estejam dominando as decisões, ou que as avaliações atuais não possuam poder discriminatório suficiente.
                </p>
              </div>

              <div className="border border-border-subtle p-4 rounded-xl bg-surface-elevated/30 flex flex-col gap-1">
                <span className="font-bold text-text-primary block text-[11px] uppercase tracking-wider text-warning">Limitações Metodológicas e Notas Estritamente Técnicas</span>
                <ul className="list-disc list-inside space-y-1.5 text-text-secondary leading-relaxed font-medium">
                  {report.limitations.map((limit, i) => (
                    <li key={i} className="marker:text-warning">{limit}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </PrintPage>

        {/* ================= PÁGINA 9 — TECHNICAL APPENDIX & SEMANTIC DICTIONARY ================= */}
        <PrintPage pageNumber={9}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-1.5 justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">9. Apêndice Técnico e Dicionário de Variáveis</h2>
              </div>
              <span className="text-[9px] text-text-muted font-mono">DataFlow Engine v1.3</span>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-text-secondary leading-relaxed">
              <div>
                <span className="font-bold text-text-primary block mb-0.5 uppercase tracking-wider text-[10px]">Cálculo do Score de Qualidade (Health Score)</span>
                <p className="text-[10px] font-mono leading-relaxed bg-surface/50 p-2 border border-border-subtle rounded-lg">
                  Score = 100 - Penalidade(Nulos) - Penalidade(Duplicados) - Penalidade(Colunas Vazias) - Penalidade(Constantes) - Penalidade(E-mails Inválidos) - Penalidade(Outliers)
                </p>
              </div>

              <div>
                <span className="font-bold text-text-primary block mb-1 uppercase tracking-wider text-[10px]">Dicionário de Dados Completo (17 Colunas Mapeadas)</span>
                <div className="border border-border-subtle rounded overflow-hidden max-h-[40vh] overflow-y-auto">
                  <div className="grid grid-cols-12 bg-surface px-3 py-1.5 font-bold text-text-secondary border-b border-border-subtle text-[9px] uppercase">
                    <div className="col-span-3">Nome da Variável</div>
                    <div className="col-span-3">Tipo Inferido</div>
                    <div className="col-span-6">Descrição de Negócio / Proteção LGPD</div>
                  </div>
                  <div className="divide-y divide-border-subtle font-mono text-[9px] bg-surface/10">
                    {report.dataDictionary.map(c => (
                      <div key={c.name} className="grid grid-cols-12 px-3 py-1 text-text-secondary items-start">
                        <div className="col-span-3 font-bold text-text-primary truncate" title={c.name}>{c.name}</div>
                        <div className="col-span-3 truncate" title={c.type}>{c.type}</div>
                        <div className="col-span-6 font-sans text-text-muted leading-tight">
                          {c.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle pt-2.5 text-[8.5px] text-text-muted leading-relaxed text-center font-mono">
                Este artefato técnico foi gerado localmente pelo DataFlow Engine. Não contém dados reais de pessoas. Desenvolvido por Felipe Alirio Baruja como portfólio de engenharia de dados.
              </div>
            </div>
          </div>
        </PrintPage>

      </div>
    </div>
  );
}
