// Business Dashboard — credit gauge hero, AI chatbot visibility, and next steps.
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchCreditScore, type CreditScoreReport } from "../api/creditApi";
import CreditGauge from "../components/CreditGauge";

/* ── Business Onboarding Popup ── */
function BusinessOnboarding({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-2">Welcome to BlindEye for Business</h2>
        <p className="text-gray-500 text-sm mb-5">
          See how AI chatbots represent your brand to consumers
        </p>

        <div className="space-y-4 text-left mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl text-teal-500">&#9679;</span>
            <div>
              <p className="font-semibold text-sm">AI Credit Score</p>
              <p className="text-xs text-gray-500">
                Your overall visibility score across AI platforms, updated weekly
                based on engagement, content quality, and AI representation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl text-teal-500">&#9679;</span>
            <div>
              <p className="font-semibold text-sm">Chatbot Visibility</p>
              <p className="text-xs text-gray-500">
                See how ChatGPT, Gemini, and Claude describe your business —
                including hallucinations, sentiment, and positioning.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl text-teal-500">&#9679;</span>
            <div>
              <p className="font-semibold text-sm">Visibility Test</p>
              <p className="text-xs text-gray-500">
                Run real consumer queries against AI chatbots to see if and how
                your business appears in their responses.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl text-teal-500">&#9679;</span>
            <div>
              <p className="font-semibold text-sm">Insights</p>
              <p className="text-xs text-gray-500">
                Track trends over time — engagement, AI mentions, and how your
                visibility changes week to week.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full bg-teal-500 text-white py-2.5 rounded-lg font-medium hover:bg-teal-600"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

const PLATFORM_SUMMARIES = [
  {
    name: "ChatGPT",
    logo: "G",
    logoColors: "bg-[#10a37f] text-white",
    score: 58,
    summary:
      "Brand mentioned once in the middle of responses. Price reported incorrectly at $160 vs actual $129.99. Neutral sentiment with partial feature accuracy.",
    color: "border-t-[#10a37f]",
  },
  {
    name: "Gemini",
    logo: "G",
    logoColors: "bg-[#4285f4] text-white",
    score: 0,
    summary:
      "Brand was not mentioned in any Gemini responses. Competitors Allbirds and On Running were recommended instead. This is your biggest visibility gap.",
    color: "border-t-[#4285f4]",
  },
  {
    name: "Claude",
    logo: "C",
    logoColors: "bg-[#d97706] text-white",
    score: 91,
    summary:
      "Brand appeared first and was the primary recommendation. Price and features described accurately. Positive trust language used.",
    color: "border-t-[#d97706]",
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchCreditScore()
      .then((res) => setScore(res.creditScoreReport ?? null))
      .catch(() => {});
    const seen = localStorage.getItem("blindeye_biz_onboarded");
    if (!seen) setShowOnboarding(true);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem("blindeye_biz_onboarded", "1");
    setShowOnboarding(false);
  };

  const creditScore = score?.overallCreditScore ?? 0;
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

      {/* Hero: Credit Score Gauge + Visibility Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          to="/credit"
          className="block border rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-teal-600 mb-2">AI Credit Score</h2>
          <div className="flex justify-center">
            <CreditGauge score={creditScore} size={200} />
          </div>
          {trend && (
            <p className="text-center mt-1">
              <span
                className={`text-sm font-medium ${
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.direction === "up" ? "+" : ""}
                {trend.change} pts this week
              </span>
            </p>
          )}
          <p className="text-gray-500 text-xs text-center mt-1">
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
          <p className="text-gray-600 text-sm mb-4">
            Run a visibility test to see how AI chatbots describe and recommend
            your business to consumers.
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Platforms tested: 3</span>
            <span>Last run: Today</span>
          </div>
          <div className="mt-4 text-center">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full">
              View Full Test Results &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* AI Chatbot Visibility Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-semibold text-lg">AI Chatbot Visibility</h2>
          <div className="flex gap-1.5">
            {PLATFORM_SUMMARIES.map((p) => (
              <span
                key={p.name}
                className={`w-6 h-6 rounded-full ${p.logoColors} text-xs flex items-center justify-center font-bold`}
              >
                {p.logo}
              </span>
            ))}
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Simulates how consumers interact with AI chatbots to shop — see how
          visible your business is across ChatGPT, Gemini, and Claude.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLATFORM_SUMMARIES.map((platform) => (
            <div
              key={platform.name}
              className={`border rounded-lg p-4 border-t-4 ${platform.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full ${platform.logoColors} text-xs flex items-center justify-center font-bold`}
                  >
                    {platform.logo}
                  </span>
                  <h3 className="font-semibold">{platform.name}</h3>
                </div>
                <span className="text-2xl font-bold">{platform.score}</span>
              </div>
              <p className="text-sm text-gray-600">{platform.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommend Next Steps */}
      <div className="border rounded-lg p-5 mb-6 bg-gray-50">
        <h2 className="font-semibold text-teal-600 mb-3">
          Recommended Next Steps
        </h2>
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

      {showOnboarding && <BusinessOnboarding onDismiss={dismissOnboarding} />}
    </div>
  );
}
