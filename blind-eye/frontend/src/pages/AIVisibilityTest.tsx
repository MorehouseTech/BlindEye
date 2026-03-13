// Feature 4 — AI Visibility Test page.
// Select a product, run a test, see per-platform results.
import { useEffect, useState } from "react";
import {
  fetchProducts,
  runVisibilityTest,
  type Product,
  type VisibilityResult,
  type PlatformResult,
} from "../api/visibilityApi";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  let color = "bg-red-500";
  if (pct >= 70) color = "bg-green-500";
  else if (pct >= 40) color = "bg-yellow-500";

  return (
    <div className="text-sm mb-1">
      <div className="flex justify-between text-gray-600">
        <span>{label}</span>
        <span>{pct}</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PlatformCard({ name, data }: { name: string; data: PlatformResult }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        <span className="text-2xl font-bold">{data.score}/100</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{data.explanation}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <ScoreBar label="Feature Accuracy" value={Math.round(data.featureAccuracyScore * 100)} />
        <ScoreBar label="Share of Voice" value={Math.round(data.shareOfVoice * 100)} />
        <ScoreBar label="Category Relevance" value={Math.round(data.categoryRelevanceScore * 100)} />
        <ScoreBar label="Description Match" value={Math.round(data.descriptionMatchScore * 100)} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <span className={`px-2 py-1 rounded ${data.mentionRate ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {data.mentionRate ? "Mentioned" : "Not Mentioned"}
        </span>
        <span className={`px-2 py-1 rounded ${data.brandSentiment === "positive" ? "bg-green-100 text-green-700" : data.brandSentiment === "neutral" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
          Sentiment: {data.brandSentiment}
        </span>
        <span className={`px-2 py-1 rounded ${data.priceAccuracy === "correct" ? "bg-green-100 text-green-700" : data.priceAccuracy === "not_mentioned" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"}`}>
          Price: {data.priceAccuracy}
        </span>
      </div>

      {data.hallucinationFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
          <p className="text-sm font-medium text-red-700 mb-1">Hallucinations Detected:</p>
          {data.hallucinationFlags.map((flag, i) => (
            <p key={i} className="text-xs text-red-600">
              {flag.field}: AI said "{flag.aiSaid}" — actual: "{flag.actual}" ({flag.severity})
            </p>
          ))}
        </div>
      )}

      {data.rawOutput && (
        <details className="text-xs">
          <summary className="cursor-pointer text-blue-600">View raw AI response</summary>
          <div className="mt-2 bg-gray-50 p-2 rounded">
            <p className="font-medium">Query: {data.rawOutput.query}</p>
            <p className="font-medium">Model: {data.rawOutput.model}</p>
            <p className="font-medium">Latency: {data.rawOutput.latencyMs}ms</p>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{data.rawOutput.response}</p>
          </div>
        </details>
      )}
    </div>
  );
}

export default function AIVisibilityTest() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [result, setResult] = useState<VisibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load products"));
  }, []);

  const handleRun = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await runVisibilityTest(Number(selectedProduct));
      setResult(res);
    } catch {
      setError("Failed to run visibility test");
    } finally {
      setLoading(false);
    }
  };

  // Parse result data
  const overallScore = result?.data?.[0] as { overallScore: { msScore: number; msExplanation: string } } | undefined;
  const platformEntries: Array<[string, PlatformResult]> = [];
  if (result?.data) {
    for (let i = 1; i < result.data.length; i++) {
      const entry = result.data[i] as Record<string, PlatformResult>;
      const key = Object.keys(entry)[0];
      if (key) platformEntries.push([key, entry[key]]);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">AI Visibility Test</h1>
      <p className="text-gray-500 text-sm mb-6">
        See how ChatGPT, Claude, and Gemini recommend your products.
      </p>

      {/* Product Selector */}
      <div className="flex gap-3 mb-6">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : "")}
          className="flex-1 border rounded px-3 py-2 text-sm"
        >
          <option value="">Select a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.category} (${p.price})
            </option>
          ))}
        </select>
        <button
          onClick={handleRun}
          disabled={!selectedProduct || loading}
          className="bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run Test"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Overall Score */}
      {overallScore && (
        <div className="border rounded-lg p-5 mb-6 bg-gray-50">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl font-bold">{overallScore.overallScore.msScore}</span>
            <span className="text-gray-400 text-xl">/100</span>
          </div>
          <p className="text-sm text-gray-700">{overallScore.overallScore.msExplanation}</p>
        </div>
      )}

      {/* Per-Platform Results */}
      {platformEntries.map(([name, data]) => (
        <PlatformCard key={name} name={name} data={data} />
      ))}
    </div>
  );
}
