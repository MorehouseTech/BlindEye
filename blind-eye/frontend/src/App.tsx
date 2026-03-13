import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreditScore from "./pages/CreditScore";
import AIVisibilityTest from "./pages/AIVisibilityTest";
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

  return (
    <>
      <Navbar />
      <Routes>
        {/* Business routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credit" element={<CreditScore />} />
        <Route path="/visibility" element={<AIVisibilityTest />} />

        {/* User routes */}
        <Route path="/feed" element={<SocialFeed />} />

        {/* Default redirect based on role */}
        <Route
          path="*"
          element={<Navigate to={role === "business" ? "/dashboard" : "/feed"} replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
