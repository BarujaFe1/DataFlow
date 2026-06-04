from typing import List, Dict, Any, Optional

class ColumnMapper:
    ALIASES = {
        'candidate_id': ['candidate_id', 'id', 'candidato_id', 'identificador', 'inscricao', 'inscrição'],
        'timestamp': ['timestamp', 'data', 'data_inscricao', 'data_inscrio', 'carimbo de data/hora', 'criado_em', 'date', 'created_at'],
        'name': ['name', 'nome', 'candidato', 'nome_completo', 'full_name'],
        'email': ['email', 'e-mail', 'mail', 'contato'],
        'city': ['city', 'cidade', 'localidade', 'municipio', 'município'],
        'state': ['state', 'estado', 'uf'],
        'education_level': ['education_level', 'education', 'escolaridade', 'nivel_escolaridade', 'nvel de escolaridade', 'grau_instrucao', 'grau_instrução'],
        'experience_years': ['experience_years', 'experience', 'experiencia', 'experiência', 'anos_experiencia', 'anos_experiência', 'tempo_experiencia'],
        'source_channel': ['source_channel', 'source', 'canal', 'origem', 'como_nos_encontrou', 'canal_recrutamento'],
        'role_applied': ['role_applied', 'role', 'cargo', 'vaga', 'funcao', 'função', 'cargo_pretendido'],
        'stage': ['stage', 'etapa', 'fase', 'status_processo', 'etapa_processo'],
        'score_test': ['score_test', 'test_score', 'nota_teste', 'teste', 'prova', 'score_prova'],
        'score_interview': ['score_interview', 'interview_score', 'nota_entrevista', 'entrevista', 'score_entrevista'],
        'final_status': ['final_status', 'status', 'resultado', 'aprovado', 'parecer', 'status_final'],
        'salary_expectation': ['salary_expectation', 'salary', 'pretensao_salarial', 'pretensão salarial', 'pretensao', 'expectativa_salarial', 'pretensão'],
        'availability': ['availability', 'disponibilidade', 'inicio', 'início', 'data_inicio'],
        'remote_preference': ['remote_preference', 'remote', 'trabalho_remoto', 'preferencia_trabalho', 'preferência', 'modelo_trabalho', 'modelo']
    }

    @classmethod
    def auto_detect_mapping(cls, headers: List[str]) -> Dict[str, Optional[str]]:
        mapping = {}
        headers_lower = [h.lower().strip() for h in headers]
        
        for field, field_aliases in cls.ALIASES.items():
            matched_header = None
            # Check exact match
            for alias in field_aliases:
                if alias in headers_lower:
                    idx = headers_lower.index(alias)
                    matched_header = headers[idx]
                    break
            
            # Check substring matches if no exact match found
            if not matched_header:
                for alias in field_aliases:
                    for original_h in headers:
                        h_lower = original_h.lower().strip()
                        if alias in h_lower or h_lower in alias:
                            matched_header = original_h
                            break
                    if matched_header:
                        break
                        
            mapping[field] = matched_header
            
        return mapping

    @classmethod
    def map_records(cls, records: List[Dict[str, Any]], mapping: Dict[str, Optional[str]]) -> List[Dict[str, Any]]:
        mapped_records = []
        for record in records:
            mapped_record = {}
            for schema_field, original_col in mapping.items():
                if original_col and original_col in record:
                    mapped_record[schema_field] = record[original_col]
                else:
                    mapped_record[schema_field] = None
            mapped_records.append(mapped_record)
        return mapped_records
