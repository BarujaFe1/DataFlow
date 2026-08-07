import { AnalysisResponse } from "@/types/analysis";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function warmUpBackend(): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timeout);
  } catch {
    // Silent — just pre-warming the cold start
  }
}

const COLD_START_HINT = "O servidor de análise pode estar inicializando (cold start do Render free tier, leva ~30s). Tente novamente em alguns instantes.";

async function fetchWithTimeout(input: string, init?: RequestInit, timeoutMs = 60000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDemoData(): Promise<AnalysisResponse> {
  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/demo`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });
  } catch {
    throw new Error(`Falha ao conectar com o servidor de análise. ${COLD_START_HINT}`);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Falha ao carregar o dataset de demonstração.");
  }

  return res.json();
}

export async function uploadAndAnalyzeFile(
  file: File,
  mapping?: Record<string, string | null>
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (mapping) {
    formData.append("mapping", JSON.stringify(mapping));
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData
    });
  } catch {
    throw new Error(`Falha ao conectar com o servidor de análise. ${COLD_START_HINT}`);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Falha ao analisar o arquivo enviado.");
  }

  return res.json();
}

/**
 * Download the masked CSV produced by the backend's GET /api/export endpoint.
 *
 * This is the *safe* download path: the server always masks PII before serving
 * the file (claim C6), so the resulting blob can never contain raw personal
 * data in demo mode. The blob is named to match the server's
 * Content-Disposition (dataflow_export.csv).
 */
export async function fetchExportCsv(): Promise<void> {
  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/export`, {
      method: "GET",
      headers: { Accept: "text/csv" },
      cache: "no-store"
    });
  } catch {
    throw new Error(`Falha ao conectar com o servidor de análise. ${COLD_START_HINT}`);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Falha ao exportar o CSV mascarado.");
  }

  const blob = await res.blob();
  // Respect the server's declared filename when present.
  const disposition = res.headers.get("Content-Disposition") || "";
  const nameMatch = disposition.match(/filename="?([^";]+)"?/);
  const filename = nameMatch ? nameMatch[1] : "dataflow_export.csv";

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
