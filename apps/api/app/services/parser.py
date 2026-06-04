import io
import csv
import pandas as pd
from typing import List, Dict, Any, Tuple

class CSVParser:
    @staticmethod
    def detect_encoding(content_bytes: bytes) -> str:
        # Try UTF-8 first
        try:
            content_bytes.decode('utf-8')
            return 'utf-8'
        except UnicodeDecodeError:
            # Fallback to Latin-1
            return 'latin-1'

    @staticmethod
    def detect_delimiter(content_str: str) -> str:
        if not content_str:
            return ','
        # Count common delimiters in the first line
        first_line = content_str.split('\n')[0]
        delimiters = [',', ';', '\t', '|']
        counts = {d: first_line.count(d) for d in delimiters}
        best_delimiter = max(counts, key=counts.get)
        # If no delimiters found, fallback to comma
        if counts[best_delimiter] == 0:
            return ','
        return best_delimiter

    @classmethod
    def parse(cls, content_bytes: bytes) -> Tuple[List[Dict[str, Any]], List[str]]:
        errors = []
        if not content_bytes or len(content_bytes.strip()) == 0:
            return [], ["O arquivo enviado está vazio."]
            
        encoding = cls.detect_encoding(content_bytes)
        try:
            content_str = content_bytes.decode(encoding)
        except Exception as e:
            return [], [f"Erro ao decodificar o arquivo com codificação detectada ({encoding}): {str(e)}"]

        delimiter = cls.detect_delimiter(content_str)
        
        try:
            # Use pandas for robust parsing
            df = pd.read_csv(io.StringIO(content_str), sep=delimiter, dtype=str, skipinitialspace=True)
            # Replace NaN with None for JSON compliance
            df = df.where(pd.notnull(df), None)
            
            records = df.to_dict(orient='records')
            return records, []
        except Exception as e:
            # Fallback to standard csv reader
            try:
                f = io.StringIO(content_str)
                reader = csv.DictReader(f, delimiter=delimiter)
                records = []
                for row in reader:
                    # Clean up empty strings to None
                    cleaned_row = {k: (v if v != '' else None) for k, v in row.items()}
                    records.append(cleaned_row)
                return records, []
            except Exception as e2:
                return [], [f"Falha ao ler o arquivo CSV: {str(e2)} (Erro anterior: {str(e)})"]
