// Top nav shared across all pages.
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { token, logout } = useAuth();
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
      <Link to="/dashboard" className="text-xl font-bold">Blind Eye</Link>
      <div className="flex gap-4">
        {token ? (
          <>
            <Link to="/credit">Credit Score</Link>
            <Link to="/visibility">AI Visibility</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
