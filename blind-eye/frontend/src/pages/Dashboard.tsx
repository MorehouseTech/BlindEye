// Business Dashboard — summary view linking to Credit Score and Visibility Test.
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchCreditScore, type CreditScoreReport } from "../api/creditApi";

export default function Dashboard() {
  const { name } = useAuth();
  const [score, setScore] = useState<CreditScoreReport | null>(null);

  useEffect(() => {
    fetchCreditScore()
      .then((res) => setScore(res.creditScoreReport ?? null))
      .catch(() => {});
  }, []);

  const creditScore = score?.overallCreditScore ?? "--";
  const trend = score?.trend;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Welcome, {name}</h1>
      <p className="text-gray-500 text-sm mb-6">Business Analytics Dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit Score Card */}
        <Link
          to="/credit"
          className="block border rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-lg mb-2">AI Credit Score</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold">{creditScore}</span>
            <span className="text-gray-400 text-sm">/100</span>
            {trend && (
              <span className={`text-sm ml-2 ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend.direction === "up" ? "+" : ""}{trend.change} pts
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Weekly score based on engagement, AI visibility, and content quality.
          </p>
          <p className="text-blue-600 text-sm mt-2">View details &rarr;</p>
        </Link>

        {/* Visibility Test Card */}
        <Link
          to="/visibility"
          className="block border rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-lg mb-2">AI Visibility Test</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold">71</span>
            <span className="text-gray-400 text-sm">/100</span>
          </div>
          <p className="text-gray-500 text-sm">
            Test how ChatGPT, Claude, and Gemini recommend your products.
          </p>
          <p className="text-blue-600 text-sm mt-2">Run a test &rarr;</p>
        </Link>
      </div>

      {/* Score Breakdown */}
      {score?.scoreBreakdown && (
        <div className="mt-6 border rounded-lg p-5">
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

      {/* Recommendations */}
      {score?.recommendations && score.recommendations.length > 0 && (
        <div className="mt-6 border rounded-lg p-5">
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
