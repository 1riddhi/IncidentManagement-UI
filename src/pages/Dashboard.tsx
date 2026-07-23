import { Activity, CircleAlert, RefreshCw, Server } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IncidentTrendChart, IncidentsByServiceChart, SeverityChart } from "../components/Charts";
import { EmptyState, FilterDropdown, Header, IncidentCard, MetricCard, SectionHeading } from "../components/ui";
import { useIncidents } from "../hooks/useIncidents";
import { filterIncidents } from "../utils/incident";

export function Dashboard() {
  const [days, setDays] = useState<number | "all">(5);
  const navigate = useNavigate();
  const { incidents, loading, errors, refetch } = useIncidents();
  const visible = useMemo(() => filterIncidents(incidents, "", days), [incidents, days]);
  const failedSources = Object.keys(errors);
  const openCount = incidents.filter((incident) => incident.status === "Open").length;
  const criticalCount = incidents.filter((incident) => incident.severity === "P1").length;
  const services = new Set(incidents.map((incident) => incident.service)).size;

  return <><Header /><main className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Production Intelligence Platform</h1><p className="mt-2 max-w-xl text-sm text-slate-400">One stop solution for all your Incidents</p></div><div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-400"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />Live sources connected</div></div>
    {failedSources.length > 0 && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/15 bg-amber-300/6 px-4 py-3 text-sm text-amber-100"><span>Unable to load {failedSources.join(" and ")} incidents. Showing available ServiceNow data.</span><button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-amber-300/20 px-3 py-1.5 text-xs font-medium transition hover:bg-amber-300/10"><RefreshCw size={14} />Retry</button></div>}
    {loading ? <LoadingDashboard /> : incidents.length === 0 ? <section className="panel py-20 text-center"><CircleAlert className="mx-auto text-rose-300" /><h2 className="mt-4 text-lg font-semibold text-white">Incident data is unavailable</h2><p className="mt-2 text-sm text-slate-400">ServiceNow could not be reached. Please try again.</p><button onClick={refetch} className="mt-5 rounded-xl bg-indigo-400 px-4 py-2 text-sm font-medium text-slate-950">Retry data load</button></section> : <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={<Activity size={20} />} label="Total Incidents" value={String(incidents.length)} trend="Live data" /><MetricCard icon={<CircleAlert size={20} />} label="Open Incidents" value={String(openCount)} trend="Active source" /><MetricCard icon={<Activity size={20} />} label="Critical (P1)" value={String(criticalCount)} trend="All sources" /><MetricCard icon={<Server size={20} />} label="Affected Services" value={String(services)} trend="All sources" /></section><section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.85fr]"><IncidentTrendChart incidents={incidents} /><SeverityChart incidents={incidents} /></section><section className="mt-6"><IncidentsByServiceChart incidents={incidents} /></section><section className="mt-8"><SectionHeading eyebrow="Investigation queue" title="Recent Incidents" action={<FilterDropdown days={days} onChange={setDays} />} /><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.length ? visible.map((incident) => <IncidentCard key={`${incident.source}-${incident.id}`} incident={incident} onAnalyze={(id) => navigate(`/incident/${id}`)} />) : <EmptyState />}</div></section></>}</main></>;
}
function LoadingDashboard() { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="panel h-40 animate-pulse bg-white/4" />)}</div>; }
