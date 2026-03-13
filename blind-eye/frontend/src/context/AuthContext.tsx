// Simple auth context for MVP demo. No JWT, just stores role + name.
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
  loggedIn: boolean;
  role: "business" | "user" | null;
  name: string;
}

interface AuthContextType extends AuthState {
  loginAs: (role: "business" | "user", name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("blindeye_auth");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { loggedIn: false, role: null, name: "" };
  });

  const loginAs = (role: "business" | "user", name: string) => {
    const state = { loggedIn: true, role, name };
    localStorage.setItem("blindeye_auth", JSON.stringify(state));
    setAuth(state);
  };

  const logout = () => {
    localStorage.removeItem("blindeye_auth");
    setAuth({ loggedIn: false, role: null, name: "" });
  };

  return (
    <AuthContext.Provider value={{ ...auth, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
