import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

class DataProfiler:
    @staticmethod
    def infer_type(series: pd.Series) -> str:
        non_null = series.dropna()
        if len(non_null) == 0:
            return 'unknown'
            
        # Try numeric first
        try:
            pd.to_numeric(non_null)
            return 'number'
        except (ValueError, TypeError):
            pass
            
        # Try date
        # Check if values contain date dividers like - or / and can be parsed
        sample = str(non_null.iloc[0])
        if any(char in sample for char in ['-', '/']):
            try:
                pd.to_datetime(non_null, errors='raise')
                return 'date'
            except Exception:
                pass
                
        # Try boolean
        unique_vals = non_null.unique()
        unique_lower = [str(x).lower().strip() for x in unique_vals]
        bool_words = {'true', 'false', 'sim', 'não', 'nao', 'yes', 'no', '0', '1', '0.0', '1.0'}
        if all(x in bool_words for x in unique_lower) and len(unique_vals) <= 2:
            return 'boolean'
            
        return 'string'

    @staticmethod
    def detect_outliers(series: pd.Series) -> List[float]:
        # Outlier detection using IQR
        numeric_series = pd.to_numeric(series, errors='coerce').dropna()
        if len(numeric_series) < 5:
            return []
        q1 = numeric_series.quantile(0.25)
        q3 = numeric_series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = numeric_series[(numeric_series < lower_bound) | (numeric_series > upper_bound)]
        return outliers.tolist()

    @staticmethod
    def is_invalid_email(email: Any) -> bool:
        if email is None or email == "":
            return False
        # Simple email regex
        email_str = str(email).strip()
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return not bool(re.match(pattern, email_str))

    @classmethod
    def profile_dataset(cls, cleaned_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        df = pd.DataFrame(cleaned_records)
        
        total_rows = len(df)
        total_cols = len(df.columns) if total_rows > 0 else 0
        
        columns_profile = []
        dataset_flags = []
        
        # Calculate overall counts
        missing_cells = 0
        total_cells = total_rows * total_cols
        
        duplicate_count = 0
        if 'is_duplicate' in df.columns:
            duplicate_count = int(df['is_duplicate'].sum())
            # Drop the utility column so we don't profile it
            df_profile = df.drop(columns=['is_duplicate'])
        else:
            df_profile = df.copy()
            
        for col_name in df_profile.columns:
            series = df_profile[col_name]
            
            missing_count = int(series.isna().sum())
            missing_cells += missing_count
            missing_rate = missing_count / total_rows if total_rows > 0 else 0
            
            non_null_series = series.dropna()
            unique_count = int(non_null_series.nunique())
            unique_rate = unique_count / total_rows if total_rows > 0 else 0
            
            inferred_type = cls.infer_type(series)
            
            flags = []
            stats = None
            top_values = None
            
            # Type-specific operations
            if inferred_type == 'number':
                numeric_series = pd.to_numeric(series, errors='coerce')
                non_null_num = numeric_series.dropna()
                if len(non_null_num) > 0:
                    stats = {
                        'mean': float(non_null_num.mean()),
                        'median': float(non_null_num.median()),
                        'min': float(non_null_num.min()),
                        'max': float(non_null_num.max()),
                        'std': float(non_null_num.std()) if len(non_null_num) > 1 else 0.0
                    }
                    
                    # Detect outliers
                    outliers = cls.detect_outliers(series)
                    if outliers:
                        flags.append(f"Outliers detectados ({len(outliers)} valores)")
                        
                        # Specific domain outlier check (e.g., negative experience/salary)
                        if col_name == 'experience_years' and any(x < 0 for x in outliers):
                            flags.append("Contém anos de experiência negativos")
                        if col_name == 'salary_expectation' and any(x < 0 for x in outliers):
                            flags.append("Contém expectativa salarial negativa")
            else:
                # Top values for categorical/string
                if len(non_null_series) > 0:
                    counts = non_null_series.value_counts().head(5)
                    top_values = []
                    for val, count in counts.items():
                        top_values.append({
                            'value': str(val),
                            'count': int(count),
                            'rate': float(count / total_rows)
                        })
            
            # Common flags
            if missing_rate > 0.15:
                flags.append(f"Alta taxa de nulos ({missing_rate*100:.1f}%)")
            if missing_rate == 1.0:
                flags.append("Coluna totalmente vazia")
            if unique_count == 1 and missing_count == 0:
                flags.append("Coluna constante (mesmo valor em todas as linhas)")
            if inferred_type == 'string' and unique_rate > 0.5 and unique_count > 10:
                # Exclude candidate_id or email from this card penalty if it is likely an identifier
                if not any(keyword in col_name.lower() for keyword in ['id', 'email', 'name', 'nome']):
                    flags.append(f"Alta cardinalidade ({unique_count} valores únicos)")
                    
            # Email flags
            if col_name == 'email' and len(non_null_series) > 0:
                invalid_emails = [e for e in non_null_series if cls.is_invalid_email(e)]
                if invalid_emails:
                    flags.append(f"E-mails inválidos detectados ({len(invalid_emails)} registros)")
                    
            columns_profile.append({
                'name': col_name,
                'inferred_type': inferred_type,
                'missing_count': missing_count,
                'missing_rate': float(missing_rate),
                'unique_count': unique_count,
                'unique_rate': float(unique_rate),
                'flags': flags,
                'stats': stats,
                'top_values': top_values
            })
            
        # Calculate health score (0 to 100)
        health_score = 100
        penalties = []
        
        # 1. Missing cells penalty (max -25)
        overall_missing_rate = missing_cells / total_cells if total_cells > 0 else 0
        missing_penalty = int(overall_missing_rate * 25)
        if missing_penalty > 0:
            health_score -= missing_penalty
            penalties.append(f"Taxa de preenchimento incompleta: -{missing_penalty} pts")
            
        # 2. Duplicate penalty (max -15)
        duplicate_rate = duplicate_count / total_rows if total_rows > 0 else 0
        if duplicate_rate > 0:
            dup_penalty = min(15, int(duplicate_rate * 50) + 2) # minimum 2 pts penalty if there is any duplicate
            health_score -= dup_penalty
            penalties.append(f"Registros duplicados ({duplicate_count}): -{dup_penalty} pts")
            dataset_flags.append(f"Presença de {duplicate_count} registros duplicados")
            
        # 3. Column issues penalties
        empty_cols = 0
        const_cols = 0
        invalid_email_cols = 0
        outlier_cols = 0
        
        for c in columns_profile:
            if "Coluna totalmente vazia" in c['flags']:
                empty_cols += 1
            if "Coluna constante (mesmo valor em todas as linhas)" in c['flags']:
                const_cols += 1
            if any("E-mails inválidos" in f for f in c['flags']):
                invalid_email_cols += 1
            if any("Outliers detectados" in f for f in c['flags']):
                outlier_cols += 1
                
        if empty_cols > 0:
            empty_penalty = min(20, empty_cols * 10)
            health_score -= empty_penalty
            penalties.append(f"Colunas totalmente vazias ({empty_cols}): -{empty_penalty} pts")
            dataset_flags.append(f"Contém {empty_cols} coluna(s) totalmente vazia(s)")
            
        if const_cols > 0:
            const_penalty = min(15, const_cols * 5)
            health_score -= const_penalty
            penalties.append(f"Colunas constantes ({const_cols}): -{const_penalty} pts")
            dataset_flags.append(f"Contém {const_cols} coluna(s) com valor constante")
            
        if invalid_email_cols > 0:
            email_penalty = 10
            health_score -= email_penalty
            penalties.append(f"E-mails inválidos detectados: -{email_penalty} pts")
            dataset_flags.append("Contém endereços de e-mail inválidos")
            
        if outlier_cols > 0:
            outlier_penalty = 5
            health_score -= outlier_penalty
            penalties.append(f"Outliers em colunas numéricas: -{outlier_penalty} pts")
            dataset_flags.append(f"Outliers detectados em {outlier_cols} coluna(s)")

        # Ensure bounds
        health_score = max(0, min(100, health_score))
        
        # Build health score text summary
        if health_score >= 85:
            summary = "Dataset saudável. Apresenta excelente integridade de dados com poucos nulos e anomalias."
        elif health_score >= 70:
            summary = "Dataset aceitável com pontos de atenção leves (presença moderada de nulos ou duplicatas)."
        elif health_score >= 50:
            summary = "Qualidade média. Há anomalias e incompletudes significativas que podem afetar a precisão das análises."
        else:
            summary = "Crítico! O dataset possui sérios problemas de qualidade de dados (nulos excessivos, duplicatas ou colunas vazias)."
            
        if penalties:
            summary += " Penalidades aplicadas: " + ", ".join(penalties) + "."
            
        return {
            'health_score': health_score,
            'summary': summary,
            'columns': columns_profile,
            'dataset_flags': dataset_flags
        }
