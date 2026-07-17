export type Severity = "P1" | "P2" | "P3" | "P4";
export type IncidentStatus =
  | "Open"
  | "Investigating"
  | "Monitoring"
  | "Resolved";
export interface TimelineEvent {
  title: string;
  description: string;
  time: string;
}
export interface RelatedIncident {
  id: string;
  title: string;
  similarity: number;
  status: IncidentStatus;
}
export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  symptoms: string;
  rootCause: string;
  resolution: string;
  createdDate: string;
  confidence: number;
  reasoning: string[];
  timeline: TimelineEvent[];
  related: RelatedIncident[];
}
