export type Severity = "P1" | "P2" | "P3" | "P4";
export type IncidentStatus = "Open" | "Resolved";
export type IncidentSource = "active" | "historical";

export interface IncidentAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  fileContent: string;
}

export interface ServiceNowIncident {
  id: string;
  title: string;
  service: string;
  severity: string;
  symptoms: string;
  createdAt: string;
  resolvedAt: string | null;
  updatedAt: string;
  rootCause: string | null;
  resolution: string | null;
  logs: string | null;
  attachments: IncidentAttachment[];
}

export interface TimelineEvent {
  title: string;
  description: string;
  time: string;
}

export interface Incident extends ServiceNowIncident {
  severity: Severity;
  status: IncidentStatus;
  source: IncidentSource;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AgentFinding {
  agentName: string;
  status: string;
  summary: string;
  evidence: string;
}

export interface SimilarIncident extends ServiceNowIncident {
  similarity: number;
}

export interface AgentFlowStep {
  agentName: string;
  status: string;
}

export interface ConfidenceScore {
  score: number;
  reason: string;
}

export interface AnalysisConfidence {
  rca?: ConfidenceScore;
  recommendation?: ConfidenceScore;
}

export interface ConfluenceSource {
  pageId: string;
  title: string;
  url: string;
  issueSummary: string;
  spaceKey?: string;
  lastModified?: string;
  excerpt?: string;
}

export interface AnalysisResponse {
  analysisId?: string;
  incomingIncident: Partial<ServiceNowIncident>;
  similarIncidents: SimilarIncident[];
  agentFindings: AgentFinding[];
  recommendation: string;
  summary?: string;
  nextActionSteps: string[];
  rca: string[];
  codeChanges?: string;
  evidenceSummary?: string;
  agentFlow: AgentFlowStep[];
  confidence?: AnalysisConfidence;
  confluenceSources: ConfluenceSource[];
}

export interface IncidentAnalysisState {
  status: AnalysisStatus;
  response?: AnalysisResponse;
  error?: string;
}

export interface ChatResponse {
  answer: string;
  agentSummary?: string;
  evidenceSummary?: string;
  codeChanges?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
}
