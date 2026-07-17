import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { severityData, trendData } from "../data/incidents";
import { SectionHeading } from "./ui";
const colors = ["#fb7185", "#fb923c", "#fbbf24", "#64748b"];
const tooltipStyle = {
  background: "#111c2d",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 12,
  color: "#e2e8f0",
};
export function IncidentTrendChart() {
  return (
    <section className="panel p-5 sm:p-6">
      <SectionHeading eyebrow="Telemetry" title="Incident Trend" />
      <div className="mt-5 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 8, right: 6, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="line" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="incidents"
              stroke="url(#line)"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0b1322", stroke: "#818cf8", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
export function SeverityChart() {
  return (
    <section className="panel p-5 sm:p-6">
      <SectionHeading
        eyebrow="Current workload"
        title="Severity Distribution"
      />
      <div className="mt-2 flex h-60 items-center">
        <ResponsiveContainer width="58%" height="100%">
          <PieChart>
            <Pie
              data={severityData}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="78%"
              paddingAngle={5}
              stroke="none"
            >
              {severityData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3">
          {severityData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <i
                className="h-2 w-2 rounded-full"
                style={{ background: colors[index] }}
              />
              <span className="w-5 text-slate-300">{entry.name}</span>
              <span className="text-slate-500">
                {Math.round((entry.value / 42) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
