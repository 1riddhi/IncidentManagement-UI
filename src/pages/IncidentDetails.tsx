import { ArrowLeft, BrainCircuit, CheckCircle2, ChevronDown, ChevronUp, CircleDot, FileText, SearchX } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header, SectionHeading, SeverityBadge, StatusBadge } from "../components/ui";
import { IncidentChat } from "../components/IncidentChat";
import { useIncidents } from "../hooks/useIncidents";
import type {
  Incident,
  AnalysisConfidence,
  IncidentAnalysisState,
  TimelineEvent,
} from "../types/incident";
import { confidenceLevel, formatDate } from "../utils/incident";

export function IncidentDetails() {
  const { id } = useParams();
  const { incidents, loading, errors, refetch, analysis, runAnalysis } = useIncidents();
  const incident = incidents.find((item) => item.id === id);
  const analysisState: IncidentAnalysisState =
    incident?.id && analysis[incident.id]
      ? analysis[incident.id]
      : { status: "idle" };
  const isResolved = incident?.status === "Resolved";
  if (loading) return <><Header/><main className="grid min-h-[70vh] place-items-center"><p className="text-sm text-slate-400">Loading incident investigation…</p></main></>;
  if (!incident) return <><Header/><main className="grid min-h-[70vh] place-items-center px-5"><section className="panel max-w-md p-8 text-center"><SearchX className="mx-auto text-indigo-300" size={32}/><h1 className="mt-4 text-xl font-semibold text-white">Incident not found</h1><p className="mt-2 text-sm text-slate-400">{Object.keys(errors).length ? "ServiceNow data may be partially unavailable." : "This incident may have been archived or the incident ID is invalid."}</p>{Object.keys(errors).length > 0 && <button onClick={refetch} className="mt-5 rounded-xl bg-indigo-400 px-4 py-2 text-sm font-medium text-slate-950">Retry data load</button>}<Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-200"><ArrowLeft size={16}/>Back to operations</Link></section></main></>;
  const timeline = createTimeline(incident);
  return <><Header/><main className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8"><Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-indigo-200"><ArrowLeft size={16}/>Back to incident intelligence</Link><section className="panel overflow-hidden"><div className="border-b border-white/7 bg-gradient-to-r from-indigo-400/10 via-transparent to-cyan-400/5 p-5 sm:p-7"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-semibold text-indigo-300">{incident.id}</span><SeverityBadge severity={incident.severity}/><StatusBadge status={incident.status}/></div><h1 className="mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">{incident.title}</h1></div><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4"><Info label="Service" value={incident.service}/><Info label="Created" value={formatDate(incident.createdAt)}/><Info label="Last updated" value={formatDate(incident.updatedAt)}/><Info label="Operational status" value={incident.status}/><div className="sm:col-span-2 lg:col-span-4"><p className="text-xs font-medium uppercase tracking-[.12em] text-slate-500">Observed symptoms</p><p className="mt-2 text-sm leading-6 text-slate-300">{incident.symptoms}</p></div></div></section><section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><div className="space-y-6"><AnalysisSection incident={incident} analysisState={analysisState} runAnalysis={runAnalysis} isResolved={isResolved}/>{isResolved && <RcaSection incident={incident}/>}{isResolved && <><section className="panel p-5 sm:p-6"><SectionHeading eyebrow="Recommended action" title="Recorded Resolution"/><div className="mt-5 flex gap-3 rounded-xl border border-emerald-400/12 bg-emerald-400/5 p-4 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18}/>{incident.resolution ?? "No resolution recorded yet."}</div></section></>}{incident.attachments.length > 0 && <section className="panel p-5 sm:p-6"><SectionHeading eyebrow="ServiceNow evidence" title="Attachments"/><div className="mt-4 space-y-2">{incident.attachments.map((attachment) => <div key={attachment.id} className="flex items-center gap-3 rounded-xl border border-white/7 bg-white/3 p-3 text-sm text-slate-300"><FileText size={16} className="text-indigo-200"/><span>{attachment.fileName}</span><span className="ml-auto text-xs text-slate-500">{attachment.contentType} · {attachment.sizeBytes} bytes</span></div>)}</div></section>}</div><aside><section className="panel p-5 sm:p-6"><SectionHeading eyebrow="ServiceNow events" title="Incident Timeline"/><ol className="mt-5 space-y-0">{timeline.map((event, index) => <li key={event.title} className="relative flex gap-3 pb-6 last:pb-0"><span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-indigo-400/25 bg-indigo-400/10 text-indigo-200"><CircleDot size={14}/></span>{index < timeline.length - 1 && <i className="absolute left-[13px] top-7 h-[calc(100%-20px)] border-l border-dashed border-white/14"/>}<div className="-mt-0.5"><div className="flex flex-wrap items-center gap-x-2"><h3 className="text-sm font-medium text-slate-200">{event.title}</h3><span className="text-[11px] text-slate-500">{event.time}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{event.description}</p></div></li>)}</ol></section><IncidentChat/></aside></section></main></>;
}
function RcaSection({ incident }: { incident: Incident }) { const available = Boolean(incident.rootCause); return <section className="panel overflow-hidden"><div className="flex items-center gap-3 border-b border-white/7 bg-indigo-400/6 p-5 sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200"><BrainCircuit size={20}/></span><div><p className="eyebrow">RCA result</p><h2 className="mt-1 text-lg font-semibold text-white">Probable Root Cause</h2></div></div><div className="p-5 sm:p-6"><p className="text-base leading-7 text-slate-200">{incident.rootCause ?? "AI analysis has not been requested for this active incident. Root cause will appear here after analysis is run."}</p>{available && <p className="mt-4 text-xs text-slate-500">Recorded from the resolved ServiceNow incident.</p>}</div></section>; }

