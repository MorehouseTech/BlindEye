// Landing / Login page. Two paths: Business or User.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../api/authApi";

export default function Login() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiLogin(username, password);
      if (res.success && res.role && res.name) {
        loginAs(res.role as "business" | "user", res.name);
        navigate(res.role === "business" ? "/dashboard" : "/feed");
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch {
      setError("Could not reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-2">Blind Eye</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Trustworthy AI Product Discovery
        </p>

        <form onSubmit={handleLogin}>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 text-sm"
            placeholder="admin or user"
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 text-sm"
            placeholder="123"
          />

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t text-xs text-gray-400 text-center">
          <p>Business: admin / 123</p>
          <p>User: user / 123</p>
        </div>
      </div>
    </div>
  );
}
