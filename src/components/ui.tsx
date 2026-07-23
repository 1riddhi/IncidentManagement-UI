import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  BrainCircuit,
  ChevronDown,
  Clock3,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIncidents } from "../hooks/useIncidents";
import type { Incident, IncidentStatus, Severity } from "../types/incident";
import { filterIncidents, formatDate, severityClasses, statusClasses } from "../utils/incident";

export function Header() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { incidents } = useIncidents();
  const query = searchParams.get("q") ?? "";
  const matches = query ? filterIncidents(incidents, query, "all").slice(0, 6) : [];
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = window.localStorage.getItem("theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function openIncident(id: string) {
    navigate(`/incident/${id}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/7 bg-[#09111ee6] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1540px] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex shrink-0 items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-300 text-slate-950 shadow-lg shadow-indigo-500/20">
            <Bot size={20} strokeWidth={2.2} />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-white sm:block">
            Prod Pulse Agent
            <br />
            {/* <span className="font-normal text-slate-400">Management</span> */}
          </span>
        </a>
        <form onSubmit={submitSearch} className="relative mx-auto hidden w-full max-w-xl md:block">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            size={17}
          />
          <input
            aria-label="Search incidents"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search incidents, services, RCA..."
            className="h-10 w-full rounded-xl border border-white/8 bg-white/5 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/8"
          />
          {query && <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-white/10 bg-[#121d2e] p-1 shadow-2xl shadow-slate-950/60">
            {matches.length > 0 ? <ul role="listbox" aria-label="Incident search results" className="max-h-80 overflow-y-auto">{matches.map((incident) => <li key={`${incident.source}-${incident.id}`}><button type="button" onClick={() => openIncident(incident.id)} className="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-white/7"><span className="font-mono text-xs font-semibold text-indigo-300">{incident.id}</span><span className="ml-2 text-sm text-slate-200">{incident.title || "Untitled incident"}</span><span className="mt-1 block truncate text-xs text-slate-500">{incident.service} · {incident.status} · {incident.severity}</span></button></li>)}</ul> : <p className="px-3 py-3 text-sm text-slate-400">No incidents match “{query}”.</p>}
          </div>}
        </form>
        <div className="ml-auto flex items-center gap-1 text-slate-400">
          <button aria-label="Notifications" className="icon-button">
            <Bell size={18} />
          </button>
          <button aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} className="icon-button">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            aria-label="User profile"
            className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white"
          >
            DB
          </button>
        </div>
      </div>
    </header>
  );
}
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`badge ${severityClasses[severity]}`}>{severity}</span>
  );
}
export function StatusBadge({ status }: { status: IncidentStatus }) {
  return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
}
export function MetricCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <section className="panel group p-5">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 bg-white/5 text-indigo-200">
          {icon}
        </span>
        <span className="flex items-center gap-1 text-xs text-emerald-300">
          <ArrowUpRight size={14} />
          {trend}
        </span>
      </div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </section>
  );
}
export function FilterDropdown({
  days,
  onChange,
}: {
  days: number | "all";
  onChange: (days: number | "all") => void;
}) {
  return (
    <label className="relative">
      <select
        aria-label="Incident date range"
        value={days}
        onChange={(e) => onChange(e.target.value === "all" ? "all" : Number(e.target.value))}
        className="appearance-none rounded-xl border border-white/10 bg-[#121d2e] py-2 pl-3 pr-8 text-xs text-slate-300 outline-none focus:border-indigo-400/50"
      >
        <option value={5}>Last 5 Days</option>
        <option value={7}>Last 7 Days</option>
        <option value={15}>Last 15 Days</option>
        <option value={30}>Last 30 Days</option>
        <option value="all">All time</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
        size={14}
      />
    </label>
  );
}
export function IncidentCard({
  incident,
  onAnalyze,
}: {
  incident: Incident;
  onAnalyze: (id: string) => void;
}) {
  return (
    <article className="panel group flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:shadow-[0_18px_45px_rgba(0,0,0,.28)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-indigo-300">
          {incident.id}
        </span>
        <SeverityBadge severity={incident.severity} />
        <StatusBadge status={incident.status} />
      </div>
      <h3 className="mt-4 min-h-12 text-[15px] font-medium leading-6 text-slate-100">
        {incident.title}
      </h3>
      <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4 text-xs text-slate-400">
        <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-300">
          {incident.service}
        </span>
        <span className="flex items-center gap-1">
          <Clock3 size={13} />
          {formatDate(incident.createdAt)}
        </span>
      </div>
      <button
        onClick={() => onAnalyze(incident.id)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/10 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-400/18"
      >
        <BrainCircuit size={16} />
        View investigation
      </button>
    </article>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-indigo-300">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
export function EmptyState() {
  return (
    <div className="panel col-span-full py-16 text-center">
      <AlertTriangle className="mx-auto text-slate-500" />
      <p className="mt-3 text-sm text-slate-400">
        No incidents match this operational view.
      </p>
    </div>
  );
}
