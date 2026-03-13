// Feature 3 — AI Credit Score page.
// Shows gauge dial, score breakdown, and credit score graph over time.
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchCreditScore, fetchCreditGraph, type CreditScoreReport } from "../api/creditApi";
import CreditGauge from "../components/CreditGauge";

function formatDate(eventTime: string): string {
  const d = new Date(eventTime);
  if (isNaN(d.getTime())) return eventTime;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default function CreditScore() {
  const [score, setScore] = useState<CreditScoreReport | null>(null);
  const [graphEvents, setGraphEvents] = useState<Array<{ amount: number; event_time: string }>>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCreditScore().then((res) => setScore(res.creditScoreReport ?? null)),
      fetchCreditGraph("1").then((res) => {
        setGraphEvents(res.result_list);
        setTotalScore(res.result);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    let running = 0;
    return graphEvents.map((event) => {
      running += event.amount;
      return { time: event.event_time, credit_score: running };
    });
  }, [graphEvents]);

  const creditScore = score?.overallCreditScore ?? 0;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(creditScore), 150);
    return () => clearTimeout(timer);
  }, [creditScore]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="border rounded-lg p-5 mb-6 flex justify-center">
          <div className="w-[260px] h-[140px] bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="border rounded-lg p-5 mb-6">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/dashboard" className="text-sm text-teal-600 hover:text-teal-800 mb-3 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-2xl font-bold mb-1">AI Credit Score</h1>
      <p className="text-gray-500 text-sm mb-6">
        Weekly score based on engagement, AI visibility, and content quality.
      </p>

      {/* Score Gauge */}
      <div className="border rounded-lg p-5 mb-6 flex justify-center">
        <CreditGauge score={animatedScore} size={260} label="AI Credit Score" />
      </div>

      {/* Explanation */}
      {score?.overallExplanation && (
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="font-semibold mb-2">Analysis</h2>
          <p className="text-sm text-gray-700">{score.overallExplanation}</p>
        </div>
      )}

      {/* Score Breakdown */}
      {score?.scoreBreakdown && (
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="font-semibold mb-3">Score Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(score.scoreBreakdown).map(([key, val]) => (
              <div key={key} className="text-sm">
                <div className="text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, " $1").replace("Score", "")}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${val ?? 0}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Score Graph */}
      {chartData.length > 0 && (
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="font-semibold mb-3">Score History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} tickFormatter={formatDate} />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={[0, (max: number) => Math.ceil(Math.max(max * 1.2, max + 10))]}
              />
              <Tooltip labelFormatter={(v) => formatDate(String(v))} />
              <Area
                type="monotone"
                dataKey="credit_score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                name="Credit Score"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">Cumulative Credit Score: {totalScore} points</p>
        </div>
      )}

      {/* Recommendations */}
      {score?.recommendations && score.recommendations.length > 0 && (
        <div className="border rounded-lg p-5">
          <h2 className="font-semibold mb-3">Recommendations</h2>
          <ul className="space-y-2">
            {score.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-400">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
