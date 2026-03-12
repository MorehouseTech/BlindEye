
// Feature 3 — Business Credit Score page.
// Calls GET /credit/score to get the current weekly credit score and breakdown.
import { useEffect, useState } from "react";
import "../index.css";
import scoreData from "../data/overall_score";

export default function CreditScore() {
  const scoreExplanation =
    scoreData?.[0]?.Overall_score?.Explanation ?? "No explanation available.";

  const rawScore = Number(scoreData?.[0]?.Overall_score?.Score ?? 0);
  const visibilityScore = Math.max(0, Math.min(100, rawScore));

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimatedScore(visibilityScore);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [visibilityScore]);

  return (
    <section className="flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-gray-400 p-6">
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>AI Credit Score</span>
            <span>{animatedScore}/100</span>
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
        <p className="text-center text-red-700">{visibilityScore}</p>

        <p className="mt-4 text-gray-500">Score Explanation:</p>
        <div className="rounded border border-blue-800 p-2">
          <p className="text-black whitespace-pre-line">{scoreExplanation}</p>
        </div>
      </div>
    </section>
  );
}

/*
export default function CreditScore() {

  const score_explanation = scoreData?.[0]?.Overall_score?.Explanation
  const visibility_score = scoreData?.[0]?.Overall_score?.Score
  return (
    <div className="flex items-center justify-center h-screen">
      
      <div className="border border-gray-400 p-6 rounded-lg">
        <h2 className="text-blue-500"> Credit score is:</h2>
         <p className="text-center text-red-700">{visibility_score}</p>
        <br/>

        <p className="text-gray-500"> Score Explaination:</p>
       
        <div className="border border-blue-800 rounded"> 
          <p className="text-black">{score_explanation}</p>
        </div> 

      </div>
    </div>
  );
}
*/