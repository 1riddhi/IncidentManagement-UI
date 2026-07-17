import { Activity, Boxes, CircleAlert, Server } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IncidentTrendChart, SeverityChart } from "../components/Charts";
import {
  EmptyState,
  FilterDropdown,
  Header,
  IncidentCard,
  MetricCard,
  SectionHeading,
} from "../components/ui";
import { incidents } from "../data/incidents";
import { filterIncidents } from "../utils/incident";
export function Dashboard() {
  const [query, setQuery] = useState("");
  const [days, setDays] = useState(5);
  const navigate = useNavigate();
  const visible = useMemo(
    () => filterIncidents(incidents, query, days),
    [query, days],
  );
  return (
    <>
      <Header query={query} onQueryChange={setQuery} />
      <main className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Operations command center</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Production incident intelligence
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Real-time incident posture and AI-powered root cause analysis for
              critical services.
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-slate-400">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            All systems reporting
          </div>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Activity size={20} />}
            label="Total Incidents"
            value="42"
            trend="+12.4%"
          />
          <MetricCard
            icon={<CircleAlert size={20} />}
            label="Open Incidents"
            value="18"
            trend="+5.1%"
          />
          <MetricCard
            icon={<Activity size={20} />}
            label="Critical (P1)"
            value="5"
            trend="+2 today"
          />
          <MetricCard
            icon={<Server size={20} />}
            label="Affected Services"
            value="12"
            trend="+3.8%"
          />
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.85fr]">
          <IncidentTrendChart />
          <SeverityChart />
        </section>
        <section className="mt-8">
          <SectionHeading
            eyebrow="Investigation queue"
            title="Recent Incidents"
            action={<FilterDropdown days={days} onChange={setDays} />}
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.length ? (
              visible.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onAnalyze={(id) => navigate(`/incident/${id}`)}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
