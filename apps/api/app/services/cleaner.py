import re
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

class DataCleaner:
    @staticmethod
    def parse_float(val: Any) -> Any:
        if val is None or val == "":
            return None
        try:
            # Strip spaces, handle comma as decimal point if needed
            cleaned = str(val).strip().replace(',', '.')
            # Keep only digits, dot and negative sign
            cleaned = re.sub(r'[^\d\.\-]', '', cleaned)
            return float(cleaned)
        except Exception:
            return None

    @staticmethod
    def parse_date(val: Any) -> Optional[str]:
        if val is None or val == "":
            return None
        val_str = str(val).strip()
        
        # Try different formats
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y-%m-%d",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y %H:%M",
            "%d/%m/%Y",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S"
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(val_str, fmt)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            except ValueError:
                continue
        return val_str # return original if not parsable, so profiler can flag it

    @staticmethod
    def clean_education(val: Any) -> Optional[str]:
        if val is None or val == "":
            return None
        val_str = str(val).strip().lower()
        
        # Mapping to standard Portuguese names
        if "medio" in val_str or "médio" in val_str:
            return "Ensino Médio"
        elif "superior" in val_str or "gradua" in val_str or "faculdade" in val_str:
            return "Ensino Superior"
        elif "pos" in val_str or "pós" in val_str or "especializacao" in val_str or "especialização" in val_str:
            return "Pós-Graduação"
        elif "mestrado" in val_str or "mestre" in val_str:
            return "Mestrado"
        elif "doutorado" in val_str or "doutor" in val_str or "phd" in val_str:
            return "Doutorado"
        
        # Capitalize words as fallback
        return val_str.title()

    @staticmethod
    def clean_channel(val: Any) -> Optional[str]:
        if val is None or val == "":
            return None
        val_str = str(val).strip().lower()
        
        # Standard channels
        mapping = {
            "linkedin": "LinkedIn",
            "indeed": "Indeed",
            "indicacao": "Indicação",
            "indicação": "Indicação",
            "gupy": "Gupy",
            "site": "Site Institucional",
            "institucional": "Site Institucional",
            "site institucional": "Site Institucional",
            "glassdoor": "Glassdoor"
        }
        
        for k, v in mapping.items():
            if k in val_str:
                return v
        return val.title()

    @staticmethod
    def clean_status(val: Any) -> Optional[str]:
        if val is None or val == "":
            return None
        val_str = str(val).strip().lower()
        
        if "aprovado" in val_str or "admitido" in val_str or "aceito" in val_str:
            return "Aprovado"
        elif "reprovado" in val_str or "recusado" in val_str or "desclassificado" in val_str:
            return "Reprovado"
        elif "processo" in val_str or "andamento" in val_str or "triagem" in val_str or "teste" in val_str or "entrevista" in val_str:
            return "Em Processo"
        return "Em Processo"

    @classmethod
    def clean_dataset(cls, mapped_records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str]]:
        cleaned_records = []
        logs = []
        
        edu_changes = 0
        channel_changes = 0
        status_changes = 0
        date_changes = 0
        num_changes = 0
        
        seen_ids = set()
        duplicate_count = 0
        
        for idx, rec in enumerate(mapped_records):
            cleaned_rec = rec.copy()
            
            # 1. Trim all strings and normalize empty strings to None
            for k, v in cleaned_rec.items():
                if isinstance(v, str):
                    trimmed = v.strip()
                    cleaned_rec[k] = trimmed if trimmed != "" else None
            
            # 2. Duplicate checking
            cand_id = cleaned_rec.get('candidate_id')
            if cand_id:
                if cand_id in seen_ids:
                    duplicate_count += 1
                    cleaned_rec['is_duplicate'] = True
                else:
                    seen_ids.add(cand_id)
                    cleaned_rec['is_duplicate'] = False
            else:
                cleaned_rec['is_duplicate'] = False
            
            # 3. Categorical cleaning
            orig_edu = cleaned_rec.get('education_level')
            if orig_edu:
                cleaned_edu = cls.clean_education(orig_edu)
                if cleaned_edu != orig_edu:
                    edu_changes += 1
                cleaned_rec['education_level'] = cleaned_edu

            orig_channel = cleaned_rec.get('source_channel')
            if orig_channel:
                cleaned_channel = cls.clean_channel(orig_channel)
                if cleaned_channel != orig_channel:
                    channel_changes += 1
                cleaned_rec['source_channel'] = cleaned_channel

            orig_status = cleaned_rec.get('final_status')
            if orig_status:
                cleaned_status = cls.clean_status(orig_status)
                if cleaned_status != orig_status:
                    status_changes += 1
                cleaned_rec['final_status'] = cleaned_status
                
            # 4. Date cleaning
            orig_date = cleaned_rec.get('timestamp')
            if orig_date:
                cleaned_date = cls.parse_date(orig_date)
                if cleaned_date != orig_date:
                    date_changes += 1
                cleaned_rec['timestamp'] = cleaned_date

            # 5. Numeric cleaning
            for numeric_field in ['experience_years', 'score_test', 'score_interview', 'salary_expectation']:
                orig_num = cleaned_rec.get(numeric_field)
                if orig_num is not None:
                    parsed_num = cls.parse_float(orig_num)
                    if parsed_num != orig_num:
                        num_changes += 1
                    cleaned_rec[numeric_field] = parsed_num

            cleaned_records.append(cleaned_rec)

        # Build execution logs
        if duplicate_count > 0:
            logs.append(f"Identificados {duplicate_count} registros duplicados de candidato (marcados no pipeline).")
        if edu_changes > 0:
            logs.append(f"Normalizado o nível de escolaridade para {edu_changes} registros.")
        if channel_changes > 0:
            logs.append(f"Padronizado o canal de origem para {channel_changes} registros.")
        if status_changes > 0:
            logs.append(f"Normalizado o status final para {status_changes} registros.")
        if date_changes > 0:
            logs.append(f"Formatadas {date_changes} datas para padrão do sistema.")
        if num_changes > 0:
            logs.append(f"Convertidas {num_changes} variáveis numéricas para float/int.")
            
        if not logs:
            logs.append("Os dados já estavam limpos e padronizados.")
            
        return cleaned_records, logs
