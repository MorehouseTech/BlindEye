import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserSidebar() {
  const { name, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/feed", label: "Home" },
    { to: "/search", label: "Search" },
    { to: "/blindspot", label: "Blind Spot" },
  ];

  return (
    <aside className="w-48 min-h-screen bg-white border-r flex flex-col py-4 px-3">
      <Link to="/feed" className="font-bold text-lg mb-6 px-2">
        BlindEye
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-3 py-2 rounded text-sm font-medium ${
              location.pathname === link.to
                ? "bg-teal-50 text-teal-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t pt-3 px-2">
        <p className="text-xs text-gray-400 mb-1">{name}</p>
        <button
          onClick={() => { logout(); window.location.href = "/"; }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
