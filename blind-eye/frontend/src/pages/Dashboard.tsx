// Business Dashboard — summary view with platform cards, credit score, and visibility.
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchCreditScore, type CreditScoreReport } from "../api/creditApi";

const PLATFORM_SUMMARIES = [
  {
    name: "GPT",
    score: 58,
    summary:
      "Brand mentioned once in the middle of responses. Price reported incorrectly at $160 vs actual $129.99. Neutral sentiment with partial feature accuracy.",
    color: "border-t-green-500",
  },
  {
    name: "Gemini",
    score: 0,
    summary:
      "Brand was not mentioned in any Gemini responses. Competitors Allbirds and On Running were recommended instead. This is your biggest visibility gap.",
    color: "border-t-blue-500",
  },
  {
    name: "Claude",
    score: 91,
    summary:
      "Brand appeared first and was the primary recommendation. Price and features described accurately. Positive trust language used.",
    color: "border-t-purple-500",
  },
];

const NEXT_STEPS = [
  {
    type: "Immediate Action",
    typeColor: "text-red-600",
    message: 'Low visibility detected for "sustainable running shoes"',
    action: "Update SEO metadata and add this keyword to product descriptions",
  },
  {
    type: "Optimization Opportunity",
    typeColor: "text-yellow-600",
    message: 'Competitors rank higher for "eco-friendly footwear"',
    action: "Create dedicated landing page content targeting this keyword",
  },
  {
    type: "Visibility Strength",
    typeColor: "text-green-600",
    message: "Your product ranks #1 on Claude for this category",
    action: "Maintain accurate product data to keep this strong positioning",
  },
];

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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {name}</p>
        </div>
        <Link
          to="/visibility"
          className="bg-teal-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-teal-600"
        >
          Generate AI Test
        </Link>
      </div>

      {/* Top Row: Credit Score + Visibility Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          to="/credit"
          className="block border rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-teal-600 mb-3">Shopping Score</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-bold">{creditScore}</span>
            <span className="text-gray-400 text-lg">/100</span>
            {trend && (
              <span
                className={`text-sm ml-2 ${
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.direction === "up" ? "+" : ""}
                {trend.change} pts
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Weekly score based on engagement, AI visibility, and content quality.
          </p>
        </Link>

        <Link
          to="/visibility"
          className="block border rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-teal-600 mb-3">
            AI Visibility Analytics
          </h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-bold">71</span>
            <span className="text-gray-400 text-lg">/100</span>
          </div>
          <p className="text-gray-500 text-sm">
            Overall visibility across GPT, Claude, and Gemini platforms.
          </p>
        </Link>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PLATFORM_SUMMARIES.map((platform) => (
          <div
            key={platform.name}
            className={`border rounded-lg p-4 border-t-4 ${platform.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{platform.name}</h3>
              <span className="text-2xl font-bold">{platform.score}</span>
            </div>
            <p className="text-sm text-gray-600">{platform.summary}</p>
          </div>
        ))}
      </div>

      {/* Recommend Next Steps */}
      <div className="border rounded-lg p-5 mb-6 bg-gray-50">
        <h2 className="font-semibold text-teal-600 mb-3">Recommend Next Steps</h2>
        <div className="space-y-3">
          {NEXT_STEPS.map((step, i) => (
            <div key={i} className="text-sm">
              <p>
                <span className={`font-medium ${step.typeColor}`}>
                  {step.type}
                </span>{" "}
                <span className="text-gray-700">{step.message}</span>
              </p>
              <p className="text-gray-500 ml-2">
                <strong>Suggested Action:</strong> {step.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Score Breakdown */}
      {score?.scoreBreakdown && (
        <div className="border rounded-lg p-5">
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
                      className="bg-teal-500 h-2 rounded-full"
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
    </div>
  );
}
