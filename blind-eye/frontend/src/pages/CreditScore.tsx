// Feature 3 — Business Credit Score page.
// Combines the animated score bar (from feature/credit-score)
// and the credit score graph (from feature/credit-graph).
import { useEffect, useState } from "react";
import "../index.css";
import defaultScoreData, {
  getOverallScoreData,
  type ScoreData,
} from "../data/overall_score";
import CreditScoreGraph from "../components/CreditScoreGraph";

function toExplanationBullets(explanation: string): string[] {
  const trimmed = explanation.trim();
  if (!trimmed) {
    return [];
  }

  const lineParts = trimmed
    .split("\n")
    .map((line) => line.replace(/^[-*\u2022\d.)\s]+/, "").trim())
    .filter((line) => line.length > 0);

  return lineParts.length > 0 ? lineParts : [trimmed];
}

export default function CreditScore() {
  const [scoreData, setScoreData] = useState<ScoreData>(defaultScoreData);
  const [isLoadingScore, setIsLoadingScore] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadScore = async () => {
      if (mounted) {
        setIsLoadingScore(true);
      }

      const nextScoreData = await getOverallScoreData();
      if (!mounted) return;

      setScoreData(nextScoreData);
      setIsLoadingScore(false);
    };

    void loadScore();

    return () => {
      mounted = false;
    };
  }, []);

  const generatedExplanation = scoreData.explanation;
  const scoreExplanation =
    isLoadingScore
      ? "Generating explanation..."
      : generatedExplanation?.trim() || "No explanation available.";
  const explanationBullets = toExplanationBullets(scoreExplanation);

  const rawScore = Number(scoreData.score ?? 0);
  const visibilityScore = Math.max(0, Math.min(100, rawScore));

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimatedScore(visibilityScore);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [visibilityScore]);

  return (
    <div className="p-8">
      {/* Animated score bar */}
      <section className="flex items-center justify-center mb-8">
        <div className="w-full max-w-3xl rounded-lg border border-gray-400 p-6">
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>AI Credit Score</span>
              <span>{isLoadingScore ? "Loading..." : `${animatedScore}/100`}</span>
            </div>

            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${animatedScore}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              <span>Poor</span>
              <span>Fair</span>
              <span>Great</span>
            </div>
          </div>

          <h2 className="text-blue-500">Credit score is:</h2>
          <p className="text-center text-red-700">
            {isLoadingScore ? "Loading..." : `${rawScore}`}
          </p>

          <p className="mt-4 text-gray-500">Score Explanation:</p>
          <div className="rounded border border-blue-800 p-2">
            {isLoadingScore ? (
              <p className="text-black">{scoreExplanation}</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-black">
                {explanationBullets.map((bullet, index) => (
                  <li key={`${bullet}-${index}`}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Credit score graph over time */}
      <CreditScoreGraph />
    </div>
  );
}
