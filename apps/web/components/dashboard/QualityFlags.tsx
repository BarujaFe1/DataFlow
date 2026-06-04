"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Hash, 
  Type, 
  Check, 
  Lock,
  Tag,
  User,
  Activity,
  AlertTriangle,
  MapPin,
  HeartHandshake,
  LayoutGrid
} from "lucide-react";
import { ColumnProfile, AnalysisResponse } from "@/types/analysis";
import HealthScoreWaterfall from "@/components/charts/HealthScoreWaterfall";


interface QualityFlagsProps {
  quality: AnalysisResponse["quality"];
  kpis: AnalysisResponse["kpis"];
}

type ColumnCategory = 
  | 'Identificação' 
  | 'Datas' 
  | 'Geografia' 
  | 'Perfil' 
  | 'Processo' 
  | 'Métricas' 
  | 'Preferências' 
  | 'Colunas sensíveis';

export default function QualityFlags({ quality, kpis }: QualityFlagsProps) {
  const { columns, health_score } = quality;
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState<string>("all");

  const toggleExpand = (colName: string) => {
    setExpandedCol(prev => (prev === colName ? null : colName));
  };

  // Group columns into 8 categories
  const getColumnCategory = (colName: string): ColumnCategory => {
    const name = colName.toLowerCase();
    
    // 1. Colunas Sensíveis
    const sensitive = ["gender", "age", "ethnicity", "marital_status", "deficiencias", "genero", "idade", "etnia", "raca", "cor", "sexo"];
    if (sensitive.some(kw => name.includes(kw))) return 'Colunas sensíveis';
    
    // 2. Identificação
    const idKeywords = ["id", "name", "nome", "email", "phone", "telefone", "candidate_id", "contact", "contato"];
    if (idKeywords.some(kw => name.includes(kw))) return 'Identificação';
    
    // 3. Datas
    const dateKeywords = ["date", "data", "time", "timestamp", "ano", "mes", "dia", "criado", "created"];
    if (dateKeywords.some(kw => name.includes(kw))) return 'Datas';

    // 4. Geografia
    const geoKeywords = ["city", "state", "uf", "cidade", "estado", "address", "geo", "location", "localizacao"];
    if (geoKeywords.some(kw => name.includes(kw))) return 'Geografia';
    
    // 5. Preferências
    const prefKeywords = ["availability", "disponibilidade", "preference", "preferencia", "remote", "remoto", "hybrid", "hibrido"];
    if (prefKeywords.some(kw => name.includes(kw))) return 'Preferências';

    // 6. Processo
    const processKeywords = ["status", "stage", "etapa", "resultado", "final_status", "contratado", "aprovado"];
    if (processKeywords.some(kw => name.includes(kw))) return 'Processo';
    
    // 7. Métricas
    const metricKeywords = ["score", "nota", "salary", "salario", "expectation", "experience", "experiencia", "years", "anos", "valor"];
    if (metricKeywords.some(kw => name.includes(kw))) return 'Métricas';
    
    return 'Perfil';
  };

  // Map category icons
  const categoryIcons: Record<ColumnCategory, React.ReactNode> = {
    'Identificação': <User className="w-3.5 h-3.5 text-accent" />,
    'Datas': <Calendar className="w-3.5 h-3.5 text-accent" />,
    'Geografia': <MapPin className="w-3.5 h-3.5 text-accent" />,
    'Perfil': <Tag className="w-3.5 h-3.5 text-accent" />,
    'Processo': <Check className="w-3.5 h-3.5 text-success" />,
    'Métricas': <Activity className="w-3.5 h-3.5 text-accent" />,
    'Preferências': <HeartHandshake className="w-3.5 h-3.5 text-accent" />,
    'Colunas sensíveis': <Lock className="w-3.5 h-3.5 text-danger" />
  };

  // Categorize columns
  const categorizedColumns = useMemo(() => {
    const groups: Record<ColumnCategory, ColumnProfile[]> = {
      'Identificação': [],
      'Datas': [],
      'Geografia': [],
      'Perfil': [],
      'Processo': [],
      'Métricas': [],
      'Preferências': [],
      'Colunas sensíveis': []
    };
    columns.forEach(col => {
      const cat = getColumnCategory(col.name);
      groups[cat].push(col);
    });
    return groups;
  }, [columns]);

  // Sparkline generator
  const renderSparkline = (col: ColumnProfile) => {
    if (col.inferred_type === "number" && col.stats) {
      return (
        <div className="flex items-center space-x-1 w-20 h-5 px-1.5 bg-surface-elevated/40 rounded border border-border-subtle/50 text-[9px] font-mono text-text-muted justify-between">
          <span>{col.stats.min?.toFixed(0)}</span>
          <div className="flex-1 mx-1 h-1 bg-accent/20 rounded relative">
            <span className="absolute left-[35%] top-0 bottom-0 w-1 bg-accent rounded-full"></span>
          </div>
          <span>{col.stats.max?.toFixed(0)}</span>
        </div>
      );
    }
    
    if (col.top_values && col.top_values.length > 0) {
      return (
        <div className="flex items-center space-x-0.5 w-20 h-5 px-1 bg-surface-elevated/40 rounded border border-border-subtle/50">
          {col.top_values.slice(0, 3).map((val, idx) => {
            const colors = ["bg-accent", "bg-success", "bg-warning"];
            return (
              <div 
                key={idx}
                className={`h-2.5 rounded-sm ${colors[idx % colors.length]}`} 
                style={{ width: `${Math.max(5, val.rate * 80)}%` }}
                title={`${val.value}: ${(val.rate*100).toFixed(0)}%`}
              />
            );
          })}
        </div>
      );
    }

    return <span className="text-[9px] text-text-muted font-mono">Sem preview</span>;
  };

  // Waterfall/Breakdown calculations
  const scoreBreakdown = useMemo(() => {
    // 1. Missing cells
    const totalCells = (kpis.total_candidates || 305) * columns.length;
    const missingCells = columns.reduce((sum, c) => sum + c.missing_count, 0);
    const overallMissingRate = totalCells > 0 ? missingCells / totalCells : 0;
    const missingPenalty = Math.floor(overallMissingRate * 25);

    // 2. Duplicates
    const duplicateCount = kpis.duplicate_count || 0;
    const duplicateRate = kpis.total_candidates > 0 ? duplicateCount / kpis.total_candidates : 0;
    const dupPenalty = duplicateRate > 0 ? Math.min(15, Math.floor(duplicateRate * 50) + 2) : 0;

    // 3. Column penalties
    let emptyCols = 0;
    let constCols = 0;
    let invalidEmailCols = 0;
    let outlierCols = 0;

    columns.forEach(c => {
      if (c.flags.includes("Coluna totalmente vazia")) emptyCols++;
      if (c.flags.includes("Coluna constante (mesmo valor em todas as linhas)")) constCols++;
      if (c.flags.some(f => f.includes("E-mails inválidos"))) invalidEmailCols++;
      if (c.flags.some(f => f.toLowerCase().includes("outlier"))) outlierCols++;
    });

    const emptyPenalty = Math.min(20, emptyCols * 10);
    const constPenalty = Math.min(15, constCols * 5);
    const emailPenalty = invalidEmailCols > 0 ? 10 : 0;
    const outlierPenalty = outlierCols > 0 ? 5 : 0;

    return {
      initial: 100,
      missingPenalty,
      dupPenalty,
      emptyPenalty,
      constPenalty,
      emailPenalty,
      outlierPenalty,
      final: health_score
    };
  }, [columns, kpis, health_score]);

  // Generate Issue Register items
  const issues = useMemo(() => {
    const list: Array<{
      id: string;
      severity: "critical" | "high" | "medium" | "low" | "info";
      column: string;
      problemType: string;
      evidence: string;
      analyticalImpact: string;
      recommendedAction: string;
      status: "sinalizado" | "tratado" | "ignorado" | "revisar manualmente";
    }> = [];

    let issueId = 1;

    // Duplicates issue
    if (kpis.duplicate_count && kpis.duplicate_count > 0) {
      list.push({
        id: `ERR-${issueId++}`,
        severity: "high",
        column: "candidate_id",
        problemType: "Registros Duplicados",
        evidence: `${kpis.duplicate_count} linhas duplicadas`,
        analyticalImpact: "Inflaciona volumetria agregada e distorce taxas de conversão de funil.",
        recommendedAction: "Desduplicar no pipeline ingerindo apenas a primeira ou última ocorrência por timestamp.",
        status: "tratado"
      });
    }

    // Column flags issues
    columns.forEach(col => {
      col.flags.forEach(flag => {
        let severity: "critical" | "high" | "medium" | "low" | "info" = "medium";
        let impact = "Reduz a acurácia dos testes estatísticos locais.";
        let action = "Investigar na origem.";
        let status: "sinalizado" | "tratado" | "ignorado" | "revisar manualmente" = "sinalizado";

        if (flag.includes("vazia")) {
          severity = "critical";
          impact = "Coluna inutilizável para cruzamentos analíticos; perda de informação de feature.";
          action = "Excluir coluna da análise ou revisar processo de salvamento de dados.";
          status = "revisar manualmente";
        } else if (flag.includes("constante")) {
          severity = "medium";
          impact = "Variável sem poder discriminatório ou variabilidade estatística.";
          action = "Desconsiderar em análises estatísticas agregadas.";
        } else if (flag.includes("E-mails inválidos")) {
          severity = "high";
          impact = "Inviabiliza contato operacional. Indica integridade de entrada corrompida.";
          action = "Implementar regex de validação no formulário front-end.";
        } else if (flag.includes("Outliers")) {
          severity = "medium";
          impact = "Distorce médias aritméticas e viola pressupostos de normalidade nos testes paramétricos.";
          action = "Revisar outliers extremos ou substituir médias por medianas.";
        } else if (flag.includes("nulos")) {
          severity = "medium";
          impact = "Diminui o tamanho amostral efetivo ao cruzar múltiplos campos.";
          action = "Tornar o campo obrigatório no cadastro.";
        } else if (flag.includes("cardinalidade")) {
          severity = "info";
          impact = "Variável categórica muito dispersa, dificulta agrupamento visual.";
          action = "Criar categorias de consolidação (ex: agrupar estados por região).";
        }

        list.push({
          id: `ERR-${issueId++}`,
          severity,
          column: col.name,
          problemType: flag.split("(")[0].trim(),
          evidence: flag,
          analyticalImpact: impact,
          recommendedAction: action,
          status
        });
      });
    });

    return list;
  }, [columns, kpis]);

  const filteredIssues = useMemo(() => {
    if (issueFilter === "all") return issues;
    return issues.filter(iss => iss.severity === issueFilter);
  }, [issues, issueFilter]);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* SECTION 1: Health Breakdown & Before vs After Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Waterfall Health Breakdown */}
        <HealthScoreWaterfall 
          score={health_score} 
          penalties={{
            missingPenalty: scoreBreakdown.missingPenalty,
            dupPenalty: scoreBreakdown.dupPenalty,
            emptyPenalty: scoreBreakdown.emptyPenalty,
            constPenalty: scoreBreakdown.constPenalty,
            emailPenalty: scoreBreakdown.emailPenalty,
            outlierPenalty: scoreBreakdown.outlierPenalty
          }}
        />

        {/* Before vs After Data Audit */}
        <div className="glass-card p-5 border border-border-subtle bg-surface-elevated/10 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-text-primary">Auditoria de Limpeza (Before vs After)</h4>
            <p className="text-[10px] text-text-secondary mt-0.5">Saneamento e conformidade efetuados no pipeline de dados.</p>
          </div>

          <div className="my-3 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2 rounded bg-danger/5 border border-danger/10">
                <span className="text-[9px] text-text-muted uppercase block">Estado Bruto</span>
                <span className="text-sm font-bold text-danger font-mono block mt-1">{kpis.total_candidates} linhas</span>
                <span className="text-[8px] text-text-muted block mt-0.5">Com duplicações e PII exposta</span>
              </div>
              <div className="p-2 rounded bg-success/5 border border-success/10">
                <span className="text-[9px] text-text-muted uppercase block">Estado Saneado</span>
                <span className="text-sm font-bold text-success font-mono block mt-1">{kpis.valid_candidates} linhas</span>
                <span className="text-[8px] text-success block mt-0.5">LGPD & Casing tratados</span>
              </div>
            </div>

            <div className="border border-border-subtle/50 rounded-lg p-2.5 bg-surface/30 space-y-1 text-[10px] font-mono leading-normal text-text-secondary">
              <div className="flex justify-between">
                <span>Duplicados Excluídos:</span>
                <span className="font-bold text-text-primary">{kpis.duplicate_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Emails Inválidos Flagged:</span>
                <span className="font-bold text-text-primary">Ativo</span>
              </div>
              <div className="flex justify-between">
                <span>PII Masking (LGPD):</span>
                <span className="font-bold text-success">Ativado</span>
              </div>
            </div>
          </div>

          <span className="text-[9px] text-text-muted block text-right font-mono">* Proteção de privacidade e normalização ativas.</span>
        </div>

        {/* Missingness Matrix Visualizer */}
        <div className="glass-card p-5 border border-border-subtle bg-surface-elevated/10 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-text-primary">Missingness Matrix</h4>
            <p className="text-[10px] text-text-secondary mt-0.5">Representação visual simplificada da completude por campo mapeado.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 my-2">
            {columns.map(col => {
              const comp = 1 - col.missing_rate;
              const dotsCount = Math.round(comp * 10);
              return (
                <div 
                  key={col.name}
                  className="p-2 rounded bg-surface/50 border border-border-subtle/60 flex flex-col justify-between h-14"
                  title={`${col.name}: ${(comp*100).toFixed(0)}% preenchido`}
                >
                  <span className="text-[9px] font-mono font-bold text-text-primary truncate">{col.name}</span>
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <span 
                        key={idx}
                        className={`w-1 h-2 rounded-sm ${
                          idx < dotsCount 
                            ? comp >= 0.95 ? "bg-success/80" : "bg-warning/80"
                            : "bg-danger/25"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono text-text-muted mt-1">{(comp*100).toFixed(0)}% comp.</span>
                </div>
              );
            })}
          </div>

          <span className="text-[9px] text-text-muted block text-right font-mono">* Blocos verdes representam 100% a 95% de completude.</span>
        </div>

      </div>

      {/* SECTION 2: Column Quality Cards */}
      <div className="glass-card p-5 border border-border-subtle bg-surface-elevated/10">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-accent" />
            <span>Column Quality Cards</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Profiling detalhado de colunas agrupadas em domínios semânticos. Clique nas colunas para obter relatórios analíticos locais.
          </p>
        </div>

        <div className="flex flex-col gap-6 mt-5">
          {(Object.keys(categorizedColumns) as ColumnCategory[]).map(groupName => {
            const cols = categorizedColumns[groupName];
            if (cols.length === 0) return null;

            return (
              <div key={groupName} className="flex flex-col gap-2.5">
                {/* Category Header */}
                <div className="flex items-center space-x-2 px-1 py-1 border-b border-border-subtle/65">
                  {categoryIcons[groupName]}
                  <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    {groupName}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-border-subtle text-text-secondary">
                    {cols.length}
                  </span>
                </div>

                {/* Columns layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cols.map(col => {
                    const isExpanded = expandedCol === col.name;
                    const completeness = 1 - col.missing_rate;
                    const hasFlags = col.flags && col.flags.length > 0;

                    return (
                      <div 
                        key={col.name} 
                        className={`border border-border-subtle rounded-xl overflow-hidden bg-surface/30 transition-all duration-300 ${
                          isExpanded ? "border-accent/40 bg-surface-elevated/30 shadow-lg" : "hover:border-border-hover"
                        }`}
                      >
                        {/* Summary Header */}
                        <div 
                          onClick={() => toggleExpand(col.name)}
                          className="px-4 py-3 flex items-center justify-between cursor-pointer select-none gap-4"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="p-1 rounded bg-border-subtle/50 text-text-secondary shrink-0" title={col.inferred_type}>
                              {col.inferred_type === "number" ? <Hash className="w-3.5 h-3.5" /> : col.inferred_type === "date" ? <Calendar className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-mono font-bold text-text-primary truncate">{col.name}</span>
                              <span className="text-[9px] text-text-muted capitalize">{col.inferred_type}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            {renderSparkline(col)}

                            <div className="flex items-center space-x-1.5">
                              <span className={`text-[10px] font-bold font-mono ${completeness >= 0.95 ? "text-success" : completeness >= 0.8 ? "text-warning" : "text-danger"}`}>
                                {(completeness * 100).toFixed(0)}%
                              </span>
                            </div>

                            {hasFlags ? (
                              <div className="p-0.5 rounded bg-danger/10 border border-danger/25 text-danger" title="Inconsistências detectadas">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                              </div>
                            ) : (
                              <div className="p-0.5 rounded bg-success/15 border border-success/25 text-success" title="Qualidade ótima">
                                <Check className="w-3.5 h-3.5 shrink-0" />
                              </div>
                            )}

                            <div>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Section */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-border-subtle/50 flex flex-col gap-3 text-xs bg-surface/10 animate-fade-in">
                            
                            {/* Warnings/Flags banner */}
                            {hasFlags && (
                              <div className="p-2.5 bg-danger/5 border border-danger/10 rounded-lg text-danger">
                                <span className="font-bold text-[10px] uppercase block mb-1">Alertas locais:</span>
                                <ul className="list-disc list-inside space-y-0.5 font-medium leading-relaxed text-[11px]">
                                  {col.flags.map((flag, idx) => (
                                    <li key={idx}>{flag}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Detailed Statistics Grid */}
                            {col.inferred_type === "number" && col.stats && (
                              <div className="grid grid-cols-5 gap-2 bg-surface p-2.5 rounded-lg border border-border-subtle/80 text-center font-mono text-[10px]">
                                <div>
                                  <span className="text-[9px] text-text-muted block">MÍN</span>
                                  <span className="font-bold text-text-primary">{col.stats.min?.toFixed(1)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-text-muted block">MED</span>
                                  <span className="font-bold text-text-primary">{col.stats.median?.toFixed(1)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-text-muted block">MÉD</span>
                                  <span className="font-bold text-text-primary">{col.stats.mean?.toFixed(1)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-text-muted block">MÁX</span>
                                  <span className="font-bold text-text-primary">{col.stats.max?.toFixed(1)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-text-muted block">D.PAD</span>
                                  <span className="font-bold text-text-primary">{col.stats.std?.toFixed(1)}</span>
                                </div>
                              </div>
                            )}

                            {/* Top values list */}
                            {col.top_values && col.top_values.length > 0 && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Distribuição de Valores Frequentes:</span>
                                <div className="space-y-1.5 font-mono text-[10px]">
                                  {col.top_values.map((v, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-4">
                                      <span className="text-text-primary font-medium truncate max-w-[120px]">{v.value}</span>
                                      <div className="flex-1 mx-2 h-1 bg-surface rounded-full overflow-hidden">
                                        <div className="h-full bg-accent/70 rounded-full" style={{ width: `${v.rate * 100}%` }} />
                                      </div>
                                      <span className="text-text-secondary w-16 text-right shrink-0">{v.count} ({ (v.rate * 100).toFixed(0) }%)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* General description mapping */}
                            <div className="text-[10px] text-text-muted border-t border-border-subtle/50 pt-2 font-sans">
                              <strong>Mapeador Semântico:</strong> Mapeado a nível estrutural como <code>{col.name}</code>. Validação de integridade: Concluída.
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Quality Issues Register */}
      <div className="glass-card p-5 border border-border-subtle bg-surface-elevated/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-text-primary">Quality Issues Register</h4>
            <p className="text-[10px] text-text-secondary mt-0.5">Lista unificada de falhas de integridade e inconsistências analíticas rastreadas na base.</p>
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle p-0.5 bg-surface text-[10px] font-semibold shrink-0">
            {["all", "critical", "high", "medium", "info"].map(sev => (
              <button
                key={sev}
                onClick={() => setIssueFilter(sev)}
                className={`px-2 py-1 rounded transition uppercase ${
                  issueFilter === sev ? "bg-surface-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {sev === "all" ? "Todos" : sev === "critical" ? "Crítico" : sev === "high" ? "Alto" : sev === "medium" ? "Médio" : "Info"}
              </button>
            ))}
          </div>
        </div>

        {/* Table representation */}
        <div className="mt-4 border border-border-subtle rounded-xl overflow-hidden bg-surface/20 text-xs">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-surface-elevated px-4 py-2 border-b border-border-subtle font-bold text-text-secondary text-[11px] uppercase tracking-wider">
            <div className="col-span-1">Cód</div>
            <div className="col-span-2">Severidade</div>
            <div className="col-span-2">Coluna</div>
            <div className="col-span-3">Falha</div>
            <div className="col-span-4">Impacto e Ação</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border-subtle/60">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-text-muted font-mono italic">
                Nenhum problema de integridade encontrado para a severidade filtrada.
              </div>
            ) : (
              filteredIssues.map(iss => {
                const isCritical = iss.severity === "critical";
                const isHigh = iss.severity === "high";
                const isMedium = iss.severity === "medium";
                
                let severityColor = "bg-surface-elevated text-text-muted border-border-subtle";
                if (isCritical) severityColor = "bg-danger/10 text-danger border-danger/20";
                else if (isHigh) severityColor = "bg-warning/15 text-warning border-warning/30";
                else if (isMedium) severityColor = "bg-blue/10 text-blue border-blue/20";

                return (
                  <div key={iss.id} className="grid grid-cols-12 px-4 py-3 text-text-secondary items-start hover:bg-surface-elevated/20 transition-colors">
                    <div className="col-span-1 font-mono font-bold text-text-muted text-[10px]">{iss.id}</div>
                    
                    <div className="col-span-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${severityColor}`}>
                        {iss.severity === "critical" ? "CRÍTICO" : iss.severity === "high" ? "ALTO" : iss.severity === "medium" ? "MÉDIO" : "INFO"}
                      </span>
                    </div>

                    <div className="col-span-2 font-mono font-semibold text-text-primary text-[10px] truncate pr-2" title={iss.column}>
                      {iss.column}
                    </div>

                    <div className="col-span-3 pr-2">
                      <span className="font-bold text-text-primary block text-[11px] leading-tight">{iss.problemType}</span>
                      <span className="text-[9px] text-text-muted block mt-0.5 truncate font-mono" title={iss.evidence}>{iss.evidence}</span>
                    </div>

                    <div className="col-span-4 flex flex-col gap-1 leading-relaxed text-[11px]">
                      <p><strong className="text-text-primary">Impacto:</strong> {iss.analyticalImpact}</p>
                      <p><strong className="text-accent">Ação:</strong> {iss.recommendedAction}</p>
                      <p className="text-[9px] text-text-muted font-mono mt-1 uppercase flex items-center gap-1.5">
                        <span>Status:</span>
                        <span className={`font-bold ${iss.status === "tratado" ? "text-success" : "text-warning"}`}>
                          {iss.status}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
