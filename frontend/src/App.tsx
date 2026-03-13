import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreditScore from "./pages/CreditScore";
import AIVisibilityTest from "./pages/AIVisibilityTest";
import Insights from "./pages/Insights";
import SocialFeed from "./pages/SocialFeed";

function AppRoutes() {
  const { loggedIn, role } = useAuth();

  if (!loggedIn) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // User: full-screen TikTok-style feed (search & blind spot are overlays)
  if (role === "user") {
    return (
      <div className="h-screen flex flex-col">
        <Routes>
          <Route path="/feed" element={<SocialFeed />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </div>
    );
  }

  // Business: top navbar + pages
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credit" element={<CreditScore />} />
        <Route path="/visibility" element={<AIVisibilityTest />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
