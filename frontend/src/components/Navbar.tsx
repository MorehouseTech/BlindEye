// Top nav — shows different links based on role (business vs user).
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { loggedIn, role, name, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!loggedIn) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white text-sm">
        <Link to={role === "business" ? "/dashboard" : "/feed"} className="font-bold text-lg">
          Blind Eye
        </Link>
        <div className="flex items-center gap-4">
          {role === "business" && (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">Home</Link>
              <Link to="/insights" className="hover:text-gray-300">Insights</Link>
              <Link to="/credit" className="hover:text-gray-300">AI Credit Score</Link>
              <Link to="/visibility" className="hover:text-gray-300">Visibility Test</Link>
            </>
          )}
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">{name}</span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:text-gray-300 text-lg"
              title="Settings"
            >
              &#9881;
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white text-gray-800 rounded-lg shadow-lg py-1 w-44 z-50">
                <button
                  onClick={() => { setShowHelp(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Help &amp; Tutorial
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Help overlay for business side */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
            <h3 className="font-bold text-lg mb-4">How to Use BlindEye for Business</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Dashboard</strong> — Your home base. See your AI Credit Score
                at a glance and how each AI chatbot platform represents your brand.
              </p>
              <p>
                <strong>AI Credit Score</strong> — Deep dive into your overall score.
                It reflects engagement, content quality, and AI visibility across platforms.
              </p>
              <p>
                <strong>Visibility Test</strong> — Run real consumer queries against
                ChatGPT, Gemini, and Claude. See if your business gets mentioned,
                how it is positioned, and whether AI is hallucinating about your products.
              </p>
              <p>
                <strong>Insights</strong> — Track your metrics over time. Engagement
                trends, visibility changes, and weekly comparisons.
              </p>
              <p>
                <strong>Recommended Next Steps</strong> — Actionable suggestions on
                how to improve your AI presence based on test results.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
