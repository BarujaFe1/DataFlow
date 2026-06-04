"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface MappingWizardProps {
  headers: string[];
  autoMapping: Record<string, string | null>;
  onConfirm: (mapping: Record<string, string | null>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const REQUIRED_FIELDS = ["candidate_id", "name", "email"];

const FIELD_LABELS: Record<string, { label: string; desc: string; required: boolean }> = {
  candidate_id: { label: "ID do Candidato", desc: "Identificador único de cada candidato", required: true },
  name: { label: "Nome", desc: "Nome completo do candidato", required: true },
  email: { label: "E-mail", desc: "Endereço de e-mail de contato", required: true },
  timestamp: { label: "Data de Inscrição", desc: "Data/hora em que a inscrição foi realizada", required: false },
  role_applied: { label: "Cargo Pretendido", desc: "Vaga ou posição aplicada", required: false },
  stage: { label: "Etapa Atual", desc: "Fase do processo (ex: Triagem, Teste, Entrevista)", required: false },
  score_test: { label: "Nota do Teste", desc: "Pontuação no teste técnico (0 a 100)", required: false },
  score_interview: { label: "Nota da Entrevista", desc: "Pontuação na entrevista (0 a 100)", required: false },
  final_status: { label: "Status Final", desc: "Resultado do processo (Aprovado, Reprovado, Em Processo)", required: false },
  salary_expectation: { label: "Expectativa Salarial", desc: "Pretensão salarial informada", required: false },
  city: { label: "Cidade", desc: "Cidade de residência", required: false },
  state: { label: "Estado/UF", desc: "Estado de residência (ex: SP, RJ)", required: false },
  education_level: { label: "Nível de Escolaridade", desc: "Grau acadêmico (ex: Superior, Mestrado)", required: false },
  experience_years: { label: "Anos de Experiência", desc: "Tempo de experiência profissional em anos", required: false },
  source_channel: { label: "Canal de Atração", desc: "Como o candidato soube da vaga (ex: LinkedIn, Gupy)", required: false },
  availability: { label: "Disponibilidade de Início", desc: "Tempo para início (ex: Imediato, 15 dias)", required: false },
  remote_preference: { label: "Preferência de Modelo", desc: "Presencial, Híbrido ou Remoto", required: false }
};

export default function MappingWizard({
  headers,
  autoMapping,
  onConfirm,
  onCancel,
  isLoading
}: MappingWizardProps) {
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setMapping({ ...autoMapping });
  }, [autoMapping]);

  const handleFieldChange = (schemaField: string, csvCol: string) => {
    setMapping(prev => ({
      ...prev,
      [schemaField]: csvCol === "__none__" ? null : csvCol
    }));
  };

  const handleValidateAndSubmit = () => {
    const errors: string[] = [];
    REQUIRED_FIELDS.forEach(field => {
      if (!mapping[field]) {
        errors.push(`O campo '${FIELD_LABELS[field].label}' é obrigatório.`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onConfirm(mapping);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Mapeamento de Colunas</h2>
          <p className="text-sm text-text-secondary mt-1">
            Alinhe as colunas detectadas no seu CSV com as variáveis analíticas do sistema.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-text-secondary bg-transparent border border-border-subtle rounded-lg hover:border-border-hover disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleValidateAndSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2 text-sm font-medium text-black bg-accent rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <span>Processando...</span>
            ) : (
              <>
                <span>Executar Análise</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-start space-x-3 text-sm text-danger">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Erro de Validação:</span>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(FIELD_LABELS).map(([schemaField, info]) => {
          const selectedValue = mapping[schemaField] || "__none__";
          const isRequired = info.required;
          const isMapped = !!mapping[schemaField];

          return (
            <div
              key={schemaField}
              className={`p-4 rounded-lg border transition ${
                isMapped
                  ? "border-accent/20 bg-accent/[0.01]"
                  : isRequired
                  ? "border-danger/20 bg-danger/[0.01]"
                  : "border-border-subtle bg-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary">{info.label}</span>
                    {isRequired && (
                      <span className="text-[10px] bg-danger/20 text-danger px-1.5 py-0.5 rounded font-mono">
                        OBRIGATÓRIO
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted mt-0.5 block">{info.desc}</span>
                </div>
                {isMapped && <CheckCircle className="w-4 h-4 text-success" />}
              </div>

              <select
                value={selectedValue}
                onChange={e => handleFieldChange(schemaField, e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent mt-2 transition"
              >
                <option value="__none__">-- Não mapear este campo --</option>
                {headers.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
