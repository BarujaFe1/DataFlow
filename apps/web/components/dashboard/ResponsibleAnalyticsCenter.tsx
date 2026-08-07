"use client";

import React, { useMemo } from "react";
import { ShieldCheck, Lock, Unlock, CheckCircle2, Info, EyeOff } from "lucide-react";
import { ColumnProfile } from "@/types/analysis";
import { maskName, maskEmail, COLUMN_DICTIONARY } from "@/lib/masking";

interface ResponsibleAnalyticsCenterProps {
  columns: ColumnProfile[];
  isPrivacyEnabled: boolean;
  onTogglePrivacy: () => void;
  duplicateCount?: number;
  privacyMode?: string; // 'demo' | 'local' | 'raw' (backend masking context)
}

export default function ResponsibleAnalyticsCenter({
  columns,
  isPrivacyEnabled,
  onTogglePrivacy,
  duplicateCount = 0,
  privacyMode = "demo"
}: ResponsibleAnalyticsCenterProps) {

  // Detect sensitive columns
  const sensitiveColumns = useMemo(() => {
    const sensitiveKeywords = ["gender", "age", "ethnicity", "marital_status", "deficiencias", "genero", "idade", "etnia", "raca", "cor", "sexo", "name", "nome", "email", "phone", "telefone", "salary_expectation", "salario"];
    return columns.filter(c => 
      sensitiveKeywords.some(keyword => c.name.toLowerCase().includes(keyword))
    );
  }, [columns]);

  // PII columns explicitly registered in the data dictionary (demonstrable masking).
  const piiColumns = useMemo(() => {
    return Object.values(COLUMN_DICTIONARY).filter(
      (e) => /Pessoal|Identificador/.test(e.type)
    );
  }, []);

  // Masking guarantee text driven by the backend privacy_mode.
  const maskingGuarantee = useMemo(() => {
    switch (privacyMode) {
      case "raw":
        return {
          tone: "bg-danger/10 border-danger/20 text-danger",
          icon: <Unlock className="w-3.5 h-3.5 shrink-0" />,
          text: "Modo RAW: dados completos (incluindo PII) expostos por escolha explícita e documentada. Use apenas em contexto local controlado."
        };
      case "local":
        return {
          tone: isPrivacyEnabled ? "bg-success/10 border-success/20 text-success" : "bg-warning/10 border-warning/20 text-warning",
          icon: isPrivacyEnabled ? <Lock className="w-3.5 h-3.5 shrink-0" /> : <Unlock className="w-3.5 h-3.5 shrink-0" />,
          text: `Modo Local: o mascaramento segue o toggle LGPD do cabeçalho (atualmente ${isPrivacyEnabled ? "ATIVO" : "INATIVO"}). O CSV de exportação do servidor sempre mascara PII.`
        };
      default:
        return {
          tone: "bg-success/10 border-success/20 text-success",
          icon: <Lock className="w-3.5 h-3.5 shrink-0" />,
          text: "Modo Demo: mascaramento garantido no servidor. O CSV de exportação (GET /api/export) nunca contém PII bruta, por design."
        };
    }
  }, [privacyMode, isPrivacyEnabled]);

  // Allowed uses list
  const allowedUses = [
    "Auditar e calibrar as réguas e critérios de avaliação do processo seletivo.",
    "Identificar discrepâncias e drop-offs anômalos no funil de captação.",
    "Avaliar a eficiência agregada de conversão por canal de atração.",
    "Análise estatística agregada para subsidiar planejamento estratégico de RH."
  ];

  // Prohibited uses list
  const prohibitedUses = [
    "Ranquear automaticamente candidatos individuais para fins de eliminação.",
    "Aprovar ou reprovar candidatos sem revisão humana qualificada.",
    "Utilizar variáveis demográficas ou socioeconômicas como barreira de entrada.",
    "Tomar decisões de contratação baseando-se unicamente em p-valores."
  ];

  return (
    <div className="glass-card p-6 w-full flex flex-col gap-6 border border-border-subtle bg-surface-elevated/10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span>Responsible Analytics Center</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Governança de dados, conformidade LGPD e ética algorítmica integradas nativamente na ferramenta.
          </p>
        </div>

        {/* Live LGPD state badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePrivacy}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              isPrivacyEnabled 
                ? "bg-success/10 border-success/30 text-success" 
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            {isPrivacyEnabled ? (
              <>
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Modo LGPD: Ativo (Mascarado)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 shrink-0" />
                <span>Modo LGPD: Inativo (Exposto)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Allowed and Prohibited Uses */}
        <div className="flex flex-col gap-5">
          {/* Finalidades Permitidas */}
          <div className="p-4 rounded-xl border border-success/15 bg-success/[0.01] flex flex-col gap-2">
            <span className="text-xs font-bold text-success uppercase tracking-wider block">Finalidades Permitidas</span>
            <ul className="list-disc list-inside text-xs text-text-secondary space-y-2 leading-relaxed font-medium">
              {allowedUses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </div>

          {/* Finalidades Proibidas */}
          <div className="p-4 rounded-xl border border-danger/15 bg-danger/[0.01] flex flex-col gap-2">
            <span className="text-xs font-bold text-danger uppercase tracking-wider block">Finalidades Proibidas</span>
            <ul className="list-disc list-inside text-xs text-text-secondary space-y-2 leading-relaxed font-medium">
              {prohibitedUses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Sensitive columns & Audit Log */}
        <div className="flex flex-col gap-5">
          
          {/* Sensitive Columns Detected */}
          <div className="p-4 rounded-xl border border-border-subtle bg-surface/50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">Colunas Sensíveis Detectadas</span>
              <span className="text-[10px] font-mono text-text-muted bg-border-subtle px-2 py-0.5 rounded">
                LGPD / PII
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              O motor de profiling identificou {sensitiveColumns.length} coluna(s) com dados de identificação pessoal ou sensíveis à LGPD:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {sensitiveColumns.map(c => (
                <span 
                  key={c.name}
                  className="px-2 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[10px] text-text-primary flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-accent"></span>
                  <span>{c.name}</span>
                </span>
              ))}
            </div>
            {isPrivacyEnabled && (
              <span className="text-[9px] text-success font-medium flex items-center gap-1 mt-1 leading-normal">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Nomes e e-mails foram anonimizados no dashboard e no PDF de exportação.</span>
              </span>
            )}
          </div>

          {/* Audit Log (Transformations) */}
          <div className="p-4 rounded-xl border border-border-subtle bg-surface/50 flex flex-col gap-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">Data Engineering Audit Log</span>
            <div className="flex flex-col gap-2 text-[11px] font-mono text-text-secondary leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-primary font-bold">[INGESTÃO]</span> Delimitador detectado e parse de cabeçalhos concluído.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-primary font-bold">[DESDUPLICAÇÃO]</span> {duplicateCount} duplicatas identificadas e removidas por candidate_id.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-primary font-bold">[VALIDAÇÃO]</span> Campos de e-mail e notas limpos e padronizados.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-primary font-bold">[INFERÊNCIA]</span> ANOVA, teste t e qui-quadrado rodados com SciPy.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Privacy Disclosure — masking guarantee driven by backend privacy_mode */}
      <div className="p-5 rounded-xl border border-success/15 bg-success/[0.02] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-success shrink-0" />
          <span className="text-xs font-bold text-success uppercase tracking-wider">Divulgação de Privacidade & Mascaramento (LGPD)</span>
        </div>

        {/* Live mode guarantee */}
        <div className={`p-2.5 rounded-lg border flex items-start gap-2 text-[11px] leading-relaxed ${maskingGuarantee.tone}`}>
          {maskingGuarantee.icon}
          <span>{maskingGuarantee.text}</span>
        </div>

        {/* Demonstration of the transform applied to PII */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border-subtle bg-surface/50 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Transformação Aplicada</span>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-secondary">Nome</span>
              <span className="text-text-muted">→</span>
              <span className="text-text-primary">{maskName("Maria Oliveira", "C-1042")}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-secondary">E-mail</span>
              <span className="text-text-muted">→</span>
              <span className="text-text-primary">{maskEmail("maria.oliveira@empresa.com")}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border-subtle bg-surface/50 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Campos PII Protegidos</span>
            <div className="flex flex-wrap gap-1.5">
              {piiColumns.slice(0, 6).map((c) => (
                <span
                  key={c.name}
                  className="px-2 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[9px] text-text-secondary"
                >
                  {c.name}
                </span>
              ))}
            </div>
            <span className="text-[9px] text-text-muted">
              {piiColumns.length} campo(s) pessoais/identificadores registrados no dicionário de dados.
            </span>
          </div>
        </div>
      </div>

      {/* Footer warning */}
      <div className="p-3 bg-surface-elevated border border-border-subtle rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed text-text-muted">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p>
          <strong>Aviso de Viés Amostral:</strong> Associações estatísticas (como Qui-quadrado) apontam diferenças agregadas de processo na amostra histórica e não devem ser interpretadas como causalidade linear ou justificativa técnica para ranqueamento automatizado.
        </p>
      </div>

    </div>
  );
}
