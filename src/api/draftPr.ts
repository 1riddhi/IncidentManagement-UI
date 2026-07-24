const ANALYZE_API_BASE_URL = import.meta.env.VITE_ANALYZE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface DraftPrPreview { previewId: string; repository: string; baseBranch: string; filePath: string; patch: string; }
export interface DraftPrCreated { url: string; number: number; branch: string; }

export async function requestDraftPrPreview(analysisId: string, repository: string, filePath: string, baseBranch?: string): Promise<DraftPrPreview> {
  return request<DraftPrPreview>(analysisId, "/draft-pr/preview", { repository, filePath, ...(baseBranch ? { baseBranch } : {}) }, ["previewId", "repository", "baseBranch", "filePath", "patch"]);
}

export async function createDraftPr(analysisId: string, previewId: string): Promise<DraftPrCreated> {
  return request<DraftPrCreated>(analysisId, "/draft-pr", { previewId }, ["url", "number", "branch"]);
}

async function request<T>(analysisId: string, path: string, body: object, fields: string[]): Promise<T> {
  const response = await fetch(`${ANALYZE_API_BASE_URL}/analysis-sessions/${encodeURIComponent(analysisId)}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const candidate = payload && typeof payload === "object" ? payload as Record<string, unknown> : undefined;
    const detail = typeof candidate?.detail === "string" ? candidate.detail : `Draft PR request failed (HTTP ${response.status})`;
    throw new Error(detail);
  }
  if (!payload || typeof payload !== "object" || fields.some((field) => !(field in payload))) throw new Error("Draft PR request returned an invalid response");
  return payload as T;
}
