export class ColumnMapper {
  private static readonly ALIASES: Record<string, string[]> = {
    candidate_id: ["candidate_id", "id", "candidato_id", "identificador", "inscricao", "inscrição"],
    timestamp: ["timestamp", "data", "data_inscricao", "data_inscrio", "carimbo de data/hora", "criado_em", "date", "created_at"],
    name: ["name", "nome", "candidato", "nome_completo", "full_name"],
    email: ["email", "e-mail", "mail", "contato"],
    city: ["city", "cidade", "localidade", "municipio", "município"],
    state: ["state", "estado", "uf"],
    education_level: ["education_level", "education", "escolaridade", "nivel_escolaridade", "nvel de escolaridade", "grau_instrucao", "grau_instrução"],
    experience_years: ["experience_years", "experience", "experiencia", "experiência", "anos_experiencia", "anos_experiência", "tempo_experiencia"],
    source_channel: ["source_channel", "source", "canal", "origem", "como_nos_encontrou", "canal_recrutamento"],
    role_applied: ["role_applied", "role", "cargo", "vaga", "funcao", "função", "cargo_pretendido"],
    stage: ["stage", "etapa", "fase", "status_processo", "etapa_processo"],
    score_test: ["score_test", "test_score", "nota_teste", "teste", "prova", "score_prova"],
    score_interview: ["score_interview", "interview_score", "nota_entrevista", "entrevista", "score_entrevista"],
    final_status: ["final_status", "status", "resultado", "aprovado", "parecer", "status_final"],
    salary_expectation: ["salary_expectation", "salary", "pretensao_salarial", "pretensão salarial", "pretensao", "expectativa_salarial", "pretensão"],
    availability: ["availability", "disponibilidade", "inicio", "início", "data_inicio"],
    remote_preference: ["remote_preference", "remote", "trabalho_remoto", "preferencia_trabalho", "preferência", "modelo_trabalho", "modelo"]
  };

  public static autoDetect(headers: string[]): Record<string, string | null> {
    const mapping: Record<string, string | null> = {};
    const headersLower = headers.map(h => h.toLowerCase().trim());

    for (const [field, aliases] of Object.entries(this.ALIASES)) {
      let matchedHeader: string | null = null;

      // Exact match check
      for (const alias of aliases) {
        const idx = headersLower.indexOf(alias);
        if (idx !== -1) {
          matchedHeader = headers[idx];
          break;
        }
      }

      // Substring check if no exact match
      if (!matchedHeader) {
        for (const alias of aliases) {
          for (const originalH of headers) {
            const hLower = originalH.toLowerCase().trim();
            if (hLower.includes(alias) || alias.includes(hLower)) {
              matchedHeader = originalH;
              break;
            }
          }
          if (matchedHeader) break;
        }
      }

      mapping[field] = matchedHeader;
    }

    return mapping;
  }
}
