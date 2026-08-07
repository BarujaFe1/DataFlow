"""CSV export helper for the DataFlow API.

Serializes analysis records to CSV. PII masking is applied upstream in the
pipeline (``app.core.security.mask_records``) before records reach the exporter,
so whatever this function writes reflects the active privacy mode.
"""
import csv
import io
from typing import Dict, List, Optional


def records_to_csv(records: List[Dict], columns: Optional[List[str]] = None) -> str:
    """Render a list of record dicts as a CSV string.

    Args:
        records: row dicts (already masked or raw per the active privacy mode).
        columns: optional explicit column order; defaults to the keys of the
            first record.

    Returns:
        CSV text (UTF-8) with a header row. Empty string when there are no records.
    """
    if not records:
        return ""
    if columns is None:
        columns = list(records[0].keys())
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()
    for row in records:
        writer.writerow({k: _stringify(v) for k, v in row.items() if k in columns})
    return buf.getvalue()


def _stringify(value) -> str:
    if value is None:
        return ""
    return str(value)
