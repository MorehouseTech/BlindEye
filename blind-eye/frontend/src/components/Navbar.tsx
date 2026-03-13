// Top nav — shows different links based on role (business vs user).
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { loggedIn, role, name, logout } = useAuth();
  const navigate = useNavigate();

  if (!loggedIn) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white text-sm">
      <Link to={role === "business" ? "/dashboard" : "/feed"} className="font-bold text-lg">
        Blind Eye
      </Link>
      <div className="flex items-center gap-4">
        {role === "business" && (
          <>
            <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <Link to="/credit" className="hover:text-gray-300">Credit Score</Link>
            <Link to="/visibility" className="hover:text-gray-300">Visibility Test</Link>
          </>
        )}
        {role === "user" && (
          <Link to="/feed" className="hover:text-gray-300">Feed</Link>
        )}
        <span className="text-gray-400">|</span>
        <span className="text-gray-400">{name}</span>
        <button onClick={handleLogout} className="hover:text-gray-300">Logout</button>
      </div>
    </nav>
  );
}
