import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import UserSidebar from "./components/UserSidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreditScore from "./pages/CreditScore";
import AIVisibilityTest from "./pages/AIVisibilityTest";
import Insights from "./pages/Insights";
import SocialFeed from "./pages/SocialFeed";
import SearchPage from "./pages/Search";
import BlindSpot from "./pages/BlindSpot";

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <UserSidebar />
      {children}
    </div>
  );
}

function AppRoutes() {
  const { loggedIn, role } = useAuth();

  if (!loggedIn) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (role === "user") {
    return (
      <UserLayout>
        <Routes>
          <Route path="/feed" element={<SocialFeed />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/blindspot" element={<BlindSpot />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </UserLayout>
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
        <Route path="/insights" element={<Insights />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
