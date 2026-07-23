import type { Incident, IncidentStatus, Severity } from "../types/incident";

export const severityClasses: Record<Severity, string> = {
  P1: "border-rose-400/25 bg-rose-400/12 text-rose-200",
  P2: "border-orange-300/25 bg-orange-300/12 text-orange-200",
  P3: "border-amber-300/25 bg-amber-300/12 text-amber-100",
  P4: "border-slate-400/25 bg-slate-400/10 text-slate-300",
};
export const statusClasses: Record<IncidentStatus, string> = {
  Open: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  Resolved: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
};
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date.includes("T") ? date : `${date.replace(" ", "T")}Z`));

export function confidenceLevel(score: number) {
  if (score <= 3) return { label: "Low", tone: "text-rose-200", fill: "bg-rose-400" };
  if (score <= 6) return { label: "Moderate", tone: "text-amber-100", fill: "bg-amber-300" };
  if (score <= 8) return { label: "High", tone: "text-cyan-200", fill: "bg-cyan-400" };
  return { label: "Very high", tone: "text-emerald-300", fill: "bg-emerald-400" };
}
export const filterIncidents = (
  incidents: Incident[],
  query: string,
  days: number | "all",
) => {
  const cutoff = days === "all" ? Number.NEGATIVE_INFINITY : Date.now() - days * 86400000;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return incidents.filter(
    (incident) =>
      (terms.length > 0 || new Date(incident.createdAt.includes("T") ? incident.createdAt : `${incident.createdAt.replace(" ", "T")}Z`).getTime() >= cutoff) &&
      (!terms.length ||
        terms.every((term) => [incident.id, incident.title, incident.service, incident.severity, incident.status, incident.rootCause, incident.resolution, incident.symptoms, incident.logs]
          .join(" ")
          .toLowerCase()
          .includes(term))),
  );
};
