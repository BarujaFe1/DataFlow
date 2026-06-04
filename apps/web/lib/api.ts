import { AnalysisResponse } from "@/types/analysis";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchDemoData(): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/demo`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
    cache: "no-store"
  });

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

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Accept": "application/json"
    },
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Falha ao analisar o arquivo enviado.");
  }

  return res.json();
}
