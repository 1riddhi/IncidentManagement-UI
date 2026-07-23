import type {
  AgentFinding,
  AnalysisResponse,
  Incident,
  IncidentSource,
  ServiceNowIncident,
  Severity,
  SimilarIncident,
} from "../types/incident";

const API_BASE_URL =
  import.meta.env.VITE_INCIDENT_API_BASE_URL ??
  "https://incident-management2-933450255379.asia-south1.run.app/api/v1";
const ANALYZE_API_BASE_URL =
  import.meta.env.VITE_ANALYZE_API_BASE_URL ??
  "https://prod-pulse-933450255379.asia-south1.run.app/api/v1";

const isSeverity = (value: string): value is Severity =>
  ["P1", "P2", "P3", "P4"].includes(value);

export function normalizeIncident(
  incident: ServiceNowIncident,
  source: IncidentSource,
): Incident {
  return {
    ...incident,
    attachments: incident.attachments ?? [],
    severity: isSeverity(incident.severity) ? incident.severity : "P4",
    status: source === "active" ? "Open" : "Resolved",
    source,
  };
}

async function fetchSource(
  source: IncidentSource,
  signal?: AbortSignal,
): Promise<Incident[]> {
  const response = await fetch(`${API_BASE_URL}/incidents/${source}`, { signal });
  if (!response.ok) {
    throw new Error(`${source} incidents could not be loaded (HTTP ${response.status})`);
  }
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error(`${source} incidents returned an invalid response`);
  }
  return (payload as ServiceNowIncident[])
    .map((incident) => normalizeIncident(incident, source))
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
}

export const fetchActiveIncidents = (signal?: AbortSignal) =>
  fetchSource("active", signal);
export const fetchHistoricalIncidents = (signal?: AbortSignal) =>
  fetchSource("historical", signal);

export async function analyzeIncident(
  incident: ServiceNowIncident,
  limit = 3,
): Promise<AnalysisResponse> {
  const requestBody = {
    incident: {
      id: incident.id,
      title: incident.title,
      service: incident.service,
      severity: incident.severity,
      symptoms: incident.symptoms,
      logs: incident.logs ?? "",
    },
    limit,
  };
  const response = await fetch(`${ANALYZE_API_BASE_URL}/incidents/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Incident analysis could not be completed (HTTP ${response.status})`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    throw new Error("Incident analysis returned invalid response");
  }

  const candidate = payload as Record<string, unknown>;

  if (
    !Array.isArray(candidate.agentFindings) ||
    !Array.isArray(candidate.similarIncidents) ||
    typeof candidate.incomingIncident !== "object" ||
    candidate.incomingIncident === null
  ) {
    throw new Error("Incident analysis returned invalid response");
  }

  const nextActionSteps = stringArray(candidate.nextActionSteps);
  const rca = stringArray(candidate.rca);
  const recommendation =
    typeof candidate.recommendation === "string"
      ? candidate.recommendation
      : typeof candidate.summary === "string"
        ? [candidate.summary, nextActionSteps.length ? `Recommended next actions\n${nextActionSteps.map((step) => `- ${step}`).join("\n")}` : ""].filter(Boolean).join("\n\n")
        : null;

  if (!recommendation) {
    throw new Error("Incident analysis returned neither a recommendation nor a summary");
  }

  const normalizedSimilarIncidents: SimilarIncident[] = candidate.similarIncidents.map((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "incident" in item &&
      typeof item.similarity === "number" &&
      typeof item.incident === "object" &&
      item.incident !== null
    ) {
      return {
        ...item.incident,
        attachments: item.incident.attachments ?? [],
        similarity: item.similarity,
      };
    }

    return {
      ...((item as SimilarIncident) ?? {}),
      attachments: (item as SimilarIncident).attachments ?? [],
      similarity: (item as SimilarIncident).similarity ?? 0,
    };
  });

  return {
    analysisId: stringValue(candidate.analysisId),
    incomingIncident: candidate.incomingIncident as Partial<ServiceNowIncident>,
    agentFindings: candidate.agentFindings.map(normalizeAgentFinding),
    recommendation,
    similarIncidents: normalizedSimilarIncidents,
    summary: stringValue(candidate.summary),
    nextActionSteps,
    rca,
    codeChanges: stringValue(candidate.codeChanges),
    evidenceSummary: stringValue(candidate.evidenceSummary),
    agentFlow: Array.isArray(candidate.agentFlow) ? candidate.agentFlow.map(normalizeAgentFlowStep) : [],
    confidence: normalizeConfidence(candidate.confidence),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeAgentFinding(value: unknown): AgentFinding {
  const finding = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    agentName: stringValue(finding.agentName) ?? "Unknown agent",
    status: stringValue(finding.status) ?? "UNKNOWN",
    summary: stringValue(finding.summary) ?? "No summary was returned.",
    evidence: stringValue(finding.evidence) ?? "No evidence was returned.",
  };
}

function normalizeAgentFlowStep(value: unknown) {
  const step = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return { agentName: stringValue(step.agentName) ?? "Unknown agent", status: stringValue(step.status) ?? "UNKNOWN" };
}

function normalizeConfidence(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const confidence = value as Record<string, unknown>;
  const rca = normalizeConfidenceScore(confidence.rca);
  const recommendation = normalizeConfidenceScore(confidence.recommendation);
  return rca || recommendation ? { rca, recommendation } : undefined;
}

function normalizeConfidenceScore(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  if (typeof item.score !== "number" || !Number.isInteger(item.score) || item.score < 1 || item.score > 10) return undefined;
  return { score: item.score, reason: stringValue(item.reason) ?? "No confidence rationale was provided." };
}

export const toTimestamp = (value: string) =>
  new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`).getTime();
