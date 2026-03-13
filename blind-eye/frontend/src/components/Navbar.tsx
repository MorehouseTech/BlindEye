import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/BlindEye FINAL Logo.png";

export default function Navbar() {
  const location = useLocation();

  const tabs = [
    { label: "Home", to: "/dashboard" },
    { label: "Insights", to: "/insights" },
    { label: "User Metrics", to: "/credit" },
  ];

  const foundIndex = tabs.findIndex((tab) =>
    location.pathname.startsWith(tab.to),
  );
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;

  return (
    <header className="w-full px-16 pt-8 pb-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="BlindEye Logo"
          className="h-14 w-auto object-contain"
        />
      </div>

      <div className="flex items-center gap-8 text-sm font-medium text-[#4B5563]">
        {/* Main tabs with sliding highlight */}
        <nav className="relative flex items-center gap-10">
          <div
            className="absolute inset-y-0 -z-10 flex items-center transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${activeIndex * 120}px)`,
            }}
          >
            <div className="h-8 w-24 rounded-full bg-[#7EEAD4] shadow-sm" />
          </div>

          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `relative px-4 py-1.5 transition-colors duration-200 ${
                  isActive ? "text-[#03776B]" : "hover:text-gray-900"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Login shortcut (always available) */}
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `px-2 py-1 transition-colors duration-200 ${
              isActive ? "text-[#00B8A3]" : "text-[#00B8A3] hover:text-[#03776B]"
            }`
          }
        >
          Login
        </NavLink>
      </div>
    </header>
  );
}
