export function maskName(name: string, candidateId: string): string {
  if (!name) return "N/A";
  // Always returns Candidate ID in masked mode for professional audit view
  return `Candidato ${candidateId || "S/ID"}`;
}

export function maskEmail(email: string): string {
  if (!email) return "N/A";
  const emailStr = email.trim();
  const atIdx = emailStr.indexOf("@");
  if (atIdx <= 0) return "e***@example.com";
  
  const user = emailStr.slice(0, atIdx);
  const domain = emailStr.slice(atIdx);
  
  if (user.length <= 1) {
    return `${user}***${domain}`;
  }
  return `${user[0]}***${domain}`;
}

export interface DictionaryEntry {
  name: string;
  type: string;
  description: string;
}

export const COLUMN_DICTIONARY: Record<string, DictionaryEntry> = {
  candidate_id: {
    name: "ID Candidato",
    type: "Identificador (Texto)",
    description: "Identificador técnico único do candidato no banco de dados."
  },
  timestamp: {
    name: "Data de Entrada",
    type: "Data/Hora",
    description: "Data e hora exata em que o candidato submeteu o formulário de candidatura."
  },
  name: {
    name: "Nome Completo",
    type: "Identificador Pessoal (Texto)",
    description: "Nome do candidato. Mascarado no painel e no PDF para garantir conformidade com a LGPD."
  },
  email: {
    name: "E-mail de Contato",
    type: "Dados Pessoais (Texto)",
    description: "Endereço de e-mail do candidato. Validado no pipeline e mascarado em exibições públicas."
  },
  city: {
    name: "Cidade",
    type: "Geográfico (Texto)",
    description: "Cidade declarada de residência do candidato."
  },
  state: {
    name: "Estado (UF)",
    type: "Geográfico (Texto)",
    description: "Estado ou Unidade Federativa correspondente à residência do candidato."
  },
  education_level: {
    name: "Escolaridade",
    type: "Perfil Acadêmico (Texto)",
    description: "Nível formal de escolaridade (Ensino Médio, Superior, Pós-Graduação, etc.)."
  },
  experience_years: {
    name: "Anos de Experiência",
    type: "Métrica Profissional (Numérico)",
    description: "Tempo total de experiência profissional declarada (em anos)."
  },
  source_channel: {
    name: "Canal de Atração",
    type: "Métrica de Ingestão (Texto)",
    description: "Canal de atração pelo qual o candidato conheceu a vaga e iniciou o cadastro."
  },
  role_applied: {
    name: "Vaga Pretendida",
    type: "Perfil da Candidatura (Texto)",
    description: "Título da vaga de dados à qual o candidato está aplicando no processo."
  },
  stage: {
    name: "Etapa Atual",
    type: "Processo Operacional (Texto)",
    description: "Fase atual do candidato no funil seletivo (Triagem, Teste, Entrevista, etc.)."
  },
  score_test: {
    name: "Nota do Teste",
    type: "Métrica de Performance (Numérico)",
    description: "Pontuação obtida na avaliação técnica de conhecimentos de dados (escala 0-100)."
  },
  score_interview: {
    name: "Nota da Entrevista",
    type: "Métrica de Performance (Numérico)",
    description: "Pontuação obtida na avaliação estruturada de fit técnico e comportamental."
  },
  final_status: {
    name: "Status do Processo",
    type: "Resultado (Texto)",
    description: "Status final agregador do candidato no funil (Aprovado, Reprovado ou Em Processo)."
  },
  salary_expectation: {
    name: "Expectativa Salarial",
    type: "Métrica Econômica (Numérico)",
    description: "Pretensão salarial informada (em Reais). Tratado sob custódia e proteção LGPD."
  },
  availability: {
    name: "Disponibilidade",
    type: "Preferências (Texto)",
    description: "Prazo de disponibilidade declarado pelo candidato para início na função."
  },
  remote_preference: {
    name: "Preferência Remoto",
    type: "Preferências (Texto)",
    description: "Modalidade de trabalho preferida (Presencial, Híbrido, 100% Remoto)."
  },
  is_duplicate: {
    name: "Flag de Duplicado",
    type: "Validação Técnica (Booleano)",
    description: "Sinalizador do pipeline de dados indicando se o ID já havia sido cadastrado anteriormente."
  }
};
