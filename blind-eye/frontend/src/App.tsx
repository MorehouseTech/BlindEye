import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreditScore from "./pages/CreditScore";
import AIVisibilityTest from "./pages/AIVisibilityTest";
import Insights from "./pages/Insights";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F9FBFD]">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/visibility" element={<AIVisibilityTest />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
