# Security notes

## Scope

DataFlow is a **portfolio / lab** analytics product. It is not a certified LGPD compliance platform.

## Findings & mitigations (2026-07-13)

| Topic | Status |
|-------|--------|
| Secrets in repo | No private API keys or DB credentials found |
| `.env` | Ignored; `.env.example` has public demo URL only |
| PII in API responses | Fixed: records masked by default via `services/masking.py` |
| Reveal mode | Gated by `DATAFLOW_ALLOW_PII_REVEAL` |
| CORS | Allow-list (not `*` + credentials) |
| Auth | None — do not upload real personal data to public demos |

## If you find an exposed secret

1. Rotate the credential immediately.
2. Document here **without** pasting the secret value.
3. Scrub git history if it was committed.

## Responsible use

- Demo seed is synthetic.
- Public demo: keep privacy masked.
- Local audit of real CSVs: run offline, enable reveal only if legally justified, delete exports.
