import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMetrics,
  fetchPipeline,
  type InsightsMetrics,
  type InsightsPipeline,
} from "../api/insightsApi";

function MetricCard({
  label,
  value,
  unit,
  change,
  direction,
}: {
  label: string;
  value: number;
  unit: string;
  change: number;
  direction: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-teal-600">{label}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        <span className={direction === "up" ? "text-green-600" : "text-red-600"}>
          {direction === "up" ? "\u2191" : "\u2193"} {change}% this week
        </span>
      </p>
      <p className="text-3xl font-bold">
        {value.toLocaleString()}
        {unit && <span className="text-lg">{unit}</span>}
      </p>
    </div>
  );
}

function BreakdownTable({
  title,
  data,
}: {
  title: string;
  data: Record<string, number> | Array<{ keyword: string; ctr: number }>;
  valueLabel: string;
}) {
  const entries = Array.isArray(data)
    ? data.map((d) => [d.keyword, `${d.ctr}% CTR`] as [string, string])
    : Object.entries(data).map(([k, v]) => [k, `${v}%`] as [string, string]);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium text-teal-600 mb-3">{title}</h3>
      <div className="space-y-2">
        {entries.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-700">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Insights() {
  const [metrics, setMetrics] = useState<InsightsMetrics | null>(null);
  const [pipeline, setPipeline] = useState<InsightsPipeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMetrics().then(setMetrics),
      fetchPipeline().then(setPipeline),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/dashboard" className="text-sm text-teal-600 hover:text-teal-800 mb-3 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-2xl font-bold mb-1">Insights</h1>
      <p className="text-gray-500 text-sm mb-6">
        Pipeline transparency and engagement analytics for your business.
      </p>

      {/* Pipeline Info Cards */}
      {pipeline && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-teal-600 mb-2">
              {pipeline.dataRefreshCycle.label}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              {pipeline.dataRefreshCycle.type}
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-3">
              {pipeline.dataRefreshCycle.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-gray-400">&bull;</span> {b}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400">
              Last Scan: {pipeline.dataRefreshCycle.lastScan} | Next Scan:{" "}
              {pipeline.dataRefreshCycle.nextScan}
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-teal-600 mb-2">
              {pipeline.visibilityPipeline.label}
            </h3>
            <p className="text-sm text-gray-700 mb-2">Signals Analyzed:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {pipeline.visibilityPipeline.signalsAnalyzed.map((s, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-gray-400">&bull;</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pipeline Steps */}
      {pipeline && (
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-medium text-teal-600 mb-4">
            Insight Generation Pipeline
          </h2>
          <div className="flex items-start gap-2 overflow-x-auto">
            {pipeline.pipelineSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 min-w-0">
                <div className="flex-shrink-0 w-40">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 mb-2">
                    {i + 1}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
                {i < pipeline.pipelineSteps.length - 1 && (
                  <div className="flex-shrink-0 mt-3 text-gray-300 text-xl">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Metrics */}
      <h2 className="text-lg font-semibold mb-3">User Metrics</h2>

      {metrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard {...metrics.ctr} />
            <MetricCard {...metrics.productionClicks} />
            <MetricCard {...metrics.engagementRate} />
            <MetricCard {...metrics.productionImpressions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BreakdownTable
              title="Audience Breakdown"
              data={metrics.audienceBreakdown}
              valueLabel="%"
            />
            <BreakdownTable
              title="Platform Engagement"
              data={metrics.platformEngagement}
              valueLabel="%"
            />
            <BreakdownTable
              title="Keyword Engagement"
              data={metrics.keywordEngagement}
              valueLabel="CTR"
            />
          </div>
        </>
      )}
    </div>
  );
}
