import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Incident } from "../types/incident";
import { filterIncidents } from "../utils/incident";
import { FilterDropdown, SectionHeading } from "./ui";

type DateRange = number | "all";

const colors = ["#fb7185", "#fb923c", "#fbbf24", "#64748b"];
const serviceNames = [
  "transaction-validation-service",
  "account-query-service",
  "regulatory-reporting-service",
  "payment-initiation-api",
  "ledger-posting-service",
  "customer-onboarding-api",
];
const tooltipStyle = { background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12, color: "var(--chart-tooltip-text)" };
const parseDate = (value: string) => new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);

function useChartRange(incidents: Incident[]) {
  const [days, setDays] = useState<DateRange>(5);
  const visibleIncidents = useMemo(() => filterIncidents(incidents, "", days), [incidents, days]);
  return { days, setDays, visibleIncidents };
}

export function IncidentTrendChart({ incidents }: { incidents: Incident[] }) {
  const { days, setDays, visibleIncidents } = useChartRange(incidents);
  const numberOfDays = days === "all" ? 30 : days;
  const data = Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (numberOfDays - 1 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date), incidents: visibleIncidents.filter((item) => parseDate(item.createdAt).toISOString().slice(0, 10) === key).length };
  });
  const hasData = data.some((item) => item.incidents > 0);
  return <section className="panel p-5 sm:p-6"><SectionHeading eyebrow="Telemetry" title="Incident Trend" action={<FilterDropdown days={days} onChange={setDays}/>}/>{hasData ? <div className="mt-5 h-60"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 6, left: -25, bottom: 0 }}><defs><linearGradient id="line" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#22d3ee"/></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/><Tooltip contentStyle={tooltipStyle}/><Line type="monotone" dataKey="incidents" stroke="url(#line)" strokeWidth={3} dot={{ r: 4, fill: "#0b1322", stroke: "#818cf8", strokeWidth: 2 }} activeDot={{ r: 6 }}/></LineChart></ResponsiveContainer></div> : <NoChartData/>}</section>;
}

export function SeverityChart({ incidents }: { incidents: Incident[] }) {
  const { days, setDays, visibleIncidents } = useChartRange(incidents);
  const data = ["P1", "P2", "P3", "P4"].map((name) => ({ name, value: visibleIncidents.filter((item) => item.severity === name).length }));
  const total = visibleIncidents.length;
  return <section className="panel p-5 sm:p-6"><SectionHeading eyebrow="Current workload" title="Severity Distribution" action={<FilterDropdown days={days} onChange={setDays}/>}/>{total ? <div className="mt-2 flex h-60 items-center"><ResponsiveContainer width="58%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="78%" paddingAngle={5} stroke="none">{data.map((entry, index) => <Cell key={entry.name} fill={colors[index]}/>)}</Pie><Tooltip contentStyle={tooltipStyle}/></PieChart></ResponsiveContainer><div className="space-y-3">{data.map((entry, index) => <div key={entry.name} className="flex items-center gap-2 text-xs"><i className="h-2 w-2 rounded-full" style={{ background: colors[index] }}/><span className="w-5 text-slate-300">{entry.name}</span><span className="text-slate-500">{Math.round((entry.value / total) * 100)}%</span></div>)}</div></div> : <NoChartData/>}</section>;
}

export function IncidentsByServiceChart({ incidents }: { incidents: Incident[] }) {
  const { days, setDays, visibleIncidents } = useChartRange(incidents);
  const data = serviceNames.map((service) => ({ service, incidents: visibleIncidents.filter((item) => item.service === service).length }));
  return <section className="panel p-5 sm:p-6"><SectionHeading eyebrow="Service workload" title="Incidents by Service" action={<FilterDropdown days={days} onChange={setDays}/>}/><div className="mt-5 h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, left: -24, bottom: 80 }}><XAxis dataKey="service" interval={0} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, angle: -28, textAnchor: "end" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="incidents" name="Incidents" fill="#22d3ee" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></section>;
}

function NoChartData() { return <div className="grid h-60 place-items-center text-center text-sm text-slate-500">No incidents in this reporting window.</div>; }
