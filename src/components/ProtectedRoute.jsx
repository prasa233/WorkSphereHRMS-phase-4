
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
  const token = sessionStorage.getItem("access_token");
  const role = sessionStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  
sessionStorage.setItem("access_token", response.data.access_token);
sessionStorage.setItem("role", response.data.role);
navigate("/dashboard");
}
return children;