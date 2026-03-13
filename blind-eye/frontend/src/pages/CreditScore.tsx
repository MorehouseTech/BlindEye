import CreditScoreGraph from "../components/CreditScoreGraph";

// Feature 3 — Business Credit Score page.
// Calls GET /credit/score to get the current weekly credit score and breakdown.
export default function CreditScore() {
  return (
    <div className="p-8">
      <CreditScoreGraph />
    </div>
  );
}
