// Register page — not used in MVP demo, redirects to login.
import { Navigate } from "react-router-dom";

export default function Register() {
  return <Navigate to="/" replace />;
}
