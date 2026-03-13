// Feature 4 — AI Visibility Test page.
// Business-focused: test how visible your business is for real consumer queries.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchSuggestedQueries,
  runVisibilityTest,
  type SuggestedQuery,
  type VisibilityResult,
  type PlatformResult,
} from "../api/visibilityApi";
import CreditGauge from "../components/CreditGauge";

const PLATFORM_COLORS: Record<string, { bg: string; border: string; logo: string }> = {
  ChatGPT: { bg: "bg-[#10a37f]/10", border: "border-t-[#10a37f]", logo: "/logos/GPTLogo.png" },
  Claude: { bg: "bg-[#d97706]/10", border: "border-t-[#d97706]", logo: "/logos/ClaudeLogo.png" },
  Gemini: { bg: "bg-[#4285f4]/10", border: "border-t-[#4285f4]", logo: "/logos/GeminiLogo.png" },
};

function PlatformCard({
  name,
  data,
}: {
  name: string;
  data: PlatformResult;
}) {
  const colors = PLATFORM_COLORS[name] ?? {
    bg: "bg-gray-50",
    border: "border-t-gray-400",
  };

  return (
    <div className={`border rounded-lg p-4 border-t-4 ${colors.border}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <img src={colors.logo} alt={name} className="w-7 h-7 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <h3 className="font-semibold text-lg">{name}</h3>
        </div>
        <span className="text-2xl font-bold">{data.score}/100</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{data.explanation}</p>

      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <span
          className={`px-2 py-1 rounded ${data.mentioned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {data.mentioned ? "Mentioned" : "Not Mentioned"}
        </span>
        {data.mentionPosition && (
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">
            Position: {data.mentionPosition}
          </span>
        )}
        <span
          className={`px-2 py-1 rounded ${data.sentiment === "positive" ? "bg-green-100 text-green-700" : data.sentiment === "neutral" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}
        >
          Sentiment: {data.sentiment}
        </span>
        <span
          className={`px-2 py-1 rounded ${data.priceAccuracy === "correct" ? "bg-green-100 text-green-700" : data.priceAccuracy === "not_mentioned" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"}`}
        >
          Price: {data.priceAccuracy.replace("_", " ")}
        </span>
      </div>

      {data.hallucinationFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
          <p className="text-sm font-medium text-red-700 mb-1">
            Hallucinations Detected:
          </p>
          {data.hallucinationFlags.map((flag, i) => (
            <p key={i} className="text-xs text-red-600">
              {flag.field}: AI said &ldquo;{flag.aiSaid}&rdquo; — actual: &ldquo;
              {flag.actual}&rdquo; ({flag.severity})
            </p>
          ))}
        </div>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-blue-600">
          View raw AI response
        </summary>
        <div className="mt-2 bg-gray-50 p-2 rounded">
          <p className="font-medium">Model: {data.model}</p>
          <p className="font-medium">Latency: {data.latencyMs}ms</p>
          <p className="mt-1 text-gray-600 whitespace-pre-wrap">
            {data.rawResponse}
          </p>
        </div>
      </details>
    </div>
  );
}

export default function AIVisibilityTest() {
  const [queries, setQueries] = useState<SuggestedQuery[]>([]);
  const [customQuery, setCustomQuery] = useState("");
  const [result, setResult] = useState<VisibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSuggestedQueries()
      .then(setQueries)
      .catch(() => setError("Failed to load suggested queries"));
  }, []);

  const handleRun = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await runVisibilityTest(query.trim());
      setResult(res);
    } catch {
      setError("Failed to run visibility test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/dashboard" className="text-sm text-teal-600 hover:text-teal-800 mb-3 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-2xl font-bold mb-1">AI Visibility Test</h1>
      <p className="text-gray-500 text-sm mb-6">
        Test how visible your business is when consumers ask AI chatbots
        real shopping questions. Queries below are sourced from actual user
        searches on BlindEye.
      </p>

      {/* Custom query input */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun(customQuery)}
          placeholder="Type a custom query, e.g. 'Best taco shops in Austin'"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={() => handleRun(customQuery)}
          disabled={!customQuery.trim() || loading}
          className="bg-teal-500 text-white px-6 py-2 rounded text-sm font-medium hover:bg-teal-600 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run Test"}
        </button>
      </div>

      {/* Suggested queries */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-2">
          Popular consumer searches (click to test):
        </p>
        <div className="flex flex-wrap gap-2">
          {queries.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setCustomQuery(q.query);
                handleRun(q.query);
              }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-teal-50 hover:border-teal-400 disabled:opacity-50"
            >
              {q.query}
              <span className="ml-1 text-gray-400">
                ({q.searchVolume.toLocaleString()})
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <p className="text-red-400 text-xs mt-1">
            The test will automatically use fallback data if the API is unavailable.
          </p>
        </div>
      )}

      {/* Loading skeleton for visibility test */}
      {loading && (
        <div className="space-y-4 mb-6">
          <div className="border rounded-lg p-5 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-[180px] h-[100px] bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 border-t-4 border-t-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Overall Score */}
          <div className="border rounded-lg p-5 mb-6 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <CreditGauge score={result.overallScore} size={180} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  Query: &ldquo;{result.query}&rdquo;
                </p>
                <p className="text-sm text-gray-700">
                  {result.overallExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Per-Platform Results */}
          <div className="space-y-4">
            {Object.entries(result.platforms).map(([name, data]) => (
              <PlatformCard key={name} name={name} data={data} />
            ))}
          </div>

          {/* Test Transparency — exact queries used */}
          <div className="mt-6 border rounded-lg p-5 bg-blue-50/50">
            <h3 className="font-semibold text-sm mb-1 text-blue-900">
              Test Transparency
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              Below are the exact prompts sent to each AI platform for this
              visibility test. BlindEye is fully transparent about how we test.
            </p>
            {Object.entries(result.platforms).map(([platformName, data]) => (
              <details key={platformName} className="text-xs mb-2">
                <summary className="cursor-pointer text-blue-600 font-medium">
                  {platformName} ({data.model}) — exact query
                </summary>
                <div className="mt-1 bg-white border rounded p-3 text-gray-700">
                  <p className="font-medium text-gray-500 mb-1">Prompt sent:</p>
                  <p className="whitespace-pre-wrap font-mono text-xs">
                    {`User query: "${result.query}"\n\nPlease recommend products or businesses that match this query. Include brand names, pricing, and key features. Be specific about why you recommend each option.`}
                  </p>
                  <p className="font-medium text-gray-500 mt-2 mb-1">
                    Model: {data.model} | Latency: {data.latencyMs}ms
                  </p>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
