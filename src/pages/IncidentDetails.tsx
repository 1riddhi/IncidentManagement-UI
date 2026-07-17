import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Lightbulb,
  SearchX,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  Header,
  SectionHeading,
  SeverityBadge,
  StatusBadge,
} from "../components/ui";
import { incidents } from "../data/incidents";
import { formatDate } from "../utils/incident";
export function IncidentDetails() {
  const { id } = useParams();
  const incident = incidents.find((item) => item.id === id);
  if (!incident)
    return (
      <>
        <Header />
        <main className="grid min-h-[70vh] place-items-center px-5">
          <section className="panel max-w-md p-8 text-center">
            <SearchX className="mx-auto text-indigo-300" size={32} />
            <h1 className="mt-4 text-xl font-semibold text-white">
              Incident not found
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              This investigation may have been archived or the incident ID is
              invalid.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-400 px-4 py-2.5 text-sm font-medium text-slate-950"
            >
              <ArrowLeft size={16} />
              Back to operations
            </Link>
          </section>
        </main>
      </>
    );
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-indigo-200"
        >
          <ArrowLeft size={16} />
          Back to incident intelligence
        </Link>
        <section className="panel overflow-hidden">
          <div className="border-b border-white/7 bg-gradient-to-r from-indigo-400/10 via-transparent to-cyan-400/5 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-indigo-300">
                {incident.id}
              </span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {incident.title}
            </h1>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
            <Info label="Service" value={incident.service} />
            <Info label="Created" value={formatDate(incident.createdDate)} />
            <Info label="Operational status" value={incident.status} />
            <Info label="AI confidence" value={`${incident.confidence}%`} />
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-500">
                Observed symptoms
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {incident.symptoms}
              </p>
            </div>
          </div>
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <div className="space-y-6">
            <section className="panel overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/7 bg-indigo-400/6 p-5 sm:p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200">
                  <BrainCircuit size={20} />
                </span>
                <div>
                  <p className="eyebrow">AI RCA result</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Probable Root Cause
                  </h2>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-base leading-7 text-slate-200">
                  {incident.rootCause}
                </p>
                <div className="mt-6">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">
                      AI confidence
                    </span>
                    <span className="font-semibold text-indigo-200">
                      {incident.confidence}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/7">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300"
                      style={{ width: `${incident.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
            <section className="panel p-5 sm:p-6">
              <SectionHeading
                eyebrow="Signal correlation"
                title="AI Reasoning"
              />
              <ul className="mt-5 space-y-4">
                {incident.reasoning.map((reason) => (
                  <li
                    key={reason}
                    className="flex gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-400/12 text-indigo-200">
                      <Sparkles size={12} />
                    </span>
                    {reason}
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel p-5 sm:p-6">
              <SectionHeading
                eyebrow="Recommended action"
                title="Suggested Resolution"
              />
              <div className="mt-5 flex gap-3 rounded-xl border border-emerald-400/12 bg-emerald-400/5 p-4 text-sm leading-6 text-slate-300">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-emerald-300"
                  size={18}
                />
                {incident.resolution}
              </div>
            </section>
          </div>
          <aside className="space-y-6">
            <section className="panel p-5 sm:p-6">
              <SectionHeading
                eyebrow="Pattern matching"
                title="Related Incidents"
              />
              <div className="mt-5 space-y-3">
                {incident.related.map((related) => (
                  <div
                    key={related.id}
                    className="rounded-xl border border-white/7 bg-white/3 p-4 transition hover:border-indigo-400/25"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-indigo-300">
                        {related.id}
                      </span>
                      <span className="text-xs font-medium text-cyan-200">
                        {related.similarity}% similar
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {related.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {related.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel p-5 sm:p-6">
              <SectionHeading
                eyebrow="Event sequence"
                title="Incident Timeline"
              />
              <ol className="mt-5 space-y-0">
                {incident.timeline.map((event, index) => (
                  <li
                    key={event.title}
                    className="relative flex gap-3 pb-6 last:pb-0"
                  >
                    <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-indigo-400/25 bg-indigo-400/10 text-indigo-200">
                      <CircleDot size={14} />
                    </span>
                    {index < incident.timeline.length - 1 && (
                      <i className="absolute left-[13px] top-7 h-[calc(100%-20px)] border-l border-dashed border-white/14" />
                    )}
                    <div className="-mt-0.5">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <h3 className="text-sm font-medium text-slate-200">
                          {event.title}
                        </h3>
                        <span className="text-[11px] text-slate-500">
                          {event.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {event.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}
