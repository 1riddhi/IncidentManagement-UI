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
  const response = await fetch(`${API_BASE_URL}/incidents/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incident, limit }),
  });

  if (!response.ok) {
    throw new Error(`Incident analysis could not be completed (HTTP ${response.status})`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    throw new Error("Incident analysis returned invalid response");
  }

  const candidate = payload as AnalysisResponse | {
    incomingIncident: ServiceNowIncident;
    similarIncidents: Array<{ incident: ServiceNowIncident; similarity: number }>;
    agentFindings: unknown[];
    recommendation: string;
  };

  if (
    typeof candidate.recommendation !== "string" ||
    !Array.isArray(candidate.agentFindings) ||
    !Array.isArray(candidate.similarIncidents) ||
    typeof candidate.incomingIncident !== "object" ||
    candidate.incomingIncident === null
  ) {
    throw new Error("Incident analysis returned invalid response");
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
    incomingIncident: candidate.incomingIncident,
    agentFindings: candidate.agentFindings as AgentFinding[],
    recommendation: candidate.recommendation,
    similarIncidents: normalizedSimilarIncidents,
  };
}

export const toTimestamp = (value: string) =>
  new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`).getTime();