function AnalysisSection({
  incident,
  analysisState,
  runAnalysis,
  isResolved,
}: {
  incident: Incident;
  analysisState: IncidentAnalysisState;
  runAnalysis: (incident: Incident) => Promise<void>;
  isResolved: boolean;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/7 bg-cyan-400/5 p-5 sm:p-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200"><BrainCircuit size={20}/></span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Incident investigation</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Investigate this incident</h2>
        </div>
        <button
          onClick={() => runAnalysis(incident)}
          disabled={analysisState.status === "loading" || isResolved}
          className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResolved
            ? "Analysis disabled for resolved incidents"
            : analysisState.status === "loading"
            ? "Investigating"
            : "Start investigation"}
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {analysisState.status === "idle" && !isResolved && (
          <p className="text-sm leading-6 text-slate-300">
            Start an investigation to understand what happened, what to do next, and whether a similar incident has happened before.
          </p>
        )}
        {isResolved && (
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Analysis unavailable</p>
            <p className="mt-2">This incident is resolved, so AI analysis is disabled.</p>
          </div>
        )}

        {analysisState.status === "loading" && (
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">We’re looking into it</p>
            <p className="mt-2">The investigation is gathering the available evidence. This may take a few moments.</p>
          </div>
        )}

        {analysisState.status === "error" && (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-100">
            <p className="font-semibold text-white">Analysis failed</p>
            <p className="mt-2 text-slate-300">{analysisState.error ?? "Unable to complete analysis."}</p>
            <button
              onClick={() => runAnalysis(incident)}
              className="mt-4 inline-flex rounded-xl bg-rose-400/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400/25"
            >
              Retry analysis
            </button>
          </div>
        )}

        {analysisState.status === "success" && analysisState.response && (
          <div className="space-y-6">

            {analysisState.response.confidence && <ConfidencePanel confidence={analysisState.response.confidence} />}

            {(analysisState.response.rca.length > 0 || analysisState.response.nextActionSteps.length > 0) && (
              <ExpandableAnalysisSection eyebrow="What we found" title="Likely cause">
                {analysisState.response.rca.length > 0 && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">{analysisState.response.rca.map((item) => <li key={item}>{item}</li>)}</ul>}
                {/* {analysisState.response.nextActionSteps.length > 0 && <div className="mt-5"><p className="text-[11px] font-medium uppercase tracking-[.18em] text-slate-500">Recommended next actions</p><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">{analysisState.response.nextActionSteps.map((step) => <li key={step}>{step}</li>)}</ol></div>} */}
              </ExpandableAnalysisSection>
            )}

            <ExpandableAnalysisSection eyebrow="Recommended next steps" title="What to do next">
              <div className="mt-4 space-y-5 text-sm leading-7 text-slate-300">
                {renderRecommendationSections(analysisState.response.recommendation)}
              </div>
            </ExpandableAnalysisSection>

            {(analysisState.response.evidenceSummary || analysisState.response.codeChanges || analysisState.response.agentFlow.length > 0) && (
              <ExpandableAnalysisSection eyebrow="Supporting details" title="Evidence reviewed">
                {analysisState.response.evidenceSummary && <p className="mt-4 text-sm leading-6 text-slate-300">{analysisState.response.evidenceSummary}</p>}
                {/* {analysisState.response.agentFlow.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{analysisState.response.agentFlow.map((step) => <span key={`${step.agentName}-${step.status}`} className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">{step.agentName}: {step.status}</span>)}</div>} */}
                {/* {analysisState.response.codeChanges && <details className="mt-5 rounded-2xl border border-white/10 bg-slate-900/80 p-4"><summary className="cursor-pointer text-sm font-medium text-cyan-100">Suggested code changes</summary><pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-slate-300">{analysisState.response.codeChanges}</pre></details>} */}
              </ExpandableAnalysisSection>
            )}

            <ExpandableAnalysisSection eyebrow="Related incidents" title="Similar past incidents">
              <div className="mt-5 space-y-4">
                {analysisState.response.similarIncidents.map((match) => (
                  <Link
                    key={match.id}
                    to={`/incident/${match.id}`}
                    className="block rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-[.18em] text-indigo-300">{match.id}</span>
                      <span className="rounded-full border border-cyan-300/30 bg-gradient-to-r from-indigo-400/25 to-cyan-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,.12)]">
                        {formatSimilarity(match.similarity)} match
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-white">{match.title || "Untitled incident"}</h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[.22em] text-slate-400">
                      <span className="rounded-full bg-white/5 px-2 py-1">{match.service}</span>
                      <span className="rounded-full bg-white/5 px-2 py-1">{match.severity}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </ExpandableAnalysisSection>
          </div>
        )}
      </div>
    </section>
  );
}

function ConfidencePanel({ confidence }: { confidence: AnalysisConfidence }) {
  const entries = [
    { label: "RCA confidence", value: confidence.rca },
    { label: "Recommendation confidence", value: confidence.recommendation },
  ].filter((entry): entry is { label: string; value: NonNullable<AnalysisConfidence["rca"]> } => Boolean(entry.value));

  if (!entries.length) return null;

  return <ExpandableAnalysisSection eyebrow="Confidence" title="How confident is this?">
    <div className="mt-5 space-y-5">{entries.map(({ label, value }) => {
      const level = confidenceLevel(value.score);
      return <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-white">{label}</p><span className={`rounded-full bg-white/6 px-2.5 py-1 text-xs font-semibold ${level.tone}`}>{level.label} · {value.score}/10</span></div>
        <div className="mt-3 grid grid-cols-10 gap-1" aria-label={`${label}: ${value.score} out of 10`}>{Array.from({ length: 10 }, (_, index) => <span key={index} className={`h-2 rounded-full ${index < value.score ? level.fill : "bg-white/10"}`} />)}</div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{value.reason}</p>
      </div>;
    })}</div>
  </ExpandableAnalysisSection>;
}

function ExpandableAnalysisSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
    <SectionHeading eyebrow={eyebrow} title={title} />
    <div className={`overflow-hidden ${isExpanded ? "mt-4" : "mt-4 max-h-40"}`}>{children}</div>
    <div className="relative mt-4 flex h-7 items-center justify-center"><i className="absolute inset-x-0 border-t border-white/10"/><button type="button" aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`} onClick={() => setIsExpanded((value) => !value)} className="relative z-10 grid h-7 w-10 place-items-center rounded-full border border-white/10 bg-slate-950 text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-100">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button></div>
  </section>;
}

function formatSimilarity(similarity: number) {
  return `${Math.round(similarity > 1 ? similarity : similarity * 100)}%`;
}
function renderRecommendationSections(recommendation: string) {
  const blocks = recommendation.split(/\n{2,}/g).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] ?? "";
    const restLines = lines.slice(1);
    const headingMatch = firstLine.match(/^#{1,6}\s*(.+)$/);
    const isHeadingLike = /^(summary|assessment|hypothesis|immediate|safe remediation|recommend|evidence)/i.test(firstLine);

    if (headingMatch || isHeadingLike) {
      return (
        <div key={index} className="space-y-3">
          <h3 className="text-sm font-semibold text-white">
            {headingMatch ? headingMatch[1] : firstLine}
          </h3>
          <div className="space-y-2 text-slate-300">
            {restLines.map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        </div>
      );
    }

    if (block.startsWith("- ")) {
      return (
        <ul key={index} className="list-disc space-y-2 pl-5 text-slate-300">
          {block.split(/\n/).map((item, itemIndex) => (
            <li key={itemIndex}>{item.replace(/^-\s*/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="text-slate-300">
        {block}
      </p>
    );
  });
}
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-medium uppercase tracking-[.12em] text-slate-500">{label}</p><p className="mt-2 text-sm font-medium text-slate-200">{value}</p></div>; }
function createTimeline(incident: Incident): TimelineEvent[] { const events = [{ title: "Incident created", description: "Incident opened in ServiceNow.", time: formatDate(incident.createdAt) }, { title: "Last updated", description: "Latest ServiceNow record update.", time: formatDate(incident.updatedAt) }]; if (incident.resolvedAt) events.push({ title: "Incident resolved", description: "Resolution recorded in ServiceNow.", time: formatDate(incident.resolvedAt) }); return events; }
