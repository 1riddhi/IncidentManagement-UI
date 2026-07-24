import type { ChatResponse } from "../types/incident";

const ANALYZE_API_BASE_URL =
  import.meta.env.VITE_ANALYZE_API_BASE_URL ??
  "http://localhost:8000/api/v1";

export async function requestChatResponse(
  analysisId: string,
  message: string,
): Promise<ChatResponse> {
  const response = await fetch(
    `${ANALYZE_API_BASE_URL}/analysis-sessions/${encodeURIComponent(analysisId)}/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    },
  );

  if (!response.ok) {
    throw new Error(`Incident assistant could not respond (HTTP ${response.status})`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || typeof (payload as Record<string, unknown>).answer !== "string") {
    throw new Error("Incident assistant returned an invalid response");
  }

  const candidate = payload as Record<string, unknown>;
  return {
    answer: candidate.answer as string,
    agentSummary: typeof candidate.agentSummary === "string" ? candidate.agentSummary : undefined,
    evidenceSummary: typeof candidate.evidenceSummary === "string" ? candidate.evidenceSummary : undefined,
    codeChanges: typeof candidate.codeChanges === "string" ? candidate.codeChanges : undefined,
  };
}
